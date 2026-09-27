import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, PhoneCall, ExternalLink, ShieldCheck, Mail } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#0b2545] text-stone-300 text-xs border-t-4 border-amber-500 pt-8 sm:pt-10 pb-24 md:pb-8 mt-8 sm:mt-12">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        
        {/* Top Grid: Links, Offices, and Official Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img 
                src="/images/vyaparsathi-logo.png" 
                alt="VyaparSathi Logo" 
                className="w-9 h-9 object-contain bg-white/95 rounded-lg p-0.5 shadow-xs" 
              />
              <span className="font-serif font-black text-xl text-white tracking-tight">
                VYAPARSATHI
              </span>
            </div>
            <p className="text-stone-300 leading-relaxed text-[12px]">
              {t('portal_subtitle')}
            </p>
          </div>

          {/* Col 2: Useful Navigation */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-sm uppercase tracking-wider border-b border-white/20 pb-1.5">
              {t('footer_useful_links')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate('home')} 
                  className="hover:text-amber-300 transition-colors"
                >
                  {t('nav_home')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('equipment')} 
                  className="hover:text-amber-300 transition-colors text-amber-200/90 font-medium"
                >
                  {t('equipment.page_title', { defaultValue: 'Equipment Advisor' })}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('equipmenttest')} 
                  className="hover:text-amber-300 transition-colors text-amber-200/90 font-medium"
                >
                  {t('testing_title', { defaultValue: 'Equipment Testing' })}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('ondc')} 
                  className="hover:text-amber-300 transition-colors text-amber-200/90 font-medium"
                >
                  {t('ondc.gateway', { defaultValue: 'ONDC Rural Commerce' })}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('loanready')} 
                  className="hover:text-amber-300 transition-colors"
                >
                  {t('journey.step_loan', { defaultValue: 'Loan Readiness & DPR' })}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('schemes')} 
                  className="hover:text-amber-300 transition-colors"
                >
                  {t('nav_schemes')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('planning')} 
                  className="hover:text-amber-300 transition-colors"
                >
                  {t('nav_planning')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('pehchaan')} 
                  className="hover:text-amber-300 transition-colors"
                >
                  {t('nav_meri_pehchaan')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('helpnear')} 
                  className="hover:text-amber-300 transition-colors"
                >
                  {t('nav_help_near')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Government & Central MSME Portals */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-sm uppercase tracking-wider border-b border-white/20 pb-1.5">
              {t('footer.official_portals', { defaultValue: 'Official MSME Portals' })}
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://udyamregistration.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={12} className="text-amber-400" />
                  <span>{t('footer.udyam_assist', { defaultValue: 'Udyam Assist Registration' })}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://pmegp.msme.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={12} className="text-amber-400" />
                  <span>{t('footer.pmegp_portal', { defaultValue: 'PMEGP Official Portal' })}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://pmfme.mofpi.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={12} className="text-amber-400" />
                  <span>{t('footer.pmfme_portal', { defaultValue: 'PMFME Food Processing' })}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mudra.org.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={12} className="text-amber-400" />
                  <span>{t('footer.mudra_portal', { defaultValue: 'PM MUDRA Yojana' })}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://www.standupmitra.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={12} className="text-amber-400" />
                  <span>{t('footer.standup_portal', { defaultValue: 'Stand-Up India Portal' })}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Verified Facilitation Office */}
          <div className="space-y-3">
            <h4 className="font-black text-white text-sm uppercase tracking-wider border-b border-white/20 pb-1.5">
              {t('footer.verified_desk', { defaultValue: 'Verified Facilitation Desk' })}
            </h4>
            <div className="bg-white/10 p-3 rounded-lg border border-white/15 space-y-2">
              <div className="font-bold text-white text-xs">
                {t('footer.national_desk', { defaultValue: 'National MSME & DIC Facilitation Desk' })}
              </div>
              <p className="text-[11px] text-stone-300 leading-snug">
                Ministry of Micro, Small and Medium Enterprises, Udyog Bhawan, New Delhi - 110011
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-400">Toll Free: 1800-180-6763</span>
                <a
                  href="https://msme.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-amber-400 text-stone-950 font-bold text-[10px] rounded hover:bg-amber-300"
                >
                  <MapPin size={11} />
                  <span>{t('footer.portal', { defaultValue: 'Portal' })}</span>
                </a>
              </div>
            </div>
            <p className="text-[11px] text-stone-400">
              For state and district DICs, check the <strong>{t('footer.help_near', { defaultValue: 'Help Me Near' })}</strong> directory.
            </p>
          </div>

        </div>

        <hr className="border-white/10" />

        {/* Bottom Bar: Legal Disclaimer and Accessibility */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-stone-400">
          <p className="text-center md:text-left max-w-3xl leading-relaxed">
            {t('footer_disclaimer')}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={14} />
              <span>{t('footer.public_service', { defaultValue: 'Public Service Initiative' })}</span>
            </span>
            <span>© {new Date().getFullYear()} VYAPARSATHI</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
