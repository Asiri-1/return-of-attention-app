import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase-config";

// Helper function to log events with error handling
const trackEvent = (eventName: string, parameters: { [key: string]: any } = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
      console.log(`Analytics Event: ${eventName}`, parameters);
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
    timestamp: new Date().toISOString()
  });
};

export const trackPracticeSessionCompleted = (stage: string, sessionType: string, actualDuration: number, outcome: number, reflection: string) => {
  trackEvent("practice_session_completed", {
    stage,
    session_type: sessionType,
    actual_duration: actualDuration,
    outcome_rating: outcome,
    reflection_notes_length: reflection ? reflection.length : 0,
    timestamp: new Date().toISOString()
  });
};

// Daily Notes Events
export const trackDailyNoteCreated = (mood: string, noteLength: number, tags: string[]) => {
  trackEvent("daily_note_created", {
    mood,
    note_length: noteLength,
    tags_count: tags ? tags.length : 0,
    timestamp: new Date().toISOString()
  });
};

export const trackEmotionalNoteCreated = (emotion: string, intensity: number, noteLength: number) => {
  trackEvent("emotional_note_created", {
    emotion,
    intensity,
    note_length: noteLength,
    timestamp: new Date().toISOString()
  });
};

// Chat Events
export const trackChatMessageSent = (messageLength: number, sessionId: string, messageType: string = "user") => {
  trackEvent("chat_message_sent", {
    message_length: messageLength,
    session_id: sessionId,
    message_type: messageType,
    timestamp: new Date().toISOString()
  });
};

export const trackChatFeedbackGiven = (rating: number, feedbackText: string, sessionId: string) => {
  trackEvent("chat_feedback_given", {
    rating,
    feedback_text_length: feedbackText ? feedbackText.length : 0,
    session_id: sessionId,
    timestamp: new Date().toISOString()
  });
};

// Navigation Events
export const trackPageView = (pageName: string) => {
  trackEvent("page_view", {
    page_name: pageName,
    timestamp: new Date().toISOString()
  });
};

export const trackUserOnboarding = (step: string, completed: boolean) => {
  trackEvent("user_onboarding", {
    step,
    completed,
    timestamp: new Date().toISOString()
  });
};

// Assessment Events
export const trackAssessmentStarted = (assessmentType: string) => {
  trackEvent("assessment_started", {
    assessment_type: assessmentType,
    timestamp: new Date().toISOString()
  });
};

export const trackAssessmentCompleted = (assessmentType: string, score: number, answers: any[]) => {
  trackEvent("assessment_completed", {
    assessment_type: assessmentType,
    score,
    answers_count: answers ? answers.length : 0,
    timestamp: new Date().toISOString()
  });
};

// App Performance Events
export const trackAppError = (errorType: string, errorMessage: string, component: string) => {
  trackEvent("app_error", {
    error_type: errorType,
    error_message: errorMessage,
    component,
    timestamp: new Date().toISOString()
  });
};
