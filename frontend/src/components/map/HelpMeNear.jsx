import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, PhoneCall, ExternalLink, Filter, 
  Building2, Compass, CheckCircle2, AlertCircle, Globe, Shield 
} from 'lucide-react';
import { getAllIndianStates, getDistrictsByState } from '../../utils/panIndiaLocations.js';
import { filterSupportPointsByStateAndDistrict } from '../../utils/panIndiaSupportData.js';

export default function HelpMeNear({ defaultState = 'Maharashtra', defaultDistrict = 'Pune', onLocationSelect }) {
  const { t } = useTranslation();

  const [selectedState, setSelectedState] = useState(defaultState);
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePoint, setActivePoint] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Available districts dynamically based on chosen state
  const availableDistricts = getDistrictsByState(selectedState);

  // When state changes, reset active selection & ensure district is valid
  const handleStateChange = (newState) => {
    setSelectedState(newState);
    setSelectedDistrict('All');
    setActivePoint(null);
    if (onLocationSelect) {
      onLocationSelect({ state: newState, district: 'All' });
    }
  };

  const handleDistrictChange = (newDistrict) => {
    setSelectedDistrict(newDistrict);
    setActivePoint(null);
    if (onLocationSelect) {
      onLocationSelect({ state: selectedState, district: newDistrict });
    }
  };

  const supportResult = filterSupportPointsByStateAndDistrict(selectedState, selectedDistrict, selectedCategory);
  const points = supportResult.locations || [];

  // Request browser location if permitted
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please select your state and district manually.');
      return;
    }

    setLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        setLocating(false);
        setLocationError('Location permission unavailable. You can easily pick your state and district from the dropdown.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-3 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            शासकीय सहाय्य नेटवर्क • Official Facilitation Points
          </span>
          <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight mt-1">
            {t('map_heading') || 'Verified Government Support Centres'}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Pan-India access to District Industries Centres (DIC), KVKs, and verified official facilitation portals.
          </p>
        </div>

        {/* Location GPS trigger */}
        <button
          onClick={handleDetectLocation}
          disabled={locating}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Compass size={14} className={locating ? "animate-spin text-[#0b2545]" : "text-emerald-600"} />
          <span>{locating ? 'Detecting...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {locationError && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Dynamic Pan-India Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* State Selector */}
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
            State / UT
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-[#0b2545]"
          >
            {getAllIndianStates().map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* District Selector (Dynamic based on selected state) */}
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
            {t('map_filter_district') || 'District'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-[#0b2545]"
          >
            <option value="All">{t('map_all_districts') || 'All Districts'}</option>
            {availableDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase mb-1">
            Facility Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-[#0b2545]"
          >
            <option value="All">{t('help_me_near.all_facilities', { defaultValue: 'All Facilities' })}</option>
            <option value="District Industries Centre">{t('help_me_near.dic_option', { defaultValue: 'District Industries Centres (DIC)' })}</option>
            <option value="Krishi Vigyan Kendra">{t('help_me_near.kvk_option', { defaultValue: 'Krishi Vigyan Kendras (KVK)' })}</option>
            <option value="Agriculture Support Office">{t('help_me_near.agri_support_offices', { defaultValue: 'Agriculture Support Offices' })}</option>
          </select>
        </div>

        <div className="flex items-end">
          <span className="text-xs font-bold text-stone-500 pb-2">
            Showing <strong>{points.length}</strong> {supportResult.hasDirectCenters ? 'verified locations' : 'portal resources'}
          </span>
        </div>

      </div>

      {/* Two Column Layout: Locations List and Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: List of Verified Centers (6 cols) */}
        <div className="lg:col-span-6 space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
          {points.length > 0 ? (
            points.map((pt) => {
              const isSelected = activePoint?.id === pt.id;
              return (
                <div
                  key={pt.id}
                  onClick={() => setActivePoint(pt)}
                  className={`bg-white rounded-2xl border p-4 shadow-sm transition-all cursor-pointer select-none space-y-2.5 ${
                    isSelected 
                      ? 'border-[#0b2545] ring-2 ring-[#0b2545]/15 bg-stone-50/50' 
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                        {pt.category}
                      </span>
                      <h3 className="font-extrabold text-sm md:text-base text-stone-900 mt-1">
                        {pt.name}
                      </h3>
                      {pt.nameMr && (
                        <p className="text-xs text-stone-500 font-bold">
                          {pt.nameMr}
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                      {pt.district}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 font-medium leading-relaxed">
                    {pt.address}
                  </p>

                  {/* Services tags */}
                  {pt.services && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pt.services.map((svc, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-100">
                          ✓ {svc}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions row */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <a
                      href={`tel:${pt.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-extrabold text-[#0b2545] hover:underline flex items-center gap-1"
                    >
                      <PhoneCall size={12} className="text-emerald-600" />
                      <span>{pt.phone}</span>
                    </a>

                    <a
                      href={pt.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 bg-[#0b2545] text-white font-bold text-[11px] rounded-lg hover:bg-[#13315c] flex items-center gap-1 shadow-sm"
                    >
                      <MapPin size={11} className="text-amber-400" />
                      <span>{t('map_open_directions') || 'Directions'}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            // District data not mapped yet: Show official government portal and national resources
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-amber-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <Building2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      Data currently unavailable for this district
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Physical facilitation office coordinates are not yet cataloged for <strong>{selectedDistrict !== 'All' ? `${selectedDistrict}, ` : ''}{selectedState}</strong>.
                    </p>
                  </div>
                </div>

                {/* State Official Portal Card */}
                {supportResult.officialPortal && (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Official State Portal
                      </span>
                      {supportResult.officialPortal.helpline && (
                        <a
                          href={`tel:${supportResult.officialPortal.helpline}`}
                          className="text-xs font-bold text-[#0b2545] hover:underline flex items-center gap-1"
                        >
                          <PhoneCall size={12} className="text-emerald-600" />
                          <span>{supportResult.officialPortal.helpline}</span>
                        </a>
                      )}
                    </div>
                    <h4 className="font-black text-xs text-stone-900">
                      {supportResult.officialPortal.portalName}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {supportResult.officialPortal.services?.map((svc, i) => (
                        <span key={i} className="text-[10px] font-medium bg-white text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                          ✓ {svc}
                        </span>
                      ))}
                    </div>
                    <a
                      href={supportResult.officialPortal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b2545] text-white font-bold text-xs rounded-lg hover:bg-[#13315c] transition-colors shadow-2xs mt-1"
                    >
                      <Globe size={12} className="text-amber-400" />
                      <span>{t('help_me_near.visit_single_window', { defaultValue: 'Visit State Single Window Portal' })}</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              {/* National Resources List */}
              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                  National MSME Assistance (All India)
                </h4>
                <div className="space-y-2">
                  {supportResult.nationalResources?.map((res, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-stone-900">{res.name}</div>
                        <p className="text-[11px] text-stone-500 leading-snug">{res.description}</p>
                        {res.helpline && (
                          <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                            Helpline: {res.helpline}
                          </span>
                        )}
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-stone-600 hover:text-[#0b2545] shrink-0"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visual Location Preview (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-[400px] lg:h-[620px]">
          
          <div className="p-3 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs font-extrabold text-stone-700">
            <span>{t('help_me_near.location_navigator', { defaultValue: 'Location Navigator' })}</span>
            <span className="text-[11px] text-stone-500">
              {activePoint ? activePoint.name : `${selectedDistrict !== 'All' ? `${selectedDistrict}, ` : ''}${selectedState}`}
            </span>
          </div>

          <div className="flex-1 bg-stone-100 relative flex items-center justify-center p-6 text-center">
            {activePoint ? (
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-md max-w-sm w-full space-y-4 text-left animate-fadeIn">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase">{activePoint.category}</span>
                  <h4 className="font-extrabold text-base text-stone-900">{activePoint.name}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{activePoint.address}</p>
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <div><strong>Phone:</strong> {activePoint.phone}</div>
                  <div><strong>Email:</strong> {activePoint.email || 'N/A'}</div>
                  <div><strong>Lat/Lng:</strong> {activePoint.lat}, {activePoint.lng}</div>
                </div>
                <a
                  href={activePoint.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-[#0b2545] hover:bg-[#13315c] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <MapPin size={13} className="text-amber-400" />
                  <span>{t('help_me_near.navigate_google_maps', { defaultValue: 'Navigate on Google Maps' })}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            ) : (
              <div className="space-y-3 max-w-xs">
                <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-stone-200 flex items-center justify-center text-stone-400 mx-auto">
                  <MapPin size={26} className="text-[#0b2545]" />
                </div>
                <p className="text-xs font-bold text-stone-600 leading-relaxed">
                  {supportResult.hasDirectCenters
                    ? 'Click any verified District Industries Centre (DIC) or KVK from the list to view contact details and Google Maps navigation.'
                    : `Viewing official MSME & DIC support network for ${selectedState}. Use the verified portal link to access district-level services.`}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
