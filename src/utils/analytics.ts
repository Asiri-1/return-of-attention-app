// ✅ COMPLETE FIXED: src/utils/analytics.ts
// Firebase Analytics with proper imports and error handling

import { logEvent } from "firebase/analytics";
import { auth, db } from "../firebase";

// ✅ FIXED: Remove reference to undefined 'analytics' variable
// Helper function to log events with error handling
const trackEvent = (eventName: string, parameters: { [key: string]: any } = {}) => {
  try {
    // Only log events if user is authenticated
    if (auth.currentUser) {
      console.log(`📊 Analytics Event: ${eventName}`, parameters);
      
      // ✅ NOTE: If you want to use Firebase Analytics, you need to:
      // 1. Import analytics from your firebase config
      // 2. Initialize analytics in your firebase.ts file
      // 3. Uncomment the line below:
      // logEvent(analytics, eventName, parameters);
      
      // For now, we'll just log to console
    } else {
      console.log(`📊 Analytics Event (no user): ${eventName}`, parameters);
    }
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
};

// Practice Session Events
export const trackPracticeSessionStarted = (stage: string, sessionType: string, duration: number) => {
  trackEvent("practice_session_started", {
    stage,
    session_type: sessionType,
    planned_duration: duration,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

export const trackPracticeSessionCompleted = (
  stage: string, 
  sessionType: string, 
  actualDuration: number, 
  outcome: number, 
  reflection: string
) => {
  trackEvent("practice_session_completed", {
    stage,
    session_type: sessionType,
    actual_duration: actualDuration,
    outcome_rating: outcome,
    reflection_notes_length: reflection ? reflection.length : 0,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Daily Notes Events
export const trackDailyNoteCreated = (mood: string, noteLength: number, tags: string[]) => {
  trackEvent("daily_note_created", {
    mood,
    note_length: noteLength,
    tags_count: tags ? tags.length : 0,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

export const trackEmotionalNoteCreated = (emotion: string, intensity: number, noteLength: number) => {
  trackEvent("emotional_note_created", {
    emotion,
    intensity,
    note_length: noteLength,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Chat Events
export const trackChatMessageSent = (messageLength: number, sessionId: string, messageType: string = "user") => {
  trackEvent("chat_message_sent", {
    message_length: messageLength,
    session_id: sessionId,
    message_type: messageType,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

export const trackChatFeedbackGiven = (rating: number, feedbackText: string, sessionId: string) => {
  trackEvent("chat_feedback_given", {
    rating,
    feedback_text_length: feedbackText ? feedbackText.length : 0,
    session_id: sessionId,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Navigation Events
export const trackPageView = (pageName: string) => {
  trackEvent("page_view", {
    page_name: pageName,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

export const trackUserOnboarding = (step: string, completed: boolean) => {
  trackEvent("user_onboarding", {
    step,
    completed,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Assessment Events
export const trackAssessmentStarted = (assessmentType: string) => {
  trackEvent("assessment_started", {
    assessment_type: assessmentType,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

export const trackAssessmentCompleted = (assessmentType: string, score: number, answers: any[]) => {
  trackEvent("assessment_completed", {
    assessment_type: assessmentType,
    score,
    answers_count: answers ? answers.length : 0,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// App Performance Events
export const trackAppError = (errorType: string, errorMessage: string, component: string) => {
  trackEvent("app_error", {
    error_type: errorType,
    error_message: errorMessage,
    component,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// PAHM Events
export const trackPAHMObservation = (category: string, timeFrame: string, emotionalState: string) => {
  trackEvent("pahm_observation", {
    pahm_category: category,
    time_frame: timeFrame,
    emotional_state: emotionalState,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Mind Recovery Events
export const trackMindRecoverySession = (context: string, duration: number, rating: number) => {
  trackEvent("mind_recovery_session", {
    context,
    duration,
    rating,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Feature Usage Events
export const trackFeatureUsage = (featureName: string, action: string, details?: any) => {
  trackEvent("feature_usage", {
    feature_name: featureName,
    action,
    details: details ? JSON.stringify(details) : null,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Authentication Events
export const trackAuthentication = (action: 'sign_in' | 'sign_up' | 'sign_out', method?: string) => {
  trackEvent(`auth_${action}`, {
    auth_method: method || 'email',
    user_id: action === 'sign_out' ? undefined : auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// User Engagement Events
export const trackUserEngagement = (engagementType: string, value: number, context?: string) => {
  trackEvent("user_engagement", {
    engagement_type: engagementType,
    value,
    context,
    user_id: auth.currentUser?.uid,
    timestamp: new Date().toISOString()
  });
};

// Export the main tracking function
export { trackEvent };
export default trackEvent;