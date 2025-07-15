import React, { useState, useCallback, useEffect } from 'react';
import './StageInstructions.css';
import { useNavigate } from 'react-router-dom';

export interface StageInstructionsProps {
  onBack: () => void;
}

const StageInstructions: React.FC<StageInstructionsProps> = ({
  onBack = () => {}
}) => {
  const [selectedStage, setSelectedStage] = useState(1);
  const [selectedSubstage, setSelectedSubstage] = useState("t1");
  const navigate = useNavigate();
  
  // ✅ ENHANCED: Memoized callbacks for better performance
  const handleStageSelect = useCallback((stage: number) => {
    setSelectedStage(stage);
    // Reset substage when changing main stage
    if (stage === 1) {
      setSelectedSubstage("t1");
    } else {
      setSelectedSubstage("");
    }
  }, []);

  const handleSubstageSelect = useCallback((substage: string) => {
    setSelectedSubstage(substage);
  }, []);

  const handlePAHMClick = useCallback(() => {
    navigate('/learning/pahm');
  }, [navigate]);

  const handlePoisonThoughtsClick = useCallback(() => {
    navigate('/learning/poison-thoughts');
  }, [navigate]);

  // ✅ ENHANCED: Keyboard navigation support for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // ✅ ENHANCED: Touch feedback for iPhone users
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    // Add subtle haptic feedback hint for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // ✅ ENHANCED: iOS Safari viewport fix
  useEffect(() => {
    // Fix iOS Safari viewport height issues
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
  
  const renderStageOneContent = useCallback(() => {
    switch (selectedSubstage) {
      case "t1":
        return (
          <div className="substage-content">
            <h3>T1: 10 minutes - Establishing basic stillness</h3>
            <p>T1 consists of three 10-minute sessions.</p>
            
            <h4>Instructions:</h4>
            <ol>
              <li><strong>Preparation:</strong> Set your timer for 10 minutes.</li>
              <li><strong>Establishing Posture:</strong> Take your chosen sitting position, making any necessary adjustments to ensure stability and comfort.</li>
              <li><strong>Beginning the Practice:</strong> Close your eyes or maintain a soft gaze a few feet in front of you. Allow your attention to rest on the physical sensations of sitting—the points of contact between your body and the chair or floor, the feeling of your hands resting on your thighs, the natural movement of your breath.</li>
              <li><strong>Maintaining Stillness:</strong> For the duration of the practice, maintain physical stillness. If you need to adjust your position due to pain (not mere discomfort), do so mindfully, then return to stillness.</li>
            </ol>
            
            <p><strong>Progression Requirement:</strong> Complete at least 3 sessions at this duration before moving to T2.</p>
          </div>
        );
      case "t2":
        return (
          <div className="substage-content">
            <h3>T2: 15 minutes - Extending initial capacity</h3>
            
            <h4>Instructions:</h4>
            <ol>
              <li>Follow the same process as T1, but extend your timer to 15 minutes.</li>
              <li>Notice any increased resistance or discomfort that may arise with the longer duration.</li>
              <li>Remember that discomfort is normal and expected as you extend your practice time.</li>
            </ol>
            
            <p><strong>Progression Requirement:</strong> Complete at least 3 sessions at this duration before moving to T3.</p>
          </div>
        );
      case "t3":
        return (
          <div className="substage-content">
            <h3>T3: 20 minutes - Building endurance</h3>
            
            <h4>Instructions:</h4>
            <ol>
              <li>Set your timer for 20 minutes.</li>
              <li>Maintain the same practice of physical stillness.</li>
              <li>You may notice more significant challenges at this duration—this is where real growth begins.</li>
            </ol>
            
            <p><strong>Progression Requirement:</strong> Complete at least 3 sessions at this duration before moving to T4.</p>
          </div>
        );
      case "t4":
        return (
          <div className="substage-content">
            <h3>T4: 25 minutes - Deepening stability</h3>
            
            <h4>Instructions:</h4>
            <ol>
              <li>Set your timer for 25 minutes.</li>
              <li>Maintain physical stillness throughout the session.</li>
              <li>During your T4 practice, you can try the Attention-Sensation Experiment: When you notice discomfort, bring your full attention to the sensation without resistance. Notice how the quality of the sensation may change as you observe it.</li>
            </ol>
            
            <p><strong>Progression Requirement:</strong> Complete at least 3 sessions at this duration before moving to T5.</p>
          </div>
        );
      case "t5":
        return (
          <div className="substage-content">
            <h3>T5: 30 minutes or more - Full practice duration</h3>
            
            <h4>Instructions:</h4>
            <ol>
              <li>Set your timer for at least 30 minutes.</li>
              <li>Maintain physical stillness throughout the session.</li>
              <li>This is the foundation duration for all future practice.</li>
            </ol>
            
            <p><strong>Completion Requirement:</strong> You must complete 15 practice hours at the T5 stage (30 minutes or more sessions) and feel confident in your ability to maintain physical stillness for this duration before proceeding to Stage Two.</p>
            
            <div className="completion-note">
              <h4>Completing Stage One</h4>
              <p>As you complete Stage One (Physical Readiness), reflect on how far you've come. From your first 10-minute session to now being able to sit still for 30 minutes or more, you've developed a capacity that few in our restless society possess.</p>
              <p>This accomplishment is significant not just as a physical feat but as an expression of your commitment to this practice. The physical container you've created will hold the mental work that follows in subsequent stages.</p>
              
              <h4>Qualities You've Developed</h4>
              <ul>
                <li><strong>Patience:</strong> The willingness to progress gradually, honoring your body's pace</li>
                <li><strong>Perseverance:</strong> The ability to continue despite challenges</li>
                <li><strong>Presence:</strong> The capacity to remain with your experience as it unfolds</li>
                <li><strong>Discernment:</strong> The wisdom to distinguish between discomfort and pain</li>
                <li><strong>Commitment:</strong> The dedication to follow through on your practice intention</li>
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="substage-content">
            <p>Select a practice level (T1-T5) to view specific instructions.</p>
          </div>
        );
    }
  }, [selectedSubstage]);
  
  return (
    <div className="stage-instructions">
      <div className="stage-instructions-header">
        <button 
          className="back-button" 
          onClick={onBack}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, onBack)}
          aria-label="Go back to previous page"
        >
          Back
        </button>
        <h1>Stage Instructions</h1>
      </div>
      
      <div className="stage-instructions-content">
        <div className="stage-selector" role="tablist" aria-label="Stage selection">
          {[
            { id: 1, title: "Seeker: Physical Readiness" },
            { id: 2, title: "Observer: Understanding Thought Patterns" },
            { id: 3, title: "Tracker: Dot Tracking Practice" },
            { id: 4, title: "Practitioner: Tool-Free Practice" },
            { id: 5, title: "Master: Sustained Presence" },
            { id: 6, title: "Illuminator: Integration & Teaching" }
          ].map((stage) => (
            <button 
              key={stage.id}
              className={selectedStage === stage.id ? "active" : ""} 
              onClick={() => handleStageSelect(stage.id)}
              onTouchStart={handleTouchStart}
              onKeyDown={(e) => handleKeyDown(e, () => handleStageSelect(stage.id))}
              role="tab"
              aria-selected={selectedStage === stage.id}
              aria-controls={`stage-${stage.id}-content`}
              aria-label={`Select ${stage.title}`}
            >
              {stage.title}
            </button>
          ))}
        </div>
        
        {selectedStage === 1 && (
          <div className="stage-one-content" id="stage-1-content" role="tabpanel">
            <div className="stage-overview">
              <h2>Seeker: Physical Readiness</h2>
              <p>Stage One focuses on developing the physical foundation necessary for all subsequent practice. The goal is to build the capacity to remain physically still for extended periods, creating a stable container for mental work.</p>
              
              <div className="progression-overview">
                <h3>T1-T5 Progression</h3>
                <p>Stage One is divided into 5 progressive levels, gradually building your capacity for physical stillness:</p>
                <div className="progression-steps">
                  {[
                    { id: "T1", description: "10 minutes" },
                    { id: "T2", description: "15 minutes" },
                    { id: "T3", description: "20 minutes" },
                    { id: "T4", description: "25 minutes" },
                    { id: "T5", description: "30+ minutes" }
                  ].map((step) => (
                    <div key={step.id} className="progression-step">
                      <div className="step-indicator" aria-label={`${step.id}: ${step.description}`}>
                        {step.id}
                      </div>
                      <div className="step-description">{step.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="substage-selector" role="tablist" aria-label="Substage selection">
              {[
                { id: "t1", title: "T1: 10 minutes" },
                { id: "t2", title: "T2: 15 minutes" },
                { id: "t3", title: "T3: 20 minutes" },
                { id: "t4", title: "T4: 25 minutes" },
                { id: "t5", title: "T5: 30+ minutes" }
              ].map((substage) => (
                <button 
                  key={substage.id}
                  className={selectedSubstage === substage.id ? "active" : ""} 
                  onClick={() => handleSubstageSelect(substage.id)}
                  onTouchStart={handleTouchStart}
                  onKeyDown={(e) => handleKeyDown(e, () => handleSubstageSelect(substage.id))}
                  role="tab"
                  aria-selected={selectedSubstage === substage.id}
                  aria-controls={`substage-${substage.id}-content`}
                  aria-label={`Select ${substage.title}`}
                >
                  {substage.title}
                </button>
              ))}
            </div>
            
            <div id={`substage-${selectedSubstage}-content`} role="tabpanel">
              {renderStageOneContent()}
            </div>
            
            <div className="important-notes">
              <h3>Important Notes for Stage One</h3>
              <div className="note-card">
                <h4>The Difference Between Pain and Discomfort</h4>
                <p>As you extend your practice duration, it's important to distinguish between pain and discomfort. Discomfort is a natural part of the process—the body's resistance to remaining still. Pain, however, is a signal that something needs attention.</p>
                <p><strong>Discomfort</strong> might manifest as a mild ache in the back or legs, a feeling of restlessness, or the urge to shift position. These sensations are normal and can be worked with as part of the practice.</p>
                <p><strong>Pain</strong> is sharper, more intense, and often indicates potential injury. Examples include shooting pain down a limb, intense joint pain, or numbness that doesn't resolve quickly when changing position.</p>
              </div>
              
              <div className="note-card">
                <h4>Building Duration Gradually</h4>
                <p>This may seem like a gradual progression, but it's intentionally so. Small, achievable increases set you up for success rather than frustration.</p>
                <p>Remember that the goal is not to advance as quickly as possible but to build a solid foundation of practice that will support your entire journey.</p>
                <p>Different bodies have different strength levels and timing to adjust. If you are not 100% confident at any stage, do not proceed to the following stage. Delays are nothing to worry about.</p>
              </div>
            </div>
          </div>
        )}
        
        {selectedStage === 2 && (
          <div className="stage-content" id="stage-2-content" role="tabpanel">
            <h2>Observer: Understanding Thought Patterns</h2>
            <p>In Stage Two, you'll learn to observe your thought patterns without becoming entangled in them. This stage builds on the physical foundation established in Stage One.</p>
            
            <div className="stage-tool-highlight">
              <h3>The PAHM Matrix</h3>
              <p>Stage Two introduces the PAHM (Present Attention and Happiness Matrix), a powerful tool for understanding your mental patterns and the relationship between presence and emotional states.</p>
              <div className="tool-preview">
                <div className="matrix-preview" role="img" aria-label="PAHM Matrix with four quadrants showing different combinations of presence and happiness states">
                  <div className="matrix-row">
                    <div className="matrix-cell" style={{ backgroundColor: '#C8E6C9' }}>Present & Happy</div>
                    <div className="matrix-cell" style={{ backgroundColor: '#FFECB3' }}>Present & Unhappy</div>
                  </div>
                  <div className="matrix-row">
                    <div className="matrix-cell" style={{ backgroundColor: '#BBDEFB' }}>Not Present & Happy</div>
                    <div className="matrix-cell" style={{ backgroundColor: '#FFCDD2' }}>Not Present & Unhappy</div>
                  </div>
                </div>
                <button 
                  className="tool-button" 
                  onClick={handlePAHMClick}
                  onTouchStart={handleTouchStart}
                  onKeyDown={(e) => handleKeyDown(e, handlePAHMClick)}
                  aria-label="Explore the PAHM Matrix tool"
                >
                  Explore the PAHM Matrix
                </button>
              </div>
              
              <h3>Stage Two Practice Instructions</h3>
              <ol>
                <li><strong>Physical Foundation:</strong> Begin with the physical stillness practice developed in Stage One.</li>
                <li><strong>Thought Observation:</strong> As you sit in stillness, simply observe your thoughts without trying to change or control them.</li>
                <li><strong>PAHM Awareness:</strong> Notice which quadrant of the PAHM matrix you tend to occupy during your practice.</li>
                <li><strong>Daily Check-ins:</strong> Throughout your day, pause briefly to identify which quadrant you're in at that moment.</li>
              </ol>
              
              <div className="practice-note">
                <h4>Practice Duration</h4>
                <p>Continue with the 30-minute (or longer) sessions established in Stage One. The focus now shifts from physical stillness to mental observation.</p>
              </div>
            </div>
          </div>
        )}
        
        {selectedStage === 3 && (
          <div className="stage-content" id="stage-3-content" role="tabpanel">
            <h2>Tracker: Dot Tracking Practice</h2>
            <p>Stage Three introduces the dot tracking technique, a powerful method for developing sustained attention.</p>
            
            <div className="stage-tool-highlight">
              <h3>Poison Thoughts</h3>
              <p>This stage introduces the concept of "poison thoughts" - recurring thought patterns that pull you away from presence and into suffering.</p>
              <button 
                className="tool-button" 
                onClick={handlePoisonThoughtsClick}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, handlePoisonThoughtsClick)}
                aria-label="Learn about poison thoughts"
              >
                Learn About Poison Thoughts
              </button>
            </div>
            
            <h3>Dot Tracking Practice</h3>
            <ol>
              <li><strong>Physical Foundation:</strong> Begin with the physical stillness practice developed in Stage One.</li>
              <li><strong>Visualization:</strong> Visualize a small dot in your mind's eye, about the size of a pea.</li>
              <li><strong>Attention:</strong> Keep your attention focused on this dot.</li>
              <li><strong>Return:</strong> When your mind wanders (and it will), gently return your attention to the dot.</li>
              <li><strong>Tracking:</strong> Notice the patterns of when and how your attention wanders.</li>
            </ol>
            
            <div className="practice-note">
              <h4>Practice Duration</h4>
              <p>Continue with 30-minute sessions, focusing on the dot tracking technique.</p>
            </div>
          </div>
        )}
        
        {selectedStage === 4 && (
          <div className="stage-content" id="stage-4-content" role="tabpanel">
            <h2>Practitioner: Tool-Free Practice</h2>
            <p>In Stage Four, you'll learn to practice without external tools or supports, relying solely on your developed capacity for attention.</p>
            
            <h3>Tool-Free Practice Instructions</h3>
            <ol>
              <li><strong>Physical Foundation:</strong> Begin with the physical stillness practice developed in Stage One.</li>
              <li><strong>Open Awareness:</strong> Instead of focusing on a specific object like the dot, allow your awareness to rest in open presence.</li>
              <li><strong>Non-Attachment:</strong> Notice thoughts, sensations, and emotions as they arise, but don't attach to them or follow them.</li>
              <li><strong>Natural Presence:</strong> Rest in natural awareness without effort or striving.</li>
            </ol>
            
            <div className="practice-note">
              <h4>Practice Duration</h4>
              <p>Continue with 30-minute sessions, focusing on tool-free practice.</p>
            </div>
          </div>
        )}
        
        {selectedStage === 5 && (
          <div className="stage-content" id="stage-5-content" role="tabpanel">
            <h2>Master: Sustained Presence</h2>
            <p>Stage Five focuses on maintaining presence throughout daily activities, not just during formal practice sessions.</p>
            
            <h3>Sustained Presence Practice</h3>
            <ol>
              <li><strong>Formal Practice:</strong> Continue with daily formal practice sessions.</li>
              <li><strong>Activity Integration:</strong> Choose one daily activity (like washing dishes, walking, or eating) to practice full presence.</li>
              <li><strong>Presence Thread:</strong> Maintain a thread of awareness throughout your day, using transition moments (like walking through doorways) as reminders.</li>
              <li><strong>Gradual Expansion:</strong> Gradually expand the activities during which you maintain presence.</li>
            </ol>
            
            <div className="practice-note">
              <h4>Practice Duration</h4>
              <p>In addition to formal 30-minute sessions, practice presence during selected daily activities.</p>
            </div>
          </div>
        )}
        
        {selectedStage === 6 && (
          <div className="stage-content" id="stage-6-content" role="tabpanel">
            <h2>Illuminator: Integration & Teaching</h2>
            <p>The final stage involves fully integrating the practice into your life and potentially sharing it with others.</p>
            
            <h3>Integration & Teaching Practice</h3>
            <ol>
              <li><strong>Full Integration:</strong> Presence becomes your default state rather than something you practice.</li>
              <li><strong>Teaching Through Being:</strong> Your way of being becomes a teaching for others.</li>
              <li><strong>Formal Teaching:</strong> If called to do so, begin sharing these practices with others in a formal way.</li>
              <li><strong>Continued Growth:</strong> Recognize that the journey continues to deepen indefinitely.</li>
            </ol>
            
            <div className="practice-note">
              <h4>Practice Duration</h4>
              <p>At this stage, practice and life become inseparable. Formal sessions continue as a way to deepen and refresh your practice.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageInstructions;