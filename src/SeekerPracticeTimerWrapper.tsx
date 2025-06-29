import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PracticeTimer from './PracticeTimer';

const SeekerPracticeTimerWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { level } = useParams();
  const location = useLocation();
  
  // 🔒 LOCKED T-Level durations - cannot be overridden
  const getTLevelDuration = (tLevel: string): number => {
    const lockedDurations: Record<string, number> = {
      't1': 10,  // T1: Always 10 minutes
      't2': 15,  // T2: Always 15 minutes  
      't3': 20,  // T3: Always 20 minutes
      't4': 25,  // T4: Always 25 minutes
      't5': 30   // T5: Always 30 minutes
    };
    return lockedDurations[tLevel.toLowerCase()] || 10;
  };
  
  // Get state from navigation
  const state = location.state as { 
    level?: string; 
    duration?: number; 
    stageLevel?: string;
    posture?: string 
  } || {};
  
  // Normalize the T-level
  const normalizedLevel = (level || state.level || 't1').toLowerCase();
  
  // 🔒 ALWAYS use locked duration - ignore any passed duration for T-levels
  const lockedDuration = getTLevelDuration(normalizedLevel);
  
  // Format T-level for display
  const tLevel = normalizedLevel.toUpperCase();
  
  // 🔒 LOCKED stage level - built from locked duration
  const lockedStageLevel = `${tLevel}: Physical Stillness for ${lockedDuration} minutes`;
  
  // Get posture from state or default
  const posture = state.posture || sessionStorage.getItem('currentPosture') || 'chair';
  
  // Store current T-level for session tracking
  sessionStorage.setItem('currentTLevel', normalizedLevel);
  sessionStorage.setItem('currentDuration', lockedDuration.toString());
  
  // Update user's current T-level progress
  React.useEffect(() => {
    const updateUserTLevel = () => {
      const currentUserData = localStorage.getItem('currentUser');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        currentUser.currentTLevel = normalizedLevel;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    };
    updateUserTLevel();
  }, [normalizedLevel]);
  
  // 🔍 Debug logging to verify locked durations
  console.log('🔒 T-Level Practice Timer:');
  console.log('- T-Level:', tLevel);
  console.log('- LOCKED Duration:', lockedDuration, 'minutes');
  console.log('- Stage Level:', lockedStageLevel);
  console.log('- Posture:', posture);
  
  return (
    <PracticeTimer 
      initialMinutes={lockedDuration}  // 🔒 Always use locked duration
      stageLevel={lockedStageLevel}     // 🔒 Always use locked stage level
      onComplete={() => navigate('/seeker-practice-complete', { 
        state: { 
          duration: lockedDuration,  // Pass locked duration to completion
          level: tLevel,
          posture,
          stageLevel: lockedStageLevel
        } 
      })}
      onBack={() => navigate('/home')}
    />
  );
};

export default SeekerPracticeTimerWrapper;