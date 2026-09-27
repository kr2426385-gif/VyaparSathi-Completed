import React, { useEffect, useRef } from 'react';

/**
 * InteractiveDotMatrixBackground
 *
 * Professional Gemini-inspired, theme-based interactive dot matrix background.
 * Designed specifically for Market, Finance, Schemes, and Support workflows.
 *
 * Visual & Interactive Specifications:
 * 1. Edge-to-Edge Full-Page Grid (Left to right, top to bottom, fixed behind page content).
 * 2. Solid, High-Precision Circular Dots (NO hollow donut rings, NO target reticles).
 * 3. Controlled, Subtle Halftone Lens (Resting: ~1.25px, Hover peak: ~3.2px, never bloated).
 * 4. VyaparSathi & Gemini Thematic Color Palette:
 *    - Resting: Subtle, crisp slate-navy tone (transparent, non-intrusive for reading text).
 *    - Hover/Active: Rich azure sapphire (#2563eb) and radiant cyan (#0284c7) with warm amber (#f59e0b) harmonic accents.
 *    - Soft, diffused aura (never harsh or blinding).
 * 5. Full-Screen Ambient Fluid Wave:
 *    - Gentle multi-frequency breathing undulation traversing from top-left to bottom-right across the entire page.
 * 6. Responsive Click/Tap Shockwave:
 *    - Subtle expanding wavefront that gently illuminates dots along its path.
 * 7. 60fps GPU performance, High-DPI canvas scaling, pointer-events-none.
 */
