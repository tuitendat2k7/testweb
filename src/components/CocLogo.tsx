import React from 'react';

interface CocLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
}

export default function CocLogo({ className = '', size = 'md', showText = false }: CocLogoProps) {
  const dimensions = {
    sm: 'w-8 h-8 sm:w-10 sm:h-10',
    md: 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16', // responsive scaled default size
    lg: 'w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24', // premium scaled variant
    xl: 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32',
    '2xl': 'w-28 h-28 sm:w-40 sm:h-40',
    '3xl': 'w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimensions[size]} select-none transition-all duration-300 transform hover:scale-105 filter drop-shadow-[0_4px_16px_rgba(255,112,67,0.2)]`}
      >
        {/* Glow Aura - Subtle modern backdrop */}
        <circle cx="60" cy="50" r="45" fill="url(#brandGlow)" opacity="0.15" />

        {/* --- BRAND ORIGINAL ORANGE FRAME RING --- */}
        <circle cx="60" cy="48" r="42" stroke="#FF5722" strokeWidth="2.2" fill="none" opacity="0.9" />

        {/* --- FROG CHARACTER (CÓC) --- */}
        <g id="frog-character">
          {/* Eyes background bumps (cóc mắt lồi) */}
          <circle cx="45" cy="30" r="13.5" fill="#FF7043" stroke="#D84315" strokeWidth="1.8" />
          <circle cx="75" cy="30" r="13.5" fill="#FF7043" stroke="#D84315" strokeWidth="1.8" />

          {/* Head Base */}
          <ellipse cx="60" cy="48" rx="28" ry="22.5" fill="#FF7043" stroke="#D84315" strokeWidth="1.8" />

          {/* Eyeballs */}
          {/* Left Eye: Wide open and cute */}
          <circle cx="45" cy="29" r="9" fill="#FFFFFF" stroke="#3E2723" strokeWidth="1.2" />
          <circle cx="46" cy="29" r="5.5" fill="#1C110C" />
          <circle cx="44.2" cy="27" r="2.2" fill="#FFFFFF" /> {/* Reflection 1 */}
          <circle cx="48" cy="31.2" r="0.9" fill="#FFFFFF" /> {/* Reflection 2 */}

          {/* Right Eye: Cute playful wink */}
          <circle cx="75" cy="29" r="9" fill="#FFFFFF" stroke="#3E2723" strokeWidth="1.2" />
          {/* Happy closed wink path */}
          <path d="M69 31 C72 25.5 78 25.5 81 31" stroke="#1C110C" strokeWidth="2.8" strokeLinecap="round" fill="none" />

          {/* Cute Cream Chest Bib Area under chin */}
          <path d="M 44,54 C 44,66 76,66 76,54 C 71,49.5 49,49.5 44,54 Z" fill="#FFF8E1" stroke="#FF7043" strokeWidth="1" />

          {/* Cute pink blushes */}
          <ellipse cx="38" cy="52" rx="4.5" ry="3" fill="#FF8A65" opacity="0.85" />
          <ellipse cx="82" cy="52" rx="4.5" ry="3" fill="#FF8A65" opacity="0.85" />

          {/* Smiley open mouth with red tongue interior */}
          <path d="M49 48 Q60 61 71 48" fill="#3D1505" stroke="#3E2723" strokeWidth="1.8" strokeLinecap="round" />
          {/* Tongue */}
          <path d="M54 54 Q60 60 66 54 C66 54 62.5 58.5 60 58.5 C57.5 58.5 54 54 54 54 Z" fill="#FF5252" />

          {/* Left hand holding the wooden spoon */}
          <g id="left-hand">
            {/* Spoon base: Brown wooden model */}
            <path d="M 30 60 L 21 41" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="18" cy="37" rx="4" ry="5.5" transform="rotate(-25 18 37)" fill="#A1887F" stroke="#5D4037" strokeWidth="1.2" />
            <path d="M 17 35 Q 15 33 18 31 Q 21 33 19 37" fill="#D7CCC8" opacity="0.3" />

            {/* Orange hand holding */}
            <circle cx="30" cy="62" r="6" fill="#FF7043" stroke="#D84315" strokeWidth="1.5" />
          </g>

          {/* Right hand resting on the map fold */}
          <g id="right-hand">
            <circle cx="91" cy="62" r="6" fill="#FF7043" stroke="#D84315" strokeWidth="1.5" />
            <circle cx="87" cy="64" r="2" fill="#FF7043" />
          </g>
        </g>

        {/* --- 3D FOLDED MAP SUB-STAGE --- */}
        <g id="folded-map" transform="translate(0, 14)">
          {/* Left panel */}
          <polygon points="20,65 48,58 48,84 20,91" fill="#81C784" stroke="#2E7D32" strokeWidth="1.6" />
          {/* Left panel map roads */}
          <path d="M23 75 L45 70" stroke="#FFF9C4" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />

          {/* Middle panel */}
          <polygon points="48,58 76,52 76,78 48,84" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="1.6" />
          {/* Middle panel map roads */}
          <path d="M48 70 Q60 62 76 66" stroke="#FFF9C4" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M55 80 L65 55" stroke="#FFF9C4" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

          {/* Right panel */}
          <polygon points="76,52 102,57 102,83 76,78" fill="#66BB6A" stroke="#2E7D32" strokeWidth="1.6" />
          {/* Right panel map roads */}
          <path d="M79 66 L97 72" stroke="#FFF9C4" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />

          {/* --- MAP INTEGRATED BADGES / CIRCLES (Cutlery, burger, drink icons from original image) --- */}
          {/* Left circle: Cutlery/Fork & Spoon (Red circle) */}
          <g transform="translate(34, 73)">
            <circle cx="0" cy="0" r="5" fill="#E53935" stroke="#B71C1C" strokeWidth="0.8" />
            {/* Spoon & Fork cross */}
            <path d="M-2 -2 L2 2" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M2 -2 L-2 2" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
          </g>

          {/* Center-Left circle: Burger/Snacks (Green Circle) */}
          <g transform="translate(56, 62)">
            <circle cx="0" cy="0" r="5.5" fill="#4CAF50" stroke="#1B5E20" strokeWidth="0.8" />
            {/* Burger buns representation */}
            <path d="M-2.5 -1 C-2.5 -2.5 2.5 -2.5 2.5 -1 Z" fill="#FFFFFF" />
            <line x1="-2.2" y1="0.5" x2="2.2" y2="0.5" stroke="#FFD54F" strokeWidth="0.8" />
            <path d="M-2.5 1.5 Q0 2.5 2.5 1.5" stroke="#FFFFFF" strokeWidth="0.8" fill="none" />
          </g>

          {/* Right circle: Drink/Boba tea (Orange Circle) */}
          <g transform="translate(87, 68)">
            <circle cx="0" cy="0" r="5" fill="#FFB300" stroke="#FF6F00" strokeWidth="0.8" />
            {/* Cute beverage cup outline */}
            <path d="M-1.5 -1.5 L1.5 -1.5 L1 2 L-1 2 Z" fill="#FFFFFF" />
            <line x1="0.5" y1="-2.5" x2="-0.5" y2="0.5" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
          </g>

          {/* --- CRITICAL ELEMENT: Dropped outstanding Location Pin --- */}
          <g id="main-map-pin" transform="translate(71, 56)">
            {/* Drop shadow of the pin */}
            <ellipse cx="0" cy="6" rx="3.5" ry="1.5" fill="#1B5E20" opacity="0.45" />
            {/* Pin Body */}
            <path 
              d="M0 6 C-4.5 1.5 -8 -2.5 -8 -7 C-8 -11.5 -4.5 -15 0 -15 C4.5 -15 8 -11.5 8 -7 C8 -2.5 4.5 1.5 0 6 Z" 
              fill="url(#pinGrad)" 
              stroke="#D84315" 
              strokeWidth="1.2" 
            />
            {/* White glossy center dot */}
            <circle cx="0" cy="-7" r="2.8" fill="#FFFFFF" />
            {/* Small red inner glowing core */}
            <circle cx="0" cy="-7" r="1.2" fill="#D84315" />
          </g>
        </g>

        {/* Dynamic Definitions */}
        <defs>
          <radialGradient id="brandGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF7043" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#81C784" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pinGrad" x1="0" y1="-15" x2="0" y2="6">
            <stop offset="0%" stopColor="#FF1744" />
            <stop offset="100%" stopColor="#D50000" />
          </linearGradient>
        </defs>
      </svg>

      {/* --- BRAND NAME & SUBTITLE INTEGRATION (From the uploaded image) --- */}
      {showText && (
        <div className="mt-2 text-center select-none flex flex-col items-center">
          <div className="relative flex items-center justify-center font-display font-black text-2xl tracking-wide gap-1 text-[#FF5722] leading-tight">
            <span>C</span>
            {/* The "Ó" with the cute tangerine stem leaf from reference */}
            <span className="relative inline-flex items-center justify-center">
              Ó
              <span className="absolute -top-1 right-[-2px] w-2.5 h-1.5 bg-[#4CAF50] rounded-tl-full rounded-br-full rotate-[-20deg]" />
            </span>
            <span>C</span>
            {/* Mini cute footprint under/beside text */}
            <span className="text-[10px] absolute -bottom-1 -right-4 rotate-[15deg]">🐾</span>
          </div>
          <div className="text-[9px] uppercase tracking-[0.25em] font-mono font-black text-[#4CAF50] mt-0.5">
            food map
          </div>
        </div>
      )}
    </div>
  );
}
