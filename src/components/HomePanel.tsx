import React, { useState } from 'react';
import { Spot, Deal, MenuItem } from '../types.ts';
import { Search, MapPin, Coffee, Utensils, ShoppingBag, Wifi, GraduationCap, Flame, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import CocLogo from './CocLogo.tsx';

interface HomePanelProps {
  spots: Spot[];
  deals: Deal[];
  onSelectSpot: (spot: Spot) => void;
  onNavigateToDeals: () => void;
  onNavigateToBudget: () => void;
}

export default function HomePanel({ spots, deals, onSelectSpot, onNavigateToDeals, onNavigateToBudget }: HomePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter spots
  const filteredSpots = spots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (spot.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          spot.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || spot.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Framer Motion Stagger config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Hero Core Philosophy Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl text-white p-6 sm:p-8 md:p-10 hero-orange-banner"
      >
        {/* Subtle patterned overlay or line-art mesh */}
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:40px_40px]" />

        {/* Abstract Glowing Aura Orbs behind */}
        <div className="absolute top-[-30px] right-[-30px] w-80 h-80 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-20">
          <div className="max-w-xl md:max-w-[55%] space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/15 text-white border border-white/25">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Sổ tay Thượng vị • Cóc Food Map
            </div>
            
            <div className="space-y-3.5">
              <h2 className="font-sans font-black text-2xl sm:text-3.5xl tracking-normal text-white uppercase leading-[1.35] sm:leading-[1.4]">
                “Sinh viên không cần kiếm nhiều tiền hơn,
              </h2>
              <h2 className="font-sans font-black text-2xl sm:text-3.5xl text-yellow-200 tracking-normal uppercase leading-[1.35] sm:leading-[1.4]">
                chỉ cần tiêu thông minh hơn.”
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed max-w-lg">
              Hệ sinh thái thông tin ẩm thực bản đồ thu nhỏ, tích hợp công cụ kiểm duyệt chi phí, đồng bộ dữ liệu thời gian thực giúp học bối FPT nâng tầm sinh tồn chất lượng cao.
            </p>

            

          {/* Right side interactive vector grid mockup */}
          <div className="h-44 w-full md:w-[40%] relative hidden md:flex items-center justify-center pointer-events-none select-none overflow-visible">
            {/* Main animated background circle */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute w-44 h-44 rounded-full border border-dashed border-white/20"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-32 h-32 rounded-full border border-dotted border-white/30"
            />

            {/* Interactive Vector Route Line with dash offset runner */}
            <svg className="absolute w-48 h-48 text-white/25" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20,160 C70,150 50,60 110,50 C170,40 150,110 180,90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="animate-map-route-flow" />
              <path d="M40,30 L70,80 L50,120" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 3" />
            </svg>

            {/* Floating food items tags */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-0 py-1.5 px-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/25 shadow-lg flex items-center gap-1.5 transform -rotate-6 hero-sticker-orange"
            >
              <span className="text-sm">🍜</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-100">Cơm Sườn</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-6 right-0 py-1.5 px-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/25 shadow-lg flex items-center gap-1.5 transform rotate-3 hero-sticker-teal"
            >
              <span className="text-sm">🥤</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-100">Trà Sữa</span>
            </motion.div>

            {/* Pulsing main Map Pin representing the Vector Map */}
            <motion.div 
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute flex flex-col items-center"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-white/20 rounded-full animate-ping pointer-events-none" />
                <div className="absolute w-8 h-8 bg-white/30 rounded-full animate-pulse pointer-events-none" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center border-2 border-white shadow-xl">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="mt-1 pb-0.5 px-2 bg-emerald-500 text-white rounded text-[8px] font-black tracking-widest uppercase shadow-md border border-white/20">FPT ZONE</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Overlapping, Beautifully Illuminated Search Bar */}
      <div className="relative z-30 -mt-8 sm:-mt-10 max-w-2xl mx-auto w-full px-4 sm:px-0">
        <div className="neo-inset p-1.5 rounded-2xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(0,0,0,0.6)] flex items-center gap-3 transition-all duration-300 focus-within:border-orange-500/50 focus-within:shadow-[0_15px_35px_rgba(234,88,12,0.2)] search-bar-container bg-neutral-900/90 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-inner shrink-0">
            <Search className="text-white w-4 h-4" />
          </div>
          <input 
            type="text" 
            placeholder="Tìm quán cơm sườn, xiên bẩn, tào phớ, cafe 24h gần FPT..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[#FAFAFA] placeholder-neutral-400 outline-none font-semibold px-2"
          />
        </div>
      </div>

      {/* Filters List */}
      <div className="pt-2">
        <div className="flex flex-wrap gap-2 justify-start sm:justify-center">
          {[
            { id: 'all', label: 'Tất Cả Địa Điểm', icon: '🍽️' },
            { id: 'food', label: 'Quán Đồ Ăn', icon: '🍲' },
            { id: 'drink', label: 'Trà Sữa & Trà Đá', icon: '🥤' },
            { id: 'shopping', label: 'Mua Sắm/VPP', icon: '✏️' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all duration-300 active:scale-95 border filter-btn-hover ${
                selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/40 shadow-[0_4px_12px_rgba(16,185,129,0.3)]' 
                  : 'glass-panel text-neutral-300 hover:text-white border-white/5 hover:border-white/10'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section: Today's deals highlight */}
      {deals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-neutral-200 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <Flame className="text-orange-500 w-5 h-5 inline" />
              Săn Deal Hot Hôm Nay 🔥
            </h3>
            <button 
              onClick={onNavigateToDeals}
              id="view-all-deals-btn"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-0.5"
            >
              <span>Xem tất cả ({deals.length})</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.slice(0, 2).map((deal, idx) => (
              <motion.div 
                key={deal.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 80, damping: 14, delay: idx * 0.05 }}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => {
                  if (deal.spot) onSelectSpot(deal.spot);
                }}
                className="relative overflow-hidden p-4 rounded-2xl glass-panel border border-orange-500/20 text-white hover:border-orange-500/40 transition-all duration-300 cursor-pointer flex items-start gap-4 hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)]"
              >
                {/* Visual perspective highlight */}
                <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 font-bold flex-shrink-0 border border-orange-500/20">
                  🎟️
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest truncate">
                    {deal.spot?.name || 'Ưu đãi Sinh Viên'}
                  </div>
                  <h4 className="font-bold text-sm text-[#FAFAFA] truncate">{deal.title}</h4>
                  <p className="text-xs text-neutral-400 line-clamp-1">{deal.description}</p>
                </div>
                {deal.discountCode && (
                  <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 py-1.5 px-3 rounded-xl font-mono font-bold text-xs uppercase self-center">
                    {deal.discountCode}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Spots list with staggered reveal animation */}
      <div className="space-y-4">
        <h3 className="font-display font-extrabold text-neutral-200 text-sm sm:text-base uppercase tracking-wider">
          📍 Quán Ngon Giá Hạt Dẻ Khắp Zone FPT
        </h3>

        {filteredSpots.length === 0 ? (
          <div className="p-12 text-center glass-panel border border-white/5 rounded-2xl space-y-3">
            <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto" />
            <h4 className="font-bold text-neutral-300 text-sm">Không tìm thấy địa điểm nào khớp</h4>
            <p className="text-xs text-neutral-500">Hãy thử nhập từ khoá khác hoặc lọc danh mục khác xem sao.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredSpots.map((spot, idx) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.03 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 75, 
                  damping: 14,
                  delay: (idx % 3) * 0.04
                }}
                whileHover={{ y: -8, scale: 1.015 }}
                onClick={() => onSelectSpot(spot)}
                className="glass-panel rounded-2xl border border-white/5 overflow-hidden hover:border-emerald-500/30 shadow-2xl cursor-pointer flex flex-col justify-between group spot-card-transition"
              >
                <div>
                  {/* Category Thumbnail / Illustration */}
                  <div className="h-36 bg-neutral-900 relative overflow-hidden">
                    {/* Clean dark shadow gradient safeguarding text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
                    
                    {spot.menuItems && spot.menuItems.length > 0 && spot.menuItems[0].image ? (
                      <img 
                        src={spot.menuItems[0].image} 
                        alt={spot.name} 
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-emerald-400 duration-[550ms] ease-out group-hover:bg-white/10 group-hover:scale-105">
                        {spot.category === 'food' ? <Utensils className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" /> : spot.category === 'drink' ? <Coffee className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" /> : <ShoppingBag className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />}
                      </div>
                    )}
                    
                    <span className={`absolute top-3 left-3 z-20 py-1 px-2.5 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider ${
                      spot.category === 'food' ? 'bg-orange-500/90' : spot.category === 'drink' ? 'bg-indigo-500/90' : 'bg-pink-500/90'
                    }`}>
                      {spot.category === 'food' ? 'Món Ăn' : spot.category === 'drink' ? 'Nước Uống' : 'Tiện Ích'}
                    </span>

                    {spot.reviews && spot.reviews.length > 0 && (
                      <span className="absolute top-3 right-3 z-20 py-1 px-2.5 rounded-full text-[10px] font-extrabold text-neutral-950 bg-amber-400 flex items-center gap-1 shadow-md font-sans">
                        ⭐ {(spot.reviews.reduce((sum, r) => sum + r.rating, 0) / spot.reviews.length).toFixed(1)}
                      </span>
                    )}

                    {spot.deals && spot.deals.length > 0 && (
                      <span className="absolute bottom-3 right-3 z-20 text-[10px] font-bold bg-amber-500 text-neutral-900 rounded px-2 py-0.5 shadow-sm">
                        ƯU ĐÃI 🔥
                      </span>
                    )}
                  </div>

                  <div className="p-4.5 space-y-2">
                    <h4 className="font-bold text-neutral-100 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-400 transition-colors duration-300">{spot.name}</h4>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed h-8">{spot.description || "Chưa có mô tả chi tiết."}</p>
                    
                    <p className="text-[10px] font-bold text-neutral-500 flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#039BE5]" />
                      <span className="truncate">{spot.address}</span>
                    </p>
                  </div>
                </div>

                <div className="px-4.5 py-3.5 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-400">{spot.priceRange || 'Giá sinh viên'}</span>
                  <div className="flex gap-2">
                    {spot.wifi && (
                      <span className="p-1.5 rounded-lg bg-white/5 text-neutral-400 hover:text-white transition" title="Có Wifi">
                        <Wifi className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {spot.studySpot && (
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400" title="Phù hợp học bối">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
