import React from 'react';
import { useAuth } from '../AuthContext';
import HappinessProgressTracker from '../HappinessProgressTracker';

const HappinessTrackerPage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();

  // Get data from localStorage (same way your app stores it)
  const practiceHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
  const emotionalNotes = JSON.parse(localStorage.getItem('emotionalNotes') || '[]');
  const mindRecoveryHistory = JSON.parse(localStorage.getItem('mindRecoveryHistory') || '[]');
  const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');

  // 🎯 SIMPLIFIED: Let HappinessProgressTracker handle its own data detection
  // Since it's clearly working (we see attachment penalty calculated), don't interfere
  console.log('🔍 HappinessTrackerPage: Starting happiness calculation page', {
    hasCurrentUser: !!currentUser,
    userEmail: currentUser?.email,
    hasUserProfile: !!userProfile,
    practiceHistoryLength: practiceHistory.length,
    emotionalNotesLength: emotionalNotes.length,
    mindRecoveryLength: mindRecoveryHistory.length
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

  // 🎯 TRUST: HappinessProgressTracker will handle data detection correctly
  return (
    <div>
      {/* Simple header - let the component show its own status */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        😊 Your Happiness Calculator
        <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
          Analyzing your mindfulness journey and calculating your happiness score
        </div>
        
        {/* Debug button for troubleshooting */}
        <div style={{ marginTop: '8px' }}>
          <button 
            onClick={() => {
              console.log('🔍 DEBUG: All relevant localStorage data:');
              Object.keys(localStorage).forEach(key => {
                if (key.includes('self') || key.includes('Assessment') || key.includes('userProfile') || key.includes('happiness')) {
                  console.log(`${key}:`, localStorage.getItem(key));
                }
              });
              console.log('🔍 DEBUG: userProfile from AuthContext:', userProfile);
              console.log('🔍 DEBUG: currentUser from AuthContext:', currentUser);
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            🔍 Debug Data
          </button>
          
          <button 
            onClick={() => {
              console.log('🔄 Clearing happiness cache...');
              localStorage.removeItem('happinessCache');
              localStorage.removeItem('happiness_points');
              localStorage.removeItem('user_level');
              window.location.reload();
            }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '12px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            🔄 Recalculate
          </button>
        </div>
      </div>

      {/* 🎯 SIMPLIFIED: Just pass the user data and let HappinessProgressTracker handle everything */}
      <HappinessProgressTracker
        currentUser={currentUser}
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