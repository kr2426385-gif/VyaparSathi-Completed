import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  ArrowLeft, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Zap, 
  DollarSign, 
  Building2, 
  MapPin, 
  Package, 
  Sparkles,
  Info
} from 'lucide-react';
import { getAllIndianStates, getDistrictsByState } from '../../utils/panIndiaLocations.js';
import { formatIndianCurrency } from '../../utils/calculations.js';
import { Stepper, Step, StepActions } from '../../components/ui/index.jsx';

export default function EquipmentPlannerForm() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Pan-India Location State
  const availableStates = getAllIndianStates();
  const [state, setState] = useState('Maharashtra');
  const availableDistricts = getDistrictsByState(state);
  const [district, setDistrict] = useState(availableDistricts[0] || 'Satara');

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setState(newState);
    const districts = getDistrictsByState(newState);
    if (districts.length > 0) {
      setDistrict(districts[0]);
    }
  };

  // Form State
  const [businessType, setBusinessType] = useState('Dairy & Cattle');
  const [locationType, setLocationType] = useState('Rural');
  const [budget, setBudget] = useState(150000);
  const [productionRequirement, setProductionRequirement] = useState('Small (50 - 200 kg/day)');
  const [equipmentPreference, setEquipmentPreference] = useState('any');
  const [electricityAvailability, setElectricityAvailability] = useState('single_phase');

  const totalSteps = 6;

  const businessCategories = [
    { id: 'Dairy & Cattle', label: 'Dairy & Cattle Farming', labelMr: 'दुग्धव्यवसाय व पशुपालन', labelHi: 'डेयरी व पशुपालन', icon: '🐄' },
    { id: 'Flour & Dal Processing', label: 'Flour Mill & Dal Processing', labelMr: 'पीठ गिरणी व डाळ प्रक्रिया', labelHi: 'आटा चक्की व दाल मिल', icon: '🌾' },
    { id: 'Spices & Condiments', label: 'Spices & Masala Grinding', labelMr: 'मसाला व हळद प्रक्रिया', labelHi: 'मसाला व हल्दी पिसाई', icon: '🌶️' },
    { id: 'Oil Extraction', label: 'Cold Press Oil Extraction (Lakdi Ghana)', labelMr: 'लाकडी घाणा तेल गाळणी', labelHi: 'कोल्ड प्रेस्ड तेल घाना', icon: '🌻' },
    { id: 'Solar & Cold Chain', label: 'Solar Cold Storage & Drying', labelMr: 'सौर कोल्ड स्टोरेज व ड्रायर', labelHi: 'सोलर कोल्ड स्टोरेज व ड्रायर', icon: '☀️' },
    { id: 'Bakery & Snack Processing', label: 'Bakery, Farsan & Snack Processing', labelMr: 'बेकरी, फरसाण व प्रक्रिया उद्योग', labelHi: 'बेकरी, नमकीन व स्नैक्स उद्योग', icon: '🍞' },
    { id: 'Packaging & Post-Harvest', label: 'Packaging & Grain Cleaning', labelMr: 'पॅकेजिंग व धान्य स्वच्छता केंद्र', labelHi: 'पैकेजिंग व अनाज सफाई', icon: '📦' },
    { id: 'Agro & Food Processing', label: 'General Agro & Food Processing', labelMr: 'कृषी व अन्न प्रक्रिया उद्योग', labelHi: 'सामान्य कृषि व खाद्य प्रसंस्करण', icon: '🏭' }
  ];

  const budgetPresets = [
    { label: '₹50,000', value: 50000 },
    { label: '₹1,50,000', value: 150000 },
    { label: '₹3,00,000', value: 300000 },
    { label: '₹5,00,000', value: 500000 },
    { label: '₹10,00,000', value: 1000000 }
  ];

  const productionTiers = [
    { id: 'Micro (Under 50 kg/day)', label: 'Micro / Household Scale (Under 50 kg or 50L/day)', desc: 'Ideal for 1-2 workers starting from village homestead' },
    { id: 'Small (50 - 200 kg/day)', label: 'Small Commercial (50 - 200 kg or 100-300L/day)', desc: 'Standard rural MSME supplying local village markets and weekly haats' },
    { id: 'Medium (200 - 500 kg/day)', label: 'Semi-Industrial (200 - 500 kg or 500L+/day)', desc: 'Higher throughput for taluka-level supply & wholesale contracts' },
    { id: 'Commercial (500+ kg/day)', label: 'Commercial Cluster (500+ kg/day)', desc: 'Bulk industrial production requiring 3-phase machinery' }
  ];

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use keyboard input.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language === 'mr' ? 'mr-IN' : (i18n.language === 'hi' ? 'hi-IN' : 'en-IN');
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('Listening... Speak now');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setVoiceTranscript(`Heard: "${text}"`);
      const lower = text.toLowerCase();

      // Smart keyword mapping from voice
      if (lower.includes('dairy') || lower.includes('दूध') || lower.includes('डेअरी')) setBusinessType('Dairy & Cattle');
      else if (lower.includes('dal') || lower.includes('डाळ') || lower.includes('flour') || lower.includes('पीठ')) setBusinessType('Flour & Dal Processing');
      else if (lower.includes('spice') || lower.includes('मसाला') || lower.includes('हळद')) setBusinessType('Spices & Condiments');
      else if (lower.includes('oil') || lower.includes('तेल') || lower.includes('घाणा')) setBusinessType('Oil Extraction');
      else if (lower.includes('solar') || lower.includes('सौर') || lower.includes('cold')) setBusinessType('Solar & Cold Chain');

      if (lower.includes('three phase') || lower.includes('थ्री फेज') || lower.includes('3 phase')) setElectricityAvailability('three_phase');
      else if (lower.includes('single phase') || lower.includes('सिंगल फेज')) setElectricityAvailability('single_phase');

      // Check numeric budget
      const matches = text.match(/\d+/g);
      if (matches && matches.length > 0) {
        const num = parseInt(matches.join(''), 10);
        if (num >= 10000 && num <= 5000000) setBudget(num);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceTranscript('Voice input failed or timed out.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const planPayload = {
      businessType,
      location: `${district}, ${state} (${locationType})`,
      state,
      district,
      budget: Number(budget),
      productionRequirement,
      equipmentPreference,
      electricityAvailability
    };
    // Save to sessionStorage so result page loads it immediately
    sessionStorage.setItem('vyapar_equipment_plan_inputs', JSON.stringify(planPayload));
    navigate('/equipment-advisor/result');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 select-none">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/equipment-advisor')}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#0b2545] transition-colors min-h-[44px]"
        >
          <ArrowLeft size={16} />
          <span>{t('equipment.back_to_hub', { defaultValue: 'Back to Advisor Hub' })}</span>
        </button>
        <span className="text-xs font-extrabold text-[#0b2545] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Create My Equipment Plan
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 font-medium">
          Answer 6 quick questions to discover essential machinery, electrical needs, and deterministic TCO.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-[#0b2545] h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Voice Assistant Shortcut Bar */}
      <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0b2545] text-amber-300 flex items-center justify-center shrink-0">
            {isListening ? <MicOff size={16} className="animate-pulse text-rose-400" /> : <Mic size={16} />}
          </div>
          <div>
            <strong className="font-black text-stone-900 block">{t('equipment.voice_assisted_filling', { defaultValue: 'Voice-Assisted Form Filling' })}</strong>
            <span className="text-[11px] text-stone-600">
              {voiceTranscript || t('equipment.voice_form_hint', { defaultValue: 'Speak in Marathi, Hindi, or English (e.g. "Dairy business, 2 Lakh budget")' })}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[44px] shrink-0 ${
            isListening ? 'bg-rose-600 text-white' : 'bg-[#0b2545] hover:bg-[#13315c] text-white'
          }`}
        >
          <Mic size={14} />
          <span>{isListening ? 'Stop' : 'Voice Input'}</span>
        </button>
      </div>

      {/* Form Card wrapped in Animated Vertical Stepper */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Stepper
          orientation="vertical"
          activeStep={currentStep}
          onStepChange={(step) => setCurrentStep(step)}
          className="space-y-4"
        >
          {/* STEP 1: BUSINESS TYPE */}
          <Step
            stepNumber={1}
            title={t('equipment.category_activity', { defaultValue: 'Business Category & Activity' })}
            description="We will match verified KVK machinery specifications designed for this industry."
            completed={currentStep > 1}
            summary={
              <span className="text-xs font-semibold text-stone-700">
                {businessType} ({businessCategories.find(c => c.id === businessType)?.label})
              </span>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {businessCategories.map((cat) => {
                  const isSelected = businessType === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setBusinessType(cat.id);
                      }}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[58px] ${
                        isSelected
                          ? 'border-[#0b2545] bg-blue-50/60 shadow-xs ring-2 ring-[#0b2545]/20'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{cat.icon}</span>
                      <div className="space-y-0.5">
                        <strong className="text-xs font-bold text-stone-900 block leading-tight">
                          {cat.label}
                        </strong>
                        <span className="text-[11px] text-stone-500 font-medium block">
                          {i18n.language === 'mr' ? cat.labelMr : cat.labelHi}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <StepActions
                primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
                onNext={() => setCurrentStep(2)}
              />
            </div>
          </Step>

          {/* STEP 2: LOCATION */}
          <Step
            stepNumber={2}
            title={t('equipment.location_cluster', { defaultValue: 'Facility Location & Cluster' })}
            description="Used to determine local freight, technician proximity, and state & district scheme applicability."
            completed={currentStep > 2}
            summary={
              <span className="text-xs font-semibold text-stone-700">
                {district}, {state} • {locationType} Cluster
              </span>
            }
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      State / Union Territory
                    </label>
                    <select
                      value={state}
                      onChange={handleStateChange}
                      className="w-full p-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-stone-50 focus:outline-none focus:border-[#0b2545] min-h-[44px]"
                    >
                      {availableStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800 block mb-1">
                      District
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-stone-50 focus:outline-none focus:border-[#0b2545] min-h-[44px]"
                    >
                      {availableDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Settlement Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Rural', 'Semi-Urban', 'Urban'].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocationType(loc)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all min-h-[44px] ${
                          locationType === loc
                            ? 'bg-[#0b2545] text-white border-[#0b2545]'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <StepActions
                onBack={() => setCurrentStep(1)}
                primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
                onNext={() => setCurrentStep(3)}
              />
            </div>
          </Step>

          {/* STEP 3: AVAILABLE BUDGET */}
          <Step
            stepNumber={3}
            title={t('equipment.capital_budget', { defaultValue: 'Available Capital Budget' })}
            description="Total seed funding for machinery, installation, power line, transit, and initial raw material."
            completed={currentStep > 3}
            summary={
              <span className="text-xs font-semibold text-stone-700">
                {formatIndianCurrency(budget)} Capital Outlay
              </span>
            }
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-stone-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="10000"
                    max="10000000"
                    step="5000"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-stone-300 font-black text-lg text-stone-900 bg-stone-50 focus:outline-none focus:border-[#0b2545] min-h-[48px]"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {budgetPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setBudget(preset.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all min-h-[40px] ${
                        budget === preset.value
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#0b2545] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info size={14} />
                    <span>Promoter Self-Funding Rule:</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    If machinery requirements exceed {formatIndianCurrency(budget)}, the advisor will automatically compute the exact funding gap and match government credit subsidies.
                  </p>
                </div>
              </div>

              <StepActions
                onBack={() => setCurrentStep(2)}
                primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
                onNext={() => setCurrentStep(4)}
              />
            </div>
          </Step>

          {/* STEP 4: PRODUCTION REQUIREMENT */}
          <Step
            stepNumber={4}
            title={t('equipment.daily_prod', { defaultValue: 'Daily Production Requirement' })}
            description="Ensures we suggest machinery with the right motor HP and output volume."
            completed={currentStep > 4}
            summary={
              <span className="text-xs font-semibold text-stone-700">
                {productionRequirement}
              </span>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2.5">
                {productionTiers.map((tier) => {
                  const isSelected = productionRequirement === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setProductionRequirement(tier.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all min-h-[50px] ${
                        isSelected
                          ? 'border-[#0b2545] bg-blue-50/60 ring-2 ring-[#0b2545]/20'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <strong className="text-xs font-bold text-stone-900 block">{tier.label}</strong>
                      <span className="text-[11px] text-stone-500">{tier.desc}</span>
                    </button>
                  );
                })}
              </div>

              <StepActions
                onBack={() => setCurrentStep(3)}
                primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
                onNext={() => setCurrentStep(5)}
              />
            </div>
          </Step>

          {/* STEP 5: EQUIPMENT PREFERENCE */}
          <Step
            stepNumber={5}
            title={t('equipment.new_vs_used', { defaultValue: 'New vs Used Equipment Preference' })}
            description="Used machines require lower initial CapEx but carry mechanical wear risks."
            completed={currentStep > 5}
            summary={
              <span className="text-xs font-semibold text-stone-700">
                {equipmentPreference === 'new' ? 'New Machinery (Recommended)' : (equipmentPreference === 'used' ? 'Quality Used Machinery' : 'Compare Both Options')}
              </span>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2.5">
                {[
                  { id: 'new', title: 'New Machinery (Recommended)', desc: '100% manufacturer warranty, full GST input credit, eligible for standard bank subsidies' },
                  { id: 'used', title: 'Consider Quality Used Machinery', desc: 'Lower upfront capital requirement; you can use our Camera Inspection tool to check wear risk' },
                  { id: 'any', title: 'Either / Compare Options', desc: 'Show both new benchmark pricing and used considerations' }
                ].map((pref) => {
                  const isSelected = equipmentPreference === pref.id;
                  return (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setEquipmentPreference(pref.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all min-h-[50px] ${
                        isSelected
                          ? 'border-[#0b2545] bg-blue-50/60 ring-2 ring-[#0b2545]/20'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <strong className="text-xs font-bold text-stone-900 block">{pref.title}</strong>
                      <span className="text-[11px] text-stone-500">{pref.desc}</span>
                    </button>
                  );
                })}
              </div>

              <StepActions
                onBack={() => setCurrentStep(4)}
                primaryText={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
                onNext={() => setCurrentStep(6)}
              />
            </div>
          </Step>

          {/* STEP 6: ELECTRICITY AVAILABILITY */}
          <Step
            stepNumber={6}
            title={t('equipment.power_supply', { defaultValue: 'Electrical Power Supply at Site' })}
            description="Many heavy processing machines require three-phase industrial lines."
            completed={currentStep > 6}
            summary={
              <span className="text-xs font-semibold text-stone-700">
                {electricityAvailability === 'three_phase' ? 'Three Phase (415V Industrial)' : (electricityAvailability === 'solar' ? 'Solar / Off-Grid' : 'Single Phase (230V Standard Domestic)')}
              </span>
            }
          >
            <div className="space-y-4">
              <div className="space-y-2.5">
                {[
                  { 
                    id: 'single_phase', 
                    title: 'Single Phase (230V Standard Domestic/Rural)', 
                    desc: 'Supports up to 2HP to 3HP motors (e.g. small chaff cutter, domestic grinder, pouch sealer)' 
                  },
                  { 
                    id: 'three_phase', 
                    title: 'Three Phase (415V Industrial/Commercial)', 
                    desc: 'Required for commercial dal mills, 5HP atta chakki, bulk milk coolers & pulverizers' 
                  },
                  { 
                    id: 'solar', 
                    title: 'Solar Powered / Off-Grid Direct Drive', 
                    desc: 'Equipped with solar PV panels & VFD drive for reliable daytime operation without MSEDCL grid reliance' 
                  }
                ].map((elec) => {
                  const isSelected = electricityAvailability === elec.id;
                  return (
                    <button
                      key={elec.id}
                      type="button"
                      onClick={() => setElectricityAvailability(elec.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all min-h-[50px] ${
                        isSelected
                          ? 'border-[#0b2545] bg-blue-50/60 ring-2 ring-[#0b2545]/20'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap size={14} className={isSelected ? 'text-[#0b2545]' : 'text-stone-400'} />
                        <strong className="text-xs font-bold text-stone-900 block">{elec.title}</strong>
                      </div>
                      <span className="text-[11px] text-stone-500 pl-5 block mt-0.5">{elec.desc}</span>
                    </button>
                  );
                })}
              </div>

              <StepActions
                onBack={() => setCurrentStep(5)}
                primaryText={t('equipment.create_plan_btn', { defaultValue: 'Create My Equipment Plan' })}
                onNext={handleSubmit}
              />
            </div>
          </Step>
        </Stepper>
      </form>

    </div>
  );
}
