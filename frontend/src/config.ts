// Production backend URL from environment variable, with fallback
const PROD_BACKEND_URL = import.meta.env.VITE_API_URL || "https://metapins-production-c951.up.railway.app";

// Use production URL if it exists, otherwise fallback to local
export const BACKEND_URL = PROD_BACKEND_URL;
export const BASE_URL = `${BACKEND_URL}/api`;
