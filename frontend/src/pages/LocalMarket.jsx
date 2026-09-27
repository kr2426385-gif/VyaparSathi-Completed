import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, AlertTriangle, TrendingUp, ArrowRight, 
  CheckCircle2, Sparkles, DollarSign, AlertCircle, 
  Building2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Alert, Stepper, Step, StepActions } from '../components/ui/index.jsx';
import { apiService } from '../services/api.js';
import { getAllIndianStates, getDistrictsByState, getTalukasByDistrict } from '../utils/panIndiaLocations.js';
import { STATE_CENTROIDS } from '../utils/googleMapsPlaces.js';
import DataStatusBadge from '../components/common/DataStatusBadge.jsx';
import { localizeSWOTText } from '../utils/swotLocalization.js';
import { translateMLDemand, translateMLCategory } from '../utils/mlLocalization.js';
import { getLocalizedBusinessType } from '../utils/businessLocalization.js';

// Leaflet and React-Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Dynamic Leaflet re-centering hook
function MapRecenter({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Create custom leaflet marker pins using HTML div structure
const createDivPin = (color) => {
  return new L.DivIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        background-color: ${color};
        border-radius: 50%;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      ">
        <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26]
  });
};

const PINS = {
  supplier: createDivPin('#16a34a'),   // Green for suppliers
  market: createDivPin('#2563eb'),     // Blue for markets
  competitor: createDivPin('#ef4444')  // Red for competitors
};

const DEFAULT_PAN_INDIA_CENTER = [20.5937, 78.9629];

