// services/config.js

import Constants from "expo-constants";

// =================================================================
// 🎛️ NETWORK CONFIGURATION
// =================================================================

// 1. ATTEMPT TO AUTO-DETECT IP (For Expo Go)
// This grabs the IP of the computer running "npx expo start"
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
const autoIP = debuggerHost?.split(":")[0];

// 2. FALLBACK (If auto-detect fails, use this)
// ❗ RECRUITER: If the app says "Network Error", change this IP to your computer's IP.
const HARDCODED_IP = "192.168.1.99"; 

// 3. FINAL DECISION
export const LOCAL_IP = autoIP || HARDCODED_IP;

// 4. MODES
// Set this to TRUE to use your local Node.js/XAMPP backend
// Set this to FALSE to use the real production server
export const DEMO_MODE = true;

// Production URL
const PROD_URL = "https://smartgreenhouse.online/";

// Local URL (Node.js server typically runs on port 5000)
// Points to your Node/XAMPP server
const LOCAL_URL = `http://${LOCAL_IP}:5000/`; // Ensure your backend runs on port 5000

// Export the determined Base URL
export const API_BASE_URL = DEMO_MODE ? LOCAL_URL : PROD_URL;

// =================================================================
// 🔑 EXTERNAL SERVICES CONFIGURATION
// =================================================================
// Visual Crossing Weather API Key
// NOTE: This key is explicitly provided here to ensure the portfolio demo 
// functions immediately for reviewers without requiring .env configuration.
// IN PRODUCTION: This value would be securely injected via environment 
// variables (e.g., process.env.WEATHER_API_KEY) in the CI/CD pipeline.
// For this demo, we hardcode it here
// You can get a free API key from https://www.weatherapi.com/
// Replace the string below with your actual API key
// Example: export const WEATHER_API_KEY = "YOUR_ACTUAL_API
export const WEATHER_API_KEY = "MEFU4GCBW8YWKWKGE423V7K5Z";

console.log(`[App Config] Mode: ${DEMO_MODE ? "DEMO (Local)" : "PRODUCTION"}`);
console.log(`[App Config] API URL: ${API_BASE_URL}`);