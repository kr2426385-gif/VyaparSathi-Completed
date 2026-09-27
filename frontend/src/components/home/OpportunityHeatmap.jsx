import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, Navigation, Compass, Layers, Info, CheckCircle2, 
  Sparkles, Building2, ShoppingCart, Package, Truck, AlertTriangle, 
  ArrowRight, RefreshCw, ZoomIn, ZoomOut, Check, Eye, HelpCircle,
  ExternalLink, Store, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  loadGoogleMapsApi, 
  isGoogleMapsLoaded, 
  getGoogleMapsApiKey 
} from '../../utils/googleMapsLoader.js';
import { 
  geocodeLocation, 
  searchGoogleNearbyPlaces, 
  CATEGORY_SEARCH_CONFIGS,
  calculateDistanceKm
} from '../../utils/googleMapsPlaces.js';
import { getAllIndianStates, getDistrictsByState } from '../../utils/panIndiaLocations.js';
import { askGeminiAdvisor } from '../../utils/geminiAdvisor.js';

// Leaflet GIS engine imports for 100% offline-friendly / non-API fallback
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, Circle as LeafletCircle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Dynamic Leaflet re-centering hook
function LeafletMapRecenter({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && map) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Leaflet DivIcon Pin Generators
const createLayerDivPin = (color) => {
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
        box-shadow: 0 3px 6px rgba(0,0,0,0.35);
      ">
        <div style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></div>
      </div>
    `,
    className: 'custom-leaflet-pin',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

const createCenterDivPin = () => {
  return new L.DivIcon({
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        background-color: #0a2342;
        border-radius: 50%;
        border: 3px solid #f59e0b;
        box-shadow: 0 4px 10px rgba(0,0,0,0.45);
      ">
        <div style="width: 8px; height: 8px; background-color: #f59e0b; border-radius: 50%;"></div>
      </div>
    `,
    className: 'custom-center-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

// SVG Pin Generators for Google Maps Markers
const createSvgPin = (color, label = '') => {
  const pinObj = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42" fill="none">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
        <circle cx="17" cy="17" r="8" fill="white"/>
        <circle cx="17" cy="17" r="4.5" fill="${color}"/>
      </svg>
    `)}`
  };

  if (typeof window !== 'undefined' && window.google?.maps?.Size && window.google?.maps?.Point) {
    pinObj.scaledSize = new window.google.maps.Size(32, 40);
    pinObj.anchor = new window.google.maps.Point(16, 40);
  }
  return pinObj;
};

const createCenterPin = () => {
  const pinObj = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48" fill="none">
        <circle cx="20" cy="20" r="18" fill="#0a2342" fill-opacity="0.25"/>
        <path d="M20 4C11.1634 4 4 11.1634 4 20C4 32 20 44 20 44C20 44 36 32 36 20C36 11.1634 28.8366 4 20 4Z" fill="#0a2342"/>
        <circle cx="20" cy="20" r="8" fill="#f59e0b"/>
        <circle cx="20" cy="20" r="4" fill="#0a2342"/>
      </svg>
    `)}`
  };

  if (typeof window !== 'undefined' && window.google?.maps?.Size && window.google?.maps?.Point) {
    pinObj.scaledSize = new window.google.maps.Size(38, 46);
    pinObj.anchor = new window.google.maps.Point(19, 46);
  }
  return pinObj;
};

