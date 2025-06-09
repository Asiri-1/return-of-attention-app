import React from 'react';
import './WhatIsPAHM.css';
import Logo from './Logo';
import PAHMMatrix from './PAHMMatrix';
import { PAHMCounts } from './types/PAHMTypes';

interface WhatIsPAHMProps {
  onBack: () => void;
  onStartPractice: () => void;
}

const WhatIsPAHM: React.FC<WhatIsPAHMProps> = ({ onBack, onStartPractice }) => {
  // Sample PAHM counts for demonstration
  const sampleCounts: PAHMCounts = {
    nostalgia: 2,
    likes: 3,
    anticipation: 2,
    past: 4,
    present: 8,
    future: 3,
    regret: 1,
    dislikes: 2,
    worry: 3
  };

  return (
    <div className="what-is-pahm">
      <div className="header">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <Logo />
        <div className="placeholder"></div>
      </div>

      <div className="content">
        <h1>What is PAHM?</h1>
        
        <section className="introduction">
          <p>
            <strong>PAHM (Present Attention and Happiness Matrix) is the ultimate tool for achieving happiness that stays</strong>. 
            As described in "The Return of Attention" book, this powerful framework helps you understand and track your attention patterns, 
            revealing where your mind habitually goes and how these patterns affect your overall wellbeing.
          </p>
          <p>
            Unlike temporary happiness that depends on changing circumstances, PAHM practice develops a foundation for 
            lasting happiness through awareness and acceptance of your mental patterns. By simply observing without judgment, 
            you cultivate a stable happiness that remains regardless of external conditions.
          </p>
        </section>

        <section className="pahm-matrix-section">
          <h2>The PAHM Matrix</h2>
          <p>
            The PAHM Matrix is a 3×3 grid that maps your attention across two dimensions:
          </p>
          <ul>
            <li><strong>Time Orientation:</strong> Past, Present, or Future</li>
            <li><strong>Emotional Charge:</strong> Likes (Attachment), Neutral, or Dislikes (Aversion)</li>
          </ul>
          
          <div className="matrix-demo">
            <PAHMMatrix 
              initialCounts={sampleCounts}
              onCountUpdate={() => {}}
            />
          </div>
          
          <p className="matrix-caption">
            This interactive matrix allows you to track where your attention goes during practice.
          </p>
        </section>

        <section className="matrix-positions">
          <h2>Understanding the Nine Positions</h2>
          
          <div className="position-group">
            <h3>Present Moment</h3>
            <div className="position-item">
              <h4>Present (Center)</h4>
              <p>Pure awareness in the here and now. This is the state of mindfulness where attention is anchored in the present moment without judgment.</p>
            </div>
          </div>
          
          <div className="position-group">
            <h3>Neutral Time Orientation</h3>
            <div className="position-item">
              <h4>Past</h4>
              <p>Neutral awareness of past events. This includes factual recall and learning from experience without emotional charge.</p>
            </div>
            <div className="position-item">
              <h4>Future</h4>
              <p>Neutral awareness of what may come. This includes practical planning and preparation without anxiety or excessive hope.</p>
            </div>
          </div>
          
          <div className="position-group">
            <h3>Likes (Attachment)</h3>
            <div className="position-item">
              <h4>Nostalgia</h4>
              <p>Attachment to pleasant memories or thoughts about the past. This includes romanticizing past experiences and longing for what was.</p>
            </div>
            <div className="position-item">
              <h4>Likes</h4>
              <p>Desire, craving, or clinging to experiences. This includes wanting to hold onto pleasant states and seeking more of what feels good.</p>
            </div>
            <div className="position-item">
              <h4>Anticipation</h4>
              <p>Attachment to future possibilities or events. This includes excitement, hope, and looking forward to what might happen.</p>
            </div>
          </div>
          
          <div className="position-group">
            <h3>Dislikes (Aversion)</h3>
            <div className="position-item">
              <h4>Regret</h4>
              <p>Aversion to past experiences or decisions. This includes self-criticism, shame, and wishing things had been different.</p>
            </div>
            <div className="position-item">
              <h4>Dislikes</h4>
              <p>Resistance, avoidance, or rejection of experiences. This includes wanting to push away unpleasant states and seeking to escape what feels bad.</p>
            </div>
            <div className="position-item">
              <h4>Worry</h4>
              <p>Aversion to future possibilities or events. This includes anxiety, fear, and catastrophizing about what might happen.</p>
            </div>
          </div>
        </section>

        <section className="benefits-section">
          <h2>Benefits of PAHM Practice</h2>
          <ul>
            <li><strong>Happiness that stays</strong> - independent of changing circumstances</li>
            <li>Increased awareness of your attention patterns</li>
            <li>Greater ability to notice when your mind wanders</li>
            <li>Better understanding of your mental habits without judgment</li>
            <li>Enhanced emotional regulation</li>
            <li>Reduced reactivity to thoughts and feelings</li>
            <li>More stable attention and focus</li>
            <li>Deeper connection with your present experience</li>
          </ul>
        </section>

        <section className="practice-section">
          <h2>How to Use PAHM in Your Practice</h2>
          
          <div className="step-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Set Your Duration</h3>
                <p>For PAHM practice, set a timer for at least 30 minutes. Longer durations (45-60 minutes or more) allow for deeper practice and more accurate tracking.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Track Your Attention</h3>
                <p>During practice, maintain physical stillness and tap the position that matches your current state of attention whenever you notice it. Don't try to control where your attention goes - simply observe and track it.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Notice Patterns</h3>
                <p>As you practice, simply observe which positions your attention naturally gravitates toward. The goal is identification and awareness, not trying to force your attention to any particular position.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Review After Practice</h3>
                <p>After your session, review your distribution and reflect on your experience. What patterns do you notice? How did different positions feel? This reflection deepens your self-understanding.</p>
              </div>
            </div>
          </div>
          
          <p className="important-note">
            <strong>Important:</strong> The goal is not to force your attention to the present or judge yourself for where your mind goes. 
            Simply identify and observe your patterns with curiosity and acceptance. PAHM is about developing awareness, 
            not striving to change your experience.
          </p>
        </section>

        <section className="philosophy-section">
          <h2>The Philosophy Behind PAHM</h2>
          <p>
            As described in "The Return of Attention," PAHM is based on the understanding that lasting happiness comes not from 
            controlling our experiences, but from developing awareness of our attention patterns. When we observe without judgment 
            where our attention naturally goes, we gain freedom from the automatic reactions that cause suffering.
          </p>
          <p>
            PAHM practice reveals that happiness that stays is available in any moment through awareness itself, 
            regardless of circumstances. This is why PAHM is considered the ultimate tool for achieving lasting happiness - 
            it works with any experience, requires no special conditions, and develops a capacity for wellbeing that remains 
            stable through life's inevitable changes.
          </p>
        </section>

        <div className="action-buttons">
          <button className="start-practice-button" onClick={onStartPractice}>
            Start PAHM Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatIsPAHM;
