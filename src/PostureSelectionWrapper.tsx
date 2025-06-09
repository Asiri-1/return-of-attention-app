import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostureSelection from './PostureSelection';

interface PostureSelectionWrapperProps {
  stageNumber: number;
}

const PostureSelectionWrapper: React.FC<PostureSelectionWrapperProps> = ({ stageNumber }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/home');
  };
  
  const handleStartPractice = (selectedPosture: string) => {
    // Store the selected posture in session storage for this practice session
    sessionStorage.setItem('currentPosture', selectedPosture);
    
    // Navigate to the appropriate timer based on stage number
    if (stageNumber === 1) {
      // For Stage One (Seeker), navigate to the appropriate T-level practice
      // Get the current T-level from localStorage or sessionStorage, default to T1
      const currentUserData = localStorage.getItem('currentUser');
      let level = 't1';
      let duration = 10; // Default duration for T1
      
      // Check if we have level and duration in location state first (from direct T-level click)
      const locationState = window.history.state?.usr || {};
      if (locationState.level && locationState.duration) {
        level = locationState.level.toLowerCase();
        duration = locationState.duration;
      } else if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        // Use the user's saved T-level if available, otherwise default to T1
        level = currentUser.currentTLevel || 't1';
        
        // Set duration based on level
        switch(level) {
          case 't1': duration = 10; break;
          case 't2': duration = 15; break;
          case 't3': duration = 20; break;
          case 't4': duration = 25; break;
          case 't5': duration = 30; break;
          default: duration = 10;
        }
      } else {
        // Fallback to session storage if available
        const sessionLevel = sessionStorage.getItem('currentTLevel');
        if (sessionLevel) {
          level = sessionLevel;
          
          // Set duration based on level
          switch(level) {
            case 't1': duration = 10; break;
            case 't2': duration = 15; break;
            case 't3': duration = 20; break;
            case 't4': duration = 25; break;
            case 't5': duration = 30; break;
            default: duration = 10;
          }
        }
      }
      
      // Store the current level in sessionStorage for this session
      sessionStorage.setItem('currentTLevel', level);
      
      // Format the level for display (e.g., 't1' to 'T1')
      const displayLevel = level.toUpperCase();
      
      // Navigate to the seeker practice timer with all necessary state
      navigate('/seeker-practice-timer', { 
        state: { 
          posture: selectedPosture,
          level: level,
          duration: duration,
          stageLevel: `${displayLevel}: Physical Stillness for ${duration} minutes`
        } 
      });
    } else {
      // For PAHM stages (2-6), navigate to the PAHM practice timer
      // Get the stage title based on stage number
      let stageTitle = 'PAHM Practice';
      switch (stageNumber) {
        case 2:
          stageTitle = 'PAHM Trainee';
          break;
        case 3:
          stageTitle = 'PAHM Beginner';
          break;
        case 4:
          stageTitle = 'PAHM Practitioner';
          break;
        case 5:
          stageTitle = 'PAHM Master';
          break;
        case 6:
          stageTitle = 'PAHM Illuminator';
          break;
      }
      
      navigate('/pahm-practice', { 
        state: { 
          stage: stageNumber,
          stageLevel: `${stageTitle} Practice`,
          posture: selectedPosture 
        } 
      });
    }
  };
  
  return (
    <PostureSelection
      onBack={handleBack}
      onStartPractice={handleStartPractice}
      stageNumber={stageNumber}
    />
  );
};

export default PostureSelectionWrapper;
