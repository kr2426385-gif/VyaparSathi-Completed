import React from 'react';

/**
 * 21st.dev / Pinterest Aesthetic Enterprise Analytics Illustration
 * 
 * Recreates the modern, artistic graphic style from Image 2:
 * - Stylized vector characters collaborating over data
 * - Central digital analytics display with pie chart & metric bars
 * - 3D bar chart pillars rising from the ground
 * - Floating 3D pie slices & data cards
 * - Curated VyaparSathi color palette: Deep Navy (#0b2545), Sky Blue (#0284c7), Emerald (#13714C), Golden Amber (#f59e0b)
 */
export default function EnterpriseAnalyticsIllustration({ className = '' }) {
  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}>
      
      {/* Background Soft Organic Curves / Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-12 w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-96 h-64 bg-sky-100/40 rounded-full blur-2xl transform -rotate-12" />
      </div>

      {/* Main Vector Scene SVG */}
      <svg
        viewBox="0 0 700 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[560px] h-auto drop-shadow-sm z-10"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#bfdbfe" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.45" />
          </linearGradient>

          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f8fafc" />
          </linearGradient>

          <linearGradient id="navyPillarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0b2545" />
            <stop offset="50%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <linearGradient id="pillarSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="goldPieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="cyanPieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="bluePieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* 1. Backdrop Organic Wave Shapes (Pinterest aesthetic) */}
        <path
          d="M 180,180 C 260,110 440,90 540,150 C 620,200 640,320 580,390 C 510,470 290,480 190,420 C 110,370 110,240 180,180 Z"
          fill="url(#blobGrad)"
        />
        <circle cx="560" cy="140" r="14" fill="#93c5fd" opacity="0.6" />
        <circle cx="160" cy="170" r="8" fill="#60a5fa" opacity="0.5" />
        <circle cx="610" cy="270" r="6" fill="#3b82f6" opacity="0.4" />

        {/* Floating 3D Pie Chart Slice (Top-Left, matching Image 2) */}
        <g transform="translate(140, 60) rotate(-20) scale(0.9)" className="animate-pulse">
          <ellipse cx="60" cy="45" rx="42" ry="24" fill="#bfdbfe" />
          <path d="M 60,45 L 98,32 A 42,24 0 0,0 22,32 Z" fill="#60a5fa" />
          <path d="M 60,45 L 22,32 A 42,24 0 0,0 60,69 Z" fill="#2563eb" />
          <path d="M 60,45 L 60,69 A 42,24 0 0,0 98,32 Z" fill="#93c5fd" />
          {/* 3D Depth */}
          <path d="M 22,32 L 22,42 A 42,24 0 0,0 60,79 L 60,69 A 42,24 0 0,1 22,32 Z" fill="#1e40af" opacity="0.4" />
        </g>

        {/* 2. Central Analytics Dashboard Screen (Exact match with Image 2) */}
        <g filter="url(#softShadow)">
          {/* Outer Screen Frame */}
          <rect
            x="240"
            y="170"
            width="320"
            height="180"
            rx="20"
            fill="url(#screenGrad)"
            stroke="#cbd5e1"
            strokeWidth="3.5"
          />

          {/* Left Vertical Control Bar */}
          <rect x="240" y="170" width="34" height="180" rx="18" fill="#f1f5f9" />
          <line x1="274" y1="170" x2="274" y2="350" stroke="#e2e8f0" strokeWidth="2" />
          {/* Side control dots */}
          <circle cx="257" cy="195" r="4.5" fill="#94a3b8" />
          <circle cx="257" cy="212" r="4.5" fill="#94a3b8" />
          <circle cx="257" cy="229" r="4.5" fill="#94a3b8" />
          <circle cx="257" cy="246" r="4.5" fill="#94a3b8" />
          <circle cx="257" cy="263" r="4.5" fill="#94a3b8" />

          {/* Large Center 3D Pie Chart inside Screen */}
          <g transform="translate(420, 248)">
            {/* Base Circle */}
            <circle cx="0" cy="0" r="46" fill="#f8fafc" />
            {/* Pie Slice 1: Blue */}
            <path d="M 0,0 L 0,-46 A 46,46 0 0,1 46,0 Z" fill="url(#cyanPieGrad)" />
            {/* Pie Slice 2: Deep Blue */}
            <path d="M 0,0 L 46,0 A 46,46 0 0,1 -23,40 Z" fill="url(#navyPillarGrad)" />
            {/* Pie Slice 3: Sky Blue */}
            <path d="M 0,0 L -23,40 A 46,46 0 0,1 0,-46 Z" fill="url(#bluePieGrad)" />
            {/* Center Donut Hole */}
            <circle cx="0" cy="0" r="14" fill="#ffffff" />
          </g>

          {/* Screen Top-Right Widget / Metric Bars */}
          <rect x="495" y="195" width="48" height="6" rx="3" fill="#cbd5e1" />
          <rect x="495" y="207" width="38" height="5" rx="2.5" fill="#93c5fd" />
          <rect x="495" y="218" width="44" height="5" rx="2.5" fill="#60a5fa" />
          <rect x="495" y="229" width="30" height="5" rx="2.5" fill="#cbd5e1" />

          {/* Screen Left Side Horizontal Metric Bars */}
          <rect x="290" y="195" width="70" height="8" rx="4" fill="#60a5fa" />
          <rect x="290" y="211" width="95" height="7" rx="3.5" fill="#93c5fd" />
          <rect x="290" y="226" width="55" height="7" rx="3.5" fill="#cbd5e1" />
          <rect x="290" y="241" width="80" height="7" rx="3.5" fill="#38bdf8" />

          {/* Bottom Screen Data Panels */}
          <rect x="290" y="295" width="80" height="34" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx="304" cy="312" r="6" fill="#60a5fa" />
          <rect x="316" y="306" width="44" height="5" rx="2.5" fill="#94a3b8" />
          <rect x="316" y="315" width="32" height="4" rx="2" fill="#cbd5e1" />

          <rect x="382" y="295" width="80" height="34" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx="396" cy="312" r="6" fill="#38bdf8" />
          <rect x="408" y="306" width="44" height="5" rx="2.5" fill="#94a3b8" />
          <rect x="408" y="315" width="32" height="4" rx="2" fill="#cbd5e1" />

          <rect x="474" y="295" width="70" height="34" rx="8" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx="488" cy="312" r="6" fill="#f59e0b" />
          <rect x="498" y="306" width="36" height="5" rx="2.5" fill="#94a3b8" />
          <rect x="498" y="315" width="24" height="4" rx="2" fill="#cbd5e1" />
        </g>

        {/* 3. Rising 3D Isometric Bar Chart Columns on Ground (Exact match with Image 2) */}
        <g transform="translate(425, 345)">
          {/* Ground Oval Base Shadow */}
          <ellipse cx="40" cy="72" rx="46" ry="12" fill="#94a3b8" opacity="0.3" />

          {/* Column 1 (Shortest, Left) */}
          <g transform="translate(10, 20)">
            {/* Front Face */}
            <rect x="0" y="10" width="16" height="40" fill="#3b82f6" />
            {/* Right Face */}
            <polygon points="16,10 24,4 24,44 16,50" fill="#1d4ed8" />
            {/* Top Face */}
            <polygon points="0,10 8,4 24,4 16,10" fill="#93c5fd" />
          </g>

          {/* Column 2 (Tallest, Middle) */}
          <g transform="translate(26, -10)">
            {/* Front Face */}
            <rect x="0" y="10" width="18" height="70" fill="#1e40af" />
            {/* Right Face */}
            <polygon points="18,10 26,4 26,74 18,80" fill="#0f172a" />
            {/* Top Face */}
            <polygon points="0,10 8,4 26,4 18,10" fill="#60a5fa" />
          </g>

          {/* Column 3 (Medium, Right) */}
          <g transform="translate(44, 10)">
            {/* Front Face */}
            <rect x="0" y="10" width="16" height="50" fill="#2563eb" />
            {/* Right Face */}
            <polygon points="16,10 24,4 24,54 16,60" fill="#1e3a8a" />
            {/* Top Face */}
            <polygon points="0,10 8,4 24,4 16,10" fill="#bfdbfe" />
          </g>
        </g>

        {/* 4. Left Vector Character (Female Entrepreneur with Report Sheet, Image 2 style) */}
        <g id="character-female" transform="translate(185, 235)">
          {/* Hair */}
          <path d="M 32,20 C 20,20 18,34 18,48 C 18,58 24,62 26,64 L 46,64 C 48,62 54,58 54,48 C 54,34 46,20 32,20 Z" fill="#0f172a" />
          <path d="M 22,34 C 28,38 38,38 44,34 C 44,42 42,50 40,54 L 26,54 C 24,50 22,42 22,34 Z" fill="#fcd34d" />
          
          {/* Face & Neck */}
          <circle cx="34" cy="38" r="10" fill="#fed7aa" />
          <rect x="31" y="46" width="6" height="8" fill="#fdba74" />

          {/* Torso / Blue Top */}
          <path d="M 20,54 C 28,52 40,52 48,54 L 54,124 C 44,128 24,128 14,124 Z" fill="#2563eb" />
          {/* Collar */}
          <polygon points="34,54 28,62 40,62" fill="#fed7aa" />

          {/* Flared Trousers (Wide Pants, Image 2 style) */}
          <path d="M 18,122 L 5,200 L 22,204 L 33,135 L 43,204 L 60,200 L 50,122 Z" fill="#1e40af" />
          {/* Shoes */}
          <ellipse cx="14" cy="204" rx="10" ry="4" fill="#0f172a" />
          <ellipse cx="52" cy="204" rx="10" ry="4" fill="#0f172a" />

          {/* Left Arm holding Report Card */}
          <path d="M 20,60 L -6,104 L 8,110 L 26,72 Z" fill="#2563eb" />

          {/* Character Hand holding Data Report Document Sheet */}
          <g transform="translate(-36, 95)">
            <rect x="0" y="0" width="70" height="52" rx="6" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.5" filter="url(#softShadow)" />
            {/* Header line on report */}
            <circle cx="8" cy="10" r="3" fill="#3b82f6" />
            <rect x="16" y="8" width="40" height="4" rx="2" fill="#cbd5e1" />
            {/* Mini Bar Graph inside Report */}
            <rect x="8" y="24" width="6" height="18" rx="2" fill="#3b82f6" />
            <rect x="18" y="18" width="6" height="24" rx="2" fill="#2563eb" />
            <rect x="28" y="28" width="6" height="14" rx="2" fill="#93c5fd" />
            <rect x="38" y="14" width="6" height="28" rx="2" fill="#1e40af" />
            <rect x="48" y="22" width="6" height="20" rx="2" fill="#60a5fa" />
          </g>

          {/* Right Arm */}
          <path d="M 46,60 L 54,98 L 46,102 L 40,68 Z" fill="#2563eb" />
          <circle cx="53" cy="103" r="5" fill="#fed7aa" />
        </g>

        {/* 5. Right Vector Character (Male Entrepreneur holding display card, Image 2 style) */}
        <g id="character-male" transform="translate(565, 235)">
          {/* Hair */}
          <path d="M 22,22 C 14,22 12,32 12,42 C 12,48 16,52 22,54 L 44,54 C 48,52 50,44 50,38 C 50,26 40,20 22,22 Z" fill="#0f172a" />
          {/* Face */}
          <circle cx="30" cy="38" r="10" fill="#fed7aa" />
          <rect x="27" y="46" width="6" height="8" fill="#fdba74" />

          {/* Torso / Cyan-Blue Shirt */}
          <path d="M 16,54 C 24,52 38,52 46,54 L 48,124 C 38,126 24,126 14,124 Z" fill="#3b82f6" />

          {/* Hands holding dashboard handle */}
          <path d="M 16,62 L -20,86 L -16,94 L 18,72 Z" fill="#3b82f6" />
          <circle cx="-20" cy="88" r="5" fill="#fed7aa" />

          {/* Mini Card being carried */}
          <g transform="translate(-52, 80)">
            <rect x="0" y="0" width="55" height="34" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" filter="url(#softShadow)" />
            <rect x="8" y="9" width="38" height="4" rx="2" fill="#93c5fd" />
            <rect x="8" y="17" width="28" height="4" rx="2" fill="#cbd5e1" />
            <circle cx="42" cy="24" r="4" fill="#3b82f6" />
          </g>

          {/* Trousers */}
          <path d="M 16,124 L 10,198 L 26,200 L 32,135 L 38,200 L 54,198 L 48,124 Z" fill="#1e3a8a" />
          {/* Shoes */}
          <ellipse cx="18" cy="202" rx="9" ry="4" fill="#0f172a" />
          <ellipse cx="46" cy="202" rx="9" ry="4" fill="#0f172a" />
        </g>

        {/* 6. Ground Shadow / Baseline */}
        <line x1="80" y1="440" x2="620" y2="440" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="6 6" />
      </svg>

      {/* Floating VyaparSathi Live Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-xs text-[11px] font-bold text-[#0b2545]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          MSME Financial Advisory
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-xs text-[11px] font-bold text-[#13714C]">
          35% CMEGP Subsidy Grounding
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 shadow-xs text-[11px] font-bold text-amber-700">
          Bank-Grade DPR Reports
        </span>
      </div>

    </div>
  );
}
