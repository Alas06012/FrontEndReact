
// src/config.js
export const API_URL = window.env.VITE_API_PORT 
  ? `${window.env.VITE_API_LB_TYPE}://${window.env.VITE_API_HOST}:${window.env.VITE_API_PORT}`
  : `${window.env.VITE_API_LB_TYPE}://${window.env.VITE_API_HOST}`;