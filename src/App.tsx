// ✅ FIXED App.tsx - Admin Panel Context Error Resolved
// File: src/App.tsx
// 🔧 FIXED: Added missing contexts property for CleanAdminPanel

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

// ✅ UNIVERSAL ARCHITECTURE: Import the new focused contexts
import { AppProvider } from './contexts/AppProvider';
import { useUser } from './contexts/user/UserContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';

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

// ✅ FIXED: FastLoader with proper TypeScript interface
interface FastLoaderProps {
  message?: string;
}

const FastLoader: React.FC<FastLoaderProps> = React.memo(({ message = "Loading..." }) => {
  useEffect(() => {
    // ✅ SAFETY: Force exit loading after 3 seconds (increased from 2s)
    const emergencyExit = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚨 EMERGENCY EXIT: Loading took too long, forcing navigation');
      }
      window.location.href = '/';
    }, 3000);

    return () => clearTimeout(emergencyExit);
  }, []);

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
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Emergency exit in 3s if stuck...
        </div>
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

// ✅ NEW: Practice Reflection Wrapper for T1-T5
const PracticeReflectionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    navigate('/home');
  };
  
  const handleSaveReflection = (reflectionData: any) => {
    // Save reflection data to localStorage
    const existingReflections = JSON.parse(localStorage.getItem('practiceReflections') || '[]');
    existingReflections.push({
      ...reflectionData,
      timestamp: new Date().toISOString(),
      sessionData: location.state || {}
    });
    localStorage.setItem('practiceReflections', JSON.stringify(existingReflections));
    
    console.log('Practice reflection saved:', reflectionData);
    
    // Check if this is T5 completion
    const state = location.state as any;
    if (state?.tLevel === 'T5' || state?.isT5Completion) {
      // Set T5 completion flags
      sessionStorage.setItem('t5Completed', 'true');
      localStorage.setItem('t5Completed', 'true');
      
      // Set stage progress to allow Stage 2 access
      sessionStorage.setItem('stageProgress', '2');
      localStorage.setItem('devCurrentStage', '2');
      
      // Force current T level to be beyond T5 to ensure unlock
      sessionStorage.setItem('currentTLevel', 't6');
      
      console.log('T5 completed, unlocking Stage 2');
      
      // Force a page reload to ensure all components update
      window.location.href = '/home';
      return;
    }
    
    navigate('/home');
  };
  
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
  
  React.useEffect(() => {
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
    <FastLoader message="Redirecting to modern practice flow..." />
  );
};

const SeekerPracticeCompleteRedirect: React.FC = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    console.log('🔄 Redirecting legacy seeker-practice-complete to home');
    navigate('/home', { replace: true });
  }, [navigate]);
  
  return (
    <FastLoader message="Redirecting to dashboard..." />
  );
};

// ✅ UNIVERSAL ARCHITECTURE: Updated completion status checker
const useCompletionStatus = () => {
  const { getCompletionStatus } = useOnboarding();
  const { currentUser } = useAuth();

  const checkCompletionStatus = useCallback(() => {
    if (!currentUser) {
      return;
    }

    try {
      getCompletionStatus();
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
    }
  }, [currentUser, getCompletionStatus]);

  useEffect(() => {
    checkCompletionStatus();
  }, [checkCompletionStatus]);

  return { recheckStatus: checkCompletionStatus };
};

// ✅ UNIVERSAL ARCHITECTURE: Updated Questionnaire Component
const QuestionnaireComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markQuestionnaireComplete } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleQuestionnaireComplete = async (answers: any) => {
    try {
      setIsCompleting(true);
      await markQuestionnaireComplete(answers);
      
      // ✅ FIXED: Properly access React Router location state
      const returnTo = (location.state as any)?.returnTo || '/home';
      navigate(returnTo);
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="questionnaire-container">
      <Suspense fallback={<FastLoader />}>
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      </Suspense>
      {isCompleting && <FastLoader />}
    </div>
  );
};

// ✅ UNIVERSAL ARCHITECTURE: Updated Self Assessment Component
const SelfAssessmentComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markSelfAssessmentComplete } = useOnboarding();
  const { updateProfile } = useUser();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSelfAssessmentComplete = async (data: any) => {
    try {
      setIsCompleting(true);
      await markSelfAssessmentComplete(data);
      
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
      } catch (profileError) {
        console.warn('Profile update failed, continuing anyway:', profileError);
      }
      
      // ✅ FIXED: Properly access React Router location state
      const returnTo = (location.state as any)?.returnTo;
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/self-assessment-completion');
      }
    } catch (error) {
      console.error('Error completing self-assessment:', error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="self-assessment-container">
      <Suspense fallback={<FastLoader />}>
        <SelfAssessment 
          onComplete={handleSelfAssessmentComplete}
          onBack={() => navigate('/introduction')}
        />
      </Suspense>
      {isCompleting && <FastLoader />}
    </div>
  );
};

