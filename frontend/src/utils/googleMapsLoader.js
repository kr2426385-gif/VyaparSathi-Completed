/**
 * Google Maps JavaScript API Singleton Loader
 * Loads the official Google Maps JS API with Places and Geometry libraries.
 */

let googleMapsPromise = null;

export function getGoogleMapsApiKey() {
  const envKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
  if (
    envKey && 
    envKey.trim() && 
    envKey !== 'YOUR_API_KEY_HERE' && 
    !envKey.startsWith('http://') && 
    !envKey.startsWith('https://') &&
    !envKey.includes('/') &&
    envKey.length >= 20
  ) {
    return envKey.trim();
  }
  if (
    typeof window !== 'undefined' && 
    window.__GOOGLE_MAPS_API_KEY__ && 
    !window.__GOOGLE_MAPS_API_KEY__.startsWith('http')
  ) {
    return window.__GOOGLE_MAPS_API_KEY__;
  }
  return '';
}

export function isGoogleMapsLoaded() {
  return typeof window !== 'undefined' && !!(window.google && window.google.maps && window.google.maps.places);
}

export function loadGoogleMapsApi() {
  if (isGoogleMapsLoaded()) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('NO_API_KEY'));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = `__initGoogleMaps_${Date.now()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps object missing after script load'));
      }
    };

    // Check if script already in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        existingScript.addEventListener('load', () => resolve(window.google.maps));
        existingScript.addEventListener('error', () => reject(new Error('Existing script failed to load')));
      }
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window[callbackName];
      googleMapsPromise = null;
      reject(new Error('SCRIPT_LOAD_ERROR'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
