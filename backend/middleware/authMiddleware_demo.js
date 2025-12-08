// middleware/authMiddleware_demo.js
export const verifyFirebaseToken = async (req, res, next) => {
  console.log("🟢 [Demo] Auth Middleware: Bypassing verification.");
  
  // Automatically assign the Admin ID found in your SQL Dump
  req.user = { 
    uid: "PTIIEpO4RMNgumt8Jnabe7Tsu2G3", 
    email: "demo@portfolio.local",
    email_verified: true
  };
  
  next();
};