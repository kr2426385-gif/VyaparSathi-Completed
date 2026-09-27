import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Official VyaparSathi Brand Emblem
 * Features the custom rural growth emblem with deep navy fields and green leaf.
 */
export default function VyaparSathiLogo({ className = "w-10 h-10", size = 44, alt = "VyaparSathi Logo" }) {
  const { t } = useTranslation();
  return (
    <div 
      className={`${className} flex items-center justify-center select-none shrink-0`}
      style={{ width: size, height: size }}
      aria-label={t('common.logo_aria', { defaultValue: 'VyaparSathi Logo' })}
    >
      <img 
        src="/images/vyaparsathi-logo.png" 
        alt={alt} 
        className="w-full h-full object-contain filter drop-shadow-xs"
        loading="eager"
      />
    </div>
  );
}


