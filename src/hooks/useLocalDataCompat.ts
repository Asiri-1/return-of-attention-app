// src/hooks/useLocalDataCompat.ts
import { useAuth } from '../contexts/auth/AuthContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useAnalytics } from '../contexts/analytics/AnalyticsContext';
import { useUser } from '../contexts/user/UserContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';

export const useLocalDataCompat = () => {
  const { addPracticeSession, sessions, stats } = usePractice();
  const { addEmotionalNote, emotionalNotes } = useWellness();
  const { 
    getPAHMData, 
    getEnvironmentData, 
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution 
  } = useAnalytics();
  const { userProfile } = useUser();
  const { questionnaire, selfAssessment } = useOnboarding();

  return {
    userData: {
      profile: userProfile,
      practiceSessions: sessions,
      emotionalNotes,
      questionnaire,
      selfAssessment
    },
    
    isLoading: false,
    
    getPracticeSessions: () => sessions,
    getDailyEmotionalNotes: () => emotionalNotes,
    getMindRecoverySessions: () => sessions.filter((s: any) => s.sessionType === 'mind_recovery'),
    
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    
    getAnalyticsData: () => ({
      totalSessions: stats.totalSessions,
      totalMindRecoverySessions: stats.totalMindRecoverySessions,
      totalPracticeTime: stats.totalMinutes,
      averageSessionLength: Math.round(stats.totalMinutes / Math.max(stats.totalSessions, 1)),
      averageQuality: stats.averageQuality,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      emotionalNotesCount: emotionalNotes.length,
      consistencyScore: 85,
      progressTrend: 'improving' as const,
      lastUpdated: new Date().toISOString()
    }),
    
    addPracticeSession,
    addSession: addPracticeSession,
    addMindRecoverySession: (session: any) => addPracticeSession({ ...session, sessionType: 'mind_recovery' }),
    addEmotionalNote,
    
    getQuestionnaire: () => questionnaire,
    getSelfAssessment: () => selfAssessment,
    isQuestionnaireCompleted: () => questionnaire?.completed || false,
    isSelfAssessmentCompleted: () => selfAssessment?.completed || false,
    
    clearAllData: () => console.log('clearAllData not implemented'),
    getReflections: () => [],
    getAchievements: () => [],
    getNotes: () => [],
    getMeditationSessions: () => sessions.filter((s: any) => s.sessionType === 'meditation'),
    
    comprehensiveUserData: {
      profile: userProfile,
      practiceSessions: sessions,
      emotionalNotes,
      questionnaire,
      selfAssessment
    },
    practiceSessions: sessions,
    emotionalNotes: emotionalNotes,
    questionnaire,
    selfAssessment,
    profile: userProfile
  };
};

export default useLocalDataCompat;