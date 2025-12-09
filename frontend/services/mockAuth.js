// services/mockAuth.js

const MOCK_USER = {
  uid: "PTIIEpO4RMNgumt8Jnabe7Tsu2G3", // Matches your DB
  email: "test@test.test",
  displayName: "Admin User",
  getIdToken: async () => "mock-frontend-token",
};

export class MockAuth {
  constructor() {
    this._currentUser = null;
    this._listeners = [];
    this.isMock = true; // Flag to identify this as the mock
  }

  get currentUser() {
    return this._currentUser;
  }

  // 1. The Mock Login Logic
  async signInWithEmailAndPassword(email, password) {
    console.log(`[MockAuth] Attempting login: ${email}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email.toLowerCase() === "test@test.test" && password === "test1234") {
      this._currentUser = MOCK_USER;
      this._notifyListeners();
      return { user: MOCK_USER };
    } else {
      throw new Error("auth/invalid-credential");
    }
  }

  // 2. The Mock Logout Logic
  async signOut() {
    console.log("[MockAuth] Signing out...");
    this._currentUser = null;
    this._notifyListeners();
  }

  // 3. Listener (triggers App state changes)
  onAuthStateChanged(callback) {
    this._listeners.push(callback);
    callback(this._currentUser); // Immediate call
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  }

  _notifyListeners() {
    this._listeners.forEach(cb => cb(this._currentUser));
  }
}

export const mockAuthInstance = new MockAuth();