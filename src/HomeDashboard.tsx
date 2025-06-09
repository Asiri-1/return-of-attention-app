import React, { useState, useEffect } from 'react';
import './HomeDashboard.css';
import { useAuth } from './AuthContext';
import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import StageOneProgression from './StageOneProgression';
import AssessmentPopup from './AssessmentPopup';

interface HomeDashboardProps {
  onStartPractice: () => void;
  onViewProgress: () => void;
  onViewLearning: () => void;
  onLogout: () => void;
  onStartStage2: () => void;
  onStartStage3: () => void;
  onStartStage4: () => void;
  onStartStage5: () => void;
  onStartStage6: () => void;
  onShowPostureGuide: () => void;
  onShowPAHMExplanation: () => void;
  onShowWhatIsPAHM: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartPractice,
  onViewProgress,
  onViewLearning,
  onLogout,
  onStartStage2,
  onStartStage3,
  onStartStage4,
  onStartStage5,
  onStartStage6,
  onShowPostureGuide,
  onShowPAHMExplanation,
  onShowWhatIsPAHM
}) => {
  const { currentUser, logout } = useAuth();

  // Handle logout function
  const handleSignOut = () => {
    logout();
    window.location.href = '/';
  };
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [currentTLevel, setCurrentTLevel] = useState<string>('T1');
  const [streak, setStreak] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [forceUpdate, setForceUpdate] = useState<number>(0); // Add state for forcing re-renders
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user data on component mount
  // Force a re-render when the component mounts or when returning to this page
  useEffect(() => {
    // Check if T5 is completed
    const t5Completed = sessionStorage.getItem('t5Completed') === 'true' ||
                        localStorage.getItem('t5Completed') === 'true';

    // If T5 is completed, ensure currentStage is at least 2
    if (t5Completed && currentStage < 2) {
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');

      // Force a re-render by updating a state variable
      setForceUpdate(prev => prev + 1);
    }

    // Add event listener for storage changes (for when T5 is completed in another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 't5Completed' && e.newValue === 'true') {
        setCurrentStage(2);
        localStorage.setItem('devCurrentStage', '2');
        sessionStorage.setItem('stageProgress', '2');

        // Force a re-render
        setForceUpdate(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentStage]);

  useEffect(() => {
    // Check for stage progress in sessionStorage (set by reflection components)
    const stageProgress = sessionStorage.getItem('stageProgress');
    if (stageProgress) {
      const progressStage = parseInt(stageProgress, 10);
      if (!isNaN(progressStage) && progressStage > 0 && progressStage <= 6) {
        setCurrentStage(progressStage);
        localStorage.setItem('devCurrentStage', progressStage.toString());
      }
    }

    // Force Stage 1 to show T1-T5 options when returning from Stage1 components
    const returnFromStage1 = sessionStorage.getItem('returnFromStage1');
    if (returnFromStage1 === 'true') {
      setCurrentStage(1);
      sessionStorage.removeItem('returnFromStage1'); // Clear the flag after use
    }

    // Check if we're coming from T5 completion
    if (location.state && location.state.fromT5Completion) {
      console.log('Coming from T5 completion, updating stage progress');
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');

      // Force a page reload to ensure all components update
      window.location.reload();
    }

    // Mock streak data
    setStreak(3);

    // Mock total practice hours
    setTotalHours(12.5);

    // Mock recent sessions
    setRecentSessions([
      {
        id: 'session-1',
        date: new Date(Date.now() - 86400000), // Yesterday
        duration: 30,
        presentPercentage: 42
      },
      {
        id: 'session-2',
        date: new Date(Date.now() - 86400000 * 3), // 3 days ago
        duration: 25,
        presentPercentage: 38
      },
      {
        id: 'session-3',
        date: new Date(Date.now() - 86400000 * 5), // 5 days ago
        duration: 35,
        presentPercentage: 45
      }
    ]);
  }, [location]);

  // Format date for display
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // State for assessment popup
  const [showAssessmentPopup, setShowAssessmentPopup] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    type: 'stage' | 'tlevel';
    stageNumber?: number;
    level?: string;
    duration?: number;
  } | null>(null);

  // Handle stage button click for development purposes
  const handleStageClick = (stageNumber: number) => {
    // Get the highest stage the user has reached
    const savedStage = localStorage.getItem('devCurrentStage');
    const highestStage = savedStage ? parseInt(savedStage, 10) : 1;

    // For all stages, update the display stage
    setCurrentStage(stageNumber);

    // Only update localStorage if clicking on a stage that's higher than current progress
    if (stageNumber > highestStage) {
      localStorage.setItem('devCurrentStage', stageNumber.toString());
    } else {
      // Keep the highest stage in localStorage for progress bar
      localStorage.setItem('devCurrentStage', highestStage.toString());
    }

    // Navigate to the specific stage wrapper component
    navigate(`/stage${stageNumber}`);
  };

  // Handle T-level click with duration parameter
  const handleTLevelClick = (level: string, duration: number) => {
    setCurrentTLevel(level);

    // Store the selected T-level in sessionStorage for this session
    sessionStorage.setItem('currentTLevel', level.toLowerCase());

    // Navigate to Stage1Wrapper with a flag to show T1Introduction
    navigate(`/stage1`, { 
      state: { 
        showT1Introduction: true,
        level: level,
        duration: duration,
        stageLevel: `${level}: Physical Stillness for ${duration} minutes`,
        returnToStage: 1
      } 
    });
  };

  // Handle going to assessment from popup
  const handleGoToAssessment = () => {
    setShowAssessmentPopup(false);

    // Navigate directly to self-assessment instead of introduction
    navigate('/self-assessment');

    // Reset pending navigation
    setPendingNavigation(null);
  };

  // Handle closing assessment popup
  const handleCloseAssessmentPopup = () => {
    setShowAssessmentPopup(false);
    setPendingNavigation(null);
  };

  // Reset progress function for development purposes
  const handleResetProgress = () => {
    // Clear all progress data from localStorage and sessionStorage
    localStorage.removeItem('devCurrentStage');
    sessionStorage.removeItem('stageProgress');
    sessionStorage.removeItem('returnFromStage1');
    sessionStorage.removeItem('currentTLevel');

    // Clear PAHM tracking data
    for (let i = 1; i <= 6; i++) {
      sessionStorage.removeItem(`pahmCounts${i}`);
    }

    // Clear T-level progress
    for (let i = 1; i <= 5; i++) {
      sessionStorage.removeItem(`t${i}Completed`);
    }

    // Reset to Stage 1
    setCurrentStage(1);
    setCurrentTLevel('T1');

    // Reload the page to ensure all components update
    window.location.reload();
  };

  return (
    <div className="home-dashboard">
      {/* Development-only reset button */}
      <button 
        onClick={handleResetProgress}
        style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          backgroundColor: '#FF5252',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          border: 'none',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 1000,
          opacity: 0.8
        }}
      >
        DEV: Reset Progress
      </button>

      {/* Assessment Popup */}
      {showAssessmentPopup && (
        <AssessmentPopup
          isOpen={showAssessmentPopup}
          onClose={handleCloseAssessmentPopup}
          onGoToAssessment={handleGoToAssessment}
        />
      )}

      <header className="dashboard-header">
        <div className="logo-container">
          <Logo />
        </div>
        <h1>Welcome{currentUser?.name ? `, ${currentUser.name}` : ''}</h1>
      </header>

      <main className="dashboard-content">
        <section className="stage-indicator">
          <h2>Your Journey</h2>
          <div className="stage-progress">
            {/* Progress bar */}
            <div className="journey-progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, (currentStage / 6) * 100)}%` }}
              />
            </div>

            {/* Stages list */}
            <div className="stages-list">
              {/* Stage 1 */}
              <div className="stage-item">
                <div 
                  className={`stage-number ${(sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true') ? 'completed' : currentStage > 1 ? 'completed' : currentStage === 1 ? 'current' : 'locked'}`}
                  onClick={() => handleStageClick(1)}
                >
                  1
                </div>
                <div className={`practitioner-level ${(sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true') ? '' : currentStage === 1 ? 'current' : currentStage < 1 ? 'locked' : ''}`}>
                  Seeker
                  {(sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true' || 
                    currentStage > 1) && 
                    <div className="completion-status">Completed ✓</div>}
                </div>
                {/* Connector line to next stage */}
                <div 
                  className={`stage-connector ${(sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true') ? 'completed' : currentStage > 1 ? 'completed' : ''}`}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Stage 2 - Always shows number 2 and is clickable with proper circle styling */}
              <div className="stage-item">
                <div 
                  className={`stage-number ${currentStage > 2 ? 'completed' : currentStage === 2 ? 'current' : 'locked'}`}
                  onClick={() => handleStageClick(2)}
                >
                  2
                </div>
                <div className={`practitioner-level ${currentStage === 2 ? 'current' : currentStage < 2 ? 'locked' : ''}`}>
                  PAHM Trainee
                </div>
                {/* Connector line to next stage */}
                <div 
                  className={`stage-connector ${currentStage > 2 ? 'completed' : ''}`}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Stage 3 */}
              <div className="stage-item">
                <div 
                  className={`stage-number ${currentStage > 3 ? 'completed' : currentStage === 3 ? 'current' : 'locked'}`}
                  onClick={() => handleStageClick(3)}
                >
                  3
                </div>
                <div className={`practitioner-level ${currentStage === 3 ? 'current' : currentStage < 3 ? 'locked' : ''}`}>
                  PAHM Beginner
                </div>
                {/* Connector line to next stage */}
                <div 
                  className={`stage-connector ${currentStage > 3 ? 'completed' : ''}`}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Stage 4 */}
              <div className="stage-item">
                <div 
                  className={`stage-number ${currentStage > 4 ? 'completed' : currentStage === 4 ? 'current' : 'locked'}`}
                  onClick={() => handleStageClick(4)}
                >
                  4
                </div>
                <div className={`practitioner-level ${currentStage === 4 ? 'current' : currentStage < 4 ? 'locked' : ''}`}>
                  PAHM Practitioner
                </div>
                {/* Connector line to next stage */}
                <div 
                  className={`stage-connector ${currentStage > 4 ? 'completed' : ''}`}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Stage 5 */}
              <div className="stage-item">
                <div 
                  className={`stage-number ${currentStage > 5 ? 'completed' : currentStage === 5 ? 'current' : 'locked'}`}
                  onClick={() => handleStageClick(5)}
                >
                  5
                </div>
                <div className={`practitioner-level ${currentStage === 5 ? 'current' : currentStage < 5 ? 'locked' : ''}`}>
                  PAHM Master
                </div>
                {/* Connector line to next stage */}
                <div 
                  className={`stage-connector ${currentStage > 5 ? 'completed' : ''}`}
                  style={{ width: '100%' }}
                />
              </div>
            
              {/* Stage 6 */}
              <div className="stage-item">
                <div 
                  className={`stage-number ${currentStage > 6 ? 'completed' : currentStage === 6 ? 'current' : 'locked'}`}
                  onClick={() => handleStageClick(6)}
                >
                  6
                </div>
                <div className={`practitioner-level ${currentStage === 6 ? 'current' : currentStage < 6 ? 'locked' : ''}`}>
                  PAHM Illuminator
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stage One T1-T5 Progression */}
        {currentStage === 1 && (
          <StageOneProgression 
            currentLevel={currentTLevel} 
            onLevelClick={handleTLevelClick} 
          />
        )}
        
        {/* Practice button removed as requested */}
        
        <section className="learning-resources">
          <div className="section-header">
            <h2>Learning Resources</h2>
            <button className="text-button" onClick={onViewLearning}>View All</button>
          </div>
          
          <div className="resource-cards">
            <div className="resource-card" onClick={onViewLearning}>
              <div className="resource-icon">📖</div>
              <div className="resource-title">Stage {currentStage} Guide</div>
              <div className="resource-description">
                Learn about your current stage and practice techniques
              </div>
            </div>
            <div className="resource-card" onClick={onShowPostureGuide}>
              <div className="resource-icon">🧘</div>
              <div className="resource-title">Posture Guide</div>
              <div className="resource-description">
                Find the optimal meditation posture for your practice
              </div>
            </div>
            <div className="resource-card" onClick={onShowPAHMExplanation}>
              <div className="resource-icon">🔍</div>
              <div className="resource-title">PAHM Matrix Explained</div>
              <div className="resource-description">
                Understand the Present Attention and Happiness Matrix
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeDashboard;


