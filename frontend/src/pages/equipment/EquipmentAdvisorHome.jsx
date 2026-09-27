import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  DollarSign, 
  FileSpreadsheet, 
  Camera, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Cpu,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { formatIndianCurrency } from '../../utils/calculations.js';

export default function EquipmentAdvisorHome({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [myEquipment, setMyEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEquipment() {
      try {
        setLoading(true);
        const res = await apiService.getMyEquipment();
        if (res && res.equipment) {
          setMyEquipment(res.equipment);
        }
      } catch (err) {
        console.warn('Could not load user equipment:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEquipment();
  }, []);

  const actionTiles = [
    {
      id: 'plan',
      icon: Wrench,
      title: t('plan_equipment', 'Plan Equipment'),
      titleLocal: i18n.language === 'mr' ? 'मशिनरी नियोजन' : (i18n.language === 'hi' ? 'मशीनरी योजना' : 'Plan Equipment'),
      description: 'Find essential, recommended & upgrade machinery customized to your business and budget.',
      path: '/equipment-advisor/plan',
      badge: 'Step-by-Step',
      color: 'from-blue-900 to-indigo-950',
      accent: 'text-amber-400',
      bgAccent: 'bg-amber-400/10'
    },
    {
      id: 'investment',
      icon: DollarSign,
      title: t('check_investment', 'Check Investment & TCO'),
      titleLocal: i18n.language === 'mr' ? 'भांडवल व TCO तपासा' : (i18n.language === 'hi' ? 'निवेश व TCO जांचें' : 'Check Investment & TCO'),
      description: 'Calculate Total Cost of Ownership, expected ROI, and multi-year operating expenses.',
      path: '/equipment-advisor/plan',
      badge: 'Deterministic Math',
      color: 'from-indigo-900 to-blue-950',
      accent: 'text-emerald-400',
      bgAccent: 'bg-emerald-400/10'
    },
    {
      id: 'quotations',
      icon: FileSpreadsheet,
      title: t('compare_quotations', 'Compare Quotations'),
      titleLocal: i18n.language === 'mr' ? 'दरपत्रक तुलना' : (i18n.language === 'hi' ? 'कोटेशन तुलना' : 'Compare Quotations'),
      description: 'Compare 2-3 supplier quotations for lowest landed cost and optimal warranty value.',
      path: '/equipment-advisor/quotations',
      badge: 'GST-Ready',
      color: 'from-slate-900 to-blue-950',
      accent: 'text-sky-400',
      bgAccent: 'bg-sky-400/10'
    },
    {
      id: 'used-machine',
      icon: Camera,
      title: t('check_used_machine', 'Check Used Machine'),
      titleLocal: i18n.language === 'mr' ? 'जुनी मशीन तपासा' : (i18n.language === 'hi' ? 'पुरानी मशीन जांचें' : 'Check Used Machine'),
      description: 'Capture machinery photos with camera to evaluate visible wear, rust & structural risks.',
      path: '/equipment-advisor/used-machine',
      badge: 'Camera Vision',
      color: 'from-stone-900 to-slate-950',
      accent: 'text-amber-400',
      bgAccent: 'bg-amber-400/10'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 select-none">
      
      {/* 1. Header */}
      <div className="border-b border-stone-200 pb-3 sm:pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
            {t('equipment_tab_equipment', 'Equipment Planning')}
          </h1>
        </div>
      </div>

      {/* 2. Four Primary Actions Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
            {t('equipment.workflows_title', 'Advisor Workflows')}
          </h2>
          <span className="text-xs text-stone-500 font-semibold">{t('equipment.mobile_engine', 'Mobile-First Decision Engine')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                onClick={() => navigate(tile.path)}
                className="group relative bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md hover:border-[#0b2545] transition-all cursor-pointer flex flex-col justify-between min-h-[190px] focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                tabIndex={0}
                role="button"
                aria-label={tile.title}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#0b2545] text-amber-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      {tile.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-stone-900 group-hover:text-[#0b2545] transition-colors leading-snug">
                      {tile.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 font-medium leading-relaxed mt-1 line-clamp-2">
                      {tile.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-black text-[#0b2545]">
                  <span>{t('equipment.get_started', 'Get Started')}</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. My Equipment Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-stone-900 uppercase tracking-wide">
                {t('my_equipment', 'My Equipment & Machinery Passport')}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0b2545] border border-blue-200">
                {myEquipment.length} Registered
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Service history, warranty tracking, and upgrade readiness for your enterprise assets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/equipment-advisor/my-equipment')}
              className="px-3.5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
            >
              <PlusCircle size={14} />
              <span>{t('equipment.open_passport', { defaultValue: 'Open Passport Hub' })}</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-stone-500">{t('equipment.loading_registered', { defaultValue: 'Loading registered equipment...' })}</div>
        ) : myEquipment.length === 0 ? (
          <div className="text-center py-8 space-y-3 bg-stone-50 rounded-xl border border-stone-200 p-4">
            <Wrench size={32} className="mx-auto text-stone-400" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-stone-800">{t('equipment.no_registered_yet', { defaultValue: 'No Equipment Registered Yet' })}</h4>
              <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                Create an equipment plan or register existing machinery to maintain service history and check upgrade readiness.
              </p>
            </div>
            <button
              onClick={() => navigate('/equipment-advisor/plan')}
              className="px-4 py-2 rounded-xl bg-[#0b2545] text-white text-xs font-bold inline-flex items-center gap-1 min-h-[44px]"
            >
              <span>{t('equipment.create_first_plan', { defaultValue: 'Create First Equipment Plan' })}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myEquipment.map((eq) => (
              <div
                key={eq._id}
                onClick={() => navigate(`/equipment-advisor/my-equipment?id=${eq._id}`)}
                className="p-4 rounded-xl border border-stone-200 hover:border-[#0b2545] bg-stone-50/70 hover:bg-stone-50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-stone-400">
                      Model: {eq.modelNumber || 'Standard'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-stone-900 group-hover:text-[#0b2545] transition-colors">
                      {eq.equipmentName}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    eq.warrantyStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                  }`}>
                    {eq.warrantyStatus === 'active' ? 'Under Warranty' : 'Out of Warranty'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Purchase Price:</span>
                    <strong className="text-stone-900 font-bold">{formatIndianCurrency(eq.purchasePrice || 0)}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Next Maintenance:</span>
                    <span className="font-semibold text-stone-800">
                      {eq.nextMaintenanceDate ? new Date(eq.nextMaintenanceDate).toLocaleDateString() : 'Scheduled as needed'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] font-bold text-[#0b2545]">
                  <span>{t('equipment.view_passport', { defaultValue: 'View Equipment Passport' })}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
