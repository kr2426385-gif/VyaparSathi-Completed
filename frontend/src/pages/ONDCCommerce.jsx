import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, PlusCircle, ArrowRight, CheckCircle2, 
  MapPin, ShieldCheck, RefreshCw, Sparkles, Building2, Store, Truck, AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api.js';
import DataStatusBadge from '../components/common/DataStatusBadge.jsx';

export default function ONDCCommerce({ onNavigate, user }) {
  const { t } = useTranslation();
  const [networkStatus, setNetworkStatus] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'create'

  // Pre-fill form from user enterprise profile
  const [form, setForm] = useState({
    enterpriseName: user?.name ? `${user.name} Agro Unit` : 'Sahyadri Agri Products',
    productName: 'Processed Dairy / Organic Agri Goods',
    category: 'Dairy & Milk Products',
    price: 450,
    unit: '1 kg Pack',
    quantity: 50,
    district: user?.district || 'Satara',
    taluka: 'Karad',
    village: 'Koregaon',
    description: 'High-quality rural processed agro product packaged under hygienic FSSAI norms.'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [simulatedOrder, setSimulatedOrder] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [status, data] = await Promise.all([
        apiService.getONDCStatus(),
        apiService.getONDCListings()
      ]);
      setNetworkStatus(status);
      setListings(data?.items || []);
    } catch (err) {
      console.warn('ONDC load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await apiService.createONDCListing(form);
      if (res && res.success) {
        setSuccessMsg('Product registered into ONDC network registry successfully!');
        loadData();
        setTimeout(() => {
          setActiveTab('browse');
          setSuccessMsg('');
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to register listing.');
    } finally {
      setSaving(false);
    }
  };

  const handleSimulateOrder = async (item) => {
    try {
      const res = await apiService.simulateONDCOrder({
        itemId: item.id,
        quantity: 1,
        deliveryAddress: { address: `Taluka Hub, ${item.location?.district || 'Satara'}, Maharashtra` }
      });
      setSimulatedOrder(res);
    } catch (err) {
      alert(err.message || 'Failed to simulate test order.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col md:flex-row justify-between md:items-end gap-3">
        <div>

          <h1 className="text-2xl font-black text-stone-900 tracking-tight mt-1">
            ONDC Rural Commerce & Marketplace Gateway
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Connect your rural micro-enterprise directly to open digital buyers across India via the Open Network for Digital Commerce (ONDC).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'browse' ? 'bg-[#0b2545] text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Marketplace Catalog ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'create' ? 'bg-[#0b2545] text-white shadow-xs' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <PlusCircle size={14} />
            <span>{t('ondc.create_listing', { defaultValue: 'Create Listing' })}</span>
          </button>
        </div>
      </div>

      {/* Commerce Transparency Banner */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-950">
        <Store size={18} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold block">Open Network for Digital Commerce (ONDC):</strong>
          <p className="font-medium text-stone-700">
            {networkStatus?.notice || 'Directly connect rural micro-enterprises to buyers across India. Products are standardized and discoverable nationwide.'}
          </p>
        </div>
      </div>

      {/* Active Tab: Create Listing */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateListing} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-sm">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="text-sm font-black text-stone-900 uppercase">
              {t('ondc.create_listing', { defaultValue: 'Register Enterprise Product on ONDC' })}
            </h2>
            <p className="text-xs text-stone-500">
              Pre-filled from your registered business profile. No duplicate entries required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase">{t('ondc.enterprise_name', { defaultValue: 'Enterprise Name' })}</label>
              <input
                type="text"
                value={form.enterpriseName}
                onChange={e => setForm({ ...form, enterpriseName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase">{t('ondc.product_name', { defaultValue: 'Product Name' })}</label>
              <input
                type="text"
                value={form.productName}
                onChange={e => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-700 uppercase">Sector / Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
              >
                <option value="Dairy & Milk Products">Dairy & Milk Products</option>
                <option value="Spices & Food Processing">Spices & Food Processing</option>
                <option value="Grains & Dal Milling">Grains & Dal Milling</option>
                <option value="Horticulture & Cold Chain">Horticulture & Cold Chain</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">Price (₹)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 uppercase">{t('ondc.unit', { defaultValue: 'Unit' })}</label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  required
                />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-stone-700 uppercase">{t('ondc.description', { defaultValue: 'Description' })}</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-stone-500 font-medium">
              Location pre-filled: <strong>{form.district}, Maharashtra</strong>
            </span>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>{t('ondc.publish', { defaultValue: 'Publish to ONDC Network' })}</span>
            </button>
          </div>
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
              {successMsg}
            </div>
          )}
        </form>
      )}

      {/* Active Tab: Browse Listings */}
      {activeTab === 'browse' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between shadow-sm hover:border-stone-300 transition-all space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#0b2545] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      Stock: {item.availableQuantity} {item.unit}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-stone-900 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-medium line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-bold pt-1">
                    <MapPin size={13} className="text-stone-400" />
                    <span>{item.location?.taluka || 'Karad'}, {item.location?.district || 'Satara'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block">{t('ondc.farm_gate_price', { defaultValue: 'FARM GATE PRICE' })}</span>
                    <strong className="text-base font-black text-[#0b2545]">₹{item.price}</strong>
                    <span className="text-[10px] text-stone-500 font-medium"> / {item.unit}</span>
                  </div>
                  <button
                    onClick={() => handleSimulateOrder(item)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                  >
                    <span>{t('ondc.simulate_order', { defaultValue: 'Simulate Order' })}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sandbox Simulated Order Result Modal */}
          {simulatedOrder && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-300 text-xs text-emerald-950 space-y-3 animate-fadeIn shadow-sm">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2 font-black">
                  <CheckCircle2 size={18} className="text-emerald-700" />
                  <span>{t('ondc.order_confirmed', { defaultValue: 'Digital Commerce Order Confirmed' })}</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  {simulatedOrder.transactionStatus}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>Order ID: <strong>{simulatedOrder.orderId}</strong></div>
                <div>Network Status: <strong>{simulatedOrder.becknAction ? 'Verified Gateway' : 'Confirmed'}</strong></div>
                <div>Item: <strong>{simulatedOrder.orderDetails?.item?.name}</strong></div>
                <div>Total: <strong>₹{simulatedOrder.orderDetails?.totalAmount}</strong></div>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                {simulatedOrder.sandboxNotice}
              </p>
              <button
                onClick={() => setSimulatedOrder(null)}
                className="px-3 py-1 rounded-lg bg-emerald-800 text-white text-[11px] font-bold"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
