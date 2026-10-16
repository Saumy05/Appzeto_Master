/**
 * Business Settings Utility
 * Handles loading and updating business settings (favicon, title, logo)
 */

import apiClient from "@food/api/axios";
import { API_ENDPOINTS } from "@food/api/config";
import { publicGetOnce } from "@food/api";

const SETTINGS_KEY = 'helloparth_business_settings';

// Initialize from localStorage immediately so it's available for components on mount
let cachedSettings = (() => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      if (/dima/i.test(parsed.companyName || '')) {
        parsed.companyName = 'Appzeto';
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed)); } catch (e) {}
      }
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
})();

// Apply cached settings immediately on module load if they exist
if (cachedSettings) {
  setTimeout(() => {
    updateFavicon(cachedSettings.favicon?.url);
    updateTitle(cachedSettings.companyName);
  }, 0);
}

let inFlightSettingsPromise = null;

/**
 * Load business settings from backend (public endpoint - no auth required)
 */
export const loadBusinessSettings = async () => {
  try {
    // If we have no cached settings, we MUST fetch
    // If we have cached settings, we still try to fetch in background to ensure they are fresh
    const endpoint = API_ENDPOINTS.ADMIN.BUSINESS_SETTINGS_PUBLIC;
    if (!endpoint || (typeof endpoint === "string" && !endpoint.trim())) {
      return cachedSettings;
    }

    if (inFlightSettingsPromise) {
      return await inFlightSettingsPromise;
    }

    inFlightSettingsPromise = (async () => {
      /*
       * Public endpoint, no auth needed — and deliberately NOT { noCache: true }.
       *
       * The in-flight guard above only covers *concurrent* callers: it is
       * cleared in the `finally` below the moment the first call settles. App
       * boot loads these settings at ~360ms and the navbar mounts and asks
       * again at ~1740ms, by which point the guard is gone — so the same
       * response was fetched twice on every page load. `noCache: true` was
       * explicitly opting out of the 3-second dedup that would have collapsed
       * them. Three seconds is still "fresh data from the server"; the second
       * request was not buying anything.
       */
      const response = await publicGetOnce(endpoint);
      const settings = response?.data?.data || response?.data;

      if (settings) {
        cachedSettings = settings;
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {}
        
        updateFavicon(settings.favicon?.url);
        updateTitle(settings.companyName);
        return settings;
      }
      return cachedSettings;
    })();

    return await inFlightSettingsPromise;
  } catch (error) {
    // Return cached if failed
    return cachedSettings;
  } finally {
    inFlightSettingsPromise = null;
  }
};

/**
 * Update favicon in document
 */
export const updateFavicon = (url) => {
  if (typeof document === 'undefined') return;

  // Admin favicon when present; otherwise default Appzeto favicon
  const href = (url && String(url).trim()) || '/logo.png';

  // Remove existing favicons
  const existingFavicons = document.querySelectorAll("link[rel*='icon']");
  existingFavicons.forEach(el => el.remove());

  // Add new favicon
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = /\.png(\?|$)/i.test(href) ? "image/png" : (/\.webp(\?|$)/i.test(href) ? "image/webp" : "image/png");
  link.href = href;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
};

/**
 * Update page title
 */
export const updateTitle = (companyName) => {
  if (typeof document !== 'undefined') {
    const isInvalid = !companyName || companyName === "Foodelo" || /dima/i.test(companyName);
    document.title = isInvalid ? "Appzeto" : companyName;
  }
};

/**
 * Set cached settings manually (useful after update)
 */
export const setCachedSettings = (settings) => {
  if (settings) {
    cachedSettings = settings;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
    
    updateFavicon(settings.favicon?.url);
    updateTitle(settings.companyName);
  }
};

/**
 * Clear cached settings (call after updating settings)
 */
export const clearCache = () => {
  cachedSettings = null;
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) {}
};

/**
 * Get cached settings
 */
export const getCachedSettings = () => {
  return cachedSettings;
};

/**
 * Get company name from business settings with fallback
 * @returns {string} Company name or default "Appzeto Food"
 */
export const getCompanyName = () => {
  const settings = getCachedSettings();
  const name = settings?.companyName || "Appzeto Food";
  return name === "Foodelo" ? "Appzeto Food" : name;
};

/**
 * Get company name asynchronously (loads if not cached)
 * @returns {Promise<string>} Company name or default "Appzeto Food"
 */
export const getCompanyNameAsync = async () => {
  try {
    const settings = await loadBusinessSettings();
    return settings?.companyName || "Appzeto Food";
  } catch (error) {
    return "Appzeto Food";
  }
};
