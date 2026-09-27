import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle2, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { apiService } from '../services/api.js';

export default function ActualOutcomeModal({ assessment, isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  if (!isOpen || !assessment) return null;

  const existingOutcome = assessment.outcome || {};

  const [revenue, setRevenue] = useState(existingOutcome.actualMonthlyRevenue ?? '');
  const [expenses, setExpenses] = useState(existingOutcome.actualMonthlyExpenses ?? '');
  const [profit, setProfit] = useState(existingOutcome.actualMonthlyProfit ?? '');
  const [demand, setDemand] = useState(existingOutcome.actualDemandLevel || 'Medium');
  const [category, setCategory] = useState(existingOutcome.actualBusinessCategory || '');
  const [status, setStatus] = useState(existingOutcome.businessStatus || 'operating');
  const [outcomeDate, setOutcomeDate] = useState(
    existingOutcome.outcomeDate
      ? new Date(existingOutcome.outcomeDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(existingOutcome.notes || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-calculate profit when revenue and expenses change if profit is empty or matches previous diff
  useEffect(() => {
    if (revenue !== '' && expenses !== '') {
      const r = Number(revenue);
      const e = Number(expenses);
      if (!isNaN(r) && !isNaN(e)) {
        setProfit(r - e);
      }
    }
  }, [revenue, expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const revNum = revenue !== '' ? Number(revenue) : undefined;
    const expNum = expenses !== '' ? Number(expenses) : undefined;
    const profitNum = profit !== '' ? Number(profit) : undefined;

    if (revNum !== undefined && (isNaN(revNum) || revNum < 0)) {
      setError('Actual monthly revenue cannot be negative.');
      return;
    }
    if (expNum !== undefined && (isNaN(expNum) || expNum < 0)) {
      setError('Actual monthly expenses cannot be negative.');
      return;
    }
    if (notes.length > 1000) {
      setError('Notes cannot exceed 1000 characters.');
      return;
    }

    try {
      setSaving(true);
      const outcomePayload = {
        actualMonthlyRevenue: revNum,
        actualMonthlyExpenses: expNum,
        actualMonthlyProfit: profitNum,
        actualDemandLevel: demand,
        actualBusinessCategory: category || undefined,
        businessStatus: status,
        outcomeDate: outcomeDate ? new Date(outcomeDate).toISOString() : new Date().toISOString(),
        notes: notes.trim() || undefined
      };

      const res = await apiService.saveAssessmentOutcome(assessment._id, outcomePayload);
      if (res && res.success) {
        setSuccessMsg('Actual business outcome saved successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } else {
        setError(res?.error || 'Failed to save outcome.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error saving outcome.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-300" />
              <h3 className="text-lg font-bold">{t('outcome.title', { defaultValue: 'Actual Business Outcome' })}</h3>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              {t('outcome.subtitle', { defaultValue: 'User-Reported Real Outcome • Helps VyaparSathi improve future ML predictions' })}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', { defaultValue: 'Close' })}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Informational Alert */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Ground Truth Protection:</strong> Model predictions are never copied to actual outcomes.
            Please report your true financial numbers. This form is optional and does not affect your access.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Revenue & Expenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('outcome.monthly_revenue', { defaultValue: 'Actual Monthly Revenue (₹)' })}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder={t('outcome.revenue_placeholder', { defaultValue: 'e.g. 60000' })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('outcome.monthly_expenses', { defaultValue: 'Actual Monthly Expenses (₹)' })}
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder={t('outcome.expenses_placeholder', { defaultValue: 'e.g. 25000' })}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Actual Profit */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Actual Monthly Profit (₹)
            </label>
            <input
              type="number"
              step="100"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              placeholder="Auto-calculated (Revenue - Expenses)"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-semibold text-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Calculated deterministically as Revenue minus Expenses.
            </span>
          </div>

          {/* Demand Level & Business Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Observed Local Demand
              </label>
              <select
                value={demand}
                onChange={(e) => setDemand(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="Low">Low (कमी मागणी)</option>
                <option value="Medium">Medium (मध्यम मागणी)</option>
                <option value="High">High (जास्त मागणी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Current Business Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              >
                <option value="planned">Planned (नियोजित)</option>
                <option value="started">Started (सुरू केला)</option>
                <option value="operating">Operating (चालू आहे)</option>
                <option value="closed">Closed (बंद)</option>
              </select>
            </div>
          </div>

          {/* Actual Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Actual Business Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Grocery Retail / Dairy"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Outcome Reporting Date
              </label>
              <input
                type="date"
                value={outcomeDate}
                onChange={(e) => setOutcomeDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Entrepreneur Experience & Field Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder={t('outcome.notes_placeholder', { defaultValue: 'e.g. Peak sales during weekly market; supplier logistics overhead was slightly higher.' })}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
            <div className="flex justify-between text-[11px] text-stone-500 mt-0.5">
              <span>{t('outcome.optional_observations', { defaultValue: 'Optional ground truth observations' })}</span>
              <span>{notes.length}/1000</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-100 transition-colors"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {saving ? t('common.saving', { defaultValue: 'Saving...' }) : t('outcome.save_button', { defaultValue: 'Save Actual Outcome' })}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
