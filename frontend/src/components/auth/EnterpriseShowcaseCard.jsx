import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const ENTERPRISE_SLIDES = [
  {
    id: 'nashik',
    title: 'Nashik – Grapes & Food Processing',
    subtitle: 'Vineyard cultivation, cold storage & export raisin processing',
    region: 'Nashik District',
    crop: 'Grapes & Wine Processing',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/images/hero-agriculture.jpg'
  },
  {
    id: 'jalgaon',
    title: 'Jalgaon – Banana Enterprise',
    subtitle: 'Tissue-culture banana packhouses, sorting & fiber processing',
    region: 'Jalgaon District',
    crop: 'Grand Naine Bananas',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/images/hero_agro_processing.jpg'
  },
  {
    id: 'satara',
    title: 'Satara / Mahabaleshwar – Strawberry',
    subtitle: 'High-altitude berry farming, pulp processing & cold chain',
    region: 'Satara District',
    crop: 'Strawberries & Jams',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/images/rural-biz-food.jpg'
  },
  {
    id: 'nagpur',
    title: 'Nagpur – Orange',
    subtitle: 'GI-tagged Nagpur mandarin grading, juice extraction & pectin',
    region: 'Nagpur District',
    crop: 'Mandarin Oranges',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1000&q=80',
    fallbackImage: '/images/rural-agri-production.jpg'
  }
];

export default function EnterpriseShowcaseCard({ currentSlideIndex, onSelectSlide, autoPlay = true }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(currentSlideIndex || 0);

  useEffect(() => {
    if (typeof currentSlideIndex === 'number') {
      setIndex(currentSlideIndex);
    }
  }, [currentSlideIndex]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ENTERPRISE_SLIDES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const activeSlide = ENTERPRISE_SLIDES[index];

  return (
    <div className="relative w-full h-full min-h-[360px] md:min-h-[460px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end p-6 select-none bg-stone-900 group">
      {/* Background Image with Smooth Crossfade */}
      {ENTERPRISE_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            onError={(e) => {
              e.target.src = slide.fallbackImage;
            }}
            className="w-full h-full object-cover transition-transform duration-7000 ease-out group-hover:scale-105"
          />
          {/* Cinematic Dark Gradient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Ambient Top Chip */}
      <div className="absolute top-5 left-5 z-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t('auth.agro_clusters_badge', { defaultValue: 'Maharashtra Agro Clusters' })}</span>
        </span>
      </div>


      {/* Bottom Content Area */}
      <div className="relative z-20 space-y-3">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
            {activeSlide.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-200 font-medium drop-shadow leading-snug max-w-sm">
            {activeSlide.subtitle}
          </p>
        </div>

        {/* Carousel Stepper Dots */}
        <div className="flex items-center gap-2 pt-2">
          {ENTERPRISE_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setIndex(idx);
                if (onSelectSlide) onSelectSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === index ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              title={s.title}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
