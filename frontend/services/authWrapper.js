// services/authWrapper.js
import { 
  signInWithEmailAndPassword as realSignIn, 
  signOut as realSignOut 
} from "firebase/auth";

// 1. Unified Sign In
export const signInWithEmailAndPassword = async (auth, email, password) => {
  if (auth.isMock) {
    // Use Mock Logic
    return auth.signInWithEmailAndPassword(email, password);
  } else {
    // Use Real SDK
    return realSignIn(auth, email, password);
  }
};

// 2. Unified Sign Out
export const signOut = async (auth) => {
  if (auth.isMock) {
    return auth.signOut();
  } else {
    return realSignOut(auth);
  }
};