import express from 'express';
import path from 'path';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, schema } from './src/db/index.ts';
import { eq, like, and, or, sql } from 'drizzle-orm';
import { spots, deals, menuItems, users } from './src/db/schema.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserProfile, updateUserRole } from './src/db/users.ts';
import { seedDatabase } from './src/db/seed.ts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Run seed data on startup
async function initTablesAndSeed() {
  try {
    // 1. Create table reviews if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        spot_id INTEGER NOT NULL,
        reviewer_name TEXT NOT NULL,
        reviewer_email TEXT,
        reviewer_uid TEXT,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Reviews database table verified / created successfully.");
  } catch (err) {
    console.error("Failed to verify / create reviews table on startup:", err);
  }

  try {
    await seedDatabase();
  } catch (err) {
    console.error("Failed to seed database on startup:", err);
  }
}

initTablesAndSeed();

// Helper: Extra sheet ID from google sheets URL
function extractSheetId(url: string): string | null {
  const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return matches ? matches[1] : null;
}

// 1. API: Synchronization from Google Sheets
// Let anyone trigger or restrict to verified admin. Let's make it easy to trigger in UI.
app.post('/api/sync-sheet', async (req, res) => {
  const { sheetUrl } = req.body;
  if (!sheetUrl) {
    return res.status(400).json({ error: "Google Sheet URL or ID is required" });
  }

  const sheetId = extractSheetId(sheetUrl) || sheetUrl;
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv&gid=0`;

  try {
    console.log(`Fetching CSV from: ${csvUrl}`);
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.statusText}. Please verify the Google Sheet is 'Published to the web' as CSV.`);
    }

    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => {
      // Split by comma but respect quotes
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    });

    // Expecting columns:
    // Spot Name, Description, Category, Address, Lat, Lng, Wifi (true/false), Study (true/false), Price Range, Item Name, Item Price, Item Image
    if (rows.length <= 1) {
      return res.status(400).json({ error: "Google Sheet does not contain enough rows or is empty." });
    }

    // Skip header row
    const headers = rows[0].map(h => h.toLowerCase());
    const entries = rows.slice(1).filter(r => r.length > 0 && r[0]);

    console.log(`Parsed ${entries.length} items from sheets. Performing Sync.`);

    // Perform transaction to prevent half-baked sync
    await db.transaction(async (tx) => {
      // For sheet sync, let's keep previous spots but avoid duplicates, or replace.
      // Replacing or updating has been proven very safe. Let's insert spots by name.
      for (const entry of entries) {
        const spotName = entry[0];
        const spotDesc = entry[1];
        const cat = entry[2] || 'food';
        const address = entry[3] || 'Quanh trường';
        const lat = parseFloat(entry[4]) || 10.8415;
        const lng = parseFloat(entry[5]) || 106.8282;
        const wifi = (entry[6] || '').toLowerCase().startsWith('y') || (entry[6] || '').toLowerCase() === 'true';
        const studySpot = (entry[7] || '').toLowerCase().startsWith('y') || (entry[7] || '').toLowerCase() === 'true';
        const priceRange = entry[8] || '20k-50k';
        const itemName = entry[9];
        const itemPrice = parseInt(entry[10], 10) || 0;
        let itemImage = entry[11] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

        // Tự động bóc tách ID và chuyển đổi link Google Drive sang Direct Link
        if (itemImage.includes('drive.google.com/file/d/')) {
          const match = itemImage.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (match && match[1]) {
            itemImage = `https://drive.google.com/uc?export=view&id=${match[1]}`;
          }
        }

        if (!spotName) continue;

        // Check if spot exists
        let spotId: number;
        const existing = await tx.select().from(spots).where(eq(spots.name, spotName)).limit(1);
        if (existing.length > 0) {
          spotId = existing[0].id;
          // Update spot attributes
          await tx.update(spots)
            .set({
              description: spotDesc,
              category: cat,
              address,
              lat,
              lng,
              wifi,
              studySpot,
              priceRange
            })
            .where(eq(spots.id, spotId));
        } else {
          const newSpot = await tx.insert(spots).values({
            name: spotName,
            description: spotDesc,
            category: cat,
            address,
            lat,
            lng,
            wifi,
            studySpot,
            priceRange
          }).returning();
          spotId = newSpot[0].id;
        }

        // If item details exist, insert/update items
        if (itemName) {
          // Check if item exists under spot
          const existItem = await tx.select().from(menuItems)
            .where(and(eq(menuItems.spotId, spotId), eq(menuItems.name, itemName))).limit(1);
          
          if (existItem.length > 0) {
            await tx.update(menuItems).set({
              price: itemPrice,
              image: itemImage
            }).where(eq(menuItems.id, existItem[0].id));
          } else {
            await tx.insert(menuItems).values({
              spotId,
              name: itemName,
              price: itemPrice,
              image: itemImage,
              isPopular: false
            });
          }
        }
      }
    });

    res.json({ message: "Sync from Google Sheet completed!", count: entries.length });
  } catch (error: any) {
    console.error("Failed to sync sheet:", error);
    res.status(500).json({ error: error.message || "Unknown error during sync" });
  }
});

