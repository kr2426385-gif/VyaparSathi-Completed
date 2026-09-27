import React, { useEffect, useRef } from 'react';

/**
 * AgriGridAnimationCanvas
 * Elegant Full-Page Agricultural & FoodTech Dot-Matrix Background Canvas
 *
 * Characteristics:
 * - Runs from top to bottom footer fixed behind the page content
 * - Small, delicate, refined dots (resting: ~1.0px, max cursor swell: ~2.2px)
 * - Zero glitter, no floating motes/particles (clean professional MSME aesthetic)
 * - Harmonious with the warm stone (#fbfbf9) and navy (#0b2545) enterprise design system
 * - Gentle diagonal wave resembling breeze through fields
 * - Interactive cursor ripple with subtle harvest amber & sprout emerald highlights
 * - High-DPI support, lightweight rendering, battery-friendly
 */
export default function AgriGridAnimationCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;
    let time = 0;

    // Mouse tracking across full window
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.active = false;
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

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
    window.addEventListener('resize', resizeCanvas);

    // Animation Loop
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      time += 0.016;

      // Smooth cursor interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      ctx.clearRect(0, 0, width, height);

      // Dot matrix grid parameters
      const dotSpacing = 28; // Clean, breathable spacing
      const baseRadius = 0.95; // Small, refined dot radius
      const maxInteractiveRadius = 2.2; // Subtle peak radius near cursor
      const interactionDistance = 120; // Range of cursor reaction

      const cols = Math.ceil(width / dotSpacing) + 1;
      const rows = Math.ceil(height / dotSpacing) + 1;

      const waveSpeed = time * 1.2;

      for (let r = 0; r < rows; r++) {
        const y = r * dotSpacing;

        for (let c = 0; c < cols; c++) {
          const x = c * dotSpacing;

          // Distance to mouse
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const distToMouse = Math.sqrt(dx * dx + dy * dy);

          // Gentle crop-wind wave (subtle undulating rhythm)
          const wavePhase = Math.sin((x * 0.012) + (y * 0.010) - waveSpeed);
          const ambientScale = (wavePhase + 1) * 0.5; // 0 to 1

          let dotRadius = baseRadius + (ambientScale * 0.35);
          let alpha = 0.08 + (ambientScale * 0.05); // Very soft base visibility
          let fillStyle = `rgba(15, 23, 42, ${alpha})`; // Soft warm slate

          // Cursor interactive influence
          if (mouse.active && distToMouse < interactionDistance) {
            const proximity = 1 - (distToMouse / interactionDistance);
            const smoothProximity = Math.pow(proximity, 1.6);

            dotRadius = baseRadius + (maxInteractiveRadius - baseRadius) * smoothProximity;
            const activeAlpha = Math.min(0.45, alpha + smoothProximity * 0.35);

            // Subtle agriculture/foodtech tints on hover: amber harvest & emerald sprout
            if ((c + r) % 2 === 0) {
              fillStyle = `rgba(217, 119, 6, ${activeAlpha})`; // Warm amber
            } else {
              fillStyle = `rgba(16, 185, 129, ${activeAlpha})`; // Sprout emerald
            }
          } else if (ambientScale > 0.85) {
            // Subtle harmonic shimmer on wave crests
            if ((c * 3 + r * 7) % 11 === 0) {
              fillStyle = `rgba(217, 119, 6, ${alpha * 1.4})`;
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none w-full h-full select-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
