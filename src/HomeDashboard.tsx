import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AssessmentPopup from './AssessmentPopup';
import AdminPanel from './components/AdminPanel';
import HappinessProgressTracker from './HappinessProgressTracker';

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
  const { currentUser } = useAuth();

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [showT1T5Dropdown, setShowT1T5Dropdown] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 SIMPLE: Just display happiness points - don't calculate
  const [showHappinessTracker, setShowHappinessTracker] = useState(false);
  const [happinessPoints, setHappinessPoints] = useState<number | null>(null);
  const [userLevel, setUserLevel] = useState('Seeker');

  // Assessment popup state
  const [showAssessmentPopup, setShowAssessmentPopup] = useState(false);

  // 🔧 SIMPLE: Just read from localStorage - no calculation needed
  const loadHappinessPoints = () => {
    if (!currentUser) {
      console.log('❌ No current user, using default happiness');
      setHappinessPoints(50);
      setUserLevel('Seeker');
      return;
    }

    try {
      console.log('📈 HomeDashboard: Loading happiness points from storage...');
      
      // Just read from localStorage - HappinessProgressTracker does the calculation
      const savedPoints = localStorage.getItem('happiness_points');
      const savedLevel = localStorage.getItem('user_level');
      
      if (savedPoints && savedLevel) {
        const points = parseInt(savedPoints, 10);
        if (!isNaN(points)) {
          console.log('✅ HomeDashboard: Using saved happiness points:', points);
          setHappinessPoints(points);
          setUserLevel(savedLevel);
          return;
        }
      }

      // Default values if nothing saved
      console.log('⚠️ HomeDashboard: No saved happiness data, using defaults');
      setHappinessPoints(50);
      setUserLevel('Seeker');
      
    } catch (error) {
      console.error('❌ Error loading happiness points:', error);
      setHappinessPoints(50);
      setUserLevel('Seeker');
    }
  };

  // 🔧 Listen for happiness updates from HappinessProgressTracker
  useEffect(() => {
    const handleHappinessUpdate = (event: any) => {
      console.log('🎯 HomeDashboard: Received happiness update event:', event.detail);
      if (event.detail?.happiness_points) {
        setHappinessPoints(event.detail.happiness_points);
      }
      if (event.detail?.user_level) {
        setUserLevel(event.detail.user_level);
      }
    };

    // Listen for custom happiness update events
    window.addEventListener('happinessUpdated', handleHappinessUpdate);
    
    // Also listen for storage events (in case another tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'happiness_points' && e.newValue) {
        const points = parseInt(e.newValue, 10);
        if (!isNaN(points)) {
          setHappinessPoints(points);
          console.log('📈 HomeDashboard: Happiness points updated from storage:', points);
        }
      }
      if (e.key === 'user_level' && e.newValue) {
        setUserLevel(e.newValue);
        console.log('🏆 HomeDashboard: User level updated from storage:', e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initial load when currentUser changes
    if (currentUser) {
      loadHappinessPoints();
    }

    return () => {
      window.removeEventListener('happinessUpdated', handleHappinessUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  // Check for assessment popup
  useEffect(() => {
    if (!currentUser) return;

    const questionnaireCompleted = currentUser.questionnaireCompleted;
    const assessmentCompleted = currentUser.assessmentCompleted;
    
    if (questionnaireCompleted && !assessmentCompleted) {
      console.log('📊 Showing assessment popup');
      setShowAssessmentPopup(true);
    }
  }, [currentUser]);

  // Fetch user data on component mount
  useEffect(() => {
    // Check if T5 is completed
    const t5Completed = sessionStorage.getItem('t5Completed') === 'true' ||
                        localStorage.getItem('t5Completed') === 'true';

    if (t5Completed && currentStage < 2) {
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 't5Completed' && e.newValue === 'true') {
        setCurrentStage(2);
        localStorage.setItem('devCurrentStage', '2');
        sessionStorage.setItem('stageProgress', '2');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentStage]);

  useEffect(() => {
    const stageProgress = sessionStorage.getItem('stageProgress');
    if (stageProgress) {
      const progressStage = parseInt(stageProgress, 10);
      if (!isNaN(progressStage) && progressStage > 0 && progressStage <= 6) {
        setCurrentStage(progressStage);
        localStorage.setItem('devCurrentStage', progressStage.toString());
      }
    }

    const returnFromStage1 = sessionStorage.getItem('returnFromStage1');
    if (returnFromStage1 === 'true') {
      setCurrentStage(1);
      setShowT1T5Dropdown(true);
      sessionStorage.removeItem('returnFromStage1');
    }

    if (location.state && location.state.fromT5Completion) {
      console.log('Coming from T5 completion, updating stage progress');
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');
      window.location.reload();
    }

    setStreak(3);
    setTotalHours(12.5);
  }, [location]);

  const handleStageClick = (stageNumber: number) => {
    const savedStage = localStorage.getItem('devCurrentStage');
    const highestStage = savedStage ? parseInt(savedStage, 10) : 1;

    if (stageNumber === 1) {
      setShowT1T5Dropdown(!showT1T5Dropdown);
      return;
    }

    setCurrentStage(stageNumber);

    if (stageNumber > highestStage) {
      localStorage.setItem('devCurrentStage', stageNumber.toString());
    } else {
      localStorage.setItem('devCurrentStage', highestStage.toString());
    }

    navigate(`/stage${stageNumber}`);
  };

  const handleTLevelClick = (level: string, duration: number) => {
    sessionStorage.setItem('currentTLevel', level.toLowerCase());

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

  const handleGoToAssessment = () => {
    setShowAssessmentPopup(false);
    navigate('/self-assessment');
  };

  const handleCloseAssessmentPopup = () => {
    setShowAssessmentPopup(false);
  };

  // 🎯 HAPPINESS TRACKER HANDLERS
  const handleHappinessPointsClick = () => {
    setShowHappinessTracker(true);
  };

  const handleCloseHappinessTracker = () => {
    setShowHappinessTracker(false);
    // Refresh happiness points after closing tracker
    setTimeout(() => {
      loadHappinessPoints();
    }, 100);
  };

  // Debug function for happiness points
  const handleHappinessDebug = () => {
    console.log('🔍 HAPPINESS DEBUG INFO:');
    console.log('Current happiness points:', happinessPoints);
    console.log('Current user level:', userLevel);
    console.log('localStorage happiness_points:', localStorage.getItem('happiness_points'));
    console.log('localStorage user_level:', localStorage.getItem('user_level'));
    console.log('Current user:', currentUser);
    
    // Force reload from storage
    console.log('🔄 RELOADING FROM STORAGE...');
    loadHappinessPoints();
  };

  const tLevels = [
    { level: 'T1', duration: 10, title: 'T1: Physical Stillness for 10 minutes' },
    { level: 'T2', duration: 15, title: 'T2: Physical Stillness for 15 minutes' },
    { level: 'T3', duration: 20, title: 'T3: Physical Stillness for 20 minutes' },
    { level: 'T4', duration: 25, title: 'T4: Physical Stillness for 25 minutes' },
    { level: 'T5', duration: 30, title: 'T5: Physical Stillness for 30 minutes' }
  ];

  const stageData = [
    { num: 2, title: 'PAHM Trainee', desc: 'Basic attention training' },
    { num: 3, title: 'PAHM Beginner', desc: 'Structured practice' },
    { num: 4, title: 'PAHM Practitioner', desc: 'Advanced techniques' },
    { num: 5, title: 'PAHM Master', desc: 'Refined awareness' },
    { num: 6, title: 'PAHM Illuminator', desc: 'Complete mastery' }
  ];

  const resourceData = [
    {
      icon: '📖',
      title: `Stage ${currentStage} Guide`,
      desc: 'Learn about your current stage and practice techniques',
      onClick: onViewLearning
    },
    {
      icon: '🧘',
      title: 'Posture Guide',
      desc: 'Find the optimal meditation posture for your practice',
      onClick: onShowPostureGuide
    },
    {
      icon: '🔍',
      title: 'PAHM Matrix Explained',
      desc: 'Understand the Present Attention and Happiness Matrix',
      onClick: onShowPAHMExplanation
    }
  ];

  // Get display happiness points (handle null state)
  const displayHappinessPoints = happinessPoints !== null ? happinessPoints : 50;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Admin Panel */}
      <AdminPanel />

      {/* 🎯 HAPPINESS TRACKER MODAL */}
      {showHappinessTracker && (
        <HappinessProgressTracker onClose={handleCloseHappinessTracker} />
      )}

      {/* Assessment Popup */}
      {showAssessmentPopup && (
        <AssessmentPopup
          isOpen={showAssessmentPopup}
          onClose={handleCloseAssessmentPopup}
          onGoToAssessment={handleGoToAssessment}
        />
      )}

      {/* Header with Happiness Points Display */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(18px, 4vw, 28px)',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Welcome{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}
          </h1>
        </div>
        
        {/* 🎯 HAPPINESS POINTS DISPLAY */}
        <div 
          onClick={handleHappinessPointsClick}
          onDoubleClick={handleHappinessDebug}
          style={{
            background: displayHappinessPoints > 400 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'  // Green for good scores
              : displayHappinessPoints > 200
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'  // Orange for medium scores
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red for low scores
            padding: '12px 24px',
            borderRadius: '50px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            minWidth: '120px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
          }}
        >
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            😊 {displayHappinessPoints}
          </div>
          <div style={{
            fontSize: '11px',
            opacity: 0.9,
            fontWeight: '500'
          }}>
            Happiness Points
          </div>
          {displayHappinessPoints > 400 && (
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid white',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ✨
            </div>
          )}
        </div>
        
        {/* Quick Stats */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginTop: '8px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '8px 12px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            🔥 {streak} day streak
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '8px 12px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            ⏱️ {totalHours}h total
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '8px 12px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            🏆 {userLevel}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Journey Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: 'clamp(20px, 5vw, 32px)',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Your Journey
            </h2>
            <div style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Stage {currentStage}/6
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: 'linear-gradient(90deg, #f1f3f4 0%, #e8eaed 100%)',
            height: '8px',
            borderRadius: '4px',
            marginBottom: '32px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: `${Math.min(100, (currentStage / 6) * 100)}%`,
              borderRadius: '4px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }} />
          </div>

          {/* Stages Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {/* Stage 1 with Dropdown */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div 
                onClick={() => handleStageClick(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: showT1T5Dropdown ? '16px' : '0'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: (sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true') 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : currentStage === 1 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  marginRight: '16px'
                }}>
                  {(sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true') ? '✓' : '1'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    Seeker
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    Physical stillness training
                  </p>
                </div>
                <div style={{
                  fontSize: '16px',
                  color: '#667eea',
                  transform: showT1T5Dropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  ▼
                </div>
              </div>

              {/* T1-T5 Dropdown */}
              {showT1T5Dropdown && (
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    Choose Your Training Level
                  </div>
                  <div style={{
                    display: 'grid',
                    gap: '8px'
                  }}>
                    {tLevels.map((tLevel) => (
                      <button
                        key={tLevel.level}
                        onClick={() => handleTLevelClick(tLevel.level, tLevel.duration)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          color: 'white',
                          padding: '12px 16px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'translateX(0px)';
                        }}
                      >
                        {tLevel.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PAHM Stages 2-6 */}
            {stageData.map((stage) => (
              <div
                key={stage.num}
                onClick={() => handleStageClick(stage.num)}
                style={{
                  background: currentStage >= stage.num 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(209, 213, 219, 0.08) 0%, rgba(156, 163, 175, 0.08) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: currentStage >= stage.num 
                    ? '2px solid rgba(102, 126, 234, 0.2)'
                    : '2px solid rgba(209, 213, 219, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: currentStage >= stage.num ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (currentStage >= stage.num) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: currentStage >= stage.num 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    marginRight: '16px'
                  }}>
                    {stage.num}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: currentStage >= stage.num ? '#1f2937' : '#9ca3af'
                    }}>
                      {stage.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: currentStage >= stage.num ? '#6b7280' : '#9ca3af'
                    }}>
                      {stage.desc}
                    </p>
                  </div>
                  {currentStage < stage.num && (
                    <div style={{
                      fontSize: '16px',
                      color: '#9ca3af'
                    }}>
                      🔒
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <button
                onClick={onViewProgress}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                📊 View Progress
              </button>
              <button
                onClick={() => navigate('/notes')}
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                📝 Daily Notes
              </button>
              <button
                onClick={() => navigate('/mind-recovery')}
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                🧠 Mind Recovery
              </button>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '20px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Learning Resources
            </h3>
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {resourceData.map((resource, index) => (
                <button
                  key={index}
                  onClick={resource.onClick}
                  style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      marginRight: '12px'
                    }}>
                      {resource.icon}
                    </span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {resource.title}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    {resource.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomeDashboard;