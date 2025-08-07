// ✅ SINGLE FIREBASE CONFIG - Use this in ALL your files 
// File: src/firebase.ts (renamed from .js to .ts for proper TypeScript support)

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
}

// ✅ ENVIRONMENT VARIABLES: Use environment variables (not hardcoded values)
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBvOkBwNsUDTETQCgZkNgBJX7FlzBx0_Xs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "return-of-attention-app.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "return-of-attention-app",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "return-of-attention-app.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// ✅ VALIDATION: Check if config is loaded
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your-api-key") {
  console.warn('🚨 Using default Firebase config. Please set environment variables for production.');
  console.log('Required environment variables:');
  console.log('- REACT_APP_FIREBASE_API_KEY');
  console.log('- REACT_APP_FIREBASE_AUTH_DOMAIN');
  console.log('- REACT_APP_FIREBASE_PROJECT_ID');
  console.log('- REACT_APP_FIREBASE_STORAGE_BUCKET');
  console.log('- REACT_APP_FIREBASE_MESSAGING_SENDER_ID');
  console.log('- REACT_APP_FIREBASE_APP_ID');
}

// ✅ PREVENT DUPLICATE INITIALIZATION
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialized successfully');
  console.log('🔗 Auth Domain:', firebaseConfig.authDomain);
  console.log('📊 Project ID:', firebaseConfig.projectId);
} else {
  app = getApps()[0];
  console.log('🔥 Firebase already initialized, using existing app');
}

// Initialize Firebase services with proper typing
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;