import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useAuth } from '../AuthContext';
import { useLocalData } from '../contexts/LocalDataContext';

function AdminPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('admin');
  const [resetStatus, setResetStatus] = useState('');
  
  // Use AdminContext for consistent admin checking
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { currentUser } = useAuth();
  const { clearAllData } = useLocalData();

  // 🔒 STRICT ADMIN CHECK - Only exact email match
  const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';
  
  const isActualAdmin = () => {
    // Must meet ALL criteria:
    // 1. AdminContext says isAdmin = true
    // 2. currentUser exists and email matches exactly
    // 3. Not in loading state
    
    if (adminLoading) return false;
    if (!isAdmin) return false;
    if (!currentUser) return false;
    if (currentUser.email !== ADMIN_EMAIL) return false;
    
    return true;
  };

  // 🔒 COMPLETELY HIDE for non-admin users
  if (!isActualAdmin()) {
    return null; // Completely invisible to non-admins
  }

  console.log('🔧 AdminPanel Active for:', currentUser.email);

  // Development Tools Functions
  const resetToStage = (stageNumber) => {
    try {
      const currentStageValue = localStorage.getItem('devCurrentStage');
      const currentStage = currentStageValue ? parseInt(currentStageValue, 10) : 1;
      
      console.log(`🔄 Resetting from stage ${currentStage} to stage ${stageNumber}`);
      
      localStorage.setItem('devCurrentStage', stageNumber.toString());
      localStorage.setItem('userCurrentStage', stageNumber.toString());
      
      setResetStatus(`✅ Reset to Stage ${stageNumber} completed`);
      setTimeout(() => setResetStatus(''), 3000);
      
      window.location.reload();
    } catch (error) {
      console.error('❌ Error resetting stage:', error);
      setResetStatus('❌ Error resetting stage');
      setTimeout(() => setResetStatus(''), 3000);
    }
  };

  const resetOnboarding = () => {
    try {
      console.log('🔄 Resetting onboarding flow...');
      
      // Reset onboarding flags
      localStorage.removeItem('questionnaireCompleted');
      localStorage.removeItem('assessmentCompleted');
      localStorage.removeItem('introductionCompleted');
      localStorage.removeItem('userProfile');
      
      // Reset stages
      localStorage.setItem('devCurrentStage', '1');
      localStorage.setItem('userCurrentStage', '1');
      
      setResetStatus('✅ Onboarding reset completed');
      setTimeout(() => setResetStatus(''), 3000);
      
      // Reload to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('❌ Error resetting onboarding:', error);
      setResetStatus('❌ Error resetting onboarding');
      setTimeout(() => setResetStatus(''), 3000);
    }
  };

  const resetTimerData = () => {
    try {
      console.log('🔄 Resetting timer and practice data...');
      
      // Reset timer-related data
      localStorage.removeItem('practiceSession');
      localStorage.removeItem('timerData');
      localStorage.removeItem('sessionData');
      localStorage.removeItem('practiceHistory');
      localStorage.removeItem('mindRecoveryHistory');
      
      setResetStatus('✅ Timer data reset completed');
      setTimeout(() => setResetStatus(''), 3000);
    } catch (error) {
      console.error('❌ Error resetting timer data:', error);
      setResetStatus('❌ Error resetting timer data');
      setTimeout(() => setResetStatus(''), 3000);
    }
  };

  const resetAllData = () => {
    if (window.confirm('⚠️ This will delete ALL application data. Are you sure?')) {
      try {
        console.log('🔄 Resetting ALL application data...');
        
        // Use LocalDataContext method if available
        if (clearAllData) {
          clearAllData();
        }
        
        // Additional localStorage cleanup
        const keysToKeep = ['roa_book_content']; // Keep knowledge base
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        });
        
        setResetStatus('✅ All data reset completed');
        setTimeout(() => setResetStatus(''), 3000);
        
        // Reload to apply changes
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error('❌ Error resetting all data:', error);
        setResetStatus('❌ Error resetting all data');
        setTimeout(() => setResetStatus(''), 3000);
      }
    }
  };

  const clearAnalyticsData = () => {
    try {
      console.log('🔄 Clearing analytics data...');
      
      localStorage.removeItem('analyticsData');
      localStorage.removeItem('progressData');
      localStorage.removeItem('happinessData');
      localStorage.removeItem('emotionalNotes');
      
      setResetStatus('✅ Analytics data cleared');
      setTimeout(() => setResetStatus(''), 3000);
    } catch (error) {
      console.error('❌ Error clearing analytics:', error);
      setResetStatus('❌ Error clearing analytics');
      setTimeout(() => setResetStatus(''), 3000);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
      <div
        style={{
          background: 'rgba(0, 128, 0, 0.9)', 
          color: 'white',
          padding: '12px 16px', 
          borderRadius: '12px',
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>⚙️</span>
        <span>Admin</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{
          background: 'rgba(0, 128, 0, 0.9)', 
          color: 'white',
          padding: '20px', 
          borderRadius: '12px', 
          marginTop: '5px',
          minWidth: '320px',
          maxHeight: '70vh',
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>📊 Admin Panel</h3>
          <p>✅ Admin access granted!</p>
          <p><strong>Email:</strong> {currentUser.email}</p>
          <p><strong>Source:</strong> AdminContext</p>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                background: activeTab === 'admin' ? '#4ade80' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'admin' ? 'black' : 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Admin Tools
            </button>
            <button
              onClick={() => setActiveTab('dev')}
              style={{
                background: activeTab === 'dev' ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                color: activeTab === 'dev' ? 'white' : 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              Dev Tools
            </button>
          </div>

          {/* Admin Tab Content */}
          {activeTab === 'admin' && (
            <div>
              <button
                onClick={() => window.open('/analytics', '_blank')}
                style={{
                  background: '#4ade80', 
                  color: 'black',
                  border: 'none', 
                  padding: '10px 15px',
                  borderRadius: '6px', 
                  cursor: 'pointer', 
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                📈 View Analytics
              </button>
              
              <button
                onClick={() => {
                  console.log('Admin Debug Data:', {
                    isAdmin,
                    adminLoading,
                    currentUser,
                    email: currentUser?.email,
                    exactMatch: currentUser?.email === ADMIN_EMAIL,
                    timestamp: new Date().toISOString()
                  });
                  alert('Admin debug data logged to console');
                }}
                style={{
                  background: '#60a5fa', 
                  color: 'white',
                  border: 'none', 
                  padding: '10px 15px',
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🔍 Debug User Data
              </button>
            </div>
          )}

          {/* Dev Tools Tab Content */}
          {activeTab === 'dev' && (
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🚀 Stage Controls</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5, 6].map(stage => (
                  <button
                    key={stage}
                    onClick={() => resetToStage(stage)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: 'white',
                      textAlign: 'center'
                    }}
                  >
                    Stage {stage}
                  </button>
                ))}
              </div>

              <h4 style={{ margin: '15px 0 10px 0', fontSize: '14px' }}>🔄 Reset Controls</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <button
                  onClick={resetOnboarding}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  Reset Onboarding
                </button>
                
                <button
                  onClick={resetTimerData}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  Reset Timer Data
                </button>
                
                <button
                  onClick={clearAnalyticsData}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  Clear Analytics
                </button>
                
                <button
                  onClick={resetAllData}
                  style={{
                    background: 'rgba(220, 38, 127, 0.8)',
                    border: '1px solid rgba(220, 38, 127, 1)',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  ⚠️ Reset All Data
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {resetStatus && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              background: resetStatus.includes('❌') ? 'rgba(220, 38, 127, 0.3)' : 'rgba(34, 197, 94, 0.3)',
              border: `1px solid ${resetStatus.includes('❌') ? 'rgba(220, 38, 127, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px'
            }}>
              {resetStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;