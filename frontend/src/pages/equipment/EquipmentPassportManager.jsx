import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Cpu,
  PlusCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { formatIndianCurrency } from '../../utils/calculations.js';

export default function EquipmentPassportManager() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('passports'); // 'passports' | 'upgrade'
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedPassport, setSelectedPassport] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upgrade advisor state
  const [upgradeEquipmentName, setUpgradeEquipmentName] = useState('Processing Machine');
  const [currentCapacity, setCurrentCapacity] = useState(100);
  const [currentProduction, setCurrentProduction] = useState(85);
  const [businessDemand, setBusinessDemand] = useState('High');
  const [capacityUnit, setCapacityUnit] = useState('kg/day');
  const [upgradeAdvice, setUpgradeAdvice] = useState(null);
  const [evaluatingUpgrade, setEvaluatingUpgrade] = useState(false);

  // Add maintenance modal
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [serviceType, setServiceType] = useState('preventive');
  const [technician, setTechnician] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [notes, setNotes] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');

  // Register equipment modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regModel, setRegModel] = useState('');
  const [regSerial, setRegSerial] = useState('');
  const [regSupplier, setRegSupplier] = useState('');
  const [regPrice, setRegPrice] = useState('');
  const [regDate, setRegDate] = useState('');

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyEquipment();
      if (res && res.equipment) {
        setEquipmentList(res.equipment);
        // If query param ?id= exists, open that passport
        const targetId = searchParams.get('id');
        if (targetId) {
          const found = res.equipment.find(e => e._id === targetId);
          if (found) openPassportDetails(found._id);
        }
      }
    } catch (err) {
      console.warn('Failed to load equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const openPassportDetails = async (id) => {
    try {
      const res = await apiService.getEquipmentPassport(id);
      if (res) {
        setSelectedPassport(res.passport);
        setMaintenanceHistory(res.maintenanceHistory || []);
        // Pre-fill upgrade advisor machine name
        setUpgradeEquipmentName(res.passport?.equipmentName || 'Machine');
      }
    } catch (err) {
      console.error('Error fetching passport details:', err);
    }
  };

  const handleAddMaintenanceRecord = async (e) => {
    e.preventDefault();
    if (!selectedPassport) return;
    try {
      await apiService.addMaintenanceRecord({
        equipmentPassportId: selectedPassport._id,
        serviceDate: new Date().toISOString(),
        serviceType,
        technician: technician || 'Authorized Service',
        serviceCost: Number(serviceCost) || 0,
        notes,
        nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : null
      });
      setShowAddMaintenance(false);
      // Reload details
      openPassportDetails(selectedPassport._id);
    } catch (err) {
      alert(err.message || 'Failed to add service record.');
    }
  };

  const handleRegisterEquipment = async (e) => {
    e.preventDefault();
    if (!regName) return;
    try {
      await apiService.registerEquipmentPassport({
        equipmentName: regName,
        modelNumber: regModel,
        serialNumber: regSerial,
        supplier: regSupplier,
        purchasePrice: Number(regPrice) || 0,
        purchaseDate: regDate ? new Date(regDate).toISOString() : new Date().toISOString(),
        warrantyStatus: 'active',
        status: 'operational'
      });
      setShowRegisterModal(false);
      setRegName('');
      setRegModel('');
      setRegSerial('');
      setRegSupplier('');
      setRegPrice('');
      loadEquipment();
    } catch (err) {
      alert(err.message || 'Failed to register equipment.');
    }
  };

  const handleEvaluateUpgrade = async () => {
    setEvaluatingUpgrade(true);
    try {
      const res = await apiService.getUpgradeAdvice({
        currentEquipmentName: upgradeEquipmentName,
        currentCapacity,
        currentProduction,
        businessDemand,
        capacityUnit,
        operatingHoursPerDay: 8
      });
      setUpgradeAdvice(res);
    } catch (err) {
      console.error('Upgrade evaluation error:', err);
    } finally {
      setEvaluatingUpgrade(false);
    }
  };

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
        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[44px]"
        >
          <Plus size={15} />
          <span>{t('equipment.register_equipment', { defaultValue: 'Register Equipment' })}</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          {t('equipment.passport_hub_title', { defaultValue: 'Equipment Passport & Asset Hub' })}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          {t('equipment.passport_hub_desc', { defaultValue: 'Digital asset identity, warranty logs, verified service history, and capacity upgrade advisor.' })}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('passports')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeTab === 'passports'
              ? 'bg-[#0b2545] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t('equipment.my_passports', { defaultValue: 'My Equipment Passports' })} ({equipmentList.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('upgrade');
            if (!upgradeAdvice) handleEvaluateUpgrade();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeTab === 'upgrade'
              ? 'bg-[#0b2545] text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t('equipment.should_you_upgrade', { defaultValue: 'Should You Upgrade?' })}
        </button>
      </div>

      {/* TAB 1: EQUIPMENT PASSPORTS LIST */}
      {activeTab === 'passports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentList.map((eq) => (
              <div
                key={eq._id}
                onClick={() => openPassportDetails(eq._id)}
                className="bg-white rounded-2xl border border-stone-200 hover:border-[#0b2545] p-5 shadow-xs transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-stone-400">
                        {t('equipment.serial_number', { defaultValue: 'Serial' })}: {eq.serialNumber || 'N/A'}
                      </span>
                      <h3 className="text-sm font-black text-stone-900 group-hover:text-[#0b2545] transition-colors">
                        {eq.equipmentName}
                      </h3>
                      {eq.modelNumber && (
                        <span className="text-[11px] text-stone-500 font-semibold block">
                          {t('equipment.model_number', { defaultValue: 'Model' })}: {eq.modelNumber}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      eq.warrantyStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {eq.warrantyStatus === 'active' ? t('equipment.under_warranty', { defaultValue: 'Under Warranty' }) : t('equipment.warranty_expired', { defaultValue: 'Expired' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1 border-t border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t('equipment.purchase_date', { defaultValue: 'Purchase Date' })}:</span>
                      <strong>{new Date(eq.purchaseDate).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t('equipment.purchase_cost', { defaultValue: 'Purchase Cost' })}:</span>
                      <strong>{formatIndianCurrency(eq.purchasePrice || 0)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t('equipment.supplier_dealer', { defaultValue: 'Supplier' })}:</span>
                      <span className="truncate block font-semibold">{eq.supplier || 'Authorized Dealer'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">{t('equipment.next_maintenance', { defaultValue: 'Next Maintenance' })}:</span>
                      <span className="font-semibold text-stone-800">
                        {eq.nextMaintenanceDate ? new Date(eq.nextMaintenanceDate).toLocaleDateString() : 'As Scheduled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#0b2545]">
                  <span>{t('equipment.open_passport', { defaultValue: 'Open Equipment Passport' })}</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UPGRADE ADVISOR */}
      {activeTab === 'upgrade' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-3">
            <span className="text-[10px] font-black uppercase text-[#0b2545] tracking-wider">{t('equipment.capacity_optimizer', { defaultValue: 'Capacity Optimizer' })}</span>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              {t('equipment.should_you_upgrade', { defaultValue: 'Should You Upgrade Your Machinery?' })}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {t('equipment.upgrade_eval_desc', { defaultValue: 'Evaluates capacity utilization ratio vs market demand to prevent idle capital lockup or production bottlenecks.' })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-bold text-stone-800 block mb-1">{t('equipment.name_label', { defaultValue: 'Equipment Name' })}</label>
              <input
                type="text"
                value={upgradeEquipmentName}
                onChange={(e) => setUpgradeEquipmentName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
              />
            </div>
            <div>
              <label className="font-bold text-stone-800 block mb-1">{t('equipment.rated_capacity_daily', { defaultValue: 'Rated Capacity (Daily)' })}</label>
              <input
                type="number"
                min="1"
                value={currentCapacity}
                onChange={(e) => setCurrentCapacity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
              />
            </div>
            <div>
              <label className="font-bold text-stone-800 block mb-1">{t('equipment.current_production_daily', { defaultValue: 'Current Production (Daily)' })}</label>
              <input
                type="number"
                min="0"
                value={currentProduction}
                onChange={(e) => setCurrentProduction(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
              />
            </div>
            <div>
              <label className="font-bold text-stone-800 block mb-1">{t('equipment.local_demand', { defaultValue: 'Local Business Demand' })}</label>
              <select
                value={businessDemand}
                onChange={(e) => setBusinessDemand(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
              >
                <option value="High">{t('equipment.demand_high', { defaultValue: 'High (Backlogged Orders)' })}</option>
                <option value="Medium">{t('equipment.demand_medium', { defaultValue: 'Medium (Steady Flow)' })}</option>
                <option value="Low">{t('equipment.demand_low', { defaultValue: 'Low (Underutilized)' })}</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleEvaluateUpgrade}
            disabled={evaluatingUpgrade}
            className="px-6 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white text-xs font-black flex items-center gap-1.5 transition-colors min-h-[44px]"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>{evaluatingUpgrade ? t('equipment.evaluating', { defaultValue: 'Evaluating...' }) : t('equipment.evaluate_upgrade', { defaultValue: 'Evaluate Upgrade Advice' })}</span>
          </button>

          {upgradeAdvice && (
            <div className={`p-5 rounded-2xl border-2 space-y-4 ${
              upgradeAdvice.recommendation?.badgeColor === 'emerald'
                ? 'bg-emerald-50/70 border-emerald-400'
                : (upgradeAdvice.recommendation?.badgeColor === 'amber' ? 'bg-amber-50/70 border-amber-400' : 'bg-rose-50/70 border-rose-400')
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-stone-500">{t('equipment.utilization_rate', { defaultValue: 'Utilization Rate' })}</span>
                  <div className="text-2xl font-black text-stone-900">
                    {upgradeAdvice.capacityUtilizationPercentage}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-stone-500">{t('equipment.recommendation', { defaultValue: 'Recommendation' })}</span>
                  <h3 className="text-base font-black text-stone-900">
                    {upgradeAdvice.recommendation?.title}
                  </h3>
                  {upgradeAdvice.recommendation?.titleMr && (
                    <span className="text-xs text-stone-600 block">{upgradeAdvice.recommendation?.titleMr}</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-700 font-medium leading-relaxed">
                {upgradeAdvice.recommendation?.explanation}
              </p>

              <div className="space-y-1.5 text-xs text-stone-800 pt-2 border-t border-stone-200">
                <strong className="block text-[11px] uppercase font-bold text-stone-600">{t('equipment.recommended_steps', { defaultValue: 'Recommended Steps' })}:</strong>
                {upgradeAdvice.actionPoints?.map((act, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#0b2545] mt-0.5 shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: EQUIPMENT PASSPORT DETAILS & MAINTENANCE LOGS */}
      {selectedPassport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-2xl w-full space-y-5 shadow-2xl my-6">
            <div className="flex justify-between items-start border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#0b2545]">{t('equipment.passport_title', { defaultValue: 'Equipment Passport' })}</span>
                <h3 className="text-lg font-black text-stone-900">{selectedPassport.equipmentName}</h3>
                <span className="text-xs text-stone-500">
                  Model: {selectedPassport.modelNumber || 'Standard'} • Serial: {selectedPassport.serialNumber || 'N/A'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPassport(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Passport Identity Sheet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xl text-xs">
              <div>
                <span className="text-stone-400 block text-[10px]">Supplier:</span>
                <strong className="text-stone-900">{selectedPassport.supplier || 'Authorized Dealer'}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Purchase Date:</span>
                <strong className="text-stone-900">{new Date(selectedPassport.purchaseDate).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Purchase Cost:</span>
                <strong className="text-stone-900">{formatIndianCurrency(selectedPassport.purchasePrice || 0)}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Warranty Status:</span>
                <span className="font-bold text-emerald-700">{selectedPassport.warrantyStatus}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Asset Status:</span>
                <span className="font-bold text-stone-800">{selectedPassport.status}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Next Maintenance:</span>
                <span className="font-bold text-blue-900">
                  {selectedPassport.nextMaintenanceDate ? new Date(selectedPassport.nextMaintenanceDate).toLocaleDateString() : 'Scheduled as needed'}
                </span>
              </div>
            </div>

            {/* Maintenance History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wide">
                  {t('equipment.maintenance_records', { defaultValue: 'Maintenance & Service Records' })} ({maintenanceHistory.length})
                </h4>
                <button
                  onClick={() => setShowAddMaintenance(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#0b2545] text-white text-xs font-bold flex items-center gap-1 min-h-[44px]"
                >
                  <Plus size={13} />
                  <span>{t('equipment.add_service_record', { defaultValue: 'Add Service Record' })}</span>
                </button>
              </div>

              {maintenanceHistory.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                  {t('equipment.no_service_records', { defaultValue: 'No maintenance records logged yet. Add your first service record to maintain warranty proof.' })}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {maintenanceHistory.map((m) => (
                    <div key={m._id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-stone-900 uppercase text-[11px]">{m.serviceType.replace('_', ' ')}</span>
                        <span className="text-stone-500">{new Date(m.serviceDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>Technician: {m.technician}</span>
                        <strong>Cost: {formatIndianCurrency(m.serviceCost || 0)}</strong>
                      </div>
                      {m.notes && <p className="text-[11px] text-stone-500 italic mt-0.5">{m.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedPassport(null)}
                className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold min-h-[44px]"
              >
                {t('equipment.close_passport', { defaultValue: 'Close Passport' })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE RECORD */}
      {showAddMaintenance && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 uppercase">
                {t('equipment.add_maintenance_record', { defaultValue: 'Add Maintenance / Service Record' })}
              </h3>
              <button
                onClick={() => setShowAddMaintenance(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMaintenanceRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">{t('equipment.service_type', { defaultValue: 'Service Type' })} *</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                >
                  <option value="preventive">{t('equipment.preventive_maint', { defaultValue: 'Preventative Maintenance & Lubrication' })}</option>
                  <option value="oil_change">{t('equipment.oil_filter_change', { defaultValue: 'Oil / Filter Change' })}</option>
                  <option value="blade_sharpening">{t('equipment.blade_sharpening', { defaultValue: 'Blade / Wear Part Sharpening' })}</option>
                  <option value="calibration">{t('equipment.sensor_calibration', { defaultValue: 'Digital Sensor Calibration' })}</option>
                  <option value="breakdown">{t('equipment.breakdown_repair', { defaultValue: 'Breakdown Repair' })}</option>
                  <option value="inspection">{t('equipment.official_inspection', { defaultValue: 'Official Inspection' })}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">{t('equipment.tech_service_center', { defaultValue: 'Technician / Service Centre' })} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('equipment.placeholder_technician', { defaultValue: 'e.g. Ramesh Agro Mechanics, Satara' })}
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">{t('equipment.service_cost', { defaultValue: 'Service Cost (₹)' })}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={t('equipment.placeholder_cost', { defaultValue: 'e.g. 800' })}
                    value={serviceCost}
                    onChange={(e) => setServiceCost(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">{t('equipment.next_due_date', { defaultValue: 'Next Due Date' })}</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">{t('equipment.notes_parts', { defaultValue: 'Notes / Parts Replaced' })}</label>
                <textarea
                  rows="2"
                  placeholder={t('equipment.placeholder_service_notes', { defaultValue: 'e.g. Replaced V-belt and lubricated motor drive bearings' })}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaintenance(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 min-h-[44px]"
                >
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b2545] text-white font-bold min-h-[44px]"
                >
                  {t('equipment.save_service_record', { defaultValue: 'Save Service Record' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW EQUIPMENT */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black text-stone-900 uppercase">
                {t('equipment.register_passport', { defaultValue: 'Register Equipment Passport' })}
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterEquipment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">{t('equipment.name_label', { defaultValue: 'Equipment Name' })} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('equipment.placeholder_equip_name', { defaultValue: 'e.g. Motorized Chaff Cutter 3HP' })}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">{t('equipment.model_number', { defaultValue: 'Model Number' })}</label>
                  <input
                    type="text"
                    placeholder={t('equipment.placeholder_model', { defaultValue: 'e.g. CC-300' })}
                    value={regModel}
                    onChange={(e) => setRegModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">{t('equipment.serial_number', { defaultValue: 'Serial Number' })}</label>
                  <input
                    type="text"
                    placeholder={t('equipment.placeholder_serial', { defaultValue: 'e.g. MH-2024-912' })}
                    value={regSerial}
                    onChange={(e) => setRegSerial(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">{t('equipment.supplier_dealer', { defaultValue: 'Supplier / Dealer' })}</label>
                <input
                  type="text"
                  placeholder={t('equipment.placeholder_supplier', { defaultValue: 'e.g. Kirloskar Agro Machinery, Satara' })}
                  value={regSupplier}
                  onChange={(e) => setRegSupplier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">{t('equipment.purchase_cost', { defaultValue: 'Purchase Price (₹)' })}</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={t('equipment.placeholder_price', { defaultValue: 'e.g. 32000' })}
                    value={regPrice}
                    onChange={(e) => setRegPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">{t('equipment.purchase_date', { defaultValue: 'Purchase Date' })}</label>
                  <input
                    type="date"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0b2545] text-white font-bold min-h-[44px]"
                >
                  {t('equipment.register_asset', { defaultValue: 'Register Asset' })}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
