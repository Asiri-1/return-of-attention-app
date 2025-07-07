import React from 'react';
import { useAuth } from '../AuthContext';
import HappinessProgressTracker from '../HappinessProgressTracker';
import { useLocalData } from '../contexts/LocalDataContext';

const HappinessTrackerPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const {
    getPracticeSessions,
    getDailyEmotionalNotes,
    getMindRecoverySessions,
    getQuestionnaire,
    getSelfAssessment,
    getHappinessPoints,
    getAchievements,
    getPAHMData,
    getEnvironmentData,
    getAnalyticsData,
    refreshTrigger,
    isLoading
  } = useLocalData();

  // ✅ FIXED: Get all data from LocalDataContext
  const practiceHistory = getPracticeSessions();
  const emotionalNotes = getDailyEmotionalNotes();
  const mindRecoveryHistory = getMindRecoverySessions();
  const questionnaire = getQuestionnaire();
  const selfAssessment = getSelfAssessment();
  const happinessPoints = getHappinessPoints();
  const achievements = getAchievements();
  const pahmData = getPAHMData();
  const environmentData = getEnvironmentData();
  const analyticsData = getAnalyticsData();

  console.log('🎯 HappinessTrackerPage data summary:', {
    currentUser: !!currentUser,
    userProfile: !!userProfile,
    practiceSessionCount: practiceHistory.length,
    emotionalNotesCount: emotionalNotes.length,
    mindRecoverySessionCount: mindRecoveryHistory.length,
    questionnaireCompleted: !!questionnaire?.completed,
    selfAssessmentCompleted: !!selfAssessment?.completed,
    happinessPoints,
    achievementsCount: achievements.length,
    pahmObservations: pahmData?.totalObservations || 0,
    refreshTrigger,
    isLoading
  });

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '40px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Loading your happiness data...</h2>
        <style>{`
          @keyframes spin {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
        `}</style>
      </div>
    );
  }

  // Show user feedback about data availability
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '40px'
      }}>
        <h2>Please sign in to view your happiness tracker</h2>
        <p>Your happiness data is personalized and requires authentication.</p>
      </div>
    );
  }

  // ✅ FIXED: Create enhanced currentUser with LocalDataContext data
  const enhancedCurrentUser = {
    ...currentUser,
    // Map questionnaire data to expected format
    questionnaireAnswers: questionnaire?.responses || {},
    questionnaireCompleted: questionnaire?.completed || false,
    
    // Map self-assessment data to expected format
    selfAssessmentData: selfAssessment || {},
    assessmentCompleted: selfAssessment?.completed || false,
    
    // Add happiness and achievement data
    happinessPoints: happinessPoints,
    achievements: achievements,
    
    // Add session statistics
    totalSessions: practiceHistory.length,
    totalMinutes: practiceHistory.reduce((sum, session) => sum + session.duration, 0),
    
    // Add debug info for troubleshooting
    debugInfo: {
      dataSource: 'LocalDataContext',
      refreshTrigger,
      timestamp: new Date().toISOString(),
      questionnaire: {
        completed: questionnaire?.completed || false,
        responseCount: questionnaire?.responses ? Object.keys(questionnaire.responses).length : 0
      },
      selfAssessment: {
        completed: selfAssessment?.completed || false,
        hasCategories: !!selfAssessment?.categories
      },
      sessions: {
        total: practiceHistory.length,
        meditation: practiceHistory.filter(s => s.sessionType === 'meditation').length,
        mindRecovery: mindRecoveryHistory.length,
        withPAHM: practiceHistory.filter(s => s.pahmCounts).length
      }
    }
  };

  return (
    <div style={{
       minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Enhanced Data Status Indicator */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        color: 'white',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span>
            📊 Data Loaded: {practiceHistory.length} sessions, {emotionalNotes.length} notes, {mindRecoveryHistory.length} recovery sessions
          </span>
          <span style={{ opacity: 0.7 }}>
            Refresh #{refreshTrigger}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '12px', opacity: 0.8 }}>
          <span>🎯 Happiness: {happinessPoints} pts</span>
          <span>🏆 Achievements: {achievements.length}</span>
          <span>📋 Questionnaire: {questionnaire?.completed ? '✅' : '❌'}</span>
          <span>🧠 Assessment: {selfAssessment?.completed ? '✅' : '❌'}</span>
          <span>🎯 PAHM Observations: {pahmData?.totalObservations || 0}</span>
        </div>
      </div>

      {/* Main Happiness Tracker Component with Enhanced Data */}
      <HappinessProgressTracker
        currentUser={enhancedCurrentUser}
        practiceHistory={practiceHistory}
        emotionalNotes={emotionalNotes}
        mindRecoveryHistory={mindRecoveryHistory}
        pahmData={pahmData}
        environmentData={environmentData}
        analyticsData={analyticsData}
        happinessPoints={happinessPoints}
        achievements={achievements}
        questionnaire={questionnaire}
        selfAssessment={selfAssessment}
      />
    </div>
  );
};

export default HappinessTrackerPage;