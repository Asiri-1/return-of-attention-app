import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const { currentUser } = useAuth();

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [showT1T5Dropdown, setShowT1T5Dropdown] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const [showAssessmentPopup, setShowAssessmentPopup] = useState(false);

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

  const handleResetProgress = () => {
    localStorage.removeItem('devCurrentStage');
    sessionStorage.removeItem('stageProgress');
    sessionStorage.removeItem('returnFromStage1');
    sessionStorage.removeItem('currentTLevel');

    for (let i = 1; i <= 6; i++) {
      sessionStorage.removeItem(`pahmCounts${i}`);
    }

    for (let i = 1; i <= 5; i++) {
      sessionStorage.removeItem(`t${i}Completed`);
    }

    setCurrentStage(1);
    setShowT1T5Dropdown(false);
    window.location.reload();
  };

  const tLevels = [
    { level: 'T1', duration: 5, title: 'T1: Physical Stillness for 5 minutes' },
    { level: 'T2', duration: 10, title: 'T2: Physical Stillness for 10 minutes' },
    { level: 'T3', duration: 15, title: 'T3: Physical Stillness for 15 minutes' },
    { level: 'T4', duration: 20, title: 'T4: Physical Stillness for 20 minutes' },
    { level: 'T5', duration: 25, title: 'T5: Physical Stillness for 25 minutes' }
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Development Reset Button */}
      <button 
        onClick={handleResetProgress}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '11px',
          fontWeight: '600',
          cursor: 'pointer',
          zIndex: 1000,
          opacity: 0.8,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'translateY(0px)';
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

      {/* Header */}
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
                          transition: 'all 0.3s ease',
                          textAlign: 'left',
                          backdropFilter: 'blur(5px)',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.transform = 'translateY(0px)';
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>{tLevel.level}</div>
                        <div style={{ 
                          fontSize: '11px', 
                          opacity: 0.9,
                          marginTop: '2px'
                        }}>
                          Physical Stillness for {tLevel.duration} minutes
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stages 2-6 */}
            {stageData.map((stage) => (
              <div
                key={stage.num}
                onClick={() => handleStageClick(stage.num)}
                style={{
                  background: currentStage >= stage.num 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(209, 213, 219, 0.3) 0%, rgba(156, 163, 175, 0.3) 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: currentStage >= stage.num 
                    ? '2px solid rgba(102, 126, 234, 0.2)'
                    : '2px solid rgba(209, 213, 219, 0.3)',
                  cursor: currentStage >= stage.num ? 'pointer' : 'not-allowed',
                  opacity: currentStage >= stage.num ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center'
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
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: currentStage > stage.num 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : currentStage === stage.num 
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
                  {currentStage > stage.num ? '✓' : stage.num}
                </div>
                <div>
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
              </div>
            ))}
          </div>
        </section>
        
        {/* Learning Resources */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: 'clamp(20px, 5vw, 32px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
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
              Learning Resources
            </h2>
            <button 
              onClick={onViewLearning}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              View All
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {resourceData.map((resource, index) => (
              <div
                key={index}
                onClick={resource.onClick}
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(102, 126, 234, 0.15)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)';
                }}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '16px'
                }}>
                  {resource.icon}
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {resource.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {resource.desc}
                </p>
              </div>
            ))}
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

        @media (max-width: 768px) {
          .stages-grid {
            grid-template-columns: 1fr !important;
          }
          
          .resource-grid {
            grid-template-columns: 1fr !important;
          }
          
          .header-flex {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .stats-flex {
            margin-top: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .header-padding {
            padding: 12px 16px !important;
          }
          
          .main-padding {
            padding: 16px !important;
          }
          
          .section-padding {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeDashboard;