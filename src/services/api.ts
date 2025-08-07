// ============================================================================
// src/services/apiService.ts
// ✅ FIREBASE-ONLY: API Service - No localStorage fallbacks
// 🔥 REMOVED: All localStorage dependencies - Firebase Functions only
// ============================================================================

import axios, { AxiosResponse } from "axios";
import { auth, functions } from "../firebase";
import { httpsCallable, HttpsCallable } from "firebase/functions";

// ✅ FIREBASE-ONLY: Firebase Functions API endpoints
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  'https://us-central1-return-of-attention-app.cloudfunctions.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ FIREBASE-ONLY: Add Firebase auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔥 Firebase auth token added for user: ${user.uid.substring(0, 8)}...`);
    } else {
      console.warn('🚨 No authenticated Firebase user for API request');
    }
  } catch (error) {
    console.error('❌ Error getting Firebase auth token:', error);
    throw new Error('Firebase authentication required');
  }
  return config;
});

// ✅ FIREBASE-ONLY: Enhanced error handling without localStorage fallbacks
const handleFirebaseError = (error: any, operation: string): never => {
  console.error(`❌ Firebase ${operation} failed:`, error);
  
  if (error.code === 'functions/unauthenticated') {
    throw new Error('Firebase authentication required. Please sign in.');
  }
  
  if (error.code === 'functions/unavailable') {
    throw new Error('Firebase Functions temporarily unavailable. Please try again.');
  }
  
  if (error.code === 'functions/deadline-exceeded') {
    throw new Error('Request timeout. Please try again.');
  }
  
  throw error;
};

// ✅ FIREBASE-ONLY: Core API methods with Firebase-only error handling
export const get = async (path: string, params?: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required');
  }

  try {
    console.log(`🔥 Firebase GET request: ${path} for user: ${auth.currentUser.uid.substring(0, 8)}...`);
    const response: AxiosResponse = await api.get(path, { params });
    console.log(`✅ Firebase GET success: ${path}`);
    return response.data;
  } catch (error) {
    handleFirebaseError(error, `GET ${path}`);
  }
};

export const post = async (path: string, data?: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required');
  }

  try {
    console.log(`🔥 Firebase POST request: ${path} for user: ${auth.currentUser.uid.substring(0, 8)}...`);
    const response: AxiosResponse = await api.post(path, data);
    console.log(`✅ Firebase POST success: ${path}`);
    return response.data;
  } catch (error) {
    handleFirebaseError(error, `POST ${path}`);
  }
};

export const put = async (path: string, data?: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required');
  }

  try {
    console.log(`🔥 Firebase PUT request: ${path} for user: ${auth.currentUser.uid.substring(0, 8)}...`);
    const response: AxiosResponse = await api.put(path, data);
    console.log(`✅ Firebase PUT success: ${path}`);
    return response.data;
  } catch (error) {
    handleFirebaseError(error, `PUT ${path}`);
  }
};

export const del = async (path: string): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required');
  }

  try {
    console.log(`🔥 Firebase DELETE request: ${path} for user: ${auth.currentUser.uid.substring(0, 8)}...`);
    const response: AxiosResponse = await api.delete(path);
    console.log(`✅ Firebase DELETE success: ${path}`);
    return response.data;
  } catch (error) {
    handleFirebaseError(error, `DELETE ${path}`);
  }
};

// ✅ FIREBASE-ONLY: Enhanced PAHM Guru Chat with Firebase Functions
export const pahmGuruChat = async (message: string, userContext: any, sessionId: string): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required for PAHM Guru Chat');
  }

  try {
    console.log(`🔥 PAHM Guru Chat request for user: ${auth.currentUser.uid.substring(0, 8)}...`);
    
    // Primary: Direct Firebase Functions call
    const pahmChatCallable: HttpsCallable = httpsCallable(functions, 'pahmGuruChat');
    const result = await pahmChatCallable({
      message,
      userContext: {
        ...userContext,
        uid: auth.currentUser.uid,
        firebaseSource: true,
        lastSyncAt: new Date().toISOString()
      },
      sessionId,
      firebaseMetadata: {
        requestedAt: new Date().toISOString(),
        userId: auth.currentUser.uid,
        source: 'firebase-functions'
      }
    });
    
    console.log('✅ PAHM Guru Chat success via Firebase Functions');
    return result.data;
  } catch (error) {
    console.warn('🚨 Firebase Functions call failed, trying HTTP endpoint:', error);
    
    // Fallback: HTTP endpoint with Firebase auth
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        'https://us-central1-return-of-attention-app.cloudfunctions.net/pahmGuruChat',
        {
          message,
          userContext: {
            ...userContext,
            uid: auth.currentUser.uid,
            firebaseSource: true,
            lastSyncAt: new Date().toISOString()
          },
          sessionId,
          firebaseMetadata: {
            requestedAt: new Date().toISOString(),
            userId: auth.currentUser.uid,
            source: 'firebase-http'
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ PAHM Guru Chat success via HTTP endpoint');
      return response.data;
    } catch (httpError) {
      console.error('❌ Both Firebase Functions and HTTP endpoint failed:', httpError);
      handleFirebaseError(httpError, 'PAHM Guru Chat');
    }
  }
};

// ✅ FIREBASE-ONLY: Firebase Functions utilities
export const getHelloWorld = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required');
  }

  try {
    console.log(`🔥 HelloWorld request for user: ${auth.currentUser.uid.substring(0, 8)}...`);
    const helloWorldCallable: HttpsCallable = httpsCallable(functions, 'helloWorld');
    const result = await helloWorldCallable({
      uid: auth.currentUser.uid,
      timestamp: new Date().toISOString()
    });
    console.log('✅ HelloWorld success');
    return result.data;
  } catch (error) {
    console.warn('🚨 Direct helloWorld call failed, trying HTTP:', error);
    // Fallback to HTTP with Firebase auth
    const token = await auth.currentUser.getIdToken();
    const response = await axios.get(
      'https://us-central1-return-of-attention-app.cloudfunctions.net/helloWorld',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('✅ HelloWorld success via HTTP');
    return response.data;
  }
};

// ✅ FIREBASE-ONLY: User profile functions without localStorage fallbacks
export const getUserProfile = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to get user profile');
  }

  try {
    console.log(`🔥 Getting Firebase user profile for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const profile = await get('/users/profile');
    console.log('✅ Firebase user profile retrieved successfully');
    return profile;
  } catch (error) {
    console.error('❌ Error getting Firebase user profile:', error);
    handleFirebaseError(error, 'get user profile');
  }
};

export const createUserProfile = async (profileData: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to create user profile');
  }

  try {
    console.log(`🔥 Creating Firebase user profile for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const firebaseProfileData = {
      ...profileData,
      uid: auth.currentUser.uid,
      firebaseCreatedAt: new Date().toISOString(),
      firebaseSource: true
    };
    
    const result = await post('/users/profile', firebaseProfileData);
    console.log('✅ Firebase user profile created successfully');
    return result;
  } catch (error) {
    console.error('❌ Error creating Firebase user profile:', error);
    handleFirebaseError(error, 'create user profile');
  }
};

export const updateUserProfile = async (profileData: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to update user profile');
  }

  try {
    console.log(`🔥 Updating Firebase user profile for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const firebaseProfileData = {
      ...profileData,
      uid: auth.currentUser.uid,
      firebaseUpdatedAt: new Date().toISOString(),
      firebaseSource: true
    };
    
    const result = await put('/users/profile', firebaseProfileData);
    console.log('✅ Firebase user profile updated successfully');
    return result;
  } catch (error) {
    console.error('❌ Error updating Firebase user profile:', error);
    handleFirebaseError(error, 'update user profile');
  }
};

// ✅ FIREBASE-ONLY: Practice session functions without localStorage fallbacks
export const createPracticeSession = async (sessionData: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to create practice session');
  }

  try {
    console.log(`🔥 Creating Firebase practice session for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const firebaseSessionData = {
      ...sessionData,
      uid: auth.currentUser.uid,
      firebaseCreatedAt: new Date().toISOString(),
      firebaseSource: true,
      deviceInfo: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    };
    
    const result = await post('/practice/sessions', firebaseSessionData);
    console.log('✅ Firebase practice session created successfully');
    return result;
  } catch (error) {
    console.error('❌ Error creating Firebase practice session:', error);
    handleFirebaseError(error, 'create practice session');
  }
};

