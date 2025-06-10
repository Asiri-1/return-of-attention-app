import React, { useState } from 'react';
import './PostureGuide.css';

interface PostureGuideProps {
  onContinue?: () => void;
}

const PostureGuide: React.FC<PostureGuideProps> = ({ onContinue = () => {} }) => {
  const [currentSection, setCurrentSection] = useState<string>('overview');

  // Define postures to match those in PostureSelection.tsx
  const postures = [
    { id: 'chair', name: 'Chair Sitting', description: 'Sitting upright on a chair with feet flat on the floor' },
    { id: 'cushion', name: 'Cushion Sitting', description: 'Sitting cross-legged on a meditation cushion' },
    { id: 'seiza', name: 'Seiza Position', description: 'Kneeling with weight resting on cushion or bench' },
    { id: 'burmese', name: 'Burmese Position', description: 'Sitting with both legs bent and resting on the floor' },
    { id: 'lotus', name: 'Half Lotus', description: 'One foot resting on the opposite thigh' },
    { id: 'full-lotus', name: 'Full Lotus', description: 'Both feet resting on opposite thighs' },
    { id: 'lying', name: 'Lying Down', description: 'Lying flat on back with arms at sides' },
    { id: 'standing', name: 'Standing', description: 'Standing with feet shoulder-width apart' },
    { id: 'other', name: 'Other', description: 'Another posture not listed here' }
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'overview':
        return (
          <div className="posture-section">
            <h2>Foundation of Practice</h2>
            <p>
              Proper posture is essential for effective meditation practice. It creates the physical foundation 
              that allows your mind to settle and your attention to stabilize. This guide covers all aspects 
              of meditation posture, including the often overlooked but crucial element of eye position.
            </p>
            <div className="posture-image-container">
              <div className="posture-image-placeholder">
                [Meditation posture illustration]
              </div>
            </div>
          </div>
        );
      
      case 'sitting':
        return (
          <div className="posture-section">
            <h2>Sitting Position</h2>
            <p>
              Find a comfortable seated position that allows your spine to be straight but not rigid. 
              You may sit on a cushion on the floor, a meditation bench, or a chair.
            </p>
            <h3>Available Sitting Postures:</h3>
            <ul>
              <li>
                <strong>Chair Sitting</strong> - Sitting upright on a chair with feet flat on the floor
              </li>
              <li>
                <strong>Cushion Sitting</strong> - Sitting cross-legged on a meditation cushion
              </li>
              <li>
                <strong>Seiza Position</strong> - Kneeling with weight resting on cushion or bench
              </li>
              <li>
                <strong>Burmese Position</strong> - Sitting with both legs bent and resting on the floor
              </li>
              <li>
                <strong>Half Lotus</strong> - One foot resting on the opposite thigh
              </li>
              <li>
                <strong>Full Lotus</strong> - Both feet resting on opposite thighs (advanced)
              </li>
            </ul>
            <h3>Chair Sitting:</h3>
            <p>
              Sit toward the front edge of the chair with both feet flat on the floor. 
              Your knees should be at or below hip level. Avoid leaning against the backrest.
            </p>
          </div>
        );

      case 'other-positions':
        return (
          <div className="posture-section">
            <h2>Other Meditation Positions</h2>
            <p>
              While sitting is the most common meditation posture, these alternatives can be helpful
              depending on your physical needs and practice goals.
            </p>
            <h3>Available Alternative Postures:</h3>
            <ul>
              <li>
                <strong>Lying Down</strong> - Lying flat on back with arms at sides. This position can be helpful
                for those with physical limitations, but be mindful of the tendency to fall asleep.
              </li>
              <li>
                <strong>Standing</strong> - Standing with feet shoulder-width apart. This energetic posture
                promotes alertness and can be particularly helpful when feeling drowsy.
              </li>
            </ul>
            <p>
              Regardless of which position you choose, the key principles remain the same: maintain a straight spine,
              find a position that balances comfort with alertness, and keep the body relaxed but not collapsed.
            </p>
          </div>
        );
      
      case 'spine':
        return (
          <div className="posture-section">
            <h2>Spine Alignment</h2>
            <p>
              The spine should be straight but not rigid - imagine a string gently pulling upward from the crown of your head.
              This creates a natural S-curve that supports proper energy flow and breathing.
            </p>
            <h3>Key Points:</h3>
            <ul>
              <li>Sit with your hips slightly higher than your knees (use a cushion if needed)</li>
              <li>Allow your lower back to maintain its natural curve</li>
              <li>Relax your shoulders down and slightly back</li>
              <li>Keep your chin slightly tucked to align your neck with your spine</li>
              <li>Imagine your head balanced effortlessly on top of your spine</li>
            </ul>
          </div>
        );
      
      case 'hands':
        return (
          <div className="posture-section">
            <h2>Hand Position</h2>
            <p>
              Your hands should rest in a comfortable position that promotes stability and relaxation.
            </p>
            <h3>Recommended Positions:</h3>
            <ul>
              <li>
                <strong>Resting on Thighs</strong> - Place hands palms down on your thighs
              </li>
              <li>
                <strong>Cosmic Mudra</strong> - Left hand resting in right hand, palms up, thumbs lightly touching to form an oval
              </li>
              <li>
                <strong>Palms Up</strong> - Hands resting on thighs with palms facing upward in a receptive gesture
              </li>
            </ul>
            <p>
              Choose the position that feels most natural and allows your shoulders and arms to remain relaxed.
            </p>
          </div>
        );
      
      case 'eyes':
        return (
          <div className="posture-section">
            <h2>Eye Position</h2>
            <p>
              Eye position is a crucial but often overlooked aspect of meditation posture. The position of your eyes 
              directly influences your mental state and ability to maintain attention.
            </p>
            <h3>Recommended Eye Positions:</h3>
            <ul>
              <li>
                <strong>Softly Downcast</strong> - Eyes partially open with gaze resting about 3-4 feet in front of you on the floor. 
                This is the traditional Zen approach and helps balance alertness with relaxation.
              </li>
              <li>
                <strong>Slightly Upward</strong> - Eyes closed with attention directed slightly upward toward the third eye area 
                (between the eyebrows). This can help elevate consciousness and reduce drowsiness.
              </li>
              <li>
                <strong>Straight Ahead</strong> - Eyes closed with attention directed straight ahead. This neutral position 
                works well for many practitioners.
              </li>
            </ul>
            <h3>Important Considerations:</h3>
            <p>
              According to the Foundation of Practice section in The Return of Attention, eye position significantly affects 
              your mental state during meditation:
            </p>
            <ul>
              <li>Downward eye position tends to promote relaxation but may increase drowsiness</li>
              <li>Upward eye position increases alertness and energy but may create tension</li>
              <li>The ideal position balances alertness and relaxation</li>
              <li>Experiment to find which position works best for your practice</li>
              <li>Keep your gaze soft and unfocused regardless of direction</li>
              <li>Avoid straining or tensing the eyes</li>
            </ul>
          </div>
        );
      
      case 'breathing':
        return (
          <div className="posture-section">
            <h2>Breathing</h2>
            <p>
              While not strictly posture, breathing is intimately connected to how you hold your body.
            </p>
            <h3>Guidelines:</h3>
            <ul>
              <li>Breathe naturally through your nose</li>
              <li>Allow the breath to flow into your lower abdomen</li>
              <li>Keep your chest and shoulders relaxed</li>
              <li>Don't force or control the breath - simply observe it</li>
              <li>Notice how your posture affects your breathing pattern</li>
            </ul>
          </div>
        );
      
      case 'common-issues':
        return (
          <div className="posture-section">
            <h2>Common Issues & Solutions</h2>
            <h3>Discomfort & Pain:</h3>
            <ul>
              <li>
                <strong>Knee Pain</strong> - Use additional cushions under knees or switch to chair sitting
              </li>
              <li>
                <strong>Back Pain</strong> - Ensure proper lumbar support; try a higher cushion or different sitting position
              </li>
              <li>
                <strong>Numbness in Legs</strong> - Change positions more frequently; gradually build up sitting time
              </li>
              <li>
                <strong>Neck Tension</strong> - Check chin position; ensure it's slightly tucked, not jutting forward
              </li>
            </ul>
            <h3>Mental States:</h3>
            <ul>
              <li>
                <strong>Drowsiness</strong> - Try a more upward eye position; straighten spine; allow more light in the room
              </li>
              <li>
                <strong>Agitation</strong> - Try a more downward eye position; soften your gaze; deepen breathing
              </li>
              <li>
                <strong>Distraction</strong> - Reestablish proper posture; it often helps bring attention back
              </li>
            </ul>
          </div>
        );
      
      default:
        return <div>Select a section to learn more</div>;
    }
  };

  return (
    <div className="posture-guide">
      <div className="posture-guide-header">
        <h1>Posture Guide</h1>
      </div>
      
      <div className="posture-guide-content">
        <div className="posture-navigation">
          <button 
            className={`posture-nav-button ${currentSection === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentSection('overview')}
          >
            Overview
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'sitting' ? 'active' : ''}`}
            onClick={() => setCurrentSection('sitting')}
          >
            Sitting Positions
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'other-positions' ? 'active' : ''}`}
            onClick={() => setCurrentSection('other-positions')}
          >
            Other Positions
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'spine' ? 'active' : ''}`}
            onClick={() => setCurrentSection('spine')}
          >
            Spine Alignment
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'hands' ? 'active' : ''}`}
            onClick={() => setCurrentSection('hands')}
          >
            Hand Position
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'eyes' ? 'active' : ''}`}
            onClick={() => setCurrentSection('eyes')}
          >
            Eye Position
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'breathing' ? 'active' : ''}`}
            onClick={() => setCurrentSection('breathing')}
          >
            Breathing
          </button>
          <button 
            className={`posture-nav-button ${currentSection === 'common-issues' ? 'active' : ''}`}
            onClick={() => setCurrentSection('common-issues')}
          >
            Common Issues
          </button>
          
          <div className="navigation-continue">
            <button 
              className="continue-button"
              onClick={onContinue}
            >
              Continue
            </button>
          </div>
        </div>
        
        <div className="posture-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PostureGuide;


