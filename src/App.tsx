import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// ✅ ESSENTIAL: All imports at the top
import PageViewTracker from './components/PageViewTracker';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext';
import AdminPanel from './components/AdminPanel';
import LogoutWarning from './components/LogoutWarning';

// ✅ DIRECT FIX: Import LocalDataProvider directly
import { LocalDataProvider, useLocalData } from './contexts/LocalDataContext';

// ✅ CRITICAL COMPONENTS: Import normally to avoid chunk loading errors
import SignIn from './SignIn';
import SignUp from './SignUp';
import Introduction from './Introduction';
import Questionnaire from './Questionnaire';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';

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
const SeekerPracticeTimerWrapper = lazy(() => import('./SeekerPracticeTimerWrapper'));
const SeekerPracticeCompleteWrapper = lazy(() => import('./SeekerPracticeCompleteWrapper'));
const ImmediateReflectionWrapper = lazy(() => import('./ImmediateReflectionWrapper'));
const ChatInterface = lazy(() => import('./components/Chatwithguru/ChatInterface'));

// Public landing pages
const AboutMethod = lazy(() => import('./components/AboutMethod'));
const PublicFAQ = lazy(() => import('./components/PublicFAQ'));

// Other components
const PostureGuide = lazy(() => import('./PostureGuide'));
const UserProfile = lazy(() => import('./UserProfile'));
const HappinessTrackerPage = lazy(() => import('./components/HappinessTrackerPage'));

