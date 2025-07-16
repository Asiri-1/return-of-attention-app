// ✅ Fixed PracticeComplete - Works with Progressive Onboarding
// File: src/PracticeComplete.tsx

import React, { useState } from 'react';
import './PracticeComplete.css';
import Logo from './Logo';
import { useProgressiveOnboarding } from './hooks/useProgressiveOnboarding';
import { usePractice } from './PracticeContext';

interface PracticeCompleteProps {
  onBack: () => void;
  onSaveAndContinue: (rating: number, reflectionData?: ReflectionData) => void;
  sessionData: {
    duration: number;
    stage: number;
    stageTitle: string;
    level?: string; // T-stage level (T1, T2, etc.) for Stage 1
    pahmDistribution?: {
      present: number;
      past: number;
      future: number;
      other: number;
    }
  }
}

export interface ReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

const PracticeComplete: React.FC<PracticeCompleteProps> = ({ 
  onBack, 
  onSaveAndContinue, 
  sessionData 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [insights, setInsights] = useState<string>('');
  
  // ✅ INTEGRATION: Use progressive onboarding and practice context
  const { handleSessionComplete } = useProgressiveOnboarding();
  const { addSession } = usePractice();
  
  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };
  
  const handleChallengeToggle = (challenge: string) => {
    if (challenges.includes(challenge)) {
      setChallenges(challenges.filter(c => c !== challenge));
    } else {
      setChallenges([...challenges, challenge]);
    }
  };
  
  const handleSaveAndContinue = () => {
    const reflectionData = {
      reflectionText,
      challenges,
      insights
    };
    
    // ✅ INTEGRATION: Create complete session data for both systems
    const completeSessionData = {
      ...sessionData,
      rating,
      reflectionData,
      isCompleted: true,
      timeSpent: sessionData.duration
    };
    
    // ✅ Update progressive onboarding system
    handleSessionComplete(completeSessionData);
    
    // ✅ Update practice context for statistics and streaks
    if (sessionData.pahmDistribution) {
      addSession({
        duration: sessionData.duration,
        positions: sessionData.pahmDistribution,
        lastPosition: 'present' // You can determine this from pahmDistribution
      });
    } else {
      // For T-stage sessions, create a basic positions object
      addSession({
        duration: sessionData.duration,
        positions: { present: sessionData.duration }, // Stage 1 is all "present"
        lastPosition: 'present'
      });
    }
    
    // ✅ Call original handler
    onSaveAndContinue(rating, reflectionData);
  };
  
  // For Stage 1 (Physical Stillness), we don't show PAHM distribution
  const showPAHM = sessionData.stage !== 1 && sessionData.pahmDistribution;
  
  // ✅ INTEGRATION: Show progression hints based on current stage
  const getProgressionHint = () => {
    if (sessionData.stage === 1 && sessionData.level) {
      const currentTStage = sessionData.level;
      const sessions = JSON.parse(localStorage.getItem(`${currentTStage.toLowerCase()}Sessions`) || '[]');
      const completedSessions = sessions.filter((s: any) => s.isCompleted).length + 1; // +1 for current session
      
      if (completedSessions >= 3) {
        const nextStages = ['T1', 'T2', 'T3', 'T4', 'T5'];
        const currentIndex = nextStages.indexOf(currentTStage);
        const nextStage = nextStages[currentIndex + 1];
        
        if (nextStage) {
          return `🎉 ${currentTStage} completed! ${nextStage} is now unlocked.`;
        } else {
          return `🏆 Stage 1 completed! PAHM Stage 2 is now unlocked.`;
        }
      } else {
        return `✨ ${completedSessions}/3 ${currentTStage} sessions completed.`;
      }
    } else if (sessionData.stage >= 2) {
      const currentHours = parseFloat(localStorage.getItem(`stage${sessionData.stage}Hours`) || '0');
      const sessionHours = sessionData.duration / 60;
      const newTotal = currentHours + sessionHours;
      
      if (newTotal >= 15) {
        return `🎉 Stage ${sessionData.stage} completed! Stage ${sessionData.stage + 1} is now unlocked.`;
      } else {
        return `✨ ${newTotal.toFixed(1)}/15 hours completed for Stage ${sessionData.stage}.`;
      }
    }
    return '';
  };
  
  return (
    <div className="practice-complete">
      <div className="practice-complete-header">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <h1>Practice Complete</h1>
      </div>
      
      <div className="practice-complete-content">
        <div className="app-logo">
          <Logo />
        </div>
        
        <div className="app-title">The Return of Attention</div>
        
        <div className="session-info">
          <div className="session-detail">Session Duration: {sessionData.duration} minutes</div>
          <div className="session-detail">
            Stage: {sessionData.stage} • {sessionData.stageTitle}
            {sessionData.level && ` • ${sessionData.level}`}
          </div>
        </div>
        
        {/* ✅ INTEGRATION: Show progression hint */}
        <div className="progression-hint" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          margin: '20px 0',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          {getProgressionHint()}
        </div>
        
        {/* PAHM distribution is only shown for stages other than Stage 1 */}
        {showPAHM && sessionData.pahmDistribution && (
          <div className="pahm-distribution">
            <h2>PAHM Position Distribution</h2>
            
            <div className="chart-container">
              <div className="distribution-stats">
                <div className="stat-item">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value">{sessionData.pahmDistribution.present}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Past:</span>
                  <span className="stat-value">{sessionData.pahmDistribution.past}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Future:</span>
                  <span className="stat-value">{sessionData.pahmDistribution.future}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Other:</span>
                  <span className="stat-value">{sessionData.pahmDistribution.other}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Integrated reflection section */}
        <div className="reflection-section">
          <h3>What did you notice during your practice?</h3>
          <textarea 
            className="reflection-textarea"
            placeholder="Enter your reflections here..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
          />
        </div>
        
        <div className="reflection-section">
          <h3>Challenges</h3>
          <div className="challenges-options">
            {[
              { id: 'mind-wandering', label: 'Mind wandering' },
              { id: 'physical-discomfort', label: 'Physical discomfort' },
              { id: 'sleepiness', label: 'Sleepiness' },
              { id: 'restlessness', label: 'Restlessness' },
              { id: 'strong-emotions', label: 'Strong emotions' },
              { id: 'external-distractions', label: 'External distractions' }
            ].map(challenge => (
              <div key={challenge.id} className="challenge-option">
                <input 
                  type="checkbox" 
                  id={challenge.id}
                  checked={challenges.includes(challenge.id)}
                  onChange={() => handleChallengeToggle(challenge.id)}
                />
                <label htmlFor={challenge.id}>{challenge.label}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="reflection-section">
          <h3>Insights</h3>
          <textarea 
            className="reflection-textarea"
            placeholder="Enter any insights here..."
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
          />
        </div>
        
        {/* Practice rating moved to just before the Save button */}
        <div className="practice-rating">
          <h2>How was your practice?</h2>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                className={`star-button ${rating >= star ? 'active' : ''}`}
                onClick={() => handleRatingSelect(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="save-continue-button" 
          onClick={handleSaveAndContinue}
          style={{
            background: rating > 0 ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : undefined
          }}
        >
          Save & Continue
        </button>
        
        <div className="home-indicator"></div>
      </div>
    </div>
  );
};

export default PracticeComplete;