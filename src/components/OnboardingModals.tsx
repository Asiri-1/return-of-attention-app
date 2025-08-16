// ===============================================
// 🔧 ENHANCED OnboardingModals.tsx - FIREBASE INTEGRATION
// ===============================================

// FILE: src/components/OnboardingModals.tsx
// ✅ ENHANCED: Firebase integration with contexts
// ✅ ENHANCED: Real-time data awareness
// ✅ ENHANCED: Hours-based stage progression messaging
// ✅ ENHANCED: Authentication guards

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';
import { useUser } from '../contexts/user/UserContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';

// ✅ Common modal interface
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ Base Modal Styles (enhanced for better UX)
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
  boxSizing: 'border-box',
  animation: 'modalFadeIn 0.3s ease-out'
};

const modalContentStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '20px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
  animation: 'modalSlideIn 0.3s ease-out'
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

// ✅ Base Modal Component with enhanced error handling
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

// ✅ ENHANCED: Questionnaire Modal with Firebase integration
export const QuestionnaireForHappinessModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isQuestionnaireCompleted } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!currentUser) {
      console.warn('⚠️ No authenticated user for questionnaire');
      return;
    }

    try {
      setIsLoading(true);
      onClose();
      
      // Check if already completed
      const completed = await isQuestionnaireCompleted();
      if (completed) {
        console.log('✅ Questionnaire already completed');
        return;
      }

      console.log('🚀 Navigating to questionnaire for happiness tracking setup');
      navigate('/questionnaire', { 
        state: { 
          returnTo: window.location.pathname,
          purpose: 'happiness-tracking'
        } 
      });
    } catch (error) {
      console.error('❌ Error checking questionnaire status:', error);
      navigate('/questionnaire', { state: { returnTo: window.location.pathname } });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, navigate, onClose, isQuestionnaireCompleted]);

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
          This helps us personalize your meditation experience and track your progress. 
          <strong> Stage access is based on hours of practice</strong> - you can practice any stage once you complete the prerequisites.
        </p>
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '16px',
          margin: '20px 0',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <strong>Note:</strong> You can practice immediately without this, but happiness tracking provides valuable insights into your progress and well-being improvements.
          </div>
        </div>
      </div>
      
      <div style={modalActionsStyle}>
        <button 
          style={{
            ...primaryButtonStyle,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }} 
          onClick={handleComplete}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Complete Profile'}
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ ENHANCED: Self Assessment Modal with Firebase integration
export const SelfAssessmentForHappinessModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isSelfAssessmentCompleted } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = useCallback(async () => {
    if (!currentUser) {
      console.warn('⚠️ No authenticated user for self-assessment');
      return;
    }

    try {
      setIsLoading(true);
      onClose();
      
      // Check if already completed
      const completed = await isSelfAssessmentCompleted();
      if (completed) {
        console.log('✅ Self-assessment already completed');
        return;
      }

      console.log('🚀 Navigating to self-assessment for enhanced happiness tracking');
      navigate('/self-assessment', { 
        state: { 
          returnTo: window.location.pathname,
          purpose: 'happiness-tracking-enhancement'
        } 
      });
    } catch (error) {
      console.error('❌ Error checking self-assessment status:', error);
      navigate('/self-assessment', { state: { returnTo: window.location.pathname } });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, navigate, onClose, isSelfAssessmentCompleted]);

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
          This assessment helps us understand your meditation experience and provide better progress analytics. 
          <strong> All stages remain accessible based on practice hours completed.</strong>
        </p>
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '16px',
          margin: '20px 0',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <strong>Benefits:</strong> Personalized recommendations, detailed progress insights, and customized meditation suggestions based on your unique profile.
          </div>
        </div>
      </div>
      
      <div style={modalActionsStyle}>
        <button 
          style={{
            ...primaryButtonStyle,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }} 
          onClick={handleComplete}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Take Assessment'}
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ ENHANCED: Progress Required Modal with Firebase-aware messaging
interface ProgressRequiredModalProps extends ModalProps {
  requirement: string;
  currentProgress?: string;
}

export const ProgressRequiredModal: React.FC<ProgressRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  requirement,
  currentProgress
}) => {
  const navigate = useNavigate();

  const handleStartPracticing = useCallback(() => {
    onClose();
    navigate('/stage1');
  }, [navigate, onClose]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div style={modalHeaderStyle}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#2c3e50', textAlign: 'center' }}>
          🔒 Practice More to Unlock
        </h2>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📈</div>
        <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50', margin: '0 0 15px 0' }}>
          {requirement || 'Complete more practice hours to unlock this stage.'}
        </p>
        {currentProgress && (
          <div style={{
            background: '#f0f8ff',
            borderRadius: '12px',
            padding: '16px',
            margin: '20px 0',
            border: '1px solid #e1f5fe'
          }}>
            <div style={{ fontSize: '14px', color: '#1976d2', fontWeight: '600' }}>
              Your Progress: {currentProgress}
            </div>
          </div>
        )}
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          Each stage builds upon the previous one. Consistent practice helps develop the skills needed for advanced techniques.
        </p>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={handleStartPracticing}>
          Continue Practicing
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Got It
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ ENHANCED: Stage Access Modal with hours-based progression
interface StageAccessModalProps extends ModalProps {
  requirement: string;
  targetStage: number;
  currentHours?: number;
  requiredHours?: number;
}

export const StageAccessModal: React.FC<StageAccessModalProps> = ({ 
  isOpen, 
  onClose, 
  requirement,
  targetStage,
  currentHours,
  requiredHours 
}) => {
  const navigate = useNavigate();
  const { getTotalPracticeHours } = usePractice();

  const actualCurrentHours = currentHours ?? getTotalPracticeHours();
  const actualRequiredHours = requiredHours ?? [5, 10, 15, 20, 25, 30][targetStage - 1] ?? 5;

  const handleStartPracticing = useCallback(() => {
    onClose();
    if (targetStage === 2) {
      // For Stage 2, go to Stage 1 to complete T5
      navigate('/stage1');
    } else {
      // For other stages, go to the previous stage
      navigate(`/stage${targetStage - 1}`);
    }
  }, [navigate, onClose, targetStage]);

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
          {requirement || `Complete ${actualRequiredHours} practice hours to unlock Stage ${targetStage}.`}
        </p>
        
        {/* Progress indicator */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          margin: '20px 0'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50', marginBottom: '10px' }}>
            Your Progress
          </div>
          <div style={{
            background: '#e9ecef',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '100%',
              width: `${Math.min((actualCurrentHours / actualRequiredHours) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {actualCurrentHours.toFixed(1)} / {actualRequiredHours} hours ({Math.round((actualCurrentHours / actualRequiredHours) * 100)}%)
          </div>
        </div>

        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          Each PAHM stage builds upon the previous one for optimal progression. 
          <strong> You need {(actualRequiredHours - actualCurrentHours).toFixed(1)} more hours</strong> to unlock Stage {targetStage}.
        </p>
      </div>
      
      <div style={modalActionsStyle}>
        <button style={primaryButtonStyle} onClick={handleStartPracticing}>
          Continue Practicing
        </button>
        <button style={secondaryButtonStyle} onClick={onClose}>
          Understood
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ ENHANCED: Welcome Modal with Firebase-aware guidance
export const WelcomeToHappinessTrackingModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isQuestionnaireCompleted } = useOnboarding();
  const { getTotalPracticeHours } = usePractice();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuestionnaire = useCallback(async () => {
    if (!currentUser) {
      console.warn('⚠️ No authenticated user');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if already completed
      const completed = await isQuestionnaireCompleted();
      if (completed) {
        console.log('✅ Questionnaire already completed, going to assessment');
        navigate('/self-assessment');
      } else {
        navigate('/questionnaire');
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error checking questionnaire status:', error);
      navigate('/questionnaire');
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, navigate, onClose, isQuestionnaireCompleted]);

  const handleStartPracticing = useCallback(() => {
    onClose();
    navigate('/stage1');
  }, [navigate, onClose]);

  const currentHours = getTotalPracticeHours();

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
          You can start practicing immediately!
        </p>
        <p style={{ fontSize: '16px', color: '#7f8c8d', margin: '0 0 25px 0' }}>
          • <strong>Practice Access:</strong> Start with T1-T5 (Stage 1) anytime<br/>
          • <strong>Stage Progression:</strong> Hours-based unlock system (5, 10, 15, 20, 25, 30 hours)<br/>
          • <strong>Happiness Tracking:</strong> Optional profile setup for personalized insights
        </p>
        
        {currentHours > 0 && (
          <div style={{
            background: '#f0f8ff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid #e1f5fe'
          }}>
            <div style={{ fontSize: '14px', color: '#1976d2', fontWeight: '600' }}>
              Welcome back! You have {currentHours.toFixed(1)} practice hours completed.
            </div>
          </div>
        )}

        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Quick Start Options:</h4>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
            ✅ Practice T1-T5 immediately (Stage 1)<br/>
            📊 Complete profile for happiness tracking<br/>
            🎯 Take assessment for enhanced insights<br/>
            🔓 Unlock stages by completing practice hours
          </div>
        </div>
      </div>
      
      <div style={modalActionsStyle}>
        <button 
          style={{
            ...primaryButtonStyle,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }} 
          onClick={handleStartQuestionnaire}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Set Up Profile'}
        </button>
        <button style={secondaryButtonStyle} onClick={handleStartPracticing}>
          Start Practicing Now
        </button>
      </div>
    </BaseModal>
  );
};

// ✅ Export legacy names for backward compatibility
export const QuestionnaireRequiredModal = QuestionnaireForHappinessModal;
export const SelfAssessmentRequiredModal = SelfAssessmentForHappinessModal;

// ✅ Add CSS animations
const modalStyles = `
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { 
    opacity: 0; 
    transform: translateY(-50px) scale(0.9); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}
`;

// ✅ Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);
}