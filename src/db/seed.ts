import { db } from './index.ts';
import { spots, deals, menuItems } from './schema.ts';

export async function seedDatabase() {
  try {
    const existingSpots = await db.select().from(spots).limit(1);
    if (existingSpots.length > 0) {
      console.log("Database already contains spots, skipping seed.");
      return;
    }

    console.log("Seeding spots data...");

    // Insert spots
    const insertedSpots = await db.insert(spots).values([
      {
        name: "Cơm Tấm Bụi Sài Gòn - Gần FPT",
        description: "Quán cơm tấm bình dân siêu ngon, sườn ướp đậm vị nướng than hồng thơm nức mũi. Đặc biệt sinh viên được free trà đá và thêm cơm.",
        category: "food",
        address: "Lô T2-1.2 Đường D1, Khu Công Nghệ Cao, Quận 9, TP. HCM (Cách cổng FPT 500m)",
        school: "FPT University",
        lat: 10.8443,
        lng: 106.8378,
        wifi: false,
        studySpot: false,
        priceRange: "30k-45k"
      },
      {
        name: "Trà Trà Chanh & Ép Trái Cây Đô Đô",
        description: "Quán nước ruột của Cóc FPT sau giờ học. Không khí vỉa hè thoáng mát, giá hạt dẻ, phù hợp tụ tập chém gió xả stress.",
        category: "drink",
        address: "42 Đường Lê Văn Việt, Hiệp Phú, Thủ Đức, TP. HCM",
        school: "FPT University",
        lat: 10.8415,
        lng: 106.8282,
        wifi: true,
        studySpot: false,
        priceRange: "15k-30k"
      },
      {
        name: "The Coffee House - Lê Văn Việt",
        description: "Không gian sang trọng, yên tĩnh, máy lạnh mát rượi. Đầy đủ ổ cắm sạc ở mọi góc bàn và wifi tốc độ cao thích hợp cày deadline, học nhóm.",
        category: "drink",
        address: "220-222 Lê Văn Việt, Tăng Nhơn Phú B, Quận 9, TP. HCM",
        school: "FPT University",
        lat: 10.8402,
        lng: 106.8324,
        wifi: true,
        studySpot: true,
        priceRange: "40k-65k"
      },
      {
        name: "Bún Bò Huế Bà Nhàn",
        description: "Tô bún bò đầy đặn, nước dùng đậm đà thơm mùi sả, giò heo mềm và nạm sườn đặc biệt ngon. Giảm giá 10% khi xuất trình thẻ sinh viên.",
        category: "food",
        address: "15 Đường Man Thiện, Hiệp Phú, Quận 9, TP. HCM",
        school: "FPT University",
        lat: 10.8432,
        lng: 106.8365,
        wifi: true,
        studySpot: false,
        priceRange: "35k-50k"
      },
      {
        name: "Nhà Sách & Văn Phòng Phẩm Cóc Vàng",
        description: "Đầy đủ giáo trình, tài liệu tham khảo, sổ tay, bút thước và đồ dùng văn phòng phẩm giá rẻ dành riêng cho học sinh sinh viên.",
        category: "shopping",
        address: "Đường D2, Tăng Nhơn Phú A, Quận 9, TP. HCM",
        school: "FPT University",
        lat: 10.8465,
        lng: 106.8350,
        wifi: false,
        studySpot: false,
        priceRange: "5k-100k"
      },
      {
        name: "Gà Rán Jollibee - Vincom Quận 9",
        description: "Hương vị gà rán giòn rụm và mỳ ý sốt bò bằm đậm đà ngọt ngào. Có nhiều combo khuyến mãi tiết kiệm dành cho nhóm 2-4 bạn sinh viên.",
        category: "food",
        address: "Vincom Plaza Lê Văn Việt, 50 Lê Văn Việt, Quận 9, TP. HCM",
        school: "FPT University",
        lat: 10.8450,
        lng: 106.8385,
        wifi: true,
        studySpot: false,
        priceRange: "45k-90k"
      }
    ]).returning();

    console.log(`Inserted ${insertedSpots.length} spots.`);

    // Map spot IDs
    const spotMap = insertedSpots.reduce((acc, current) => {
      acc[current.name.split(" ")[0]] = current.id;
      return acc;
    }, {} as Record<string, number>);

    // Insert menu items
    const menuItemsData = [
      {
        spotId: spotMap["Cơm"],
        name: "Cơm Tấm Sườn Nướng Chả",
        price: 35000,
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      },
      {
        spotId: spotMap["Cơm"],
        name: "Cơm Tấm Đùi Gà Xối Mỡ",
        price: 40000,
        image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400",
        isPopular: false
      },
      {
        spotId: spotMap["Cơm"],
        name: "Ba Chỉ Quay Giòn Bì",
        price: 38000,
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      },
      {
        spotId: spotMap["Trà"],
        name: "Trà Chanh Giã Tay",
        price: 18000,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      },
      {
        spotId: spotMap["Trà"],
        name: "Trà Sữa Trân Châu Đô Đô",
        price: 25000,
        image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      },
      {
        spotId: spotMap["The"],
        name: "Cà Phê Sữa Đá Sài Gòn",
        price: 35000,
        image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      },
      {
        spotId: spotMap["The"],
        name: "Trà Đào Cam Sả",
        price: 49000,
        image: "https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&q=80&w=400",
        isPopular: false
      },
      {
        spotId: spotMap["Bún"],
        name: "Bún Bò Huế Tô Đặc Biệt",
        price: 45000,
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      },
      {
        spotId: spotMap["Nhà"],
        name: "Sổ Tay Tập Vẽ Cóc FPT",
        price: 15000,
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=400",
        isPopular: false
      },
      {
        spotId: spotMap["Gà"],
        name: "Combo Gà Giòn Vui Vẻ",
        price: 65000,
        image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=400",
        isPopular: true
      }
    ];

    await db.insert(menuItems).values(menuItemsData);
    console.log("Seeded menu items.");

    // Insert deals
    await db.insert(deals).values([
      {
        spotId: spotMap["Cơm"],
        title: "Free Trà Đá & Thêm Cơm Cho SV FPT",
        description: "Chỉ cần xuất trình thẻ sinh viên FPT University khi mua cơm.",
        discountCode: "FPTCORE",
        expiryDate: "2026-12-31"
      },
      {
        spotId: spotMap["Bún"],
        title: "Giảm 10% Tổng Hoá Đơn Lớn Hơn 80k",
        description: "Ưu đãi khi đi nhóm từ 2 người trở lên và xuất trình thẻ sinh viên.",
        discountCode: "BUNBOSV",
        expiryDate: "2026-09-30"
      },
      {
        spotId: spotMap["Trà"],
        title: "Mua 2 Tặng 1 Trà Sữa Size M",
        description: "Áp dụng vào khung giờ vàng từ 14h00 đến 17h00 hàng ngày.",
        discountCode: "DODOGOLD",
        expiryDate: "2026-08-31"
      },
      {
        spotId: spotMap["The"],
        title: "Đồng Giá 39k Mọi Loại Trà Size M",
        description: "Điền mã code tại quầy thanh toán hoặc app để nhận giảm giá.",
        discountCode: "TCHSTUDENT",
        expiryDate: "2026-07-31"
      }
    ]);
    console.log("Seeded deals.");
    console.log("Database seed completed successfully.");

  } catch (error) {
    console.error("Database seeding failed:", error);
  }
}
