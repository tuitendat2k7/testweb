import { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import CocLogo from './components/CocLogo.tsx';
import HomePanel from './components/HomePanel.tsx';
import DealsPanel from './components/DealsPanel.tsx';
import BudgetPanel from './components/BudgetPanel.tsx';
import MapPanel from './components/MapPanel.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { Spot, Deal, UserProfile, MenuItem, Review } from './types.ts';
import { auth } from './lib/firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { SpotReviews } from './components/SpotReviews.tsx';
import { 
  Home, 
  Tag, 
  PiggyBank, 
  Map, 
  Sliders, 
  Wifi, 
  GraduationCap, 
  Coins, 
  Navigation, 
  Sparkles, 
  X, 
  Check, 
  AlertTriangle,
  Gift,
  ChevronsRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'home' | 'deals' | 'budget' | 'map' | 'admin'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Database listings
  const [spots, setSpots] = useState<Spot[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(true);

  // Selected Spot Modal / Showcase Details
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Fetch Spots and Deals
  const fetchspotsAndDeals = async () => {
    setLoadingSpots(true);
    try {
      const resSpots = await fetch('/api/spots');
      if (resSpots.ok) {
        const dataSpots = await resSpots.json();
        setSpots(dataSpots);
      }

      const resDeals = await fetch('/api/deals');
      if (resDeals.ok) {
        const dataDeals = await resDeals.json();
        setDeals(dataDeals);
      }
    } catch (err) {
      console.error("Failed to load listings:", err);
    } finally {
      setLoadingSpots(false);
    }
  };

  useEffect(() => {
    fetchspotsAndDeals();
  }, []);

  // Set up auth listeners
  useEffect(() => {
    // Check if we have a locally stored simulated user session
    const savedSim = localStorage.getItem('simulated_user');
    if (savedSim) {
      try {
        const parsed = JSON.parse(savedSim);
        const simulatedUserObj = {
          ...parsed,
          getIdToken: async () => parsed.simulatedToken
        };
        setUser(simulatedUserObj);
        setProfile(parsed.profile);
        setLoadingAuth(false);
        return;
      } catch (err) {
        console.error("Failed to recover simulated user:", err);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Avoid overwriting simulated session with null from Firebase Auth init
      if (localStorage.getItem('simulated_user')) {
        return;
      }

      setUser(currentUser);
      if (currentUser) {
        setLoadingAuth(true);
        try {
          // Synchronize user to get or update role profile
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userProfile = await res.json();
            setProfile(userProfile);
          }
        } catch (error) {
          console.error("Auth sync error:", error);
        } finally {
          setLoadingAuth(false);
        }
      } else {
        setProfile(null);
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshProfile = async () => {
    const isSimulated = localStorage.getItem('simulated_user');
    if (isSimulated) {
      try {
        const parsed = JSON.parse(isSimulated);
        const token = parsed.simulatedToken;
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const uProfile = await res.json();
          parsed.profile = uProfile;
          localStorage.setItem('simulated_user', JSON.stringify(parsed));
          
          const simulatedUserObj = {
            ...parsed,
            getIdToken: async () => token
          };
          setUser(simulatedUserObj);
          setProfile(uProfile);
        }
      } catch (err) {
        console.error("Failed to refresh simulated profile:", err);
      }
      return;
    }

    if (auth.currentUser) {
      setLoadingAuth(true);
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const uProfile = await res.json();
          setProfile(uProfile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAuth(false);
      }
    } else {
      setProfile(null);
    }
  };

  const handleSimulatedLogin = async (role: 'student' | 'admin') => {
    setLoadingAuth(true);
    try {
      const token = `simulated_${role}`;
      const displayName = role === 'admin' ? 'Cóc Admin VIP (Giả Lập)' : 'Cóc Sinh Viên (Giả Lập)';
      const res = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ displayName })
      });

      let dbProfile = {
        uid: `simulated_${role}`,
        email: `${role}@fpt.edu.vn`,
        displayName,
        role,
        createdAt: new Date().toISOString()
      };

      if (res.ok) {
        dbProfile = await res.json();
      }

      const mockUserObj = {
        uid: `simulated_${role}`,
        email: `${role}@fpt.edu.vn`,
        displayName,
        photoURL: role === 'admin' 
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
        isSimulated: true,
        simulatedToken: token,
        profile: dbProfile
      };

      localStorage.setItem('simulated_user', JSON.stringify(mockUserObj));
      
      const simulatedUserObj = {
        ...mockUserObj,
        getIdToken: async () => token
      };

      setUser(simulatedUserObj);
      setProfile(dbProfile);
    } catch (err) {
      console.error("Simulated login failed:", err);
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    setLoadingAuth(true);
    try {
      localStorage.removeItem('simulated_user');
      await auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Safe direction links
  const handleDirections = (spot: Spot) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    window.open(url, '_blank', 'referrerPolicy=no-referrer');
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col font-sans select-none antialiased text-neutral-100">
      
      {/* Header component */}
      <Header 
        user={user} 
        profile={profile} 
        loadingAuth={loadingAuth} 
        onRefreshProfile={handleRefreshProfile} 
        onLogout={handleLogout}
        onSimulatedLogin={handleSimulatedLogin}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main navigation layouts */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If database is fetching, show modern fallback loaders */}
        {loadingSpots ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-emerald-500 animate-spin" />
              <CocLogo size="sm" className="relative z-10 animate-pulse" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-neutral-200 text-sm">Đang tải bản đồ Cóc Food...</h4>
              <p className="text-xs text-neutral-500">Đợi tí nhé, dữ liệu chất lượng cao đang được đồng bộ.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Nav Menu switcher */}
            <div className="flex justify-start sm:justify-center border-b border-white/5 overflow-x-auto scroller-hidden">
              <div className="flex space-x-1 sm:space-x-4 pb-px">
                {[
                  { id: 'home', label: 'Trang Chủ', icon: Home },
                  { id: 'admin', label: 'Quản Trị Admin', icon: Sliders },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      id={`tab-btn-${tab.id}`}
                      className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition duration-300 cursor-pointer whitespace-nowrap relative ${
                        isActive 
                          ? 'border-emerald-500 text-emerald-400' 
                          : 'border-transparent text-neutral-400 hover:text-neutral-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabUnderline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Render selected screen panel */}
            <div className="mt-4">
              {activeTab === 'home' && (
                <HomePanel 
                  spots={spots} 
                  deals={deals} 
                  onSelectSpot={(spot) => setSelectedSpot(spot)} 
                  onNavigateToDeals={() => setActiveTab('deals')}
                  onNavigateToBudget={() => setActiveTab('budget')}
                />
              )}
              {activeTab === 'deals' && (
                <DealsPanel 
                  spots={spots} 
                  deals={deals} 
                  onSelectSpot={(spot) => setSelectedSpot(spot)} 
                />
              )}
              {activeTab === 'budget' && (
                <BudgetPanel />
              )}
              {activeTab === 'map' && (
                <MapPanel 
                  spots={spots} 
                  onSelectSpot={(spot) => setSelectedSpot(spot)} 
                />
              )}
              {activeTab === 'admin' && (
                <AdminPanel 
                  user={user} 
                  profile={profile} 
                  spots={spots} 
                  onRefreshSpots={fetchspotsAndDeals} 
                  onRefreshProfile={handleRefreshProfile}
                  onSimulatedLogin={handleSimulatedLogin}
                />
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer credits in layout */}
      <footer className="bg-black/30 border-t border-white/5 py-8 text-center text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1.5 font-medium">
          <p>© 2026 Cóc Food Map 💸. Được tâm huyết thiết kế bởi Sinh Viên, Cho Sinh Viên FPT.</p>
          <p className="text-neutral-600 text-[10px] uppercase tracking-widest font-bold">
            Hiệu năng vượt trội • Bản đồ vệ tinh số hóa • Công cụ sinh tồn thông minh
          </p>
        </div>
      </footer>

      {/* Selected Spot Showcases / Details Modal Overlay (Heavy Dark Glassmorphic look) */}
      <AnimatePresence>
        {selectedSpot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSpot(null)}
              className="absolute inset-0 modal-backdrop-custom"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="relative max-w-4xl w-full rounded-2xl md:rounded-3xl h-[85vh] md:h-[620px] flex flex-col modal-container-custom border overflow-hidden shadow-2xl z-10"
            >
              
              {/* Floating Close Button: absolute top right, permanently visible above scroll context with high contrast index */}
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-4 right-4 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition cursor-pointer modal-close-btn z-30 shadow-md border"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main content body: Single nested scrollbar on mobile, dual side-by-side layout on desktop */}
              <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Column: Cover Image & Badge/Title overlays (Sized nicely on mobile, full side banner on desktop) */}
                <div className="relative w-full md:w-[42%] h-56 sm:h-64 md:h-full flex-shrink-0 flex flex-col justify-end p-5 sm:p-6 md:p-8 overflow-hidden">
                  {/* Background Cover Photo */}
                  <div className="absolute inset-0 z-0">
                    {selectedSpot.menuItems && selectedSpot.menuItems.length > 0 && selectedSpot.menuItems[0].image ? (
                      <img 
                        src={selectedSpot.menuItems[0].image} 
                        alt={selectedSpot.name} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#ebdcb8] via-[#f7f2cb] to-[#ebdcb8] dark:from-emerald-950 dark:via-teal-950 dark:to-emerald-950 flex items-center justify-center text-[#20140c] dark:text-white text-5xl">
                        🍲
                      </div>
                    )}
                    {/* Premium multi-layered dark gradient mask to guarantee white title text readability regardless of background image luminosity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/5 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent z-10 hidden md:block" />
                  </div>

                  {/* Overlaid Information (placed relatively on top of the image and mask with z-index 20) */}
                  <div className="relative z-20 space-y-2 mt-auto font-sans">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="inline-block py-1 px-3 bg-orange-600 force-high-contrast-white rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest leading-normal">
                        {selectedSpot.category === 'food' ? '🍲 ĐỒ ĂN' : selectedSpot.category === 'drink' ? '🥤 NƯỚC UỐNG' : '✏️ TIỆN ÍCH'}
                      </span>
                      {selectedSpot.deals && selectedSpot.deals.length > 0 && (
                        <span className="inline-block py-1 px-3 text-[9px] sm:text-[10px] font-extrabold bg-amber-500 text-neutral-950 rounded-full uppercase tracking-wider leading-normal">
                          Ưu đãi bản địa 🔥
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-display font-black text-xl sm:text-2xl md:text-3.5xl leading-tight force-high-contrast-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      {selectedSpot.name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 text-[10px] font-extrabold pt-1">
                      <span className="bg-black/45 backdrop-blur-md border border-white/10 py-1.5 px-2.5 rounded-lg force-high-contrast-white shadow-sm">
                        📍 {selectedSpot.address}
                      </span>
                      <span className="bg-emerald-600/40 backdrop-blur-md border border-emerald-500/20 py-1.5 px-2.5 rounded-lg force-high-contrast-white shadow-sm">
                        💳 Khung giá: {selectedSpot.priceRange || 'Sinh viên'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Overview specs, menus, deals details (scrolls together on mobile, scrollable on PC) */}
                <div className="flex-1 md:h-full md:overflow-y-auto p-5 sm:p-6 md:p-8 space-y-6 md:border-l border-neutral-100 dark:border-white/5 bg-neutral-50/10 dark:bg-neutral-900/5">
                  
                  {/* Spot general details */}
                  <div className="space-y-2.5">
                    <h4 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-[#705b4a] dark:text-neutral-450">Giới Thiệu Tổng Quan</h4>
                    <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm leading-relaxed">
                      {selectedSpot.description || "Chưa có mô tả chi tiết cho địa điểm này."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold py-1">
                      {selectedSpot.wifi && (
                        <span className="bg-[#f0ebd0] dark:bg-white/5 border border-[#e4dea7] dark:border-white/5 py-1 px-2.5 rounded-lg text-[#5c4738] dark:text-neutral-300 flex items-center gap-1.5 shadow-sm">
                          <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Wi-Fi căng sét
                        </span>
                      )}
                      {selectedSpot.studySpot && (
                        <span className="bg-[#f0ebd0] dark:bg-white/5 border border-[#e4dea7] dark:border-white/5 py-1 px-2.5 rounded-lg text-[#5c4738] dark:text-neutral-300 flex items-center gap-1.5 shadow-sm">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-500" /> Bàn học nhóm rộng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specific active discount ticket */}
                  {selectedSpot.deals && selectedSpot.deals.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-[#705b4a] dark:text-neutral-400">Ưu Đãi Độc Quyền Bản Địa</h4>
                      <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 space-y-2.5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-orange-500/10 rounded-full blur-xl" />
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-[#d8581c] dark:text-neutral-200 text-xs sm:text-sm flex items-center gap-2">
                            <span className="text-orange-500">🎟️</span>
                            {selectedSpot.deals[0].title}
                          </h5>
                          {selectedSpot.deals[0].discountCode && (
                            <span className="bg-orange-500/10 border border-orange-500/20 text-[#c2410c] dark:text-orange-300 rounded-xl font-black font-mono text-xs py-1 px-3 uppercase">
                              Mã: {selectedSpot.deals[0].discountCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                          {selectedSpot.deals[0].description}
                        </p>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 block uppercase tracking-wider">Hạn dùng: {selectedSpot.deals[0].expiryDate || 'Thả ga'}</span>
                      </div>
                    </div>
                  )}

                  {/* Vietnamese menu dishes listing */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-2">
                      <h4 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-[#705b4a] dark:text-neutral-400">Thực Đơn Giá Sinh Viên</h4>
                      <span className="text-xs font-bold text-emerald-600 dark:text-[#5eff90]">Niêm yết hỗ trợ</span>
                    </div>
                    
                    {selectedSpot.menuItems && selectedSpot.menuItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {selectedSpot.menuItems.map((item) => (
                          <div 
                             key={item.id}
                             className="flex items-center justify-between p-3 rounded-xl bg-[#f6f2d9] dark:bg-white/5 border border-[#ebdcb8]/40 dark:border-white/5 hover:border-neutral-200 dark:hover:border-white/10 transition duration-300 shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100'} 
                                alt={item.name} 
                                className="w-11 h-11 object-cover rounded-lg border border-neutral-200/50 dark:border-white/10"
                              />
                              <div>
                                <h5 className="font-bold text-neutral-800 dark:text-neutral-200 text-xs leading-snug">{item.name}</h5>
                                <p className="text-neutral-400 dark:text-neutral-500 font-bold text-[9px] uppercase tracking-wider mt-0.5">Niêm yết Cóc</p>
                              </div>
                            </div>
                            
                            <span className="font-black text-emerald-700 dark:text-[#5eff90] text-xs shrink-0 pl-1">
                              {item.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">Hiện tại chưa có món ăn nào trong thực đơn. Admin có thể thêm mới!</p>
                    )}
                  </div>

                  {/* Comments & star rating section added here */}
                  <SpotReviews 
                    spotId={selectedSpot.id}
                    reviews={selectedSpot.reviews || []}
                    currentUser={user}
                    onReviewAdded={(newReview) => {
                      setSelectedSpot(prev => {
                        if (!prev || prev.id !== newReview.spotId) return prev;
                        const updatedReviews = [newReview, ...(prev.reviews || [])];
                        return {
                          ...prev,
                          reviews: updatedReviews
                        };
                      });
                      setSpots(prevSpots => {
                        return prevSpots.map(s => {
                          if (s.id === newReview.spotId) {
                            return {
                              ...s,
                              reviews: [newReview, ...(s.reviews || [])]
                            };
                          }
                          return s;
                        });
                      });
                    }}
                  />

                </div>

              </div>

              {/* Sticky Action Footer: stays fixed at bottom of entire modal frame on both PC and mobile! */}
              <div className="p-4 modal-footer-custom flex items-center justify-between flex-shrink-0 z-20">
                <span className="text-[10px] font-black text-[#b8860b] dark:text-[#5eff90] uppercase tracking-wider">CÓC FOOD MAP VIP 💸</span>
                <button
                  onClick={() => handleDirections(selectedSpot)}
                  className="group py-2.5 px-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 duration-300 cursor-pointer text-white-force"
                >
                  <Navigation className="w-4 h-4 text-white-force transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="text-white-force">Chỉ Đường Đi Ngay</span>
                  <ArrowRight className="w-4 h-4 text-white-force transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
