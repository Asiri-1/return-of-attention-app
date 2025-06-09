import React from 'react';
import { useNavigate } from 'react-router-dom';
import MindRecoverySelection from './MindRecoverySelection';

const MindRecoverySelectionWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <MindRecoverySelection onBack={handleBack} />
  );
};

export default MindRecoverySelectionWrapper;

