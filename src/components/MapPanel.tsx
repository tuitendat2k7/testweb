import React, { useState, useMemo } from 'react';
import { Spot } from '../types.ts';
import { MapPin, Coffee, Utensils, ShoppingBag, Navigation, ZoomIn, ZoomOut, Layers, ExternalLink, HelpCircle, Compass, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapPanelProps {
  spots: Spot[];
  onSelectSpot: (spot: Spot) => void;
}

// Center of FPT University
const FPT_LAT = 10.8415;
const FPT_LNG = 106.8282;

export default function MapPanel({ spots, onSelectSpot }: MapPanelProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Scale multiplier

  // Map coordinates to SVG bounding box
  const mapPoints = useMemo(() => {
    const latMin = 10.835;
    const latMax = 10.850;
    const lngMin = 106.820;
    const lngMax = 106.845;

    return spots.map(s => {
      // Calculate percentage coords (0 to 100)
      const x = ((s.lng - lngMin) / (lngMax - lngMin)) * 100;
      // Latitude is inverted (higher lat is further up, which means lower SVG y coordinate)
      const y = 100 - (((s.lat - latMin) / (latMax - latMin)) * 100);
      return {
        ...s,
        x,
        y
      };
    });
  }, [spots]);

  // FPT Center Coords in SVG
  const fptSvgCoords = useMemo(() => {
    const latMin = 10.835;
    const latMax = 10.850;
    const lngMin = 106.820;
    const lngMax = 106.845;
    const x = ((FPT_LNG - lngMin) / (lngMax - lngMin)) * 100;
    const y = 100 - (((FPT_LAT - latMin) / (latMax - latMin)) * 100);
    return { x, y };
  }, []);

  const filteredPoints = mapPoints.filter(p => activeCategory === 'all' || p.category === activeCategory);

  const handleOpenGoogleMaps = (spot: Spot, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
    window.open(url, '_blank', 'referrerPolicy=no-referrer');
  };

  // Thumbnail selectors for Ken Burns display
  const getSpotThumbnail = (spot: Spot) => {
    if (spot.menuItems && spot.menuItems.length > 0 && spot.menuItems[0].image) {
      return spot.menuItems[0].image;
    }
    if (spot.category === 'food') {
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
    }
    if (spot.category === 'drink') {
      return 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=400';
    }
    return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400';
  };

  return (
    <div className="space-y-6 pb-16 text-white">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-display font-black text-2xl text-[#fafafa] tracking-tight flex items-center gap-2">
          🗺️ Bản Đồ Địa Lý Thực Tế Cóc Map
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 font-medium">
          Hệ thống đồ họa Vector mô tả tọa độ ngõ ngách thực tế, tính toán cự ly tương đối từ Hub hành chính FPT tới các thiên đường dinh dưỡng hạt dẻ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Controls & list selection (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-4.5 rounded-2xl border border-white/5 space-y-3 shadow-xl">
            <h3 className="font-extrabold text-[#fafafa] text-xs sm:text-sm flex items-center gap-2 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Chế độ hiển thị</span>
            </h3>

            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', label: 'Tất Cả Địa Điểm 🍽️' },
                { id: 'food', label: 'Quán Đồ Ăn 🍲' },
                { id: 'drink', label: 'Trà Sữa & Cafe 🥤' },
                { id: 'shopping', label: 'Mua Sắm & VPP ✏️' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSelectedSpot(null);
                  }}
                  className={`w-full text-left font-bold text-xs py-2.5 px-3 rounded-xl border cursor-pointer transition duration-300 ${
                    activeCategory === cat.id 
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.3)]' 
                      : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Spots List representing actual locations */}
          <div className="glass-panel p-4.5 rounded-2xl border border-white/5 space-y-2.5 shadow-xl">
            <h4 className="font-bold text-neutral-500 text-[10px] uppercase tracking-wider">Danh Sách Địa Điểm Tương Thích</h4>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {filteredPoints.length === 0 ? (
                <div className="text-[11px] text-neutral-500 py-4 text-center">Không tìm thấy địa điểm</div>
              ) : (
                filteredPoints.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedSpot(p)}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold block truncate transition-all duration-300 border ${
                      selectedSpot?.id === p.id 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 divide-y-2 pl-4' 
                        : 'bg-transparent text-neutral-400 hover:text-white border-transparent hover:bg-white/5'
                    }`}
                  >
                    {p.category === 'food' ? '🍲 ' : p.category === 'drink' ? '🥤 ' : '✏️ '}
                    {p.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: The interactive geographic vector dashboard (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden h-[460px] relative shadow-2xl">
            
            {/* Map title indicator inside map canvas */}
            <div className="absolute top-4 left-4 z-20 bg-neutral-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-xl flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-wider">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <span>Cóc Vệ Tinh • District 9 Campus Hub</span>
            </div>

            {/* Simulated Vector Grid Map Canvas (Rich Obsidian style) */}
            <div 
              className="w-full h-full bg-[#0a0a0a] select-none relative overflow-hidden transition-all duration-500" 
              style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'center'
              }}
            >
              
              {/* Radial background and route design elements representing streets */}
              <svg className="absolute inset-0 w-full h-full opacity-40 z-0" xmlns="http://www.w3.org/2000/svg">
                {/* Street 1 Le Van Viet */}
                <line x1="20" y1="0" x2="80" y2="100" stroke="#1c1c1e" strokeWidth="24" strokeLinecap="round" />
                <line x1="20" y1="0" x2="80" y2="100" stroke="#2c2c2e" strokeWidth="8" strokeLinecap="round" strokeDasharray="12,12" />
                
                {/* Street 2 Man Thien */}
                <line x1="0" y1="40" x2="100" y2="80" stroke="#1c1c1e" strokeWidth="18" strokeLinecap="round" />
                <line x1="0" y1="40" x2="100" y2="80" stroke="#2c2c2e" strokeWidth="6" strokeLinecap="round" strokeDasharray="10,10" />

                {/* Street 3 High Tech D1 */}
                <line x1="70" y1="0" x2="85" y2="100" stroke="#1c1c1e" strokeWidth="20" strokeLinecap="round" />
                <line x1="70" y1="0" x2="85" y2="100" stroke="#2c2c2e" strokeWidth="6" strokeLinecap="round" strokeDasharray="10,10" />

                {/* Technological digital patterns */}
                <defs>
                  <pattern id="dark-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1"/>
                    <circle cx="0" cy="0" r="1.5" fill="#ffffff" fillOpacity="0.1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dark-grid-pattern)" />
              </svg>

              {/* SVG Link Routes between FPT and selected point (Tactical cyber lines with fast dash offsets) */}
              {selectedSpot && (
                <svg className="absolute inset-0 w-full h-full z-10" style={{ pointerEvents: 'none' }}>
                  {filteredPoints.filter(p => p.id === selectedSpot.id).map(p => (
                    <g key={`route-group-${p.id}`}>
                      {/* Pulse shadow path */}
                      <line
                        x1={`${fptSvgCoords.x}%`}
                        y1={`${fptSvgCoords.y}%`}
                        x2={`${p.x}%`}
                        y2={`${p.y}%`}
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeLinecap="round"
                        opacity="0.25"
                      />
                      {/* Animated dash line */}
                      <motion.line
                        x1={`${fptSvgCoords.x}%`}
                        y1={`${fptSvgCoords.y}%`}
                        x2={`${p.x}%`}
                        y2={`${p.y}%`}
                        stroke="#5eff90"
                        strokeWidth="2.5"
                        strokeDasharray="8,6"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 4 }}
                      />
                    </g>
                  ))}
                </svg>
              )}

              {/* FPT University Hub Pin: Big Bouncing Cyber Core */}
              <div
                className="absolute text-center z-20"
                style={{ left: `${fptSvgCoords.x}%`, top: `${fptSvgCoords.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-11 h-11 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-white border-2 border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
                >
                  🏫
                </motion.div>
                <div className="mt-1.5 bg-black/80 border border-white/10 text-white font-extrabold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded shadow-xl whitespace-nowrap">
                  FPT Camp Core 💚
                </div>
              </div>

              {/* Spot Location pins: Elegant pulsing circles */}
              {filteredPoints.map((p) => {
                const isSelected = selectedSpot?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className="absolute cursor-pointer transition-all duration-300 hover:scale-115"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)', zIndex: isSelected ? 30 : 20 }}
                    onClick={() => setSelectedSpot(p)}
                  >
                    {/* Ring aura around the selected pin */}
                    {isSelected && (
                      <div className="absolute -inset-3 rounded-full border border-[#5eff90]/40 animate-ping" style={{ animationDuration: '2s' }} />
                    )}

                    {/* Pin Bubble representing status indicator */}
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-white border transition-all duration-300 shadow-xl relative ${
                      isSelected 
                        ? 'bg-neutral-900 border-[#5eff90] scale-110 shadow-[0_0_15px_rgba(94,255,144,0.4)]' 
                        : p.category === 'food' 
                          ? 'bg-orange-500 border-white/20 hover:bg-orange-400' 
                          : p.category === 'drink' 
                            ? 'bg-indigo-500 border-white/20 hover:bg-indigo-400' 
                            : 'bg-pink-500 border-white/20 hover:bg-pink-400'
                    }`}>
                      {p.category === 'food' ? (
                        <Utensils className="w-3.5 h-3.5" />
                      ) : p.category === 'drink' ? (
                        <Coffee className="w-3.5 h-3.5" />
                      ) : (
                        <ShoppingBag className="w-3.5 h-3.5" />
                      )}
                      
                      {/* Triangle pointer pin */}
                      <div className={`absolute -bottom-1 left-1/2 -ml-1 w-2.5 h-2.5 rotate-45 border-r border-b ${
                        isSelected 
                          ? 'bg-neutral-900 border-[#5eff90]' 
                          : p.category === 'food' 
                            ? 'bg-orange-500 border-white/10' 
                            : p.category === 'drink' 
                              ? 'bg-indigo-500 border-white/10' 
                              : 'bg-pink-500 border-white/10'
                      }`} />
                    </div>

                    {/* Subtle label hover-reveal */}
                    {isSelected && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-neutral-900 border border-white/15 font-bold text-[9px] text-[#5eff90] uppercase tracking-wider rounded px-2 py-0.5 shadow-2xl whitespace-nowrap z-50">
                        {p.name.split(' ')[0]} • {p.priceRange}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>

            {/* Bounding Zoom controls in dark style */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-2xl">
              <button 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.2))}
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-300 hover:text-white transition cursor-pointer" 
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.7))}
                className="p-2 hover:bg-white/5 rounded-lg text-neutral-300 hover:text-white transition cursor-pointer" 
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Spot Details Popup: Circular mask-scale reveal */}
            <AnimatePresence>
              {selectedSpot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
                  className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-85 bg-[#121212]/95 backdrop-blur-xl p-4.5 rounded-2xl border border-white/10 shadow-2xl z-30"
                >
                  <div className="space-y-3.5">
                    
                    {/* Visual Image Section with Ken Burns Pan & Zoom Animation */}
                    <div className="h-28 rounded-xl overflow-hidden relative border border-white/5 bg-neutral-900">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/45 z-10" />
                      
                      {/* Panoramic Pan/Zoom animation simulating real cameras */}
                      <motion.img 
                        src={getSpotThumbnail(selectedSpot)}
                        alt={selectedSpot.name}
                        className="w-full h-full object-cover origin-center"
                        animate={{ 
                          scale: [1, 1.12, 1.05, 1],
                          x: [0, 5, -5, 0],
                          y: [0, -3, 3, 0]
                        }}
                        transition={{ 
                          duration: 20, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      />
                      
                      <span className={`absolute top-2.5 left-2.5 z-20 py-0.5 px-2 rounded-md font-extrabold text-[8px] uppercase tracking-widest text-white ${
                        selectedSpot.category === 'food' ? 'bg-orange-500/90' : selectedSpot.category === 'drink' ? 'bg-indigo-500/90' : 'bg-pink-500/90'
                      }`}>
                        {selectedSpot.category === 'food' ? 'Đồ Ăn' : selectedSpot.category === 'drink' ? 'Nước Uống' : 'Mua sắm'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-display font-black text-[#fafafa] text-sm leading-tight">{selectedSpot.name}</h4>
                        <button 
                          onClick={() => setSelectedSpot(null)}
                          className="text-neutral-500 hover:text-white text-xs font-semibold px-1 rounded hover:bg-white/5 transition-all duration-200 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">{selectedSpot.description || "Chưa có mô tả chi tiết."}</p>
                    </div>
                    
                    <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-1 text-[10px] font-bold text-neutral-400">
                      <p className="truncate">📍 {selectedSpot.address}</p>
                      <p className="text-emerald-400">💳 Khung giá: {selectedSpot.priceRange}</p>
                    </div>

                    <div className="flex gap-2.5 pt-1.5">
                      <button
                        onClick={() => onSelectSpot(selectedSpot)}
                        className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-black rounded-xl transition duration-300 cursor-pointer shadow-md hover:scale-102 active:scale-95"
                      >
                        Thực đơn & Săn Deal 🍛
                      </button>
                      
                      {/* Metallic Dẫn Đường button with automatic 3D rotation Compass spinner directed to North */}
                      <button
                        onClick={(e) => handleOpenGoogleMaps(selectedSpot, e)}
                        className="py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition duration-300 border border-emerald-500/20 shadow-[0_3px_10px_rgba(16,185,129,0.2)] hover:scale-102 active:scale-95 group/btn cursor-pointer"
                        title="Mở chỉ đường Google Maps khứ hồi"
                      >
                        {/* Auto-rotating magnetic compass targeting North */}
                        <motion.div
                          initial={{ rotate: 180 }}
                          animate={{ rotate: [180, -35, 0] }}
                          transition={{ type: "spring", stiffness: 90, damping: 10, delay: 0.15 }}
                          className="text-white group-hover/btn:animate-spin"
                          style={{ animationDuration: '4s' }}
                        >
                          <Compass className="w-4 h-4 text-[#5eff90]" />
                        </motion.div>
                        <span>Dẫn Đường</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* User Guide tip banner */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3 text-xs leading-relaxed text-neutral-400 relative overflow-hidden">
            <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[#fafafa] mb-0.5 uppercase tracking-wider text-[10px]">Cơ chế Định Vị Dẫn Đường</p>
              <span>Nhấp chọn biểu tượng trên bản đồ. Tuyến đường vector biểu diễn bằng dòng photon sẽ xuất hiện. Nhấp vào nút <strong className="text-emerald-400">Dẫn Đường</strong>, la bàn sẽ tự động đồng bộ hóa để định vị tuyến đi thực tế trực tuyến từ Google Maps.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
