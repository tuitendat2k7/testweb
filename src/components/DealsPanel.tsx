import React, { useState } from 'react';
import { Spot, Deal } from '../types.ts';
import { Search, Compass, AlertCircle, Wifi, GraduationCap, Copy, Check, Filter, Tag, Info, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DealsPanelProps {
  spots: Spot[];
  deals: Deal[];
  onSelectSpot: (spot: Spot) => void;
}

// Coordinate of FPT University
const FPT_COORDS = { lat: 10.8415, lng: 106.8282 };

// Calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // earth radius (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function DealsPanel({ spots, deals, onSelectSpot }: DealsPanelProps) {
  const [maxPrice, setMaxPrice] = useState<number>(100000); // Default 100k
  const [maxDistance, setMaxDistance] = useState<number>(7); // Default 7km
  const [filterWifi, setFilterWifi] = useState(false);
  const [filterStudy, setFilterStudy] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Pre-process deals and map their distances & pricing
  const filteredDeals = deals.map(deal => {
    const spot = spots.find(s => s.id === deal.spotId);
    let distance = 0;
    if (spot) {
      distance = calculateDistance(FPT_COORDS.lat, FPT_COORDS.lng, spot.lat, spot.lng);
    }
    return {
      ...deal,
      spot,
      distance
    };
  }).filter(item => {
    if (!item.spot) return false;

    // Filter distance (e.g. max distance)
    if (item.distance > maxDistance) return false;

    // Filter properties
    if (filterWifi && !item.spot.wifi) return false;
    if (filterStudy && !item.spot.studySpot) return false;

    // Parse pricing for average limit
    let approximatePrice = 35000;
    if (item.spot.priceRange) {
      const match = item.spot.priceRange.match(/(\d+)/);
      if (match) {
        approximatePrice = parseInt(match[1], 10) * 1000;
      }
    }
    if (approximatePrice > maxPrice) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-16 text-white">
      
      {/* Intro section */}
      <div className="space-y-1">
        <h2 className="font-display font-black text-2xl text-[#fafafa] tracking-tight flex items-center gap-2">
          🎟️ Săn Deals Sinh Viên Cóc Vô Địch
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium">
          Hệ thống tổng hợp các mã giảm giá, voucher độc quyền và các combo hỗ trợ bữa ăn tiết kiệm xung quanh trường.
        </p>
      </div>

      {/* Advanced Filter Layout Card with Neomorphism & Jade track style */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-neutral-200 font-bold text-xs uppercase tracking-wider border-b border-white/5 pb-2">
          <Filter className="w-4 h-4 text-[#5eff90]" />
          <span>Thông Số Săn Deal (Tọa độ Hub Đại học FPT)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          
          {/* Slider 1: Max Price Limit with fluid green track */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-400">Ngân sách tối đa:</span>
              <span className="font-black text-[#5eff90]">{maxPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="relative w-full flex items-center">
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#5eff90] shadow-[0_0_8px_rgba(94,255,144,0.7)] pointer-events-none rounded-full"
                style={{ width: `${((maxPrice - 20000) / (150000 - 20000)) * 100}%` }}
              />
              <input 
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 select-none outline-none focus:outline-none"
              />
            </div>
            <div className="flex justify-between text-[9px] text-neutral-500 font-bold">
              <span>20k</span>
              <span>85k</span>
              <span>150k</span>
            </div>
          </div>

          {/* Slider 2: Max Distance Limit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-neutral-400">Bán kính di chuyển từ FPT:</span>
              <span className="font-black text-[#039BE5]">{maxDistance} km</span>
            </div>
            <div className="relative w-full flex items-center">
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#039BE5] shadow-[0_0_8px_rgba(3,155,229,0.7)] pointer-events-none rounded-full"
                style={{ width: `${((maxDistance - 1) / (10 - 1)) * 100}%` }}
              />
              <input 
                type="range"
                min="1"
                max="10"
                step="1"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-sky-400 select-none outline-none focus:outline-none"
              />
            </div>
            <div className="flex justify-between text-[9px] text-neutral-500 font-bold">
              <span>1 km</span>
              <span>5 km</span>
              <span>10 km</span>
            </div>
          </div>

          {/* Custom Feature Switches: Wifi */}
          <div className="flex items-center justify-between md:justify-center gap-4 py-2">
            <label className="text-xs font-bold text-neutral-300 flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={filterWifi}
                onChange={(e) => setFilterWifi(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 accent-[#5eff90] cursor-pointer"
              />
              <Wifi className="w-3.5 h-3.5 text-neutral-400" />
              <span>Có Wifi</span>
            </label>

            <label className="text-xs font-bold text-neutral-300 flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={filterStudy}
                onChange={(e) => setFilterStudy(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 accent-[#5eff90] cursor-pointer"
              />
              <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
              <span>Chỗ tự học</span>
            </label>
          </div>

          {/* Statistics summary */}
          <div className="bg-black/30 border border-white/5 p-3 rounded-xl flex items-center justify-center text-center">
            <div>
              <div className="text-xl font-display font-black text-[#5eff90]">{filteredDeals.length}</div>
              <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Deal trùng khớp</div>
            </div>
          </div>

        </div>
      </div>

      {/* Deals list layout (TICKET UI with elegant 3D perspective shift on hover) */}
      {filteredDeals.length === 0 ? (
        <div className="p-12 text-center glass-panel border border-white/5 rounded-2xl space-y-3">
          <AlertCircle className="w-10 h-10 text-neutral-500 mx-auto" />
          <h4 className="font-bold text-neutral-300 text-sm">Không tìm thấy deal nào khớp điều kiện</h4>
          <p className="text-xs text-neutral-500">Hãy thử nới rộng khoảng ngân sách hoặc tăng nấc khoảng cách km xem sao.</p>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredDeals.map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ 
                rotateY: 2.5, 
                rotateX: -2.5, 
                scale: 1.025,
                boxShadow: "0 10px 30px rgba(0, 200, 83, 0.12)"
              }}
              transition={{ type: "spring", stiffness: 110, damping: 13 }}
              style={{ transformStyle: "preserve-3d", perspective: 600 }}
              onClick={() => item.spot && onSelectSpot(item.spot)}
              className="glass-panel rounded-2xl border border-white/5 hover:border-emerald-500/30 transition cursor-pointer flex overflow-hidden relative shadow-2xl group"
            >
              
              {/* Ticket left part */}
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-orange-500/10 text-orange-400 font-extrabold border border-orange-500/20 rounded text-[9px] uppercase tracking-wider">
                    STUDENT ONLY 🎟️
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#039BE5]" />
                    Cự ly: {item.distance.toFixed(1)} km
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <h3 className="font-display font-black text-sm sm:text-base text-neutral-100 leading-tight group-hover:text-[#5eff90] transition duration-300">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-[#5eff90]">
                  📍 Địa bàn: <span className="underline decoration-dashed decoration-emerald-500">{item.spot?.name}</span>
                </div>
              </div>

              {/* Ticket divider dashed line representing physically tearing ticket coupons */}
              <div className="w-px border-l-2 border-dashed border-white/10 relative h-full flex flex-col justify-between">
                <div className="absolute -top-3.5 -left-2 w-4 h-4 bg-[#080808] rounded-full border border-white/5" />
                <div className="absolute -bottom-3.5 -left-2 w-4 h-4 bg-[#080808] rounded-full border border-white/5" />
              </div>

              {/* Ticket right part (Promo code) with Neomorphic press aesthetics */}
              <div className="w-36 bg-white/5 p-4 flex flex-col items-center justify-center text-center space-y-3 flex-shrink-0">
                <div className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                  <Gift className="w-3 h-3 text-emerald-400" />
                  <span>MÃ ƯU ĐÃI</span>
                </div>
                {item.discountCode ? (
                  <button
                    onClick={(e) => handleCopyCode(item.discountCode!, e)}
                    className="py-2 px-2.5 w-full bg-white text-black hover:bg-neutral-100 text-neutral-900 font-mono font-black text-xs rounded-xl flex items-center justify-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                  >
                    {copiedCode === item.discountCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="truncate">{copiedCode === item.discountCode ? 'Done' : item.discountCode}</span>
                  </button>
                ) : (
                  <div className="text-xs font-black text-neutral-300 py-1.5 px-3 bg-white/5 rounded-xl border border-white/5">Giảm Thẳng</div>
                )}
                
                <span className="text-[8px] text-neutral-500 font-bold block">Hạn: {item.expiryDate || 'Vô thời hạn'}</span>
              </div>

            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
}