// ✅ UNIVERSAL ARCHITECTURE: Main app content with focused contexts
const AppContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoading, signIn, signUp, logout } = useAuth();
  
  // ✅ NEW: Add signing in state to prevent flash
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  // ✅ FIXED: Define isAuthenticated BEFORE using it
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  
  // ✅ UNIVERSAL ARCHITECTURE: Use focused contexts instead of useLocalData
  const { recheckStatus } = useCompletionStatus();
  
  // ✅ Get current stage from progressive onboarding (only if authenticated)
  const currentStage = isAuthenticated ? (() => {
    try {
      // We'll calculate current stage based on localStorage since we can't use hooks conditionally
      const t5Complete = localStorage.getItem('t5Complete') === 'true';
      if (!t5Complete) return 1;
      
      // Check PAHM stages
      for (let stage = 2; stage <= 6; stage++) {
        const stageComplete = localStorage.getItem(`stage${stage}Complete`) === 'true';
        if (!stageComplete) return stage;
      }
      return 6; // All completed
    } catch (error) {
      return 1;
    }
  })() : 1;
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // ✅ PERFORMANCE: Force app ready quickly
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ PERFORMANCE: Initialize knowledge base
  useEffect(() => {
    setKnowledgeBaseReady(true);
  }, []);

  // ✅ NEW: Clear signing in state when authentication completes
  useEffect(() => {
    if (currentUser && isSigningIn) {
      console.log('✅ Authentication completed, clearing signing-in state...');
      setIsSigningIn(false);
      // Navigate to home after auth state is confirmed
      if (location.pathname === '/signin' || location.pathname === '/') {
        navigate('/home');
      }
    }
  }, [currentUser, isSigningIn, location.pathname, navigate]);

  // ✅ FIXED: startPractice now checks intro and routes to progressive selection
  const handlers = useMemo(() => ({
    // ✅ FIXED: Progressive Stage 1 flow
    startPractice: () => {
      const hasSeenStage1Intro = JSON.parse(localStorage.getItem('completedStageIntros') || '[]').includes(1);
      if (hasSeenStage1Intro) {
        navigate('/stage1'); // Go to progressive T-level selection
      } else {
        navigate('/stage1-introduction'); // Show intro first
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
    
    // ✅ NEW: UserProfile Navigation Handlers
    navigateToQuestionnaire: (returnTo?: string) => {
      console.log('🚀 Navigating to questionnaire...');
      navigate('/questionnaire', { state: { returnTo: returnTo || '/home' } });
    },
    
    navigateToSelfAssessment: (returnTo?: string) => {
      console.log('🚀 Navigating to self-assessment...');
      navigate('/self-assessment', { state: { returnTo: returnTo || '/home' } });
    },
    
    // ✅ AUTH HANDLERS with proper types
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
        setIsSigningIn(true); // ✅ NEW: Set signing in state
        await signUp(email, password, name);
        // ✅ NEW: Go directly to home after signup
        navigate('/home');
      } catch (error: any) {
        if (error?.code === 'auth/email-already-in-use') {
          alert('This email is already registered. Please sign in instead.');
          navigate('/signin');
        } else {
          alert(`Signup failed: ${error?.message || 'Unknown error'}`);
        }
      } finally {
        setIsSigningIn(false); // ✅ NEW: Clear signing in state
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        console.log('🔐 Starting sign in process...');
        setIsSigningIn(true); // ✅ Set signing in state to prevent flash
        
        await signIn(email, password);
        
        console.log('✅ Sign in successful, staying in loading state until auth updates...');
        // ✅ DON'T navigate or clear isSigningIn immediately
        // Let the auth state update naturally, which will trigger the authenticated routes
        // The isSigningIn state will be cleared by useEffect when currentUser changes
        
      } catch (error: any) {
        console.error('❌ Sign in failed:', error);
        alert(`Failed to sign in: ${error?.message || 'Please check your credentials.'}`);
        setIsSigningIn(false); // Only clear on error
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
          navigate('/home'); // ✅ NEW: Direct to home
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
    recheckStatus
  ]);

  // ✅ FIXED: Show loading when necessary OR when signing in
  if ((isLoading && !currentUser && !appReady) || isSigningIn) {
    return <FastLoader message={isSigningIn ? "Signing you in..." : "Initializing practices for the happiness that stays..."} />;
  }

  // ✅ FIXED: Don't show unauthenticated routes if we're in the middle of signing in
  if (!isAuthenticated && !isSigningIn) {
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

  // ✅ AUTHENTICATED ROUTES - NOW USING CLEAN ADMIN PANEL
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ STANDALONE ROUTES (no navigation) */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* ✅ FIXED: Stage1Introduction now navigates to progressive /stage1 */}
        <Route 
          path="/stage1-introduction" 
          element={
            <Stage1Introduction 
              onComplete={() => navigate('/stage1')}
              onBack={() => navigate('/home')}
              hasSeenBefore={JSON.parse(localStorage.getItem('completedStageIntros') || '[]').includes(1)}
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

        {/* ✅ MAIN APP ROUTES - NOW USING CLEAN ADMIN PANEL */}
        <Route path="/*" element={
          <Suspense fallback={<FastLoader message="Loading your practice space..." />}>
            <MainNavigation>
              <Routes>
                {/* ✅ HOME DASHBOARD - Normal user interface */}
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
                
                {/* ✅ CLEAN ADMIN PANEL - SIMPLIFIED: No props needed */}
                <Route path="/admin" element={
                  <Suspense fallback={<FastLoader message="Loading clean admin panel..." />}>
                    <CleanAdminPanel />
                  </Suspense>
                } />
                
                {/* ✅ PROGRESSIVE STAGE 1 - Uses Stage1Wrapper with sequential logic */}
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
                
                {/* ✅ FIXED: UserProfile with working navigation buttons */}
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

      {/* ✅ Progress Tracker - ONLY shows on Home Dashboard */}
      {isAuthenticated && location.pathname === '/home' && <PAHMProgressTracker currentStage={currentStage} />}
    </div>
  );
});

// ✅ UNIVERSAL ARCHITECTURE: Updated provider chain with clean focused contexts
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