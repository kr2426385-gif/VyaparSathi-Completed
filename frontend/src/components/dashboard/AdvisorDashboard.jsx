import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building, 
  FileCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Filter, 
  Search, 
  Download, 
  FileText,
  ShieldCheck,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { apiService } from '../../services/api.js';

export default function AdvisorDashboard({ user }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dossiers, setDossiers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState('');

  const loadAdvisorData = async () => {
    try {
      setLoading(true);
      const [dashRes, dosRes] = await Promise.all([
        apiService.getAdvisorDashboard().catch(() => null),
        apiService.getAdvisorDossiers().catch(() => null)
      ]);

      if (dashRes) setData(dashRes);
      if (dosRes && dosRes.dossiers) setDossiers(dosRes.dossiers);
    } catch (err) {
      console.error('Advisor dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisorData();
  }, []);

  const handleDecision = async (status) => {
    if (!selectedDossier) return;
    try {
      await apiService.submitAdvisorReview({
        dossierId: selectedDossier.id || selectedDossier._id,
        decision: status,
        notes: reviewNote || 'Approved following Maharashtra MSME standards.'
      });
      setDecisionSuccess(`Dossier #${selectedDossier.id || selectedDossier._id} updated to "${status}".`);
      // Reload updated real data from backend
      await loadAdvisorData();
      setTimeout(() => {
        setDecisionSuccess('');
        setSelectedDossier(null);
        setReviewNote('');
      }, 1500);
    } catch (err) {
      alert('Failed to submit review decision.');
    }
  };

  const filteredDossiers = dossiers.filter(d => 
    (d.enterpriseName || d.businessType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.applicantName || d.entrepreneur?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.district || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#0b2545] via-[#13315c] to-[#1e4d8c] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <Building size={13} />
            <span>District Industries Centre (DIC) Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Advisor Review & Evaluation Console
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Review submitted rural entrepreneur business plans, verify machinery quotations, and certify scheme eligibility for <strong>{user?.district || 'Satara'}</strong> district.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-1 shrink-0">
          <p className="text-blue-200 uppercase font-bold text-[10px]">{t('advisor.active_officer', { defaultValue: 'Active Officer' })}</p>
          <p className="text-sm font-black text-white">{user?.name || 'Dr. Suresh Deshmukh'}</p>
          <p className="text-blue-100 flex items-center gap-1">
            <MapPin size={12} /> {user?.district || 'Satara'} District HQ
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('advisor.total_submissions', { defaultValue: 'Total Submissions' })}</span>
            <FileText size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.metrics?.totalAssessments || dossiers.length || 28}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            +14% this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('advisor.pending_audits', { defaultValue: 'Pending Audits' })}</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.metrics?.pendingReviews || 12}
          </p>
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
            Avg review: 14.5 hrs
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('advisor.quotations_verified', { defaultValue: 'Quotations Verified' })}</span>
            <FileCheck size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.metrics?.verifiedQuotations || 19}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            100% KVK compliant
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('advisor.schemes_approved', { defaultValue: 'Schemes Approved' })}</span>
            <ShieldCheck size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.metrics?.approvedSchemes || 24}
          </p>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
            PMEGP & CMEGP
          </span>
        </div>
      </div>

      {/* Main Review Queue Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              District Entrepreneur Dossier Queue
            </h2>
            <p className="text-xs text-stone-500">
              Business feasibility cases requiring DIC technical validation
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={t('advisor.search_ph', { defaultValue: 'Search enterprise, applicant, or category...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
            />
          </div>
        </div>

        {/* Dossiers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Enterprise & Applicant</th>
                <th className="py-3 px-4">{t('advisor.category', { defaultValue: 'Category' })}</th>
                <th className="py-3 px-4">{t('advisor.capex_required', { defaultValue: 'Capex Required' })}</th>
                <th className="py-3 px-4">{t('advisor.scheme_target', { defaultValue: 'Scheme Target' })}</th>
                <th className="py-3 px-4">{t('advisor.loan_score', { defaultValue: 'Loan Score' })}</th>
                <th className="py-3 px-4">{t('advisor.status', { defaultValue: 'Status' })}</th>
                <th className="py-3 px-4 text-right">{t('advisor.action', { defaultValue: 'Action' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredDossiers.map((dos, idx) => {
                const name = dos.enterpriseName || dos.businessType || 'Micro Venture';
                const applicant = dos.applicantName || dos.entrepreneur?.name || 'Local Entrepreneur';
                const capex = dos.investmentRequirement ? `₹${(dos.investmentRequirement / 100000).toFixed(1)} Lakh` : '₹14.5 Lakh';
                const score = dos.loanReadinessScore || 78;

                return (
                  <tr key={dos.id || dos._id || idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      <div>{name}</div>
                      <div className="text-[11px] font-normal text-stone-500">{applicant} • {dos.district || 'Satara'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600">
                      {dos.businessCategory || 'Agro Processing'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {capex}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-700">
                      {dos.subsidyEligible || 'PMEGP (35% Subsidized)'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                        score >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {score}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        {dos.status || 'Pending Verification'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedDossier(dos)}
                        className="px-3 py-1.5 rounded-lg bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  DIC Case Evaluation
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {selectedDossier.enterpriseName || selectedDossier.businessType}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDossier(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {decisionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{decisionSuccess}</span>
              </div>
            )}

            <div className="space-y-3 text-xs text-stone-700">
              <p><strong>Applicant:</strong> {selectedDossier.applicantName || selectedDossier.entrepreneur?.name}</p>
              <p><strong>District:</strong> {selectedDossier.district || user?.district}</p>
              <p><strong>Estimated Capital:</strong> ₹{(selectedDossier.investmentRequirement || 1450000).toLocaleString('en-IN')}</p>
              <p><strong>Target Subsidy:</strong> {selectedDossier.subsidyEligible || 'PMEGP (35% Subsidized)'}</p>
              
              <div className="pt-2">
                <label className="block font-bold text-stone-800 mb-1">
                  Officer Technical Recommendation & Notes:
                </label>
                <textarea
                  rows={3}
                  placeholder={t('advisor.evaluation_notes_ph', { defaultValue: 'Enter evaluation notes, machinery specification approval, or recommendations...' })}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-[#0b2545] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleDecision('Modifications Requested')}
                className="px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100"
              >
                Request Revisions
              </button>
              <button
                type="button"
                onClick={() => handleDecision('Certified & Approved')}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm"
              >
                Endorse for Loan Underwriting
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
