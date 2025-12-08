// config/firebaseAdmin.js
let admin;

if (process.env.DEMO_MODE === "true") {
  // Dynamically load Demo. Prod file is NOT touched.
  const module = await import("./firebaseAdmin_demo.js");
  admin = module.default;
} else {
  // Dynamically load Prod.
  // If serviceAccountKey.json is missing, this WILL crash (Expected behavior for Prod)
  const module = await import("./firebaseAdmin_prod.js");
  admin = module.default;
}

export default admin;