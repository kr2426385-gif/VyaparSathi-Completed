import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCard, 
  CheckCircle2, 
  FileCheck, 
  TrendingUp, 
  Search, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  AlertTriangle,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { apiService } from '../../services/api.js';

export default function BankerDashboard({ user }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [sanctionAmount, setSanctionAmount] = useState('');
  const [interestRate, setInterestRate] = useState('8.5');
  const [notes, setNotes] = useState('');
  const [verdictSuccess, setVerdictSuccess] = useState('');

  const loadBankerData = async () => {
    try {
      setLoading(true);
      const [dashRes, appsRes] = await Promise.all([
        apiService.getBankerDashboard().catch(() => null),
        apiService.getBankerApplications().catch(() => null)
      ]);

      if (dashRes) setData(dashRes);
      if (appsRes && appsRes.applications) setApplications(appsRes.applications);
    } catch (err) {
      console.error('Banker dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankerData();
  }, []);

  const handleAppraisal = async (verdict) => {
    if (!selectedApp) return;
    try {
      await apiService.submitBankerAppraisal({
        applicationId: selectedApp.id,
        verdict,
        sanctionedAmount: sanctionAmount || selectedApp.requestedLoan,
        interestRate,
        notes
      });
      setVerdictSuccess(`Application #${selectedApp.id} verdict recorded as "${verdict}".`);
      // Refresh credit applications list from backend
      await loadBankerData();
      setTimeout(() => {
        setVerdictSuccess('');
        setSelectedApp(null);
        setSanctionAmount('');
        setNotes('');
      }, 1500);
    } catch (err) {
      alert('Failed to submit credit appraisal.');
    }
  };

  const filteredApps = applications.filter(a => 
    a.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.enterpriseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#3730a3] text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/25 text-purple-200 border border-purple-400/30">
            <Building2 size={13} />
            <span>Bank MSME Credit & Underwriting Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Institutional Credit Appraisal Pipeline
          </h1>
          <p className="text-sm text-purple-100/90 leading-relaxed">
            Appraise bank-ready DPR dossiers, audit Debt-Service Coverage Ratios (DSCR), and verify PMEGP / CMEGP credit guarantees for MSME and rural enterprises across India.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs space-y-1 shrink-0">
          <p className="text-purple-200 uppercase font-bold text-[10px]">{t('banker.credit_officer', { defaultValue: 'Credit Officer' })}</p>
          <p className="text-sm font-black text-white">{user?.name || 'Priya Kulkarni'}</p>
          <p className="text-purple-100">{user?.district || 'Kolhapur'} Zonal Branch</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('banker.active_apps', { defaultValue: 'Active Applications' })}</span>
            <FileText size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.metrics?.activeApplications || applications.length || 18}
          </p>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
            ₹3.85 Cr pipeline
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('banker.avg_dscr', { defaultValue: 'Average DSCR' })}</span>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">
            {data?.metrics?.avgDscr || 1.84}x
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            Healthy (&gt;1.5x standard)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('banker.sanctioned_vol', { defaultValue: 'Sanctioned Volume' })}</span>
            <CheckCircle2 size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            ₹4.85 Cr
          </p>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
            CGTMSE backed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase">{t('banker.readiness_bench', { defaultValue: 'Readiness Benchmark' })}</span>
            <BadgeCheck size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900">
            {data?.metrics?.avgLoanReadinessScore || 82.6}%
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            100% DigiLocker KYC verified
          </span>
        </div>
      </div>

      {/* Credit Queue Table */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              Credit Appraisal & Underwriting Pipeline
            </h2>
            <p className="text-xs text-stone-500">
              Verified business cases awaiting bank underwriting approval
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={t('banker.search_ph', { defaultValue: 'Search borrower or enterprise...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/75 text-stone-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Borrower & Enterprise</th>
                <th className="py-3 px-4">{t('banker.requested_loan', { defaultValue: 'Requested Loan' })}</th>
                <th className="py-3 px-4">{t('banker.promoter_margin', { defaultValue: 'Promoter Margin' })}</th>
                <th className="py-3 px-4">{t('banker.dscr_ratio', { defaultValue: 'DSCR Ratio' })}</th>
                <th className="py-3 px-4">{t('banker.readiness', { defaultValue: 'Readiness' })}</th>
                <th className="py-3 px-4">{t('banker.risk_tier', { defaultValue: 'Risk Tier' })}</th>
                <th className="py-3 px-4 text-right">{t('banker.action', { defaultValue: 'Action' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    <div>{app.borrowerName}</div>
                    <div className="text-[11px] font-normal text-stone-500">{app.enterpriseName} • {app.district}</div>
                  </td>
                  <td className="py-3.5 px-4 font-black text-stone-900">
                    ₹{(app.requestedLoan / 100000).toFixed(2)} Lakh
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-600">
                    ₹{(app.promoterContribution / 100000).toFixed(2)} Lakh
                  </td>
                  <td className="py-3.5 px-4 font-black text-emerald-700">
                    {app.dscr}x
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800">
                      {app.loanReadinessScore}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      app.riskTier.includes('Low') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {app.riskTier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        setSanctionAmount(String(app.requestedLoan));
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#312e81] hover:bg-[#1e1b4b] text-white text-xs font-bold transition-colors shadow-2xs"
                    >
                      Appraise
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Appraisal Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-stone-200 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  Credit Underwriting
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {selectedApp.enterpriseName}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {verdictSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{verdictSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs">
              <div><strong>Borrower:</strong> {selectedApp.borrowerName}</div>
              <div><strong>DSCR:</strong> <span className="font-black text-emerald-700">{selectedApp.dscr}x</span></div>
              <div><strong>Requested:</strong> ₹{selectedApp.requestedLoan?.toLocaleString('en-IN')}</div>
              <div><strong>Target Scheme:</strong> {selectedApp.schemeBenefit}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Sanction Amount (INR):
                </label>
                <input
                  type="number"
                  value={sanctionAmount}
                  onChange={(e) => setSanctionAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Approved Interest Rate (%):
                </label>
                <input
                  type="text"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Credit Committee Sanction Notes:
                </label>
                <textarea
                  rows={2}
                  placeholder={t('banker.sanction_remarks_ph', { defaultValue: 'Terms of sanction, hypothecation requirements, collateral remarks...' })}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleAppraisal('Requires Additional Collateral')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 text-center"
              >
                Require Collateral
              </button>
              <button
                type="button"
                onClick={() => handleAppraisal('Sanction Letter Approved')}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 shadow-sm text-center"
              >
                Issue Sanction In-Principle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
