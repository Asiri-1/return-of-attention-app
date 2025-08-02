// src/hooks/useLocalDataCompat.ts
// ✅ ENHANCED: Compatibility layer for Universal Architecture contexts
// This hook provides backward compatibility while using the new Universal Architecture

import { useAuth } from '../contexts/auth/AuthContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useAnalytics } from '../contexts/analytics/AnalyticsContext';
import { useUser } from '../contexts/user/UserContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';
import { useContent } from '../contexts/content/ContentContext';

// ================================
// COMPATIBILITY INTERFACES
// ================================
interface LegacySessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number;
  rating?: number;
  notes?: string;
  presentPercentage?: number;
  [key: string]: any;
}

interface LegacyAnalyticsData {
  totalSessions: number;
  totalMindRecoverySessions: number;
  totalPracticeTime: number;
  averageSessionLength: number;
  averageQuality: number;
  currentStreak: number;
  longestStreak: number;
  emotionalNotesCount: number;
  consistencyScore: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

// ================================
// ENHANCED COMPATIBILITY HOOK
// ================================
export const useLocalDataCompat = () => {
  const { currentUser } = useAuth();
  const { 
    addPracticeSession, 
    addMindRecoverySession,
    sessions, 
    stats,
    getPracticeSessions,
    getMindRecoverySessions,
    getMeditationSessions,
    getProgressTrend
  } = usePractice();
  
  const { 
    addEmotionalNote, 
    emotionalNotes,
    reflections,
    getDailyEmotionalNotes,
    getReflections 
  } = useWellness();
  
  const { 
    getPAHMData, 
    getEnvironmentData, 
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution 
  } = useAnalytics();
  
  const { userProfile } = useUser();
  
  const { 
    questionnaire, 
    selfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    getQuestionnaire,
    getSelfAssessment
  } = useOnboarding();

  const { 
    achievements,
    getAchievements,
    addAchievement 
  } = useContent();

  // ================================
  // COMPUTED VALUES
  // ================================
  const isLoading = false; // Contexts handle their own loading states

  // Enhanced analytics data with all required fields
  const getAnalyticsData = (): LegacyAnalyticsData => ({
    totalSessions: stats.totalSessions || 0,
    totalMindRecoverySessions: stats.totalMindRecoverySessions || 0,
    totalPracticeTime: stats.totalMinutes || 0,
    averageSessionLength: stats.totalSessions > 0 ? 
      Math.round(stats.totalMinutes / stats.totalSessions) : 0,
    averageQuality: stats.averageQuality || 0,
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0,
    emotionalNotesCount: emotionalNotes.length || 0,
    consistencyScore: calculateConsistencyScore(),
    progressTrend: getProgressTrend() || 'stable',
    lastUpdated: new Date().toISOString()
  });

  // Calculate consistency score based on recent activity
  const calculateConsistencyScore = (): number => {
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.timestamp);
      const daysDiff = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    
    const recentNotes = emotionalNotes.filter(note => {
      const noteDate = new Date(note.timestamp);
      const daysDiff = (Date.now() - noteDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    // Score based on activity in last 7 days
    const sessionScore = Math.min(recentSessions.length * 15, 60);
    const noteScore = Math.min(recentNotes.length * 5, 25);
    const streakBonus = Math.min(stats.currentStreak * 2, 15);
    
    return Math.min(sessionScore + noteScore + streakBonus, 100);
  };

  // ================================
  // ENHANCED SESSION MANAGEMENT
  // ================================
  const addSession = (sessionData: Omit<LegacySessionData, 'sessionId'>) => {
    if (sessionData.sessionType === 'mind_recovery') {
      return addMindRecoverySession(sessionData);
    } else {
      return addPracticeSession(sessionData);
    }
  };

  // Legacy method for adding mind recovery sessions
  const addMindRecoverySessionLegacy = (sessionData: any) => {
    const mindRecoverySession = {
      ...sessionData,
      sessionType: 'mind_recovery' as const,
      timestamp: sessionData.timestamp || new Date().toISOString(),
      duration: sessionData.duration || 0
    };
    return addMindRecoverySession(mindRecoverySession);
  };

  // ================================
  // COMPREHENSIVE USER DATA
  // ================================
  const comprehensiveUserData = {
    profile: userProfile,
    practiceSessions: sessions,
    emotionalNotes: emotionalNotes,
    reflections: reflections,
    questionnaire: questionnaire,
    selfAssessment: selfAssessment,
    achievements: achievements,
    analytics: getAnalyticsData(),
    lastUpdated: new Date().toISOString()
  };

  // ================================
  // STAGE MANAGEMENT (Legacy Support)
  // ================================
  const getStageProgress = () => {
    return userProfile?.currentProgress?.currentStage || 1;
  };

  const getTCompleted = () => {
    // Check if T5 completion is recorded in questionnaire or user profile
    return questionnaire?.completed || false;
  };

  const getStageXComplete = (stage: number) => {
    // Check if specific stage is completed based on sessions or user profile
    const stageSessions = sessions.filter(s => s.stageLevel === stage);
    return stageSessions.length >= 5; // Example completion criteria
  };

  // ================================
  // PAHM DATA (Legacy Support)
  // ================================
  const getPAHMSessions = () => {
    return sessions.filter(s => s.sessionType === 'meditation' && s.stageLevel);
  };

  const getStageHours = (stage: number) => {
    const stageSessions = sessions.filter(s => s.stageLevel === stage);
    return stageSessions.reduce((total, session) => total + (session.duration || 0), 0) / 60;
  };

  // ================================
  // NOTES AND REFLECTIONS
  // ================================
  const getNotes = () => {
    // Combine emotional notes and reflections for legacy compatibility
    return [
      ...emotionalNotes.map(note => ({ ...note, type: 'emotional' })),
      ...reflections.map(ref => ({ ...ref, type: 'reflection' }))
    ];
  };

  // ================================
  // CLEAR DATA (Safe Implementation)
  // ================================
  const clearAllData = () => {
    console.warn('🚨 clearAllData called - This should be implemented carefully');
    console.log('📍 To implement: Call clear methods from each context');
    // Implementation should call:
    // - clearPracticeData() from usePractice
    // - clearWellnessData() from useWellness  
    // - clearUserData() from useUser
    // - clearOnboardingData() from useOnboarding
    // - clearContentData() from useContent
  };

  // ================================
  // RETURN COMPATIBILITY INTERFACE
  // ================================
  return {
    // ✅ CORE DATA (Universal Architecture)
    userData: comprehensiveUserData,
    comprehensiveUserData,
    isLoading,
    
    // ✅ DIRECT DATA ACCESS
    practiceSessions: sessions,
    emotionalNotes: emotionalNotes,
    reflections: reflections,
    questionnaire: questionnaire,
    selfAssessment: selfAssessment,
    profile: userProfile,
    achievements: achievements,
    
    // ✅ PRACTICE SESSION METHODS
    getPracticeSessions,
    getMeditationSessions,
    getMindRecoverySessions,
    addPracticeSession,
    addSession,
    addMindRecoverySession: addMindRecoverySessionLegacy,
    
    // ✅ WELLNESS METHODS
    getDailyEmotionalNotes,
    addEmotionalNote,
    getReflections,
    getNotes,
    
    // ✅ ANALYTICS METHODS
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getAnalyticsData,
    
    // ✅ ONBOARDING METHODS
    getQuestionnaire,
    getSelfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    
    // ✅ CONTENT METHODS
    getAchievements,
    addAchievement,
    
    // ✅ LEGACY STAGE METHODS (Backward Compatibility)
    getStageProgress,
    getTCompleted,
    getStageXComplete,
    getPAHMSessions,
    getStageHours,
    
    // ✅ UTILITY METHODS
    clearAllData,
    
    // ✅ CALCULATED VALUES
    consistencyScore: calculateConsistencyScore(),
    progressTrend: getProgressTrend(),
    
    // ✅ USER INFO
    currentUser,
    isAuthenticated: !!currentUser
  };
};

export default useLocalDataCompat;