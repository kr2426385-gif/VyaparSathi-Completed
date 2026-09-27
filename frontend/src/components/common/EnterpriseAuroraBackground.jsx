import React from 'react';

/**
 * EnterpriseBackground
 * 
 * Clean, trustworthy, institutional background for VyaparSathi.
 * Philosophy: Government support portal + modern rural business platform.
 * - Non-distracting, zero CPU/GPU overhead (no requestAnimationFrame or mouse tracking).
 * - Subtle neutral background with soft, stable color grading (Deep Navy #0A2342, Warm Amber, Soft Slate).
 * - High contrast and accessibility compliant.
 * - Strictly pointer-events-none, never interferes with text or interactive elements.
 */
export default function EnterpriseAuroraBackground({ isHighContrast = false, className = '' }) {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#f8fafc] ${className}`} 
      aria-hidden="true"
    >
      {/* 1. Subtle, Calm Neutral Color Gradients (Static, zero animation) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft Institutional Navy Tint (Top Left) */}
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 mix-blend-multiply"
          style={{
            background: isHighContrast 
              ? 'radial-gradient(circle, rgba(10, 35, 66, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(10, 35, 66, 0.05) 0%, rgba(30, 58, 95, 0.02) 60%, transparent 70%)'
          }}
        />

        {/* Soft Natural Warm Amber Tint (Top Right / Center) */}
        <div 
          className="absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full blur-[140px] opacity-35 mix-blend-multiply"
          style={{
            background: isHighContrast
              ? 'radial-gradient(circle, rgba(217, 119, 6, 0.07) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(217, 119, 6, 0.04) 0%, rgba(245, 158, 11, 0.02) 60%, transparent 70%)'
          }}
        />

        {/* Soft Grounding Slate/Green Tint (Bottom Left) */}
        <div 
          className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full blur-[150px] opacity-30 mix-blend-multiply"
          style={{
            background: isHighContrast
              ? 'radial-gradient(circle, rgba(5, 150, 105, 0.06) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(5, 150, 105, 0.03) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* 2. Static Architectural Contour Lines (Quiet, dignified watermark) */}
      <div className="absolute inset-0 opacity-[0.035]">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 1440 900" 
          fill="none" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-100 240 C 320 160, 680 340, 1100 210 C 1320 140, 1500 260, 1600 280"
            stroke="#0a2342"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M-100 480 C 280 540, 720 360, 1140 480 C 1380 540, 1520 440, 1600 460"
            stroke="#0a2342"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M-100 720 C 360 640, 800 800, 1200 680 C 1420 620, 1540 720, 1600 740"
            stroke="#0a2342"
            strokeWidth="1"
            strokeDasharray="4 6"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
