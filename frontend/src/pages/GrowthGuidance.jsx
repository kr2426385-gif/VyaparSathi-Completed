import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, CheckCircle2, ArrowRight, Lightbulb, 
  Store, Building2, Users, ShieldCheck, AlertCircle, 
  Layers, Compass, DollarSign, ExternalLink, ChevronRight,
  PackageCheck, Truck, Award, Rocket, Shield, BarChart2, Globe
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/calculations.js';
import { Stepper, Step, StepActions } from '../components/ui/index.jsx';

export default function GrowthGuidance({ onNavigate, user }) {
  const { t, i18n } = useTranslation();

  // Active step index for vertical Stepper (0: Launch, 1: Stabilize, 2: Break Even, 3: Expand)
  const [activeStepIndex, setActiveStepIndex] = useState(1);
  const [selectedPillar, setSelectedPillar] = useState('value-addition');

  const stages = [
    {
      id: 'startup',
      label: t('growth.stage1_title', 'Step 1: Launch & Foundation'),
      shortTitle: t('growth.stage1_short', 'Step 1: Launch'),
      tag: '0 - 6 Months',
      icon: Rocket,
      focus: t('growth.step1_desc', 'Consistent production, first 20 regular buyers, daily cash flow tracking'),
      checklist: [
        'Ensure product quality meets baseline hygiene and customer expectations',
        'Record daily sales and purchase receipts in a simple register or phone app',
        'Establish direct supply agreements with at least 2 reliable raw material vendors',
        'Acquire basic local registrations (Gram Panchayat NOC / FSSAI basic if food)'
      ]
    },
    {
      id: 'operational',
      label: t('growth.stage2_title', 'Step 2: Stabilize & Operations'),
      shortTitle: t('growth.stage2_short', 'Step 2: Stabilize'),
      tag: '6 - 18 Months',
      icon: Shield,
      focus: t('growth.step2_desc', 'Reducing production wastage, negotiating bulk supplier rates, repeat customers'),
      checklist: [
        'Analyze monthly overhead expenses to identify and cut avoidable leakages',
        'Build a customer contact list (WhatsApp broadcast for rural orders)',
        'Maintain a 15-day working capital reserve for unexpected dry periods',
        'Explore seasonal demand spikes (festivals, weekly village haats, marriage seasons)'
      ]
    },
    {
      id: 'breakeven',
      label: t('growth.stage3_title', 'Step 3: Break-Even & Profit Surplus'),
      shortTitle: t('growth.stage3_short', 'Step 3: Break Even'),
      tag: '18 - 36 Months',
      icon: BarChart2,
      focus: t('growth.step3_desc', 'Profits comfortably exceed monthly EMI; ready for capacity expansion'),
      checklist: [
        'Reinvest at least 40% of net monthly profit into upgraded machinery or stock',
        'Obtain Udyam MSME certificate to unlock preferential bank credit rates',
        'Formalize GST registration if annual turnover approaches threshold (₹40L goods)',
        'Explore semi-automated processing to increase daily output without extra labor'
      ]
    },
    {
      id: 'scaling',
      label: t('growth.stage4_title', 'Step 4: Regional Expansion & Scale'),
      shortTitle: t('growth.stage4_short', 'Step 4: Expand'),
      tag: '3+ Years',
      icon: Globe,
      focus: t('growth.step4_desc', 'Cluster aggregation, institutional orders, brand packaging, FPO linkage'),
      checklist: [
        'Register for ONDC (Open Network for Digital Commerce) to access city buyers',
        'Supply to institutional buyers (hotels, dairy federations, agro-processing plants)',
        'Partner with local SHG or FPO groups for aggregated raw material purchase',
        'Apply for CMEGP/PMEGP expansion loan with capital subsidy'
      ]
    }
  ];

  const currentStageData = stages[activeStepIndex] || stages[1];

  const expansionPillars = [
    {
      id: 'value-addition',
      title: 'Value Addition & Product Extension',
      subtitle: 'Converting raw commodity to higher-margin finished goods',
      icon: PackageCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      opportunities: [
        {
          title: 'Raw Milk → Paneer, Ghee & Curd',
          benefit: 'Gross margins increase from 18% (liquid milk) to 35-45% on processed dairy.',
          action: 'Requires small curd vat and mechanical separator. Check PMFME 35% subsidy.'
        },
        {
          title: 'Whole Grain / Spices → Branded Retail Pouches',
          benefit: 'Selling 500g packaged turmeric/chilli powder earns 2.5x more than bulk mandi sale.',
          action: 'Install a pulverizer & nitrogen sealing machine. Obtain FSSAI license.'
        },
        {
          title: 'Seasonal Agri Surplus → Solar Dehydration / Pulping',
          benefit: 'Prevents distress harvest sales during tomato/mango glut.',
          action: 'Look into Maharashtra Agriculture Dept solar dryer subsidies (up to 50%).'
        }
      ]
    },
    {
      id: 'market-channels',
      title: 'Market Expansion & Channels',
      subtitle: 'Reaching beyond your home village to taluka and district hubs',
      icon: Truck,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      opportunities: [
        {
          title: 'Weekly Rural Haats & Taluka Markets',
          benefit: 'Direct cash sales without intermediate broker commission (saves 8-12%).',
          action: 'Set up a dedicated stall on designated bazaar days across 3 nearby villages.'
        },
        {
          title: 'B2B Institutional Tie-ups',
          benefit: 'Guaranteed volume contracts with local sweet shops, dhabas, and hostels.',
          action: 'Offer reliable morning delivery with weekly settlement terms.'
        },
        {
          title: 'ONDC & Local WhatsApp Commerce',
          benefit: 'Direct-to-consumer orders from nearby semi-urban towns.',
          action: 'Connect with CSC (Common Service Centre) VLE to onboard onto ONDC.'
        }
      ]
    },
    {
      id: 'cluster-linkages',
      title: 'Clusters, FPOs & SHG Linkages',
      subtitle: 'Collective bargaining power for procurement and logistics',
      icon: Users,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      opportunities: [
        {
          title: 'Farmer Producer Organizations (FPOs)',
          benefit: 'Bulk procurement of cattle feed, seeds, and fertilizer at 15-20% wholesale discount.',
          action: 'Join an active block-level FPO or register a cluster group through NABARD.'
        },
        {
          title: 'Mahila Arthik Vikas Mahamandal (MAVIM) / SHGs',
          benefit: 'Access community investment funds and shared processing sheds.',
          action: 'Coordinate with village Prerika or block coordinator for collective marketing.'
        },
        {
          title: 'District Industries Centre (DIC) MSME Clusters',
          benefit: 'Access common testing labs, training, and state exhibition stalls.',
          action: 'Visit your District DIC GM office for CFC (Common Facility Centre) benefits.'
        }
      ]
    }
  ];

  const activePillarData = expansionPillars.find(p => p.id === selectedPillar) || expansionPillars[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* 1. Header & Navigation breadcrumb */}
      <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>

          <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2] mt-1">
            {t('growth.title', 'Grow Your Rural Enterprise')}
          </h1>
          <p className="text-sm sm:text-[15px] text-stone-500 font-normal leading-[1.5] mt-1">
            {t('growth.subtitle', 'Practical strategies for value addition, new market channels, and cluster linkages for Maharashtra enterprises.')}
          </p>
        </div>

        <button
          onClick={() => onNavigate('/profile')}
          className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm transition-all cursor-pointer"
        >
          <span>{t('dashboard.profile', { defaultValue: 'Meri Pehchaan' })}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Prototype guidance disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl flex items-start gap-2.5">
        <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-amber-900 leading-snug">
          <strong>{t('growth.disclaimer_title', 'Prototype recommendation:')} </strong>
          {t('growth.disclaimer_text', 'Growth guidance is based on typical rural enterprise benchmarks. Validate expansion costs and local demand with your block Agriculture Officer, DIC, or local bank before taking capital commitments.')}
        </p>
      </div>

      {/* 2. Business Stage Vertical Stepper */}
      <Stepper
        orientation="vertical"
        activeStep={activeStepIndex}
        onStepChange={(idx) => setActiveStepIndex(idx)}
        className="pt-2"
      >
        {stages.map((stage, sIdx) => {
          const Icon = stage.icon;
          return (
            <Step
              key={stage.id}
              index={sIdx}
              icon={Icon}
              title={stage.label}
              description={stage.focus}
              badge={stage.tag}
              completed={activeStepIndex > sIdx}
              summary={`${stage.shortTitle} milestones verified for rural enterprise.`}
            >
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
                {/* Stage Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      {stage.label}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 font-medium max-w-md">
                    {stage.focus}
                  </p>
                </div>

                {/* Priority Action Checklist */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span className="text-xs font-black text-stone-900">
                        Priority Action Checklist for {stage.shortTitle}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-semibold">{t('growth.stage_milestones', { defaultValue: 'Stage Milestones' })}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {stage.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 font-medium bg-white p-2.5 rounded-lg border border-stone-200/60 shadow-2xs">
                        <CheckCircle2 size={15} className="text-[#e59b10] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <StepActions
                  onBack={sIdx > 0 ? () => setActiveStepIndex(sIdx - 1) : undefined}
                  onNext={sIdx < 3 ? () => setActiveStepIndex(sIdx + 1) : undefined}
                  nextLabel={sIdx < 3 ? `Continue to ${stages[sIdx + 1].shortTitle} →` : undefined}
                  isLast={sIdx === 3}
                />
              </div>
            </Step>
          );
        })}
      </Stepper>

      {/* 3. Three Pillars of Rural Growth */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
              {t('growth.strategic_pillars_title', 'Strategic Growth Pillars')}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {t('growth.strategic_pillars_sub', 'Explore concrete avenues to scale revenue and build business resilience')}
            </p>
          </div>
        </div>

        {/* Pillar Tabs */}
        <div className="flex flex-wrap gap-2">
          {expansionPillars.map((pillar) => {
            const Icon = pillar.icon;
            const isSelected = selectedPillar === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillar(pillar.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <Icon size={15} />
                <span>{pillar.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Pillar Opportunities Cards */}
        <div className="space-y-3 pt-2">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <span className="text-xs font-black text-stone-900">{activePillarData.title}</span>
            <span className="text-[11px] text-stone-600">{activePillarData.subtitle}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activePillarData.opportunities.map((opp, idx) => (
              <div key={idx} className="bg-stone-50/70 rounded-xl border border-stone-200 p-4 flex flex-col justify-between space-y-3 hover:border-stone-300 transition-all">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#0b2545]">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <strong className="leading-snug">{opp.title}</strong>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    {opp.benefit}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg font-semibold">
                  <strong>Recommended Action:</strong> {opp.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Action Hub: Connected Stages */}
      <div className="bg-gradient-to-r from-stone-900 to-[#0b2545] rounded-2xl p-6 text-white space-y-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
            One Click Next Steps
          </span>
          <h3 className="text-base sm:text-lg font-black">
            {t('growth.action_hub_title', 'Ready to execute your expansion plan?')}
          </h3>
          <p className="text-xs text-stone-300 max-w-2xl font-medium">
            {t('growth.action_hub_sub', 'Link directly into your financial forecasts, check government capital subsidies for new equipment, or locate your nearest facilitation desk.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => onNavigate('/finance/project-cost')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-black text-amber-300 block uppercase">{t('journey.step_finance', { defaultValue: 'Finance' })}</span>
              <strong className="text-xs text-white block">{t('growth.calc_expansion', { defaultValue: 'Calculate Expansion Cost' })}</strong>
            </div>
            <ArrowRight size={14} className="text-stone-400 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => onNavigate('/schemes/match')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-black text-amber-300 block uppercase">{t('journey.step_schemes', { defaultValue: 'Schemes' })}</span>
              <strong className="text-xs text-white block">{t('growth.find_subsidies', { defaultValue: 'Find Subsidies (PMEGP/CMEGP)' })}</strong>
            </div>
            <ArrowRight size={14} className="text-stone-400 group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={() => onNavigate('/support/nearby')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all flex items-center justify-between group cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-black text-amber-300 block uppercase">{t('growth.facilitation', { defaultValue: 'Facilitation' })}</span>
              <strong className="text-xs text-white block">{t('growth.connect_dic', { defaultValue: 'Connect with DIC / KVK Desk' })}</strong>
            </div>
            <ArrowRight size={14} className="text-stone-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      </div>

    </div>
  );
}
