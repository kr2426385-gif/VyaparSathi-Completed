import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wrench, 
  Camera, 
  UploadCloud, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  Zap, 
  Building2, 
  MapPin, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Eye, 
  ArrowRight, 
  Layers, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { apiService } from '../../services/api.js';
import { formatIndianCurrency } from '../../utils/calculations.js';
import { getAllIndianStates, getDistrictsByState } from '../../utils/panIndiaLocations.js';
import { Stepper, Step, StepActions } from '../../components/ui/index.jsx';
import { getLocalizedBusinessType, getLocalizedCapacity, getLocalizedEquipmentText } from '../../utils/businessLocalization.js';

// Verified fallback equipment catalog (KVK / MSME Benchmarks)
const DEFAULT_CATALOG = [
  {
    id: 'eq_dairy_01',
    name: 'Automatic Dual-Bucket Milking Machine',
    nameMr: 'स्वयंचलित दुहेरी बादली मिल्किंग मशीन',
    nameHi: 'ऑटोमैटिक डबल बाल्टी मिल्किंग मशीन',
    category: 'Dairy & Cattle',
    businessTypes: ['Dairy & Cattle', 'Dairy Farming', 'Milk Processing'],
    purpose: 'Hygienic milking of 10-15 cows/buffaloes per hour with pulsation cycle control.',
    purposeMr: 'ताशी १० ते १५ गायी-म्हशींचे स्वच्छ व जलद दुध काढणे.',
    purposeHi: 'प्रति घंटे 10-15 गाय-भैंसों का स्वच्छ एवं तीव्र दूध दोहन।',
    approxPrice: '₹45,000 - ₹68,000',
    minPrice: 45000,
    maxPrice: 68000,
    capacity: '15 animals/hour',
    capacityMr: '१५ जनावरे / तास',
    capacityHi: '15 पशु / घंटा',
    power: '1 HP (Single Phase 230V)',
    powerMr: '१ एचपी (सिंगल फेज २३०V)',
    powerHi: '1 एचपी (सिंगल फेज 230V)',
    suitableFor: 'Dairy Farm (5+ cattle)'
  },
  {
    id: 'eq_dairy_02',
    name: 'Motorized Chaff Cutter (3HP Heavy Duty)',
    nameMr: 'मोटराइज्ड कडबा कुट्टी मशीन (३ एचपी)',
    nameHi: 'मोटराइज्ड कड़बी कुट्टी मशीन (3 एचपी)',
    category: 'Dairy & Cattle',
    businessTypes: ['Dairy & Cattle', 'Dairy Farming', 'Cattle Feed'],
    purpose: 'Cutting green and dry fodder into fine digestible pieces for livestock.',
    purposeMr: 'ओला व सुका चारा लहान तुकड्यांमध्ये जलद कापणे.',
    purposeHi: 'हरा व सूखा चारा पशुओं के लिए बारीक टुकड़ों में काटना।',
    approxPrice: '₹28,000 - ₹38,000',
    minPrice: 28000,
    maxPrice: 38000,
    capacity: '600 kg/hour',
    capacityMr: '६०० किलो / तास',
    capacityHi: '600 किग्रा / घंटा',
    power: '3 HP (Single/3-Phase)',
    powerMr: '३ एचपी (सिंगल किंवा ३-फेज)',
    powerHi: '3 एचपी (सिंगल या 3-फेज)',
    suitableFor: 'Dairy & Goat Farming'
  },
  {
    id: 'eq_dairy_03',
    name: 'Bulk Milk Cooler (BMC 500 Liters)',
    nameMr: 'बल्क मिल्क कुलर (५०० लिटर)',
    nameHi: 'बल्क मिल्क कूलर (500 लीटर)',
    category: 'Dairy & Cattle',
    businessTypes: ['Dairy & Cattle', 'Milk Processing'],
    purpose: 'Chilling pooled milk from 35°C to 4°C within 3 hours to prevent spoilage.',
    purposeMr: 'दुध तातडीने ४°C पर्यंत थंड करून टिकवणे.',
    purposeHi: 'दूध को तुरंत 4°C तक ठंडा कर खराब होने से बचाना।',
    approxPrice: '₹2,40,000 - ₹3,20,000',
    minPrice: 240000,
    maxPrice: 320000,
    capacity: '500 Liters/batch',
    capacityMr: '५०० लिटर / बॅच',
    capacityHi: '500 लीटर / बैच',
    power: '4.5 HP (3-Phase 415V)',
    powerMr: '४.५ एचपी (३-फेज ४१५V)',
    powerHi: '4.5 एचपी (3-फेज 415V)',
    suitableFor: 'Village Dairy Collection Center'
  },
  {
    id: 'eq_flour_01',
    name: 'Commercial Pulverizer Flour Mill (5HP)',
    nameMr: 'व्यावसायिक पल्व्हरायझर पीठ गिरणी (५ एचपी)',
    nameHi: 'कमर्शियल पल्वराइज़र आटा चक्की (5 एचपी)',
    category: 'Flour & Dal Processing',
    businessTypes: ['Flour & Dal Processing', 'Food Processing'],
    purpose: 'Fine grinding of wheat, jowar, maize, and gram with cyclone dust separator.',
    purposeMr: 'गहू, ज्वारी, मका व डाळींचे बारीक दळण.',
    purposeHi: 'गेहूं, ज्वार, मक्का व दालों की बारीक पिसाई।',
    approxPrice: '₹55,000 - ₹78,000',
    minPrice: 55000,
    maxPrice: 78000,
    capacity: '40 - 60 kg/hour',
    capacityMr: '४० - ६० किलो / तास',
    capacityHi: '40 - 60 किग्रा / घंटा',
    power: '5 HP (3-Phase 415V)',
    powerMr: '५ एचपी (३-फेज ४१५V)',
    powerHi: '5 एचपी (3-फेज 415V)',
    suitableFor: 'Rural & Semi-Urban Flour Mills'
  },
  {
    id: 'eq_flour_02',
    name: 'Mini Dal Mill (Dehulling & Splitting)',
    nameMr: 'मिनी डाळ मिल (डाळ प्रक्रिया यंत्र)',
    nameHi: 'मिनी दाल मिल (दाल प्रसंस्करण इकाई)',
    category: 'Flour & Dal Processing',
    businessTypes: ['Flour & Dal Processing', 'Food Processing'],
    purpose: 'Dehusking and splitting tur, moong, and chana pulses with grading sieve.',
    purposeMr: 'तूर, मूग, हरभरा डाळ सोलणे व प्रतवारी करणे.',
    purposeHi: 'अरहर, मूंग व चना दाल की छिलाई व ग्रेडिंग।',
    approxPrice: '₹95,000 - ₹1,40,000',
    minPrice: 95000,
    maxPrice: 140000,
    capacity: '100 - 150 kg/hour',
    capacityMr: '१०० - १५० किलो / तास',
    capacityHi: '100 - 150 किग्रा / घंटा',
    power: '3 HP (Single/3-Phase)',
    powerMr: '३ एचपी (सिंगल किंवा ३-फेज)',
    powerHi: '3 एचपी (सिंगल या 3-फेज)',
    suitableFor: 'Village Pulse Processing Units'
  },
  {
    id: 'eq_oil_01',
    name: 'Cold Press Wooden Oil Expeller (Lakdi Ghana)',
    nameMr: 'लाकडी घाणा कोल्ड प्रेस तेल यंत्र',
    nameHi: 'लकड़ी घाना कोल्ड प्रेस्ड तेल मशीन',
    category: 'Oil Extraction',
    businessTypes: ['Oil Extraction', 'Food Processing'],
    purpose: 'Traditional cold extraction of peanut, sesame, and mustard edible oils.',
    purposeMr: 'शेंगदाणा, तीळ, मोहरीचे शुद्ध लाकडी घाणा तेल काढणे.',
    purposeHi: 'मूंगफली, तिल, सरसों का शुद्ध कोल्ड प्रेस्ड तेल निकालना।',
    approxPrice: '₹1,10,000 - ₹1,65,000',
    minPrice: 110000,
    maxPrice: 165000,
    capacity: '12 - 18 kg/batch',
    capacityMr: '१२ - १८ किलो / बॅच',
    capacityHi: '12 - 18 किग्रा / बैच',
    power: '2 HP (Single Phase 230V)',
    powerMr: '२ एचपी (सिंगल फेज २३०V)',
    powerHi: '2 एचपी (सिंगल फेज 230V)',
    suitableFor: 'Pure Cold-Pressed Oil Enterprise'
  },
  {
    id: 'eq_spice_01',
    name: 'Heavy Duty Spice Grinder & Turmeric Crusher (3HP)',
    nameMr: 'मसाला व हळद ग्राईंडर मशीन (३ एचपी)',
    nameHi: 'मसाला व हल्दी ग्राइंडर मशीन (3 एचपी)',
    category: 'Spices & Condiments',
    businessTypes: ['Spices & Condiments', 'Food Processing'],
    purpose: 'Coarse and fine pulverizing of dried red chilies, turmeric, coriander, and garam masala.',
    purposeMr: 'हळद, मिरची, धने व गरम मसाल्यांचे बारीक दळण.',
    purposeHi: 'हल्दी, मिर्च, धनिया व मसालों की बारीक पिसाई।',
    approxPrice: '₹35,000 - ₹48,000',
    minPrice: 35000,
    maxPrice: 48000,
    capacity: '25 - 40 kg/hour',
    capacityMr: '२५ - ४० किलो / तास',
    capacityHi: '25 - 40 किग्रा / घंटा',
    power: '3 HP (Single Phase 230V)',
    powerMr: '३ एचपी (सिंगल फेज २३०V)',
    powerHi: '3 एचपी (सिंगल फेज 230V)',
    suitableFor: 'Local Spices & SHG Units'
  }
];

