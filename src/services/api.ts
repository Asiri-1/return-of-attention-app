import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuth } from 'firebase/auth';

class ApiService {
  private baseUrl: string;

  constructor() {
    // Set the base URL based on environment
    if (process.env.REACT_APP_USE_EMULATOR === 'true') {
      this.baseUrl = process.env.REACT_APP_FIREBASE_FUNCTIONS_EMULATOR_URL || 'http://localhost:5001/return-of-attention/us-central1';
    } else {
      this.baseUrl = 'https://us-central1-return-of-attention.cloudfunctions.net';
    }
  }

  // Helper method for authenticated requests
  async authenticatedRequest(config: AxiosRequestConfig ): Promise<AxiosResponse> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const token = await user.getIdToken();
      
      const headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
      
      return axios({
        ...config,
        headers
      });
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // User Management API methods
  createUserProfile(userData: any) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/createUserProfile`,
      data: userData
    });
  }

  getUserProfile() {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getUserProfile`
    });
  }

  updateUserSettings(settings: any) {
    return this.authenticatedRequest({
      method: 'PUT',
      url: `${this.baseUrl}/updateUserSettings`,
      data: { settings }
    });
  }

  // Practice Session API methods
  startPracticeSession(sessionData: any) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/startPracticeSession`,
      data: sessionData
    });
  }

  endPracticeSession(sessionId: string, data: any) {
    return this.authenticatedRequest({
      method: 'PUT',
      url: `${this.baseUrl}/endPracticeSession`,
      data: {
        sessionId,
        ...data
      }
    });
  }

  getPracticeHistory(limit = 50) {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getPracticeHistory`,
      params: { limit }
    });
  }

  // Assessment API methods
  submitAssessment(assessmentData: any) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/submitAssessment`,
      data: assessmentData
    });
  }

  getLatestAssessment() {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getLatestAssessment`
    });
  }

  // Emotional Notes API methods
  createEmotionalNote(noteData: any) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/createEmotionalNote`,
      data: noteData
    });
  }

  getEmotionalNotes(limit = 50) {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getEmotionalNotes`,
      params: { limit }
    });
  }

  // Progress API methods
  getProgressSummary() {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getProgressSummary`
    });
  }

  // Chat with Guru API methods
  createChatSession() {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/createChatSession`,
      data: {}
    });
  }

  sendChatMessage(sessionId: string, message: string) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/chatwithguruChat`,
      data: {
        sessionId,
        message
      }
    });
  }

  getChatHistory(sessionId: string) {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getChatHistory`,
      params: {
        sessionId
      }
    });
  }

  submitChatFeedback(sessionId: string, rating: number, feedback?: string) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/submitChatFeedback`,
      data: {
        sessionId,
        rating,
        feedback
      }
    });
  }

  // AI Insights API methods
  getInsights() {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/generateInsights`
    });
  }

  getEnhancedProgressSummary() {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getEnhancedProgressSummary`
    });
  }

  // Content Management API methods
  getContentList(filters = {}) {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getContentList`,
      params: filters
    });
  }

  getContentDetails(contentId: string) {
    return this.authenticatedRequest({
      method: 'GET',
      url: `${this.baseUrl}/getContentDetails`,
      params: {
        contentId
      }
    });
  }

  trackContentView(contentId: string) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/trackContentView`,
      data: {
        contentId
      }
    });
  }

  trackContentCompletion(contentId: string, completionTime?: number, feedback?: string) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/trackContentCompletion`,
      data: {
        contentId,
        completionTime,
        feedback
      }
    });
  }

  // Admin-only content management methods
  createContent(contentData: any) {
    return this.authenticatedRequest({
      method: 'POST',
      url: `${this.baseUrl}/createContent`,
      data: contentData
    });
  }

  updateContent(contentId: string, contentData: any) {
    return this.authenticatedRequest({
      method: 'PUT',
      url: `${this.baseUrl}/updateContent`,
      data: {
        contentId,
        ...contentData
      }
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