// ✅ BULLETPROOF: FastLoader with forced exit
const FastLoader: React.FC<{ message?: string }> = React.memo(({ message = "Loading..." }) => {
  useEffect(() => {
    // ✅ CRITICAL FIX: Force exit loading after 2 seconds
    const emergencyExit = setTimeout(() => {
      console.log('🚨 EMERGENCY EXIT: Loading took too long, forcing navigation');
      window.location.href = '/';
    }, 2000);

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
          Emergency exit in 2s if stuck...
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

// ✅ COMPLETE: AdminBypassApp with all your original functionality
const AdminBypassApp: React.FC = React.memo(() => {
  const navigate = useNavigate();
  
  const handleNavigateHome = useCallback(() => navigate('/home'), [navigate]);
  const handleNavigateHappiness = useCallback(() => navigate('/happiness-tracker'), [navigate]);
  const handleNavigateAnalytics = useCallback(() => navigate('/analytics'), [navigate]);
  const handleNavigateNotes = useCallback(() => navigate('/notes'), [navigate]);
  const handleNavigateChat = useCallback(() => navigate('/chatwithguru'), [navigate]);
  const handleNavigateStage1 = useCallback(() => navigate('/stage1'), [navigate]);

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
  }, []);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
  }, []);

  const buttonStyle = useMemo(() => ({
    padding: '15px 25px', 
    fontSize: '16px', 
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '2px solid white',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s'
  }), []);
  
  return (
    <div className="app-container">
      <AdminPanel />
      <PageViewTracker />
      
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🔧 Admin Mode - Firebase Bypass</h1>
        <p style={{ fontSize: '18px', marginBottom: '40px' }}>
          Firebase authentication bypassed. All app features available for testing.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <button onClick={handleNavigateHome} style={buttonStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            🏠 Go to Dashboard
          </button>
          <button onClick={handleNavigateHappiness} style={buttonStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            😊 Happiness Tracker
          </button>
          <button onClick={handleNavigateAnalytics} style={buttonStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            📊 Analytics
          </button>
          <button onClick={handleNavigateNotes} style={buttonStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            📝 Notes
          </button>
          <button onClick={handleNavigateChat} style={buttonStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            🧘 Chat with Guru
          </button>
          <button onClick={handleNavigateStage1} style={buttonStyle} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            🎯 Practice Stage 1
          </button>
        </div>
        
        <Routes>
          <Route path="/home" element={
            <Suspense fallback={<FastLoader message="Loading practices for happiness..." />}>
              <HomeDashboard 
                onStartPractice={handleNavigateStage1}
                onStartStage2={() => navigate('/stage2')}
                onStartStage3={() => navigate('/stage3')}
                onStartStage4={() => navigate('/stage4')}
                onStartStage5={() => navigate('/stage5')}
                onStartStage6={() => navigate('/stage6')}
                onViewProgress={() => navigate('/analytics')}
                onViewLearning={() => navigate('/learning/pahm')}
                onShowPostureGuide={() => navigate('/posture-guide')}
                onShowPAHMExplanation={() => navigate('/learning/pahm')}
                onShowWhatIsPAHM={() => navigate('/learning/pahm')}
                onLogout={() => navigate('/')}
              />
            </Suspense>
          } />
          
          <Route path="/happiness-tracker" element={
            <Suspense fallback={<FastLoader message="Calculating your happiness levels..." />}>
              <HappinessTrackerPage />
            </Suspense>
          } />
          
          <Route path="/happiness-test" element={
            <Suspense fallback={<FastLoader message="Calculating your happiness levels..." />}>
              <HappinessTrackerPage />
            </Suspense>
          } />
          
          <Route path="/analytics" element={
            <Suspense fallback={<FastLoader message="Loading your progress insights..." />}>
              <AnalyticsBoardWrapper />
            </Suspense>
          } />
          
          <Route path="/notes" element={
            <Suspense fallback={<FastLoader message="Loading your practice notes..." />}>
              <DailyEmotionalNotesWrapper />
            </Suspense>
          } />
          
          <Route path="/chatwithguru" element={
            <Suspense fallback={<FastLoader message="Connecting with your AI teacher..." />}>
              <ChatInterface />
            </Suspense>
          } />
          
          <Route path="/stage1" element={
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
          
          <Route path="/mind-recovery" element={
            <Suspense fallback={<FastLoader message="Preparing mind recovery practice..." />}>
              <MindRecoverySelectionWrapper />
            </Suspense>
          } />
          
          <Route path="/learning/pahm" element={
            <Suspense fallback={<FastLoader message="Loading PAHM wisdom..." />}>
              <WhatIsPAHMWrapper />
            </Suspense>
          } />
          
          <Route path="/posture-guide" element={
            <Suspense fallback={<FastLoader message="Loading optimal posture guide..." />}>
              <PostureGuide onContinue={() => navigate('/home')} />
            </Suspense>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
});

// ✅ BULLETPROOF: Completion status checker that can't get stuck
const useCompletionStatus = (currentUser: any) => {
  const [completionStatus, setCompletionStatus] = useState({
    questionnaire: false,
    selfAssessment: false,
    isLoaded: true, // ✅ CRITICAL FIX: Start as loaded
    hasChecked: true // ✅ CRITICAL FIX: Start as checked
  });

  // ✅ SAFE: Try to get LocalData context, but don't fail if it doesn't work
  let localDataContext: any = null;
  try {
    localDataContext = useLocalData();
  } catch (error) {
    console.log('🔧 LocalData context not available, using fallback');
  }

  const checkCompletionStatus = useCallback(() => {
    if (!currentUser) {
      setCompletionStatus({
        questionnaire: false,
        selfAssessment: false,
        isLoaded: true,
        hasChecked: true
      });
      return;
    }

    try {
      let questComplete = false;
      let selfComplete = false;

      // ✅ TRY: Use LocalData methods if available
      if (localDataContext && localDataContext.isQuestionnaireCompleted) {
        questComplete = localDataContext.isQuestionnaireCompleted();
        selfComplete = localDataContext.isSelfAssessmentCompleted();
      }

      // ✅ FALLBACK: Check localStorage directly
      if (!questComplete) {
        questComplete = localStorage.getItem('questionnaire_completed') === 'true';
      }
      if (!selfComplete) {
        selfComplete = localStorage.getItem('self_assessment_completed') === 'true';
      }

      setCompletionStatus({
        questionnaire: questComplete,
        selfAssessment: selfComplete,
        isLoaded: true,
        hasChecked: true
      });

    } catch (error) {
      console.error('❌ Error in completion check, using defaults:', error);
      setCompletionStatus({
        questionnaire: false,
        selfAssessment: false,
        isLoaded: true,
        hasChecked: true
      });
    }
  }, [currentUser, localDataContext]);

  useEffect(() => {
    // ✅ IMMEDIATE: Check completion status immediately
    checkCompletionStatus();
    
    // ✅ FORCE: Re-check after 1 second to ensure it's set
    const forceCheck = setTimeout(() => {
      checkCompletionStatus();
    }, 1000);

    return () => clearTimeout(forceCheck);
  }, [checkCompletionStatus]);

  return { completionStatus, recheckStatus: checkCompletionStatus };
};

// ✅ COMPLETE: Main app content with all your original functionality
const AppContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  
  // ✅ SAFE: Get auth context with error handling
  let authContext: any = {
    currentUser: null,
    isLoading: false,
    signIn: async () => {},
    signUp: async () => {},
    logout: async () => {},
    updateUserProfile: async () => {}
  };

  try {
    authContext = useAuth();
  } catch (error) {
    console.log('🔧 Auth context not available, using fallback');
  }

  const { 
    signIn, 
    signUp, 
    logout,
    currentUser, 
    updateUserProfile,
    isLoading 
  } = authContext;
  
  // ✅ SAFE: Get LocalData context with error handling
  let localDataContext: any = {
    markQuestionnaireComplete: async () => {},
    markSelfAssessmentComplete: async () => {}
  };

  try {
    localDataContext = useLocalData();
  } catch (error) {
    console.log('🔧 LocalData context not available, using fallback');
  }

  const {
    markQuestionnaireComplete,
    markSelfAssessmentComplete
  } = localDataContext;

  // ✅ FIXED: Use completion status checker
  const { completionStatus, recheckStatus } = useCompletionStatus(currentUser);
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true); // ✅ FIX: Start as ready
  const [appReady, setAppReady] = useState(false);

  // ✅ COMPUTED VALUES
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  const isAdminUser = useMemo(() => currentUser?.email === 'asiriamarasinghe35@gmail.com', [currentUser?.email]);

  // ✅ NAVIGATION COMPONENTS
  const NavigateToHome = useMemo(() => <Navigate to="/home" replace />, []);
  const NavigateToQuestionnaire = useMemo(() => <Navigate to="/questionnaire" replace />, []);
  const NavigateToIntroduction = useMemo(() => <Navigate to="/introduction" replace />, []);

  // ✅ FORCE APP READY: Don't wait longer than 1 second
  useEffect(() => {
    const forceReady = setTimeout(() => {
      setAppReady(true);
      console.log('✅ App forced ready');
    }, 1000);

    return () => clearTimeout(forceReady);
  }, []);

  // ✅ KNOWLEDGE BASE
  useEffect(() => {
    const initializeKnowledgeBase = () => {
      const bookContent = localStorage.getItem('roa_book_content');
      setKnowledgeBaseReady(true); // Always set as ready
    };
    initializeKnowledgeBase();
  }, []);

  // ✅ ALL YOUR ORIGINAL EVENT HANDLERS
  const handleStartPracticeWrapper = useCallback(() => {
    if (!completionStatus.selfAssessment) {
      alert('Please complete your self-assessment first before starting practice sessions.');
      navigate('/self-assessment');
      return;
    }
    navigate('/stage1');
  }, [completionStatus.selfAssessment, navigate]);

  const handleViewProgress = useCallback(() => navigate('/analytics'), [navigate]);
  const handleViewLearning = useCallback(() => navigate('/learning/pahm'), [navigate]);
  const handleShowPostureGuide = useCallback(() => navigate("/posture-guide"), [navigate]);
  const handleShowPAHMExplanation = useCallback(() => navigate('/learning/pahm'), [navigate]);
  const handleShowWhatIsPAHM = useCallback(() => navigate('/learning/pahm'), [navigate]);
  const handleStartStage2 = useCallback(() => navigate('/stage2'), [navigate]);
  const handleStartStage3 = useCallback(() => navigate('/stage3'), [navigate]);
  const handleStartStage4 = useCallback(() => navigate('/stage4'), [navigate]);
  const handleStartStage5 = useCallback(() => navigate('/stage5'), [navigate]);
  const handleStartStage6 = useCallback(() => navigate('/stage6'), [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      navigate('/');
    }
  }, [logout, navigate]);

  const handleSignUp = useCallback(async (email: string, password: string, name: string, rememberMe: boolean = false) => {
    try {
      await signUp(email, password, name);
      navigate('/questionnaire');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already registered. Please sign in instead.');
        navigate('/signin');
      } else {
        alert(`Signup failed: ${error.message || 'Unknown error'}`);
      }
    }
  }, [signUp, navigate]);

  const handleSignIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      await signIn(email, password);
      setTimeout(async () => {
        await recheckStatus();
      }, 500);
    } catch (error: any) {
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  }, [signIn, recheckStatus]);

  const handleQuestionnaireComplete = useCallback(async (answers: any) => {
    try {
      await markQuestionnaireComplete(answers);
      await recheckStatus();
      
      setTimeout(() => {
        navigate('/introduction');
      }, 100);
    } catch (error) {
      navigate('/introduction');
    }
  }, [markQuestionnaireComplete, recheckStatus, navigate]);

  const handleSelfAssessmentComplete = useCallback(async (data?: any) => {
    try {
      await markSelfAssessmentComplete(data);
      
      try {
        await updateUserProfile({ 
          currentStage: '1'
        });
      } catch (profileError) {
        // Silently handle profile update errors
      }
      
      await recheckStatus();
      
      setTimeout(() => {
        navigate('/self-assessment-completion');
      }, 200);
    } catch (error) {
      alert('Failed to complete self-assessment. Please try again.');
    }
  }, [markSelfAssessmentComplete, updateUserProfile, recheckStatus, navigate]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      alert('Google Sign In not fully implemented yet - please use regular sign in');
    } catch (error: any) {
      alert(`Google sign-in failed: ${error.message || 'Unknown error'}`);
    }
  }, []);

  const handleGoogleSignUp = useCallback(async (googleUser: any) => {
    try {
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
        navigate('/questionnaire');
      }
    } catch (error: any) {
      alert(`Google sign-up failed: ${error.message || 'Unknown error'}`);
    }
  }, [navigate]);

  const handleForgotPassword = useCallback(() => {
    alert('Forgot password functionality not implemented yet');
  }, []);

  const handleIntroductionComplete = useCallback(() => {
    navigate('/self-assessment');
  }, [navigate]);

  const handleIntroductionSkip = useCallback(() => {
    navigate('/self-assessment');
  }, [navigate]);

  const handleSelfAssessmentBack = useCallback(() => {
    navigate('/introduction');
  }, [navigate]);

  const handleSelfAssessmentCompletionGetStarted = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  const handleSelfAssessmentCompletionBack = useCallback(() => {
    navigate('/self-assessment');
  }, [navigate]);

  const handleNavigateToSignUp = useCallback(() => navigate('/signup'), [navigate]);
  const handleNavigateToSignIn = useCallback(() => navigate('/signin'), [navigate]);

  // ✅ ADMIN BYPASS
  if (isAdminUser) {
    return <AdminBypassApp />;
  }

  // ✅ CRITICAL FIX: Only show loading if actually loading AND not ready yet
  if ((isLoading || !appReady) && !currentUser) {
    return <FastLoader message="Initializing practices for the happiness that stays..." />;
  }

  // ✅ UNAUTHENTICATED ROUTES: Complete original functionality
  if (!isAuthenticated) {
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
              onSignIn={handleSignIn}
              onGoogleSignIn={handleGoogleSignIn}
              onSignUp={handleNavigateToSignUp}
              onForgotPassword={handleForgotPassword}
            />
          } />
          <Route path="/signup" element={
            <SignUp 
              onSignUp={handleSignUp}
              onGoogleSignUp={handleGoogleSignUp}
              onSignIn={handleNavigateToSignIn}
            />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // ✅ AUTHENTICATED ROUTES: Complete original functionality
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ SMART ROOT ROUTE */}
        <Route path="/" element={
          (() => {
            if (completionStatus.questionnaire && completionStatus.selfAssessment) {
              return NavigateToHome;
            } else if (!completionStatus.questionnaire) {
              return NavigateToQuestionnaire;
            } else {
              return NavigateToIntroduction;
            }
          })()
        } />
        
        {/* ✅ ALL YOUR ORIGINAL ROUTES */}
        <Route path="/questionnaire" element={
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        } />
        
        <Route path="/introduction" element={
          !completionStatus.questionnaire ? 
            NavigateToQuestionnaire :
            <Introduction 
              onComplete={handleIntroductionComplete}
              onSkip={handleIntroductionSkip}
            />
        } />
        
        <Route path="/self-assessment" element={
          !completionStatus.questionnaire ? 
            NavigateToQuestionnaire :
            <SelfAssessment 
              onComplete={handleSelfAssessmentComplete}
              onBack={handleSelfAssessmentBack}
            />
        } />
        
        <Route path="/self-assessment-completion" element={
          <SelfAssessmentCompletion 
            onGetStarted={handleSelfAssessmentCompletionGetStarted}
            onBack={handleSelfAssessmentCompletionBack}
          />
        } />
        
        <Route path="/home" element={
          <Suspense fallback={<FastLoader message="Loading practices for happiness..." />}>
            <MainNavigation>
              <HomeDashboard 
                onStartPractice={handleStartPracticeWrapper}
                onStartStage2={handleStartStage2}
                onStartStage3={handleStartStage3}
                onStartStage4={handleStartStage4}
                onStartStage5={handleStartStage5}
                onStartStage6={handleStartStage6}
                onViewProgress={handleViewProgress}
                onViewLearning={handleViewLearning}
                onShowPostureGuide={handleShowPostureGuide}
                onShowPAHMExplanation={handleShowPAHMExplanation}
                onShowWhatIsPAHM={handleShowWhatIsPAHM}
                onLogout={handleLogout}
              />
            </MainNavigation>
          </Suspense>
        } />
        
        {/* ✅ ALL OTHER ROUTES - Complete original functionality */}
        <Route path="/*" element={
          <Suspense fallback={<FastLoader message="Loading your practice space..." />}>
            <MainNavigation>
              <Routes>
                <Route path="/stage1" element={
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
                <Route path="/seeker-practice-timer" element={
                  <Suspense fallback={<FastLoader message="Starting your practice session..." />}>
                    <SeekerPracticeTimerWrapper />
                  </Suspense>
                } />
                <Route path="/seeker-practice-complete" element={
                  <Suspense fallback={<FastLoader message="Celebrating your progress..." />}>
                    <SeekerPracticeCompleteWrapper />
                  </Suspense>
                } />
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
                <Route path="/profile" element={
                  <Suspense fallback={<FastLoader message="Loading your practice profile..." />}>
                    <UserProfile onBack={() => navigate('/home')} onLogout={handleLogout} />
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
    </div>
  );
});

// ✅ MAIN App component with your complete original functionality
const App: React.FC = React.memo(() => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <LocalDataProvider>
            <AppContent />
          </LocalDataProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
});

export default App;