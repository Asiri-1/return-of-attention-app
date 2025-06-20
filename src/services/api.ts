import axios from "axios";
import app from "../utils/firebase-config"; // Import the default export (the Firebase app instance)
import { getFunctions, httpsCallable } from "firebase/functions"; // Import getFunctions
import { getAuth } from "firebase/auth"; // Import getAuth

// Get the auth and functions instances from the app
const auth = getAuth(app );
const functions = getFunctions(app);

// Use your deployed Firebase Functions API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  'https://us-central1-return-of-attention-app.cloudfunctions.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
} );

// Add Firebase auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.log('No auth token available');
  }
  return config;
});

export const get = async (path: string, params?: any) => {
  try {
    const response = await api.get(path, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${path}:`, error);
    throw error;
  }
};

export const post = async (path: string, data?: any) => {
  try {
    const response = await api.post(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting data to ${path}:`, error);
    throw error;
  }
};

export const put = async (path: string, data?: any) => {
  try {
    const response = await api.put(path, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating data at ${path}:`, error);
    throw error;
  }
};

export const del = async (path: string) => {
  try {
    const response = await api.delete(path);
    return response.data;
  } catch (error) {
    console.error(`Error deleting data at ${path}:`, error);
    throw error;
  }
};

// Example function to call your deployed helloWorld Firebase Function
export const getHelloWorld = async () => {
  const helloWorldCallable = httpsCallable(functions, 'helloWorld' );
  const result = await helloWorldCallable();
  return result.data;
};

// User profile functions - now using the deployed backend
export const getUserProfile = async () => {
  try {
    return await get('/users/profile');
  } catch (error) {
    console.error('Error getting user profile:', error);
    // Return mock data as fallback
    return {
      data: {
        uid: "mock-uid",
        email: "user@example.com",
        displayName: "Mock User",
        experienceLevel: "beginner",
        goals: [],
        practiceTime: 10,
        frequency: "daily",
        assessmentCompleted: false,
        currentStage: "Seeker",
        questionnaireCompleted: false,
      }
    };
  }
};

export const createUserProfile = async (profileData: any) => {
  try {
    return await post('/users/profile', profileData);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Save to localStorage as fallback
    const existingProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const updatedProfile = { ...existingProfile, ...profileData };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    return { success: true, data: updatedProfile };
  }
};

export const updateUserProfile = async (profileData: any) => {
  try {
    return await put('/users/profile', profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Save to localStorage as fallback
    const existingProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const updatedProfile = { ...existingProfile, ...profileData };
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    console.log('✅ Profile updated successfully in localStorage');
    return { success: true, data: updatedProfile };
  }
};

// Practice session functions
export const createPracticeSession = async (sessionData: any) => {
  try {
    return await post('/practice/sessions', sessionData);
  } catch (error) {
    console.error('Error creating practice session:', error);
    // Save to localStorage as fallback
    const sessions = JSON.parse(localStorage.getItem('practiceSessions') || '[]');
    const newSession = { 
      id: `session-${Date.now()}`, 
      ...sessionData, 
      createdAt: new Date().toISOString() 
    };
    sessions.push(newSession);
    localStorage.setItem('practiceSessions', JSON.stringify(sessions));
    return { success: true, data: newSession };
  }
};

export const getPracticeSessions = async () => {
  try {
    return await get('/practice/sessions');
  } catch (error) {
    console.error('Error getting practice sessions:', error);
    // Return localStorage data as fallback
    const sessions = JSON.parse(localStorage.getItem('practiceSessions') || '[]');
    return { data: sessions };
  }
};

// Emotional notes functions
export const createEmotionalNote = async (noteData: any) => {
  try {
    return await post('/emotional-notes', noteData);
  } catch (error) {
    console.error('Error creating emotional note:', error);
    // Save to localStorage as fallback
    const notes = JSON.parse(localStorage.getItem('emotionalNotes') || '[]');
    const newNote = { 
      id: `note-${Date.now()}`, 
      ...noteData, 
      createdAt: new Date().toISOString() 
    };
    notes.push(newNote);
    localStorage.setItem('emotionalNotes', JSON.stringify(notes));
    return { success: true, data: newNote };
  }
};

export const getEmotionalNotes = async () => {
  try {
    return await get('/emotional-notes');
  } catch (error) {
    console.error('Error getting emotional notes:', error);
    // Return localStorage data as fallback
    const notes = JSON.parse(localStorage.getItem('emotionalNotes') || '[]');
    return { data: notes };
  }
};

// Analytics functions
export const getAnalytics = async () => {
  try {
    return await get('/analytics');
  } catch (error) {
    console.error('Error getting analytics:', error);
    // Return calculated analytics from localStorage as fallback
    const sessions = JSON.parse(localStorage.getItem('practiceSessions') || '[]');
    const notes = JSON.parse(localStorage.getItem('emotionalNotes') || '[]');
    
    return {
      data: {
        totalSessions: sessions.length,
        totalPracticeTime: sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0),
        averageSessionLength: sessions.length > 0 ? 
          sessions.reduce((sum: number, session: any) => sum + (session.duration || 0), 0) / sessions.length : 0,
        currentStreak: 0, // Calculate streak from sessions
        totalNotes: notes.length,
        sessionsThisWeek: sessions.filter((session: any) => {
          const sessionDate = new Date(session.createdAt || session.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate > weekAgo;
        }).length
      }
    };
  }
};

// Create an apiService object for backward compatibility
export const apiService = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  createPracticeSession,
  getPracticeSessions,
  createEmotionalNote,
  getEmotionalNotes,
  getAnalytics,
};

export default api;
