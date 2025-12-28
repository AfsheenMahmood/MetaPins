// Production backend URL - hardcoded for reliability
// Override with VITE_API_URL environment variable if set in Vercel
const ENV_BACKEND_URL = import.meta.env.VITE_API_URL;
const HARDCODED_BACKEND_URL = "https://metapins-production-c951.up.railway.app";

export const BACKEND_URL = ENV_BACKEND_URL || HARDCODED_BACKEND_URL;
export const BASE_URL = `${BACKEND_URL}/api`;

// Debug logging (will be removed in production build)
console.log("🔧 Backend Configuration:", {
    envUrl: ENV_BACKEND_URL,
    finalUrl: BACKEND_URL,
    baseUrl: BASE_URL
});
