import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';

interface PostureSelectionWrapperProps {
  stageNumber: number;
}

const PostureSelectionWrapper: React.FC<PostureSelectionWrapperProps> = ({ stageNumber }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { getCurrentStage } = usePractice();

  const handleBack = () => {
    navigate('/home');
  };

  const handleStartPractice = (selectedPosture: string) => {
    if (stageNumber === 1) {
      // ✅ FIREBASE-ONLY: Get T-level from user profile or location state
      const locationState = window.history.state?.usr || {};
      let level = 't1';
      let duration = 10;

      if (locationState.level && locationState.duration) {
        level = locationState.level.toLowerCase();
        duration = locationState.duration;
      } else if (userProfile?.customFields?.currentTLevel) {
        // ✅ Get from Firebase user profile
        level = userProfile.customFields.currentTLevel;
        
        switch(level) {
          case 't1': duration = 10; break;
          case 't2': duration = 15; break;
          case 't3': duration = 20; break;
          case 't4': duration = 25; break;
          case 't5': duration = 30; break;
          default: duration = 10;
        }
      } else {
        // ✅ Get from PracticeContext current stage
        const currentStage = getCurrentStage();
        level = `t${currentStage}`;
        
        switch(level) {
          case 't1': duration = 10; break;
          case 't2': duration = 15; break;
          case 't3': duration = 20; break;
          case 't4': duration = 25; break;
          case 't5': duration = 30; break;
          default: duration = 10;
        }
      }

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
      // ✅ PAHM Practice stages (unchanged)
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

    // ✅ Check location state first
    const locationState = window.history.state?.usr || {};
    if (locationState.level) {
      return locationState.level.toUpperCase();
    }

    // ✅ FIREBASE-ONLY: Get from user profile
    if (userProfile?.customFields?.currentTLevel) {
      return userProfile.customFields.currentTLevel.toUpperCase();
    }

    // ✅ FIREBASE-ONLY: Get from PracticeContext
    const currentStage = getCurrentStage();
    return `T${currentStage}`;
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