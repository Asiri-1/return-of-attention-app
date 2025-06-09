import React from 'react';
import './PoisonThoughts.css';

export interface PoisonThoughtsProps {
  onBack: () => void;
}

const PoisonThoughts: React.FC<PoisonThoughtsProps> = ({ onBack }) => {
  return (
    <div className="poison-thoughts">
      <div className="poison-thoughts-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Poison Thoughts</h1>
      </div>
      
      <div className="poison-thoughts-content">
        <div className="section">
          <h2>What Are Poison Thoughts?</h2>
          <p>
            Poison thoughts are recurring thought patterns that pull you away from presence and into suffering. 
            They are characterized by their sticky quality—once they arise, they tend to capture your attention 
            and lead to extended periods of mental rumination.
          </p>
        </div>
        
        <div className="section">
          <h2>Common Types of Poison Thoughts</h2>
          
          <div className="poison-thought-type">
            <h3>Regret</h3>
            <p>
              Dwelling on past actions or missed opportunities. These thoughts often begin with phrases like 
              "I should have..." or "If only I had..."
            </p>
            <div className="example">
              <strong>Example:</strong> "I should have spoken up in that meeting. Now everyone thinks I have nothing valuable to contribute."
            </div>
          </div>
          
          <div className="poison-thought-type">
            <h3>Worry</h3>
            <p>
              Anxious thoughts about future events or potential problems. These thoughts often contain 
              catastrophizing elements and "what if" scenarios.
            </p>
            <div className="example">
              <strong>Example:</strong> "What if I fail this project? My boss will think I'm incompetent, and I might lose my job."
            </div>
          </div>
          
          <div className="poison-thought-type">
            <h3>Self-Criticism</h3>
            <p>
              Harsh judgments about yourself, your worth, or your abilities. These thoughts often contain 
              absolute terms like "always," "never," or "everyone."
            </p>
            <div className="example">
              <strong>Example:</strong> "I always mess things up. I'll never be as competent as my colleagues."
            </div>
          </div>
          
          <div className="poison-thought-type">
            <h3>Comparison</h3>
            <p>
              Measuring yourself against others in ways that diminish your sense of worth or accomplishment.
            </p>
            <div className="example">
              <strong>Example:</strong> "Everyone else seems to have their life together. Why am I struggling so much?"
            </div>
          </div>
          
          <div className="poison-thought-type">
            <h3>Resentment</h3>
            <p>
              Holding onto anger about past events or people who have wronged you.
            </p>
            <div className="example">
              <strong>Example:</strong> "I can't believe they did that to me. They never respected me from the beginning."
            </div>
          </div>
        </div>
        
        <div className="section">
          <h2>Working with Poison Thoughts</h2>
          
          <div className="practice">
            <h3>1. Recognition</h3>
            <p>
              The first step is simply to recognize when a poison thought has arisen. This awareness 
              itself begins to loosen its grip.
            </p>
          </div>
          
          <div className="practice">
            <h3>2. Labeling</h3>
            <p>
              Mentally note the type of poison thought: "Ah, this is worry" or "This is self-criticism." 
              Labeling helps create distance between you and the thought.
            </p>
          </div>
          
          <div className="practice">
            <h3>3. Return to Presence</h3>
            <p>
              Gently bring your attention back to the present moment—to physical sensations, 
              sounds, or your breath.
            </p>
          </div>
          
          <div className="practice">
            <h3>4. Non-Identification</h3>
            <p>
              Remember that you are not your thoughts. A thought like "I'm a failure" is just a 
              thought, not a truth about who you are.
            </p>
          </div>
        </div>
        
        <div className="section">
          <h2>Stage Three Practice</h2>
          <p>
            In Stage Three, you'll work directly with poison thoughts using the dot tracking technique. 
            When you notice a poison thought arising:
          </p>
          <ol>
            <li>Acknowledge its presence without judgment</li>
            <li>Return your attention to the visualized dot</li>
            <li>Notice how the thought tries to pull you away again</li>
            <li>Each time, patiently return to the dot</li>
          </ol>
          <p>
            With practice, you'll develop the capacity to recognize poison thoughts more quickly 
            and return to presence with greater ease.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PoisonThoughts;
