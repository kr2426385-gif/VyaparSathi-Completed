import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Upload, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { formatIndianCurrency } from '../../utils/calculations.js';

export default function QuotationComparison() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([
    {
      id: 'q1',
      supplierName: 'Kirloskar Agro Machinery (Satara)',
      equipmentName: 'Dual-Bucket Milking Machine',
      quotedPrice: 52000,
      installationCost: 3500,
      transportCost: 2000,
      otherCharges: 500,
      warrantyMonths: 12,
      gstNumber: '27AAAAA0000A1Z5',
      notes: 'Includes first year servicing kit'
    },
    {
      id: 'q2',
      supplierName: 'DeLaval Dealer (Pune)',
      equipmentName: 'Dual-Bucket Milking Machine',
      quotedPrice: 49000,
      installationCost: 4000,
      transportCost: 2500,
      otherCharges: 0,
      warrantyMonths: 24,
      gstNumber: '27BBBBB1111B1Z9',
      notes: '24 months comprehensive motor warranty'
    }
  ]);

  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New quote state
  const [newSupplier, setNewSupplier] = useState('');
  const [newEquipment, setNewEquipment] = useState('Machinery Unit');
  const [newPrice, setNewPrice] = useState('');
  const [newInstall, setNewInstall] = useState('');
  const [newTransport, setNewTransport] = useState('');
  const [newWarranty, setNewWarranty] = useState(12);
  const [newGst, setNewGst] = useState('');

  const handleRunComparison = async (quotesToCompare = quotations) => {
    if (quotesToCompare.length < 2) {
      setError('Please provide at least 2 quotations to compare (up to 3).');
      return;
    }
    setError('');
    setComparing(true);
    try {
      const res = await apiService.compareQuotations(quotesToCompare);
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to compare quotations.');
    } finally {
      setComparing(false);
    }
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!newSupplier || !newPrice) {
      alert('Supplier name and quoted price are required.');
      return;
    }

    const newQuote = {
      id: 'q_' + Date.now(),
      supplierName: newSupplier,
      equipmentName: newEquipment,
      quotedPrice: Number(newPrice) || 0,
      installationCost: Number(newInstall) || 0,
      transportCost: Number(newTransport) || 0,
      otherCharges: 0,
      warrantyMonths: Number(newWarranty) || 12,
      gstNumber: newGst,
      notes: 'User-entered quotation'
    };

    const updated = [...quotations, newQuote].slice(0, 3);
    setQuotations(updated);
    setShowAddModal(false);

    // Reset inputs
    setNewSupplier('');
    setNewPrice('');
    setNewInstall('');
    setNewTransport('');

    // Re-compare
    handleRunComparison(updated);
  };

  const handleRemoveQuote = (id) => {
    if (quotations.length <= 2) {
      alert('A minimum of 2 quotations is required for comparison.');
      return;
    }
    const updated = quotations.filter(q => q.id !== id);
    setQuotations(updated);
    handleRunComparison(updated);
  };

  // Initial comparison run
  React.useEffect(() => {
    handleRunComparison(quotations);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 select-none">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/equipment-advisor')}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#0b2545] transition-colors min-h-[44px]"
        >
          <ArrowLeft size={16} />
          <span>{t('equipment.back_to_hub', { defaultValue: 'Back to Advisor Hub' })}</span>
        </button>
        {quotations.length < 3 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
          >
            <Plus size={15} />
            <span>Add Quotation ({quotations.length}/3)</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0b2545]">
          <FileSpreadsheet size={15} />
          <span>GST & Tender Compliance</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Compare Supplier Quotations
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Compare landed costs, installation inclusions, transport, and warranty terms. Zero fabricated ratings.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* Highlights: Lowest Cost & Best Value */}
      {comparisonResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50/50 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black uppercase">
              <CheckCircle2 size={16} />
              <span>{t('equipment.lowest_cost', { defaultValue: 'Lowest Total Landed Cost' })}</span>
            </div>
            <h3 className="text-base font-black text-stone-900">
              {comparisonResult.lowestTotalCostSupplier?.supplierName}
            </h3>
            <div className="text-xl font-black text-emerald-700">
              {formatIndianCurrency(comparisonResult.lowestTotalCostSupplier?.totalCost || 0)}
            </div>
            <p className="text-[11px] text-stone-600">
              Includes base machine, installation, and transportation.
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-blue-400 bg-blue-50/50 space-y-1 shadow-xs">
            <div className="flex items-center gap-1.5 text-blue-900 text-xs font-black uppercase">
              <Award size={16} />
              <span>{t('equipment.best_value', { defaultValue: 'Best Overall Value' })}</span>
            </div>
            <h3 className="text-base font-black text-stone-900">
              {comparisonResult.bestOverallValueSupplier?.supplierName}
            </h3>
            <div className="text-xl font-black text-blue-950">
              {formatIndianCurrency(comparisonResult.bestOverallValueSupplier?.totalCost || 0)}
            </div>
            <p className="text-[11px] text-stone-600">
              {comparisonResult.bestOverallValueSupplier?.reason}
            </p>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Cards (Responsive for Mobile & Desktop) */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
          Quotations Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotations.map((q, idx) => {
            const calculatedTotal = (Number(q.quotedPrice) || 0) + (Number(q.installationCost) || 0) + (Number(q.transportCost) || 0) + (Number(q.otherCharges) || 0);
            const isLowest = comparisonResult?.lowestTotalCostSupplier?.id === q.id || comparisonResult?.lowestTotalCostSupplier?.supplierName === q.supplierName;
            const isBestValue = comparisonResult?.bestOverallValueSupplier?.id === q.id || comparisonResult?.bestOverallValueSupplier?.supplierName === q.supplierName;

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs flex flex-col justify-between ${
                  isLowest ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-stone-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-stone-400">
                        Quotation #{idx + 1}
                      </span>
                      <h3 className="text-sm font-black text-stone-900 leading-snug">
                        {q.supplierName}
                      </h3>
                      {q.gstNumber && (
                        <span className="text-[10px] text-stone-500 font-semibold block">
                          GSTIN: {q.gstNumber}
                        </span>
                      )}
                    </div>
                    {quotations.length > 2 && (
                      <button
                        onClick={() => handleRemoveQuote(q.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title={t('equipment.remove_quote', { defaultValue: 'Remove quote' })}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {isLowest && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                        Lowest Price
                      </span>
                    )}
                    {isBestValue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900">
                        Best Warranty Value
                      </span>
                    )}
                  </div>

                  {/* Pricing Breakdown Lines */}
                  <div className="space-y-1.5 text-xs pt-1 border-t border-stone-100">
                    <div className="flex justify-between text-stone-600">
                      <span>Quoted Base Price:</span>
                      <strong className="text-stone-900">{formatIndianCurrency(q.quotedPrice)}</strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Installation:</span>
                      <span>{q.installationCost ? formatIndianCurrency(q.installationCost) : 'Free / Included'}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Freight & Transit:</span>
                      <span>{q.transportCost ? formatIndianCurrency(q.transportCost) : 'Free / Included'}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Warranty:</span>
                      <strong className="text-blue-900">{q.warrantyMonths} Months</strong>
                    </div>
                    {q.otherCharges > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Other Charges:</span>
                        <span>{formatIndianCurrency(q.otherCharges)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Landed Total */}
                <div className="pt-3 border-t border-stone-200">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-stone-500 uppercase">{t('equipment.total_cost', { defaultValue: 'Total Cost' })}</span>
                    <strong className="text-lg font-black text-[#0b2545]">
                      {formatIndianCurrency(calculatedTotal)}
                    </strong>
                  </div>
                  {q.notes && (
                    <p className="text-[10px] text-stone-500 mt-1 italic">{q.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Add Quotation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 max-w-md w-full space-y-4 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 uppercase">
                Add Supplier Quotation
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">Supplier / Dealer Name *</label>
                <input
                  type="text"
                  required
                  placeholder={t('equipment.supplier_ex_ph', { defaultValue: 'e.g. Mahalakshmi Agro Tech, Kolhapur' })}
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">{t('equipment.name_label', { defaultValue: 'Equipment Name' })}</label>
                <input
                  type="text"
                  placeholder={t('equipment.machine_name_ph', { defaultValue: 'e.g. 5HP Atta Chakki' })}
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="50000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="12"
                    value={newWarranty}
                    onChange={(e) => setNewWarranty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Installation (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newInstall}
                    onChange={(e) => setNewInstall(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">Transport (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newTransport}
                    onChange={(e) => setNewTransport(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">Supplier GSTIN (Optional)</label>
                <input
                  type="text"
                  placeholder="27AAAAA0000A1Z5"
                  value={newGst}
                  onChange={(e) => setNewGst(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b2545] text-white font-bold min-h-[44px]"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