const BUSINESS_OPTIONS = [
  { value: 'Dairy & Cattle', en: 'Dairy & Cattle Farming', mr: 'दुग्धव्यवसाय व पशुपालन', hi: 'डेयरी एवं पशुपालन' },
  { value: 'Flour & Dal Processing', en: 'Flour Mill & Dal Processing', mr: 'पीठ गिरणी व डाळ प्रक्रिया', hi: 'आटा मिल एवं दाल प्रसंस्करण' },
  { value: 'Oil Extraction', en: 'Cold Press Oil Extraction', mr: 'लाकडी घाणा तेल गाळणी', hi: 'कोल्ड प्रेस तेल निष्कर्षण' },
  { value: 'Spices & Condiments', en: 'Spices & Masala Grinding', mr: 'मसाला व हळद प्रक्रिया', hi: 'मसाला एवं हल्दी पिसाई' },
  { value: 'Solar & Cold Chain', en: 'Solar Cold Storage & Drying', mr: 'सौर कोल्ड स्टोरेज व ड्रायिंग', hi: 'सोलर कोल्ड स्टोरेज एवं ड्रायिंग' },
  { value: 'Food Processing', en: 'Food & Agro Processing', mr: 'अन्न प्रक्रिया उद्योग', hi: 'खाद्य एवं कृषि प्रसंस्करण' },
  { value: 'Agri Workshop', en: 'Agri Implements & Workshop', mr: 'कृषी अवजारे व कार्यशाळा', hi: 'कृषि उपकरण एवं कार्यशाला' }
];

const CAPACITY_OPTIONS = [
  { 
    value: 'Small (50 - 200 kg/day)', 
    en: 'Small (50 - 200 kg/day or 5-10 cattle)', 
    mr: 'लहान (५० ते २०० किलो/दिवस किंवा ५-१० जनावरे)', 
    hi: 'लघु (50 से 200 किग्रा/दिन या 5-10 पशु)' 
  },
  { 
    value: 'Medium (200 - 500 kg/day)', 
    en: 'Medium (200 - 500 kg/day or 10-25 cattle)', 
    mr: 'मध्यम (२०० ते ५०० किलो/दिवस किंवा १०-२५ जनावरे)', 
    hi: 'मध्यम (200 से 500 किग्रा/दिन या 10-25 पशु)' 
  },
  { 
    value: 'Large (500+ kg/day)', 
    en: 'Large (500+ kg/day or commercial dairy)', 
    mr: 'मोठे (५००+ किलो/दिवस किंवा व्यावसायिक डेअरी)', 
    hi: 'बड़ा (500+ किग्रा/दिन या व्यावसायिक डेयरी)' 
  }
];

const ELECTRICITY_OPTIONS = [
  {
    value: 'single_phase',
    en: 'Single Phase (230V Domestic / Light Connection)',
    mr: 'सिंगल फेज (२३०V घरगुती / लाइट कनेक्शन)',
    hi: 'सिंगल फेज (230V घरेलू / लाइट कनेक्शन)'
  },
  {
    value: 'three_phase',
    en: 'Three Phase (415V Agricultural / Industrial 3-Phase)',
    mr: 'थ्री फेज (४१५V शेती / औद्योगिक थ्री-फेज)',
    hi: 'थ्री फेज (415V कृषि / औद्योगिक थ्री-फेज)'
  }
];

const getMachinePurposePlaceholder = (bType, lang) => {
  if (bType?.includes('Dairy')) {
    if (lang === 'mr') return 'उदा. दुध काढणे किंवा चारा कापणे';
    if (lang === 'hi') return 'उदा. दूध दोहन या चारा काटना';
    return 'e.g. Milking or chaff cutting';
  }
  if (bType?.includes('Flour')) {
    if (lang === 'mr') return 'उदा. गहू, ज्वारी किंवा डाळ दळणे';
    if (lang === 'hi') return 'उदा. गेहूं, ज्वारी या दाल पिसाई';
    return 'e.g. Grinding wheat, jowar, or dal';
  }
  if (lang === 'mr') return 'उदा. मुख्य उत्पादन किंवा पॅकिंग';
  if (lang === 'hi') return 'उदा. मुख्य उत्पादन या पैकिंग';
  return 'e.g. Primary processing or packaging';
};

