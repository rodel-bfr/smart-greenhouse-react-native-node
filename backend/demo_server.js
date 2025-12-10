// demo_server.js
// 🚀 PORTFOLIO DEMO LAUNCHER
// This script sets the environment to DEMO_MODE, checks connections, and starts the server.

import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

// 1. Force Demo Mode ON & Load .env if it exists
process.env.DEMO_MODE = "true";
dotenv.config();

// 2. [FIX] FORCE DEFAULTS if .env is missing
// This ensures the rest of the app (scheduler, db.js) sees these values
if (!process.env.DB_HOST) process.env.DB_HOST = 'localhost';
if (!process.env.DB_USER) process.env.DB_USER = 'root';
if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = '';
if (!process.env.DB_NAME) process.env.DB_NAME = 'greenhouse_db';
if (!process.env.PORT) process.env.PORT = '5000';

console.log("\n***************************************************");
console.log("* 🚀 STARTING BYTESTORM BACKEND (DEMO MODE)     *");
console.log("***************************************************");

// =========================================================
// 🔇 CONSOLE NOISE FILTER (Recruiter Friendly Mode)
// =========================================================
const originalConsoleError = console.error;

console.error = function (...args) {
  const errorString = args.map(a => {
    if (a instanceof Error) return a.message + (a.code ? ` (${a.code})` : "");
    return a?.toString() || "";
  }).join(" ");

  if (errorString.includes("ECONNREFUSED") || errorString.includes("connect ECONNREFUSED")) {
    process.stdout.write("\x1b[33m ⚠️  [Runtime Blocked] Request failed: Database unreachable (Check XAMPP)\x1b[0m\n");
    return;
  }

  originalConsoleError.apply(console, args);
};

// 🛠️ HELPER: Friendly Unhandled Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.code === 'ECONNREFUSED') {
    // Silence specific unhandled db rejections
  } else {
    originalConsoleError('Unhandled Rejection:', reason);
  }
});
// =========================================================


// 3. PRE-FLIGHT CHECK: Test Database Connection
const checkDatabase = async () => {
  try {
    // Now we can just use process.env because we forced the defaults above
    const connection = await createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    await connection.ping();
    await connection.end();
    
    console.log("✅ [Check] Database connection: OK");
    console.log("✅ [Check] Demo Mode: ENABLED");
    console.log("---------------------------------------------------");
    
    // 4. Start the Server only after checks
    await import("./server.js");

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("\n\x1b[41m\x1b[37m ❌ CRITICAL ERROR: DATABASE UNREACHABLE \x1b[0m");
      console.log("\x1b[33m"); // Yellow text
      
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
         console.log("Access Denied. Check your DB_USER and DB_PASSWORD defaults.");
      } else {
         console.log("The backend cannot connect to MySQL.");
         console.log("1. Open XAMPP Control Panel.");
         console.log("2. Click 'Start' next to MySQL.");
      }
      
      console.log("3. Restart this terminal.");
      console.log("\x1b[0m"); // Reset color
      
      console.log("⚠️  Starting server anyway to allow App 'Connection Error' screen to work...");
      console.log("---------------------------------------------------\n");
      await import("./server.js");
    } else {
      originalConsoleError("❌ Unexpected DB Error:", error.message);
    }
  }
};

// Run the check
checkDatabase();