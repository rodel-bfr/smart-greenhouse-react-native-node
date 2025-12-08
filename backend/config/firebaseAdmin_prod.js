// config/firebaseAdmin_prod.js
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const keyPath = path.join(__dirname, "serviceAccountKey.json");
  
  // 1. Check if file exists BEFORE reading
  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    
    // 2. Initialize only if not already initialized
    if (!admin.apps.length) {
        admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        });
        console.log("🔒 [Production] Firebase Admin initialized.");
    }
  } else {
      // 3. Warning if file is missing
      console.warn("⚠️ [Production] 'serviceAccountKey.json' missing. Auth verification will fail.");
  }
} catch (error) {
  // 4. Catch JSON parse errors or other read errors
  console.warn("⚠️ [Production] Error loading Firebase keys:", error.message);
}

export default admin;