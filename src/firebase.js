// firebase.js - Fixed to prevent duplicate app initialization
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV_Kc1LFBt-v3fhYNL2N7oIuzFUfpv_a0",
  authDomain: "return-of-attention-app.firebaseapp.com",
  projectId: "return-of-attention-app",
  storageBucket: "return-of-attention-app.firebasestorage.app",
  messagingSenderId: "358042911408",
  appId: "1:358042911408:web:8988cc43b13305f4f23175",
  measurementId: "G-VTZYEBN7RY"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized for the first time');
} else {
  app = getApp(); // Use existing app
  console.log('🔥 Using existing Firebase app');
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize analytics only if in browser environment and not already initialized
export let analytics = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(app);
    console.log('🔥 Firebase Analytics initialized');
  } catch (error) {
    console.warn('⚠️ Analytics initialization skipped:', error.message);
  }
}

console.log('🔥 Firebase services ready:', {
  app: '✅',
  firestore: '✅',
  auth: '✅',
  analytics: analytics ? '✅' : '⚠️ Skipped'
});

export default app;