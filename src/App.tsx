// ✅ FIREBASE-ONLY App.tsx - Complete Firebase Integration
// File: src/App.tsx
// 🔧 ENHANCED: Firebase-only architecture with NO localStorage/sessionStorage usage

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

// Practice Reflection Component (for T1-T5)
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

// ✅ DEBUG COMPONENT: Add this temporarily to see what's happening
const LoadingDebugger: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <div>Auth Loading: {isLoading ? 'TRUE' : 'FALSE'}</div>
      <div>User: {currentUser ? 'EXISTS' : 'NULL'}</div>
      <div>Path: {location.pathname}</div>
      <div>Time: {new Date().toLocaleTimeString()}</div>
      <button 
        onClick={() => window.location.href = '/home'}
        style={{ marginTop: '5px', padding: '2px 5px', cursor: 'pointer' }}
      >
        Force Home
      </button>
      <button 
        onClick={() => window.location.href = '/'}
        style={{ marginTop: '5px', padding: '2px 5px', cursor: 'pointer', marginLeft: '5px' }}
      >
        Force Landing
      </button>
    </div>
  );
};

// ✅ FIREBASE-ONLY: Practice Reflection Wrapper using Firebase contexts only
const PracticeReflectionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addReflection } = useWellness();
  const { setT5Completed, updateStageProgress } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);
  
  const handleSaveReflection = useCallback(async (reflectionData: any) => {
    try {
      setIsSaving(true);
      
      // ✅ FIREBASE-ONLY: Save reflection to Firebase via WellnessContext
      await addReflection({
        ...reflectionData,
        timestamp: new Date().toISOString(),
        sessionData: location.state || {},
        type: 'practice_reflection'
      });
      
      console.log('✅ Practice reflection saved to Firebase');
      
      // ✅ FIREBASE-ONLY: Check if this is T5 completion
      const state = location.state as any;
      if (state?.tLevel === 'T5' || state?.isT5Completion) {
        // ✅ Save T5 completion to Firebase via UserContext
        await setT5Completed(true);
        
        // ✅ Update stage progress to allow Stage 2 access
        await updateStageProgress({
          currentStage: 2,
          t5Completed: true
        });
        
        console.log('✅ T5 completed, unlocking Stage 2 in Firebase');
        
        // Force a page reload to ensure all components update
        window.location.href = '/home';
        return;
      }
      
      navigate('/home');
    } catch (error) {
      console.error('❌ Error saving practice reflection:', error);
      alert('Failed to save reflection. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  }, [addReflection, setT5Completed, updateStageProgress, location.state, navigate]);
  
  if (isSaving) {
    return <FastLoader message="Saving your reflection to cloud..." />;
  }
  
  return (
    <Suspense fallback={<FastLoader message="Loading practice reflection..." />}>
      <PracticeReflection 
        onBack={handleBack}
        onSaveReflection={handleSaveReflection}
      />
    </Suspense>
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
  const { userProfile, markStageIntroComplete } = useUser();
  
  // ✅ State management to prevent homepage flash
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [authStateStable, setAuthStateStable] = useState(false);
  
  // ✅ Define isAuthenticated BEFORE using it
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  
  // ✅ FIREBASE-ONLY: Use Firebase-enabled contexts
  const { recheckStatus } = useCompletionStatus();
  
  // ✅ FIREBASE-ONLY: Get current stage from UserContext (Firebase-backed)
  const currentStage = useMemo(() => {
    if (!isAuthenticated) return 1;
    
    try {
      // ✅ FIREBASE-ONLY: Get from Firebase data
      if (userProfile?.stageProgress) {
        const stageProgress = userProfile.stageProgress;
        
        // Check T5 completion from Firebase
        if (!stageProgress.t5Completed) return 1;
        
        // Check PAHM stages from Firebase
        for (let stage = 2; stage <= 6; stage++) {
          const stageKey = `stage${stage}Complete`;
          if (!stageProgress.stageCompletionFlags?.[stageKey]) {
            return stage;
          }
        }
        return 6; // All completed
      }
      
      return 1; // Default if no Firebase data
    } catch (error) {
      console.warn('Error calculating current stage:', error);
      return 1;
    }
  }, [isAuthenticated, userProfile]);
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true);

  // ✅ App initialization timing
  useEffect(() => {
    console.log('🚀 App initialization starting...');
    
    const initTimer = setTimeout(() => {
      setAppInitialized(true);
      console.log('✅ App initialized');
    }, 300);
    
    const authStableTimer = setTimeout(() => {
      setAuthStateStable(true);
      console.log('✅ Auth state stable');
    }, 800);
    
    return () => {
      clearTimeout(initTimer);
      clearTimeout(authStableTimer);
    };
  }, []);

  // ✅ EMERGENCY: Force loading to complete after maximum timeout
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (isLoading && !currentUser) {
        console.warn('🚨 EMERGENCY: Forcing app to show landing page after timeout');
        // Force the auth context to recognize no user
        setAuthStateStable(true);
        setAppInitialized(true);
      } else if (isLoading && currentUser) {
        console.warn('🚨 EMERGENCY: User exists but still loading - forcing completion');
        setAuthStateStable(true);
        setAppInitialized(true);
      }
    }, 8000); // 8 seconds maximum

    return () => clearTimeout(emergencyTimeout);
  }, [isLoading, currentUser]);

  // ✅ DEBUGGING: Add console logs to better understand loading state
  useEffect(() => {
    console.log('🔍 Loading State Debug:', {
      isLoading,
      currentUser: !!currentUser,
      userProfile: !!userProfile,
      appInitialized,
      authStateStable,
      location: location.pathname
    });
  }, [isLoading, currentUser, userProfile, appInitialized, authStateStable, location.pathname]);

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
          const data = await response.json();
          // Note: No localStorage usage here
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
    recheckStatus,
    userProfile
  ]);

  // ✅ SIMPLIFIED: Better loading logic to prevent homepage flash
  const shouldShowLoader = useMemo(() => {
    // ✅ SIMPLE RULE: Only show loader if:
    // 1. Auth is actively loading AND we don't have a user yet
    // 2. OR we're in the process of signing in
    
    const authLoading = isLoading && !authStateStable;
    const activeSignIn = isSigningIn;
    const initializing = !appInitialized && !currentUser;
    
    const shouldLoad = authLoading || activeSignIn || initializing;
    
    console.log('🔍 Loading Decision:', {
      isLoading,
      authStateStable,
      isSigningIn,
      appInitialized,
      hasUser: !!currentUser,
      decision: shouldLoad ? 'SHOW_LOADER' : 'SHOW_CONTENT'
    });
    
    return shouldLoad;
  }, [isLoading, authStateStable, isSigningIn, appInitialized, currentUser]);
  
  // ✅ Show loader first to prevent any route flashing
  if (shouldShowLoader) {
    const message = isSigningIn ? "Signing you in..." : "Initializing practices for the happiness that stays...";
    console.log('🔄 Showing loader:', message);
    return (
      <>
        <div style={{display: "none"}} />
        <FastLoader message={message} timeout={10000} />
      </>
    );
  }

  // ✅ Only show unauthenticated routes when we're absolutely certain
  const shouldShowUnauthenticatedRoutes = !isAuthenticated && authStateStable && !isSigningIn && appInitialized;
  
  console.log('🔍 Route decision:', {
    isAuthenticated,
    authStateStable,
    isSigningIn,
    appInitialized,
    shouldShowUnauthenticatedRoutes
  });

  if (shouldShowUnauthenticatedRoutes) {
    console.log('🌟 Showing unauthenticated routes (landing page)');
    return (
      <div className="app-container">
        <div style={{display: "none"}} />
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
        <div style={{display: "none"}} />
        <FastLoader message="Preparing your practice space..." timeout={10000} />
      </>
    );
  }

  console.log('🏠 Showing authenticated routes (home dashboard)');

  // ✅ FIREBASE-ONLY: Authenticated routes with Firebase integration
  return (
    <div className="app-container">
      <div style={{display: "none"}} />
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
                
                {/* ✅ FIREBASE-ONLY: HOME DASHBOARD */}
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
                
                {/* ✅ FIREBASE-ONLY: Practice reflection with cloud save */}
                <Route path="/practice-reflection" element={<PracticeReflectionWrapper />} />
                
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

      {/* ✅ FIREBASE-ONLY: Progress Tracker with Firebase stage data */}
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