// 2. API: View/Get Spots (with deals, items and reviews loaded)
app.get('/api/spots', async (req, res) => {
  try {
    const allSpots = await db.select().from(spots);
    const result = [];

    // Bundle deals, menu items, and reviews for each spot
    for (const spot of allSpots) {
      const spotDeals = await db.select().from(deals).where(eq(deals.spotId, spot.id));
      const spotItems = await db.select().from(menuItems).where(eq(menuItems.spotId, spot.id));
      
      // Get reviews
      let spotReviews: any[] = [];
      try {
        const resReviews = await db.execute(sql`
          SELECT id, spot_id as "spotId", reviewer_name as "reviewerName", 
                 reviewer_email as "reviewerEmail", reviewer_uid as "reviewerUid", 
                 rating, comment, created_at as "createdAt" 
          FROM reviews 
          WHERE spot_id = ${spot.id} 
          ORDER BY created_at DESC
        `);
        spotReviews = resReviews.rows || [];
      } catch (err) {
        console.error("Failed to fetch reviews for spot:", spot.id, err);
      }

      result.push({
        ...spot,
        deals: spotDeals,
        menuItems: spotItems,
        reviews: spotReviews
      });
    }

    res.json(result);
  } catch (error: any) {
    console.error("Get spots failed:", error);
    res.status(500).json({ error: "Failed to fetch spots from database" });
  }
});

// 2b. API: Submit a review and star rating for a spot
app.post('/api/spots/:spotId/reviews', async (req, res) => {
  try {
    const spotId = parseInt(req.params.spotId, 10);
    const { reviewerName, reviewerEmail, reviewerUid, rating, comment } = req.body;
    
    if (!reviewerName || !rating || !comment) {
      return res.status(400).json({ error: "Tên, Số sao đánh giá (1-5) và Nội dung bình luận là bắt buộc." });
    }

    const starRating = Math.max(1, Math.min(5, parseInt(rating, 10)));

    const result = await db.execute(sql`
      INSERT INTO reviews (spot_id, reviewer_name, reviewer_email, reviewer_uid, rating, comment)
      VALUES (${spotId}, ${reviewerName}, ${reviewerEmail || null}, ${reviewerUid || null}, ${starRating}, ${comment})
      RETURNING id, spot_id as "spotId", reviewer_name as "reviewerName", 
                reviewer_email as "reviewerEmail", reviewer_uid as "reviewerUid", 
                rating, comment, created_at as "createdAt"
    `);

    const newReview = result.rows && result.rows[0] ? result.rows[0] : null;

    res.json({ message: "Gửi đánh giá thành công!", review: newReview });
  } catch (error: any) {
    console.error("Add review failed:", error);
    res.status(500).json({ error: "Không thể lưu đánh giá của bạn." });
  }
});

// 3. API: Get Deals
app.get('/api/deals', async (req, res) => {
  try {
    const allDeals = await db.select().from(deals);
    const result = [];
    for (const d of allDeals) {
      const s = await db.select().from(spots).where(eq(spots.id, d.spotId)).limit(1);
      result.push({
        ...d,
        spot: s[0] || null
      });
    }
    res.json(result);
  } catch (error: any) {
    console.error("Get deals failed:", error);
    res.status(500).json({ error: "Failed to fetch deals" });
  }
});