export default function InteractiveDotMatrixBackground({ isHighContrast = false, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let time = 0;
    let isVisible = true;

    // Fluid mouse pointer tracking with physics lerping
    const mouse = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      active: false
    };

    // Active click/tap ripples
    const ripples = [];

    // Pointer move listener
    const handlePointerMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      if (mouse.x < -1000) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.targetX = -2000;
      mouse.targetY = -2000;
    };

    // Click/tap shockwave trigger
    const handlePointerDown = (e) => {
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

      if (clientX && clientY) {
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 0,
          maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.6,
          speed: 8,
          intensity: 1.0
        });

        if (ripples.length > 4) {
          ripples.shift();
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // Handle high-DPI scaling & full window resize
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.max(100, Math.floor(width * dpr));
      canvas.height = Math.max(100, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Animation Loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      const now = performance.now() * 0.001; // Real-world time in seconds
      time += 0.016;

      // 2-Second Periodic Ambient Lighting Sweep & Breathing Cycle
      // Sweeps across the entire page from top-left to bottom-right every 2.0 seconds
      const cycle2s = 2.0; // Exact 2.0 second cycle
      const wavePhase2s = (now / cycle2s) % 1.0;
      const globalPulse2s = (Math.sin((now * 2 * Math.PI) / cycle2s) + 1) * 0.5; // 0 to 1 gentle 2s breath

      // Smooth fluid mouse cursor interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;

      // Update active ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.radius += ripple.speed;
        ripple.intensity = Math.max(0, 1 - (ripple.radius / ripple.maxRadius));
        if (ripple.radius >= ripple.maxRadius || ripple.intensity <= 0.01) {
          ripples.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Grid parameters (Large, softly blurred Gemini & Pinterest aesthetic)
      const dotSpacing = 44; // Generous, breathable spacing for larger, aesthetic dots
      const baseRadius = 4.0; // Noticeably larger, handsome resting dot (Gemini & Pinterest style)
      const maxInteractiveRadius = 8.2; // Large, soft glowing orb expansion
      const interactionDistance = 190; // Broad, fluid proximity field

      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      for (let r = 0; r < rows; r++) {
        const y = r * dotSpacing;

        for (let c = 0; c < cols; c++) {
          const x = c * dotSpacing;

          // 1. Distance to cursor
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          // 2. Smooth Halftone Lens Proximity (User Cursor)
          let proximityFactor = 0;
          if (mouse.active && distToMouse < interactionDistance) {
            const norm = 1 - (distToMouse / interactionDistance);
            proximityFactor = norm * norm * (3 - 2 * norm); // Smooth cubic ease
          }

          // 3. 2-Second Dim Lighting Wave sweeping all over the page
          const normCoord = (x / Math.max(1, width) + y / Math.max(1, height)) * 0.5;
          let distTo2sWave = Math.abs(normCoord - wavePhase2s);
          if (distTo2sWave > 0.5) distTo2sWave = 1.0 - distTo2sWave;

          const beamWidth = 0.28; // Generous width of the 2-second light beam
          let wave2sLight = 0;
          if (distTo2sWave < beamWidth) {
            const beamNorm = 1 - (distTo2sWave / beamWidth);
            wave2sLight = beamNorm * beamNorm * (3 - 2 * beamNorm);
          }

          // Combined ambient 2s lighting factor
          const ambient2sActivity = Math.max(wave2sLight * 0.88, globalPulse2s * 0.22);

          // 4. Click Shockwave Influence
          let rippleBoost = 0;
          for (let i = 0; i < ripples.length; i++) {
            const rip = ripples[i];
            const rx = x - rip.x;
            const ry = y - rip.y;
            const rDist = Math.sqrt(rx * rx + ry * ry);
            const deltaR = Math.abs(rDist - rip.radius);
            const ringThickness = 70;

            if (deltaR < ringThickness) {
              const ringProximity = 1 - (deltaR / ringThickness);
              const ringStrength = ringProximity * ringProximity * rip.intensity;
              if (ringStrength > rippleBoost) {
                rippleBoost = ringStrength;
              }
            }
          }

          // Total activity score combining cursor + 2s lighting sweep + ripples
          const totalActivity = Math.min(1.0, proximityFactor + (rippleBoost * 0.7) + (ambient2sActivity * 0.75));

          // Dot radius calculation (Large, smooth expansion up to 8.2px)
          const dotRadius = baseRadius + (totalActivity * (maxInteractiveRadius - baseRadius));

          // Alternating pattern between curated shades of Light Green and Navy Blue
          const isGreen = ((c * 2 + r * 3) % 4) === 0 || ((c + r) % 3 === 0);
          const isNavyVariant = ((c * 3 + r) % 2 === 0);

          let fillStyle;
          let blurAmount;

          if (totalActivity > 0.05) {
            // Active State: Soft, glowing light green & navy blue orbs
            const activeAlpha = isHighContrast
              ? Math.min(0.72, 0.28 + totalActivity * 0.44)
              : Math.min(0.56, 0.20 + totalActivity * 0.36);

            if (isGreen) {
              // Light Green shades (Fresh Emerald Sage & Mint)
              fillStyle = ((c + r) % 2 === 0)
                ? `rgba(16, 185, 129, ${activeAlpha})`
                : `rgba(52, 211, 153, ${activeAlpha * 0.95})`;
            } else {
              // Navy Blue shades (Deep Executive Navy & Midnight Sapphire)
              fillStyle = isNavyVariant
                ? `rgba(14, 43, 79, ${activeAlpha * 1.05})`
                : `rgba(30, 64, 145, ${activeAlpha})`;
            }

            // Dreamy blur matching dot's own color (Gemini/Pinterest blur orb effect)
            blurAmount = 8.0 + totalActivity * 6.0;
          } else {
            // Resting State: Gentle, larger, softly blurred light green and navy dots
            const baseAlpha = isHighContrast ? 0.16 : 0.10;

            if (isGreen) {
              fillStyle = `rgba(16, 149, 100, ${baseAlpha * 1.15})`;
            } else {
              fillStyle = `rgba(14, 43, 79, ${baseAlpha})`;
            }

            // Soft-focus blur on resting dots
            blurAmount = 6.0;
          }

          // Draw large solid dot with soft blur in the EXACT SAME color
          ctx.save();
          ctx.shadowBlur = blurAmount;
          ctx.shadowColor = fillStyle; // Dreamy blur halo matches dot color identically
          ctx.fillStyle = fillStyle;
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHighContrast]);

  return (
    <div 
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`} 
      aria-hidden="true"
    >
      {/* Dim, organic ambient mesh gradient in soft sage green and deep navy mist */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 15% 15%, rgba(187, 247, 208, 0.35) 0%, transparent 60%), radial-gradient(ellipse at 85% 85%, rgba(219, 234, 254, 0.40) 0%, transparent 60%)'
        }}
      />
      
      {/* Full-bleed 2D dot matrix canvas with dreamy soft lens blur */}
      <canvas
        ref={canvasRef}
        className="relative w-full h-full block"
        style={{ filter: 'blur(0.75px)', willChange: 'transform' }}
      />
    </div>
  );
}
