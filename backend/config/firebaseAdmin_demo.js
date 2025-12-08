// config/firebaseAdmin_demo.js
const mockAdmin = {
  auth: () => ({
    verifyIdToken: async (token) => {
      return { uid: "mock-uid" };
    }
  }),
  credential: {
    cert: () => "mock-cert"
  },
  initializeApp: () => console.log("🟢 [Demo] Firebase Admin Mock initialized.")
};

export default mockAdmin;