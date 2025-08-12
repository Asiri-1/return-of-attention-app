// 🔧 COMPLETE FIXED App.tsx - Complete Practice Session Flow
// File: src/App.tsx
// ✅ T1 Introduction → Universal Posture Selection → Practice Timer → Reflection → DUAL CONTEXT UPDATES

import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// ✅ ESSENTIAL: All imports at the top
import PageViewTracker from './components/PageViewTracker';
import PAHMProgressTracker from './PAHMProgressTracker';
import { AuthProvider, useAuth } from './contexts/auth/AuthContext';
import { AdminProvider } from './contexts/auth/AdminContext';
import CleanAdminPanel from './components/CleanAdminPanel';
import LogoutWarning from './components/LogoutWarning';

// ✅ FIREBASE-ONLY: Import the enhanced Firebase-ready contexts
import { AppProvider } from './contexts/AppProvider';
import { useUser } from './contexts/user/UserContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';
import { useWellness } from './contexts/wellness/WellnessContext';

// ✅ CRITICAL COMPONENTS: Import normally to avoid chunk loading errors
import SignIn from './SignIn';
import SignUp from './SignUp';
import Introduction from './Introduction';
import Questionnaire from './Questionnaire';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';

// ✅ Import Stage1Introduction directly (not lazy loaded for better UX)
import Stage1Introduction from './Stage1Introduction';

// ✅ Import T1Introduction and UniversalPostureSelection directly
import T1Introduction from './T1Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';

// ✅ Import PublicLandingHero directly
import PublicLandingHero from './components/PublicLandingHero';

// ✅ LAZY LOADED COMPONENTS: All your original components
const MainNavigation = lazy(() => import('./MainNavigation'));
const DailyEmotionalNotesWrapper = lazy(() => import('./DailyEmotionalNotesWrapper'));
const AnalyticsBoardWrapper = lazy(() => import('./AnalyticsBoardWrapper'));
const MindRecoverySelectionWrapper = lazy(() => import('./MindRecoverySelectionWrapper'));
const MindRecoveryTimerWrapper = lazy(() => import('./MindRecoveryTimerWrapper'));

// Main app components
const HomeDashboard = lazy(() => import('./HomeDashboard'));
const Stage1Wrapper = lazy(() => import('./Stage1Wrapper'));
const Stage2Wrapper = lazy(() => import('./Stage2Wrapper'));
const Stage3Wrapper = lazy(() => import('./Stage3Wrapper'));
const Stage4Wrapper = lazy(() => import('./Stage4Wrapper'));
const Stage5Wrapper = lazy(() => import('./Stage5Wrapper'));
const Stage6Wrapper = lazy(() => import('./Stage6Wrapper'));
const WhatIsPAHMWrapper = lazy(() => import('./WhatIsPAHMWrapper'));
const ImmediateReflectionWrapper = lazy(() => import('./ImmediateReflectionWrapper'));
const ChatInterface = lazy(() => import('./components/Chatwithguru/ChatInterface'));

// Practice Components
const PracticeTimer = lazy(() => import('./PracticeTimer'));
const PracticeReflection = lazy(() => import('./PracticeReflection'));

// Public landing pages
const AboutMethod = lazy(() => import('./components/AboutMethod'));
const PublicFAQ = lazy(() => import('./components/PublicFAQ'));

// Other components
const PostureGuide = lazy(() => import('./PostureGuide'));
const UserProfile = lazy(() => import('./UserProfile'));
const HappinessTrackerPage = lazy(() => import('./components/HappinessTrackerPage'));

// ✅ Enhanced FastLoader
interface FastLoaderProps {
  message?: string;
  timeout?: number;
}

