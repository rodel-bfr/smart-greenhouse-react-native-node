// middleware/authMiddleware.js
let verifyFirebaseToken;

if (process.env.DEMO_MODE === "true") {
  const module = await import("./authMiddleware_demo.js");
  verifyFirebaseToken = module.verifyFirebaseToken;
} else {
  const module = await import("./authMiddleware_prod.js");
  verifyFirebaseToken = module.verifyFirebaseToken;
}

export { verifyFirebaseToken };