import axios from "axios";
import { functions } from "../utils/firebase-config"; // Corrected import path
import { httpsCallable } from "firebase/functions"; // Import httpsCallable

// Update BASE_URL to point to your deployed Firebase Functions
const BASE_URL = "https://us-central1-return-of-attention-app.cloudfunctions.net/";

const api = axios.create({
  baseURL: BASE_URL,
} );

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

// Example function to call your deployed helloWorld Firebase Function
export const getHelloWorld = async () => {
  const helloWorldCallable = httpsCallable(functions, 'helloWorld' );
  const result = await helloWorldCallable();
  return result.data;
};

// User profile functions (these will need actual Firebase Functions when implemented)
export const getUserProfile = async () => {
  // For now, return a mock response until the actual Firebase Function is deployed
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
  // When the actual Firebase Function is deployed, replace with:
  // const getUserProfileCallable = httpsCallable(functions, 'getUserProfile' );
  // const result = await getUserProfileCallable();
  // return result.data;
};

export const createUserProfile = async (profileData: any) => {
  // For now, return a mock response until the actual Firebase Function is deployed
  console.log("Creating user profile with data:", profileData);
  return { success: true, data: profileData };
  // When the actual Firebase Function is deployed, replace with:
  // const createUserProfileCallable = httpsCallable(functions, 'createUserProfile' );
  // const result = await createUserProfileCallable(profileData);
  // return result.data;
};

// Create an apiService object for backward compatibility
export const apiService = {
  getUserProfile,
  createUserProfile,
};

export default api;
