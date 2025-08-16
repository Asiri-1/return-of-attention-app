import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface Stage1IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
  hasSeenBefore?: boolean;
}

const Stage1Introduction: React.FC<Stage1IntroductionProps> = ({
  onComplete,
  onBack,
  hasSeenBefore = false
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const stageNumber = 1;
  const navigate = useNavigate();
  
  // ✅ Phase 3 Context Integration
  const { getCurrentStage, getStageProgress, sessions, isLoading: practiceLoading } = usePractice();
  const { userProfile, updateProfile } = useUser();
  const { currentUser } = useAuth();

  // ✅ Progress Info for Header
  const progressInfo = useMemo(() => {
    const currentStage = getCurrentStage();
    const progress = getStageProgress(1);
    
    return {
      currentStage,
      percentage: Math.round(progress.percentage || 0),
      isComplete: (progress as any).isComplete || false
    };
  }, [getCurrentStage, getStageProgress]);

  // ✅ Enhanced slides with dynamic content
  const slides = useMemo(() => [
    {
      title: "Welcome to Stage One",
      content: `As a Seeker, you're beginning the journey of developing physical readiness for meditation practice. This stage focuses on building the capacity to remain physically still for extended periods. You're starting an incredible journey of transformation!`,
      icon: "🌱"
    },
    {
      title: "The Physical Foundation",
      content: "Physical stillness creates the container for all mental work that follows. By training your body to remain still, you develop the first essential skill for deeper practice. This is where your meditation journey truly begins.",
      icon: "🏗️"
    },
    {
      title: "T1-T5 Progression",
      content: "Stage One is divided into 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ minutes of stillness. Each level builds upon the previous one, creating a systematic approach to developing physical mastery.",
      icon: "📈"
    }
  ], []);
  
  // ✅ Safe User Profile Update
  const markIntroCompleted = useCallback(async () => {
    if (!currentUser) return;
    
    console.log('🔍 Stage 1 introduction completed');
    
    try {
      setIsLoading(true);
      
      const currentIntros = (userProfile as any)?.completedStageIntros || [];
      
      if (!currentIntros.includes(stageNumber)) {
        const updatedIntros = [...currentIntros, stageNumber];
        await updateProfile({
          ...userProfile,
          completedStageIntros: updatedIntros,
          currentStage: 1,
          lastUpdated: new Date().toISOString()
        } as any);
        
        console.log('✅ Stage 1 introduction marked as completed');
      }
    } catch (error) {
      console.error('❌ Error marking stage intro as completed:', error);
      setError('Failed to save introduction progress');
      // Continue anyway - don't block the user flow
    } finally {
      setIsLoading(false);
    }
  }, [stageNumber, userProfile, updateProfile, currentUser]);
  
  // ✅ Skip handler navigates to progressive Stage1Wrapper
  const handleSkip = useCallback(async () => {
    await markIntroCompleted();
    
    setTimeout(() => {
      console.log('🔍 Navigating to PROGRESSIVE T-level selection after skip');
      navigate('/stage1');
    }, 100);
  }, [markIntroCompleted, navigate]);
  
  // ✅ Next slide handler with completion
  const nextSlide = useCallback(async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await markIntroCompleted();
      
      setTimeout(() => {
        console.log('🔍 Navigating to PROGRESSIVE T-level selection after completion');
        navigate('/stage1');
      }, 100);
    }
  }, [currentSlide, slides.length, markIntroCompleted, navigate]);
  
  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  }, [currentSlide, onBack]);
  
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);
  
  // ✅ Welcome back message effect
  useEffect(() => {
    if (hasSeenBefore) {
      setShowWelcomeBack(true);
      const timer = setTimeout(() => {
        setShowWelcomeBack(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenBefore]);
  
  // ✅ Touch/swipe support for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // ✅ Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide, handleSkip]);
  
  // ✅ Dynamic button text
  const getButtonText = () => {
    if (currentSlide < slides.length - 1) {
      return "Next";
    }
    return "Start Progressive Practice";
  };

  // ✅ Loading State
  if (practiceLoading || isLoading) {
    return (
      <div className="stage-level-introduction">
        <div className="loading-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '12px' }}>
            Loading Stage 1 Introduction...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Preparing your physical readiness training
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="stage-level-introduction"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ✅ Welcome back message */}
      {showWelcomeBack && (
        <div className="welcome-back-message" style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          animation: 'slideInDown 0.5s ease-out'
        }}>
          <div className="welcome-back-content">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>Welcome Back! 👋</h3>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Continue your Stage 1 journey or skip to progressive practice selection.</p>
          </div>
        </div>
      )}
      
      <div className="stage-instructions-header">
        <button 
          className="back-button" 
          onClick={onBack}
          aria-label="Go back"
          disabled={isLoading}
        >
          Back
        </button>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1>Stage 1: Seeker Level</h1>
          {progressInfo && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Current Stage: {progressInfo.currentStage} • Progress: {progressInfo.percentage}%
              {progressInfo.isComplete && ' ✅'}
            </div>
          )}
        </div>
        
        <button 
          className="skip-button" 
          onClick={handleSkip}
          aria-label={hasSeenBefore ? "Skip to progressive practice" : "Skip introduction"}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : hasSeenBefore ? "Skip to Practice" : "Skip"}
        </button>
      </div>
      
      <div className="introduction-content">
        {/* ✅ Achievement Badge */}
        <div className="achievement-badge" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🌱 Stage 1: Physical Foundation</h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            You're beginning the journey of developing physical readiness for meditation!
          </p>
        </div>

        {/* ✅ Error Display */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#dc2626', fontSize: '16px', marginBottom: '8px' }}>
              ⚠️ {error}
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                padding: '8px 16px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="slide-container">
          {/* ✅ Visual icon for better engagement */}
          <div className="slide-icon" style={{ 
            fontSize: '48px', 
            textAlign: 'center', 
            marginBottom: '20px' 
          }}>
            {slides[currentSlide].icon}
          </div>
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          <div className="slide-progress" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '24px'
          }}>
            {slides.map((_, index) => (
              <div 
                key={index} 
                className={`progress-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                role="button"
                tabIndex={0}
                aria-label={`Go to slide ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goToSlide(index);
                  }
                }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: index === currentSlide 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(102, 126, 234, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* ✅ Navigation buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            gap: '16px'
          }}>
            {currentSlide > 0 ? (
              <button 
                onClick={prevSlide}
                aria-label="Go to previous slide"
                disabled={isLoading}
                style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  border: '2px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '100px',
                  opacity: isLoading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }
                }}
              >
                ← Back
              </button>
            ) : (
              <div style={{ minWidth: '100px' }}></div>
            )}
            
            <button 
              onClick={nextSlide}
              aria-label={currentSlide === slides.length - 1 ? 'Start progressive practice' : 'Go to next slide'}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                minWidth: '180px',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {isLoading ? 'Starting...' : `${getButtonText()} →`}
            </button>
          </div>
        </div>
        
        {/* ✅ Progress indicator */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '2px',
          marginTop: '24px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Stage1Introduction;