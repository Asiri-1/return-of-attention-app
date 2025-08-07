// ============================================================================
// src/hooks/useLocalDataCompat.ts
// ✅ FIREBASE-ONLY: Compatibility layer for Universal Architecture contexts
// 🔥 REMOVED: All localStorage dependencies - Firebase contexts only
// ============================================================================

import { useAuth } from '../contexts/auth/AuthContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useAnalytics } from '../contexts/analytics/AnalyticsContext';
import { useUser } from '../contexts/user/UserContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';
import { useContent } from '../contexts/content/ContentContext';

// ================================
// FIREBASE-ONLY INTERFACES
// ================================
interface FirebaseSessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number;
  rating?: number;
  notes?: string;
  presentPercentage?: number;
  firebaseId?: string;
  userId: string;
  [key: string]: any;
}

interface FirebaseAnalyticsData {
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
  firebaseSource: boolean;
  syncedAt: string;
}

// ================================
// FIREBASE-ONLY COMPATIBILITY HOOK
// ================================
export const useLocalDataCompat = () => {
  // ✅ FIREBASE-ONLY: All data from Firebase contexts
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
  // FIREBASE-ONLY COMPUTED VALUES
  // ================================
  const isLoading = authLoading || practiceLoading || wellnessLoading || 
                    analyticsLoading || userLoading || onboardingLoading || contentLoading;

  // ✅ FIREBASE-ONLY: Enhanced analytics data with Firebase session stats
  const getAnalyticsData = (): FirebaseAnalyticsData => {
    if (!currentUser?.uid) {
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
        progressTrend: 'stable',
        lastUpdated: new Date().toISOString(),
        firebaseSource: true,
        syncedAt: new Date().toISOString()
      };
    }

    // Manual calculation since getSessionStats doesn't exist
    const totalSessions = sessions?.length || 0;
    const totalMinutes = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
    const totalRating = sessions?.reduce((sum, session) => sum + (session.rating || 0), 0) || 0;
    const averageQuality = totalSessions > 0 ? totalRating / totalSessions : 0;
    const totalMindRecoverySessions = sessions?.filter(s => s.sessionType === 'mind_recovery').length || 0;
    
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
      progressTrend: getProgressTrend() || 'stable',
      lastUpdated: new Date().toISOString(),
      firebaseSource: true,
      syncedAt: new Date().toISOString()
    };
  };

  // ✅ FIREBASE-ONLY: Manual streak calculations since getSessionStats doesn't exist
  const calculateCurrentStreak = (): number => {
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
  };

  const calculateLongestStreak = (): number => {
    if (!sessions || sessions.length === 0) return 0;
    
    // Simple implementation - can be enhanced
    return Math.max(calculateCurrentStreak(), 0);
  };
  // ✅ FIREBASE-ONLY: Calculate consistency score based on Firebase data
  const calculateFirebaseConsistencyScore = (): number => {
    if (!currentUser?.uid || !sessions) {
      return 0;
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter recent sessions using Firebase Timestamp conversion
    const recentSessions = sessions.filter(s => {
      const sessionDate = s.createdAt?.toDate?.() || new Date(s.timestamp || 0);
      return sessionDate >= sevenDaysAgo;
    });
    
    const recentNotes = emotionalNotes?.filter(note => {
      const noteDate = note.timestamp ? new Date(note.timestamp) : new Date(0);
      return noteDate >= sevenDaysAgo;
    }) || [];

    // Firebase-based scoring
    const sessionScore = Math.min(recentSessions.length * 15, 60);
    const noteScore = Math.min(recentNotes.length * 5, 25);
    const streakBonus = Math.min(calculateCurrentStreak() * 2, 15);
    
    console.log('🔥 Firebase Consistency Score:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      recentSessions: recentSessions.length,
      recentNotes: recentNotes.length,
      currentStreak: calculateCurrentStreak(),
      totalScore: Math.min(sessionScore + noteScore + streakBonus, 100)
    });
    
    return Math.min(sessionScore + noteScore + streakBonus, 100);
  };

  // ================================
  // FIREBASE-ONLY SESSION MANAGEMENT
  // ================================
  const addSession = async (sessionData: any) => {
    if (!currentUser?.uid) {
      console.warn('🚨 Cannot add session - no authenticated user');
      return null;
    }

    // Create session data matching your Firebase context requirements
    const firebaseSessionData = {
      duration: sessionData.duration || 0,
      sessionType: sessionData.sessionType,
      timestamp: sessionData.timestamp || new Date().toISOString(),
      rating: sessionData.rating || 0,
      notes: sessionData.notes || '',
      stageLevel: sessionData.stageLevel,
      presentPercentage: sessionData.presentPercentage,
      // Remove properties that cause TypeScript errors
      // Firebase context will handle userId, createdAt, etc.
    };

    console.log('🔥 Adding Firebase session:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      sessionType: sessionData.sessionType,
      duration: sessionData.duration
    });

    if (sessionData.sessionType === 'mind_recovery') {
      return await addMindRecoverySession(firebaseSessionData);
    } else {
      return await addPracticeSession(firebaseSessionData);
    }
  };

  // ✅ FIREBASE-ONLY: Enhanced mind recovery session with Firebase metadata
  const addFirebaseMindRecoverySession = async (sessionData: any) => {
    if (!currentUser?.uid) {
      console.warn('🚨 Cannot add mind recovery session - no authenticated user');
      return null;
    }

    // Create session data matching your Firebase context requirements
    const firebaseMindRecoverySession = {
      duration: sessionData.duration || 0,
      sessionType: 'mind_recovery' as const,
      timestamp: sessionData.timestamp || new Date().toISOString(),
      rating: sessionData.rating || 0,
      notes: sessionData.notes || '',
      stageLevel: sessionData.stageLevel,
      presentPercentage: sessionData.presentPercentage,
      // Remove properties that cause TypeScript errors
      // userId, createdAt, firebaseSource will be added by the context
    };

    console.log('🔥 Adding Firebase mind recovery session:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      duration: firebaseMindRecoverySession.duration
    });

    return await addMindRecoverySession(firebaseMindRecoverySession);
  };

  // ================================
  // FIREBASE-ONLY USER DATA
  // ================================
  const getFirebaseUserData = () => {
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
      questionnaire: questionnaire,
      selfAssessment: selfAssessment,
      achievements: achievements || [],
      analytics: getAnalyticsData(),
      lastUpdated: new Date().toISOString(),
      firebaseSource: true,
      userId: currentUser.uid,
      isAuthenticated: true,
      syncedAt: new Date().toISOString()
    };
  };

  // ================================
  // FIREBASE-ONLY STAGE MANAGEMENT
  // ================================
  const getStageProgress = () => {
    if (!currentUser?.uid) {
      return 1;
    }
    
    // Get stage from Firebase user profile or calculate from sessions
    const profileStage = userProfile?.currentProgress?.currentStage || 1;
    
    console.log('🔥 Firebase Stage Progress:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      profileStage,
      totalSessions: sessions?.length || 0
    });
    
    return profileStage;
  };

  const getTCompleted = () => {
    if (!currentUser?.uid) {
      return false;
    }
    
    // Check Firebase questionnaire completion
    const completed = questionnaire?.completed || 
                     questionnaire?.responses !== null || false;
    
    console.log('🔥 Firebase T-Completion Status:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      questionnaireCompleted: !!questionnaire?.completed,
      hasResponses: !!questionnaire?.responses,
      overallCompleted: completed
    });
    
    return completed;
  };

  const getStageXComplete = (stage: number) => {
    if (!currentUser?.uid || !sessions) {
      return false;
    }
    
    // Check Firebase session data for stage completion
    const stageSessions = sessions.filter(s => s.stageLevel === stage);
    const completed = stageSessions.length >= 5; // Example completion criteria
    
    console.log('🔥 Firebase Stage Completion Check:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      stage,
      stageSessions: stageSessions.length,
      completed
    });
    
    return completed;
  };

  // ================================
  // FIREBASE-ONLY PAHM DATA
  // ================================
  const getFirebasePAHMSessions = () => {
    if (!currentUser?.uid || !sessions) {
      return [];
    }
    
    const pahmSessions = sessions.filter(s => 
      s.sessionType === 'meditation' && s.stageLevel
    );
    
    console.log('🔥 Firebase PAHM Sessions:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      totalPAHMSessions: pahmSessions.length,
      totalSessions: sessions.length
    });
    
    return pahmSessions;
  };

  const getStageHours = (stage: number) => {
    if (!currentUser?.uid || !sessions) {
      return 0;
    }
    
    const stageSessions = sessions.filter(s => s.stageLevel === stage);
    const totalMinutes = stageSessions.reduce((total, session) => 
      total + (session.duration || 0), 0
    );
    const hours = totalMinutes / 60;
    
    console.log('🔥 Firebase Stage Hours:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      stage,
      sessions: stageSessions.length,
      totalMinutes,
      hours: hours.toFixed(1)
    });
    
    return hours;
  };

  // ================================
  // FIREBASE-ONLY NOTES AND REFLECTIONS
  // ================================
  const getFirebaseNotes = () => {
    if (!currentUser?.uid) {
      return [];
    }
    
    // Combine Firebase emotional notes and reflections
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
    
    console.log('🔥 Firebase Combined Notes:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      emotionalNotes: emotionalNotes?.length || 0,
      reflections: reflections?.length || 0,
      total: combinedNotes.length
    });
    
    return combinedNotes;
  };

  // ================================
  // FIREBASE-ONLY CLEAR DATA (Safe)
  // ================================
  const clearFirebaseData = async () => {
    if (!currentUser?.uid) {
      console.warn('🚨 Cannot clear data - no authenticated user');
      return;
    }
    
    console.warn('🔥 Firebase clearAllData called for user:', currentUser.uid.substring(0, 8) + '...');
    console.log('📍 This should implement Firebase context clear methods:');
    console.log('  - Practice Context: Clear sessions and stats');
    console.log('  - Wellness Context: Clear emotional notes and reflections');  
    console.log('  - User Context: Reset user profile data');
    console.log('  - Onboarding Context: Clear questionnaire and assessment');
    console.log('  - Content Context: Clear achievements and progress');
    console.log('  - Analytics Context: Clear cached analytics data');
    
    // TODO: Implement actual Firebase clearing methods
    // await clearPracticeData();
    // await clearWellnessData();
    // await clearUserData();
    // await clearOnboardingData();
    // await clearContentData();
    // await clearAnalyticsCache();
  };

  // ================================
  // FIREBASE-ONLY ENHANCED METHODS
  // ================================
  const getFirebaseStatus = () => ({
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
  });

  // Add emotional note with Firebase metadata
  const addFirebaseEmotionalNote = async (noteData: any) => {
    if (!currentUser?.uid) {
      console.warn('🚨 Cannot add emotional note - no authenticated user');
      return null;
    }

    const firebaseNoteData = {
      ...noteData,
      userId: currentUser.uid,
      createdAt: new Date(),
      firebaseSource: true,
      syncedAt: new Date().toISOString()
    };

    console.log('🔥 Adding Firebase emotional note:', {
      userId: currentUser.uid.substring(0, 8) + '...',
      emotion: noteData.emotion || 'unspecified'
    });

    return await addEmotionalNote(firebaseNoteData);
  };

  // ================================
  // FIREBASE-ONLY RETURN INTERFACE
  // ================================
  return {
    // ✅ FIREBASE-ONLY CORE DATA
    userData: getFirebaseUserData(),
    comprehensiveUserData: getFirebaseUserData(),
    isLoading,
    firebaseStatus: getFirebaseStatus(),
    
    // ✅ DIRECT FIREBASE DATA ACCESS
    practiceSessions: sessions || [],
    emotionalNotes: emotionalNotes || [],
    reflections: reflections || [],
    questionnaire: questionnaire,
    selfAssessment: selfAssessment,
    profile: userProfile,
    achievements: achievements || [],
    
    // ✅ FIREBASE PRACTICE SESSION METHODS
    getPracticeSessions,
    getMeditationSessions,
    getMindRecoverySessions,
    addPracticeSession,
    addSession,
    addMindRecoverySession: addFirebaseMindRecoverySession,
    
    // ✅ FIREBASE WELLNESS METHODS
    getDailyEmotionalNotes,
    addEmotionalNote: addFirebaseEmotionalNote,
    getReflections,
    getNotes: getFirebaseNotes,
    
    // ✅ FIREBASE ANALYTICS METHODS
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getAnalyticsData,
    
    // ✅ FIREBASE ONBOARDING METHODS
    getQuestionnaire,
    getSelfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    
    // ✅ FIREBASE CONTENT METHODS
    getAchievements,
    addAchievement,
    
    // ✅ FIREBASE STAGE METHODS (Enhanced)
    getStageProgress,
    getTCompleted,
    getStageXComplete,
    getPAHMSessions: getFirebasePAHMSessions,
    getStageHours,
    
    // ✅ FIREBASE UTILITY METHODS
    clearAllData: clearFirebaseData,
    
    // ✅ FIREBASE CALCULATED VALUES
    consistencyScore: calculateFirebaseConsistencyScore(),
    progressTrend: getProgressTrend() || 'stable',
    
    // ✅ FIREBASE USER INFO
    currentUser,
    isAuthenticated: !!currentUser,
    
    // ✅ FIREBASE-SPECIFIC ENHANCEMENTS
    currentStreak: calculateCurrentStreak(),
    longestStreak: calculateLongestStreak(),
    firebaseIntegrated: true,
    dataSource: 'Firebase Cloud Storage',
    crossDeviceSync: true,
    realTimeUpdates: true
  };
};

export default useLocalDataCompat;