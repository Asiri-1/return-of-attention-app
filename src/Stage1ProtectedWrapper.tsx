// Create this new component: Stage1ProtectedWrapper.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Stage1Wrapper from './Stage1Wrapper';

interface AssessmentWarningPopupProps {
  isVisible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const AssessmentWarningPopup: React.FC<AssessmentWarningPopupProps> = ({ 
  isVisible, 
  onComplete, 
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>⚠️</div>
        
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#333',
          fontSize: '24px'
        }}>
          Self-Assessment Required
        </h3>
        
        <p style={{
          margin: '0 0 24px 0',
          color: '#666',
          lineHeight: '1.5',
          fontSize: '16px'
        }}>
          Please complete your self-assessment before starting practice sessions. 
          This helps us personalize your meditation journey.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onComplete}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Complete Assessment
          </button>
          
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

const Stage1ProtectedWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !currentUser) {
      navigate('/signin');
      return;
    }

    // Check if self-assessment is completed
    if (!currentUser.assessmentCompleted) {
      console.log('🚫 Self-assessment not completed, showing warning');
      setShowWarning(true);
      return;
    }

    console.log('✅ Self-assessment completed, allowing Stage 1 access');
  }, [isAuthenticated, currentUser, navigate]);

  const handleCompleteAssessment = () => {
    setShowWarning(false);
    navigate('/self-assessment');
  };

  const handleCancel = () => {
    setShowWarning(false);
    navigate('/home');
  };

  // Don't render Stage1 if assessment not completed
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  if (!currentUser.assessmentCompleted) {
    return (
      <AssessmentWarningPopup
        isVisible={showWarning}
        onComplete={handleCompleteAssessment}
        onCancel={handleCancel}
      />
    );
  }

  // All checks passed, render Stage 1
  return <Stage1Wrapper />;
};

export default Stage1ProtectedWrapper;