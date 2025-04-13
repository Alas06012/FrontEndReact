// src/config.js
const host = import.meta.env.VITE_API_HOST;
const lb_type = import.meta.env.VITE_API_LB_TYPE;
const port = import.meta.env.VITE_API_PORT;

export const API_URL = `${lb_type}://${host}:${port}`;