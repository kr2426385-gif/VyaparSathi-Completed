import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Activity, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

/**
 * GeminiSynthesisVisualizer
 * Exact implementation of the neural synthesis animation
 * (Awakening -> Dot Matrix Grid -> Multi-Agent Constellation -> Concentric Radar Scan)
 * 
 * Features:
 * - Slow-motion playback rate (0.6x) for clear visibility of all 4 phases
 * - Compact refined circle size scale (scale-80) for high-density, sharp HUD aesthetics
 * - Synchronized live telemetry steps
 */
export default function GeminiSynthesisVisualizer({
  variant = 'background', // 'background' | 'modal' | 'card' | 'compact'
  overlayText = '',
  playbackRate = 0.6, // Slow motion for clear phase appreciation
  circleScale = 'small', // 'small' | 'normal'
  className = '',
  showTelemetry = true,
  onPhaseComplete
}) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  // Synchronized phases mapped to slowed-down playback (0.6x speed)
  const PHASES = [
    { title: 'Regional Data Loading', detail: 'Loading regional enterprise records & district data', time: '0 - 3.2s' },
    { title: 'Business Factors Check', detail: 'Evaluating investment scale, demand & operating requirements', time: '3.2 - 7.5s' },
    { title: 'Finance & Subsidy Review', detail: 'Checking Mandi rates, PMFME capital grants & DSCR margin', time: '7.5 - 11.2s' },
    { title: 'Feasibility Synthesis', detail: 'Preparing practical recommendations for bank appraisal', time: '11.2 - 15.0s' }
  ];

  // Configure slow-motion playback & track playback time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Apply slow-motion rate
    video.playbackRate = playbackRate;

    const handlePlay = () => {
      video.playbackRate = playbackRate;
    };

    const handleTimeUpdate = () => {
      // Normal video duration is ~9.0s. At 0.6x speed, effective time scales by 1/0.6 (~1.67x)
      const ct = video.currentTime;
      if (ct < 1.9) setActivePhaseIndex(0);
      else if (ct < 4.5) setActivePhaseIndex(1);
      else if (ct < 6.8) setActivePhaseIndex(2);
      else setActivePhaseIndex(3);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [playbackRate]);

  // Variant: BACKGROUND (Subtle backdrop for Decision Engine)
  if (variant === 'background') {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute inset-0 bg-[#070e17]/88 z-10" />

        {!videoError ? (
          <video
            ref={videoRef}
            src="/videos/decision-sathi-bg.mp4"
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover opacity-55 mix-blend-screen scale-90 transition-transform duration-700"
            style={{ filter: 'contrast(1.2) brightness(1.05)' }}
          />
        ) : (
          <div className="w-full h-full bg-radial from-[#0a2342]/40 to-transparent" />
        )}

        <div className="absolute inset-0 z-20 bg-gradient-to-b from-stone-950/70 via-transparent to-stone-950/90 pointer-events-none" />
      </div>
    );
  }

  // Variant: COMPACT (Small circular badge preview)
  if (variant === 'compact') {
    return (
      <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border border-amber-500/40 shadow-sm bg-slate-900 ${className}`}>
        <video
          src="/videos/decision-sathi-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-90"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
      </div>
    );
  }

  // Variant: MODAL / AUDIT (Cinematic Slow-Motion with Refined Small Circles)
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-xl ${className}`}>
      {/* Video Viewport: scale-80 & padded frame keeps circles small, crisp and refined */}
      <div className="relative aspect-video w-full max-h-[360px] overflow-hidden bg-[#030712] flex items-center justify-center p-2 sm:p-4">
        
        {/* Outer ambient glow halo behind the video */}
        <div className="absolute inset-0 bg-radial from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />

        {!videoError ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-black">
            <video
              ref={videoRef}
              src="/videos/decision-sathi-bg.mp4"
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
              className="w-full h-full object-contain scale-[0.82] transition-transform duration-500"
              style={{ filter: 'contrast(1.15) brightness(1.05)' }}
            />

            {/* Circular vignette overlay to give delicate depth to the reduced circles */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, transparent 45%, rgba(3,7,18,0.85) 95%)',
              }}
            />
          </div>
        ) : (
          <div className="text-center p-8 text-amber-400">
            <RefreshCw className="animate-spin mx-auto mb-2 text-amber-400" size={28} />
            <p className="text-xs font-medium">{t('visualizer.engine_active', { defaultValue: 'Decision Support Engine Active' })}</p>
          </div>
        )}

        {/* Top-Left Floating Badge with subtle indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">
            Business Feasibility Analysis • Step Progress
          </span>
        </div>

        {/* Top-Right Telemetry */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700 text-stone-300 text-[10px]">
          <Activity size={11} className="text-emerald-400" />
          <span>6 Verification Rules</span>
        </div>

        {/* Bottom Phase Indicator Banner */}
        <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-20 bg-slate-900/95 p-3 rounded-xl border border-slate-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles size={13} />
            </div>
            <div>
              <span className="text-[9px] uppercase text-amber-400 font-bold tracking-wide block">
                Step {activePhaseIndex + 1} of 4 • {PHASES[activePhaseIndex].time}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                {PHASES[activePhaseIndex].title}
              </h4>
            </div>
          </div>

          <p className="text-[10px] sm:text-[11px] text-stone-300 font-medium sm:text-right max-w-xs">
            {PHASES[activePhaseIndex].detail}
          </p>
        </div>
      </div>

      {/* Progress Stepper Bar underneath video */}
      {showTelemetry && (
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PHASES.map((phase, idx) => {
            const isActive = activePhaseIndex === idx;
            const isDone = activePhaseIndex > idx;

            return (
              <div 
                key={idx}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-sm' 
                    : isDone
                    ? 'bg-slate-900 border-slate-700 text-stone-300'
                    : 'bg-slate-950/60 border-slate-800/60 text-stone-500'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] mb-1 font-medium">
                  <span>Step 0{idx + 1}</span>
                  {isDone ? (
                    <CheckCircle2 size={11} className="text-emerald-400" />
                  ) : isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  ) : null}
                </div>
                <div className="text-[10px] font-semibold leading-tight truncate">
                  {phase.title}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
