import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Keep this import if you intend to use analytics

// Import AuthProvider
import { AuthProvider } from './AuthContext';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app); // Initialize analytics if you intend to use it

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap your App with AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
