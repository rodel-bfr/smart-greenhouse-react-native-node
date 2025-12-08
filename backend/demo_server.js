// demo_server.js
// 🚀 PORTFOLIO DEMO LAUNCHER
// This script sets the environment to DEMO_MODE, checks connections, and starts the server.

import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

// 1. Force Demo Mode ON
process.env.DEMO_MODE = "true";
dotenv.config();

console.log("\n***************************************************");
console.log("* 🚀 STARTING BYTESTORM BACKEND (DEMO MODE)     *");
console.log("***************************************************");

// =========================================================
// 🔇 CONSOLE NOISE FILTER (Recruiter Friendly Mode)
// =========================================================
// This overrides console.error to hide ugly SQL stack traces
// if the recruiter forgets to turn on XAMPP.
const originalConsoleError = console.error;

console.error = function (...args) {
  const errorString = args.map(a => {
    if (a instanceof Error) return a.message + (a.code ? ` (${a.code})` : "");
    return a?.toString() || "";
  }).join(" ");

  // If it's a database connection error, show a small warning instead of a wall of text
  if (errorString.includes("ECONNREFUSED") || errorString.includes("connect ECONNREFUSED")) {
    process.stdout.write("\x1b[33m ⚠️  [Runtime Blocked] Request failed: Database unreachable (Check XAMPP)\x1b[0m\n");
    return; // Stop the full stack trace from printing
  }

  // Pass everything else through normally
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


// 2. PRE-FLIGHT CHECK: Test Database Connection
const checkDatabase = async () => {
  try {
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'greenhouse_db',
    });
    
    await connection.ping();
    await connection.end();
    
    console.log("✅ [Check] Database connection: OK");
    console.log("✅ [Check] Demo Mode: ENABLED");
    console.log("---------------------------------------------------");
    
    // 3. Start the Server only after checks
    await import("./server.js");

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log("\n\x1b[41m\x1b[37m ❌ CRITICAL ERROR: DATABASE UNREACHABLE \x1b[0m");
      console.log("\x1b[33m"); // Yellow text
      console.log("The backend cannot connect to MySQL.");
      console.log("1. Open XAMPP Control Panel.");
      console.log("2. Click 'Start' next to MySQL.");
      console.log("3. Restart this terminal.");
      console.log("\x1b[0m"); // Reset color
      
      // We still load the server so the App doesn't crash completely (ConnectionError screen will show)
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