import React from 'react';
import { useNavigate } from 'react-router-dom';
import MindRecoveryHub from './MindRecoveryHub';

const MindRecoverySelectionWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  const handleExerciseSelect = (exerciseId: string) => {
    console.log(`MindRecoveryHub: Attempting to navigate to /mind-recovery/${exerciseId}`);
    navigate(`/mind-recovery/${exerciseId}`);
  };

  return (
    <MindRecoveryHub 
      onBack={handleBack}
      onExerciseSelect={handleExerciseSelect}
      userData={undefined}
    />
  );
};

export default MindRecoverySelectionWrapper;