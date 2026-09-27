import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.js';

const EnterpriseProfileContext = createContext(null);

export function EnterpriseProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Pan-India location state
  const [location, setLocation] = useState(() => {
    try {
      const storedUser = localStorage.getItem('vyapar_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        return {
          state: u.state || 'Maharashtra',
          district: u.district || 'Satara',
          taluka: u.taluka || '',
          block: u.block || '',
          village: u.village || ''
        };
      }
    } catch (_) {}
    return {
      state: 'Maharashtra',
      district: 'Satara',
      taluka: '',
      block: '',
      village: ''
    };
  });

  // Fetch verified profile from backend on mount or authentication change
  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('vyapar_token');
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await apiService.getProfile();
      if (data && data.profile) {
        setProfile(data.profile);
        setLocation({
          state: data.profile.state || 'Maharashtra',
          district: data.profile.district || 'Satara',
          taluka: data.profile.taluka || '',
          block: data.profile.block || '',
          village: data.profile.village || ''
        });
      }
    } catch (err) {
      console.warn('[EnterpriseProfileContext] Profile sync fallback:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();

    // Listen for storage events (e.g. login/logout in other tabs or components)
    const handleStorageChange = (e) => {
      if (e.key === 'vyapar_token' || e.key === 'vyapar_user') {
        refreshProfile();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshProfile]);

  // Update location and synchronize with backend
  const updateLocation = async (newLocation) => {
    const updated = {
      ...location,
      ...newLocation
    };
    setLocation(updated);

    try {
      const token = localStorage.getItem('vyapar_token');
      if (token) {
        await apiService.saveProfile({
          ...(profile || {}),
          state: updated.state,
          district: updated.district,
          taluka: updated.taluka,
          block: updated.block,
          village: updated.village
        });
      }

      // Update cached user object
      const storedUser = localStorage.getItem('vyapar_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          localStorage.setItem('vyapar_user', JSON.stringify({
            ...u,
            state: updated.state,
            district: updated.district,
            taluka: updated.taluka,
            block: updated.block,
            village: updated.village
          }));
        } catch (_) {}
      }
      return { success: true };
    } catch (err) {
      console.error('[EnterpriseProfileContext] Failed to persist location:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    profile,
    location,
    state: location.state,
    district: location.district,
    taluka: location.taluka,
    block: location.block,
    village: location.village,
    loading,
    error,
    refreshProfile,
    updateLocation
  };

  return (
    <EnterpriseProfileContext.Provider value={value}>
      {children}
    </EnterpriseProfileContext.Provider>
  );
}

export function useEnterpriseProfile() {
  const ctx = useContext(EnterpriseProfileContext);
  if (!ctx) {
    // Return sensible default if used outside Provider
    return {
      state: 'Maharashtra',
      district: 'Satara',
      taluka: '',
      block: '',
      village: '',
      location: { state: 'Maharashtra', district: 'Satara', taluka: '', block: '', village: '' },
      profile: null,
      loading: false,
      error: null,
      refreshProfile: () => {},
      updateLocation: async () => ({ success: false })
    };
  }
  return ctx;
}
