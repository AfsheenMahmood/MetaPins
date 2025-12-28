const DEV_BACKEND_URL = "http://localhost:5000";
const PROD_BACKEND_URL = import.meta.env.VITE_API_URL || "https://metapins-production.up.railway.app";

// Use production URL if it exists, otherwise fallback to local
export const BACKEND_URL = PROD_BACKEND_URL;
export const BASE_URL = `${BACKEND_URL}/api`;
