import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {UIProvider} from './contexts/UIContext';
import App from './App.jsx'

import axios from 'axios';
axios.defaults.withCredentials = true;

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || 'https://leet-io-backend.onrender.com';
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
  <StrictMode>
    <UIProvider>
    <App />
    </UIProvider>
  </StrictMode>
)
