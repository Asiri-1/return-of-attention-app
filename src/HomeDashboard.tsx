import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AssessmentPopup from './AssessmentPopup';
import AdminPanel from './components/AdminPanel';

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

  // ✅ FIXED: Read happiness points from localStorage (where HappinessProgressTracker saves them)
  const [happinessPoints, setHappinessPoints] = useState<number>(50);
  const [userLevel, setUserLevel] = useState('Seeker');

  // Assessment popup state
  const [showAssessmentPopup, setShowAssessmentPopup] = useState(false);

  // Calculate real user stats instead of hardcoded values
  const calculateUserStats = () => {
    if (!currentUser) {
      console.log('❌ No current user, using default stats');
      setStreak(0);
      setTotalHours(0);
      return;
    }

    try {
      console.log('📊 Calculating real user stats...');
      
      // Calculate streak from practice sessions
      const today = new Date();
      let currentStreak = 0;
      let totalPracticeHours = 0;

      // Check localStorage for practice session data
      const practiceData = JSON.parse(localStorage.getItem('practiceSessionData') || '[]');
      
      if (Array.isArray(practiceData) && practiceData.length > 0) {
        // Calculate total hours from all sessions
        totalPracticeHours = practiceData.reduce((total: number, session: any) => {
          const duration = session.duration || 0;
          return total + (duration / 60); // Convert minutes to hours
        }, 0);

        // Calculate streak (consecutive days with practice)
        const sortedSessions = practiceData
          .map((session: any) => new Date(session.timestamp || session.date))
          .sort((a: Date, b: Date) => b.getTime() - a.getTime());

        if (sortedSessions.length > 0) {
          let streakCount = 0;
          let currentDate = new Date(today);
          currentDate.setHours(0, 0, 0, 0);

          for (let i = 0; i < sortedSessions.length; i++) {
            const sessionDate = new Date(sortedSessions[i]);
            sessionDate.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === streakCount) {
              streakCount++;
              currentDate.setDate(currentDate.getDate() - 1);
            } else {
              break;
            }
          }
          currentStreak = streakCount;
        }
      }

      // Alternative: Check user profile for basic stats
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (userProfile.practiceStats) {
        totalPracticeHours = userProfile.practiceStats.totalHours || totalPracticeHours;
        currentStreak = userProfile.practiceStats.streak || currentStreak;
      }

      // Set calculated values
      setStreak(currentStreak);
      setTotalHours(Math.round(totalPracticeHours * 10) / 10); // Round to 1 decimal

      console.log('✅ Real user stats calculated:', {
        streak: currentStreak,
        totalHours: totalPracticeHours,
        sessionsFound: practiceData.length
      });

    } catch (error) {
      console.error('❌ Error calculating user stats:', error);
      // Fallback to defaults for new users
      setStreak(0);
      setTotalHours(0);
    }
  };

  // ✅ FIXED: Read happiness points from localStorage where HappinessProgressTracker saves them
  const loadHappinessPoints = () => {
    try {
      console.log('📈 HomeDashboard: Loading happiness points from localStorage...');
      
      // Read from localStorage where HappinessProgressTracker saves the results
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

      // Default values if nothing saved (new users)
      console.log('⚠️ HomeDashboard: No saved happiness data, using defaults for new user');
      setHappinessPoints(50);
      setUserLevel('Seeker');
      
    } catch (error) {
      console.error('❌ Error loading happiness points:', error);
      setHappinessPoints(50);
      setUserLevel('Seeker');
    }
  };

  // ✅ FIXED: Listen for happiness updates from HappinessProgressTracker
  useEffect(() => {
    const handleHappinessUpdate = (event: any) => {
      console.log('🎯 HomeDashboard: Received happiness update event:', event.detail);
      if (event.detail?.happiness_points) {
        setHappinessPoints(event.detail.happiness_points);
        console.log('📈 HomeDashboard: Updated happiness points to:', event.detail.happiness_points);
      }
      if (event.detail?.user_level) {
        setUserLevel(event.detail.user_level);
        console.log('🏆 HomeDashboard: Updated user level to:', event.detail.user_level);
      }
    };

    // Listen for custom happiness update events from HappinessProgressTracker
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
      calculateUserStats();
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

    // Calculate real stats instead
    calculateUserStats();
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

  // Navigate to dedicated happiness page instead of showing modal
  const handleHappinessPointsClick = () => {
    console.log('🎯 Navigating to dedicated happiness tracker page');
    navigate('/happiness-tracker');
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Admin Panel */}
      <AdminPanel />

      {/* Assessment Popup */}
      {showAssessmentPopup && (
        <AssessmentPopup
          isOpen={showAssessmentPopup}
          onClose={handleCloseAssessmentPopup}
          onGoToAssessment={handleGoToAssessment}
        />
      )}

      {/* MOBILE RESPONSIVE HEADER */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: 'clamp(12px, 3vw, 20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Title - Mobile Responsive */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(16px, 5vw, 28px)',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            Welcome{currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}
          </h1>
        </div>
        
        {/* ✅ FIXED: MOBILE RESPONSIVE HAPPINESS POINTS - Now shows correct value from localStorage */}
        <div 
          onClick={handleHappinessPointsClick}
          style={{
            background: happinessPoints > 400 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : happinessPoints > 200
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 24px)',
            borderRadius: '50px',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            minWidth: 'clamp(100px, 25vw, 120px)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            flexShrink: 0
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
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            😊 {happinessPoints}
          </div>
          <div style={{
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            opacity: 0.9,
            fontWeight: '500'
          }}>
            Happiness Points
          </div>
          {happinessPoints > 400 && (
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
        
        {/* MOBILE RESPONSIVE QUICK STATS */}
        <div style={{
          display: 'flex',
          gap: 'clamp(8px, 2vw, 16px)',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          marginTop: '8px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            🔥 {streak} day{streak !== 1 ? 's' : ''} streak
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            ⏱️ {totalHours}h total
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            🏆 {userLevel}
          </div>
        </div>
      </header>

      {/* MOBILE RESPONSIVE MAIN CONTENT */}
      <main style={{
        padding: 'clamp(16px, 4vw, 20px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Journey Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'clamp(16px, 4vw, 20px)',
          padding: 'clamp(20px, 5vw, 32px)',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 'clamp(20px, 5vw, 28px)',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              flex: '1 1 auto'
            }}>
              Your Journey
            </h2>
            <div style={{
              padding: '6px 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '20px',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              fontWeight: '600',
              flexShrink: 0
            }}>
              Stage {currentStage}/6
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: 'linear-gradient(90deg, #f1f3f4 0%, #e8eaed 100%)',
            height: 'clamp(6px, 1.5vw, 8px)',
            borderRadius: 'clamp(3px, 1vw, 4px)',
            marginBottom: '32px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: `${Math.min(100, (currentStage / 6) * 100)}%`,
              borderRadius: 'clamp(3px, 1vw, 4px)',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }} />
          </div>

          {/* MOBILE RESPONSIVE STAGES GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
            gap: 'clamp(16px, 4vw, 20px)'
          }}>
            {/* Stage 1 with Dropdown */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
              borderRadius: 'clamp(12px, 3vw, 16px)',
              padding: 'clamp(16px, 4vw, 20px)',
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
                  width: 'clamp(40px, 10vw, 48px)',
                  height: 'clamp(40px, 10vw, 48px)',
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
                  fontSize: 'clamp(14px, 4vw, 18px)',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  marginRight: 'clamp(12px, 3vw, 16px)',
                  flexShrink: 0
                }}>
                  {(sessionStorage.getItem('t5Completed') === 'true' || 
                    localStorage.getItem('t5Completed') === 'true') ? '✓' : '1'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: 'clamp(16px, 4vw, 18px)',
                    fontWeight: '700',
                    color: '#1f2937'
                  }}>
                    Seeker
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    Physical stillness training
                  </p>
                </div>
                <div style={{
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  color: '#667eea',
                  transform: showT1T5Dropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  flexShrink: 0
                }}>
                  ▼
                </div>
              </div>

              {/* T1-T5 Dropdown - Mobile Responsive */}
              {showT1T5Dropdown && (
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 'clamp(8px, 2vw, 12px)',
                  padding: 'clamp(12px, 3vw, 16px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    fontWeight: '600',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    Choose Your Training Level
                  </div>
                  <div style={{
                    display: 'grid',
                    gap: 'clamp(6px, 1.5vw, 8px)'
                  }}>
                    {tLevels.map((tLevel) => (
                      <button
                        key={tLevel.level}
                        onClick={() => handleTLevelClick(tLevel.level, tLevel.duration)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: 'clamp(6px, 1.5vw, 8px)',
                          color: 'white',
                          padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                          fontSize: 'clamp(11px, 2.5vw, 13px)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                          width: '100%'
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

            {/* PAHM Stages 2-6 - Mobile Responsive */}
            {stageData.map((stage) => (
              <div
                key={stage.num}
                onClick={() => handleStageClick(stage.num)}
                style={{
                  background: currentStage >= stage.num 
                    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(209, 213, 219, 0.08) 0%, rgba(156, 163, 175, 0.08) 100%)',
                  borderRadius: 'clamp(12px, 3vw, 16px)',
                  padding: 'clamp(16px, 4vw, 20px)',
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
                    width: 'clamp(40px, 10vw, 48px)',
                    height: 'clamp(40px, 10vw, 48px)',
                    borderRadius: '50%',
                    background: currentStage >= stage.num 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(14px, 4vw, 18px)',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    marginRight: 'clamp(12px, 3vw, 16px)',
                    flexShrink: 0
                  }}>
                    {stage.num}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: 'clamp(16px, 4vw, 18px)',
                      fontWeight: '700',
                      color: currentStage >= stage.num ? '#1f2937' : '#9ca3af'
                    }}>
                      {stage.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: 'clamp(12px, 3vw, 14px)',
                      color: currentStage >= stage.num ? '#6b7280' : '#9ca3af',
                      lineHeight: '1.4'
                    }}>
                      {stage.desc}
                    </p>
                  </div>
                  {currentStage < stage.num && (
                    <div style={{
                      fontSize: 'clamp(14px, 3.5vw, 16px)',
                      color: '#9ca3af',
                      flexShrink: 0
                    }}>
                      🔒
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MOBILE RESPONSIVE QUICK ACTIONS */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(16px, 4vw, 20px)',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 'clamp(16px, 4vw, 20px)',
            padding: 'clamp(20px, 5vw, 24px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: 'clamp(18px, 4.5vw, 20px)',
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
              gap: 'clamp(10px, 2.5vw, 12px)'
            }}>
              <button
                onClick={onViewProgress}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'clamp(10px, 2.5vw, 12px)',
                  padding: 'clamp(14px, 3.5vw, 16px) clamp(16px, 4vw, 20px)',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  width: '100%'
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
                  borderRadius: 'clamp(10px, 2.5vw, 12px)',
                  padding: 'clamp(14px, 3.5vw, 16px) clamp(16px, 4vw, 20px)',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%'
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
                  borderRadius: 'clamp(10px, 2.5vw, 12px)',
                  padding: 'clamp(14px, 3.5vw, 16px) clamp(16px, 4vw, 20px)',
                  fontSize: 'clamp(14px, 3.5vw, 16px)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  width: '100%'
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
            borderRadius: 'clamp(16px, 4vw, 20px)',
            padding: 'clamp(20px, 5vw, 24px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: 'clamp(18px, 4.5vw, 20px)',
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
              gap: 'clamp(10px, 2.5vw, 12px)'
            }}>
              {resourceData.map((resource, index) => (
                <button
                  key={index}
                  onClick={resource.onClick}
                  style={{
                    background: 'rgba(102, 126, 234, 0.05)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    borderRadius: 'clamp(10px, 2.5vw, 12px)',
                    padding: 'clamp(12px, 3vw, 16px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    width: '100%'
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
                      fontSize: 'clamp(16px, 4vw, 20px)',
                      marginRight: 'clamp(8px, 2vw, 12px)'
                    }}>
                      {resource.icon}
                    </span>
                    <span style={{
                      fontSize: 'clamp(14px, 3.5vw, 16px)',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {resource.title}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: 'clamp(12px, 3vw, 14px)',
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

        /* Mobile viewport fixes */
        @media screen and (max-width: 768px) {
          body {
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeDashboard;