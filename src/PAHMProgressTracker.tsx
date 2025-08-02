import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './firebase';
// Import CSS only if the file exists, otherwise remove this line
// import './PAHMProgressTracker.css';

interface PAHMProgressTrackerProps {
  currentStage: number;
}

interface StageData {
  [key: string]: number;
}

interface StageCompletion {
  [key: string]: boolean;
}

const PAHMProgressTracker: React.FC<PAHMProgressTrackerProps> = ({ currentStage }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // State to track hours completed for each stage
  const [stageHours, setStageHours] = useState<StageData>({
    stage2: 0,
    stage3: 0,
    stage4: 0,
    stage5: 0,
    stage6: 0
  });
  
  // State to track completion status
  const [stageComplete, setStageComplete] = useState<StageCompletion>({
    stage2: false,
    stage3: false,
    stage4: false,
    stage5: false,
    stage6: false
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load hours and completion status from Firestore on component mount
  useEffect(() => {
    const loadUserProgressData = async () => {
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Reference to user's document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Load stage hours with fallback to 0
          const hoursData: StageData = {
            stage2: userData.stage2Hours || 0,
            stage3: userData.stage3Hours || 0,
            stage4: userData.stage4Hours || 0,
            stage5: userData.stage5Hours || 0,
            stage6: userData.stage6Hours || 0
          };

          // Load completion status with fallback to false
          const completionData: StageCompletion = {
            stage2: userData.stage2Complete || false,
            stage3: userData.stage3Complete || false,
            stage4: userData.stage4Complete || false,
            stage5: userData.stage5Complete || false,
            stage6: userData.stage6Complete || false
          };

          setStageHours(hoursData);
          setStageComplete(completionData);
        } else {
          // User document doesn't exist, create it with default values
          const defaultData = {
            stage2Hours: 0,
            stage3Hours: 0,
            stage4Hours: 0,
            stage5Hours: 0,
            stage6Hours: 0,
            stage2Complete: false,
            stage3Complete: false,
            stage4Complete: false,
            stage5Complete: false,
            stage6Complete: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await setDoc(userDocRef, defaultData, { merge: true });
          
          setStageHours({
            stage2: 0,
            stage3: 0,
            stage4: 0,
            stage5: 0,
            stage6: 0
          });
          
          setStageComplete({
            stage2: false,
            stage3: false,
            stage4: false,
            stage5: false,
            stage6: false
          });
        }
      } catch (err) {
        console.error('Error loading user progress data:', err);
        setError('Failed to load progress data. Please try refreshing the page.');
        
        // Fallback to default values on error
        setStageHours({
          stage2: 0,
          stage3: 0,
          stage4: 0,
          stage5: 0,
          stage6: 0
        });
        
        setStageComplete({
          stage2: false,
          stage3: false,
          stage4: false,
          stage5: false,
          stage6: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProgressData();
  }, [user, authLoading]);

  // Function to update stage hours in Firestore
  const updateStageHours = async (stageKey: string, hours: number) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        [`${stageKey}Hours`]: hours,
        updatedAt: new Date()
      };

      await updateDoc(userDocRef, updateData);
      
      // Update local state
      setStageHours(prev => ({
        ...prev,
        [stageKey]: hours
      }));
    } catch (err) {
      console.error(`Error updating ${stageKey} hours:`, err);
      setError('Failed to save progress. Please try again.');
    }
  };

  // Function to update stage completion in Firestore
  const updateStageCompletion = async (stageKey: string, isComplete: boolean) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        [`${stageKey}Complete`]: isComplete,
        updatedAt: new Date()
      };

      await updateDoc(userDocRef, updateData);
      
      // Update local state
      setStageComplete(prev => ({
        ...prev,
        [stageKey]: isComplete
      }));
    } catch (err) {
      console.error(`Error updating ${stageKey} completion:`, err);
      setError('Failed to save completion status. Please try again.');
    }
  };

  // Format hours display
  const formatHours = (hours: number): string => {
    return hours.toFixed(1);
  };
  
  // Calculate progress percentage (capped at 100%)
  const calculateProgress = (hours: number): number => {
    return Math.min(100, (hours / 15) * 100);
  };
  
  // Get stage name
  const getStageName = (stageNumber: number): string => {
    switch(stageNumber) {
      case 2: return 'PAHM Trainee';
      case 3: return 'PAHM Beginner';
      case 4: return 'PAHM Practitioner';
      case 5: return 'PAHM Master';
      case 6: return 'PAHM Illuminator';
      default: return '';
    }
  };
  
  // Determine if a stage is unlocked
  const isStageUnlocked = (stageNumber: number): boolean => {
    if (stageNumber === 2) return true; // First PAHM stage is always unlocked
    return stageComplete[`stage${stageNumber - 1}`] || currentStage >= stageNumber;
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="pahm-progress-tracker">
        <h3>PAHM Practice Progress</h3>
        <div className="loading-message">Loading your progress...</div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="pahm-progress-tracker">
        <h3>PAHM Practice Progress</h3>
        <div className="error-message">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated
  if (!user) {
    return (
      <div className="pahm-progress-tracker">
        <h3>PAHM Practice Progress</h3>
        <div className="auth-message">Please sign in to track your progress.</div>
      </div>
    );
  }
  
  return (
    <div className="pahm-progress-tracker">
      <h3>PAHM Practice Progress</h3>
      <p className="progress-description">Each PAHM stage requires 15 hours of practice to complete.</p>
      
      <div className="stage-progress-list">
        {[2, 3, 4, 5, 6].map(stageNumber => {
          const stageKey = `stage${stageNumber}` as keyof typeof stageHours;
          const hours = stageHours[stageKey];
          const isComplete = stageComplete[stageKey];
          const isUnlocked = isStageUnlocked(stageNumber);
          const isCurrent = currentStage === stageNumber;
          
          return (
            <div 
              key={stageNumber}
              className={`stage-progress-item ${isComplete ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`}
            >
              <div className="stage-header">
                <div className="stage-number">{stageNumber}</div>
                <div className="stage-name">{getStageName(stageNumber)}</div>
                <div className="stage-hours">
                  {formatHours(hours)}/15 hours
                  {isComplete && <span className="completion-check">✓</span>}
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${calculateProgress(hours)}%` }}
                />
              </div>
              
              {!isUnlocked && (
                <div className="lock-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PAHMProgressTracker;