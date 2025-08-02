// ✅ FIXED App.tsx - Complete Homepage Flash Elimination
// File: src/App.tsx
// 🔧 ENHANCED: Fixed race condition that causes homepage flash before landing page

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

// ✅ UNIVERSAL ARCHITECTURE: Import the enhanced Firebase-ready contexts
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

// ✅ NEW: Import Stage1Introduction directly (not lazy loaded for better UX)
import Stage1Introduction from './Stage1Introduction';

// ✅ FIXED: Import PublicLandingHero directly
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

// ✅ NEW: Practice Reflection Component (for T1-T5)
const PracticeReflection = lazy(() => import('./PracticeReflection'));

// Public landing pages
const AboutMethod = lazy(() => import('./components/AboutMethod'));
const PublicFAQ = lazy(() => import('./components/PublicFAQ'));

// Other components
const PostureGuide = lazy(() => import('./PostureGuide'));
const UserProfile = lazy(() => import('./UserProfile'));
const HappinessTrackerPage = lazy(() => import('./components/HappinessTrackerPage'));

// ✅ ENHANCED: FastLoader with better loading states and shorter emergency exit
interface FastLoaderProps {
  message?: string;
  timeout?: number;
}

const FastLoader: React.FC<FastLoaderProps> = React.memo(({ message = "Loading...", timeout = 2000 }) => {
  const [showEmergencyExit, setShowEmergencyExit] = useState(false);

  useEffect(() => {
    // Show emergency exit option after 1.5 seconds
    const emergencyTimer = setTimeout(() => {
      setShowEmergencyExit(true);
    }, 1500);

    // ✅ IMPROVED: Shorter emergency exit (2 seconds instead of 3)
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

// ✅ FIREBASE ENHANCED: Practice Reflection Wrapper with Firebase integration
const PracticeReflectionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addReflection } = useWellness(); // ✅ Use WellnessContext for Firebase storage
  const { setT5Completed, updateStageProgress } = useUser(); // ✅ Use UserContext for Firebase storage
  const [isSaving, setIsSaving] = useState(false);
  
  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);
  
  const handleSaveReflection = useCallback(async (reflectionData: any) => {
    try {
      setIsSaving(true);
      
      // ✅ FIREBASE INTEGRATION: Save reflection to Firebase via WellnessContext
      await addReflection({
        ...reflectionData,
        timestamp: new Date().toISOString(),
        sessionData: location.state || {},
        type: 'practice_reflection'
      });
      
      // ✅ AUDIT COMPLIANCE: Also save to localStorage for backward compatibility
      const existingReflections = JSON.parse(localStorage.getItem('practiceReflections') || '[]');
      existingReflections.push({
        ...reflectionData,
        timestamp: new Date().toISOString(),
        sessionData: location.state || {}
      });
      localStorage.setItem('practiceReflections', JSON.stringify(existingReflections));
      
      console.log('✅ Practice reflection saved to Firebase and localStorage');
      
      // ✅ FIREBASE INTEGRATION: Check if this is T5 completion
      const state = location.state as any;
      if (state?.tLevel === 'T5' || state?.isT5Completion) {
        // ✅ Save T5 completion to Firebase via UserContext
        await setT5Completed(true);
        
        // ✅ Update stage progress to allow Stage 2 access
        await updateStageProgress({
          currentStage: 2,
          devCurrentStage: '2',
          t5Completed: true
        });
        
        // ✅ BACKWARD COMPATIBILITY: Also set in localStorage
        sessionStorage.setItem('t5Completed', 'true');
        localStorage.setItem('t5Completed', 'true');
        sessionStorage.setItem('stageProgress', '2');
        localStorage.setItem('devCurrentStage', '2');
        sessionStorage.setItem('currentTLevel', 't6');
        
        console.log('✅ T5 completed, unlocking Stage 2 in Firebase and localStorage');
        
        // Force a page reload to ensure all components update
        window.location.href = '/home';
        return;
      }
      
      navigate('/home');
    } catch (error) {
      console.error('❌ Error saving practice reflection:', error);
      
      // ✅ FALLBACK: Save to localStorage only if Firebase fails
      try {
        const existingReflections = JSON.parse(localStorage.getItem('practiceReflections') || '[]');
        existingReflections.push({
          ...reflectionData,
          timestamp: new Date().toISOString(),
          sessionData: location.state || {}
        });
        localStorage.setItem('practiceReflections', JSON.stringify(existingReflections));
        console.log('⚠️ Reflection saved to localStorage as fallback');
        navigate('/home');
      } catch (fallbackError) {
        console.error('❌ Complete save failure:', fallbackError);
        alert('Failed to save reflection. Please try again.');
      }
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

// ✅ NEW: Legacy Redirect Components for Backward Compatibility
const SeekerPracticeTimerRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get T-level from state or default to T1
    const state = location.state as { level?: string } || {};
    const tLevel = (state.level || 't1').toLowerCase();
    
    // Extract just the T-level (T1, T2, etc.)
    const tLevelUpper = tLevel.toUpperCase();
    
    console.log('🔄 Redirecting legacy seeker-practice-timer to Stage1Wrapper');
    console.log('Target T-Level:', tLevelUpper);
    
    // Redirect to modern Stage1Wrapper flow
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

// ✅ FIREBASE ENHANCED: Updated completion status checker
const useCompletionStatus = () => {
  const { getCompletionStatus } = useOnboarding();
  const { currentUser } = useAuth();

  const checkCompletionStatus = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      await getCompletionStatus(); // Now async with Firebase
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
    }
  }, [currentUser, getCompletionStatus]);

  useEffect(() => {
    checkCompletionStatus();
  }, [checkCompletionStatus]);

  return { recheckStatus: checkCompletionStatus };
};

// ✅ FIREBASE ENHANCED: Updated Questionnaire Component
const QuestionnaireComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markQuestionnaireComplete } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleQuestionnaireComplete = useCallback(async (answers: any) => {
    try {
      setIsCompleting(true);
      
      // ✅ FIREBASE INTEGRATION: Save to Firebase via OnboardingContext
      await markQuestionnaireComplete(answers);
      
      console.log('✅ Questionnaire completed and saved to Firebase');
      
      // ✅ FIXED: Properly access React Router location state
      const returnTo = (location.state as any)?.returnTo || '/home';
      navigate(returnTo);
    } catch (error) {
      console.error('❌ Error completing questionnaire:', error);
      
      // ✅ FALLBACK: Try localStorage save
      try {
        localStorage.setItem('questionnaire_completed', 'true');
        localStorage.setItem('questionnaire_data', JSON.stringify(answers));
        console.log('⚠️ Questionnaire saved to localStorage as fallback');
        navigate('/home');
      } catch (fallbackError) {
        console.error('❌ Complete questionnaire save failure:', fallbackError);
        alert('Failed to save questionnaire. Please try again.');
      }
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

// ✅ FIREBASE ENHANCED: Updated Self Assessment Component
const SelfAssessmentComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markSelfAssessmentComplete } = useOnboarding();
  const { updateProfile } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSelfAssessmentComplete = useCallback(async (data: any) => {
    try {
      setIsCompleting(true);
      
      // ✅ FIREBASE INTEGRATION: Save to Firebase via OnboardingContext
      await markSelfAssessmentComplete(data);
      
      // ✅ FIREBASE INTEGRATION: Update user profile
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
      
      // ✅ FIXED: Properly access React Router location state
      const returnTo = (location.state as any)?.returnTo;
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/self-assessment-completion');
      }
    } catch (error) {
      console.error('❌ Error completing self-assessment:', error);
      
      // ✅ FALLBACK: Try localStorage save
      try {
        localStorage.setItem('self_assessment_completed', 'true');
        localStorage.setItem('self_assessment_data', JSON.stringify(data));
        console.log('⚠️ Self-assessment saved to localStorage as fallback');
        navigate('/self-assessment-completion');
      } catch (fallbackError) {
        console.error('❌ Complete self-assessment save failure:', fallbackError);
        alert('Failed to save self-assessment. Please try again.');
      }
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

// ✅ FIREBASE ENHANCED: Main app content with Firebase-ready contexts
const AppContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoading, signIn, signUp, logout } = useAuth();
  const { userProfile, markStageIntroComplete } = useUser(); // ✅ Use Firebase-enabled UserContext
  
  // ✅ CRITICAL FIX: Better state management to prevent homepage flash
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [appInitialized, setAppInitialized] = useState(false);
  const [authStateStable, setAuthStateStable] = useState(false);
  
  // ✅ FIXED: Define isAuthenticated BEFORE using it
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  
  // ✅ FIREBASE ENHANCED: Use Firebase-enabled contexts
  const { recheckStatus } = useCompletionStatus();
  
  // ✅ FIREBASE ENHANCED: Get current stage from UserContext (Firebase-backed)
  const currentStage = useMemo(() => {
    if (!isAuthenticated) return 1;
    
    try {
      // ✅ First try Firebase data from UserContext
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
      
      // ✅ Fallback to localStorage for backward compatibility
      const t5Complete = localStorage.getItem('t5Complete') === 'true';
      if (!t5Complete) return 1;
      
      for (let stage = 2; stage <= 6; stage++) {
        const stageComplete = localStorage.getItem(`stage${stage}Complete`) === 'true';
        if (!stageComplete) return stage;
      }
      return 6;
    } catch (error) {
      console.warn('Error calculating current stage:', error);
      return 1;
    }
  }, [isAuthenticated, userProfile]);
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true);

  // ✅ CRITICAL FIX: Better app initialization timing
  useEffect(() => {
    console.log('🚀 App initialization starting...');
    
    const initTimer = setTimeout(() => {
      setAppInitialized(true);
      console.log('✅ App initialized');
    }, 300); // Reduced from 500ms
    
    // ✅ CRITICAL: Auth state stability timing
    const authStableTimer = setTimeout(() => {
      setAuthStateStable(true);
      console.log('✅ Auth state stable');
    }, 800); // Reduced from 1000ms
    
    return () => {
      clearTimeout(initTimer);
      clearTimeout(authStableTimer);
    };
  }, []);

  // ✅ PERFORMANCE: Initialize knowledge base
  useEffect(() => {
    setKnowledgeBaseReady(true);
  }, []);

  // ✅ FIXED: Better authentication completion handling
  useEffect(() => {
    if (currentUser && isSigningIn) {
      console.log('✅ Authentication completed successfully');
      setIsSigningIn(false);
      
      // ✅ FIXED: More controlled navigation after sign-in
      const timer = setTimeout(() => {
        if (location.pathname === '/signin' || location.pathname === '/signup' || location.pathname === '/') {
          console.log('🏠 Redirecting to home after successful authentication');
          navigate('/home', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, isSigningIn, location.pathname, navigate]);

  // ✅ FIXED: Clear signing in state if auth fails
  useEffect(() => {
    if (!isLoading && !currentUser && isSigningIn) {
      console.log('❌ Authentication may have failed, clearing signing-in state');
      setIsSigningIn(false);
    }
  }, [isLoading, currentUser, isSigningIn]);

  // ✅ FIREBASE ENHANCED: Stage intro completion handler
  const markStageIntroCompleteHandler = useCallback(async (stageNumber: number) => {
    try {
      // ✅ Save to Firebase via UserContext
      await markStageIntroComplete(`stage${stageNumber}-intro`);
      
      // ✅ BACKWARD COMPATIBILITY: Also save to localStorage
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      if (!completedIntros.includes(stageNumber)) {
        completedIntros.push(stageNumber);
        localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
      }
      
      console.log(`✅ Stage ${stageNumber} intro marked complete in Firebase and localStorage`);
    } catch (error) {
      console.error(`❌ Error marking stage ${stageNumber} intro complete:`, error);
      
      // ✅ FALLBACK: Save to localStorage only
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      if (!completedIntros.includes(stageNumber)) {
        completedIntros.push(stageNumber);
        localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
      }
    }
  }, [markStageIntroComplete]);

  // ✅ FIREBASE ENHANCED: Updated handlers with Firebase integration
  const handlers = useMemo(() => ({
    // ✅ FIREBASE ENHANCED: Progressive Stage 1 flow with Firebase intro tracking
    startPractice: async () => {
      try {
        // ✅ Check Firebase data first, then localStorage fallback
        let hasSeenStage1Intro = false;
        
        if (userProfile?.stageProgress?.completedStageIntros) {
          hasSeenStage1Intro = userProfile.stageProgress.completedStageIntros.includes('stage1-intro');
        } else {
          // Fallback to localStorage
          hasSeenStage1Intro = JSON.parse(localStorage.getItem('completedStageIntros') || '[]').includes(1);
        }
        
        if (hasSeenStage1Intro) {
          navigate('/stage1'); // Go to progressive T-level selection
        } else {
          navigate('/stage1-introduction'); // Show intro first
        }
      } catch (error) {
        console.error('Error checking stage intro status:', error);
        // Default to showing intro
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
    
    // ✅ FIREBASE ENHANCED: UserProfile Navigation Handlers
    navigateToQuestionnaire: (returnTo?: string) => {
      console.log('🚀 Navigating to questionnaire...');
      navigate('/questionnaire', { state: { returnTo: returnTo || '/home' } });
    },
    
    navigateToSelfAssessment: (returnTo?: string) => {
      console.log('🚀 Navigating to self-assessment...');
      navigate('/self-assessment', { state: { returnTo: returnTo || '/home' } });
    },
    
    // ✅ FIXED: AUTH HANDLERS with proper error handling and state management
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
        // Don't navigate here - let the useEffect handle it after currentUser is set
        
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
        // Don't navigate here - let the useEffect handle it after currentUser is set
        
      } catch (error: any) {
        console.error('❌ Sign in failed:', error);
        setIsSigningIn(false);
        alert(`Failed to sign in: ${error?.message || 'Please check your credentials.'}`);
      }
    },
    
    // ✅ OTHER HANDLERS with proper types
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
          localStorage.setItem('authToken', data.token);
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

  // ✅ CRITICAL FIX: Better loading logic to prevent homepage flash
  const shouldShowLoader = useMemo(() => {
    console.log('🔍 Loading check:', {
      isLoading,
      currentUser: !!currentUser,
      appInitialized,
      isSigningIn,
      authStateStable
    });

    // Show loader if:
    // 1. Firebase auth is still loading AND we don't know the auth state yet
    // 2. App hasn't finished initializing AND we don't have a user
    // 3. We're actively signing in
    // 4. Auth state hasn't stabilized yet AND Firebase is still loading
    
    const shouldLoad = (isLoading && !authStateStable) || 
                      (!appInitialized && !currentUser) ||
                      isSigningIn ||
                      (!authStateStable && isLoading);
    
    console.log('🔍 Should show loader:', shouldLoad);
    return shouldLoad;
  }, [isLoading, currentUser, appInitialized, isSigningIn, authStateStable]);
  
  // ✅ CRITICAL FIX: Show loader first to prevent any route flashing
  if (shouldShowLoader) {
    const message = isSigningIn ? "Signing you in..." : "Initializing practices for the happiness that stays...";
    console.log('🔄 Showing loader:', message);
    return <FastLoader message={message} timeout={4000} />;
  }

  // ✅ CRITICAL FIX: Only show unauthenticated routes when we're absolutely certain
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

  // ✅ CRITICAL FIX: Only show authenticated routes when user is actually authenticated
  if (!isAuthenticated) {
    console.log('🔄 Auth state not ready, showing loader');
    return <FastLoader message="Preparing your practice space..." timeout={4000} />;
  }

  console.log('🏠 Showing authenticated routes (home dashboard)');

  // ✅ FIREBASE ENHANCED: Authenticated routes with Firebase integration
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ FIREBASE ENHANCED: Stage1Introduction with Firebase intro tracking */}
        <Route 
          path="/stage1-introduction" 
          element={
            <Stage1Introduction 
              onComplete={async () => {
                await markStageIntroCompleteHandler(1);
                navigate('/stage1');
              }}
              onBack={() => navigate('/home')}
              hasSeenBefore={userProfile?.stageProgress?.completedStageIntros?.includes('stage1-intro') || 
                            JSON.parse(localStorage.getItem('completedStageIntros') || '[]').includes(1)}
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

        {/* ✅ MAIN APP ROUTES - NOW USING FIREBASE-ENHANCED CONTEXTS */}
        <Route path="/*" element={
          <Suspense fallback={<FastLoader message="Loading your practice space..." />}>
            <MainNavigation>
              <Routes>
                {/* ✅ CRITICAL FIX: Root redirect inside nested routes - NO MORE FLASH */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* ✅ HOME DASHBOARD - Firebase-enhanced */}
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
                      practice: {}, // Add your practice context if available
                      user: {},     // Add your user context if available
                      wellness: {}  // Add your wellness context if available
                    }} />
                  </Suspense>
                } />
                
                {/* ✅ FIREBASE ENHANCED: Progressive stages with Firebase tracking */}
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
                
                {/* ✅ FIREBASE ENHANCED: Practice reflection with cloud save */}
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
                
                {/* ✅ FIREBASE ENHANCED: UserProfile with Firebase navigation */}
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

      {/* ✅ FIREBASE ENHANCED: Progress Tracker with Firebase stage data */}
      {location.pathname === '/home' && <PAHMProgressTracker currentStage={currentStage} />}
    </div>
  );
});

// ✅ FIREBASE ENHANCED: Updated provider chain with Firebase-ready contexts
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