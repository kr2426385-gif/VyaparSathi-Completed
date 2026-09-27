import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, HelpCircle, Send, CheckCircle2, AlertCircle, 
  Building2, Phone, Clock, FileText, ArrowRight, ShieldCheck 
} from 'lucide-react';
import HelpMeNear from '../components/map/HelpMeNear.jsx';
import FAQSection from '../components/faq/FAQSection.jsx';
import { getAllIndianStates, getDistrictsByState } from '../utils/panIndiaLocations.js';

export default function SupportCenter({ defaultTab = 'nearby', onNavigate, user }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Derive active tab from URL if present
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/support/faq')) return 'faq';
    if (path.includes('/support/escalate')) return 'escalate';
    if (path.includes('/support/nearby')) return 'nearby';
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Escalation Form State
  const [escalateData, setEscalateData] = useState({
    name: user?.name || '',
    phone: user?.mobile || '',
    state: user?.state || '',
    district: user?.district || '',
    taluka: user?.taluka || user?.block || '',
    category: 'Bank Loan Application Assistance',
    description: ''
  });

  // Keep synced with user prop
  useEffect(() => {
    if (user) {
      setEscalateData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.mobile || prev.phone,
        state: user.state || prev.state,
        district: user.district || prev.district,
        taluka: user.taluka || user.block || prev.taluka
      }));
    }
  }, [user]);

  // Keep synced with profile broadcast event
  useEffect(() => {
    const handleProfileSync = (e) => {
      const u = e.detail?.user || e.detail?.profile;
      if (u) {
        setEscalateData(prev => ({
          ...prev,
          name: u.name || prev.name,
          phone: u.mobile || prev.phone,
          state: u.state || prev.state,
          district: u.district || prev.district,
          taluka: u.taluka || u.block || prev.taluka
        }));
      }
    };
    window.addEventListener('vyapar_profile_updated', handleProfileSync);
    return () => window.removeEventListener('vyapar_profile_updated', handleProfileSync);
  }, []);

  const [escalateSubmitted, setEscalateSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleEscalateSubmit = (e) => {
    e.preventDefault();
    if (!escalateData.name || !escalateData.phone || !escalateData.description) return;

    const generatedId = 'VS-ESC-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(generatedId);
    setEscalateSubmitted(true);

    // Save escalation in localStorage for demo review
    try {
      const existing = JSON.parse(localStorage.getItem('vyapar_escalations') || '[]');
      existing.unshift({
        id: generatedId,
        date: new Date().toISOString(),
        ...escalateData
      });
      localStorage.setItem('vyapar_escalations', JSON.stringify(existing));
    } catch (e) {
      console.warn('Escalation save error:', e);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onNavigate) {
      onNavigate(`/support/${tabId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* 1. Header with Tab Bar */}
      <div className="border-b border-stone-200 pb-4 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#0b2545] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Ground Facilitation & Help Desk
              </span>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Official Support
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight mt-1">
              VyaparSathi Support & Facilitation Desk
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Connect with your verified District Industries Centre (DIC), KVIC desk, FAQ knowledge base, or request human facilitation.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/profile')}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#0b2545] font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <span>{t('dashboard.profile', { defaultValue: 'Meri Pehchaan' })}</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 3 Sub-Workflow Tabs */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => handleTabChange('nearby')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'nearby'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
          >
            <MapPin size={15} />
            <span>{t('support.nearby_desks', { defaultValue: 'Nearby Facilitation Desks' })}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('faq')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'faq'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
          >
            <HelpCircle size={15} />
            <span>{t('support.faqs', { defaultValue: 'Frequently Asked Questions' })}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('escalate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'escalate'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'bg-white border border-stone-200 hover:bg-stone-50 text-stone-700'
            }`}
          >
            <Send size={15} />
            <span>{t('support.human_assistance', { defaultValue: 'Human Assistance / Escalation' })}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-views */}

      {/* TAB 1: NEARBY FACILITATION POINTS */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex items-start gap-2.5">
            <Building2 size={16} className="text-[#0b2545] shrink-0 mt-0.5" />
            <p className="text-xs text-stone-700 leading-snug">
              <strong>Verified District & State Support:</strong> Official offices of the General Manager (DIC), Khadi & Village Industries Commission (KVIC), and official state MSME single-window portals across India.
            </p>
          </div>
          <HelpMeNear 
            defaultState={user?.state || 'Maharashtra'} 
            defaultDistrict={user?.district || 'All'} 
          />
        </div>
      )}

      {/* TAB 2: FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <FAQSection />
        </div>
      )}

      {/* TAB 3: HUMAN ASSISTANCE / ESCALATION FORM */}
      {activeTab === 'escalate' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-900 leading-snug">
              <strong>Official Facilitation Protocol:</strong> If your scheme application or bank appraisal has been pending beyond standard SLA, or you require specialized technical DPR support, file an assistance ticket below.
            </p>
          </div>

          {escalateSubmitted ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-stone-900">
                  Assistance Request Registered
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Your request has been logged under Reference ID: <strong className="text-[#0b2545] font-mono text-sm">{ticketId}</strong>.
                </p>
                <p className="text-[11px] text-stone-500">
                  Assigned to the <strong>{escalateData.district} District MSME Facilitation Desk</strong>. Expected contact within 2-3 working days.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEscalateSubmitted(false);
                    setEscalateData({
                      name: user?.name || '',
                      phone: '',
                      district: user?.district || 'Satara',
                      taluka: '',
                      category: 'Bank Loan Application Assistance',
                      description: ''
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold"
                >
                  Submit Another Request
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('nearby')}
                  className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold"
                >
                  View Nearby Offices
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEscalateSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                  Request District Facilitation Assistance
                </h3>
                <p className="text-xs text-stone-500">
                  Please provide accurate contact details so the district coordinator can reach you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Entrepreneur / Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={escalateData.name}
                    onChange={(e) => setEscalateData({ ...escalateData, name: e.target.value })}
                    placeholder={t('auth_full_name', { defaultValue: 'Full Name' })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Active Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={escalateData.phone}
                    onChange={(e) => setEscalateData({ ...escalateData, phone: e.target.value })}
                    placeholder={t('support.mobile_ph', { defaultValue: '10-digit mobile number' })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    State / UT *
                  </label>
                  <select
                    value={escalateData.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      const dists = getDistrictsByState(newState);
                      setEscalateData({ 
                        ...escalateData, 
                        state: newState, 
                        district: dists[0] || '' 
                      });
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  >
                    {getAllIndianStates().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    District *
                  </label>
                  <select
                    value={escalateData.district}
                    onChange={(e) => setEscalateData({ ...escalateData, district: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  >
                    {getDistrictsByState(escalateData.state).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Taluka / Block
                  </label>
                  <input
                    type="text"
                    value={escalateData.taluka}
                    onChange={(e) => setEscalateData({ ...escalateData, taluka: e.target.value })}
                    placeholder={t('pehchaan_taluka_ph', { defaultValue: 'e.g. Haveli / Karad / Taluka' })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category of Assistance *
                  </label>
                  <select
                    value={escalateData.category}
                    onChange={(e) => setEscalateData({ ...escalateData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  >
                    <option value="Bank Loan Application Assistance">Bank Loan Application / Bank Branch Follow-up</option>
                    <option value="CMEGP / PMEGP Subsidy Verification">CMEGP / PMEGP Portal & Subsidy Verification</option>
                    <option value="DPR / Project Report Preparation">DPR / Financial Project Report Preparation</option>
                    <option value="Land / Gram Panchayat NOC Guidance">Land Record / Gram Panchayat NOC Guidance</option>
                    <option value="Udyam / FSSAI License Support">Udyam Registration / FSSAI License Support</option>
                    <option value="Other Rural Enterprise Query">{t('support.other_query', { defaultValue: 'Other Rural Enterprise Query' })}</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Describe your issue or what support you need *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={escalateData.description}
                    onChange={(e) => setEscalateData({ ...escalateData, description: e.target.value })}
                    placeholder="Explain your venture, bank branch name (if applicable), and specific obstacle you are facing..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-semibold">
                  * Prototype escalation logger for SIH demonstration
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <span>{t('support.submit_request', { defaultValue: 'Submit Assistance Request' })}</span>
                  <Send size={13} />
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
}