// 4. API: Sync User and Profile (Secure API)
app.post('/api/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userPayload = req.user;
    if (!userPayload) {
      return res.status(401).json({ error: "Missing authentication payload" });
    }

    const { email, uid, name } = userPayload;
    if (!email || !uid) {
      return res.status(400).json({ error: "Invalid auth payload" });
    }

    const userProfile = await getOrCreateUser(uid, email, name || req.body.displayName);
    res.json(userProfile);
  } catch (error: any) {
    console.error("Sync user failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 5. API: Get User Profile
app.get('/api/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const profile = await getUserProfile(uid);
    res.json(profile);
  } catch (error: any) {
    console.error("Get profile failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 6. API: Secure Admin Promotion via Username/Password Checked Server-Side
app.post('/api/profile/promote-admin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ tài khoản và mật khẩu." });
    }

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'fptadmin2026';

    if (username === expectedUsername && password === expectedPassword) {
      const updated = await updateUserRole(uid, 'admin');
      return res.json({ success: true, profile: updated });
    } else {
      return res.status(401).json({ error: "Sai tài khoản hoặc mật khẩu Admin!" });
    }
  } catch (error: any) {
    console.error("Promote admin failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7. API: Secure Admin Demotion
app.post('/api/profile/demote-admin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updated = await updateUserRole(uid, 'student');
    res.json({ success: true, profile: updated });
  } catch (error: any) {
    console.error("Demote admin failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 7. API: Add a new Spot (Restricted to Admin - for safety we check role in DB)
// 7. API: Add a new Spot (Restricted to Admin - for safety we check role in DB)
app.post('/api/spots', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const profile = await getUserProfile(uid);
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const { name, description, category, address, school, wifi, studySpot, priceRange } = req.body;
    let { lat, lng } = req.body; // Đổi const thành let để có thể tự động gán tọa độ

    if (!name || !category || !address) {
      return res.status(400).json({ error: "Missing required fields (name, category, address)" });
    }

    // --- BỘ LỌC TỰ ĐỘNG CHUYỂN ĐỊA CHỈ THÀNH TỌA ĐỘ ---
    // Nếu Frontend không gửi tọa độ lên, Backend sẽ tự đi tìm!
    if (!lat || !lng) {
      try {
        // Gọi API miễn phí của OpenStreetMap để dò tọa độ
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
          headers: { 'User-Agent': 'CocFoodMap/1.0' } // Bắt buộc phải có User-Agent để API không block
        });
        const geoData = await geoRes.json();
        
        if (geoData && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon); // OpenStreetMap dùng 'lon' thay vì 'lng'
        } else {
          // Tọa độ dự phòng nếu API tìm không ra (Cắm tạm ở cơ sở Ngũ Hành Sơn)
          lat = 15.9688;
          lng = 108.2618;
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
        lat = 15.9688;
        lng = 108.2618;
      }
    }
    // --------------------------------------------------

    const newSpot = await db.insert(spots).values({
      name,
      description,
      category,
      address,
      school: school || "FPT University",
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      wifi: !!wifi,
      studySpot: !!studySpot,
      priceRange: priceRange || "20k-50k"
    }).returning();

    res.json({ message: "Spot added successfully", spot: newSpot[0] });
  } catch (error: any) {
    console.error("Add spot failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 8. API: Delete Spot
// 8. API: Delete Spot
app.delete('/api/spots/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const profile = await getUserProfile(uid);
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const spotId = parseInt(req.params.id, 10);

    // --- BẮT ĐẦU FIX: Dọn sạch "đồ đạc" trước khi xóa "nhà" ---
    // Xóa các món ăn thuộc về quán này
    await db.delete(menuItems).where(eq(menuItems.spotId, spotId));
    // Xóa các deal khuyến mãi thuộc về quán này
    await db.delete(deals).where(eq(deals.spotId, spotId));
    // Xóa các bình luận đánh giá thuộc về quán này (Dùng lệnh SQL thô vì reviews ko nằm trong schema)
    await db.execute(sql`DELETE FROM reviews WHERE spot_id = ${spotId}`);
    // -----------------------------------------------------------

    // Khi đã dọn sạch, tiến hành xóa Quán
    await db.delete(spots).where(eq(spots.id, spotId));

    res.json({ message: "Spot and related details deleted successfully" });
  } catch (error: any) {
    console.error("Delete spot failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 9. API: Add a menu item to spot
// 9. API: Add a menu item to spot
app.post('/api/spots/:spotId/menu-items', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const profile = await getUserProfile(uid);
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const spotId = parseInt(req.params.spotId, 10);
    // Đổi const thành let để có thể sửa lại link ảnh
    let { name, price, image, isPopular } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Item name and price are required" });
    }

    // --- BỘ LỌC TỰ ĐỘNG ĐỔI LINK ẢNH GOOGLE DRIVE TỪ FORM ---
    if (image && image.includes('drive.google.com/file/d/')) {
      const match = image.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        // Dùng API thumbnail để né 100% lỗi CORS của Google
        image = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
      }
    }
    // ---------------------------------------------------------

    const newItem = await db.insert(menuItems).values({
      spotId,
      name,
      price: parseInt(price, 10),
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
      isPopular: !!isPopular
    }).returning();

    res.json({ message: "Menu item added!", item: newItem[0] });
  } catch (error: any) {
    console.error("Add menu item failed:", error);
    res.status(500).json({ error: error.message });
  }
});

// 10. API: Add Deal
app.post('/api/spots/:spotId/deals', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Unauthorized" });

    const profile = await getUserProfile(uid);
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: Admin privileges required" });
    }

    const spotId = parseInt(req.params.spotId, 10);
    const { title, description, discountCode, expiryDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Deal title is required" });
    }

    const newDeal = await db.insert(deals).values({
      spotId,
      title,
      description,
      discountCode,
      expiryDate: expiryDate || "2026-12-31"
    }).returning();

    res.json({ message: "Deal added!", deal: newDeal[0] });
  } catch (error: any) {
    console.error("Add deal failed:", error);
    res.status(500).json({ error: error.message });
  }
});


// 11. Core Budget Splitting API & price comparison with AI suggestion
// Uses Gemini SDK server-side (using process.env.GEMINI_API_KEY)
app.post('/api/ai-budget-plan', async (req, res) => {
  const { totalBudget, days, peopleCount, favoriteCategory, university } = req.body;
  if (!totalBudget || !days) {
    return res.status(400).json({ error: "totalBudget and days are required" });
  }

  try {
    const places = await db.select().from(spots);
    const spotSummaries = places.map(p => `- ${p.name} (${p.category}): Khoảng giá ${p.priceRange} tại ${p.address}`).join('\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return a non-crasher fallback advice if API key is not configured yet
      const fallbackPlan = `Sinh viên tiêu dùng thông minh! Hãy chia budget ${Number(totalBudget).toLocaleString('vi-VN')}đ của bạn thành các phần sau:
- Ăn uống mỗi ngày: ${Math.round((totalBudget * 0.6) / days).toLocaleString('vi-VN')}đ/ngày (Cơm Tấm Bụi, Bún Bò Huế)
- Cà phê/nước giải khát: ${Math.round((totalBudget * 0.25) / days).toLocaleString('vi-VN')}đ/ngày (Trà chanh Đô Đô)
- Quỹ khẩn cấp & Sách vở: ${Math.round(totalBudget * 0.15).toLocaleString('vi-VN')}đ.
(Lưu ý: Bạn cần cấu hình GEMINI_API_KEY để có trợ lý AI thông minh lên lịch trình chi tiết!)`;
      return res.json({ response: fallbackPlan });
    }

    // Lazy load or import @google/genai as instructed:
    // import { GoogleGenAI } from "@google/genai";
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Bạn là một trợ lý ảo tư vấn tài chính siêu ngầu dành cho sinh viên Việt Nam của ứng dụng "Cóc Food Map".
Thông tin người dùng nhập:
- Ngân sách tổng (VND): ${totalBudget}đ cho ${days} ngày.
- Số người tham gia chia: ${peopleCount || 1} người.
- Hạng mục ưu tiên: ${favoriteCategory || "Bất kỳ"}
- Khu vực trường đại học: ${university || "FPT University"}

Danh sách quán có sẵn trong ứng dụng của chúng tôi để bạn gợi ý:
${spotSummaries}

Nhiệm vụ của bạn:
1. Lập một kế hoạch chi tiêu cực kỳ chi tiết, tối ưu và thông minh từng ngày cho sinh viên để không bao giờ rỗng túi.
2. Gợi ý cụ thể các món ăn hoặc combo quán từ danh sách trên sao cho no bụng mà vẫn tiết kiệm.
3. Đưa ra 3 "Bí kíp sinh tồn của Cóc FPT" hài hước, thực tế dựa trên thông tin đã nhập.

Hãy trả lời bằng tiếng Việt, giọng điệu thân thiện, năng động, đậm chất sinh viên, dùng định dạng Markdown đẹp mắt nhưng súc tích.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error("AI Generation failed:", error);
    res.status(500).json({ error: "AI failed to respond. Please try again." });
  }
});


// Serve static assets in production & Vite Dev server in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cóc Food Map server running on port ${PORT}`);
  });
}

startServer();
