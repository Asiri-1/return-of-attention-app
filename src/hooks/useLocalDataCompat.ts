// ============================================================================
// src/hooks/useLocalDataCompat.ts  
// ✅ FIREBASE-ONLY: Optimized compatibility layer for Universal Architecture
// 🔥 REFACTORED: Clean structure with no duplicate declarations
// ============================================================================

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useAnalytics } from '../contexts/analytics/AnalyticsContext';
import { useUser } from '../contexts/user/UserContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';
import { useContent } from '../contexts/content/ContentContext';

// ================================
// OPTIMIZED FIREBASE-ONLY HOOK
// ================================
export const useLocalDataCompat = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const { 
    addPracticeSession, 
    addMindRecoverySession,
    sessions, 
    getPracticeSessions,
    getMindRecoverySessions,
    getMeditationSessions,
    getProgressTrend,
    isLoading: practiceLoading
  } = usePractice();
  
  const { 
    addEmotionalNote, 
    emotionalNotes,
    reflections,
    getDailyEmotionalNotes,
    getReflections,
    isLoading: wellnessLoading 
  } = useWellness();
  
  const { 
    getPAHMData, 
    getEnvironmentData, 
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    isLoading: analyticsLoading 
  } = useAnalytics();
  
  const { userProfile, isLoading: userLoading } = useUser();
  const { 
    questionnaire, 
    selfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    getQuestionnaire,
    getSelfAssessment,
    isLoading: onboardingLoading
  } = useOnboarding();

  const { 
    achievements,
    getAchievements,
    addAchievement,
    isLoading: contentLoading 
  } = useContent();

  // ================================
  // MEMOIZED VALUES
  // ================================
  const isLoading = useMemo(() => 
    authLoading || practiceLoading || wellnessLoading || 
    analyticsLoading || userLoading || onboardingLoading || contentLoading,
    [authLoading, practiceLoading, wellnessLoading, analyticsLoading, userLoading, onboardingLoading, contentLoading]
  );

  // ================================
  // STREAK CALCULATIONS
  // ================================
  const calculateCurrentStreak = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    
    const sortedSessions = [...sessions].sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.timestamp || 0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.timestamp || 0);
      return bTime.getTime() - aTime.getTime();
    });
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = sortedSessions[i].createdAt?.toDate?.() || new Date(sortedSessions[i].timestamp || 0);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [sessions]);

  const calculateLongestStreak = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return Math.max(calculateCurrentStreak(), 0);
  }, [sessions, calculateCurrentStreak]);

  // ================================
  // CONSISTENCY SCORE
  // ================================
  const calculateFirebaseConsistencyScore = useCallback((): number => {
    if (!currentUser?.uid || !sessions) return 0;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSessions = sessions.filter(s => {
      const sessionDate = s.createdAt?.toDate?.() || new Date(s.timestamp || 0);
      return sessionDate >= sevenDaysAgo;
    });
    
    const recentNotes = emotionalNotes?.filter(note => {
      const noteDate = note.timestamp ? new Date(note.timestamp) : new Date(0);
      return noteDate >= sevenDaysAgo;
    }) || [];

    const sessionScore = Math.min(recentSessions.length * 15, 60);
    const noteScore = Math.min(recentNotes.length * 5, 25);
    const streakBonus = Math.min(calculateCurrentStreak() * 2, 15);
    
    return Math.min(sessionScore + noteScore + streakBonus, 100);
  }, [currentUser?.uid, sessions, emotionalNotes, calculateCurrentStreak]);

  // ================================
  // ANALYTICS DATA
  // ================================
  const getAnalyticsData = useCallback(() => {
    if (!currentUser?.uid || !sessions) {
      return {
        totalSessions: 0,
        totalMindRecoverySessions: 0,
        totalPracticeTime: 0,
        averageSessionLength: 0,
        averageQuality: 0,
        currentStreak: 0,
        longestStreak: 0,
        emotionalNotesCount: 0,
        consistencyScore: 0,
        progressTrend: 'stable' as const,
        lastUpdated: new Date().toISOString(),
        firebaseSource: true,
        syncedAt: new Date().toISOString()
      };
    }

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalRating = sessions.reduce((sum, session) => sum + (session.rating || 0), 0);
    const averageQuality = totalSessions > 0 ? totalRating / totalSessions : 0;
    const totalMindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery').length;
    
    return {
      totalSessions,
      totalMindRecoverySessions,
      totalPracticeTime: totalMinutes,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      averageQuality,
      currentStreak: calculateCurrentStreak(),
      longestStreak: calculateLongestStreak(),
      emotionalNotesCount: emotionalNotes?.length || 0,
      consistencyScore: calculateFirebaseConsistencyScore(),
      progressTrend: getProgressTrend() || 'stable' as const,
      lastUpdated: new Date().toISOString(),
      firebaseSource: true,
      syncedAt: new Date().toISOString()
    };
  }, [currentUser?.uid, sessions, emotionalNotes, getProgressTrend, calculateCurrentStreak, calculateLongestStreak, calculateFirebaseConsistencyScore]);

  // ================================
  // STAGE MANAGEMENT
  // ================================
  const getStageProgress = useCallback(() => {
    if (!currentUser?.uid) return 1;
    return userProfile?.currentProgress?.currentStage || 1;
  }, [currentUser?.uid, userProfile]);

  const getTCompleted = useCallback(() => {
    if (!currentUser?.uid) return false;
    const completed = questionnaire?.completed || questionnaire?.responses !== null || false;
    return completed;
  }, [currentUser?.uid, questionnaire]);

  const getStageXComplete = useCallback((stage: number) => {
    if (!currentUser?.uid || !sessions) return false;
    const stageSessions = sessions.filter(s => s.stageLevel === stage);
    return stageSessions.length >= 5;
  }, [currentUser?.uid, sessions]);

  // ================================
  // PAHM DATA
  // ================================
  const getFirebasePAHMSessions = useCallback(() => {
    if (!currentUser?.uid || !sessions) return [];
    return sessions.filter(s => s.sessionType === 'meditation' && s.stageLevel);
  }, [currentUser?.uid, sessions]);

  const getStageHours = useCallback((stage: number) => {
    if (!currentUser?.uid || !sessions) return 0;
    const stageSessions = sessions.filter(s => s.stageLevel === stage);
    const totalMinutes = stageSessions.reduce((total, session) => total + (session.duration || 0), 0);
    return totalMinutes / 60;
  }, [currentUser?.uid, sessions]);

  // ================================
  // NOTES AND REFLECTIONS
  // ================================
  const getFirebaseNotes = useCallback(() => {
    if (!currentUser?.uid) return [];
    
    const combinedNotes = [
      ...(emotionalNotes || []).map(note => ({ 
        ...note, 
        type: 'emotional',
        firebaseSource: true,
        userId: currentUser.uid
      })),
      ...(reflections || []).map(ref => ({ 
        ...ref, 
        type: 'reflection',
        firebaseSource: true,
        userId: currentUser.uid
      }))
    ];
    
    return combinedNotes;
  }, [currentUser?.uid, emotionalNotes, reflections]);

  // ================================
  // ENHANCED METHODS
  // ================================
  const addFirebaseEmotionalNote = useCallback(async (noteData: any) => {
    if (!currentUser?.uid) {
      console.warn('Cannot add emotional note - no authenticated user');
      return null;
    }

    const firebaseNoteData = {
      ...noteData,
      userId: currentUser.uid,
      createdAt: new Date(),
      firebaseSource: true,
      syncedAt: new Date().toISOString()
    };

    return await addEmotionalNote(firebaseNoteData);
  }, [currentUser?.uid, addEmotionalNote]);

  const addFirebaseMindRecoverySession = useCallback(async (sessionData: any) => {
    if (!currentUser?.uid) {
      console.warn('Cannot add mind recovery session - no authenticated user');
      return null;
    }

    const firebaseMindRecoverySession = {
      duration: sessionData.duration || 0,
      sessionType: 'mind_recovery' as const,
      timestamp: sessionData.timestamp || new Date().toISOString(),
      rating: sessionData.rating || 0,
      notes: sessionData.notes || '',
      stageLevel: sessionData.stageLevel,
      presentPercentage: sessionData.presentPercentage,
    };

    return await addMindRecoverySession(firebaseMindRecoverySession);
  }, [currentUser?.uid, addMindRecoverySession]);

  const addSession = useCallback(async (sessionData: any) => {
    if (!currentUser?.uid) {
      console.warn('Cannot add session - no authenticated user');
      return null;
    }

    const firebaseSessionData = {
      duration: sessionData.duration || 0,
      sessionType: sessionData.sessionType,
      timestamp: sessionData.timestamp || new Date().toISOString(),
      rating: sessionData.rating || 0,
      notes: sessionData.notes || '',
      stageLevel: sessionData.stageLevel,
      presentPercentage: sessionData.presentPercentage,
    };

    if (sessionData.sessionType === 'mind_recovery') {
      return await addFirebaseMindRecoverySession(firebaseSessionData);
    } else {
      return await addPracticeSession(firebaseSessionData);
    }
  }, [currentUser?.uid, addFirebaseMindRecoverySession, addPracticeSession]);

  // ================================
  // FIREBASE STATUS
  // ================================
  const getFirebaseStatus = useCallback(() => ({
    isConnected: !!currentUser,
    userId: currentUser?.uid,
    isLoading,
    hasProfile: !!userProfile,
    hasSessions: (sessions?.length || 0) > 0,
    hasEmotionalNotes: (emotionalNotes?.length || 0) > 0,
    hasQuestionnaire: !!questionnaire,
    hasSelfAssessment: !!selfAssessment,
    hasAchievements: (achievements?.length || 0) > 0,
    firebaseIntegrated: true,
    lastSyncAt: new Date().toISOString()
  }), [currentUser, isLoading, userProfile, sessions, emotionalNotes, questionnaire, selfAssessment, achievements]);

  // ================================
  // USER DATA
  // ================================
  const userData = useMemo(() => {
    if (!currentUser?.uid) {
      return {
        profile: null,
        practiceSessions: [],
        emotionalNotes: [],
        reflections: [],
        questionnaire: null,
        selfAssessment: null,
        achievements: [],
        analytics: getAnalyticsData(),
        lastUpdated: new Date().toISOString(),
        firebaseSource: true,
        userId: null,
        isAuthenticated: false
      };
    }

    return {
      profile: userProfile,
      practiceSessions: sessions || [],
      emotionalNotes: emotionalNotes || [],
      reflections: reflections || [],
      questionnaire,
      selfAssessment,
      achievements: achievements || [],
      analytics: getAnalyticsData(),
      lastUpdated: new Date().toISOString(),
      firebaseSource: true,
      userId: currentUser.uid,
      isAuthenticated: true,
      syncedAt: new Date().toISOString()
    };
  }, [currentUser?.uid, userProfile, sessions, emotionalNotes, reflections, questionnaire, selfAssessment, achievements, getAnalyticsData]);

  // ================================
  // CLEAR DATA
  // ================================
  const clearAllData = useCallback(async () => {
    if (!currentUser?.uid) {
      console.warn('Cannot clear data - no authenticated user');
      return;
    }
    console.warn('Firebase clearAllData called - implement actual clearing methods');
  }, [currentUser?.uid]);

  // ================================
  // RETURN ALL FUNCTIONALITY
  // ================================
  return useMemo(() => ({
    // Core data
    userData,
    comprehensiveUserData: userData,
    isLoading,
    
    // Direct context data access
    practiceSessions: sessions || [],
    emotionalNotes: emotionalNotes || [],
    reflections: reflections || [],
    questionnaire,
    selfAssessment,
    profile: userProfile,
    achievements: achievements || [],
    
    // Practice session methods
    getPracticeSessions,
    getMeditationSessions,
    getMindRecoverySessions,
    addPracticeSession,
    addSession,
    addMindRecoverySession: addFirebaseMindRecoverySession,
    
    // Wellness methods
    getDailyEmotionalNotes,
    addEmotionalNote: addFirebaseEmotionalNote,
    getReflections,
    getNotes: getFirebaseNotes,
    
    // Analytics methods
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getAnalyticsData,
    
    // Onboarding methods
    getQuestionnaire,
    getSelfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    
    // Content methods
    getAchievements,
    addAchievement,
    
    // Stage methods
    getStageProgress,
    getTCompleted,
    getStageXComplete,
    getPAHMSessions: getFirebasePAHMSessions,
    getStageHours,
    
    // Calculated values
    consistencyScore: calculateFirebaseConsistencyScore(),
    progressTrend: getProgressTrend() || 'stable',
    currentStreak: calculateCurrentStreak(),
    longestStreak: calculateLongestStreak(),
    
    // Firebase status
    firebaseStatus: getFirebaseStatus(),
    
    // Utility methods
    clearAllData,
    
    // User info
    currentUser,
    isAuthenticated: !!currentUser,
    
    // Firebase-specific features
    firebaseIntegrated: true,
    dataSource: 'Firebase Cloud Storage',
    crossDeviceSync: true,
    realTimeUpdates: true
  }), [
    userData,
    isLoading,
    sessions,
    emotionalNotes,
    reflections,
    questionnaire,
    selfAssessment,
    userProfile,
    achievements,
    getPracticeSessions,
    getMeditationSessions,
    getMindRecoverySessions,
    addPracticeSession,
    addSession,
    addFirebaseMindRecoverySession,
    getDailyEmotionalNotes,
    addFirebaseEmotionalNote,
    getReflections,
    getFirebaseNotes,
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getAnalyticsData,
    getQuestionnaire,
    getSelfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    getAchievements,
    addAchievement,
    getStageProgress,
    getTCompleted,
    getStageXComplete,
    getFirebasePAHMSessions,
    getStageHours,
    calculateFirebaseConsistencyScore,
    getProgressTrend,
    calculateCurrentStreak,
    calculateLongestStreak,
    getFirebaseStatus,
    clearAllData,
    currentUser
  ]);
};

export default useLocalDataCompat;