export default function OpportunityHeatmap({ 
  initialState = 'Maharashtra',
  initialDistrict = 'Pune',
  initialBlock = '',
  initialVillage = '',
  initialCategory = 'Dairy & Animal Husbandry',
  onNavigate 
}) {
  const { t, i18n } = useTranslation();
  // Location & Category State
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [block, setBlock] = useState(initialBlock);
  const [village, setVillage] = useState(initialVillage);
  const [category, setCategory] = useState(initialCategory);
  const [radiusKm, setRadiusKm] = useState(5); // 5 km or 10 km

  // Pan-India States & Districts Lists
  const allStates = useMemo(() => getAllIndianStates(), []);
  const stateDistricts = useMemo(() => getDistrictsByState(selectedState), [selectedState]);

  // Map Instance & Coordinates State
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletMapRef = useRef(null);
  const centerMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const placeMarkersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const [mapCoords, setMapCoords] = useState({ lat: 17.2612, lng: 74.1488 });
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' or 'satellite'
  const [mapLoading, setMapLoading] = useState(true);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [locating, setLocating] = useState(false);

  // Nearby Places & Layers State
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({
    opportunity: true,
    competition: true,
    buyer: true,
    supplier: true,
    logistics: true,
    support: true
  });

  // Google Gemini Advisory State
  const [geminiAdvice, setGeminiAdvice] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [showGeminiPanel, setShowGeminiPanel] = useState(false);

  // Generate Real-Time Gemini Advisory
  const handleFetchGeminiAdvisory = async () => {
    setGeminiLoading(true);
    setShowGeminiPanel(true);
    try {
      const locStr = [village, block, selectedDistrict, selectedState].filter(Boolean).join(', ');
      const query = `Provide practical micro-enterprise feasibility and government subsidy structuring for a ${category} unit in ${locStr}. Focus on local raw materials, buyer channels, CMEGP/PMFME subsidy, and bank DPR readiness.`;
      
      const activeLang = ['mr', 'hi', 'en'].includes(i18n?.language) ? i18n.language : 'mr';
      const res = await askGeminiAdvisor({
        query,
        language: activeLang,
        userProfile: { category, district: selectedDistrict, block, village },
        location: locStr
      });
      setGeminiAdvice(res);
    } catch (err) {
      console.warn('Gemini Advisory error:', err);
    } finally {
      setGeminiLoading(false);
    }
  };

  // Check and Load Google Maps API on Mount
  useEffect(() => {
    let isMounted = true;

    async function initGoogleMaps() {
      setMapLoading(true);
      try {
        const apiKey = getGoogleMapsApiKey();
        if (!apiKey) {
          if (isMounted) {
            setApiKeyMissing(true);
            setMapLoading(false);
          }
          return;
        }

        await loadGoogleMapsApi();
        if (isMounted) {
          setApiLoaded(true);
          setApiKeyMissing(false);
          setMapLoading(false);
        }
      } catch (err) {
        console.warn('Google Maps API failed to load, switching to demo mode:', err);
        if (isMounted) {
          setApiKeyMissing(true);
          setMapLoading(false);
        }
      }
    }

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Geocoded Location when inputs change
  const handleGeocodeAndCenter = useCallback(async () => {
    setMapLoading(true);
    try {
      const geoResult = await geocodeLocation({
        state: selectedState,
        district: selectedDistrict,
        block,
        village
      });

      if (geoResult && geoResult.lat && geoResult.lng) {
        setMapCoords({ lat: geoResult.lat, lng: geoResult.lng });

        // Update center on map instance if active
        if (mapInstanceRef.current && window.google?.maps) {
          const newCenter = new window.google.maps.LatLng(geoResult.lat, geoResult.lng);
          mapInstanceRef.current.panTo(newCenter);

          // Update user location pin
          if (centerMarkerRef.current) {
            centerMarkerRef.current.setPosition(newCenter);
          }

          // Update radius circle
          if (radiusCircleRef.current) {
            radiusCircleRef.current.setCenter(newCenter);
            radiusCircleRef.current.setRadius(radiusKm * 1000);
          }
        }
      }
    } catch (e) {
      console.warn('Geocoding error:', e);
    } finally {
      setMapLoading(false);
    }
  }, [selectedState, selectedDistrict, block, village, radiusKm]);

  // Trigger geocode on location changes
  useEffect(() => {
    handleGeocodeAndCenter();
  }, [handleGeocodeAndCenter]);

  // Initialize or update Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (apiLoaded && window.google?.maps) {
      if (!mapInstanceRef.current) {
        // Initialize Map
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center: mapCoords,
          zoom: radiusKm === 5 ? 13 : 12,
          mapTypeId: mapType,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new window.google.maps.InfoWindow({ maxWidth: 280 });

        // Center Location Marker
        const centerMarker = new window.google.maps.Marker({
          position: mapCoords,
          map,
          title: `Your Location: ${village || block || selectedDistrict}`,
          icon: createCenterPin(),
          zIndex: 999
        });
        centerMarkerRef.current = centerMarker;

        // Radius Circle
        const circle = new window.google.maps.Circle({
          strokeColor: '#0a2342',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#38bdf8',
          fillOpacity: 0.12,
          map,
          center: mapCoords,
          radius: radiusKm * 1000
        });
        radiusCircleRef.current = circle;
      } else {
        // Update existing map
        mapInstanceRef.current.setCenter(mapCoords);
        mapInstanceRef.current.setMapTypeId(mapType);
        mapInstanceRef.current.setZoom(radiusKm === 5 ? 13 : 12);

        if (centerMarkerRef.current) {
          centerMarkerRef.current.setPosition(mapCoords);
          centerMarkerRef.current.setTitle(`Your Location: ${village || block || selectedDistrict}`);
        }

        if (radiusCircleRef.current) {
          radiusCircleRef.current.setCenter(mapCoords);
          radiusCircleRef.current.setRadius(radiusKm * 1000);
        }
      }
    }
  }, [apiLoaded, mapCoords, mapType, radiusKm, village, block, selectedDistrict]);

  // Fetch Nearby Places whenever mapCoords, radiusKm, or category changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchPlaces() {
      const radiusMeters = radiusKm * 1000;
      const results = await searchGoogleNearbyPlaces(
        mapInstanceRef.current,
        mapCoords.lat,
        mapCoords.lng,
        radiusMeters,
        category,
        { state: selectedState, district: selectedDistrict, block, village }
      );

      if (!isCancelled) {
        setPlaces(results);
      }
    }

    fetchPlaces();

    return () => {
      isCancelled = true;
    };
  }, [mapCoords, radiusKm, category, selectedState, selectedDistrict, block, village]);

  // Render Place Markers on the Google Map
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) return;

    // Clear old markers
    placeMarkersRef.current.forEach((m) => m.setMap(null));
    placeMarkersRef.current = [];

    // Create markers for places that match active layer filter
    places.forEach((place) => {
      if (!visibleLayers[place.layer]) return;

      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstanceRef.current,
        title: place.name,
        icon: createSvgPin(place.layerColor)
      });

      marker.addListener('click', () => {
        setSelectedPlace(place);

        if (infoWindowRef.current) {
          const contentString = `
            <div style="font-family: inherit; padding: 4px; text-align: left;">
              <div style="display: inline-block; font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background-color: ${place.layerColor}22; color: ${place.layerColor}; margin-bottom: 4px;">
                ${place.layerName}
              </div>
              <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #0a2342; line-height: 1.2;">
                ${place.name}
              </h4>
              <p style="margin: 4px 0 2px 0; font-size: 11px; color: #57534e;">
                ${place.vicinity}
              </p>
              <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e7e5e4; display: flex; align-items: center; justify-content: space-between; font-size: 10px; font-weight: 700;">
                <span style="color: #0a2342;">📍 ${place.distanceKm} km away</span>
                ${place.rating ? `<span style="color: #d97706;">★ ${place.rating}</span>` : ''}
              </div>
            </div>
          `;
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      placeMarkersRef.current.push(marker);
    });
  }, [places, visibleLayers]);

  // Toggle Layer Visibility
  const toggleLayer = (layerKey) => {
    setVisibleLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Browser Geolocation Detector
  const handleDetectBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCoords({ lat, lng });
        setVillage('My GPS Location');

        if (mapInstanceRef.current && window.google?.maps) {
          mapInstanceRef.current.panTo(new window.google.maps.LatLng(lat, lng));
        }
      },
      (err) => {
        setLocating(false);
        alert('Could not detect GPS location. Please choose District and Taluka manually.');
      },
      { timeout: 8000 }
    );
  };

  // Zoom Controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.panTo(new window.google.maps.LatLng(mapCoords.lat, mapCoords.lng));
      mapInstanceRef.current.setZoom(radiusKm === 5 ? 13 : 12);
    }
  };

  // Aggregate Snapshot Counts
  const opportunityPlaces = places.filter(p => p.layer === 'opportunity');
  const competitionPlaces = places.filter(p => p.layer === 'competition');
  const buyerPlaces = places.filter(p => p.layer === 'buyer');
  const supplierPlaces = places.filter(p => p.layer === 'supplier');
  const logisticsPlaces = places.filter(p => p.layer === 'logistics');
  const supportPlaces = places.filter(p => p.layer === 'support');

  return (
    <section 
      id="opportunity-heatmap-section"
      aria-label={t('heatmap.aria_label', { defaultValue: 'Explore Your Local Business Opportunity' })}
      className="relative w-full overflow-hidden select-none py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-y border-stone-200/90 my-4"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(250, 250, 249, 0.88) 0%, rgba(245, 245, 244, 0.76) 50%, rgba(250, 250, 249, 0.92) 100%), url('/images/clean_light_map_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Centered Content Container */}
      <div className="max-w-7xl mx-auto space-y-4 relative z-10">

        {/* 1. SECTION HEADER (Streamlined) */}
        <div className="text-center max-w-3xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-[#0a2342]">
            {t('heatmap.title_part1', { defaultValue: 'Explore Your Local' })} <span className="text-amber-500">{t('heatmap.title_part2', { defaultValue: 'Business Opportunity' })}</span>
          </h2>
          <p className="text-xs text-stone-600 font-medium max-w-xl mx-auto leading-relaxed">
            Review live consumer demand, competitor density, and market access within your target 5–10 km perimeter.
          </p>
        </div>

        {/* 2. TOP LOCATION & CATEGORY FILTER BAR (Compact) */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 p-3 sm:p-3.5 shadow-md">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
            
            {/* State */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                State / UT
              </label>
              <select
                value={selectedState}
                onChange={(e) => {
                  const newState = e.target.value;
                  setSelectedState(newState);
                  const dists = getDistrictsByState(newState);
                  if (dists && dists.length > 0) {
                    setSelectedDistrict(dists[0]);
                  }
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
              >
                {allStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                District / Hub
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
              >
                {(stateDistricts.length > 0 ? stateDistricts : [selectedDistrict]).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Block / Taluka */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Block / Taluka
              </label>
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="Taluka / Tehsil"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Village */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Village / Area
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder={t('heatmap.village_placeholder', { defaultValue: 'Village or Town' })}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-amber-400 focus:outline-none cursor-pointer"
              >
                {Object.keys(CATEGORY_SEARCH_CONFIGS).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Radius Selector */}
            <div>
              <label className="block text-[10px] font-extrabold text-stone-700 uppercase tracking-wider mb-1">
                Radius
              </label>
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
                <button
                  type="button"
                  onClick={() => setRadiusKm(5)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    radiusKm === 5
                      ? 'bg-amber-400 text-[#0a2342] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  5 km
                </button>
                <button
                  type="button"
                  onClick={() => setRadiusKm(10)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                    radiusKm === 10
                      ? 'bg-amber-400 text-[#0a2342] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  10 km
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. MAIN MAP WORKSPACE & SNAPSHOT GRID (Reduced Height & Compact Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT COLUMN: RESILIENT MAP CONTAINER (7 COLS) */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 p-3.5 shadow-md flex flex-col justify-between space-y-3">
            
            {/* Map Viewport Box - Decreased Height */}
            <div className="relative w-full h-[320px] sm:h-[350px] rounded-xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100">
              
              {/* Dual Engine Map: Google Maps when API is active, Leaflet + OpenStreetMap when API is offline */}
              {apiLoaded && window.google?.maps && !apiKeyMissing ? (
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full relative z-0">
                  <MapContainer
                    center={[mapCoords.lat, mapCoords.lng]}
                    zoom={radiusKm === 5 ? 13 : 12}
                    scrollWheelZoom={false}
                    zoomControl={false}
                    attributionControl={false}
                    className="w-full h-full z-0"
                  >
                    <LeafletMapRecenter 
                      center={[mapCoords.lat, mapCoords.lng]} 
                      zoom={radiusKm === 5 ? 13 : 12} 
                      onMapReady={(m) => { leafletMapRef.current = m; }}
                    />
                    <TileLayer
                      attribution=""
                      url={mapType === 'satellite' 
                        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                    />
                    
                    {/* Perimeter Coverage Radius Circle */}
                    <LeafletCircle
                      center={[mapCoords.lat, mapCoords.lng]}
                      radius={radiusKm * 1000}
                      pathOptions={{ color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.15, weight: 2 }}
                    />

                    {/* Entrepreneur Location Pin */}
                    <LeafletMarker position={[mapCoords.lat, mapCoords.lng]} icon={createCenterDivPin()}>
                      <LeafletPopup>
                        <div className="text-xs font-bold text-[#0a2342] text-left">
                          📍 {village || block || selectedDistrict}, {selectedState}
                          <span className="block text-[10px] text-stone-500 font-mono mt-0.5">
                            {mapCoords.lat.toFixed(4)}°N, {mapCoords.lng.toFixed(4)}°E
                          </span>
                        </div>
                      </LeafletPopup>
                    </LeafletMarker>

                    {/* Nearby Market & Cluster Markers */}
                    {places.filter(p => visibleLayers[p.layer]).map((place) => (
                      <LeafletMarker
                        key={place.id}
                        position={[place.lat, place.lng]}
                        icon={createLayerDivPin(place.layerColor)}
                        eventHandlers={{
                          click: () => setSelectedPlace(place)
                        }}
                      >
                        <LeafletPopup>
                          <div className="text-xs text-left p-1">
                            <span 
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded inline-block"
                              style={{ backgroundColor: `${place.layerColor}22`, color: place.layerColor }}
                            >
                              {place.layerName}
                            </span>
                            <strong className="block text-stone-900 mt-1 font-extrabold">{place.name}</strong>
                            <p className="text-[11px] text-stone-600 m-0 mt-0.5">{place.vicinity}</p>
                            <span className="text-[10px] font-bold text-[#0a2342] mt-1 block">📍 {place.distanceKm} km away</span>
                          </div>
                        </LeafletPopup>
                      </LeafletMarker>
                    ))}
                  </MapContainer>
                </div>
              )}

              {/* Top-Left: Map / Satellite Controls */}
              <div className="absolute top-2.5 left-2.5 z-10 flex items-center bg-white/95 backdrop-blur-md rounded-lg shadow border border-stone-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setMapType('roadmap')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                    mapType === 'roadmap'
                      ? 'bg-[#0a2342] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950'
                  }`}
                >
                  Map
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('satellite')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                    mapType === 'satellite'
                      ? 'bg-[#0a2342] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950'
                  }`}
                >
                  Satellite
                </button>
              </div>



              {/* Top-Right: Re-Center Button */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <button
                  type="button"
                  onClick={handleRecenter}
                  title={t('heatmap.recenter_title', { defaultValue: 'Re-center on Your Location' })}
                  className="w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-[#0a2342] border border-stone-200 shadow flex items-center justify-center text-xs font-bold transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  <Navigation size={14} />
                </button>
              </div>

              {/* Bottom-Left Perimeter Indicator HUD */}
              <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
                <div className="bg-[#0a2342]/90 text-stone-100 px-2 py-0.5 rounded-md text-[9px] font-bold border border-stone-700 backdrop-blur-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{radiusKm} km Active</span>
                </div>
              </div>

              {/* Bottom-Right: Zoom Controls */}
              <div className="absolute bottom-2.5 right-2.5 z-10 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title={t('heatmap.zoom_in_title', { defaultValue: 'Zoom In' })}
                  className="w-6 h-6 rounded-md bg-white/95 hover:bg-white text-[#0a2342] border border-stone-200 shadow flex items-center justify-center text-xs font-black transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title={t('heatmap.zoom_out_title', { defaultValue: 'Zoom Out' })}
                  className="w-6 h-6 rounded-md bg-white/95 hover:bg-white text-[#0a2342] border border-stone-200 shadow flex items-center justify-center text-xs font-black transition-transform active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  −
                </button>
              </div>

            </div>

            {/* MAP LEGEND & LAYER FILTER ROW */}
            <div className="pt-1.5 border-t border-stone-100">
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-bold text-stone-700">
                


                {/* Opportunity Area */}
                <button 
                  type="button"
                  onClick={() => toggleLayer('opportunity')}
                  className={`flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 cursor-pointer transition-all ${!visibleLayers.opportunity ? 'opacity-40' : 'hover:border-emerald-500'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-stone-800">{t('heatmap.legend_opportunity', { defaultValue: 'Opportunity' })}</span>
                </button>

                {/* Existing Business */}
                <button 
                  type="button"
                  onClick={() => toggleLayer('competition')}
                  className={`flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 cursor-pointer transition-all ${!visibleLayers.competition ? 'opacity-40' : 'hover:border-purple-500'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-stone-800">{t('heatmap.legend_competitors', { defaultValue: 'Competitors' })}</span>
                </button>

                {/* Buyers / Markets */}
                <button 
                  type="button"
                  onClick={() => toggleLayer('buyer')}
                  className={`flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200 cursor-pointer transition-all ${!visibleLayers.buyer ? 'opacity-40' : 'hover:border-blue-500'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-stone-800">{t('heatmap.legend_buyers', { defaultValue: 'Buyers / Mandis' })}</span>
                </button>

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: LOCAL OPPORTUNITY SNAPSHOT (5 COLS - STREAMLINED TO ESSENTIAL CARDS) */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 p-4 shadow-md flex flex-col justify-between space-y-3 text-left">
            
            <div className="space-y-2.5">
              
              {/* Header: Title + Live Status Ping Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold text-sm">📊</span>
                  <h3 className="text-sm font-black text-[#0a2342] tracking-tight">
                    {t('heatmap.snapshot_title', { defaultValue: 'Local Opportunity Snapshot' })}
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>{t('heatmap.field_mapping', { defaultValue: 'Field Mapping' })}</span>
                </div>
              </div>

              {/* Selected Location Banner Card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0a2342] text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-black">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-stone-900 leading-snug">
                      {village || 'Village Area'}, {block || 'Taluka'}
                    </h4>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {selectedDistrict} District, {selectedState} • Radius: {radiusKm} km
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded">
                  {category.split(' ')[0]} Sector
                </span>
              </div>

              {/* The 3 Core Essential Live Insight Rows (Compact, Clean, High-Value) */}
              <div className="space-y-2 text-xs">
                
                {/* 1. Market Opportunity */}
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/90 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                        ↗
                      </span>
                      <strong className="text-emerald-950 font-black text-[10px] uppercase tracking-wide">
                        Market Opportunity
                      </strong>
                    </div>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black uppercase">
                      High Demand
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-900 font-medium pl-5.5 leading-relaxed">
                    {opportunityPlaces.length > 0 
                      ? `Identified ${opportunityPlaces.length} growth opportunity points within ${radiusKm} km radius.`
                      : `High unserved consumer demand for value-added ${category} products in ${village || block}.`}
                  </p>
                </div>

                {/* 2. Competition */}
                <div className="p-2.5 bg-purple-50/80 border border-purple-200/90 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                        🏢
                      </span>
                      <strong className="text-purple-950 font-black text-[10px] uppercase tracking-wide">
                        Competition Density
                      </strong>
                    </div>
                    <span className="text-[8px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-black uppercase">
                      {competitionPlaces.length > 0 ? `${competitionPlaces.length} Mapped` : 'Low Density'}
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-900 font-medium pl-5.5 leading-relaxed">
                    {competitionPlaces.length > 0
                      ? `${competitionPlaces.length} active units mapped. Nearest is ${competitionPlaces[0].name} (${competitionPlaces[0].distanceKm} km).`
                      : `Active primary local co-operatives and vendors operate in this perimeter.`}
                  </p>
                </div>

                {/* 3. Buyers & Market Access */}
                <div className="p-2.5 bg-blue-50/80 border border-blue-200/90 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                        🛒
                      </span>
                      <strong className="text-blue-950 font-black text-[10px] uppercase tracking-wide">
                        Buyers & Mandi Access
                      </strong>
                    </div>
                    <span className="text-[8px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black uppercase">
                      {buyerPlaces.length > 0 ? `${buyerPlaces[0].distanceKm} km Proximity` : 'Haat Linkage'}
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-900 font-medium pl-5.5 leading-relaxed">
                    {buyerPlaces.length > 0
                      ? `${buyerPlaces[0].name} located ${buyerPlaces[0].distanceKm} km away with active weekly collection.`
                      : `Weekly Gramin Haat / APMC mandi access with regular morning aggregation routes.`}
                  </p>
                </div>

              </div>

            </div>

            {/* Action Trigger */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => onNavigate?.('/schemes/match')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0a2342] hover:bg-[#13315c] text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              >
                <span>Verify Scheme Eligibility for {village || block}</span>
                <ArrowRight size={14} className="text-amber-400" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
