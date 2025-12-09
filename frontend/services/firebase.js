// services/firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockAuthInstance } from "./mockAuth";

// Check environment
const hasKeys = !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

let auth;
let app;

if (hasKeys) {
  // 🟢 SCENARIO A: Real Firebase
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  // 🟡 SCENARIO B: Demo Mode
  console.log("⚠️ [Firebase] Using Mock Auth (Demo Mode)");
  
  // Dummy app initialization to prevent SDK errors
  app = initializeApp({
    apiKey: "demo", 
    authDomain: "demo", 
    projectId: "demo",
    appId: "demo"
  });
  
  // Use our custom mock class
  auth = mockAuthInstance; 
}

export { auth, app };