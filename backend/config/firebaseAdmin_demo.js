// config/firebaseAdmin_demo.js
const mockAdmin = {
  auth: () => ({
    verifyIdToken: async (token) => {
      // Return the EXACT ID found in your greenhouse_db.sql
      // This ensures the demo user sees the "Smart Greenhouse Alpha" and data.
      return { uid: "PTIIEpO4RMNgumt8Jnabe7Tsu2G3" };
    }
  }),
  credential: {
    cert: () => "mock-cert"
  },
  initializeApp: () => console.log("🟢 [Demo] Firebase Admin Mock initialized.")
};

export default mockAdmin;