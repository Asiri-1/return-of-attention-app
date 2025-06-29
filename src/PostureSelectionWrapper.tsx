import React from 'react';
import { useNavigate } from 'react-router-dom';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';

interface PostureSelectionWrapperProps {
  stageNumber: number;
}

const PostureSelectionWrapper: React.FC<PostureSelectionWrapperProps> = ({ stageNumber }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/home');
  };
  
  const handleStartPractice = (selectedPosture: string) => {
    sessionStorage.setItem('currentPosture', selectedPosture);
    
    if (stageNumber === 1) {
      const currentUserData = localStorage.getItem('currentUser');
      let level = 't1';
      let duration = 10;
      
      const locationState = window.history.state?.usr || {};
      if (locationState.level && locationState.duration) {
        level = locationState.level.toLowerCase();
        duration = locationState.duration;
      } else if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        level = currentUser.currentTLevel || 't1';
        
        switch(level) {
          case 't1': duration = 10; break;
          case 't2': duration = 15; break;
          case 't3': duration = 20; break;
          case 't4': duration = 25; break;
          case 't5': duration = 30; break;
          default: duration = 10;
        }
      } else {
        const sessionLevel = sessionStorage.getItem('currentTLevel');
        if (sessionLevel) {
          level = sessionLevel;
          
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
      
      sessionStorage.setItem('currentTLevel', level);
      const displayLevel = level.toUpperCase();
      
      navigate('/seeker-practice-timer', { 
        state: { 
          posture: selectedPosture,
          level: level,
          duration: duration,
          stageLevel: `${displayLevel}: Physical Stillness for ${duration} minutes`
        } 
      });
    } else {
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

  const getCurrentTLevel = (): string | undefined => {
    if (stageNumber !== 1) return undefined;
    
    const locationState = window.history.state?.usr || {};
    if (locationState.level) {
      return locationState.level.toUpperCase();
    }
    
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      return currentUser.currentTLevel?.toUpperCase() || 'T1';
    }
    
    const sessionLevel = sessionStorage.getItem('currentTLevel');
    return sessionLevel?.toUpperCase() || 'T1';
  };
  
  return (
    <UniversalPostureSelection
      onBack={handleBack}
      onStartPractice={handleStartPractice}
      stageNumber={stageNumber}
      currentTLevel={getCurrentTLevel()}
    />
  );
};

export default PostureSelectionWrapper;