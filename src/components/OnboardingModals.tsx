// ✅ Corrected OnboardingModals.tsx - Sequential Logic Only
// File: src/components/OnboardingModals.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ Common modal interface
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ Base Modal Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '20px',
  boxSizing: 'border-box'
};

const modalContentStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative'
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '30px 30px 20px',
  borderBottom: '1px solid #f0f0f0',
  position: 'relative'
};

const modalBodyStyle: React.CSSProperties = {
  padding: '30px',
  textAlign: 'center'
};

const modalActionsStyle: React.CSSProperties = {
  padding: '0 30px 30px',
  display: 'flex',
  gap: '15px',
  flexDirection: 'column'
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '16px 24px',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.2s ease'
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: '16px 24px',
  border: '2px solid #e9ecef',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  background: '#f8f9fa',
  color: '#7f8c8d',
  transition: 'all 0.2s ease'
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'none',
  border: 'none',
  fontSize: '28px',
  color: '#95a5a6',
  cursor: 'pointer',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  transition: 'all 0.2s ease'
};

// ✅ Base Modal Component
const BaseModal: React.FC<ModalProps & { children: React.ReactNode }> = ({ 
  isOpen, 
  onClose, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

// ✅ FIXED: Questionnaire Modal (for happiness tracking only, not stage access)
export const QuestionnaireForHappinessModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleComplete = () => {
    onClose();
    navigate('/questionnaire', { state: { returnTo: window.location.pathname } });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50', textAlign: 'center' }}>
          📊 Enable Happiness Tracking
        </h2>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: '0 0 15px 0' }}>
          Complete your profile questionnaire to enable happiness tracking.
        </p>
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          This helps us personalize your meditation experience and track your progress. Stage access is based on sequential completion, but happiness tracking requires this setup.
        </p>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={handleComplete}>
          Complete Profile
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ FIXED: Self Assessment Modal (for happiness tracking only, not stage access)
export const SelfAssessmentForHappinessModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleComplete = () => {
    onClose();
    navigate('/self-assessment', { state: { returnTo: window.location.pathname } });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50', textAlign: 'center' }}>
          📊 Enhanced Happiness Tracking
        </h2>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎯</div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: '0 0 15px 0' }}>
          Complete your self-assessment for enhanced happiness tracking and personalized insights.
        </p>
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          This assessment helps us understand your meditation experience and provide better progress analytics. All stages remain accessible based on sequential completion.
        </p>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={handleComplete}>
          Take Assessment
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ Progress Required Modal (for T-stage progression) - CORRECT
interface ProgressRequiredModalProps extends ModalProps {
  requirement: string;
}

export const ProgressRequiredModal: React.FC<ProgressRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  requirement 
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50', textAlign: 'center' }}>
          🔒 Progress Required
        </h2>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: '0 0 15px 0' }}>
          {requirement || 'Complete previous practices to unlock this stage.'}
        </p>
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          Consistent practice helps build a strong foundation for advanced techniques.
        </p>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={onClose}>
          Got It
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ Stage Access Modal (for PAHM stages) - CORRECT
interface StageAccessModalProps extends ModalProps {
  requirement: string;
  targetStage: number;
}

export const StageAccessModal: React.FC<StageAccessModalProps> = ({ 
  isOpen, 
  onClose, 
  requirement,
  targetStage 
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50', textAlign: 'center' }}>
          🔒 Stage {targetStage} Locked
        </h2>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧘</div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: '0 0 15px 0' }}>
          {requirement || 'Complete previous stage to unlock this practice.'}
        </p>
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          Each PAHM stage builds upon the previous one for optimal progression.
        </p>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={onClose}>
          Understood
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ NEW: Welcome Modal for happiness tracking guidance
export const WelcomeToHappinessTrackingModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleStartQuestionnaire = () => {
    onClose();
    navigate('/questionnaire');
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50', textAlign: 'center' }}>
          🌟 Welcome to Your Meditation Journey
        </h2>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧘</div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: '0 0 15px 0' }}>
          You can start practicing immediately with any stage!
        </p>
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          • <strong>Stage Access:</strong> Sequential progression (complete Stage 1 → unlock Stage 2)<br/>
          • <strong>Happiness Tracking:</strong> Complete questionnaire + assessment for personalized insights
        </p>
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Quick Start Options:</h4>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
            ✅ Practice T1-T5 immediately<br/>
            📊 Complete profile for happiness tracking<br/>
            🎯 Take assessment for enhanced insights
          </div>
        </div>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={handleStartQuestionnaire}>
          Set Up Profile
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Start Practicing
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ Export legacy names for backward compatibility (but redirect to new logic)
export const QuestionnaireRequiredModal = QuestionnaireForHappinessModal;
export const SelfAssessmentRequiredModal = SelfAssessmentForHappinessModal;