export default function EquipmentPage({ user, onNavigate, initialTab }) {
  const { t, i18n } = useTranslation();
  const lang = i18n?.language?.startsWith('mr') ? 'mr' : i18n?.language?.startsWith('hi') ? 'hi' : 'en';
  const location = useLocation();
  const navigate = useNavigate();
  const { subview } = useParams();

  // Primary Tab: 'equipment' (Choose, Compare, Manage) vs 'testing' (Photo Check via Gemini Vision)
  const isTestingUrl = location.pathname.includes('/testing') || 
                       location.pathname.includes('/equipment-test') || 
                       initialTab === 'testing' || 
                       subview === 'testing';
  const [activePrimaryTab, setActivePrimaryTab] = useState(isTestingUrl ? 'testing' : 'equipment');

  useEffect(() => {
    if (location.pathname.includes('/testing') || location.pathname.includes('/equipment-test') || initialTab === 'testing') {
      setActivePrimaryTab('testing');
    } else if (location.pathname === '/equipment' || location.pathname === '/equipment/') {
      setActivePrimaryTab('equipment');
    }
  }, [location.pathname, initialTab]);

  const handlePrimaryTabChange = (tab) => {
    setActivePrimaryTab(tab);
    if (tab === 'testing') {
      navigate('/equipment/testing');
    } else {
      navigate('/equipment');
    }
  };

  // =========================================================================
  // TAB 1: EQUIPMENT PLANNING (4-STEP WORKFLOW)
  // =========================================================================
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // STEP 1 State: "1. What do you need?"
  const [businessType, setBusinessType] = useState('Dairy & Cattle');
  const [machinePurpose, setMachinePurpose] = useState('');
  const [capacityNeed, setCapacityNeed] = useState('Medium (200 - 500 kg/day)');
  const availableStates = getAllIndianStates ? getAllIndianStates() : ['Maharashtra'];
  const [state, setState] = useState('Maharashtra');
  const availableDistricts = getDistrictsByState ? getDistrictsByState(state) : ['Satara', 'Pune'];
  const [district, setDistrict] = useState(availableDistricts[0] || 'Satara');
  const [budget, setBudget] = useState(150000);
  const [electricityType, setElectricityType] = useState('single_phase');

  // STEP 2 State: "2. Find a suitable machine"
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [selectedMachineId, setSelectedMachineId] = useState('eq_dairy_02');
  const [comparedMachineIds, setComparedMachineIds] = useState(['eq_dairy_01', 'eq_dairy_02']);

  // STEP 4 State: "4. My equipment"
  const [myEquipment, setMyEquipment] = useState([
    {
      _id: 'm1',
      equipmentName: 'Motorized Chaff Cutter (3HP)',
      modelNumber: 'CC-3000 Heavy',
      serialNumber: 'MH-STR-2025-091',
      purchaseDate: '2025-11-15',
      purchasePrice: 34000,
      supplierName: 'Kirloskar Agro Machinery (Satara)',
      status: 'active',
      nextMaintenanceDate: '2026-10-15',
      lastServiceDate: '2026-03-10'
    }
  ]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([
    {
      id: 'mr1',
      serviceDate: '2026-03-10',
      serviceType: 'Routine Blade Sharpening & Lubrication',
      technician: 'Ramesh Agro Workshop',
      cost: 450,
      notes: 'Drive belt tension adjusted. Blade gap aligned to 1.5mm.'
    }
  ]);
  const [showAddMachineModal, setShowAddMachineModal] = useState(false);
  const [showAddMaintModal, setShowAddMaintModal] = useState(false);

  // New Machine form state
  const [newEqName, setNewEqName] = useState('');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqPrice, setNewEqPrice] = useState('');
  const [newEqSupplier, setNewEqSupplier] = useState('');
  const [newEqDate, setNewEqDate] = useState('');

  // New Maintenance form state
  const [newMaintType, setNewMaintType] = useState('preventive');
  const [newMaintTech, setNewMaintTech] = useState('');
  const [newMaintCost, setNewMaintCost] = useState('');
  const [newMaintNotes, setNewMaintNotes] = useState('');
  const [newMaintNextDue, setNewMaintNextDue] = useState('');

  // Upgrade advice state
  const [upgradeAdvice, setUpgradeAdvice] = useState(null);
  const [loadingUpgrade, setLoadingUpgrade] = useState(false);

const formatCapacityValue = (cap) => {
  if (!cap) return '';
  if (typeof cap === 'string') return cap;
  if (typeof cap === 'object' && cap.amount !== undefined) {
    return `${cap.amount} ${cap.unit || ''}`.trim();
  }
  return String(cap);
};

  // Load catalog & user equipment from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const catRes = await apiService.getEquipmentCatalog({ businessType });
        if (isMounted && catRes && Array.isArray(catRes.catalog) && catRes.catalog.length > 0) {
          const normalized = catRes.catalog.map(item => ({
            ...item,
            capacity: formatCapacityValue(item.capacity)
          }));
          setCatalog(normalized);
        }
      } catch (e) {
        // Fallback already in state
      }

      try {
        const myRes = await apiService.getMyEquipment();
        if (isMounted && myRes && Array.isArray(myRes.equipmentList) && myRes.equipmentList.length > 0) {
          setMyEquipment(myRes.equipmentList);
        }
      } catch (e) {
        // Fallback already in state
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [businessType]);

  const fetchUpgrade = async () => {
    setLoadingUpgrade(true);
    try {
      const res = await apiService.getUpgradeAdvice({
        currentEquipmentName: myEquipment[0]?.equipmentName || 'Chaff Cutter',
        currentCapacity: 100,
        currentProduction: 85,
        businessDemand: 'High'
      });
      setUpgradeAdvice(res);
    } catch (e) {
      setUpgradeAdvice({
        shouldUpgrade: false,
        utilizationRate: 75,
        recommendation: i18n.language === 'mr'
          ? 'सध्याच्या उत्पादनासाठी हे यंत्र पुरेसे आहे. उत्पादन वाढल्यावर आधुनिकीकरण करा.'
          : (i18n.language === 'hi'
            ? 'वर्तमान उत्पादन के लिए यह मशीन पर्याप्त है। ऑर्डर बढ़ने पर अपग्रेड करें।'
            : 'Current machinery capacity is adequate. Upgrade when order volume increases.')
      });
    } finally {
      setLoadingUpgrade(false);
    }
  };

  const handleSaveNewMachine = async (e) => {
    e.preventDefault();
    if (!newEqName) return;
    const newEntry = {
      _id: 'eq_' + Date.now(),
      equipmentName: newEqName,
      modelNumber: newEqModel || 'Standard',
      serialNumber: newEqSerial || 'VS-' + Math.floor(1000 + Math.random() * 9000),
      purchaseDate: newEqDate || new Date().toISOString().split('T')[0],
      purchasePrice: Number(newEqPrice) || 35000,
      supplierName: newEqSupplier || 'Verified Dealer',
      status: 'active',
      nextMaintenanceDate: '2026-11-01',
      lastServiceDate: 'Initial Setup'
    };
    try {
      await apiService.registerEquipmentPassport(newEntry);
    } catch (err) {
      // Offline fallback
    }
    setMyEquipment(prev => [newEntry, ...prev]);
    setShowAddMachineModal(false);
    setNewEqName('');
    setNewEqModel('');
    setNewEqSerial('');
    setNewEqPrice('');
    setNewEqSupplier('');
  };

  const handleSaveMaintenance = async (e) => {
    e.preventDefault();
    const newRecord = {
      id: 'mr_' + Date.now(),
      serviceDate: new Date().toISOString().split('T')[0],
      serviceType: newMaintType === 'preventive' ? 'Routine Service & Check' : 'Repair / Parts Replacement',
      technician: newMaintTech || 'Local Mechanic',
      cost: Number(newMaintCost) || 0,
      notes: newMaintNotes || 'Serviced and verified operation.'
    };
    try {
      await apiService.addMaintenanceRecord(newRecord);
    } catch (err) {
      // Offline fallback
    }
    setMaintenanceRecords(prev => [newRecord, ...prev]);
    setShowAddMaintModal(false);
    setNewMaintTech('');
    setNewMaintCost('');
    setNewMaintNotes('');
  };

  // Toggle machine for comparison (max 3)
  const toggleCompare = (id) => {
    setComparedMachineIds(prev => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter(x => x !== id) : prev;
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], id];
      }
      return [...prev, id];
    });
  };

  // Get filtered machines for business type
  const displayedMachines = catalog.filter(m => {
    if (!businessType) return true;
    const bLower = businessType.toLowerCase();
    return (m.category && m.category.toLowerCase().includes(bLower.split(' ')[0])) ||
           (Array.isArray(m.businessTypes) && m.businessTypes.some(bt => bt.toLowerCase().includes(bLower.split(' ')[0])));
  }).length > 0 ? catalog.filter(m => {
    const bLower = businessType.toLowerCase();
    return (m.category && m.category.toLowerCase().includes(bLower.split(' ')[0])) ||
           (Array.isArray(m.businessTypes) && m.businessTypes.some(bt => bt.toLowerCase().includes(bLower.split(' ')[0])));
  }) : catalog;

  // Selected machines to compare
  const comparedMachines = catalog.filter(m => comparedMachineIds.includes(m.id));

  // =========================================================================
  // TAB 2: EQUIPMENT TESTING (PHOTO -> GEMINI VISION CHECK -> RESULT)
  // =========================================================================
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [testingBusinessType, setTestingBusinessType] = useState(businessType || 'Dairy & Cattle');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');
  const [visionStatus, setVisionStatus] = useState({ reachable: true, model: 'gemini-3.8-flash' });

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check Gemini Vision status when on testing tab
  useEffect(() => {
    let isMounted = true;
    if (activePrimaryTab !== 'testing') return;
    async function checkStatus() {
      try {
        const res = await apiService.getVisionStatus();
        if (isMounted && res) {
          setVisionStatus(res);
        }
      } catch (err) {
        if (isMounted) setVisionStatus({ reachable: true, model: 'gemini-3.8-flash' });
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, [activePrimaryTab]);

  // Ensure video element plays stream cleanly when ref mounts
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play()?.catch((playErr) => {
        if (playErr.name !== 'AbortError') {
          console.warn('Camera video play error:', playErr);
        }
      });
    }
  }, [isCameraActive]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Camera Management
  const startCamera = async (forceDeviceIndex = null) => {
    setTestError('');
    setImagePreview(null);
    setImageBase64(null);

    // Stop any currently running stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'navigator.mediaDevices.getUserMedia is not available in this browser environment.';
      console.error('[Equipment Camera]', msg);
      setTestError(t('testing_cam_error', 'कॅमेरा सुरू करता आला नाही. कृपया फोटो अपलोड करा किंवा परवानगी द्या.'));
      return;
    }

    try {
      console.log('[Equipment Camera] 1. Requesting initial camera access to acquire permissions...');
      let initialStream;
      try {
        initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch (permErr) {
        console.error('[Equipment Camera] getUserMedia permission failed or denied:', permErr);
        throw permErr;
      }

      console.log('[Equipment Camera] 2. Enumerating available video devices after permission granted...');
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');

      console.log('[Equipment Camera] Total video devices found:', videoDevices.length);
      videoDevices.forEach((d, idx) => {
        console.log(`[Equipment Camera] Device #${idx}:`, {
          deviceId: d.deviceId,
          label: d.label,
          kind: d.kind,
          groupId: d.groupId
        });
      });

      // Filter out IR, Infrared, Hello, Windows Hello, Face, Virtual, OBS, DroidCam, Snap Camera
      // Do NOT reject a camera only because its label is unknown
      const rejectedKeywords = [
        'ir',
        'infrared',
        'hello',
        'windows hello',
        'face',
        'virtual',
        'obs',
        'droidcam',
        'snap camera'
      ];

      const validCameras = videoDevices.filter(d => {
        const lbl = (d.label || '').toLowerCase();
        if (!lbl) return true; // Keep unknown label
        return !rejectedKeywords.some(kw => lbl.includes(kw));
      });

      console.log('[Equipment Camera] Filtered valid RGB cameras:', validCameras.map(c => ({ deviceId: c.deviceId, label: c.label })));
      const candidates = validCameras.length > 0 ? validCameras : videoDevices;
      setAvailableCameras(candidates);

      const targetIndex = forceDeviceIndex !== null 
        ? (forceDeviceIndex % candidates.length)
        : 0;
      setSelectedCameraIndex(targetIndex);

      const selectedDevice = candidates[targetIndex];
      console.log('[Equipment Camera] Selected target camera:', selectedDevice ? { deviceId: selectedDevice.deviceId, label: selectedDevice.label } : 'none');

      let activeStream = initialStream;
      const initialTrack = initialStream.getVideoTracks()[0];
      const initialSettings = initialTrack?.getSettings ? initialTrack.getSettings() : null;

      // If selected device differs from the initial stream device, switch to exact selected deviceId
      if (selectedDevice?.deviceId && initialSettings?.deviceId !== selectedDevice.deviceId) {
        initialStream.getTracks().forEach(t => t.stop());

        console.log(`[Equipment Camera] 3. Starting stream with exact deviceId: "${selectedDevice.deviceId}" at 1280x720...`);
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDevice.deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
        } catch (errHighRes) {
          console.warn('[Equipment Camera] Exact deviceId at 1280x720 failed. Retrying with lower resolution (640x480)...', errHighRes);
          try {
            activeStream = await navigator.mediaDevices.getUserMedia({
              video: {
                deviceId: { exact: selectedDevice.deviceId },
                width: { ideal: 640 },
                height: { ideal: 480 }
              },
              audio: false
            });
          } catch (errLowRes) {
            console.warn('[Equipment Camera] Lower resolution failed. Retrying with video: true...', errLowRes);
            activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
        }
      }

      const activeTrack = activeStream.getVideoTracks()[0];
      if (activeTrack) {
        console.log('[Equipment Camera] Active Video Track Info:', {
          selectedDevice: selectedDevice ? selectedDevice.label || selectedDevice.deviceId : 'default',
          videoTrackReadyState: activeTrack.readyState,
          videoTrackSettings: activeTrack.getSettings ? activeTrack.getSettings() : {},
          videoTrackCapabilities: activeTrack.getCapabilities ? activeTrack.getCapabilities() : {}
        });
      }

      streamRef.current = activeStream;
      setIsCameraActive(true);

      // Play video directly on mounted video element
      if (videoRef.current) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.muted = true;
        videoRef.current.defaultMuted = true;
        try {
          await videoRef.current.play();
          console.log('[Equipment Camera] video.play() successful');
        } catch (playErr) {
          if (playErr.name !== 'AbortError') {
            console.error('[Equipment Camera] video.play() error:', playErr);
          }
        }
      }
    } catch (err) {
      console.error('[Equipment Camera] Camera start error:', err);
      setTestError(t('testing_cam_error', 'कॅमेरा सुरू करता आला नाही. कृपया फोटो अपलोड करा किंवा परवानगी द्या.'));
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    if (availableCameras.length <= 1) {
      // Fallback toggle between user and environment if only single camera or not enumerated
      startCamera();
      return;
    }
    const nextIdx = (selectedCameraIndex + 1) % availableCameras.length;
    startCamera(nextIdx);
  };
  const toggleCameraFacing = switchCamera;

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const canvas = document.createElement('canvas');
      const width = video.videoWidth > 0 ? video.videoWidth : (video.clientWidth || 640);
      const height = video.videoHeight > 0 ? video.videoHeight : (video.clientHeight || 480);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);
        setImageBase64(dataUrl.split(',')[1]);
        stopCamera();
      }
    } catch (e) {
      console.error('Failed to capture photo from video canvas:', e);
      setTestError(t('testing_capture_error', 'फोटो काढण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.'));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTestError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(compressed);
        setImageBase64(compressed);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = handleFileUpload;

  // Run Gemini Machine Analysis
  const handleRunGeminiInspection = async () => {
    if (!imageBase64) {
      setTestError('Please upload a machine photo or take a photo first.');
      return;
    }

    setAnalyzing(true);
    setTestError('');
    setTestResult(null);

    try {
      const response = await apiService.testEquipmentVision({
        imageBase64,
        businessType: testingBusinessType,
        language: i18n.language || 'en'
      });

      if (!response.success && response.error) {
        setTestError(response.userFriendlyMessage || t('testing_vision_error', 'Equipment verification service is temporarily unavailable. Please try again.'));
      } else {
        setTestResult(response);
      }
    } catch (err) {
      console.error('Gemini equipment inspection failed:', err);
      const isDown = err.message?.includes('offline') || err.response?.status === 503 || err.response?.status === 502;
      if (isDown) {
        setTestError(t('testing_vision_error', 'Equipment verification service is temporarily unavailable. Please try again.'));
      } else {
        setTestError(err.response?.data?.userFriendlyMessage || t('testing_vision_error', 'Equipment verification service is temporarily unavailable. Please try again.'));
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResetTesting = () => {
    setImagePreview(null);
    setImageBase64(null);
    setTestResult(null);
    setTestError('');
    stopCamera();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Localized helper (safely formats object values like {amount, unit} to prevent React rendering crashes)
  const getLocalized = (obj, key) => {
    if (!obj) return '';
    const lang = i18n.language;
    let val = obj[key];
    if (lang === 'mr') {
      val = obj[`${key}Mr`] || obj[`nameMr`] || val;
    } else if (lang === 'hi') {
      val = obj[`${key}Hi`] || obj[`nameHi`] || val;
    }

    if (key === 'capacity') {
      return getLocalizedCapacity(val || obj.capacity, lang);
    }

    if (val && typeof val === 'object') {
      if (val.amount !== undefined) {
        return getLocalizedCapacity(val, lang);
      }
      return JSON.stringify(val);
    }

    const translated = getLocalizedEquipmentText(val, lang);
    return translated || val || '';
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      
      {/* 1. TOP HEADER & PRIMARY TABS */}
      <div className="border-b border-stone-200 pb-3 sm:pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
            {activePrimaryTab === 'equipment' 
              ? t('equipment_tab_equipment', { defaultValue: 'Equipment Planning' })
              : t('testing_title', { defaultValue: 'Equipment Testing' })}
          </h1>
        </div>

        {/* 2 Clear Primary Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-200 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handlePrimaryTabChange('equipment')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              activePrimaryTab === 'equipment'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <span>{t('equipment_tab_equipment', 'Equipment')}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePrimaryTabChange('testing')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              activePrimaryTab === 'testing'
                ? 'bg-[#0b2545] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <span>{t('equipment_tab_testing', 'Equipment Testing')}</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: EQUIPMENT (4-STEP GUIDED WORKFLOW)                           */}
      {/* =================================================================== */}
      {activePrimaryTab === 'equipment' && (
        <div className="space-y-4">
          <Stepper
            orientation="vertical"
            activeStep={currentStepIndex}
            onStepChange={(idx) => setCurrentStepIndex(idx)}
          >
            {/* STEP 1: CHOOSE YOUR NEED */}
            <Step
              index={0}
              icon={Wrench}
              title={t('equipment_step1_title', '1. What do you need?')}
              description={t('equipment_step1_desc', 'Choose your business type, work, capacity, and budget')}
              completed={currentStepIndex > 0}
              summary={`${BUSINESS_OPTIONS.find(b => b.value === businessType)?.[lang] || businessType} • ${CAPACITY_OPTIONS.find(c => c.value === capacityNeed)?.[lang] || capacityNeed} • ${district}, ${state} • ₹${Number(budget).toLocaleString(lang === 'en' ? 'en-IN' : 'mr-IN')}`}
            >
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Business Type */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('field_business_type', 'Business Type')}
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545] min-h-[42px]"
                    >
                      {BUSINESS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt[lang] || opt.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* What work will machine do */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('field_machine_purpose', 'What work will the machine do?')}
                    </label>
                    <input
                      type="text"
                      value={machinePurpose}
                      onChange={(e) => setMachinePurpose(e.target.value)}
                      placeholder={getMachinePurposePlaceholder(businessType, lang)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545] min-h-[42px]"
                    />
                  </div>

                  {/* Production Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('field_capacity', 'Required Capacity')}
                    </label>
                    <select
                      value={capacityNeed}
                      onChange={(e) => setCapacityNeed(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545] min-h-[42px]"
                    >
                      {CAPACITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt[lang] || opt.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'mr' ? 'राज्य' : lang === 'hi' ? 'राज्य' : 'State'}
                    </label>
                    <select
                      value={state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setState(newState);
                        const dists = getDistrictsByState(newState);
                        if (dists && dists.length > 0) setDistrict(dists[0]);
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545] min-h-[42px]"
                    >
                      {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'mr' ? 'जिल्हा' : lang === 'hi' ? 'ज़िला' : 'District'}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545] min-h-[42px]"
                    >
                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Electricity */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('field_electricity', 'Electricity Connection')}
                    </label>
                    <select
                      value={electricityType}
                      onChange={(e) => setElectricityType(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545] min-h-[42px]"
                    >
                      {ELECTRICITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt[lang] || opt.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget selector */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800">{t('field_budget', 'Machine Budget')}:</span>
                    <span className="text-sm font-black text-[#0b2545]">₹{Number(budget).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[50000, 100000, 150000, 300000, 500000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBudget(val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          budget === val
                            ? 'bg-[#0b2545] text-white border-[#0b2545]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        ₹{(val / 100000 >= 1 
                          ? `${val / 100000} ${lang === 'mr' ? 'लाख' : lang === 'hi' ? 'लाख' : 'Lakh'}` 
                          : `${val / 1000}${lang === 'mr' ? ' हजार' : lang === 'hi' ? ' हजार' : 'k'}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <StepActions
                  onNext={() => setCurrentStepIndex(1)}
                  nextLabel={t('equipment.save_and_find_machine', { defaultValue: 'Save & Find Machine →' })}
                  className="pt-2"
                />
              </div>
            </Step>

            {/* STEP 2: FIND A SUITABLE MACHINE */}
            <Step
              index={1}
              icon={Building2}
              title={t('equipment_step2_title', '2. Find a suitable machine')}
              description={t('equipment_step2_desc', 'Browse verified equipment catalog and select a machine')}
              completed={currentStepIndex > 1}
              summary={
                selectedMachineId 
                  ? `Selected: ${getLocalized(catalog.find(m => m.id === selectedMachineId) || {}, 'name')} (${catalog.find(m => m.id === selectedMachineId)?.approxPrice})`
                  : 'Machine selected from catalog'
              }
            >
              <div className="space-y-4 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <p className="text-xs font-semibold text-stone-600">
                    {displayedMachines.length} {t('equipment.verified_machines_found', { defaultValue: 'verified machines found for' })} <strong>{BUSINESS_OPTIONS.find(b => b.value === businessType)?.[lang] || businessType}</strong>
                  </p>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    KVK & MSME Benchmarks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {displayedMachines.map((item) => {
                    const isSelected = selectedMachineId === item.id;
                    const isCompared = comparedMachineIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500/20'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                              {item.category}
                            </span>
                            <h3 className="text-sm font-black text-stone-900 leading-tight pt-1">
                              {getLocalized(item, 'name')}
                            </h3>
                            <p className="text-xs text-stone-600 font-medium leading-relaxed">
                              {getLocalized(item, 'purpose')}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100 text-xs">
                          <div>
                            <span className="text-stone-600 text-[11px] block">{t('equipment.prod_capacity', { defaultValue: 'Capacity' })}</span>
                            <strong className="text-stone-800 font-bold">{getLocalized(item, 'capacity')}</strong>
                          </div>
                          <div>
                            <span className="text-stone-600 text-[11px] block">{t('equipment.power_req', { defaultValue: 'Power' })}</span>
                            <strong className="text-stone-800 font-bold">{getLocalized(item, 'power')}</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-stone-600 text-[11px] block">{t('equipment.approx_price', { defaultValue: 'Approximate Price' })}</span>
                            <span className="text-sm font-extrabold text-[#0b2545]">{item.approxPrice}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-stone-100">
                          <label className="flex items-center gap-1.5 text-[11px] font-bold text-stone-600 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => toggleCompare(item.id)}
                              className="rounded text-[#0b2545] focus:ring-0"
                            />
                            <span>{t('equipment.compare', { defaultValue: 'Compare' })}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setSelectedMachineId(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#0b2545] hover:bg-[#13315c] text-white'
                            }`}
                          >
                            {isSelected ? t('btn_selected_machine', 'Selected ✓') : t('btn_choose_machine', 'Choose this machine')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <StepActions
                  onBack={() => setCurrentStepIndex(0)}
                  onNext={() => setCurrentStepIndex(2)}
                  nextLabel={t('equipment.compare_selected_machines', { defaultValue: 'Compare Selected Machines →' })}
                  className="pt-2"
                />
              </div>
            </Step>

            {/* STEP 3: COMPARE MACHINES */}
            <Step
              index={2}
              icon={Layers}
              title={t('equipment_step3_title', '3. Compare machines')}
              description={t('equipment_step3_desc', 'Compare price, capacity, power, and suitability')}
              completed={currentStepIndex > 2}
              summary={`${comparedMachines.length} machines compared side-by-side`}
            >
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <p className="text-xs font-semibold text-stone-600">
                    Comparing {comparedMachines.length} selected machines:
                  </p>
                  <span className="text-[11px] text-stone-600">{t('equipment.select_deselect_hint', { defaultValue: 'Select/deselect from Step 2 anytime' })}</span>
                </div>

                {/* Comparison Table / Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200">
                        <th className="p-3 font-bold text-stone-600 w-1/4">{t('equipment.specification', { defaultValue: 'Specification' })}</th>
                        {comparedMachines.map(m => (
                          <th key={m.id} className="p-3 font-black text-stone-900">
                            {getLocalized(m, 'name')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr>
                        <td className="p-3 font-bold text-stone-600 bg-stone-50/50">{t('equipment.approx_price', { defaultValue: 'Approximate Price' })}</td>
                        {comparedMachines.map(m => (
                          <td key={m.id} className="p-3 font-extrabold text-[#0b2545]">
                            {m.approxPrice}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-600 bg-stone-50/50">{t('equipment.prod_capacity', { defaultValue: 'Production Capacity' })}</td>
                        {comparedMachines.map(m => (
                          <td key={m.id} className="p-3 font-semibold text-stone-800">
                            {getLocalized(m, 'capacity')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-600 bg-stone-50/50">{t('equipment.power_req', { defaultValue: 'Power Requirement' })}</td>
                        {comparedMachines.map(m => (
                          <td key={m.id} className="p-3 font-semibold text-stone-800">
                            {getLocalized(m, 'power')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-600 bg-stone-50/50">{t('equipment.main_purpose', { defaultValue: 'Main Work / Purpose' })}</td>
                        {comparedMachines.map(m => (
                          <td key={m.id} className="p-3 text-stone-700 leading-relaxed font-medium">
                            {getLocalized(m, 'purpose')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-stone-600 bg-stone-50/50">{t('equipment.suitable_business', { defaultValue: 'Suitable Business' })}</td>
                        {comparedMachines.map(m => (
                          <td key={m.id} className="p-3 font-semibold text-emerald-800">
                            {getLocalizedBusinessType(m.suitableFor || businessType, i18n.language)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <StepActions
                  onBack={() => setCurrentStepIndex(1)}
                  onNext={() => setCurrentStepIndex(3)}
                  nextLabel={t('equipment.continue_to_my_equipment', { defaultValue: 'Continue to My Equipment →' })}
                  className="pt-2"
                />
              </div>
            </Step>

            {/* STEP 4: MY EQUIPMENT */}
            <Step
              index={3}
              icon={ShieldCheck}
              title={t('equipment_step4_title', '4. My equipment')}
              description={t('equipment_step4_desc', 'Equipment passport, service records, and maintenance')}
              completed={false}
            >
              <div className="space-y-5 pt-1">
                {/* Top Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black uppercase text-stone-900">
                      {t('equipment.my_registered_title', { defaultValue: 'My Registered Equipment & Passports' })}
                    </h3>
                    <p className="text-[11px] text-stone-600">
                      {t('equipment.my_registered_desc', { defaultValue: 'Track maintenance, service logs, and get upgrade advice.' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMachineModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus size={14} />
                      <span>{t('btn_add_machine', { defaultValue: 'Add Machine' })}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMaintModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-stone-900 border border-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Clock size={14} className="text-amber-700" />
                      <span>{t('btn_log_service', { defaultValue: 'Log Service' })}</span>
                    </button>
                  </div>
                </div>

                {/* Equipment Cards List */}
                <div className="space-y-3">
                  {myEquipment.map(item => (
                    <div key={item._id} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-stone-900">{getLocalized(item, 'equipmentName') || item.equipmentName}</h4>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              {t('equipment.passport_active', { defaultValue: 'Passport Active' })}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600">
                            {t('equipment.model_label', { defaultValue: 'Model' })}: <strong>{item.modelNumber}</strong> • {t('equipment.serial_label', { defaultValue: 'Serial' })}: {item.serialNumber} • {t('equipment.supplier_label', { defaultValue: 'Supplier' })}: {getLocalized(item, 'supplierName') || getLocalized(item, 'supplier') || item.supplierName || item.supplier}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-[#0b2545]">₹{Number(item.purchasePrice || 0).toLocaleString('en-IN')}</span>
                          <span className="text-[11px] block text-stone-600">{t('equipment.bought_label', { defaultValue: 'Bought' })}: {(item.purchaseDate || '').split('T')[0]}</span>
                        </div>
                      </div>

                      {/* Service status bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-200 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>{t('equipment.last_service', { defaultValue: 'Last Service' })}: <strong>{(item.lastServiceDate || '').split('T')[0]}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-900">
                          <Clock size={14} className="text-amber-600" />
                          <span>{t('equipment.next_maint_due', { defaultValue: 'Next Maintenance Due' })}: <strong>{(item.nextMaintenanceDate || '').split('T')[0]}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service History Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-stone-900">{t('equipment.service_history', { defaultValue: 'Recent Service History' })}</h4>
                  <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
                    {maintenanceRecords.map(rec => (
                      <div key={rec.id} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-stone-900">{getLocalized(rec, 'serviceType') || rec.serviceType}</span>
                          <p className="text-stone-600 text-[11px]">{getLocalized(rec, 'notes') || rec.notes} • {t('equipment.by_label', { defaultValue: 'By' })}: {getLocalized(rec, 'technician') || rec.technician}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-stone-800">₹{rec.cost}</span>
                          <span className="text-[10px] text-stone-600 block">{(rec.serviceDate || '').split('T')[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade Advice Section */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase text-amber-950">{t('equipment.upgrade_advice', { defaultValue: 'Upgrade Advice' })}</span>
                    </div>
                    <button
                      type="button"
                      onClick={fetchUpgrade}
                      disabled={loadingUpgrade}
                      className="text-xs font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
                    >
                      {loadingUpgrade ? t('common.loading', { defaultValue: 'Checking...' }) : t('equipment.check_upgrade_status', { defaultValue: 'Check Upgrade Status' })}
                    </button>
                  </div>
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    {upgradeAdvice?.recommendation?.explanation || 
                     upgradeAdvice?.recommendation?.title || 
                     (typeof upgradeAdvice?.recommendation === 'string' ? upgradeAdvice.recommendation : null) || 
                     t('equipment.default_upgrade_msg', { defaultValue: 'Current machine capacity is running smoothly. Click check upgrade status to evaluate peak production demand.' })}
                  </p>
                </div>

                <StepActions
                  onBack={() => setCurrentStepIndex(2)}
                  isLastStep={true}
                  finishLabel={t('equipment.all_done_saved', { defaultValue: 'All Done ✓ Equipment Saved' })}
                  className="pt-2"
                />
              </div>
            </Step>
          </Stepper>

          {/* Add Machine Modal */}
          {showAddMachineModal && (
            <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-black text-stone-900">{t('equipment.add_equipment_to_msme', { defaultValue: 'Add Equipment to My MSME' })}</h3>
                  <button onClick={() => setShowAddMachineModal(false)} className="text-stone-600 font-bold hover:text-stone-800">✕</button>
                </div>
                <form onSubmit={handleSaveNewMachine} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{t('equipment.machine_name', { defaultValue: 'Machine Name' })} *</label>
                    <input
                      type="text"
                      required
                      value={newEqName}
                      onChange={e => setNewEqName(e.target.value)}
                      placeholder={t('equipment.machine_name_ph', { defaultValue: 'e.g. Flour Mill 5HP / Chaff Cutter' })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t('equipment.model_number', { defaultValue: 'Model Number' })}</label>
                      <input
                        type="text"
                        value={newEqModel}
                        onChange={e => setNewEqModel(e.target.value)}
                        placeholder={t('equipment.model_ph', { defaultValue: 'e.g. Model 2026' })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t('equipment.serial_number', { defaultValue: 'Serial Number' })}</label>
                      <input
                        type="text"
                        value={newEqSerial}
                        onChange={e => setNewEqSerial(e.target.value)}
                        placeholder={t('common.optional', { defaultValue: 'Optional' })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t('equipment.purchase_price', { defaultValue: 'Purchase Price (₹)' })}</label>
                      <input
                        type="number"
                        value={newEqPrice}
                        onChange={e => setNewEqPrice(e.target.value)}
                        placeholder="35000"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t('equipment.purchase_date', { defaultValue: 'Purchase Date' })}</label>
                      <input
                        type="date"
                        value={newEqDate}
                        onChange={e => setNewEqDate(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{t('equipment.supplier_dealer_name', { defaultValue: 'Supplier / Dealer Name' })}</label>
                    <input
                      type="text"
                      value={newEqSupplier}
                      onChange={e => setNewEqSupplier(e.target.value)}
                      placeholder={t('equipment.supplier_ph', { defaultValue: 'e.g. Krishi Machinery Sangli' })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMachineModal(false)}
                      className="px-4 py-2 rounded-xl text-stone-700 font-bold hover:bg-stone-100"
                    >
                      {t('common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold"
                    >
                      {t('equipment.save_machine', { defaultValue: 'Save Machine' })}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Maintenance Modal */}
          {showAddMaintModal && (
            <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-black text-stone-900">{t('equipment.log_maintenance', { defaultValue: 'Log Maintenance / Service' })}</h3>
                  <button onClick={() => setShowAddMaintModal(false)} className="text-stone-600 font-bold hover:text-stone-800">✕</button>
                </div>
                <form onSubmit={handleSaveMaintenance} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{t('equipment.service_type', { defaultValue: 'Service Type' })}</label>
                    <select
                      value={newMaintType}
                      onChange={e => setNewMaintType(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    >
                      <option value="preventive">{t('equipment.maint_preventive', { defaultValue: 'Routine Maintenance & Oil Check' })}</option>
                      <option value="repair">{t('equipment.maint_repair', { defaultValue: 'Breakdown / Parts Replacement' })}</option>
                      <option value="blade">{t('equipment.maint_blade', { defaultValue: 'Blade Sharpening / Alignment' })}</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t('equipment.technician_mechanic', { defaultValue: 'Technician / Mechanic' })}</label>
                      <input
                        type="text"
                        value={newMaintTech}
                        onChange={e => setNewMaintTech(e.target.value)}
                        placeholder={t('equipment.mechanic_name_ph', { defaultValue: 'Mechanic name' })}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">{t('equipment.service_cost', { defaultValue: 'Service Cost (₹)' })}</label>
                      <input
                        type="number"
                        value={newMaintCost}
                        onChange={e => setNewMaintCost(e.target.value)}
                        placeholder="500"
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">{t('equipment.notes_work_done', { defaultValue: 'Notes / Work Done' })}</label>
                    <textarea
                      rows={2}
                      value={newMaintNotes}
                      onChange={e => setNewMaintNotes(e.target.value)}
                      placeholder={t('equipment.notes_work_ph', { defaultValue: 'e.g. Changed belt, lubricated bearing.' })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAddMaintModal(false)}
                      className="px-4 py-2 rounded-xl text-stone-700 font-bold hover:bg-stone-100"
                    >
                      {t('common.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold"
                    >
                      {t('equipment.save_service_record', { defaultValue: 'Save Service Record' })}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: EQUIPMENT TESTING (PHOTO -> GEMINI VISION CHECK -> RESULT)   */}
      {/* =================================================================== */}
      {activePrimaryTab === 'testing' && (
        <div className="space-y-6">
          

          {/* Central Upload Card */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-sm space-y-6 text-center max-w-2xl mx-auto">
            
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {t('equipment.upload_machine_photo', { defaultValue: 'Upload Machine Photo' })}
              </h2>
              <p className="text-xs text-stone-600 font-medium max-w-md mx-auto">
                {t('equipment.testing_subtitle', { defaultValue: 'Upload machine photo and inspect its visible condition.' })}
              </p>
            </div>

            {/* Optional Business Type Selection for Context */}
            <div className="max-w-xs mx-auto text-left">
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                {t('common.business_type', { defaultValue: 'Business Type' })} ({t('common.optional', { defaultValue: 'Optional' })}):
              </label>
              <select
                value={testingBusinessType}
                onChange={e => setTestingBusinessType(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-[#0b2545]"
              >
                <option value="Dairy & Cattle">{t('business_category_dairy', { defaultValue: 'Dairy & Cattle Farming' })}</option>
                <option value="Flour & Dal Processing">{t('business_category_flour', { defaultValue: 'Flour Mill & Dal Processing' })}</option>
                <option value="Oil Extraction">{t('business_category_oil', { defaultValue: 'Cold Press Oil (Lakdi Ghana)' })}</option>
                <option value="Spices & Condiments">{t('business_category_spices', { defaultValue: 'Spices & Masala Grinding' })}</option>
                <option value="General Machinery">{t('business_category_general', { defaultValue: 'General Machinery / Industrial' })}</option>
              </select>
            </div>

            {/* Live Camera Viewfinder if Camera is Active */}
            {isCameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-lg mx-auto shadow-md border border-stone-300">
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el && streamRef.current && el.srcObject !== streamRef.current) {
                      el.srcObject = streamRef.current;
                      el.muted = true;
                      el.defaultMuted = true;
                      el.setAttribute('playsinline', '');
                      el.play()?.catch((err) => {
                        if (err.name !== 'AbortError') console.error('[Equipment Camera] video element callback play error:', err);
                      });
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera size={16} />
                    <span>{t('testing_btn_capture', 'Capture Photo')}</span>
                  </button>
                  {availableCameras.length > 1 && (
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="px-3 py-2 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1"
                      title={t('testing_btn_switch_cam', 'Switch Camera')}
                    >
                      <RotateCcw size={14} />
                      <span className="text-[11px]">{selectedCameraIndex + 1}/{availableCameras.length}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                    title={t('testing_btn_close_cam', 'Close Camera')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview if Loaded */}
            {!isCameraActive && imagePreview && (
              <div className="space-y-3">
                <div className="relative max-w-sm mx-auto rounded-2xl overflow-hidden border border-stone-300 shadow-sm">
                  <img src={imagePreview} alt={t('equipment.equipment_to_test', { defaultValue: 'Equipment To Test' })} className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={handleResetTesting}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white text-[11px] font-bold cursor-pointer"
                  >
                    ✕ {t('testing_btn_retake', 'Retake')}
                  </button>
                </div>
              </div>
            )}

            {/* Upload Buttons Row */}
            {!isCameraActive && !imagePreview && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <UploadCloud size={16} />
                  <span>{t('testing_btn_upload', 'Upload Photo')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-stone-900 border border-amber-300 font-extrabold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Camera size={16} className="text-amber-700" />
                  <span>{t('testing_btn_camera', 'Use Camera')}</span>
                </button>
              </div>
            )}

            {/* Run Inspection Action CTA */}
            {imagePreview && !analyzing && !testResult && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunGeminiInspection}
                  className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm shadow-md transition-all cursor-pointer inline-flex items-center justify-center"
                >
                  <span>{t('equipment.btn_analyze_machine', { defaultValue: 'Inspect Machine' })}</span>
                </button>
              </div>
            )}

            {/* Analyzing Progress State */}
            {analyzing && (
              <div className="py-6 space-y-3">
                <RefreshCw size={28} className="animate-spin text-[#0b2545] mx-auto" />
                <p className="text-xs font-bold text-stone-700">
                  {t('testing_analyzing', 'Analyzing photograph...')}
                </p>
              </div>
            )}

            {/* Error Message Notice */}
            {testError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 text-left flex items-start gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{testError}</p>
                  <button
                    type="button"
                    onClick={handleResetTesting}
                    className="text-[11px] font-bold text-rose-900 underline"
                  >
                    {t('equipment.try_again_photo', { defaultValue: 'Try again with another photo' })}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* ================================================================= */}
          {/* RESULT UI: 5 CLEAR CARDS / CHECKLISTS                             */}
          {/* ================================================================= */}
          {testResult && (
            <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-8 shadow-sm space-y-5 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                    <Check size={12} className="stroke-[3]" />
                    <span>{t('equipment.inspection_complete', { defaultValue: 'Inspection Complete' })}</span>
                  </div>
                  <h3 className="text-lg font-black text-stone-900">
                    {t('equipment.visual_inspection_outcome', { defaultValue: 'Visual Inspection Outcome' })}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleResetTesting}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{t('equipment.test_another_photo', { defaultValue: 'Test Another Photo' })}</span>
                </button>
              </div>

              {/* If clearly not a machine */}
              {!testResult.isEquipment ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-stone-800">
                  <div className="flex items-center gap-2 font-black text-amber-900">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <span>{t('equipment.sec_detected_machine', { defaultValue: 'Detected Machine' })}</span>
                  </div>
                  <p className="text-xs font-semibold">
                    {t('testing_not_equipment', 'This does not appear to be a clear machine image. Please upload a clear photo of the equipment.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* CARD 1: Detected machine */}
                  <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#0b2545] flex items-center gap-1.5">
                      <span>1. {t('equipment.sec_detected_machine', { defaultValue: 'Detected Machine' })}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-stone-600 block">{t('common.type', { defaultValue: 'Type' })}:</span>
                        <strong className="text-stone-900 text-sm">
                          {testResult.machine_type || testResult.equipmentType || 'Machinery'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-600 block">{t('common.brand', { defaultValue: 'Brand' })}:</span>
                        <strong className="text-stone-900">
                          {testResult.brand || t('equipment.not_clearly_visible', { defaultValue: 'Not clearly visible' })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Visible observations */}
                  <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase text-stone-900 flex items-center gap-1.5">
                      <span>2. {t('equipment.sec_visible_observations', { defaultValue: 'Visible Observations' })}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-stone-700">
                      {(testResult.visible_condition && testResult.visible_condition.length > 0 
                        ? testResult.visible_condition 
                        : [testResult.condition === 'good' ? t('equipment.satisfactory_condition', { defaultValue: 'Visible condition appears satisfactory.' }) : t('equipment.used_machine_inspected', { defaultValue: 'Machine appears used. Exterior condition has been evaluated.' })]
                      ).map((obs, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CARD 3: Potential visible issues */}
                  <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                      <span>3. {t('equipment.sec_potential_issues', { defaultValue: 'Potential Visible Issues' })}</span>
                    </h4>
                    {testResult.possible_issues && testResult.possible_issues.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-amber-950">
                        {testResult.possible_issues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" />
                        <span>{t('equipment.no_visible_damage', { defaultValue: 'No major visible damage or rust detected in the photo.' })}</span>
                      </p>
                    )}
                  </div>

                  {/* CARD 4: Physical checks before purchase */}
                  <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase text-stone-900 flex items-center gap-1.5">
                      <span>4. {t('equipment.sec_physical_checks', { defaultValue: 'Physical Checks Before Purchase' })}</span>
                    </h4>
                    <p className="text-[11px] text-stone-600 font-semibold">
                      {t('equipment.internal_check_note', { defaultValue: 'Internal motor condition cannot be determined from photos. Verify the following before purchase:' })}
                    </p>
                    <ul className="space-y-1.5 text-xs text-stone-800">
                      {(testResult.physical_checks && testResult.physical_checks.length > 0
                        ? testResult.physical_checks
                        : [
                            t('equipment.check_sound_vibration', { defaultValue: 'Start the motor and check sound and vibration' }),
                            t('equipment.check_bearing_wear', { defaultValue: 'Physically inspect bearings and pulleys for wear' }),
                            t('equipment.check_power_phase', { defaultValue: 'Check if power supply matches (single phase / 3-phase)' }),
                            t('equipment.check_invoice_warranty', { defaultValue: 'Verify invoice quotation and warranty documents' })
                          ]
                      ).map((check, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0b2545] shrink-0 mt-1.5" />
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CARD 5: Short conclusion */}
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                      <span>5. {t('equipment.sec_recommendation', { defaultValue: 'Our Recommendation' })}</span>
                    </h4>
                    <p className="text-xs font-bold text-stone-900 leading-relaxed">
                      {testResult.summary || testResult.business_suitability || testResult.requirementComparison?.recommendationNotice || 
                       t('equipment.default_advice', { defaultValue: 'Verify if this machinery fits your business capacity and perform a vendor test run before purchase.' })}
                    </p>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
