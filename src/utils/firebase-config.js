import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

console.log('🔥 Using HARDCODED Firebase config for testing');

// HARDCODED Firebase configuration - YOUR ACTUAL VALUES
const firebaseConfig = {
  apiKey: "AIzaSyAV_Kc1LFBt-v3fhYNL2N7oIuzFUfpv_a0",
  authDomain: "return-of-attention-app.firebaseapp.com",
  projectId: "return-of-attention-app",
  storageBucket: "return-of-attention-app.firebasestorage.app",
  messagingSenderId: "358042911408",
  appId: "1:358042911408:web:8988cc43b13305f4f23175",
  measurementId: "G-VTZYEBN7RY"
};

console.log('🔧 Hardcoded Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;