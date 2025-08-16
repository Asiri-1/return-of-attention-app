// ===============================================
// 🔧 ENHANCED StageLevelIntroduction.tsx - COMPLETE FIREBASE INTEGRATION
// ===============================================

// FILE: src/StageLevelIntroduction.tsx
// ✅ ENHANCED: Complete Firebase integration with all contexts
// ✅ ENHANCED: Hours-based stage progression awareness
// ✅ ENHANCED: Real-time data synchronization
// ✅ ENHANCED: Better error handling and loading states

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface StageLevelIntroductionProps {
  stageNumber: number;
  onComplete: () => void;
  onBack: () => void;
  hasSeenBefore?: boolean;
}

const StageLevelIntroduction: React.FC<StageLevelIntroductionProps> = ({
  stageNumber,
  onComplete,
  onBack,
  hasSeenBefore = false
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');
  
  // ✅ ENHANCED: Use multiple contexts for complete Firebase integration
  const { currentUser } = useAuth();
  const { userProfile, markStageIntroComplete } = useUser();
  const { 
    getCurrentStage, 
    getTotalPracticeHours, 
    getStageProgress,
    canAdvanceToStage 
  } = usePractice();
  
  // ✅ ENHANCED: Get real-time stage information
  const stageInfo = useMemo(() => {
    try {
      const currentStage = getCurrentStage();
      const totalHours = getTotalPracticeHours();
      const progress = getStageProgress(stageNumber);
      const canAccess = canAdvanceToStage(stageNumber);
      
      return {
        currentStage,
        totalHours,
        progress,
        canAccess,
        isCurrentStage: currentStage === stageNumber
      };
    } catch (error) {
      console.error('Error getting stage info:', error);
      return {
        currentStage: 1,
        totalHours: 0,
        progress: { completed: 0, total: 5, percentage: 0 },
        canAccess: stageNumber === 1,
        isCurrentStage: stageNumber === 1
      };
    }
  }, [getCurrentStage, getTotalPracticeHours, getStageProgress, canAdvanceToStage, stageNumber]);

  // ✅ ENHANCED: Check completion status with better error handling
  useEffect(() => {
    // Only apply auto-skip if user has seen this before
    if (hasSeenBefore && stageNumber !== 2 && userProfile && !isLoading) {
      try {
        // Check if this stage's introduction has been completed
        const completedIntros = userProfile.stageProgress?.completedStageIntros || [];
        const introKey = `stage${stageNumber}-intro`;
        
        if (completedIntros.includes(introKey)) {
          console.log(`✅ Stage ${stageNumber} introduction already completed, skipping...`);
          onComplete();
          return;
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
      }
    }
    
    // Log stage access information
    console.log(`🎯 Stage ${stageNumber} Introduction - Access Info:`, {
      canAccess: stageInfo.canAccess,
      currentStage: stageInfo.currentStage,
      totalHours: stageInfo.totalHours.toFixed(1),
      hasSeenBefore
    });
  }, [stageNumber, onComplete, userProfile, hasSeenBefore, isLoading, stageInfo]);

  // ✅ ENHANCED: iOS Safari viewport fix
  useEffect(() => {
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
  
  // ✅ ENHANCED: Firebase completion handler with better error handling
  const markIntroCompleted = useCallback(async () => {
    if (!currentUser?.uid) {
      console.warn('⚠️ No authenticated user for intro completion');
      return;
    }

    try {
      setIsLoading(true);
      setLoadingAction('Saving progress...');
      
      // Use UserContext method for marking completion
      const introKey = `stage${stageNumber}-intro`;
      await markStageIntroComplete(introKey);
      
      console.log(`✅ Stage ${stageNumber} introduction marked as completed in Firebase`);
    } catch (error) {
      console.error('❌ Error marking stage intro as completed:', error);
      // Continue anyway - don't block the user flow
    } finally {
      setIsLoading(false);
      setLoadingAction('');
    }
  }, [currentUser?.uid, stageNumber, markStageIntroComplete]);
  
  // ✅ ENHANCED: Touch feedback for mobile users
  const handleTouchStart = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // ✅ ENHANCED: Keyboard navigation support
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);
  
  // ✅ ENHANCED: Skip handler with loading state
  const handleSkip = useCallback(async () => {
    try {
      setLoadingAction('Skipping introduction...');
      await markIntroCompleted();
      onComplete();
    } catch (error) {
      console.error('Error skipping intro:', error);
      onComplete(); // Continue anyway
    }
  }, [markIntroCompleted, onComplete]);
  
  // ✅ ENHANCED: Stage title with hours-based progression info
  const getStageTitle = useCallback(() => {
    const baseTitle = (() => {
      switch (stageNumber) {
        case 1: return "Stage 1: Seeker - Physical Readiness";
        case 2: return "Stage 2: PAHM Trainee - Understanding Patterns";
        case 3: return "Stage 3: PAHM Beginner - Focused Practice";
        case 4: return "Stage 4: PAHM Practitioner - Advanced Techniques";
        case 5: return "Stage 5: PAHM Master - Sustained Presence";
        case 6: return "Stage 6: PAHM Illuminator - Complete Integration";
        default: return `Stage ${stageNumber}: Unknown Stage`;
      }
    })();
    
    // Add progress information for context
    if (stageInfo.totalHours > 0) {
      return `${baseTitle} (${stageInfo.totalHours.toFixed(1)}h completed)`;
    }
    
    return baseTitle;
  }, [stageNumber, stageInfo.totalHours]);
  
  // ✅ ENHANCED: Updated stage slides with hours-based progression context
  const getStageSlides = useCallback(() => {
    const hourRequirements = [5, 10, 15, 20, 25, 30];
    const requiredHours = hourRequirements[stageNumber - 1] || 5;
    const previousStageHours = stageNumber > 1 ? hourRequirements[stageNumber - 2] : 0;
    
    switch (stageNumber) {
      case 1:
        return [
          {
            title: "Welcome to Stage One",
            content: `As a Seeker, you're beginning the journey of developing physical readiness for meditation practice. This stage focuses on building the capacity to remain physically still for extended periods. Complete 5 practice hours to unlock Stage 2.`
          },
          {
            title: "The Physical Foundation",
            content: "Physical stillness creates the container for all mental work that follows. By training your body to remain still, you develop the first essential skill for deeper practice."
          },
          {
            title: "T1-T5 Progression",
            content: "Stage One includes 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ minutes of stillness. Each T-level builds upon the previous one for optimal development."
          },
          {
            title: "Your Practice Path",
            content: `Begin with T1: three 10-minute sessions of physical stillness. Progress through T2-T5 as you build capacity. Once you complete 5 total practice hours across all T-levels, Stage 2 will unlock automatically.`
          }
        ];
      case 2:
        return [
          {
            title: "Welcome to Stage Two",
            content: `As a PAHM Trainee, you'll learn to witness your thought patterns without becoming entangled in them. You've completed ${previousStageHours} hours of practice to reach this stage. Complete ${requiredHours} total hours to unlock Stage 3.`
          },
          {
            title: "The PAHM Matrix",
            content: "Stage Two introduces the Present Attention and Happiness Matrix (PAHM), a powerful tool for understanding the relationship between your attention and emotional state."
          },
          {
            title: "Nine Positions of Experience",
            content: "The PAHM Matrix divides experience into nine positions including Present, Past, Future, Attachment, Aversion, and Neutral. You'll learn to recognize which position you're in at any moment."
          },
          {
            title: "Your PAHM Training",
            content: `Practice noticing your thoughts without judgment, identifying patterns, and using the PAHM Matrix to understand your mental habits. Continue building hours toward your ${requiredHours}-hour goal for Stage 3.`
          }
        ];
      case 3:
        return [
          {
            title: "Welcome to Stage Three",
            content: `As a PAHM Beginner, you'll learn advanced attention techniques. You've completed ${previousStageHours} hours to reach this stage. Complete ${requiredHours} total hours to unlock Stage 4.`
          },
          {
            title: "Deepening Your Practice",
            content: "Stage Three builds on your PAHM understanding with more structured attention training. You'll develop stronger concentration and awareness skills."
          },
          {
            title: "Advanced Techniques",
            content: "This stage introduces more sophisticated practices for maintaining presence and working with difficult mental states."
          },
          {
            title: "Building Mastery",
            content: `Continue developing your practice foundation. Each session brings you closer to the ${requiredHours}-hour milestone for Stage 4 access.`
          }
        ];
      case 4:
        return [
          {
            title: "Welcome to Stage Four",
            content: `As a PAHM Practitioner, you'll practice advanced techniques. You've completed ${previousStageHours} hours to reach this level. Work toward ${requiredHours} total hours for Stage 5.`
          },
          {
            title: "Beyond Basic Techniques",
            content: "Having developed a solid foundation, you now move to more sophisticated practices that require less external guidance."
          },
          {
            title: "Self-Directed Practice",
            content: "Stage Four emphasizes developing your own capacity to maintain awareness without relying on specific techniques or tools."
          },
          {
            title: "Advanced Integration",
            content: `This stage represents significant deepening. Continue building toward ${requiredHours} total hours to access Stage 5 mastery practices.`
          }
        ];
      case 5:
        return [
          {
            title: "Welcome to Stage Five",
            content: `As a PAHM Master, you'll integrate practice into daily life. You've completed ${previousStageHours} hours to reach this mastery level. Build toward ${requiredHours} hours for Stage 6.`
          },
          {
            title: "Living Presence",
            content: "Stage Five focuses on maintaining awareness throughout daily activities, not just during formal practice sessions."
          },
          {
            title: "Continuous Awareness",
            content: "Learn to maintain presence during conversations, work, and routine activities, extending awareness throughout your day."
          },
          {
            title: "Mastery Integration",
            content: `This stage includes practices for integrating presence into all aspects of life. Continue toward ${requiredHours} total hours for complete mastery.`
          }
        ];
      case 6:
        return [
          {
            title: "Welcome to Stage Six",
            content: `As a PAHM Illuminator, you've reached the highest level with ${previousStageHours} hours completed. This stage focuses on complete integration and sharing your practice.`
          },
          {
            title: "Complete Integration",
            content: "At this stage, the practice becomes a natural part of your being, requiring no special effort to maintain awareness."
          },
          {
            title: "Sharing Your Practice",
            content: "You may feel called to share these practices with others, helping them develop their own capacity for presence and happiness."
          },
          {
            title: "The Continuing Journey",
            content: "Even at Stage Six, the journey continues. There is always deeper presence to discover and new ways to embody and share this practice with the world."
          }
        ];
      default:
        return [
          {
            title: "Stage Introduction",
            content: `Welcome to Stage ${stageNumber} of your meditation journey.`
          }
        ];
    }
  }, [stageNumber]);
  
  const slides = getStageSlides();
  
  // ✅ ENHANCED: Navigation with loading states
  const nextSlide = useCallback(async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      try {
        setLoadingAction('Completing introduction...');
        await markIntroCompleted();
        
        // For PAHM Trainer stage, could navigate to PAHM explanation
        if (stageNumber === 2) {
          console.log('🎯 Stage 2 intro complete - navigating to practice');
        }
        
        onComplete();
      } catch (error) {
        console.error('Error completing intro:', error);
        onComplete(); // Continue anyway
      }
    }
  }, [currentSlide, slides.length, markIntroCompleted, stageNumber, onComplete]);
  
  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  }, [currentSlide, onBack]);

  // ✅ ENHANCED: Direct slide navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // ✅ ENHANCED: Loading overlay
  if (isLoading && loadingAction) {
    return (
      <div className="stage-level-introduction">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }} />
          <div>{loadingAction}</div>
          
          <style>{`
            @keyframes spin { 
              0% { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); } 
            }
          `}</style>
        </div>
      </div>
    );
  }
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button 
          className="back-button" 
          onClick={onBack}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, onBack)}
          aria-label="Go back to previous page"
          disabled={isLoading}
        >
          Back
        </button>
        <h1>{getStageTitle()}</h1>
        <button 
          className="skip-button" 
          onClick={handleSkip}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, handleSkip)}
          aria-label="Skip introduction"
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Skip'}
        </button>
      </div>
      
      {/* ✅ ENHANCED: Stage access indicator */}
      {!stageInfo.canAccess && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '12px',
          margin: '10px 20px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>Note:</strong> This stage requires {stageInfo.progress.total} practice hours. 
          You currently have {stageInfo.totalHours.toFixed(1)} hours completed.
        </div>
      )}
      
      <div className="introduction-content">
        <div className="slide-container" role="region" aria-live="polite">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          {/* ✅ ENHANCED: Progress tracking info */}
          {stageNumber > 1 && (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '12px',
              margin: '20px 0',
              fontSize: '13px',
              color: '#666'
            }}>
              <div><strong>Your Progress:</strong> {stageInfo.totalHours.toFixed(1)} hours completed</div>
              <div><strong>Current Stage:</strong> Stage {stageInfo.currentStage}</div>
              {stageInfo.isCurrentStage && <div style={{ color: '#10b981', fontWeight: '600' }}>✅ This is your current stage</div>}
            </div>
          )}
          
          <div className="slide-progress" role="tablist" aria-label="Slide navigation">
            {slides.map((_, index) => (
              <button
                key={index} 
                className={`progress-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, () => goToSlide(index))}
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`Go to slide ${index + 1} of ${slides.length}`}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>
        
        <div className="navigation-buttons">
          {currentSlide > 0 && (
            <button 
              className="nav-button back" 
              onClick={prevSlide}
              onTouchStart={handleTouchStart}
              onKeyDown={(e) => handleKeyDown(e, prevSlide)}
              aria-label="Go to previous slide"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          
          <button 
            className="nav-button next" 
            onClick={nextSlide}
            onTouchStart={handleTouchStart}
            onKeyDown={(e) => handleKeyDown(e, nextSlide)}
            aria-label={currentSlide === slides.length - 1 ? 
              (stageNumber === 2 ? 'Begin PAHM Practice' : 'Begin Practice') : 
              'Go to next slide'
            }
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (
              currentSlide === slides.length - 1 ? 
                (stageNumber === 2 ? 'Begin PAHM Practice' : 'Begin Practice') : 
                'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageLevelIntroduction;