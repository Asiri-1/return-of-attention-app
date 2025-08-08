// ✅ REAL FIREBASE CONFIG - Your actual Firebase project credentials
// File: src/firebase.ts

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// ✅ Firebase Configuration Interface
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// ✅ YOUR REAL FIREBASE CONFIG: From Firebase Console
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAV_Kc1LFBt-v3fhYNL2N7oIuzFUfpv_a0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "return-of-attention-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "return-of-attention-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "return-of-attention-app.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "358042911408",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:358042911408:web:8988cc43b13305f4f23175",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-VTZYEBN7RY"
};

// ✅ VALIDATION: Check if config is loaded properly
console.log('🔥 Firebase Configuration:');
console.log('✅ API Key:', firebaseConfig.apiKey ? 'Loaded' : 'Missing');
console.log('✅ Auth Domain:', firebaseConfig.authDomain);
console.log('✅ Project ID:', firebaseConfig.projectId);
console.log('✅ Storage Bucket:', firebaseConfig.storageBucket);
console.log('✅ Messaging Sender ID:', firebaseConfig.messagingSenderId);
console.log('✅ App ID:', firebaseConfig.appId ? 'Loaded' : 'Missing');

// ✅ PREVENT DUPLICATE INITIALIZATION
let app: FirebaseApp;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized successfully with project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('🚨 Firebase initialization failed:', error);
    throw error;
  }
} else {
  app = getApps()[0];
  console.log('🔥 Firebase already initialized, using existing app');
}

// Initialize Firebase services with proper typing
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app);
export const storage: FirebaseStorage = getStorage(app);

// ✅ Export the app for debugging
export { app };
export default app;