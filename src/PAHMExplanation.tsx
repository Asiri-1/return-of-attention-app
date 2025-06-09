import React, { useState, useEffect } from 'react';
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

  // Check if this is being shown as part of the introduction flow
  useEffect(() => {
    setShowContinueButton(!!onContinue);
  }, [onContinue]);

  const handlePositionUpdate = (position: string, count: number) => {
    setSelectedPosition(position);
    // This is just for demonstration in the explanation screen
    console.log(`Position ${position} count: ${count}`);
  };

  const renderPositionDetails = () => {
    switch (selectedPosition) {
      case 'present':
        return (
          <>
            <div className="position-header">
              <h2>Present</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                The center position represents being fully present in the here and now.
                This is the state of pure awareness, where attention is anchored in the present moment.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Full engagement with current experience</li>
                  <li>Neutral observation without judgment</li>
                  <li>Sense of spaciousness and clarity</li>
                  <li>Natural mindfulness</li>
                  <li>Reduced self-referential thinking</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Cultivation Tips</h3>
                <ul className="tips-list">
                  <li>Use the breath as an anchor</li>
                  <li>Notice physical sensations in the body</li>
                  <li>Engage fully with whatever you're doing</li>
                  <li>Practice returning to the present when mind wanders</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'past':
        return (
          <>
            <div className="position-header">
              <h2>Past</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Past without attachment is neutral awareness of past events.
                This includes factual recall and learning from experience without emotional charge.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Neutral recollection of past events</li>
                  <li>Learning from experience</li>
                  <li>Factual memory without emotional charge</li>
                  <li>Balanced perspective on history</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>Recalling directions to a location</li>
                  <li>Learning from past mistakes without self-judgment</li>
                  <li>Factual recollection of events</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from past to present:</p>
                <ul className="tips-list">
                  <li>Notice when you're in past-oriented thinking</li>
                  <li>Gently bring attention to current sensory experience</li>
                  <li>Ask "What's happening right now?"</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'future':
        return (
          <>
            <div className="position-header">
              <h2>Future</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Future without attachment is neutral awareness of what may come.
                This includes practical planning and preparation without anxiety or excessive hope.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Practical planning and preparation</li>
                  <li>Balanced consideration of possibilities</li>
                  <li>Neutral orientation toward what may come</li>
                  <li>Absence of anxiety or excessive hope</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>Making a to-do list for tomorrow</li>
                  <li>Planning a trip with practical considerations</li>
                  <li>Preparing for upcoming events without anxiety</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from future to present:</p>
                <ul className="tips-list">
                  <li>Notice when you're in future-oriented thinking</li>
                  <li>Distinguish between practical planning and unnecessary projection</li>
                  <li>Return attention to your current experience</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'nostalgia':
        return (
          <>
            <div className="position-header">
              <h2>Nostalgia</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Nostalgia is attachment to pleasant memories or thoughts about the past.
                This includes romanticizing past experiences and longing for what was.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Emotional attachment to past experiences</li>
                  <li>Romanticizing or idealizing the past</li>
                  <li>Pleasant but potentially distracting</li>
                  <li>May involve comparing present unfavorably to past</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>"The good old days" thinking</li>
                  <li>Reminiscing about childhood with longing</li>
                  <li>Dwelling on past relationships or achievements</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from nostalgia to present:</p>
                <ul className="tips-list">
                  <li>Notice the emotional quality of attachment</li>
                  <li>Acknowledge the present moment without comparison</li>
                  <li>Find what's valuable in your current experience</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'anticipation':
        return (
          <>
            <div className="position-header">
              <h2>Anticipation</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Anticipation is attachment to future possibilities or events.
                This includes excitement, hope, and looking forward to what might happen.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Emotional investment in future outcomes</li>
                  <li>Pleasant excitement about possibilities</li>
                  <li>May involve idealization of future scenarios</li>
                  <li>Can distract from present experience</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>Excitement about upcoming vacation</li>
                  <li>Daydreaming about future success</li>
                  <li>Looking forward to seeing someone</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from anticipation to present:</p>
                <ul className="tips-list">
                  <li>Notice the emotional quality of attachment</li>
                  <li>Recognize when anticipation becomes distraction</li>
                  <li>Find enjoyment in the journey, not just the destination</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'regret':
        return (
          <>
            <div className="position-header">
              <h2>Regret</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Regret is aversion to past experiences or decisions.
                This includes self-criticism, shame, and wishing things had been different.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Negative emotional charge about past events</li>
                  <li>Self-criticism or blame</li>
                  <li>Wishing things had been different</li>
                  <li>Often involves rumination</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>"If only I had..." thinking</li>
                  <li>Dwelling on past mistakes</li>
                  <li>Shame about past actions</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from regret to present:</p>
                <ul className="tips-list">
                  <li>Practice self-compassion</li>
                  <li>Recognize that the past cannot be changed</li>
                  <li>Ask what can be learned and applied now</li>
                  <li>Return attention to current sensory experience</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'worry':
        return (
          <>
            <div className="position-header">
              <h2>Worry</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Worry is aversion to future possibilities or events.
                This includes anxiety, fear, and catastrophizing about what might happen.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Anxiety about future outcomes</li>
                  <li>Catastrophizing or imagining worst-case scenarios</li>
                  <li>Attempting to control the uncontrollable</li>
                  <li>Often involves physical tension</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>"What if..." thinking</li>
                  <li>Anxiety about upcoming events</li>
                  <li>Fear of potential problems</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from worry to present:</p>
                <ul className="tips-list">
                  <li>Distinguish between productive preparation and unproductive worry</li>
                  <li>Notice physical sensations of anxiety</li>
                  <li>Focus on what's actually happening now</li>
                  <li>Practice grounding techniques</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'likes':
        return (
          <>
            <div className="position-header">
              <h2>Likes</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Likes is desire, craving, or clinging to experiences.
                This includes wanting to hold onto pleasant states and seeking more of what feels good.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Craving for pleasant experiences</li>
                  <li>Resistance to change or impermanence</li>
                  <li>Seeking to prolong or repeat enjoyable states</li>
                  <li>Can create subtle dissatisfaction</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>Wanting a pleasant experience to last longer</li>
                  <li>Seeking more of something enjoyable</li>
                  <li>Clinging to positive feelings</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from likes to present:</p>
                <ul className="tips-list">
                  <li>Notice the quality of wanting or craving</li>
                  <li>Recognize the impermanent nature of all experiences</li>
                  <li>Practice contentment with what is</li>
                  <li>Return to neutral observation</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      case 'dislikes':
        return (
          <>
            <div className="position-header">
              <h2>Dislikes</h2>
            </div>
            <div className="position-content">
              <p className="position-description">
                Dislikes is resistance, avoidance, or rejection of experiences.
                This includes wanting to push away unpleasant states and seeking to escape what feels bad.
              </p>
              
              <div className="detail-section">
                <h3>Characteristics</h3>
                <ul className="characteristics-list">
                  <li>Resistance to unpleasant experiences</li>
                  <li>Wanting things to be different than they are</li>
                  <li>Rejection of aspects of reality</li>
                  <li>Often creates additional suffering</li>
                </ul>
              </div>
              
              <div className="detail-section">
                <h3>Common Examples</h3>
                <ul className="examples-list">
                  <li>Distracting yourself from discomfort</li>
                  <li>Rejecting aspects of your experience</li>
                </ul>
              </div>
              
              <div className="return-tips">
                <h3>Moving to Present</h3>
                <p>To shift from dislikes to present:</p>
                <ul className="tips-list">
                  <li>Notice the quality of resistance</li>
                  <li>Practice accepting difficult experiences without adding resistance</li>
                  <li>Bring curiosity to discomfort</li>
                  <li>Return to neutral observation</li>
                </ul>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="pahm-explanation-container">
      <div className="explanation-header">
        <button className="back-button" onClick={onBack}>Back</button>
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
            <p>Click on any position to learn more about it, or to track your attention during practice</p>
            <PAHMMatrix 
              isInteractive={true}
              onCountUpdate={handlePositionUpdate}
            />
          </div>
        </div>
        
        <div className="position-details">
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
              <button className="continue-button" onClick={onContinue}>
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
