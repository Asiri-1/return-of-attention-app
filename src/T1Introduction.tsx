// ✅ FIXED T1Introduction - Navigate to Posture Selection First
// File: src/T1Introduction.tsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './StageLevelIntroduction.css';

const T1Introduction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Get state passed from Stage1Wrapper
  const state = location.state as {
    tLevel?: string;
    duration?: number;
    level?: string;
    stageLevel?: number;
    returnTo?: string;
  } | null;

  console.log('🔥 T1Introduction - Received state:', state);

  const stageTitle = "Seeker: Physical Readiness";
  const stageDescription = "Develop physical foundation through progressive stillness training from 10 to 30 minutes.";

  // ✅ FIXED: Navigate to Universal Posture Selection (not directly to practice timer)
  const handleComplete = () => {
    console.log('🎯 T1 Introduction completed - navigating to posture selection');
    
    // ✅ Navigate to Universal Posture Selection with T1 practice data
    navigate('/universal-posture-selection', {
      state: {
        tLevel: state?.tLevel || 'T1',
        duration: state?.duration || 10,
        level: state?.level || 't1',
        stageLevel: state?.stageLevel || 1,
        returnTo: state?.returnTo || '/stage1',
        fromIntroduction: true // Flag to indicate this came from introduction
      }
    });
  };

  const handleBack = () => {
    console.log('🔙 T1 Introduction - navigating back to stage');
    const returnPath = state?.returnTo || '/stage1';
    navigate(returnPath);
  };

  return (
    <div className="stage-level-introduction">
      <div className="introduction-container">
        {/* Header */}
        <div className="introduction-header">
          <button 
            className="back-button"
            onClick={handleBack}
            aria-label="Go back to stage selection"
          >
            ← Back
          </button>
          <h1 className="stage-title">{stageTitle}</h1>
        </div>

        {/* Content */}
        <div className="introduction-content">
          <div className="stage-overview">
            <h2>Stage 1: Physical Stillness</h2>
            <p className="stage-description">{stageDescription}</p>
          </div>

          <div className="level-details">
            <h3>T1: Physical Stillness Training</h3>
            <div className="level-info">
              <div className="duration-info">
                <span className="label">Duration:</span>
                <span className="value">{state?.duration || 10} minutes</span>
              </div>
              <div className="objective-info">
                <span className="label">Objective:</span>
                <span className="value">Develop basic physical stillness and posture awareness</span>
              </div>
            </div>

            <div className="practice-guidelines">
              <h4>Practice Guidelines:</h4>
              <ul>
                <li>Find a comfortable seated position with your spine naturally upright</li>
                <li>Allow your breathing to be natural and relaxed</li>
                <li>Focus on maintaining physical stillness throughout the session</li>
                <li>Gently return attention to posture when the mind wanders</li>
                <li>Complete 3 sessions to unlock the next level</li>
              </ul>
            </div>

            <div className="benefits">
              <h4>Benefits:</h4>
              <ul>
                <li>Improved postural awareness and control</li>
                <li>Enhanced ability to maintain physical stillness</li>
                <li>Foundation for deeper meditation practices</li>
                <li>Increased mind-body connection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="introduction-actions">
          <button 
            className="begin-practice-button"
            onClick={handleComplete}
          >
            Begin Practice
          </button>
        </div>

        {/* Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info">
            <h4>Debug Info:</h4>
            <pre>{JSON.stringify(state, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default T1Introduction;