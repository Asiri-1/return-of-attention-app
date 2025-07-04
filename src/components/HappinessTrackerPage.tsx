import React from 'react';
import { useAuth } from '../AuthContext';
import HappinessProgressTracker from '../HappinessProgressTracker';

const HappinessTrackerPage: React.FC = () => {
  const { currentUser } = useAuth();

  // 🔧 FINAL FIX: Read from ALL possible storage locations
  const getSelfAssessmentData = () => {
    // Try direct storage first (where our fixed SelfAssessment saves it)
    let selfAssessmentData = JSON.parse(localStorage.getItem('selfAssessmentData') || 'null');
    
    if (selfAssessmentData && selfAssessmentData.intentBased === true) {
      console.log('✅ FINAL FIX: Found correct self-assessment data in direct storage!');
      return selfAssessmentData;
    }

    // Try backup storage
    selfAssessmentData = JSON.parse(localStorage.getItem('selfAssessmentData_backup') || 'null');
    
    if (selfAssessmentData && selfAssessmentData.intentBased === true) {
      console.log('✅ FINAL FIX: Found correct self-assessment data in backup storage!');
      return selfAssessmentData;
    }

    // Try user profile
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (userProfile.selfAssessmentData && userProfile.selfAssessmentData.intentBased === true) {
      console.log('✅ FINAL FIX: Found correct self-assessment data in user profile!');
      return userProfile.selfAssessmentData;
    }

    // Try email-based storage
    if (currentUser?.email) {
      const emailProfile = JSON.parse(localStorage.getItem(`userProfile_${currentUser.email}`) || '{}');
      if (emailProfile.selfAssessmentData && emailProfile.selfAssessmentData.intentBased === true) {
        console.log('✅ FINAL FIX: Found correct self-assessment data in email profile!');
        return emailProfile.selfAssessmentData;
      }
    }

    // Try uid-based storage
    if (currentUser?.uid) {
      const uidProfile = JSON.parse(localStorage.getItem(`userProfile_${currentUser.uid}`) || '{}');
      if (uidProfile.selfAssessmentData && uidProfile.selfAssessmentData.intentBased === true) {
        console.log('✅ FINAL FIX: Found correct self-assessment data in uid profile!');
        return uidProfile.selfAssessmentData;
      }
    }

    console.log('❌ FINAL FIX: No correct self-assessment data found in any storage location');
    return null;
  };

  // Get data from localStorage (same way your app stores it)
  const practiceHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
  const emotionalNotes = JSON.parse(localStorage.getItem('emotionalNotes') || '[]');
  const mindRecoveryHistory = JSON.parse(localStorage.getItem('mindRecoveryHistory') || '[]');
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
  
  // Get the CORRECT self-assessment data
  const correctSelfAssessmentData = getSelfAssessmentData();

  // Create a corrected currentUser object
  const correctedCurrentUser = currentUser ? {
    ...currentUser,
    selfAssessmentData: correctSelfAssessmentData || currentUser.selfAssessmentData
  } : null;

  // Debug logging so you can see what data is being passed
  console.log('🔍 FINAL FIX: HappinessTrackerPage data check:', {
    hasCurrentUser: !!currentUser,
    userEmail: currentUser?.email,
    hasQuestionnaireAnswers: !!currentUser?.questionnaireAnswers,
    hasSelfAssessmentData: !!correctedCurrentUser?.selfAssessmentData,
    selfAssessmentFormat: correctedCurrentUser?.selfAssessmentData?.format,
    intentBased: correctedCurrentUser?.selfAssessmentData?.intentBased,
    selfAssessmentVersion: correctedCurrentUser?.selfAssessmentData?.version,
    practiceHistoryLength: practiceHistory.length,
    emotionalNotesLength: emotionalNotes.length,
    mindRecoveryLength: mindRecoveryHistory.length,
    foundCorrectData: !!correctSelfAssessmentData
  });

  // Show loading if no user yet
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        Loading user data...
      </div>
    );
  }

  // Show the happiness tracker with CORRECTED data
  return (
    <div>
      {/* Add a header showing this is the test page */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        🧪 HAPPINESS CALCULATION TEST PAGE - FINAL FIX
        <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
          Check browser console (F12) for detailed calculation logs
        </div>
        {correctSelfAssessmentData ? (
          <div style={{ fontSize: '12px', background: 'rgba(0,255,0,0.2)', padding: '5px', borderRadius: '5px', marginTop: '5px' }}>
            ✅ Using CORRECT self-assessment data: intentBased={correctSelfAssessmentData.intentBased ? 'true' : 'false'}, format='{correctSelfAssessmentData.format}'
          </div>
        ) : (
          <div style={{ fontSize: '12px', background: 'rgba(255,0,0,0.2)', padding: '5px', borderRadius: '5px', marginTop: '5px' }}>
            ❌ No correct self-assessment data found. Please redo self-assessment.
          </div>
        )}
      </div>

      {/* Render the actual happiness tracker with CORRECTED user data */}
      <HappinessProgressTracker
        currentUser={correctedCurrentUser}
        practiceHistory={practiceHistory}
        emotionalNotes={emotionalNotes}
        mindRecoveryHistory={mindRecoveryHistory}
        analytics={analytics}
        onClose={() => {
          // Go back to previous page
          window.history.back();
        }}
      />
    </div>
  );
};

export default HappinessTrackerPage;