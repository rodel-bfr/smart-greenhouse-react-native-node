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
// Loaded from .env file for security.
// If the variable is missing, the app should gracefully degrade (or use Demo Mode).
// You can get a free API key from https://www.visualcrossing.com/
// Follow instructions in the README to set up your .env file.
export const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY || "";

if (!WEATHER_API_KEY && !DEMO_MODE) {
  console.warn("⚠️ Weather API Key is missing in .env! Live weather data will fail.");
}

console.log(`[App Config] Mode: ${DEMO_MODE ? "DEMO (Local)" : "PRODUCTION"}`);
console.log(`[App Config] API URL: ${API_BASE_URL}`);