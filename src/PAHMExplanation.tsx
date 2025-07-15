import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PAHMExplanation.css';
import PAHMMatrix from './PAHMMatrix';
import Logo from './Logo';

export interface PAHMExplanationProps {
  onBack: () => void;
  onContinue?: () => void;
}

const PAHMExplanation: React.FC<PAHMExplanationProps> = ({ onBack, onContinue }) => {
  const [selectedPosition, setSelectedPosition] = useState<string>('present');
  const [showContinueButton, setShowContinueButton] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ ENHANCED: iOS Safari viewport fix
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // ✅ ENHANCED: Handle navigation state and continue button logic
  useEffect(() => {
    // Check if this is being shown as part of the introduction flow
    const hasOnContinue = !!onContinue;
    const fromStage = location.state?.fromStage;
    
    setShowContinueButton(hasOnContinue || fromStage);
  }, [onContinue, location.state]);

  // ✅ ENHANCED: Touch feedback for iPhone users
  const handleTouchStart = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // ✅ ENHANCED: Keyboard navigation support
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // ✅ ENHANCED: Memoized position update handler
  const handlePositionUpdate = useCallback((position: string, count: number) => {
    setSelectedPosition(position);
    // This is just for demonstration in the explanation screen
    console.log(`Position ${position} count: ${count}`);
  }, []);

  // ✅ ENHANCED: Smart continue handler
  const handleContinue = useCallback(() => {
    const returnToStage = location.state?.returnToStage;
    
    if (onContinue) {
      // Use provided onContinue callback
      onContinue();
    } else if (returnToStage) {
      // Navigate back to the appropriate stage
      navigate(`/stage${returnToStage}`, {
        replace: true,
        state: { fromPAHMExplanation: true }
      });
    } else {
      // Default fallback
      navigate(-1);
    }
  }, [onContinue, location.state, navigate]);

  // ✅ ENHANCED: Smart back handler
  const handleBack = useCallback(() => {
    const returnToStage = location.state?.returnToStage;
    
    if (returnToStage) {
      // Navigate back to the stage that brought us here
      navigate(`/stage${returnToStage}`, {
        replace: true,
        state: { fromPAHMExplanation: true }
      });
    } else {
      // Use provided onBack callback or default navigation
      onBack();
    }
  }, [onBack, location.state, navigate]);

  // ✅ ENHANCED: Memoized position details to prevent unnecessary re-renders
  const positionDetails = useMemo(() => {
    const getPositionContent = (position: string) => {
      switch (position) {
        case 'present':
          return {
            title: "Present",
            description: "The center position represents being fully present in the here and now. This is the state of pure awareness, where attention is anchored in the present moment.",
            characteristics: [
              "Full engagement with current experience",
              "Neutral observation without judgment",
              "Sense of spaciousness and clarity",
              "Natural mindfulness",
              "Reduced self-referential thinking"
            ],
            tips: [
              "Use the breath as an anchor",
              "Notice physical sensations in the body",
              "Engage fully with whatever you're doing",
              "Practice returning to the present when mind wanders"
            ]
          };
        
        case 'past':
          return {
            title: "Past",
            description: "Past without attachment is neutral awareness of past events. This includes factual recall and learning from experience without emotional charge.",
            characteristics: [
              "Neutral recollection of past events",
              "Learning from experience",
              "Factual memory without emotional charge",
              "Balanced perspective on history"
            ],
            examples: [
              "Recalling directions to a location",
              "Learning from past mistakes without self-judgment",
              "Factual recollection of events"
            ],
            returnTips: [
              "Notice when you're in past-oriented thinking",
              "Gently bring attention to current sensory experience",
              "Ask \"What's happening right now?\""
            ]
          };
        
        case 'future':
          return {
            title: "Future",
            description: "Future without attachment is neutral awareness of what may come. This includes practical planning and preparation without anxiety or excessive hope.",
            characteristics: [
              "Practical planning and preparation",
              "Balanced consideration of possibilities",
              "Neutral orientation toward what may come",
              "Absence of anxiety or excessive hope"
            ],
            examples: [
              "Making a to-do list for tomorrow",
              "Planning a trip with practical considerations",
              "Preparing for upcoming events without anxiety"
            ],
            returnTips: [
              "Notice when you're in future-oriented thinking",
              "Distinguish between practical planning and unnecessary projection",
              "Return attention to your current experience"
            ]
          };
        
        case 'nostalgia':
          return {
            title: "Nostalgia",
            description: "Nostalgia is attachment to pleasant memories or thoughts about the past. This includes romanticizing past experiences and longing for what was.",
            characteristics: [
              "Emotional attachment to past experiences",
              "Romanticizing or idealizing the past",
              "Pleasant but potentially distracting",
              "May involve comparing present unfavorably to past"
            ],
            examples: [
              "\"The good old days\" thinking",
              "Reminiscing about childhood with longing",
              "Dwelling on past relationships or achievements"
            ],
            returnTips: [
              "Notice the emotional quality of attachment",
              "Acknowledge the present moment without comparison",
              "Find what's valuable in your current experience"
            ]
          };
        
        case 'anticipation':
          return {
            title: "Anticipation",
            description: "Anticipation is attachment to future possibilities or events. This includes excitement, hope, and looking forward to what might happen.",
            characteristics: [
              "Emotional investment in future outcomes",
              "Pleasant excitement about possibilities",
              "May involve idealization of future scenarios",
              "Can distract from present experience"
            ],
            examples: [
              "Excitement about upcoming vacation",
              "Daydreaming about future success",
              "Looking forward to seeing someone"
            ],
            returnTips: [
              "Notice the emotional quality of attachment",
              "Recognize when anticipation becomes distraction",
              "Find enjoyment in the journey, not just the destination"
            ]
          };
        
        case 'regret':
          return {
            title: "Regret",
            description: "Regret is aversion to past experiences or decisions. This includes self-criticism, shame, and wishing things had been different.",
            characteristics: [
              "Negative emotional charge about past events",
              "Self-criticism or blame",
              "Wishing things had been different",
              "Often involves rumination"
            ],
            examples: [
              "\"If only I had...\" thinking",
              "Dwelling on past mistakes",
              "Shame about past actions"
            ],
            returnTips: [
              "Practice self-compassion",
              "Recognize that the past cannot be changed",
              "Ask what can be learned and applied now",
              "Return attention to current sensory experience"
            ]
          };
        
        case 'worry':
          return {
            title: "Worry",
            description: "Worry is aversion to future possibilities or events. This includes anxiety, fear, and catastrophizing about what might happen.",
            characteristics: [
              "Anxiety about future outcomes",
              "Catastrophizing or imagining worst-case scenarios",
              "Attempting to control the uncontrollable",
              "Often involves physical tension"
            ],
            examples: [
              "\"What if...\" thinking",
              "Anxiety about upcoming events",
              "Fear of potential problems"
            ],
            returnTips: [
              "Distinguish between productive preparation and unproductive worry",
              "Notice physical sensations of anxiety",
              "Focus on what's actually happening now",
              "Practice grounding techniques"
            ]
          };
        
        case 'likes':
          return {
            title: "Likes",
            description: "Likes is desire, craving, or clinging to experiences. This includes wanting to hold onto pleasant states and seeking more of what feels good.",
            characteristics: [
              "Craving for pleasant experiences",
              "Resistance to change or impermanence",
              "Seeking to prolong or repeat enjoyable states",
              "Can create subtle dissatisfaction"
            ],
            examples: [
              "Wanting a pleasant experience to last longer",
              "Seeking more of something enjoyable",
              "Clinging to positive feelings"
            ],
            returnTips: [
              "Notice the quality of wanting or craving",
              "Recognize the impermanent nature of all experiences",
              "Practice contentment with what is",
              "Return to neutral observation"
            ]
          };
        
        case 'dislikes':
          return {
            title: "Dislikes",
            description: "Dislikes is resistance, avoidance, or rejection of experiences. This includes wanting to push away unpleasant states and seeking to escape what feels bad.",
            characteristics: [
              "Resistance to unpleasant experiences",
              "Wanting things to be different than they are",
              "Rejection of aspects of reality",
              "Often creates additional suffering"
            ],
            examples: [
              "Distracting yourself from discomfort",
              "Rejecting aspects of your experience"
            ],
            returnTips: [
              "Notice the quality of resistance",
              "Practice accepting difficult experiences without adding resistance",
              "Bring curiosity to discomfort",
              "Return to neutral observation"
            ]
          };
        
        default:
          return null;
      }
    };

    return getPositionContent(selectedPosition);
  }, [selectedPosition]);

  // ✅ ENHANCED: Render position details with improved structure
  const renderPositionDetails = useCallback(() => {
    if (!positionDetails) return null;

    return (
      <>
        <div className="position-header">
          <h2>{positionDetails.title}</h2>
        </div>
        <div className="position-content">
          <p className="position-description">
            {positionDetails.description}
          </p>
          
          <div className="detail-section">
            <h3>Characteristics</h3>
            <ul className="characteristics-list">
              {positionDetails.characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
          </div>
          
          {positionDetails.examples && (
            <div className="detail-section">
              <h3>Common Examples</h3>
              <ul className="examples-list">
                {positionDetails.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          )}
          
          {positionDetails.tips && (
            <div className="detail-section">
              <h3>Cultivation Tips</h3>
              <ul className="tips-list">
                {positionDetails.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {positionDetails.returnTips && (
            <div className="return-tips">
              <h3>Moving to Present</h3>
              <p>To shift from {positionDetails.title.toLowerCase()} to present:</p>
              <ul className="tips-list">
                {positionDetails.returnTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </>
    );
  }, [positionDetails]);

  return (
    <div className="pahm-explanation-container">
      <div className="explanation-header">
        <button 
          className="back-button" 
          onClick={handleBack}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, handleBack)}
          aria-label="Go back to previous page"
        >
          Back
        </button>
        <h1>The PAHM Matrix</h1>
      </div>
      
      <div className="explanation-content">
        <div className="matrix-overview">
          <div className="app-logo">
            <Logo />
          </div>
          
          <h2>Understanding the Present Attention and Happiness Matrix</h2>
          <p className="matrix-description">
            The PAHM (Present Attention and Happiness Matrix) is a powerful tool for tracking your attention 
            during practice. It helps you understand where your attention is in each moment - whether in the present, 
            past, or future, and whether you're experiencing likes or dislikes.
          </p>
          
          <p className="matrix-description">
            As you progress through the PAHM stages (PAHM Trainer, PAHM Beginner, PAHM Practitioner, 
            PAHM Master, and PAHM Illuminator), you'll develop increasing skill in recognizing and 
            tracking your attention using this matrix.
          </p>
          
          <div className="interactive-matrix-demo">
            <h3>Try the PAHM Matrix</h3>
            <p className="interaction-hint">Click on any position to learn more about it, or to track your attention during practice</p>
            <PAHMMatrix 
              isInteractive={true}
              onCountUpdate={handlePositionUpdate}
            />
          </div>
        </div>
        
        <div className="position-details" role="region" aria-live="polite">
          {renderPositionDetails()}
        </div>
        
        <div className="matrix-practice">
          <h2>Using the PAHM Matrix in Your Practice</h2>
          
          <div className="practice-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Set Your Duration</h3>
              <p>For PAHM practice, set a timer for at least 30 minutes (longer is better)</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Track Your Attention</h3>
              <p>During practice, tap the position that matches your current state whenever you notice a shift</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Notice Patterns</h3>
              <p>Observe which positions you tend to spend most of your time in</p>
            </div>
            
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Review After Practice</h3>
              <p>After your session, review your distribution and reflect on your experience</p>
            </div>
          </div>
          
          <div className="practice-note">
            <p>Remember that all positions are part of human experience. The goal isn't to always be in Present, but to develop awareness of your current state and the ability to shift when beneficial.</p>
          </div>
          
          {showContinueButton && (
            <div className="continue-section">
              <button 
                className="continue-button" 
                onClick={handleContinue}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, handleContinue)}
                aria-label="Continue to practice session"
              >
                Continue to Practice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PAHMExplanation;