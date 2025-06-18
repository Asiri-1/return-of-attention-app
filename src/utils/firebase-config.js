// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions"; // Import getFunctions

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV_Kc1LFBt-v3fhYNL2N7oIuzFUfpv_a0",
  authDomain: "return-of-attention-app.firebaseapp.com",
  projectId: "return-of-attention-app",
  storageBucket: "return-of-attention-app.firebasestorage.app",
  messagingSenderId: "358042911408",
  appId: "1:358042911408:web:8988cc43b13305f4f23175",
  measurementId: "G-VTZYEBN7RY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and get a reference to the service
export const analytics = getAnalytics(app, {
  debug_mode: process.env.NODE_ENV === 'development' // Enable debug mode only in development
});

// Initialize Cloud Functions and get a reference to the service
export const functions = getFunctions(app); // Export the functions object
