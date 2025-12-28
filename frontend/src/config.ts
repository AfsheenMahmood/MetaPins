// Production backend URL - hardcoded for reliability
// Override with VITE_API_URL environment variable if set in Vercel
const ENV_BACKEND_URL = import.meta.env.VITE_API_URL;
const HARDCODED_BACKEND_URL = "https://metapins-production-c951.up.railway.app";

// Validate and fix URL if needed
let finalUrl = ENV_BACKEND_URL || HARDCODED_BACKEND_URL;

// Fix common URL issues
if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    console.warn('⚠️ Invalid URL detected, adding https://', finalUrl);
    finalUrl = 'https://' + finalUrl;
}

export const BACKEND_URL = finalUrl;
export const BASE_URL = `${BACKEND_URL}/api`;

// Debug logging
console.log("🔧 Backend Configuration:", {
    envUrl: ENV_BACKEND_URL,
    hardcodedUrl: HARDCODED_BACKEND_URL,
    finalUrl: BACKEND_URL,
    baseUrl: BASE_URL,
    envVarType: typeof ENV_BACKEND_URL,
    envVarValue: JSON.stringify(ENV_BACKEND_URL)
});
