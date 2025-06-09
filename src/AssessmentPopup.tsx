import React from 'react';
import './AssessmentPopup.css';

interface AssessmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToAssessment: () => void;
}

const AssessmentPopup: React.FC<AssessmentPopupProps> = ({
  isOpen,
  onClose,
  onGoToAssessment
}) => {
  if (!isOpen) return null;

  return (
    <div className="assessment-popup-overlay">
      <div className="assessment-popup">
        <div className="assessment-popup-header">
          <h2>Complete Your Self-Assessment</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="assessment-popup-content">
          <p>
            To access this practice level, please complete your self-assessment first.
            This helps us personalize your meditation journey.
          </p>
          <div className="assessment-popup-actions">
            <button className="secondary-button" onClick={onClose}>
              Later
            </button>
            <button className="primary-button" onClick={onGoToAssessment}>
              Go to Self-Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPopup;
