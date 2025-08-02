import React, { useCallback, useEffect } from 'react';

interface PAHMBeginnerPracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * ✅ FIREBASE ENHANCED: PAHMBeginnerPracticeRecorder 
 * 
 * This component handles recording of PAHM Beginner practice sessions with Firebase integration.
 * Enhanced to work with Firebase-enabled contexts while maintaining full backward compatibility.
 * 
 * AUDIT COMPLIANCE:
 * ✅ PAHM Session Data (stage3Sessions) - Enhanced for Firebase compatibility
 * ✅ Stage Completion Flags (stage3Complete) - Ready for Firebase tracking
 * ✅ Enhanced session data format for better analytics
 * ✅ Maintains 100% backward compatibility
 */
const PAHMBeginnerPracticeRecorder: React.FC<PAHMBeginnerPracticeRecorderProps> = ({ onRecordSession }) => {
  
  // ✅ FIREBASE READY: Enhanced session recording with Firebase-compatible data
  const recordSession = useCallback(async (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    // ✅ ENHANCED: Firebase-compatible session data structure
    const sessionData = {
      stage: 3,
      stageName: 'PAHM Beginner',
      targetDuration: duration,
      timeSpent: timeSpent,
      actualDuration: timeSpent, // ✅ Enhanced for analytics
      isCompleted: isCompleted,
      pahmCounts: pahmCounts,
      timestamp: new Date().toISOString(),
      
      // ✅ FIREBASE ENHANCEMENTS: Additional fields for cloud storage
      sessionType: 'pahm_beginner',
      quality: isCompleted ? 4 : 2,
      notes: `PAHM Beginner session: ${isCompleted ? 'Completed' : 'Partial'}`,
      userId: getCurrentUserId(), // ✅ User tracking for Firebase
      deviceInfo: getDeviceInfo(), // ✅ Device tracking
      
      // ✅ AUDIT COMPLIANCE: Enhanced metadata
      firestoreReady: true,
      version: '2.0'
    };
    
    try {
      // ✅ ENHANCED: Try to use Firebase-enabled contexts if available
      const practiceContext = getPracticeContext();
      const userContext = getUserContext();
      
      // ✅ FIREBASE INTEGRATION: Save to Firebase if contexts available
      if (practiceContext?.addPracticeSession) {
        await practiceContext.addPracticeSession(sessionData);
        console.log('✅ PAHM session saved to Firebase');
      }
      
      // ✅ FIREBASE INTEGRATION: Track stage progress if context available
      if (userContext && isCompleted) {
        const hoursSpent = timeSpent / 60;
        if (userContext.addStageHours) {
          await userContext.addStageHours(3, hoursSpent);
        }
        if (userContext.markStageComplete) {
          await userContext.markStageComplete(3);
        }
        console.log('✅ Stage 3 progress tracked in Firebase');
      }
      
      // ✅ AUDIT COMPLIANCE: Store session data in localStorage (backward compatibility)
      const previousSessions = JSON.parse(localStorage.getItem('stage3Sessions') || '[]');
      localStorage.setItem('stage3Sessions', JSON.stringify([...previousSessions, sessionData]));
      
      // ✅ Always record the session data regardless of completion
      sessionStorage.setItem('lastPAHMSession', JSON.stringify(sessionData));
      
      // ✅ If session was fully completed, mark Stage 3 as complete for progression
      if (isCompleted) {
        localStorage.setItem('stage3Complete', 'true');
        sessionStorage.setItem('stageProgress', '3');
      }
      
      // ✅ Pass session data to parent component
      onRecordSession(sessionData);
      
    } catch (error) {
      console.error('❌ Error with enhanced session recording:', error);
      
      // ✅ FALLBACK: Original localStorage-only functionality
      try {
        // ✅ BACKWARD COMPATIBILITY: Original session data format
        const fallbackSessionData = {
          stage: 3,
          stageName: 'PAHM Beginner',
          targetDuration: duration,
          timeSpent: timeSpent,
          isCompleted: isCompleted,
          pahmCounts: pahmCounts,
          timestamp: new Date().toISOString()
        };
        
        const previousSessions = JSON.parse(localStorage.getItem('stage3Sessions') || '[]');
        localStorage.setItem('stage3Sessions', JSON.stringify([...previousSessions, fallbackSessionData]));
        sessionStorage.setItem('lastPAHMSession', JSON.stringify(fallbackSessionData));
        
        if (isCompleted) {
          localStorage.setItem('stage3Complete', 'true');
          sessionStorage.setItem('stageProgress', '3');
        }
        
        console.log('⚠️ PAHM session saved with localStorage fallback');
        onRecordSession(fallbackSessionData);
        
      } catch (fallbackError) {
        console.error('❌ Complete PAHM session save failure:', fallbackError);
        alert('Failed to save practice session. Please try again.');
      }
    }
  }, [onRecordSession]);
  
  // ✅ BACKWARD COMPATIBILITY: Attach recordSession to window for legacy components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).recordPAHMSession = recordSession;
      
      // ✅ ENHANCED: Also expose enhanced recording method
      (window as any).recordEnhancedPAHMSession = recordSession;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).recordPAHMSession;
        delete (window as any).recordEnhancedPAHMSession;
      }
    };
  }, [recordSession]);
  
  // This component doesn't render anything visible
  return null;
};

// ✅ HELPER FUNCTIONS: Firebase integration utilities
function getCurrentUserId(): string {
  try {
    // Try to get user ID from various sources
    if (typeof window !== 'undefined') {
      const user = (window as any).currentUser;
      if (user?.uid) return user.uid;
      
      // Fallback to localStorage
      const stored = localStorage.getItem('currentUserId');
      if (stored) return stored;
    }
    return 'anonymous';
  } catch (error) {
    return 'anonymous';
  }
}

function getDeviceInfo(): any {
  try {
    if (typeof window !== 'undefined') {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      };
    }
    return {};
  } catch (error) {
    return {};
  }
}

function getPracticeContext(): any {
  try {
    // Try to access global practice context
    if (typeof window !== 'undefined') {
      return (window as any).practiceContext;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function getUserContext(): any {
  try {
    // Try to access global user context
    if (typeof window !== 'undefined') {
      return (window as any).userContext;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// ✅ ENHANCED: Export both default and named exports for flexibility
export default PAHMBeginnerPracticeRecorder;
export { PAHMBeginnerPracticeRecorder };