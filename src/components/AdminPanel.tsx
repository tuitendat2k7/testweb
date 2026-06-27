import React, { useState } from 'react';
import { Spot, UserProfile } from '../types.ts';
import { ShieldAlert, Plus, Trash2, Database, FileSpreadsheet, Layers, Sparkles, HelpCircle, Check, RefreshCw } from 'lucide-react';
import { User } from 'firebase/auth';

interface AdminPanelProps {
  user: any;
  profile: UserProfile | null;
  spots: Spot[];
  onRefreshSpots: () => void;
  onRefreshProfile: () => void;
  onSimulatedLogin?: (role: 'student' | 'admin') => void;
}

export default function AdminPanel({ user, profile, spots, onRefreshSpots, onRefreshProfile, onSimulatedLogin }: AdminPanelProps) {
  // Admin Login Form States
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginStatus, setAdminLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Add Spot state
  const [spotName, setSpotName] = useState('');
  const [spotDesc, setSpotDesc] = useState('');
  const [category, setCategory] = useState('food');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('25k-50k');
  const [lat, setLat] = useState('10.842');
  const [lng, setLng] = useState('106.835');
  const [wifi, setWifi] = useState(true);
  const [studySpot, setStudySpot] = useState(false);

  // Add Menu Item state
  const [selectedSpotId, setSelectedSpotId] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('30000');
  const [itemImage, setItemImage] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  // Add Deal state
  const [selectedDealSpotId, setSelectedDealSpotId] = useState<string>('');
  const [dealTitle, setDealTitle] = useState('');
  const [dealDesc, setDealDesc] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  // Google Sheet Sync state
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncCount, setSyncCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Status banners for creation
  const [spotStatus, setSpotStatus] = useState<string | null>(null);
  const [itemStatus, setItemStatus] = useState<string | null>(null);
  const [dealStatus, setDealStatus] = useState<string | null>(null);

  // Sync Sheet execution
  const handleSyncSheet = async () => {
    if (!sheetUrl) return;
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      const res = await fetch('/api/sync-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus('success');
        setSyncCount(data.count || 0);
        onRefreshSpots();
      } else {
        setSyncStatus('error');
        setErrorMessage(data.error || 'Đồng bộ thất bại.');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || 'Lỗi kết nối mạng.');
    }
  };

  // Add spot execution
  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !spotName || !address) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: spotName,
          description: spotDesc,
          category,
          address,
          school: 'FPT University',
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          wifi,
          studySpot,
          priceRange
        })
      });

      if (res.ok) {
        setSpotStatus("Đã thêm địa điểm thành công!");
        setSpotName('');
        setSpotDesc('');
        setAddress('');
        onRefreshSpots();
        setTimeout(() => setSpotStatus(null), 3000);
      } else {
        const errorData = await res.json();
        setSpotStatus(`Lỗi: ${errorData.error}`);
      }
    } catch (err: any) {
      setSpotStatus(`Lỗi: ${err.message}`);
    }
  };

  // Add menu item execution
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSpotId || !itemName || !itemPrice) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/spots/${selectedSpotId}/menu-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: itemName,
          price: parseInt(itemPrice, 10),
          image: itemImage,
          isPopular
        })
      });

      if (res.ok) {
        setItemStatus("Đã thêm món ăn/nước uống mới vào thực đơn!");
        setItemName('');
        setItemPrice('30000');
        setItemImage('');
        onRefreshSpots();
        setTimeout(() => setItemStatus(null), 3000);
      } else {
        const data = await res.json();
        setItemStatus(`Lỗi: ${data.error}`);
      }
    } catch (err: any) {
      setItemStatus(`Lỗi: ${err.message}`);
    }
  };

  // Add deal execution
  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDealSpotId || !dealTitle) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/spots/${selectedDealSpotId}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: dealTitle,
          description: dealDesc,
          discountCode,
          expiryDate
        })
      });

      if (res.ok) {
        setDealStatus("Ưu đãi đã được thiết lập thành công!");
        setDealTitle('');
        setDealDesc('');
        setDiscountCode('');
        onRefreshSpots();
        setTimeout(() => setDealStatus(null), 3000);
      } else {
        const data = await res.json();
        setDealStatus(`Lỗi: ${data.error}`);
      }
    } catch (err: any) {
      setDealStatus(`Lỗi: ${err.message}`);
    }
  };

  // Delete spot execution
  const handleDeleteSpot = async (id: number) => {
    if (!user || !window.confirm("Bạn có chắc chắn muốn xoá địa điểm này cùng toàn bộ thực đơn/ưu đãi liên quan? Actions này không thể khôi phục!")) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/spots/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onRefreshSpots();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Login and Promotions
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAdminLoginStatus('error');
      setAdminLoginError('Bạn phải đăng nhập Google trước khi thực hiện xác thực Admin!');
      return;
    }
    if (!adminUsername || !adminPassword) return;

    setAdminLoginStatus('loading');
    setAdminLoginError('');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/profile/promote-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminLoginStatus('success');
        onRefreshProfile();
      } else {
        setAdminLoginStatus('error');
        setAdminLoginError(data.error || 'Sai tài khoản hoặc mật khẩu Admin.');
      }
    } catch (err: any) {
      setAdminLoginStatus('error');
      setAdminLoginError(err.message || 'Lỗi mạng khi kết nối máy chủ.');
    }
  };

  const handleAdminDemote = async () => {
    if (!user) return;
    if (!window.confirm("Bạn có chắc chắn muốn thoát quyền Admin và quay lại vai trò Sinh Viên?")) return;
    try {
      if (user.isSimulated && onSimulatedLogin) {
        onSimulatedLogin('student');
        return;
      }
      const token = await user.getIdToken();
      const res = await fetch('/api/profile/demote-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        onRefreshProfile();
      }
    } catch (err) {
      console.error("Failed to demote admin:", err);
    }
  };

  // Check if current user is admin
  if (!user) {
    return (
      <div className="p-10 text-center glass-panel border border-white/5 rounded-3xl max-w-lg mx-auto space-y-4 shadow-2xl text-white">
        <ShieldAlert className="w-12 h-12 text-[#5eff90] mx-auto animate-pulse" />
        <h3 className="font-display font-black text-lg text-neutral-100 uppercase tracking-wide">Yêu Cầu Đăng Nhập FPT</h3>
        <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
          Vui lòng đăng nhập Google trước khi thực hiện xác thực tài khoản Quản trị viên.
        </p>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="p-6 sm:p-10 glass-panel border border-white/5 rounded-3xl max-w-md mx-auto shadow-2xl text-white space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-bounce" style={{ animationDuration: '3s' }}>
            🔑
          </div>
          <h3 className="font-display font-black text-lg sm:text-xl text-neutral-100 uppercase tracking-wide">🔑 Xác Thực Quản Trị Viên</h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Nhập tài khoản và mật khẩu Admin để truy cập toàn bộ hệ thống chỉnh sửa bản đồ, thực đơn niêm yết và khuyến mại.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Tài khoản Admin</label>
            <input 
              type="text" 
              required
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-[#18181b] border border-white/10 py-2.5 px-3.5 rounded-xl text-sm text-white outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Mật khẩu bảo mật</label>
            <input 
              type="password" 
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full bg-[#18181b] border border-white/10 py-2.5 px-3.5 rounded-xl text-sm text-white outline-none focus:border-amber-500 font-semibold font-mono"
            />
          </div>

          {adminLoginError && (
            <div className="p-3 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium leading-relaxed">
              ⚠️ {adminLoginError}
            </div>
          )}

          <button
            type="submit"
            disabled={adminLoginStatus === 'loading'}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-xl text-xs sm:text-sm tracking-wider uppercase transition shadow-lg active:scale-95 duration-250 cursor-pointer disabled:opacity-50"
          >
            {adminLoginStatus === 'loading' ? 'Đang kiểm tra...' : 'Xác nhận Đăng Nhập ⚡'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
            💡 Liên hệ ADMIN để truy cập <span className="text-[#5eff90] font-mono"></span> <span className="text-[#5eff90] font-mono"></span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 text-white">
      
      {/* Panel header banner */}
      <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <h3 className="font-bold text-sm text-neutral-100 uppercase tracking-wider">Chế độ Quản Trị Admin Đang Hoạt Động</h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-0.5">
              Chào Admin, bạn có toàn quyền thêm mới địa điểm, món ăn, coupon, xoá bớt dữ liệu và quản lý tự động đồng bộ thực đơn giá thực tế thông qua liên kết Google Sheets của sinh viên.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleAdminDemote}
          className="py-1.5 px-3.5 bg-amber-500/25 hover:bg-amber-500/35 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-amber-500/30 shrink-0"
        >
          Thoát quyền Admin 🚀
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Google Sheets Sync (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-black text-neutral-100 text-xs sm:text-sm uppercase tracking-wider">
                Đồng Bộ Từ Google Sheets ⚡
              </h3>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Dễ dàng cập nhật trực tuyến thực đơn, giá món, ảnh thực tế và địa điểm thông qua Google Sheets công khai.
            </p>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">ID hoặc URL Google Sheet</label>
              <input 
                type="text" 
                placeholder="Dán link Google Sheet hoặc ID sheet..."
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Sync trigger button */}
            <button
              onClick={handleSyncSheet}
              disabled={syncStatus === 'syncing' || !sheetUrl}
              id="sheet-sync-btn"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải nạp...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Đồng Bộ Ngay ⚡</span>
                </>
              )}
            </button>

            {/* Status alerts */}
            {syncStatus === 'success' && (
              <div className="p-3 text-xs bg-emerald-500/10 text-[#5eff90] border border-emerald-500/20 rounded-xl flex items-center gap-2 leading-relaxed">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Đồng bộ thành công! Đã quét và cập nhật/thêm {syncCount} món ăn vào hệ thống.</span>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="p-3 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl">
                <span className="font-bold block">Đồng bộ thất bại:</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Guide information */}
            <div className="bg-white/5 p-4 border border-white/5 rounded-xl space-y-2">
              <span className="font-extrabold text-[#fafafa] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                Định dạng Google Sheet:
              </span>
              <p className="text-[10px] text-neutral-400 leading-relaxed space-y-1">
                1. Mở file Google Sheet của bạn.<br />
                2. Vào <strong className="font-bold text-white">File &gt; Share &gt; Publish to web</strong>.<br />
                3. Chọn <strong className="font-bold text-white">Sheet 1</strong> ròi chọn định dạng <strong className="font-bold text-white">Comma-separated values (.csv)</strong>.<br />
                4. Copy liên kết đó dán vào đây.<br />
                5. Thiết lập cột cột đúng thứ tự sau:<br />
                <code className="bg-[#18181b] border border-white/5 text-[#5eff90] block p-2 rounded-lg text-[9px] mt-1 font-mono break-all leading-normal">
                  Spot Name, Description, Category, Address, Lat, Lng, Wifi, Study, Price Range, Item Name, Item Price, Item Image
                </code>
              </p>
            </div>

          </div>
        </div>

        {/* Right column: Form configurations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Add a Spot Form */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <h3 className="font-display font-black text-neutral-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Thêm Mới Địa Điểm Ăn Uống quanh FPT</span>
            </h3>

            <form onSubmit={handleAddSpot} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Tên Quán *</label>
                  <input 
                    type="text" 
                    required 
                    value={spotName} 
                    onChange={(e) => setSpotName(e.target.value)}
                    placeholder="e.g. Cơm Tấm Chú 6" 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Danh mục *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none font-bold"
                  >
                    <option value="food">Đồ Ăn (🍲)</option>
                    <option value="drink">Trà Sữa & Trà Đá (🥤)</option>
                    <option value="shopping">Mua sắm / VPP / Đi chợ (✏️)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Mô tả quán</label>
                <textarea 
                  value={spotDesc} 
                  onChange={(e) => setSpotDesc(e.target.value)}
                  placeholder="Mô tả món đặc trưng, ưu đãi sảnh chờ hay chỗ ngồi..." 
                  rows={2} 
                  className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Địa chỉ *</label>
                <input 
                  type="text" 
                  required 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 15 Man Thiện, Hiệp Phú, Thủ Đức, TP. HCM" 
                  className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Hạn Giá</label>
                  <input 
                    type="text" 
                    value={priceRange} 
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-2.5 rounded-xl text-xs text-white outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Vĩ độ (Lat)</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={lat} 
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-2.5 rounded-xl text-xs text-white outline-none font-bold" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Kinh độ (Lng)</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={lng} 
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-2.5 rounded-xl text-xs text-white outline-none font-bold" 
                  />
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Tính năng</label>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-300 cursor-pointer">
                      <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} className="accent-emerald-400 rounded" />
                      <span>Wifi</span>
                    </label>
                    <label className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-300 cursor-pointer">
                      <input type="checkbox" checked={studySpot} onChange={(e) => setStudySpot(e.target.checked)} className="accent-emerald-400 rounded" />
                      <span>Học bài</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  id="add-spot-btn"
                  className="bg-white text-black hover:bg-neutral-200 font-black py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>TẠO QUÁN NGAY ✨</span>
                </button>
                {spotStatus && <span className="text-xs font-bold text-emerald-400 animate-pulse">{spotStatus}</span>}
              </div>
            </form>

          </div>

          {/* Add Menu Item form */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <h3 className="font-display font-black text-neutral-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Thêm Mới Thực Đơn</span>
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Chọn Quán *</label>
                  <select 
                    required
                    value={selectedSpotId} 
                    onChange={(e) => setSelectedSpotId(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none font-bold"
                  >
                    <option value="">-- Chọn quán ăn tương ứng --</option>
                    {spots.map(s => (
                      <option key={s.id} value={s.id} className="text-black">{s.name} ({s.category})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Tên Món Ăn/Uống *</label>
                  <input 
                    type="text" 
                    required 
                    value={itemName} 
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Trà đào 1 lít" 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Giá Bán (VND) *</label>
                  <input 
                    type="number" 
                    required 
                    value={itemPrice} 
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="e.g. 25000" 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-black"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">URL Hình Ảnh</label>
                  <input 
                    type="text" 
                    value={itemImage} 
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="Dán link ảnh Unsplash..." 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  id="add-item-btn"
                  className="bg-white text-black hover:bg-neutral-200 font-black py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>THÊM MÓN ✔️</span>
                </button>
                {itemStatus && <span className="text-xs font-bold text-emerald-400 animate-pulse">{itemStatus}</span>}
              </div>
            </form>
          </div>

          {/* Add a Deal / Coupon form */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <h3 className="font-display font-black text-neutral-100 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Thiết lập Ưu đãi Voucher</span>
            </h3>

            <form onSubmit={handleAddDeal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Chọn Quán Áp Dụng *</label>
                  <select 
                    required
                    value={selectedDealSpotId} 
                    onChange={(e) => setSelectedDealSpotId(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none font-bold"
                  >
                    <option value="">-- Chọn quán ăn tương ứng --</option>
                    {spots.map(s => (
                      <option key={s.id} value={s.id} className="text-black">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Tiêu Đề Ưu Đãi *</label>
                  <input 
                    type="text" 
                    required 
                    value={dealTitle} 
                    onChange={(e) => setDealTitle(e.target.value)}
                    placeholder="e.g. Giảm ngay 10% khi đi 3 người" 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Chi tiết điều kiện ưu đãi</label>
                  <input 
                    type="text" 
                    value={dealDesc} 
                    onChange={(e) => setDealDesc(e.target.value)}
                    placeholder="Chỉ xuất trình thẻ FPT khi gọi món" 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Mã Code Coupon</label>
                  <input 
                    type="text" 
                    value={discountCode} 
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="e.g. COCFPT" 
                    className="w-full bg-[#18181b] border border-white/10 py-2 px-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  id="add-deal-btn"
                  className="bg-white text-black hover:bg-neutral-200 font-black py-2 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>KÍCH HOẠT DEAL 🎉</span>
                </button>
                {dealStatus && <span className="text-xs font-bold text-emerald-400 animate-pulse">{dealStatus}</span>}
              </div>
            </form>
          </div>

          {/* List of current eateries with delete action */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <h3 className="font-display font-black text-[#fafafa] text-xs sm:text-sm uppercase tracking-wider">
              Danh Sách Địa Điểm Đang Hoạt Động ({spots.length})
            </h3>
            
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {spots.map((s) => (
                <div 
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition whitespace-nowrap text-ellipsis"
                >
                  <div className="min-w-0 pr-4">
                    <h4 className="font-bold text-xs sm:text-sm text-neutral-200 truncate">{s.name}</h4>
                    <p className="text-[10px] text-neutral-500 font-semibold truncate">📍 {s.address}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSpot(s.id)}
                    className="p-1.5 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded-lg transition-all flex-shrink-0 cursor-pointer"
                    title="Xoá địa điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