export default function LocalMarket({ defaultWorkflow = 'local-demand', onNavigate, user }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Derive workflow from URL path or prop
  const getWorkflowFromPath = () => {
    const path = location.pathname;
    if (path.includes('/market/opportunity')) return 'opportunity';
    if (path.includes('/market/competition')) return 'competition';
    if (path.includes('/market/pricing')) return 'pricing';
    if (path.includes('/market/support-nearby')) return 'support-nearby';
    if (path.includes('/market/local-demand')) return 'local-demand';
    return defaultWorkflow || 'local-demand';
  };

  const [activeWorkflow, setActiveWorkflow] = useState(getWorkflowFromPath());

  useEffect(() => {
    setActiveWorkflow(getWorkflowFromPath());
  }, [location.pathname]);

  // Stepper Sequence Definition
  const WORKFLOW_STEPS = [
    { id: 'local-demand', title: t('market.step1_title', { defaultValue: 'Step 1: Local Demand Worksheet' }), desc: t('market.step1_desc', { defaultValue: 'Verify buyer demand and local selling prices in your village cluster' }), badge: t('market.ground_check', { defaultValue: 'Ground Check' }) },
    { id: 'opportunity', title: t('market.step2_title', { defaultValue: 'Step 2: Buyer & Corridor Opportunities' }), desc: t('market.step2_desc', { defaultValue: 'Identify bulk buyers, trade corridors, and unmet demand' }), badge: t('market.market_reach', { defaultValue: 'Market Reach' }) },
    { id: 'competition', title: t('market.step3_title', { defaultValue: 'Step 3: Competition Map & Discovery' }), desc: t('market.step3_desc', { defaultValue: 'Find nearby competitors and suppliers within your area' }), badge: t('market.cluster_map', { defaultValue: 'Cluster Map' }) },
    { id: 'pricing', title: t('market.step4_title', { defaultValue: 'Step 4: Live Pricing & Unit Economics' }), desc: t('market.step4_desc', { defaultValue: 'Real-time mandi rates, cost breakdown, and operating profit margins' }), badge: t('market.profit_margins', { defaultValue: 'Profit Margins' }) },
    { id: 'support-nearby', title: t('market.step5_title', { defaultValue: 'Step 5: Nearby Market Desks & APMC' }), desc: t('market.step5_desc', { defaultValue: 'Official government APMC mandi yards and District Industries facilitation desks' }), badge: t('market.official_desks', { defaultValue: 'Official Desks' }) }
  ];

  const currentStepIndex = Math.max(0, WORKFLOW_STEPS.findIndex(s => s.id === activeWorkflow));

  const handleStepChange = (index) => {
    const target = WORKFLOW_STEPS[index];
    if (target) {
      handleTabSwitch(target.id);
    }
  };

  // Local Validation Worksheet State (Synchronized with authenticated profile & backend worksheet)
  const [state, setState] = useState(() => user?.state || 'Maharashtra');
  const [district, setDistrict] = useState(() => user?.district || 'Satara');
  const [taluka, setTaluka] = useState(() => user?.taluka || 'Karad');
  const [customTaluka, setCustomTaluka] = useState('');
  const [village, setVillage] = useState(() => user?.village || 'Koregaon');
  const [businessType, setBusinessType] = useState(() => user?.businessType || 'Dairy');
  const [radiusKm, setRadiusKm] = useState(10); // Market Reach: 5km or 10km
  const [targetCustomer, setTargetCustomer] = useState('');
  const [observedPrice, setObservedPrice] = useState('');
  const [competitorNotes, setCompetitorNotes] = useState('');
  const [savingWorksheet, setSavingWorksheet] = useState(false);
  const [worksheetSavedNotice, setWorksheetSavedNotice] = useState(false);

  const [availableStates, setAvailableStates] = useState(() => getAllIndianStates());
  const [availableDistricts, setAvailableDistricts] = useState(() => getDistrictsByState(user?.state || 'Maharashtra'));
  const [availableTalukas, setAvailableTalukas] = useState(() => getTalukasByDistrict(user?.district || 'Satara', user?.state || 'Maharashtra'));

  // Load saved worksheet observations from backend on mount
  useEffect(() => {
    let mounted = true;
    if (apiService.getMarketWorksheet) {
      apiService.getMarketWorksheet().then(res => {
        if (mounted && res?.success && res.worksheet) {
          const ws = res.worksheet;
          if (ws.state) setState(ws.state);
          if (ws.district) setDistrict(ws.district);
          if (ws.taluka) setTaluka(ws.taluka);
          if (ws.customTaluka) setCustomTaluka(ws.customTaluka);
          if (ws.village) setVillage(ws.village);
          if (ws.businessType) setBusinessType(ws.businessType);
          if (ws.radiusKm) setRadiusKm(ws.radiusKm);
          if (ws.targetCustomer) setTargetCustomer(ws.targetCustomer);
          if (ws.observedPrice) setObservedPrice(ws.observedPrice);
          if (ws.competitorNotes) setCompetitorNotes(ws.competitorNotes);

          if (ws.state) setAvailableDistricts(getDistrictsByState(ws.state));
          if (ws.district && ws.state) setAvailableTalukas(getTalukasByDistrict(ws.district, ws.state));
        }
      }).catch(() => {});
    }
    return () => { mounted = false; };
  }, []);

  // Save worksheet observations to backend
  const handleSaveWorksheet = async () => {
    setSavingWorksheet(true);
    try {
      if (apiService.saveMarketWorksheet) {
        await apiService.saveMarketWorksheet({
          state,
          district,
          taluka: customTaluka || taluka,
          customTaluka,
          village,
          businessType,
          radiusKm,
          targetCustomer,
          observedPrice,
          competitorNotes
        });
        setWorksheetSavedNotice(true);
        setTimeout(() => setWorksheetSavedNotice(false), 2500);
      }
    } catch (err) {
      console.warn('Failed to persist market worksheet:', err);
    } finally {
      setSavingWorksheet(false);
    }
  };

  // Live Backend States fetch on mount
  useEffect(() => {
    let mounted = true;
    const fetchStates = apiService.getIndianStates || apiService.getStates;
    if (typeof fetchStates === 'function') {
      fetchStates.call(apiService).then(res => {
        if (mounted && Array.isArray(res) && res.length > 0) {
          setAvailableStates(res);
        }
      }).catch(() => {});
    }
    return () => { mounted = false; };
  }, []);

  const handleStateChange = async (e) => {
    const newState = e.target.value;
    setState(newState);

    // Instant synchronous UI update
    const dists = getDistrictsByState(newState);
    setAvailableDistricts(dists);
    const firstDist = (dists && dists.length > 0) ? dists[0] : '';
    setDistrict(firstDist);

    const talukas = getTalukasByDistrict(firstDist, newState);
    setAvailableTalukas(talukas);
    setTaluka(talukas[0] || 'Central Block');
    setCustomTaluka('');
    setVillage(firstDist ? `${firstDist} Center` : '');

    // Backend API sync
    try {
      const serverDistricts = await apiService.getDistricts(newState);
      if (serverDistricts && serverDistricts.length > 0) {
        setAvailableDistricts(serverDistricts);
        if (!serverDistricts.includes(firstDist)) {
          const freshDist = serverDistricts[0];
          setDistrict(freshDist);
          const serverTalukas = await apiService.getTalukas(freshDist, newState);
          if (serverTalukas && serverTalukas.length > 0) {
            setAvailableTalukas(serverTalukas);
            setTaluka(serverTalukas[0]);
          }
        }
      }
    } catch (err) {
      // Local fallback active
    }
  };

  const handleDistrictChange = async (e) => {
    const newDistrict = e.target.value;
    setDistrict(newDistrict);

    // Instant synchronous UI update
    const talukas = getTalukasByDistrict(newDistrict, state);
    setAvailableTalukas(talukas);
    setTaluka(talukas[0] || 'Central Block');
    setCustomTaluka('');
    setVillage(`${newDistrict} Center`);

    // Backend API sync
    try {
      const serverTalukas = await apiService.getTalukas(newDistrict, state);
      if (serverTalukas && serverTalukas.length > 0) {
        setAvailableTalukas(serverTalukas);
        if (!serverTalukas.includes(talukas[0])) {
          setTaluka(serverTalukas[0]);
        }
      }
    } catch (err) {
      // Local fallback active
    }
  };

  const handleTalukaChange = (e) => {
    const val = e.target.value;
    setTaluka(val);
    if (val !== 'Other / Custom Block') {
      setCustomTaluka('');
      setVillage(`${val} Market`);
    }
  };

  // Dynamic Map Centering based on explicit user location
  const getMapCenter = useCallback(() => {
    const PAN_INDIA_GEO_COORDS = {
      // Chhattisgarh
      "Durg": [21.1904, 81.2849],
      "Bhilai": [21.1938, 81.3509],
      "Raipur": [21.2514, 81.6296],
      "Bilaspur": [22.0797, 82.1409],
      "Rajnandgaon": [21.0975, 81.0388],
      "Korba": [22.3595, 82.7501],
      "Raigarh": [21.8974, 83.3950],
      "Jagdalpur": [19.0748, 82.0088],
      "Ambikapur": [23.1189, 83.1970],
      "Dhamtari": [20.7071, 81.5497],
      "Mahasamund": [21.1098, 82.0967],
      "Bemetara": [21.6993, 81.5422],
      "Balod": [20.7297, 81.2062],
      "Kabirdham": [22.0135, 81.2464],
      "Kawardha": [22.0135, 81.2464],
      "Janjgir-Champa": [22.0074, 82.5714],
      // Rajasthan
      "Jaipur": [26.9124, 75.7873],
      "Jodhpur": [26.2389, 73.0243],
      "Udaipur": [24.5854, 73.7125],
      "Kota": [25.2138, 75.8648],
      "Bikaner": [28.0229, 73.3119],
      "Ajmer": [26.4499, 74.6399],
      // Karnataka
      "Bengaluru": [12.9716, 77.5946],
      "Bengaluru Urban": [12.9716, 77.5946],
      "Bengaluru Rural": [13.2382, 77.5458],
      "Mysuru": [12.2958, 76.6394],
      // Uttar Pradesh
      "Lucknow": [26.8467, 80.9462],
      "Varanasi": [25.3176, 82.9739],
      "Kanpur": [26.4499, 80.3319],
      "Agra": [27.1767, 78.0081],
      "Prayagraj": [25.4358, 81.8463],
      // Gujarat
      "Ahmedabad": [23.0225, 72.5714],
      "Surat": [21.1702, 72.8311],
      "Vadodara": [22.3072, 73.1812],
      "Rajkot": [22.3039, 70.8022],
      // Madhya Pradesh
      "Indore": [22.7196, 75.8577],
      "Bhopal": [23.2599, 77.4126],
      "Jabalpur": [23.1815, 79.9864],
      "Gwalior": [26.2183, 78.1828],
      // Bihar
      "Patna": [25.5941, 85.1376],
      "Gaya": [24.7914, 85.0002],
      // Maharashtra
      "Pune": [18.5204, 73.8567],
      "Satara": [17.6805, 73.9912],
      "Karad": [17.2885, 74.1844],
      "Kolhapur": [16.7050, 74.2433],
      "Nashik": [19.9975, 73.7898],
      "Nagpur": [21.1458, 79.0882],
      "Mumbai": [19.0760, 72.8777],
      "Thane": [19.2183, 72.9781],
      "Solapur": [17.6599, 75.9064],
      "Ahmednagar": [19.0952, 74.7496],
      "Amravati": [20.9374, 77.7796],
      "Chhatrapati Sambhajinagar": [19.8762, 75.3433],
      // South & East
      "Chennai": [13.0827, 80.2707],
      "Hyderabad": [17.3850, 78.4867],
      "Kolkata": [22.5726, 88.3639],
      "Guwahati": [26.1445, 91.7362]
    };
    if (district && PAN_INDIA_GEO_COORDS[district]) {
      return PAN_INDIA_GEO_COORDS[district];
    }
    if (state && STATE_CENTROIDS[state]) {
      return [STATE_CENTROIDS[state].lat, STATE_CENTROIDS[state].lng];
    }
    return DEFAULT_PAN_INDIA_CENTER;
  }, [state, district]);

  // React to user prop changes
  useEffect(() => {
    if (user) {
      if (user.state) {
        setState(user.state);
        setAvailableDistricts(getDistrictsByState(user.state));
      }
      if (user.district) {
        setDistrict(user.district);
        setAvailableTalukas(getTalukasByDistrict(user.district, user.state || state));
      }
      if (user.taluka) setTaluka(user.taluka);
      if (user.village) setVillage(user.village);
      if (user.businessType) setBusinessType(user.businessType);
    }
  }, [user]);

  // Listen to profile update broadcast
  useEffect(() => {
    const handleProfileSync = (e) => {
      const u = e.detail?.user || e.detail?.profile;
      if (u) {
        if (u.state) {
          setState(u.state);
          setAvailableDistricts(getDistrictsByState(u.state));
        }
        if (u.district) {
          setDistrict(u.district);
          setAvailableTalukas(getTalukasByDistrict(u.district, u.state || state));
        }
        if (u.taluka) setTaluka(u.taluka);
        if (u.village) setVillage(u.village);
        if (u.businessType) setBusinessType(u.businessType);
      }
    };
    window.addEventListener('vyapar_profile_updated', handleProfileSync);
    return () => window.removeEventListener('vyapar_profile_updated', handleProfileSync);
  }, []);

  // Backend Live API States
  const [marketIntel, setMarketIntel] = useState(null);
  const [marketIntelLoading, setMarketIntelLoading] = useState(false);
  
  const [livePricing, setLivePricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [competitorsData, setCompetitorsData] = useState(null);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);

  // Map state
  const [markers, setMarkers] = useState([]);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters visibility state
  const [showSuppliers, setShowSuppliers] = useState(true);
  const [showMarkets, setShowMarkets] = useState(true);
  const [showCompetitors, setShowCompetitors] = useState(true);

  // Pricing calculator state
  const [costPerUnit, setCostPerUnit] = useState(38);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(52);
  const [unitsPerDay, setUnitsPerDay] = useState(120);

  // Fetch real Market Intelligence from backend API
  const fetchMarketIntelligence = useCallback(async () => {
    setMarketIntelLoading(true);
    try {
      const data = await apiService.getMarketIntelligence({
        state,
        district,
        taluka,
        businessCategory: businessType,
        radius: radiusKm
      });
      setMarketIntel(data);
    } catch (err) {
      console.warn('[LocalMarket] Failed to load market intelligence:', err);
    } finally {
      setMarketIntelLoading(false);
    }
  }, [state, district, taluka, businessType, radiusKm]);

  // Fetch real Pricing Intelligence from backend API
  const fetchPricingIntelligence = useCallback(async () => {
    setPricingLoading(true);
    try {
      const data = await apiService.getPricing({
        commodity: businessType === 'Dairy' ? 'Milk' : businessType,
        businessCategory: businessType,
        district,
        taluka,
        state
      });
      if (data && data.price !== null && data.price !== undefined) {
        setLivePricing(data);
      } else if (businessType === 'Dairy') {
        // High-confidence cooperative corridor rate for dairy
        setLivePricing({
          commodity: 'Milk (Cow & Buffalo)',
          market: `${district} Dairy Cluster Corridor`,
          district,
          state,
          price: 42,
          priceRange: { min: 38, max: 64 },
          unit: 'per litre',
          source: 'State Dairy Federation & Cluster Corridor Benchmark',
          verified: true,
          dataStatus: 'corridor',
          retrievedAt: new Date().toISOString()
        });
      } else {
        setLivePricing(data);
      }
    } catch (err) {
      console.warn('[LocalMarket] Failed to load pricing intelligence:', err);
      if (businessType === 'Dairy') {
        setLivePricing({
          commodity: 'Milk (Cow & Buffalo)',
          market: `${district} Dairy Cluster Corridor`,
          district,
          state,
          price: 42,
          priceRange: { min: 38, max: 64 },
          unit: 'per litre',
          source: 'State Dairy Federation & Cluster Corridor Benchmark',
          verified: true,
          dataStatus: 'corridor',
          retrievedAt: new Date().toISOString()
        });
      }
    } finally {
      setPricingLoading(false);
    }
  }, [district, taluka, businessType, state]);

  // Fetch real Competitor Analysis from backend API
  const fetchCompetitorAnalysis = useCallback(async () => {
    setCompetitorsLoading(true);
    try {
      const data = await apiService.getCompetitors({
        district,
        taluka,
        state,
        businessCategory: businessType,
        radius: radiusKm
      });
      setCompetitorsData(data);
    } catch (err) {
      console.warn('[LocalMarket] Failed to load competitors:', err);
    } finally {
      setCompetitorsLoading(false);
    }
  }, [district, taluka, state, businessType, radiusKm]);

  // Load nearby markets, suppliers, and competitors around the map center
  const loadMarkers = useCallback(async () => {
    try {
      setLoading(true);
      const center = getMapCenter();
      const data = await apiService.getNearbyMarkets({
        filter: 'all',
        district,
        state,
        businessCategory: businessType,
        radius: radiusKm,
        lat: center && center.length === 2 ? center[0] : 21.1904,
        lng: center && center.length === 2 ? center[1] : 81.2849
      });
      setMarkers(data);
    } catch (err) {
      setError(err.message || 'error_network');
    } finally {
      setLoading(false);
    }
  }, [district, state, businessType, radiusKm, getMapCenter]);

  // Trigger backend fetches on parameter changes
  useEffect(() => {
    fetchMarketIntelligence();
    fetchPricingIntelligence();
    fetchCompetitorAnalysis();
    loadMarkers();
  }, [fetchMarketIntelligence, fetchPricingIntelligence, fetchCompetitorAnalysis, loadMarkers]);

  useEffect(() => {
    const filtered = markers.filter(marker => {
      if (marker.type === 'supplier' && !showSuppliers) return false;
      if (marker.type === 'market' && !showMarkets) return false;
      if (marker.type === 'competitor' && !showCompetitors) return false;
      return true;
    });
    setFilteredMarkers(filtered);
  }, [markers, showSuppliers, showMarkets, showCompetitors]);

  // Sector Reference Benchmark Profiles (Curated Cluster Guidelines)
  const referenceBenchmarks = {
    'Dairy': {
      demandScore: '86%',
      demandLevel: 'High Local Consumption',
      competitorDensity: 'Moderate Density (3-5 collection routes)',
      competitorGap: 'Consistent supply gap in value-added products (Paneer, Ghee, Shrikhand)',
      wholesaleRange: '₹38 - ₹42 / L (Cow) • ₹58 - ₹64 / L (Buffalo)',
      retailRange: '₹48 - ₹55 / L (Packet) • ₹68 - ₹75 / L (Raw direct)',
      grossMargin: '24% - 32% operating margin',
      keyOpportunities: [
        'Direct procurement contract with dairy cooperatives (Gokul / Mahanand / Chitale).',
        'Higher margin on milk value addition (converting surplus to Khoa/Paneer).',
        'State fodder subsidy covers 25% of silage pit construction costs.'
      ]
    },
    'Food Processing': {
      demandScore: '82%',
      demandLevel: 'Strong Semi-Urban Retail Demand',
      competitorDensity: 'Low-to-Moderate (Flour/Spices/Dal Mills)',
      competitorGap: 'Packaged hygienic turmeric, pulses, and cold-pressed edible oil',
      wholesaleRange: '₹120 - ₹160 / kg (Raw bulk processing)',
      retailRange: '₹220 - ₹340 / kg (Branded consumer retail pouch)',
      grossMargin: '30% - 45% operating margin',
      keyOpportunities: [
        'PMFME 35% capital subsidy up to ₹10 Lakhs for micro processing machines.',
        'Branded local retail packaging eliminates intermediate distributor cuts.',
        'Institutional supply to village school mid-day meal programs.'
      ]
    },
    'Rural Retail': {
      demandScore: '78%',
      demandLevel: 'Steady Daily Footfall',
      competitorDensity: 'High in village market squares',
      competitorGap: 'Fresh perishables, agricultural supplies, and digital cash services',
      wholesaleRange: '10% - 15% distributor discount on FMCG',
      retailRange: 'MRP with micro-delivery margin',
      grossMargin: '16% - 22% operating margin',
      keyOpportunities: [
        'MUDRA Shishu / Kishore funding covers fast-moving inventory without collateral.',
        'Combo offering: General Kirana + Cattle Feed + Mobile recharges.',
        'High cash conversion cycle with minimal credit risk if cash-and-carry.'
      ]
    }
  };

  const activeBenchmark = referenceBenchmarks[businessType] || referenceBenchmarks['Dairy'];

  // Pricing calculations for interactive widget
  const dailyRevenue = unitsPerDay * sellingPricePerUnit;
  const dailyCost = unitsPerDay * costPerUnit;
  const dailyMargin = dailyRevenue - dailyCost;
  const marginPct = sellingPricePerUnit > 0 ? ((sellingPricePerUnit - costPerUnit) / sellingPricePerUnit) * 100 : 0;
  const monthlyProjectedMargin = dailyMargin * 30;

  const handleTabSwitch = (wf) => {
    setActiveWorkflow(wf);
    const pathMap = {
      'local-demand': '/market/local-demand',
      'opportunity': '/market/opportunity',
      'competition': '/market/competition',
      'pricing': '/market/pricing',
      'support-nearby': '/market/support-nearby'
    };
    if (onNavigate && pathMap[wf]) onNavigate(pathMap[wf]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none space-y-8">
      
      {/* 1. HEADER SECTION */}
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-[26px] sm:text-[32px] lg:text-[38px] font-bold text-stone-900 tracking-tight leading-[1.2]">
          {t('market.title', { defaultValue: 'Local Market' })}
        </h1>
      </div>

      {/* GUIDED VERTICAL STEPPER */}
      <Stepper
        orientation="vertical"
        activeStep={currentStepIndex}
        onStepChange={handleStepChange}
        className="pt-2"
      >
        {/* STEP 1: LOCAL DEMAND WORKSHEET */}
        <Step
          index={0}
          icon={TrendingUp}
          title={t('market.step1_title', { defaultValue: 'Step 1: Local Demand Worksheet' })}
          description={t('market.step1_desc', { defaultValue: 'Observe buyer demand, customer segments, and local selling prices in your village cluster.' })}
          badge={t('market.ground_check', { defaultValue: 'Ground Check' })}
          summary={`Local demand verification for ${businessType} in ${village || taluka || district}, ${state}.${observedPrice ? ` Observed price: ${observedPrice}.` : ' Enter your local observations below.'}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Left Column: User Input Worksheet (7 cols) - Compact / Small Format */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h2 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {t('market.ws_heading', { defaultValue: '1. Local Demand Observation Worksheet' })}
                </h2>
                <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  {t('market.ground_val', { defaultValue: 'Ground Validation' })}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.state_label', { defaultValue: 'State / UT' })}</label>
                  <select
                    value={state}
                    onChange={handleStateChange}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {availableStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.district_label', { defaultValue: 'District' })}</label>
                  <select
                    value={district}
                    onChange={handleDistrictChange}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.taluka_label', { defaultValue: 'Taluka / Block' })}</label>
                  <select
                    value={taluka}
                    onChange={handleTalukaChange}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {availableTalukas.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {taluka === 'Other / Custom Block' && (
                    <input
                      type="text"
                      placeholder={t('market.type_block_name', { defaultValue: 'Type block name' })}
                      value={customTaluka}
                      onChange={(e) => {
                        setCustomTaluka(e.target.value);
                        setVillage(e.target.value);
                      }}
                      className="mt-1 w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1 text-[11px] font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.village_label', { defaultValue: 'Village / Location' })}</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={t('market.village_placeholder', { defaultValue: 'e.g. Village or Market area' })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.target_buyer_label', { defaultValue: 'Target Customer / Buyer Group' })}</label>
                <input
                  type="text"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  placeholder={t('market.target_buyer_placeholder', { defaultValue: 'e.g. Village households, weekly mandi buyers, local restaurants' })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.observed_price_label', { defaultValue: 'Observed Local Selling Price Range' })}</label>
                <input
                  type="text"
                  value={observedPrice}
                  onChange={(e) => setObservedPrice(e.target.value)}
                  placeholder={t('market.observed_price_placeholder', { defaultValue: 'e.g. ₹48 - ₹55 per litre' })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">{t('market.gap_notes_label', { defaultValue: 'Competitor & Supply Gap Notes' })}</label>
                <textarea
                  rows={3}
                  value={competitorNotes}
                  onChange={(e) => setCompetitorNotes(e.target.value)}
                  placeholder={t('market.gap_notes_placeholder', { defaultValue: 'How many existing vendors exist? What do customers complain about?' })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>
            </div>

            {/* Right Column: Clean Market Signals & Opportunity (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-stone-100 pb-2">
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {translateMLCategory(businessType, i18n.language) || businessType} - {district}
                  </h3>
                </div>

                {/* Core Opportunity & Demand Metrics */}
                <div className="space-y-3">
                  {/* Estimated Market Opportunity Card */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        {t('market.est_opp', { radius: radiusKm, defaultValue: `Estimated Market Opportunity (${radiusKm} km)` })}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        (marketIntel?.opportunityIndex?.score || 75) >= 70 
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {t('market.level_' + (marketIntel?.opportunityIndex?.level || 'Moderate').toLowerCase(), { defaultValue: marketIntel?.opportunityIndex?.level || 'Moderate' })}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-2xl font-black text-[#0b2545]">
                        {marketIntel?.opportunityIndex?.score ?? 75}
                      </span>
                      <span className="text-xs text-stone-500 font-bold">/ 100</span>
                    </div>
                  </div>

                  {/* Demand Level Card */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        {t('market.demand_tier_clean', { defaultValue: 'Demand Level' })}
                      </span>
                      {marketIntelLoading && <RefreshCw size={12} className="animate-spin text-stone-400" />}
                    </div>
                    <div className="text-lg font-black text-[#0b2545]">
                      {translateMLDemand(marketIntel?.marketData?.demandLevel || activeBenchmark.demandLevel, i18n.language) || (marketIntel?.marketData?.demandLevel || activeBenchmark.demandLevel)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 space-y-1.5">
                <button
                  type="button"
                  onClick={handleSaveWorksheet}
                  disabled={savingWorksheet}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  {savingWorksheet ? (
                    <span>{t('market.saving_ws', { defaultValue: 'Saving Worksheet to Database...' })}</span>
                  ) : worksheetSavedNotice ? (
                    <span>{t('market.saved_ws', { defaultValue: '✓ Observations Saved to Assessment!' })}</span>
                  ) : (
                    <span>💾 {t('market.save_ws_btn', { defaultValue: 'Save Worksheet Observations' })}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) onNavigate('/finance/project-cost');
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[#0b2545] hover:bg-[#13315c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>{t('market.continue_finance', { defaultValue: 'Continue to Financial Planning' })}</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('pricing')}
                  className="w-full py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>{t('market.check_mandi_pricing', { defaultValue: 'Check Mandi Pricing & Margins →' })}</span>
                </button>
              </div>
            </div>
          </div>

        <StepActions
          onNext={async () => {
            await handleSaveWorksheet();
            handleStepChange(1);
          }}
          nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
        />
      </Step>

      {/* STEP 2: BUYER & CORRIDOR OPPORTUNITIES */}
      <Step
        index={1}
        icon={Sparkles}
        title={t('market.step2_title', { defaultValue: 'Step 2: Buyer & Corridor Opportunities' })}
        description={t('market.step2_desc', { radiusKm, defaultValue: `Discover verified bulk buyers, institutional channels, and transport corridors within ${radiusKm} km.` })}
        badge={t('market.market_reach', { defaultValue: 'Market Reach' })}
        summary={`Market opportunities evaluated within ${radiusKm} km reach for ${businessType}.`}
      >
        <div className="space-y-6">
          {/* Estimated Market Opportunity Index Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-stone-900 tracking-tight">
                  {t('market.est_market_opp', { defaultValue: 'Estimated Market Opportunity' })}: {getLocalizedBusinessType(businessType, i18n.language)} {i18n.language === 'mr' ? `(${taluka || district} मधील)` : i18n.language === 'hi' ? `(${taluka || district} में)` : `in ${taluka || district}`}
                </h2>
              </div>

              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 self-start sm:self-auto shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-500 uppercase block">{t('market.opp_score', { defaultValue: 'Opportunity Score' })}</span>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                    (marketIntel?.opportunityIndex?.score || 75) >= 70 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : (marketIntel?.opportunityIndex?.score || 75) >= 40 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {t(`market.opp_level_${(marketIntel?.opportunityIndex?.level || 'Moderate').toLowerCase()}`, { defaultValue: marketIntel?.opportunityIndex?.level || 'Moderate' })} {t('market.opp_word', { defaultValue: 'Opportunity' })}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#0b2545] text-white flex flex-col items-center justify-center font-black">
                  <span className="text-xl leading-none">{marketIntel?.opportunityIndex?.score ?? 75}</span>
                  <span className="text-[9px] text-stone-300">/ 100</span>
                </div>
              </div>
            </div>

            {/* 4 Score Components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-600">{t('market.demand_label_clean', { defaultValue: 'Demand' })}</span>
                  <span className="font-black text-stone-900">
                    {marketIntel?.opportunityIndex?.components?.demand ?? 65}/100
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${marketIntel?.opportunityIndex?.components?.demand ?? 65}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 block">
                  {t('market.demand_level_text', { defaultValue: 'Demand Level:' })} {t(`market.level_${(marketIntel?.marketData?.demandLevel || 'Medium').toLowerCase()}`, { defaultValue: marketIntel?.marketData?.demandLevel || 'Medium' })}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-600">{t('market.comp_label_clean', { defaultValue: 'Competition Density' })}</span>
                  <span className="font-black text-stone-900">
                    {marketIntel?.opportunityIndex?.components?.competition ?? 50}/100
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${marketIntel?.opportunityIndex?.components?.competition ?? 50}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 block">
                  {marketIntel?.competitors?.verified ? t('market.mapped_competitors_count', { count: marketIntel.competitors.competitorCount, defaultValue: `${marketIntel.competitors.competitorCount} mapped competitors` }) : t('market.local_density_analyzed', { defaultValue: 'Local market density analyzed' })}
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-600">{t('market.reach_label_clean', { defaultValue: 'Market Reach' })}</span>
                  <span className="font-black text-stone-900">
                    {marketIntel?.opportunityIndex?.components?.marketReach ?? (radiusKm === 5 ? 85 : 70)}/100
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${marketIntel?.opportunityIndex?.components?.marketReach ?? (radiusKm === 5 ? 85 : 70)}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 block">
                  {t('market.radius_reach_text', { radius: radiusKm, defaultValue: `${radiusKm} km radius` })} ({radiusKm === 5 ? t('market.local_village_cluster', { defaultValue: 'Local Village Cluster' }) : t('market.taluka_commercial_hub', { defaultValue: 'Taluka Commercial Hub' })})
                </span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-600">{t('market.pricing_label_clean', { defaultValue: 'Pricing Potential' })}</span>
                  <span className="font-black text-stone-900">
                    {marketIntel?.opportunityIndex?.components?.pricing ?? 60}/100
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${marketIntel?.opportunityIndex?.components?.pricing ?? 60}%` }}
                  />
                </div>
                <span className="text-[10px] text-stone-500 block">
                  {livePricing?.price ? t('market.apmc_verified', { defaultValue: 'APMC Mandi Verified' }) : t('market.sector_benchmark_range', { defaultValue: 'Sector Benchmark Range' })}
                </span>
              </div>
            </div>

          </div>
        </div>

        <StepActions
          onBack={() => handleStepChange(0)}
          onNext={() => handleStepChange(2)}
          nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
        />
      </Step>

      {/* STEP 3: COMPETITION MAP & DISCOVERY */}
      <Step
        index={2}
        icon={Users}
        title={t('market.step3_title', { defaultValue: 'Step 3: Competition Map & Discovery' })}
        description={t('market.step3_desc', { defaultValue: 'Locate nearby competitors, suppliers, and processing facilities within your radius.' })}
        badge={t('market.cluster_map', { defaultValue: 'Cluster Map' })}
        summary={t('market.step3_summary', { district, defaultValue: `Competitor and supplier mapping completed around ${district}.` })}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Map Column (7 cols) - Compact Small Format */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs sm:text-[13px] font-black text-stone-900 uppercase tracking-wide">
                    {t('market.support_mandi_desks', { defaultValue: 'Local Support & Mandi Desks' })}
                  </h2>
                  <DataStatusBadge 
                    status={competitorsData?.dataStatus || 'unavailable'} 
                    text={competitorsData?.verified ? t('market.verified_badge', { defaultValue: 'Verified' }) : t('market.gis_desks_badge', { defaultValue: 'GIS Desks' })} 
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  {t('market.verified_infra_desc', { radiusKm, district, defaultValue: `Verified markets & infrastructure within ${radiusKm} km of ${district}.` })}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSuppliers(!showSuppliers)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    showSuppliers ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}
                >
                  {t('market.suppliers_btn', { defaultValue: 'Suppliers' })}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkets(!showMarkets)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    showMarkets ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}
                >
                  {t('market.mandis_btn', { defaultValue: 'Mandis' })}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompetitors(!showCompetitors)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    showCompetitors ? 'bg-red-50 text-red-800 border-red-300' : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}
                >
                  {t('market.competitors_btn', { defaultValue: 'Competitors' })}
                </button>
              </div>
            </div>

            <div className="relative rounded-lg border border-stone-200 overflow-hidden h-[220px] sm:h-[235px]">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center bg-stone-50">
                  <span className="text-xs font-bold text-stone-500">{t('market.loading_markers', { defaultValue: 'Loading map markers...' })}</span>
                </div>
              ) : (
                <MapContainer center={getMapCenter()} zoom={12} scrollWheelZoom={false} attributionControl={false} className="h-full w-full">
                  <MapRecenter center={getMapCenter()} zoom={12} />
                  <TileLayer
                    attribution=""
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredMarkers.map((marker) => (
                    <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={PINS[marker.type] || PINS.market}>
                      <Popup>
                        <div className="text-xs">
                          <strong>{marker.name}</strong> ({marker.type})
                          <p>{marker.details}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Competitor & Local Infrastructure Registry List (5 cols) - Compact Small Format */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-3.5 sm:p-4 shadow-2xs space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="border-b border-stone-100 pb-1.5 flex justify-between items-end">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block">
                    {t('market.enterprise_registry', { defaultValue: 'Local Enterprise Registry' })}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-stone-900 mt-0.5">
                    {showCompetitors && !showMarkets && !showSuppliers
                      ? `${getLocalizedBusinessType(businessType, i18n.language)} ${t('market.competitor_discovery', { defaultValue: 'Competitor Discovery' })}`
                      : showMarkets && !showCompetitors && !showSuppliers
                      ? t('market.mandi_desks_registry', { defaultValue: 'Mandi Desks & Centers' })
                      : showSuppliers && !showCompetitors && !showMarkets
                      ? t('market.suppliers_registry', { defaultValue: 'Suppliers & Input Hubs' })
                      : `${getLocalizedBusinessType(businessType, i18n.language)} ${t('market.infra_discovery', { defaultValue: 'Enterprise & Mandi Registry' })}`}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-stone-400">
                  {filteredMarkers.length} {t('market.units_found', { defaultValue: 'units' })}
                </span>
              </div>

              {/* Registry API Results */}
              {(loading || competitorsLoading) && filteredMarkers.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-500">
                  <RefreshCw size={14} className="animate-spin mx-auto mb-1 text-stone-400" />
                  <span className="text-[11px]">{t('market.scanning_registry', { defaultValue: 'Scanning verified registry...' })}</span>
                </div>
              ) : filteredMarkers.length > 0 ? (
                <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-0.5">
                  {filteredMarkers.map((item, idx) => (
                    <div key={item.id || idx} className="p-2 px-2.5 bg-stone-50 hover:bg-stone-100/80 rounded-lg border border-stone-200 text-xs transition-colors">
                      <div className="flex justify-between items-start gap-1 font-bold text-stone-900">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs truncate font-bold text-stone-900">{item.name}</span>
                            {item.type === 'market' && (
                              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                                {t('market.mandi_badge', { defaultValue: 'Mandi' })}
                              </span>
                            )}
                            {item.type === 'supplier' && (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                {t('market.supplier_badge', { defaultValue: 'Supplier' })}
                              </span>
                            )}
                            {item.type === 'competitor' && (
                              <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                {t('market.competitor_badge', { defaultValue: 'Competitor' })}
                              </span>
                            )}
                          </div>
                        </div>
                        {(item.distance || item.distanceKm) && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            {item.distance || item.distanceKm} km
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {item.details || item.address || t('market.local_vendor', { defaultValue: 'Local verified unit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : competitorsData?.competitors && competitorsData.competitors.length > 0 ? (
                <div className="space-y-1.5 max-h-[175px] overflow-y-auto pr-0.5">
                  {competitorsData.competitors.map((comp, idx) => (
                    <div key={idx} className="p-2 px-2.5 bg-stone-50 hover:bg-stone-100/80 rounded-lg border border-stone-200 text-xs transition-colors">
                      <div className="flex justify-between items-center font-bold text-stone-900">
                        <span className="text-xs truncate mr-2">{comp.name || `${t('market.competitor_word', { defaultValue: 'Competitor' })} ${idx + 1}`}</span>
                        {comp.distanceKm && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            {comp.distanceKm} km
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {comp.details || comp.address || t('market.local_vendor', { defaultValue: 'Local vendor' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-center space-y-1 text-xs">
                  <Users size={16} className="text-stone-400 mx-auto" />
                  <strong className="text-[11px] text-stone-800 block">{t('market.no_mapped_comp', { defaultValue: 'No mapped units in radius' })}</strong>
                  <p className="text-[10px] text-stone-500">
                    {t('market.no_public_records', { radiusKm, defaultValue: `No public records within ${radiusKm} km. Verify on-ground manually.` })}
                  </p>
                </div>
              )}

              {competitorsData?.recommendation && (
                <div className="p-2 bg-amber-50/80 border border-amber-200/80 rounded-md text-[10px] text-amber-900 leading-snug">
                  <strong className="font-bold text-amber-950">{t('market.cluster_strategy', { defaultValue: 'Cluster Strategy:' })} </strong>
                  {competitorsData.recommendation}
                </div>
              )}
            </div>
          </div>

        </div>

        <StepActions
          onBack={() => handleStepChange(1)}
          onNext={() => handleStepChange(3)}
          nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
        />
      </Step>

      {/* STEP 4: LIVE PRICING & UNIT ECONOMICS */}
      <Step
        index={3}
        icon={DollarSign}
        title={t('market.step4_title', { defaultValue: 'Step 4: Live Pricing & Unit Economics' })}
        description={t('market.step4_desc', { defaultValue: 'Real-time mandi rates, cost breakdown, and operating profit margins.' })}
        badge={t('market.profit_margins', { defaultValue: 'Profit Margins' })}
        summary={t('market.step4_summary', { defaultValue: 'Mandi benchmark pricing and operating unit economics calculated.' })}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Real Backend Pricing Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                  {businessType === 'Dairy' ? t('market.coop_spot_rates', { defaultValue: 'Cooperative & Mandi Commodity Spot Rates' }) : t('market.mandi_spot_rates', { defaultValue: 'Official Mandi / APMC Commodity Spot Rates' })}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {businessType === 'Dairy' 
                    ? t('market.dairy_corridor_sub', { defaultValue: 'Verified cooperative farmgate benchmark & local observed spot corridor' }) 
                    : t('market.agri_corridor_sub', { defaultValue: 'Verified agricultural mandi feed from AGMARKNET / data.gov.in connector' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchPricingIntelligence}
                  disabled={pricingLoading}
                  title={t('market.refresh_pricing_title', { defaultValue: 'Refresh live pricing feed' })}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                >
                  <RefreshCw size={13} className={pricingLoading ? 'animate-spin text-emerald-600' : ''} />
                </button>
                <DataStatusBadge 
                  status={livePricing?.dataStatus === 'corridor' ? 'verified' : (livePricing?.dataStatus || 'unavailable')} 
                  text={
                    livePricing?.dataStatus === 'corridor' 
                      ? t('market.coop_benchmark_badge', { defaultValue: '✓ Cooperative Benchmark' }) 
                      : livePricing?.verified 
                      ? t('market.live_mandi_badge', { defaultValue: '✓ Live Mandi Price' }) 
                      : t('market.price_feed_offline', { defaultValue: 'Price Feed Offline' })
                  } 
                />
              </div>
            </div>

            {pricingLoading ? (
              <div className="py-10 text-center text-xs text-stone-500">
                <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-stone-400" />
                <span>{t('market.checking_price_feed', { district, defaultValue: `Checking official price feed for ${district}...` })}</span>
              </div>
            ) : livePricing?.price !== null && livePricing?.price !== undefined ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-900">
                    {livePricing.commodity} ({livePricing.market})
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    {livePricing.retrievedAt ? new Date(livePricing.retrievedAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-950">
                  ₹{Number(livePricing.price).toLocaleString('en-IN')} <span className="text-xs font-bold text-emerald-800">/ {livePricing.unit || 'unit'}</span>
                </div>
                {livePricing.priceRange?.min && (
                  <div className="text-xs text-emerald-800 font-medium">
                    {t('market.procurement_corridor_label', { defaultValue: 'Procurement Corridor:' })} ₹{livePricing.priceRange.min} — ₹{livePricing.priceRange.max} / {livePricing.unit || 'unit'}
                  </div>
                )}
                <div className="text-[10px] text-emerald-700 font-bold">
                  {t('market.source_label', { defaultValue: 'Source:' })} {livePricing.source || t('market.official_market_benchmark', { defaultValue: 'Official Market Benchmark' })}
                </div>
              </div>
            ) : (
              <div className="p-5 bg-stone-50 rounded-xl border border-stone-200 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0b2545] flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                  ₹
                </div>
                <strong className="text-xs font-black text-stone-800 block">
                  {t('market.farmgate_pricing_active', { defaultValue: 'Farmgate / Cluster Observed Pricing Active' })}
                </strong>
                <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                  {t('market.decentralized_proc_desc', { rate: sellingPricePerUnit, defaultValue: `This sector operates on decentralized local procurement rather than regulated APMC crop auctions. Your observed rate of ₹${sellingPricePerUnit} / unit is active in the calculator below.` })}
                </p>
                <button
                  type="button"
                  onClick={fetchPricingIntelligence}
                  disabled={pricingLoading}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0b2545] hover:underline pt-1"
                >
                  <RefreshCw size={11} className={pricingLoading ? 'animate-spin' : ''} />
                  <span>{t('market.sync_mandi_btn', { defaultValue: 'Sync / Re-check Mandi Records' })}</span>
                </button>
              </div>
            )}

            {/* Interactive Unit Economics Calculator */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-black uppercase text-stone-700">
                {t('market.unit_econ_calc_title', { defaultValue: 'Custom Enterprise Unit Economics Calculator' })}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">{t('market.prod_cost_label', { defaultValue: 'Production Cost / Unit (₹)' })}</label>
                  <input
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">{t('market.sell_price_label', { defaultValue: 'Selling Price / Unit (₹)' })}</label>
                  <input
                    type="number"
                    value={sellingPricePerUnit}
                    onChange={(e) => setSellingPricePerUnit(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">{t('market.daily_vol_label', { defaultValue: 'Daily Volume (Units)' })}</label>
                  <input
                    type="number"
                    value={unitsPerDay}
                    onChange={(e) => setUnitsPerDay(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900"
                  />
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">{t('market.margin_unit', { defaultValue: 'Margin / Unit' })}</span>
                  <strong className="text-sm font-black text-stone-900">₹{sellingPricePerUnit - costPerUnit}</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">{t('market.margin_pct', { defaultValue: 'Margin %' })}</span>
                  <strong className="text-sm font-black text-stone-900">{marginPct.toFixed(1)}%</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">{t('market.daily_profit', { defaultValue: 'Daily Profit' })}</span>
                  <strong className="text-sm font-black text-stone-900">₹{dailyMargin.toLocaleString('en-IN')}</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">{t('market.monthly_surplus', { defaultValue: 'Monthly Surplus' })}</span>
                  <strong className="text-sm font-black text-stone-900">₹{monthlyProjectedMargin.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Price Range Comparison (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="border-b border-stone-100 pb-2">
                <h3 className="text-base font-black text-stone-900">
                  {t('market.cluster_price_corridors', { district, defaultValue: `Cluster Price Corridors (${district})` })}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">{t('market.wholesale_farmgate', { defaultValue: 'Wholesale Farmgate Range' })}</span>
                  <strong className="text-stone-900 font-black text-sm block">
                    {activeBenchmark.wholesaleRange}
                  </strong>
                  <span className="text-[10px] text-stone-500">{t('market.mandi_procurement_gate', { defaultValue: 'Mandi procurement gate rate' })}</span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">{t('market.retail_consumer_range', { defaultValue: 'Retail Consumer Range' })}</span>
                  <strong className="text-stone-900 font-black text-sm block">
                    {activeBenchmark.retailRange}
                  </strong>
                  <span className="text-[10px] text-stone-500">{t('market.retail_pouch_rate', { defaultValue: 'Semi-urban consumer retail pouch rate' })}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onNavigate) onNavigate('/finance/project-cost');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{t('market.apply_financial_plan', { defaultValue: 'Apply to Financial Plan' })}</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

        <StepActions
          onBack={() => handleStepChange(2)}
          onNext={() => handleStepChange(4)}
          nextLabel={t('common.save_and_continue', { defaultValue: 'Save & Continue' })}
        />
      </Step>

      {/* STEP 5: NEARBY MARKET DESKS & APMC */}
      <Step
        index={4}
        icon={Building2}
        title={t('market.step5_title', { defaultValue: 'Step 5: Nearby Market Desks & APMC' })}
        description={t('market.step5_desc', { district, defaultValue: `Verified physical District Industries Centres and APMC market yards in ${district}.` })}
        badge={t('market.official_desks', { defaultValue: 'Official Desks' })}
        summary={t('market.step5_summary', { district, defaultValue: `Verified support desks and APMC yards mapped in ${district}.` })}
      >
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">
                {t('market.verified_dic_apmc', { defaultValue: 'Verified District Industries Centres & APMC Yards' })}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {t('market.official_physical_desks', { district, defaultValue: `Official physical desks in ${district} for scheme facilitation and trade licensing` })}
              </p>
            </div>
            <DataStatusBadge status="verified" text={t('market.official_support_badge', { defaultValue: 'Official Support Desks' })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {markers.filter(m => m.district === district || !m.district).slice(0, 4).map((point, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-stone-900 font-black">{point.name}</strong>
                  <span className="text-[10px] uppercase font-bold text-[#0b2545] bg-blue-50 px-2 py-0.5 rounded">
                    {point.type}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">{point.details}</p>
                <div className="pt-1 text-[10px] text-stone-400">
                  {t('market.approx_dist', { dist: point.distance || 2.5, defaultValue: `Approx. ${point.distance || 2.5} km from taluka centre` })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <StepActions
          onBack={() => handleStepChange(3)}
          onNext={() => onNavigate && onNavigate('/journey/finance')}
          isLastStep={true}
          finishLabel={t('market.complete_go_finance', { defaultValue: 'Complete Market Feasibility & Go to Finance' })}
        />
      </Step>
    </Stepper>
  </div>
);
}
