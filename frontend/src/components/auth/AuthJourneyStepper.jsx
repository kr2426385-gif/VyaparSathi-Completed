import React from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuthJourneyStepper({ currentStep = 1 }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'mr';

  const stepLabels = {
    idea: { mr: 'उद्योग कल्पना', hi: 'व्यापार विचार', en: 'Idea' },
    market: { mr: 'बाजार संधी', hi: 'बाज़ार अवसर', en: 'Market' },
    finance: { mr: 'भांडवल', hi: 'वित्त व पूंजी', en: 'Finance' },
    loan: { mr: 'कर्ज पात्रता', hi: 'ऋण पात्रता', en: 'Loan Ready' },
    growth: { mr: 'उद्योग विकास', hi: 'विकास', en: 'Growth' }
  };

  const steps = [
    { id: 'idea', label: t('journey.step_idea', { defaultValue: stepLabels.idea[lang] || stepLabels.idea.mr }) },
    { id: 'market', label: t('journey.step_market', { defaultValue: stepLabels.market[lang] || stepLabels.market.mr }) },
    { id: 'finance', label: t('journey.step_finance', { defaultValue: stepLabels.finance[lang] || stepLabels.finance.mr }) },
    { id: 'loan', label: t('journey.step_loan', { defaultValue: stepLabels.loan[lang] || stepLabels.loan.mr }) },
    { id: 'growth', label: t('journey.step_growth', { defaultValue: stepLabels.growth[lang] || stepLabels.growth.mr }) }
  ];

  return (
    <div className="w-full pt-4 border-t border-stone-200/80 select-none">
      <div className="flex items-center justify-between relative px-2">
        {/* Connecting Background Line */}
        <div className="absolute top-[11px] left-5 right-5 h-[1.5px] bg-stone-200 z-0" />

        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-default">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isActive
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                    : 'bg-white border-2 border-stone-300 text-stone-400'
                }`}
              >
                {isDone || isActive ? (
                  <Check size={11} strokeWidth={3} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-bold tracking-tight transition-colors ${
                  isActive
                    ? 'text-emerald-800 font-extrabold'
                    : isDone
                    ? 'text-stone-700'
                    : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