export const getPracticeSessions = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to get practice sessions');
  }

  try {
    console.log(`🔥 Getting Firebase practice sessions for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const sessions = await get('/practice/sessions');
    console.log(`✅ Retrieved ${sessions.data?.length || 0} Firebase practice sessions`);
    return sessions;
  } catch (error) {
    console.error('❌ Error getting Firebase practice sessions:', error);
    handleFirebaseError(error, 'get practice sessions');
  }
};

// ✅ FIREBASE-ONLY: Emotional notes functions without localStorage fallbacks
export const createEmotionalNote = async (noteData: any): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to create emotional note');
  }

  try {
    console.log(`🔥 Creating Firebase emotional note for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const firebaseNoteData = {
      ...noteData,
      uid: auth.currentUser.uid,
      firebaseCreatedAt: new Date().toISOString(),
      firebaseSource: true
    };
    
    const result = await post('/emotional-notes', firebaseNoteData);
    console.log('✅ Firebase emotional note created successfully');
    return result;
  } catch (error) {
    console.error('❌ Error creating Firebase emotional note:', error);
    handleFirebaseError(error, 'create emotional note');
  }
};

export const getEmotionalNotes = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to get emotional notes');
  }

  try {
    console.log(`🔥 Getting Firebase emotional notes for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const notes = await get('/emotional-notes');
    console.log(`✅ Retrieved ${notes.data?.length || 0} Firebase emotional notes`);
    return notes;
  } catch (error) {
    console.error('❌ Error getting Firebase emotional notes:', error);
    handleFirebaseError(error, 'get emotional notes');
  }
};

// ✅ FIREBASE-ONLY: Analytics functions without localStorage fallbacks
export const getAnalytics = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required to get analytics');
  }

  try {
    console.log(`🔥 Getting Firebase analytics for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const analytics = await get('/analytics');
    console.log('✅ Firebase analytics retrieved successfully');
    return analytics;
  } catch (error) {
    console.error('❌ Error getting Firebase analytics:', error);
    handleFirebaseError(error, 'get analytics');
  }
};

// ✅ FIREBASE-ONLY: Enhanced Firebase Functions utilities
export const healthCheck = async (): Promise<any> => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required for health check');
  }

  try {
    console.log(`🔥 Firebase health check for: ${auth.currentUser.uid.substring(0, 8)}...`);
    const healthCallable: HttpsCallable = httpsCallable(functions, 'healthCheck');
    const result = await healthCallable({
      uid: auth.currentUser.uid,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firebase health check passed');
    return result.data;
  } catch (error) {
    console.error('❌ Firebase health check failed:', error);
    handleFirebaseError(error, 'health check');
  }
};

// ✅ FIREBASE-ONLY: Additional Firebase utility functions
export const getFirebaseConnectionStatus = () => ({
  isConnected: !!auth.currentUser,
  userId: auth.currentUser?.uid,
  email: auth.currentUser?.email,
  lastSignIn: auth.currentUser?.metadata?.lastSignInTime,
  firebaseIntegrated: true,
  apiBaseUrl: API_BASE_URL
});

export const validateFirebaseAuth = (): boolean => {
  if (!auth.currentUser) {
    throw new Error('Firebase authentication required. Please sign in to continue.');
  }
  return true;
};

export const getFirebaseAuthToken = async (): Promise<string> => {
  if (!auth.currentUser) {
    throw new Error('No authenticated Firebase user');
  }
  
  try {
    const token = await auth.currentUser.getIdToken();
    return token;
  } catch (error) {
    console.error('❌ Error getting Firebase auth token:', error);
    throw error;
  }
};

// ✅ FIREBASE-ONLY: Enhanced apiService object
export const apiService = {
  // Core API methods
  get,
  post,
  put,
  delete: del,
  
  // User management
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  
  // Practice sessions
  createPracticeSession,
  getPracticeSessions,
  
  // Emotional notes
  createEmotionalNote,
  getEmotionalNotes,
  
  // Analytics
  getAnalytics,
  
  // Firebase Functions
  pahmGuruChat,
  helloWorld: getHelloWorld,
  healthCheck,
  
  // Firebase utilities
  getConnectionStatus: getFirebaseConnectionStatus,
  validateAuth: validateFirebaseAuth,
  getAuthToken: getFirebaseAuthToken,
  
  // Firebase metadata
  firebaseIntegrated: true,
  dataSource: 'Firebase Functions',
  authRequired: true,
  crossDeviceSync: true
};

export default api;