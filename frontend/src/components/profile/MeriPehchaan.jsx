import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Save, CheckCircle2, RotateCcw, 
  MapPin, Target, Sparkles,
  FileText, Plus, Eye, Trash2, UploadCloud
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { getAllIndianStates, getDistrictsByState } from '../../utils/panIndiaLocations.js';
import digilockerDemoService from '../../services/digilockerDemoService.js';
import DigiLockerConnectBar from '../dashboard/DigiLockerConnectBar.jsx';
import DigiLockerModal from '../dashboard/DigiLockerModal.jsx';
import DigiLockerDocumentPreview from '../dashboard/DigiLockerDocumentPreview.jsx';
import DocumentUploadModal from '../dashboard/DocumentUploadModal.jsx';

export default function MeriPehchaan({ user, onProfileUpdated, onOpenAuth }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'mr';
  const isMr = lang === 'mr';
  const isHi = lang === 'hi';
  const loc = (mrText, hiText, enText) => isMr ? mrText : isHi ? hiText : enText;

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // DigiLocker & Documents State (Consolidated under Meri Pehchaan)
  const [digiLockerState, setDigiLockerState] = useState(() => digilockerDemoService.getConnectionState());
  const [uploadedDocs, setUploadedDocs] = useState(() => digilockerDemoService.getUserUploadedDocuments());
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleDigiLockerImportSuccess = (newState) => {
    setDigiLockerState(newState);
  };

  const handleDigiLockerDisconnect = () => {
    digilockerDemoService.disconnect();
    setDigiLockerState(digilockerDemoService.getConnectionState());
  };

  const handleUserUploadSuccess = (updatedList) => {
    setUploadedDocs(updatedList);
  };

  const handleDeleteUserDoc = (docId) => {
    const updated = digilockerDemoService.deleteUserUploadedDocument(docId);
    setUploadedDocs(updated);
  };

  const allDocuments = [
    ...(digiLockerState?.importedDocs || []),
    ...(uploadedDocs || [])
  ];

  // Initial genuine empty state
  const [formData, setFormData] = useState({
    name: (user?.name || '').replace(/\s*\([^)]*\)/g, '').trim(),
    state: user?.state || 'Maharashtra',
    district: user?.district || 'Satara',
    taluka: '',
    block: '',
    village: '',
    businessType: 'Dairy',
    businessStage: 'new',
    businessAgeYears: 0,
    employeesCount: 0,
    businessGoal: '',
    investmentRequirement: '',
    ownContribution: '',
    monthlyRevenue: '',
    monthlyExpenses: '',
    existingDebt: '',
    cashInHand: '',
    assetsDescription: ''
  });

  const availableStates = getAllIndianStates();
  const availableDistricts = getDistrictsByState(formData.state || 'Maharashtra');

  // Load existing profile from backend / local storage on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await apiService.getProfile();
        if (res.exists && res.profile) {
          setFormData(prev => ({
            ...prev,
            ...res.profile,
            name: (res.profile.name || user?.name || '').replace(/\s*\([^)]*\)/g, '').trim(),
            state: res.profile.state || user?.state || 'Maharashtra',
            district: res.profile.district || user?.district || 'Satara'
          }));
        }
      } catch (e) {
        console.warn('Profile load:', e);
      }
    }
    load();
  }, [user]);

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const dists = getDistrictsByState(newState);
    setFormData(prev => ({
      ...prev,
      state: newState,
      district: dists.length > 0 ? dists[0] : ''
    }));
    setSaveSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login', 'pehchaan');
      return;
    }

    setSaving(true);
    try {
      const res = await apiService.saveProfile({
        ...formData,
        investmentRequirement: Number(formData.investmentRequirement) || 0,
        ownContribution: Number(formData.ownContribution) || 0,
        monthlyRevenue: Number(formData.monthlyRevenue) || 0,
        monthlyExpenses: Number(formData.monthlyExpenses) || 0,
        existingDebt: Number(formData.existingDebt) || 0,
        cashInHand: Number(formData.cashInHand) || 0
      });

      // Update vyapar_user and notify entire application
      const storedUser = localStorage.getItem('vyapar_user');
      let updatedUser = { ...formData, ...(res.profile || {}) };
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          updatedUser = {
            ...u,
            ...(res.profile || {}),
            name: res.profile?.name || u.name,
            state: res.profile?.state || u.state,
            district: res.profile?.district || u.district,
            taluka: res.profile?.taluka || u.taluka,
            block: res.profile?.block || u.block,
            village: res.profile?.village || u.village,
            businessType: res.profile?.businessType || u.businessType
          };
        } catch (_) {}
      }
      localStorage.setItem('vyapar_user', JSON.stringify(updatedUser));
      localStorage.setItem('vyapar_profile', JSON.stringify(res.profile));
      window.dispatchEvent(new CustomEvent('vyapar_profile_updated', { detail: { profile: res.profile, user: updatedUser } }));
      window.dispatchEvent(new Event('storage'));

      setSaveSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(updatedUser, res.financials);
      }
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    setFormData({
      name: (user?.name || '').replace(/\s*\([^)]*\)/g, '').trim(),
      village: '',
      taluka: '',
      district: 'Pune',
      businessType: 'Dairy',
      businessStage: 'new',
      businessAgeYears: 0,
      employeesCount: 0,
      businessGoal: '',
      investmentRequirement: '',
      ownContribution: '',
      monthlyRevenue: '',
      monthlyExpenses: '',
      existingDebt: '',
      cashInHand: '',
      assetsDescription: ''
    });
    setSaveSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* Title & Actions */}
      <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
            {loc('मेरी पहचान', 'मेरी पहचान', 'Meri Pehchaan')}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {loc('योजना, कर्ज पात्रता आणि स्थानिक बाजारपेठेच्या मार्गदर्शनासाठी आपल्या व्यवसायाची खरी माहिती भरा.', 'योजनाओं, ऋण पात्रता और स्थानीय बाजार मार्गदर्शन के लिए अपने व्यवसाय की वास्तविक जानकारी दर्ज करें।', 'Enter your genuine business information to customize schemes, loan readiness, and local market advisory.')}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw size={13} />
            <span>{loc('रीसेट', 'रीसेट', 'Reset')}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{loc('माहिती यशस्वीरीत्या जतन झाली आहे.', 'जानकारी सफलतापूर्वक सहेज ली गई है।', 'Profile successfully saved. Live calculations updated.')}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
        
        {/* Step 1: Personal & Location Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-800 pb-1 border-b border-stone-100">
            <span>{loc('१. उद्योजक व ठिकाण माहिती', '१. उद्यमी एवं स्थान विवरण', '1. Entrepreneur & Location Details')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('उद्योजक / मालकाचे नाव', 'उद्यमी / स्वामी का नाम', 'Entrepreneur / Owner Name')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={loc("उदा. रमेश पाटील / व्यवसायाचे नाव", "उदा. रमेश पाटिल / व्यवसाय का नाम", "e.g. Ramesh Patil / Enterprise Name")}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('राज्य', 'राज्य', 'State')} *
              </label>
              <select
                name="state"
                value={formData.state || 'Maharashtra'}
                onChange={handleStateChange}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              >
                {availableStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('जिल्हा', 'ज़िला', 'District')} *
              </label>
              <select
                name="district"
                value={formData.district || (availableDistricts[0] || '')}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              >
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('तालुका', 'तहसील / ब्लॉक', 'Taluka / Block')}
              </label>
              <input
                type="text"
                name="taluka"
                value={formData.taluka}
                onChange={handleChange}
                placeholder={loc("उदा. हवेली / कराड", "उदा. हवेली / कराड", "e.g. Haveli / Karad")}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('गाव', 'गाँव', 'Village')}
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder={loc("उदा. दुधवाडी / गाव", "उदा. दूधवाड़ी / गाँव", "e.g. Dudwadi / Village")}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Business Domain Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-800 pb-1 border-b border-stone-100">
            <span>{loc('२. व्यवसाय स्वरूप व उद्दिष्ट', '२. व्यवसाय क्षेत्र एवं दायरा', '2. Business Sector & Scope')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('व्यवसायाचा प्रकार', 'व्यवसाय का प्रकार', 'Business Sector')}
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              >
                <option value="Dairy">{loc('डेअरी व दुग्ध प्रक्रिया', 'डेयरी एवं दुग्ध प्रसंस्करण', 'Dairy & Milk Processing')}</option>
                <option value="Food Processing">{loc('अन्न प्रक्रिया व मसाले', 'खाद्य प्रसंस्करण एवं मसाले', 'Food Processing & Spices')}</option>
                <option value="Agri Products">{loc('शेतीमाल व्यापार व रोपवाटिका', 'कृषि उत्पाद एवं नर्सरी', 'Agri Products & Nursery')}</option>
                <option value="Retail / Shop">{loc('ग्रामीण किराणा व जनरल स्टोअर', 'ग्रामीण किराना एवं जनरल स्टोर', 'Rural Retail & Grocery Store')}</option>
                <option value="Service Enterprise">{loc('ग्रामीण सेवा व फॅब्रिकेशन वर्कशॉप', 'ग्रामीण सेवाएं एवं फैब्रिकेशन कार्यशाला', 'Rural Services & Fabrication Workshop')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('व्यवसाय टप्पा', 'व्यवसाय चरण', 'Business Stage')}
              </label>
              <select
                name="businessStage"
                value={formData.businessStage}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              >
                <option value="new">{loc('नवीन व्यवसाय', 'नया उद्यम', 'New Enterprise')}</option>
                <option value="existing">{loc('सध्याचा व्यवसाय (विस्तार)', 'मौजूदा उद्यम (विस्तार)', 'Existing Enterprise (Expansion)')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('व्यवसायाचा अनुभव (वर्षे)', 'व्यवसाय का अनुभव (वर्ष)', 'Years in Business')}
              </label>
              <input
                type="number"
                name="businessAgeYears"
                value={formData.businessAgeYears}
                onChange={handleChange}
                min="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('कामगार / मदतीस व्यक्ती संख्या', 'श्रमिकों / सहायकों की संख्या', 'Number of Workers / Helpers')}
              </label>
              <input
                type="number"
                name="employeesCount"
                value={formData.employeesCount}
                onChange={handleChange}
                min="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('व्यवसायाचे मुख्य उद्दिष्ट', 'मुख्य व्यावसायिक लक्ष्य', 'Primary Business Goal')}
              </label>
              <input
                type="text"
                name="businessGoal"
                value={formData.businessGoal}
                onChange={handleChange}
                placeholder={loc("उदा. पॅकेजिंग युनिट सुरू करणे व विक्री वाढवणे", "उदा. पैकेजिंग यूनिट शुरू करना और बिक्री बढ़ाना", "e.g. Setup packaging unit and expand local sales")}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Financial Baseline Inputs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-800 pb-1 border-b border-stone-100">
            <span>{loc('३. आर्थिक नोंदी', '३. वित्तीय आधार (आंकड़े दर्ज करें)', '3. Financial Baseline (Enter Your Numbers)')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('calc_invest_req')}
              </label>
              <input
                type="number"
                name="investmentRequirement"
                value={formData.investmentRequirement}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('calc_own_contrib')}
              </label>
              <input
                type="number"
                name="ownContribution"
                value={formData.ownContribution}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('calc_monthly_rev')}
              </label>
              <input
                type="number"
                name="monthlyRevenue"
                value={formData.monthlyRevenue}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('calc_monthly_exp')}
              </label>
              <input
                type="number"
                name="monthlyExpenses"
                value={formData.monthlyExpenses}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('calc_existing_debt')}
              </label>
              <input
                type="number"
                name="existingDebt"
                value={formData.existingDebt}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('calc_cash_in_hand')}
              </label>
              <input
                type="number"
                name="cashInHand"
                value={formData.cashInHand}
                onChange={handleChange}
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {loc('सध्या असलेली मालमत्ता / यंत्रसामग्री', 'वर्तमान परिसंपत्तियां / मशीनरी विवरण', 'Owned Assets / Machinery Description')}
              </label>
              <textarea
                name="assetsDescription"
                value={formData.assetsDescription}
                onChange={handleChange}
                rows="2"
                placeholder={loc("उदा. स्वतःची १ एकर जमीन, २ गाई, शेड, यंत्रसामग्री...", "उदा. अपनी १ एकड़ भूमि, २ गायें, शेड, मशीनरी...", "e.g. 1 acre land, 2 cows, shed, tractor machinery...")}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-[#0b2545]"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-stone-500 font-semibold">
            {loc('सर्व माहिती आपल्या खाजगी उद्योजक खात्यात सुरक्षित राहील.', 'सभी विवरण आपके निजी उद्यम खाते में सुरक्षित रहेंगे।', 'All details remain confidential to your private entrepreneur account.')}
          </span>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Save size={15} />
            <span>{saving ? loc('जतन करत आहे...', 'सहेजा जा रहा है...', 'Saving Profile...') : loc('माहिती जतन करा', 'जानकारी सहेजें', 'Save Business Profile')}</span>
          </button>
        </div>

      </form>

      {/* 4. DOCUMENT VAULT & DIGILOCKER VERIFICATION (Consolidated Central Identity) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-stone-800">
              <span>{loc('४. दस्तऐवज आणि केवायसी पडताळणी', '४. दस्तावेज़ एवं केवाईसी सत्यापन', '4. Document Vault & KYC Verification')}</span>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {loc(
                'बँक कर्ज मंजुरी आणि सरकारी योजनांसाठी आपले आधार, पॅन, उद्यम आणि यंत्रसामग्री कोटेशन पडताळून घ्या.',
                'बैंक ऋण स्वीकृति और सरकारी योजनाओं के लिए अपने आधार, पैन, उद्यम और मशीनरी कोटेशन सत्यापित करें।',
                'Verify your Aadhaar, PAN, Udyam, and machinery quotes for bank loan sanction and government schemes.'
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-stone-300 hover:border-stone-400 text-stone-700 text-xs font-bold bg-white flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Plus size={14} />
            <span>{loc('कागदपत्र अपलोड करा', 'दस्तावेज़ अपलोड करें', 'Upload Document')}</span>
          </button>
        </div>

        {/* DigiLocker Connect Bar */}
        <DigiLockerConnectBar
          connectionState={digiLockerState}
          onOpenConnectModal={() => setIsDigiLockerModalOpen(true)}
          onDisconnect={handleDigiLockerDisconnect}
        />

        {/* Dynamic Document Records */}
        <div className="pt-2">
          {allDocuments.length === 0 ? (
            <div className="py-8 text-center space-y-2.5 bg-stone-50/60 rounded-xl border border-dashed border-stone-200">
              <FileText size={28} className="mx-auto text-stone-400" />
              <h4 className="text-xs font-bold text-stone-700">
                {isMr ? 'कोणतीही कागदपत्रे जोडलेली नाहीत.' : 'No KYC documents connected yet.'}
              </h4>
              <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                {isMr 
                  ? 'आपला अर्ज तयार करण्यासाठी डिजीलॉकर जोडा किंवा व्यावसायिक प्रमाणपत्रे अपलोड करा.'
                  : 'Connect DigiLocker or upload your business certificates to prepare your application package.'}
              </p>
              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0b2545] text-white text-xs font-bold hover:bg-[#13315c] transition-all cursor-pointer"
                >
                  {isMr ? 'कागदपत्र अपलोड करा' : 'Upload Document'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDigiLockerModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all cursor-pointer"
                >
                  {isMr ? 'डिजीलॉकर जोडा' : 'Connect DigiLocker'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {allDocuments.map((doc) => {
                const isDemo = doc.isDemo !== false;
                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDemo 
                          ? 'bg-blue-50 border border-blue-200 text-[#0284c7]' 
                          : 'bg-emerald-50 border border-emerald-200 text-[#13714C]'
                      }`}>
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {doc.title}
                          </span>
                          {isDemo ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                              {isMr ? 'डिजीलॉकर पडताळणी' : 'DigiLocker Verified'}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
                              {isMr ? 'अपलोड केलेले' : 'Uploaded'}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 truncate block">
                          {isDemo ? (isMr ? 'डिजीलॉकरवरून प्राप्त' : 'Imported from DigiLocker') : (doc.fileName || doc.category)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold text-[#0b2545] hover:bg-white transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>{isMr ? 'पहा' : 'View'}</span>
                      </button>

                      {!isDemo && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUserDoc(doc.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title={t('common.delete', { defaultValue: 'Delete' })}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals: DigiLocker, Upload & Preview */}
      <DigiLockerModal
        isOpen={isDigiLockerModalOpen}
        onClose={() => setIsDigiLockerModalOpen(false)}
        onImportSuccess={handleDigiLockerImportSuccess}
        defaultUserName={(user?.name || formData.name || 'Entrepreneur').replace(/\s*\([^)]*\)/g, '').trim()}
      />

      <DigiLockerDocumentPreview
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        userName={(user?.name || formData.name || 'Entrepreneur').replace(/\s*\([^)]*\)/g, '').trim()}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUserUploadSuccess}
      />

    </div>
  );
}
