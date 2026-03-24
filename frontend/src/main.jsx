import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {UIProvider} from './contexts/UIContext';
import App from './App.jsx'
import { getCurrency } from './utils/currencyPricing';

import axios from 'axios';
axios.defaults.withCredentials = true;

const COUNTRY_STORAGE_KEY = 'detectedCountry';
const CACHE_VERSION_KEY = 'cache_version';
const CACHE_VERSION = 'v1';

const isHardReload = () => {
  const navEntry = performance.getEntriesByType('navigation')[0];
  return navEntry?.type === 'reload';
};

const checkCacheVersion = () => {
  const version = localStorage.getItem(CACHE_VERSION_KEY);

  if (version !== CACHE_VERSION) {
    localStorage.removeItem(COUNTRY_STORAGE_KEY);
    localStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    return true;
  }

  return false;
};

const hardReloaded = isHardReload();
if (hardReloaded) {
  localStorage.removeItem(COUNTRY_STORAGE_KEY);
}

const cacheVersionReset = checkCacheVersion();

if (hardReloaded || cacheVersionReset) {
  // Re-populate country cache immediately after reset.
  getCurrency().catch((error) => {
    console.warn('Country re-cache failed during startup:', error);
  });
}

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://api.leetcodepremium.xyz";
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - session expired');
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  import.meta.env.DEV ? (
    <UIProvider>
      <App />
    </UIProvider>
  ) : (
    <StrictMode>
      <UIProvider>
        <App />
      </UIProvider>
    </StrictMode>
  )
)