const FastLoader: React.FC<FastLoaderProps> = React.memo(({ message = "Loading...", timeout = 2000 }) => {
  const [showEmergencyExit, setShowEmergencyExit] = useState(false);

  useEffect(() => {
    const emergencyTimer = setTimeout(() => {
      setShowEmergencyExit(true);
    }, 1500);

    const emergencyExit = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚨 EMERGENCY EXIT: Loading took too long, forcing navigation');
      }
      window.location.href = '/home';
    }, timeout);

    return () => {
      clearTimeout(emergencyTimer);
      clearTimeout(emergencyExit);
    };
  }, [timeout]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontSize: '18px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontWeight: '600'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div>{message}</div>
        {showEmergencyExit && (
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.7,
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/home'}>
            Taking too long? Click here to go to dashboard
          </div>
        )}
        <style>{`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    </div>
  );
});

// ✅ DEBUG COMPONENT: Removed for production

// ✅ FIXED: Universal Posture Selection Wrapper Component
const UniversalPostureSelectionWrapper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Get state passed from T1Introduction
  const state = location.state as {
    tLevel?: string;
    duration?: number;
    level?: string;
    stageLevel?: number;
    returnTo?: string;
    fromIntroduction?: boolean;
  } | null;

  console.log('🔥 UniversalPostureSelectionWrapper - Received state:', state);

  // ✅ Handle back navigation
  const handleBack = () => {
    console.log('🔙 PostureSelection - navigating back');
    
    if (state?.fromIntroduction) {
      // Go back to T1 Introduction
      navigate('/t1-introduction', { state });
    } else {
      // Go back to stage dashboard
      const returnPath = state?.returnTo || '/stage1';
      navigate(returnPath);
    }
  };

  // ✅ Handle posture selection and navigate to practice timer
  const handleStartPractice = (selectedPosture: string) => {
    console.log('🎯 Posture selected:', selectedPosture);
    console.log('🎯 Navigating to practice timer');
    
    // ✅ Navigate to Practice Timer with all necessary data
    navigate('/practice-timer', {
      state: {
        tLevel: state?.tLevel || 'T1',
        duration: state?.duration || 10,
        level: state?.level || 't1',
        stageLevel: state?.stageLevel || 1,
        returnTo: state?.returnTo || '/stage1',
        selectedPosture: selectedPosture,
        fromPostureSelection: true
      }
    });
  };

  return (
    <UniversalPostureSelection
      onBack={handleBack}
      onStartPractice={handleStartPractice}
      currentTLevel={state?.tLevel}
      stageNumber={state?.stageLevel}
    />
  );
};

// ✅ FIXED: Practice Timer Wrapper Component
const PracticeTimerWrapper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Get state passed from UniversalPostureSelection
  const state = location.state as {
    tLevel?: string;
    duration?: number;
    level?: string;
    stageLevel?: number;
    returnTo?: string;
    selectedPosture?: string;
    fromPostureSelection?: boolean;
  } | null;

  console.log('🔥 PracticeTimerWrapper - Received state:', state);

  // ✅ Provide default values if state is missing - wrap in useMemo
  const timerProps = useMemo(() => ({
    tLevel: state?.tLevel || 'T1',
    duration: state?.duration || 10,
    level: state?.level || 't1',
    stageLevel: state?.stageLevel || 1,
    returnTo: state?.returnTo || '/stage1',
    selectedPosture: state?.selectedPosture || 'seated_chair'
  }), [state]);

  console.log('🎯 PracticeTimer Props:', timerProps);

  // ✅ Handle practice completion - navigate to reflection
  const handlePracticeComplete = useCallback(() => {
    console.log('✅ Practice completed, navigating to reflection');
    
    navigate('/practice-reflection', {
      state: {
        sessionData: {
          tLevel: timerProps.tLevel,
          duration: timerProps.duration,
          posture: timerProps.selectedPosture,
          stageLevel: timerProps.stageLevel,
          isCompleted: true
        },
        returnTo: timerProps.returnTo,
        tLevel: timerProps.tLevel,
        fromStage1: true
      }
    });
  }, [navigate, timerProps]);

  // ✅ Handle navigation back to stage
  const handleBack = useCallback(() => {
    console.log('🔙 Navigating back to:', timerProps.returnTo);
    navigate(timerProps.returnTo);
  }, [navigate, timerProps.returnTo]);

  return (
    <Suspense fallback={<FastLoader message="Starting your practice session..." />}>
      <PracticeTimer
        stageLevel={`${timerProps.tLevel}: Physical Stillness Training`}
        initialMinutes={timerProps.duration}
        onComplete={handlePracticeComplete}
        onBack={handleBack}
      />
    </Suspense>
  );
};

// ✅ CRITICAL FIX: Practice Reflection Wrapper Component - Updates BOTH Contexts
const PracticeReflectionWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addEmotionalNote } = useWellness();
  
  // ✅ CRITICAL: Import UserContext methods for session counting
  const { 
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, 
    incrementT4Sessions, incrementT5Sessions 
  } = useUser();

  console.log('🔍 PracticeReflectionWrapper state:', location.state);

  // ✅ FIXED: Handle missing state gracefully
  const state = location.state as any;
  if (!state) {
    console.warn('⚠️ No state found in PracticeReflectionWrapper, redirecting to home');
    navigate('/home');
    return null;
  }

  const { sessionData, tLevel } = state;

  const handleSaveReflection = async (reflectionData: any) => {
    console.log('💾 Saving reflection data:', reflectionData);
    
    try {
      // ✅ CRITICAL FIX: Update UserContext session counts FIRST (drives UI updates)
      if (sessionData?.isCompleted && tLevel) {
        console.log(`🔥 UPDATING ${tLevel} session count by 1`);
        
        let newSessionCount = 0;
        switch (tLevel.toLowerCase()) {
          case 't1':
            newSessionCount = await incrementT1Sessions();
            console.log(`📊 t1 sessions: ${newSessionCount-1} → ${newSessionCount}`);
            break;
          case 't2':
            newSessionCount = await incrementT2Sessions();
            console.log(`📊 t2 sessions: ${newSessionCount-1} → ${newSessionCount}`);
            break;
          case 't3':
            newSessionCount = await incrementT3Sessions();
            console.log(`📊 t3 sessions: ${newSessionCount-1} → ${newSessionCount}`);
            break;
          case 't4':
            newSessionCount = await incrementT4Sessions();
            console.log(`📊 t4 sessions: ${newSessionCount-1} → ${newSessionCount}`);
            break;
          case 't5':
            newSessionCount = await incrementT5Sessions();
            console.log(`📊 t5 sessions: ${newSessionCount-1} → ${newSessionCount}`);
            break;
          default:
            console.warn(`⚠️ Unknown tLevel: ${tLevel}`);
        }
        
        console.log(`✅ SESSION SAVED TO FIREBASE! - ${tLevel}`);
        console.log(`📊 T-STAGE COMPLETION TRACKED - ${tLevel}`);
      }

      // Add reflection as emotional note
      await addEmotionalNote({
        content: `Completed ${tLevel || sessionData?.tLevel} practice (${sessionData?.duration || 10} minutes). Reflection: ${reflectionData.reflectionText}`,
        emotion: sessionData?.isCompleted ? 'accomplished' : 'content',
        energyLevel: sessionData?.isCompleted ? 8 : 6,
        intensity: sessionData?.isCompleted ? 8 : 6,
        tags: ['practice-reflection', (tLevel || sessionData?.tLevel)?.toLowerCase(), 'stage-1'],
        gratitude: ['meditation practice', 'mindfulness', 'inner stillness']
      });

      console.log('✅ Reflection saved successfully');
      
      // ✅ FIXED: Navigate back to appropriate location
      if (state.fromStage1) {
        if (state.isT5Completion) {
          // T5 completed - go to home with stage 2 unlocked message
          navigate('/home', { 
            state: { 
              message: 'Congratulations! T5 completed. Stage 2 is now unlocked!',
              stage2Unlocked: true 
            } 
          });
        } else {
          // Regular T-level completion - back to stage 1
          console.log('🔄 Practice completed, navigating to reflection');
          navigate('/stage1');
        }
      } else {
        // Default - back to home
        navigate('/home');
      }
    } catch (error) {
      console.error('❌ Error saving reflection:', error);
      alert('Failed to save reflection. Please try again.');
    }
  };

  const handleBack = () => {
    // ✅ FIXED: Proper back navigation
    if (state?.fromStage1) {
      navigate('/stage1');
    } else {
      navigate('/home');
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Suspense fallback={<FastLoader message="Loading reflection space..." />}>
        <PracticeReflection
          onBack={handleBack}
          onSaveReflection={handleSaveReflection}
        />
      </Suspense>
    </div>
  );
};

// ✅ FIREBASE-ONLY: Legacy Redirect Components without localStorage
const SeekerPracticeTimerRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const state = location.state as { level?: string } || {};
    const tLevel = (state.level || 't1').toLowerCase();
    const tLevelUpper = tLevel.toUpperCase();
    
    console.log('🔄 Redirecting legacy seeker-practice-timer to Stage1Wrapper');
    console.log('Target T-Level:', tLevelUpper);
    
    navigate(`/stage1/${tLevelUpper}`, { replace: true });
  }, [navigate, location]);
  
  return (
    <FastLoader message="Redirecting to modern practice flow..." timeout={1500} />
  );
};

const SeekerPracticeCompleteRedirect: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('🔄 Redirecting legacy seeker-practice-complete to home');
    navigate('/home', { replace: true });
  }, [navigate]);
  
  return (
    <FastLoader message="Redirecting to dashboard..." timeout={1500} />
  );
};

// ✅ FIREBASE-ONLY: Updated completion status checker
const useCompletionStatus = () => {
  const { getCompletionStatus } = useOnboarding();
  const { currentUser } = useAuth();

  const checkCompletionStatus = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      await getCompletionStatus();
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
    }
  }, [currentUser, getCompletionStatus]);

  useEffect(() => {
    checkCompletionStatus();
  }, [checkCompletionStatus]);

  return { recheckStatus: checkCompletionStatus };
};

// ✅ FIREBASE-ONLY: Questionnaire Component
const QuestionnaireComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markQuestionnaireComplete } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleQuestionnaireComplete = useCallback(async (answers: any) => {
    try {
      setIsCompleting(true);
      
      // ✅ FIREBASE-ONLY: Save to Firebase via OnboardingContext
      await markQuestionnaireComplete(answers);
      
      console.log('✅ Questionnaire completed and saved to Firebase');
      
      const returnTo = (location.state as any)?.returnTo || '/home';
      navigate(returnTo);
    } catch (error) {
      console.error('❌ Error completing questionnaire:', error);
      alert('Failed to save questionnaire. Please check your connection and try again.');
      setIsCompleting(false);
    }
  }, [markQuestionnaireComplete, location.state, navigate]);

  return (
    <div className="questionnaire-container">
      <Suspense fallback={<FastLoader message="Loading questionnaire..." />}>
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      </Suspense>
      {isCompleting && <FastLoader message="Saving your responses to cloud..." />}
    </div>
  );
};

// ✅ FIREBASE-ONLY: Self Assessment Component
const SelfAssessmentComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markSelfAssessmentComplete } = useOnboarding();
  const { updateProfile } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSelfAssessmentComplete = useCallback(async (data: any) => {
    try {
      setIsCompleting(true);
      
      // ✅ FIREBASE-ONLY: Save to Firebase via OnboardingContext
      await markSelfAssessmentComplete(data);
      
      // ✅ FIREBASE-ONLY: Update user profile
      try {
        await updateProfile({ 
          preferences: { 
            defaultSessionDuration: 20,
            reminderEnabled: true,
            favoriteStages: [1, 2],
            optimalPracticeTime: "morning",
            notifications: {
              dailyReminder: true,
              streakReminder: true,
              weeklyProgress: true
            }
          } 
        });
        console.log('✅ Self-assessment and profile saved to Firebase');
      } catch (profileError) {
        console.warn('⚠️ Profile update failed, continuing anyway:', profileError);
      }
      
      const returnTo = (location.state as any)?.returnTo;
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/self-assessment-completion');
      }
    } catch (error) {
      console.error('❌ Error completing self-assessment:', error);
      alert('Failed to save self-assessment. Please check your connection and try again.');
      setIsCompleting(false);
    }
  }, [markSelfAssessmentComplete, updateProfile, location.state, navigate]);

  return (
    <div className="self-assessment-container">
      <Suspense fallback={<FastLoader message="Loading self-assessment..." />}>
        <SelfAssessment 
          onComplete={handleSelfAssessmentComplete}
          onBack={() => navigate('/introduction')}
        />
      </Suspense>
      {isCompleting && <FastLoader message="Saving your assessment to cloud..." />}
    </div>
  );
};

// ✅ FIREBASE-ONLY: Main app content with Firebase-ready contexts
const AppContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoading, signIn, signUp, logout } = useAuth();
  
  // 🔧 FIXED: Use UserContext methods for progress calculation
  const { 
    userProfile, 
    markStageIntroComplete,
    // ✅ Progress calculation methods
    isT5Complete,
    isStage2CompleteByHours,
    isStage3CompleteByHours,
    isStage4CompleteByHours,
    isStage5CompleteByHours,
    isStage6CompleteByHours
  } = useUser();
  
  // ✅ FIXED: Simplified state management to prevent loading loops
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true);
  
  // ✅ Define isAuthenticated BEFORE using it
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  
  // ✅ FIREBASE-ONLY: Use Firebase-enabled contexts
  const { recheckStatus } = useCompletionStatus();
  
  // 🔧 FIXED: Calculate current stage using UserContext methods (same as HomeDashboard)
  const currentStage = useMemo(() => {
    if (!isAuthenticated) return 1;
    
    try {
      // ✅ Use same logic as HomeDashboard
      if (!isT5Complete()) {
        return 1;
      }
      
      if (!isStage2CompleteByHours()) {
        return 2;
      }
      
      if (!isStage3CompleteByHours()) {
        return 3;
      }
      
      if (!isStage4CompleteByHours()) {
        return 4;
      }
      
      if (!isStage5CompleteByHours()) {
        return 5;
      }
      
      if (!isStage6CompleteByHours()) {
        return 6;
      }
      
      return 6; // All completed
    } catch (error) {
      console.warn('Error calculating current stage:', error);
      return 1;
    }
  }, [isAuthenticated, isT5Complete, isStage2CompleteByHours, isStage3CompleteByHours, 
      isStage4CompleteByHours, isStage5CompleteByHours, isStage6CompleteByHours]);

  // 🔧 FIXED: Calculate T5 completion status using UserContext
  const t5Completed = useMemo(() => {
    if (!isAuthenticated) return false;
    
    try {
      return isT5Complete();
    } catch (error) {
      console.warn('Error calculating T5 completion:', error);
      return false;
    }
  }, [isAuthenticated, isT5Complete]);

  // ✅ FIXED: Emergency timeout to prevent infinite loading
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('🚨 EMERGENCY: Forcing loading to complete after 10 seconds');
        // Force navigation based on current state
        if (currentUser) {
          console.log('🏠 User exists, forcing navigation to home');
          window.location.href = '/home';
        } else {
          console.log('🌟 No user, forcing navigation to landing');
          window.location.href = '/';
        }
      }
    }, 10000); // 10 seconds maximum

    return () => clearTimeout(emergencyTimeout);
  }, [isLoading, currentUser]);

  // ✅ DEBUGGING: Add console logs to better understand loading state
  useEffect(() => {
    console.log('🔍 App State Debug:', {
      isLoading,
      currentUser: !!currentUser,
      userProfile: !!userProfile,
      isSigningIn,
      location: location.pathname,
      currentStage,
      t5Completed
    });
  }, [isLoading, currentUser, userProfile, isSigningIn, location.pathname, currentStage, t5Completed]);

  // ✅ Initialize knowledge base
  useEffect(() => {
    setKnowledgeBaseReady(true);
  }, []);

  // ✅ Authentication completion handling
  useEffect(() => {
    if (currentUser && isSigningIn) {
      console.log('✅ Authentication completed successfully');
      setIsSigningIn(false);
      
      const timer = setTimeout(() => {
        if (location.pathname === '/signin' || location.pathname === '/signup' || location.pathname === '/') {
          console.log('🏠 Redirecting to home after successful authentication');
          navigate('/home', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, isSigningIn, location.pathname, navigate]);

  // ✅ Clear signing in state if auth fails
  useEffect(() => {
    if (!isLoading && !currentUser && isSigningIn) {
      console.log('❌ Authentication may have failed, clearing signing-in state');
      setIsSigningIn(false);
    }
  }, [isLoading, currentUser, isSigningIn]);

  // ✅ FIREBASE-ONLY: Stage intro completion handler
  const markStageIntroCompleteHandler = useCallback(async (stageNumber: number) => {
    try {
      // ✅ FIREBASE-ONLY: Save to Firebase via UserContext
      await markStageIntroComplete(`stage${stageNumber}-intro`);
      console.log(`✅ Stage ${stageNumber} intro marked complete in Firebase`);
    } catch (error) {
      console.error(`❌ Error marking stage ${stageNumber} intro complete:`, error);
    }
  }, [markStageIntroComplete]);

  // ✅ FIREBASE-ONLY: Updated handlers with Firebase integration
  const handlers = useMemo(() => ({
    // ✅ FIREBASE-ONLY: Progressive Stage 1 flow with Firebase intro tracking
    startPractice: async () => {
      try {
        // ✅ FIREBASE-ONLY: Check Firebase data only
        let hasSeenStage1Intro = false;
        
        if (userProfile?.stageProgress?.completedStageIntros) {
          hasSeenStage1Intro = userProfile.stageProgress.completedStageIntros.includes('stage1-intro');
        }
        
        if (hasSeenStage1Intro) {
          navigate('/stage1');
        } else {
          navigate('/stage1-introduction');
        }
      } catch (error) {
        console.error('Error checking stage intro status:', error);
        navigate('/stage1-introduction');
      }
    },
    
    viewProgress: () => navigate('/analytics'),
    viewLearning: () => navigate('/learning/pahm'),
    showPostureGuide: () => navigate("/posture-guide"),
    showPAHMExplanation: () => navigate('/learning/pahm'),
    showWhatIsPAHM: () => navigate('/learning/pahm'),
    startStage2: () => navigate('/stage2'),
    startStage3: () => navigate('/stage3'),
    startStage4: () => navigate('/stage4'),
    startStage5: () => navigate('/stage5'),
    startStage6: () => navigate('/stage6'),
    navigateToSignUp: () => navigate('/signup'),
    navigateToSignIn: () => navigate('/signin'),
    
    // ✅ FIREBASE-ONLY: Navigation Handlers
    navigateToQuestionnaire: (returnTo?: string) => {
      console.log('🚀 Navigating to questionnaire...');
      navigate('/questionnaire', { state: { returnTo: returnTo || '/home' } });
    },
    
    navigateToSelfAssessment: (returnTo?: string) => {
      console.log('🚀 Navigating to self-assessment...');
      navigate('/self-assessment', { state: { returnTo: returnTo || '/home' } });
    },
    
    // ✅ AUTH HANDLERS with proper error handling
    logout: async () => {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        navigate('/');
      }
    },
    
    signUp: async (email: string, password: string, name: string) => {
      try {
        console.log('🔐 Starting sign up process...');
        setIsSigningIn(true);
        
        await signUp(email, password, name);
        
        console.log('✅ Sign up successful, auth state will update automatically...');
        
      } catch (error: any) {
        console.error('❌ Sign up failed:', error);
        setIsSigningIn(false);
        
        if (error?.code === 'auth/email-already-in-use') {
          alert('This email is already registered. Please sign in instead.');
          navigate('/signin');
        } else {
          alert(`Signup failed: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        console.log('🔐 Starting sign in process...');
        setIsSigningIn(true);
        
        await signIn(email, password);
        
        console.log('✅ Sign in successful, auth state will update automatically...');
        
      } catch (error: any) {
        console.error('❌ Sign in failed:', error);
        setIsSigningIn(false);
        alert(`Failed to sign in: ${error?.message || 'Please check your credentials.'}`);
      }
    },
    
    // ✅ OTHER HANDLERS
    googleSignIn: async () => {
      alert('Google Sign In not fully implemented yet - please use regular sign in');
    },
    
    googleSignUp: async (googleUser: any) => {
      try {
        setIsSigningIn(true);
        const response = await fetch('/api/auth/google-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.googleId,
            picture: googleUser.picture,
            token: googleUser.token
          })
        });
        
        if (response.ok) {
          navigate('/home');
        }
      } catch (error: any) {
        alert(`Google sign-up failed: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsSigningIn(false);
      }
    },
    
    forgotPassword: () => {
      alert('Forgot password functionality not implemented yet');
    },
    
    introductionComplete: () => navigate('/self-assessment'),
    introductionSkip: () => navigate('/self-assessment'),
    selfAssessmentBack: () => navigate('/introduction'),
    selfAssessmentCompletionGetStarted: () => navigate('/home'),
    selfAssessmentCompletionBack: () => navigate('/self-assessment')
    
  }), [
    navigate, 
    logout, 
    signUp, 
    signIn,
    userProfile
  ]);

  // ✅ FIXED: Much simpler and more reliable loading logic
  const shouldShowLoader = useMemo(() => {
    // Simple rule: Only show loader if actively loading AND no user yet
    const showLoader = isLoading && !currentUser && !isSigningIn;
    
    console.log('🔍 Loading Decision:', {
      isLoading,
      hasUser: !!currentUser,
      isSigningIn,
      decision: showLoader ? 'SHOW_LOADER' : 'SHOW_CONTENT'
    });
    
    return showLoader;
  }, [isLoading, currentUser, isSigningIn]);
  
  // ✅ Show loader first to prevent any route flashing
  if (shouldShowLoader) {
    const message = isSigningIn ? "Signing you in..." : "Initializing practices for the happiness that stays...";
    console.log('🔄 Showing loader:', message);
    return (
      <>
        <FastLoader message={message} timeout={10000} />
      </>
    );
  }

  // ✅ Only show unauthenticated routes when we're absolutely certain
  const shouldShowUnauthenticatedRoutes = !isAuthenticated && !isLoading && !isSigningIn;
  
  console.log('🔍 Route decision:', {
    isAuthenticated,
    isLoading,
    isSigningIn,
    shouldShowUnauthenticatedRoutes
  });

  if (shouldShowUnauthenticatedRoutes) {
    console.log('🌟 Showing unauthenticated routes (landing page)');
    return (
      <div className="app-container">
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<PublicLandingHero />} />
          
          <Route path="/about" element={
            <Suspense fallback={<FastLoader message="Loading about our method..." />}>
              <AboutMethod />
            </Suspense>
          } />
          
          <Route path="/faq" element={
            <Suspense fallback={<FastLoader message="Loading frequently asked questions..." />}>
              <PublicFAQ />
            </Suspense>
          } />
          
          <Route path="/signin" element={
            <SignIn 
              onSignIn={handlers.signIn}
              onGoogleSignIn={handlers.googleSignIn}
              onSignUp={handlers.navigateToSignUp}
              onForgotPassword={handlers.forgotPassword}
            />
          } />
          
          <Route path="/signup" element={
            <SignUp 
              onSignUp={handlers.signUp}
              onGoogleSignUp={handlers.googleSignUp}
              onSignIn={handlers.navigateToSignIn}
            />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // ✅ Only show authenticated routes when user is actually authenticated
  if (!isAuthenticated) {
    console.log('🔄 Auth state not ready, showing loader');
    return (
      <>
        <FastLoader message="Preparing your practice space..." timeout={10000} />
      </>
    );
  }

  console.log('🏠 Showing authenticated routes (home dashboard)');

  // ✅ FIREBASE-ONLY: Authenticated routes with Firebase integration
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ FIREBASE-ONLY: Stage1Introduction with Firebase intro tracking */}
        <Route 
          path="/stage1-introduction" 
          element={
            <Stage1Introduction 
              onComplete={async () => {
                await markStageIntroCompleteHandler(1);
                navigate('/stage1');
              }}
              onBack={() => navigate('/home')}
              hasSeenBefore={userProfile?.stageProgress?.completedStageIntros?.includes('stage1-intro') || false}
            />
          } 
        />
        
        {/* ✅ NEW: Complete Practice Flow Routes */}
        <Route path="/t1-introduction" element={<T1Introduction />} />
        
        <Route path="/universal-posture-selection" element={<UniversalPostureSelectionWrapper />} />
        
        <Route path="/practice-timer" element={<PracticeTimerWrapper />} />
        
        <Route path="/practice-reflection" element={<PracticeReflectionWrapper />} />
        
        <Route path="/questionnaire" element={<QuestionnaireComponent />} />
        
        <Route path="/introduction" element={
          <Introduction 
            onComplete={handlers.introductionComplete}
            onSkip={handlers.introductionSkip}
          />
        } />
        
        <Route path="/self-assessment" element={<SelfAssessmentComponent />} />
        
        <Route path="/self-assessment-completion" element={
          <SelfAssessmentCompletion 
            onGetStarted={handlers.selfAssessmentCompletionGetStarted}
            onBack={handlers.selfAssessmentCompletionBack}
          />
        } />

        {/* ✅ FIREBASE-ONLY: MAIN APP ROUTES */}
        <Route path="/*" element={
          <Suspense fallback={<FastLoader message="Loading your practice space..." />}>
            <MainNavigation>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* 🔧 FIXED: HOME DASHBOARD with proper progress props */}
                <Route path="/home" element={
                  <Suspense fallback={<FastLoader message="Loading practices for happiness..." />}>
                    <HomeDashboard 
                      onStartPractice={handlers.startPractice}
                      onStartStage2={handlers.startStage2}
                      onStartStage3={handlers.startStage3}
                      onStartStage4={handlers.startStage4}
                      onStartStage5={handlers.startStage5}
                      onStartStage6={handlers.startStage6}
                      onViewProgress={handlers.viewProgress}
                      onViewLearning={handlers.viewLearning}
                      onShowPostureGuide={handlers.showPostureGuide}
                      onShowPAHMExplanation={handlers.showPAHMExplanation}
                      onShowWhatIsPAHM={handlers.showWhatIsPAHM}
                      onLogout={handlers.logout}
                      currentStage={currentStage}
                      t5Completed={t5Completed}
                    />
                  </Suspense>
                } />
                
                {/* ✅ CLEAN ADMIN PANEL */}
                <Route path="/admin" element={
                  <Suspense fallback={<FastLoader message="Loading clean admin panel..." />}>
                    <CleanAdminPanel contexts={{
                      practice: {},
                      user: {},
                      wellness: {}
                    }} />
                  </Suspense>
                } />
                
                {/* ✅ FIREBASE-ONLY: Progressive stages with Firebase tracking */}
                <Route path="/stage1/*" element={
                  <Suspense fallback={<FastLoader message="Preparing your stillness practice..." />}>
                    <Stage1Wrapper />
                  </Suspense>
                } />
                
                <Route path="/stage2" element={
                  <Suspense fallback={<FastLoader message="Loading attention training..." />}>
                    <Stage2Wrapper />
                  </Suspense>
                } />
                
                <Route path="/stage3" element={
                  <Suspense fallback={<FastLoader message="Preparing structured practice..." />}>
                    <Stage3Wrapper />
                  </Suspense>
                } />
                
                <Route path="/stage4" element={
                  <Suspense fallback={<FastLoader message="Loading advanced techniques..." />}>
                    <Stage4Wrapper />
                  </Suspense>
                } />
                
                <Route path="/stage5" element={
                  <Suspense fallback={<FastLoader message="Preparing refined awareness..." />}>
                    <Stage5Wrapper />
                  </Suspense>
                } />
                
                <Route path="/stage6" element={
                  <Suspense fallback={<FastLoader message="Loading complete mastery..." />}>
                    <Stage6Wrapper />
                  </Suspense>
                } />
                
                <Route path="/learning/pahm" element={
                  <Suspense fallback={<FastLoader message="Loading PAHM wisdom..." />}>
                    <WhatIsPAHMWrapper />
                  </Suspense>
                } />
                
                <Route path="/seeker-practice-timer" element={<SeekerPracticeTimerRedirect />} />
                <Route path="/seeker-practice-complete" element={<SeekerPracticeCompleteRedirect />} />
                
                <Route path="/immediate-reflection" element={
                  <Suspense fallback={<FastLoader message="Preparing reflection space..." />}>
                    <ImmediateReflectionWrapper />
                  </Suspense>
                } />
                
                <Route path="/notes" element={
                  <Suspense fallback={<FastLoader message="Loading your practice notes..." />}>
                    <DailyEmotionalNotesWrapper />
                  </Suspense>
                } />
                
                <Route path="/analytics" element={
                  <Suspense fallback={<FastLoader message="Loading your progress insights..." />}>
                    <AnalyticsBoardWrapper />
                  </Suspense>
                } />
                
                <Route path="/mind-recovery" element={
                  <Suspense fallback={<FastLoader message="Preparing mind recovery practice..." />}>
                    <MindRecoverySelectionWrapper />
                  </Suspense>
                } />
                
                <Route path="/mind-recovery/:practiceType" element={
                  <Suspense fallback={<FastLoader message="Starting mind recovery session..." />}>
                    <MindRecoveryTimerWrapper />
                  </Suspense>
                } />
                
                <Route path="/posture-guide" element={
                  <Suspense fallback={<FastLoader message="Loading optimal posture guide..." />}>
                    <PostureGuide onContinue={() => navigate('/home')} />
                  </Suspense>
                } />
                
                {/* ✅ FIREBASE-ONLY: UserProfile with Firebase navigation */}
                <Route path="/profile" element={
                  <Suspense fallback={<FastLoader message="Loading your practice profile..." />}>
                    <UserProfile 
                      onBack={() => navigate('/home')} 
                      onLogout={handlers.logout}
                      onNavigateToQuestionnaire={() => handlers.navigateToQuestionnaire('/profile')}
                      onNavigateToSelfAssessment={() => handlers.navigateToSelfAssessment('/profile')}
                    />
                  </Suspense>
                } />
                
                <Route 
                  path="/chatwithguru" 
                  element={
                    <Suspense fallback={<FastLoader message="Connecting with your AI teacher..." />}>
                      {knowledgeBaseReady ? <ChatInterface /> : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '18px' }}>
                          Loading knowledge base...
                        </div>
                      )}
                    </Suspense>
                  } 
                />
                
                <Route path="/happiness-test" element={
                  <Suspense fallback={<FastLoader message="Calculating your happiness levels..." />}>
                    <HappinessTrackerPage />
                  </Suspense>
                } />
                
                <Route path="/happiness-tracker" element={
                  <Suspense fallback={<FastLoader message="Calculating your happiness levels..." />}>
                    <HappinessTrackerPage />
                  </Suspense>
                } />
                
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </MainNavigation>
          </Suspense>
        } />
      </Routes>

      {/* 🔧 FIXED: Progress Tracker with consistent stage data */}
      {location.pathname === '/home' && <PAHMProgressTracker currentStage={currentStage} />}
    </div>
  );
});

// ✅ FIREBASE-ONLY: Updated provider chain with Firebase-ready contexts
const App: React.FC = React.memo(() => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
});

export default App;