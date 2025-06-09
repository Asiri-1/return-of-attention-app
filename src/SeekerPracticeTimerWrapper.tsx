import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PracticeTimer from './PracticeTimer';

const SeekerPracticeTimerWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { level } = useParams();
  const location = useLocation();
  
  // Get duration from location state or use default based on level
  const levelDurations: Record<string, number> = {
    't1': 10,
    't2': 15,
    't3': 20,
    't4': 25,
    't5': 30
  };
  
  // Use state from navigation if available, otherwise use defaults
  const state = location.state as { 
    level?: string; 
    duration?: number; 
    stageLevel?: string;
    posture?: string 
  } || {};
  
  // Ensure level is properly normalized to lowercase for lookup
  const normalizedLevel = level?.toLowerCase() || 't1';
  
  // Get duration from state, level parameter, or default to 10
  const duration = state.duration || levelDurations[normalizedLevel] || 10;
  
  // Ensure T-level is properly formatted for display
  const tLevel = level?.toUpperCase() || 'T1';
  
  // Get stage level from state or construct it
  const stageLevel = state.stageLevel || `${tLevel}: Physical Stillness for ${duration} minutes`;
  
  // Get posture from state, session storage, or default
  const posture = state.posture || sessionStorage.getItem('currentPosture') || 'unknown';
  
  // Store the current level in sessionStorage for future reference
  sessionStorage.setItem('currentTLevel', normalizedLevel);
  
  // Also update the user's current T-level in localStorage for returning users
  const updateUserTLevel = () => {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      currentUser.currentTLevel = normalizedLevel;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  };
  
  // Update user data when component mounts
  React.useEffect(() => {
    updateUserTLevel();
  }, []);
  
  return (
    <PracticeTimer 
      initialMinutes={duration}
      stageLevel={stageLevel}
      onComplete={() => navigate('/seeker-practice-complete', { 
        state: { 
          duration,
          level: tLevel,
          posture // Include posture data in the session
        } 
      })}
      onBack={() => navigate('/home')}
    />
  );
};

export default SeekerPracticeTimerWrapper;
