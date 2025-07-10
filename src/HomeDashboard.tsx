import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalData } from './contexts/LocalDataContext';
import AdminPanel from './components/AdminPanel';
// ✅ REMOVED: No happiness calculation imports - just display!

// ✅ FIXED: Correct interface for HomeDashboard component
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
  
  // ✅ FIXED: Only get basic data for stats, NOT for calculation
  const { practiceSessions } = useLocalData();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [showT1T5Dropdown, setShowT1T5Dropdown] = useState<boolean>(false);
  
  // ✅ FIXED: Just display happiness from localStorage - NO CALCULATION
  const [happinessData, setHappinessData] = useState({
    happiness_points: 50,
    current_level: 'Newcomer'
  });

  // ✅ SIMPLIFIED: Calculate user stats only (no happiness calculation here)
  const calculateUserStats = useCallback(() => {
    if (!currentUser || !practiceSessions) {
      setStreak(0);
      setTotalHours(0);
      return;
    }

    try {
      // Calculate total practice hours
      const totalPracticeHours = practiceSessions.reduce((total: number, session: any) => {
        const duration = session.duration || 0;
        return total + (duration / 60);
      }, 0);

      // Calculate current streak
      let currentStreak = 0;
      if (practiceSessions.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const sortedSessions = [...practiceSessions]
          .map(session => {
            const date = new Date(session.timestamp);
            date.setHours(0, 0, 0, 0);
            return date;
          })
          .sort((a, b) => b.getTime() - a.getTime())
          .filter((date, index, arr) => index === 0 || date.getTime() !== arr[index - 1].getTime());

        let streakCount = 0;
        let checkDate = new Date(today);

        for (const sessionDate of sortedSessions) {
          const diffDays = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === streakCount) {
            streakCount++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        currentStreak = streakCount;
      }

      setStreak(currentStreak);
      setTotalHours(Math.round(totalPracticeHours * 10) / 10);

    } catch (error) {
      console.error('❌ Error calculating user stats:', error);
      setStreak(0);
      setTotalHours(0);
    }
  }, [currentUser, practiceSessions]);

  // ✅ FIXED: ONLY READ happiness from localStorage - NO CALCULATION
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    console.log('🎯 HomeDashboard: Reading happiness from localStorage (NO calculation)...');

    try {
      // ✅ FIXED: Just read from localStorage - let HappinessProgressTracker do the calculation
      const storedHappiness = localStorage.getItem('happiness_points');
      const storedLevel = localStorage.getItem('user_level');
      
      if (storedHappiness && storedLevel) {
        const happiness_points = parseInt(storedHappiness);
        const current_level = storedLevel;
        
        setHappinessData({
          happiness_points,
          current_level
        });
        
        console.log('✅ HomeDashboard: Displaying happiness from localStorage:', {
          happiness_points,
          current_level
        });
      } else {
        console.log('📊 HomeDashboard: No stored happiness found, using defaults');
        setHappinessData({
          happiness_points: 50,
          current_level: 'Newcomer'
        });
      }

    } catch (error) {
      console.error('❌ Error reading happiness from localStorage:', error);
      setHappinessData({
        happiness_points: 50,
        current_level: 'Newcomer'
      });
    }
  }, [currentUser]);

  // ✅ LISTEN: Listen for happiness updates from HappinessProgressTracker
  useEffect(() => {
    const handleHappinessUpdate = (event: CustomEvent) => {
      const { happiness_points, user_level } = event.detail;
      
      console.log('🔔 HomeDashboard: Received happiness update from tracker:', {
        happiness_points,
        user_level
      });
      
      setHappinessData({
        happiness_points,
        current_level: user_level
      });
    };

    window.addEventListener('happinessUpdated', handleHappinessUpdate as EventListener);
    
    return () => {
      window.removeEventListener('happinessUpdated', handleHappinessUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    calculateUserStats();
  }, [calculateUserStats]);

  useEffect(() => {
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

    if (location.state && (location.state as any).fromT5Completion) {
      console.log('Coming from T5 completion, updating stage progress');
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');
      window.location.reload();
    }
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
      <AdminPanel />

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
        
        <div 
          onClick={handleHappinessPointsClick}
          style={{
            background: happinessData.happiness_points > 400 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : happinessData.happiness_points > 200
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
            😊 {happinessData.happiness_points}
          </div>
          <div style={{
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            opacity: 0.9,
            fontWeight: '500'
          }}>
            Happiness Points
          </div>
          {happinessData.happiness_points > 400 && (
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
            🏆 {happinessData.current_level}
          </div>
        </div>
      </header>

      <main style={{
        padding: 'clamp(16px, 4vw, 20px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Welcome Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'clamp(16px, 4vw, 20px)',
          padding: 'clamp(20px, 5vw, 32px)',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Your Mindfulness Journey
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
            Welcome back! Your happiness points: <strong>{happinessData.happiness_points}</strong>
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
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
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
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
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              📝 Daily Notes
            </button>
            <button
              onClick={() => navigate('/chatwithguru')}
              style={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                border: '2px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              🧘 Chat with Guru
            </button>
          </div>
        </section>

        {/* Rest of the component remains the same... */}
        {/* Stages Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'clamp(16px, 4vw, 20px)',
          padding: 'clamp(20px, 5vw, 32px)',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '24px', 
            marginBottom: '8px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Practice Stages
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            textAlign: 'center',
            marginBottom: '24px' 
          }}>
            Choose your practice stage and begin your mindfulness journey
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Stage 1 - Special handling with T-levels dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => handleStageClick(1)}
                style={{
                  width: '100%',
                  background: currentStage === 1 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(102, 126, 234, 0.1)',
                  color: currentStage === 1 ? 'white' : '#667eea',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                      🧘‍♂️ Stage 1: Seeker
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      Physical Stillness (T1-T5)
                    </div>
                  </div>
                  <div style={{ fontSize: '18px' }}>
                    {showT1T5Dropdown ? '🔽' : '▶️'}
                  </div>
                </div>
              </button>

              {/* T-Levels Dropdown */}
              {showT1T5Dropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  marginTop: '8px',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  animation: 'slideDown 0.3s ease'
                }}>
                  {tLevels.map((tLevel, index) => (
                    <button
                      key={tLevel.level}
                      onClick={() => handleTLevelClick(tLevel.level, tLevel.duration)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '12px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#333',
                        borderBottom: index < tLevels.length - 1 ? '1px solid #f0f0f0' : 'none',
                        borderRadius: index === 0 ? '12px 12px 0 0' : index === tLevels.length - 1 ? '0 0 12px 12px' : '0',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {tLevel.level}: {tLevel.duration} minutes
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Physical Stillness Practice
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stages 2-6 */}
            {stageData.map((stage) => (
              <button
                key={stage.num}
                onClick={() => handleStageClick(stage.num)}
                disabled={stage.num > currentStage + 1}
                style={{
                  background: currentStage >= stage.num 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : stage.num === currentStage + 1
                    ? 'rgba(102, 126, 234, 0.1)'
                    : 'rgba(200, 200, 200, 0.1)',
                  color: currentStage >= stage.num ? 'white' : stage.num === currentStage + 1 ? '#667eea' : '#999',
                  border: `2px solid ${currentStage >= stage.num ? 'transparent' : stage.num === currentStage + 1 ? 'rgba(102, 126, 234, 0.2)' : 'rgba(200, 200, 200, 0.2)'}`,
                  borderRadius: '16px',
                  padding: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: stage.num <= currentStage + 1 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  opacity: stage.num <= currentStage + 1 ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (stage.num <= currentStage + 1) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (stage.num <= currentStage + 1) {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                      {stage.num === 2 ? '👁️' : stage.num === 3 ? '🎯' : stage.num === 4 ? '⚡' : stage.num === 5 ? '✨' : '🌟'} Stage {stage.num}: {stage.title}
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      {stage.desc}
                    </div>
                  </div>
                  <div style={{ fontSize: '18px' }}>
                    {currentStage >= stage.num ? '✅' : stage.num === currentStage + 1 ? '▶️' : '🔒'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              onClick={() => navigate('/mind-recovery')}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              }}
            >
              🌱 Mind Recovery
            </button>
            <button
              onClick={onShowWhatIsPAHM}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                border: '2px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
              }}
            >
              🔍 What is PAHM?
            </button>
          </div>
        </section>

        {/* Resources Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'clamp(16px, 4vw, 20px)',
          padding: 'clamp(20px, 5vw, 32px)',
          marginBottom: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            marginBottom: '16px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Learning Resources
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {resourceData.map((resource, index) => (
              <button
                key={index}
                onClick={resource.onClick}
                style={{
                  background: 'rgba(102, 126, 234, 0.05)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {resource.icon}
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>
                  {resource.title}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {resource.desc}
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

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