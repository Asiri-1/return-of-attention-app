import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// ✅ ESSENTIAL: All imports at the top
import PageViewTracker from './components/PageViewTracker';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext';
import AdminPanel from './components/AdminPanel';
import LogoutWarning from './components/LogoutWarning';

// ✅ FIXED: Import LocalDataProvider and useLocalData
import { LocalDataProvider, useLocalData } from './contexts/LocalDataContext';

// ✅ CRITICAL COMPONENTS: Import normally to avoid chunk loading errors
import SignIn from './SignIn';
import SignUp from './SignUp';
import Introduction from './Introduction';
import Questionnaire from './Questionnaire';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';

// ✅ FIXED: Import PublicLandingHero directly to prevent ChunkLoadError
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

// Public landing pages (only AboutMethod and FAQ are lazy loaded)
const AboutMethod = lazy(() => import('./components/AboutMethod'));
const PublicFAQ = lazy(() => import('./components/PublicFAQ'));

// Other components
const PostureGuide = lazy(() => import('./PostureGuide'));
const UserProfile = lazy(() => import('./UserProfile'));
const HappinessTrackerPage = lazy(() => import('./components/HappinessTrackerPage'));

// ✅ UPDATED FastLoader component with better messages
const FastLoader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
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
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  </div>
);

// ✅ ADMIN BYPASS COMPONENT: Updated with better messages
const AdminBypassApp: React.FC = () => {
  const navigate = useNavigate();
  
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
          <button 
            onClick={() => navigate('/home')} 
            style={{ 
              padding: '15px 25px', 
              fontSize: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            🏠 Go to Dashboard
          </button>
          
          <button 
            onClick={() => navigate('/happiness-tracker')} 
            style={{ 
              padding: '15px 25px', 
              fontSize: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            😊 Happiness Tracker
          </button>
          
          <button 
            onClick={() => navigate('/analytics')} 
            style={{ 
              padding: '15px 25px', 
              fontSize: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            📊 Analytics
          </button>
          
          <button 
            onClick={() => navigate('/notes')} 
            style={{ 
              padding: '15px 25px', 
              fontSize: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            📝 Notes
          </button>
          
          <button 
            onClick={() => navigate('/chatwithguru')} 
            style={{ 
              padding: '15px 25px', 
              fontSize: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            🧘 Chat with Guru
          </button>
          
          <button 
            onClick={() => navigate('/stage1')} 
            style={{ 
              padding: '15px 25px', 
              fontSize: '16px', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid white',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          >
            🎯 Practice Stage 1
          </button>
        </div>
        
        <Routes>
          {/* All your normal routes but accessible without Firebase auth */}
          <Route path="/home" element={
            <Suspense fallback={<FastLoader message="Loading practices for happiness..." />}>
              <HomeDashboard 
                onStartPractice={() => navigate('/stage1')}
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
};

// ✅ COMPLETELY REWRITTEN: Simple and robust completion status checker
const useCompletionStatus = (currentUser: any) => {
  const { comprehensiveUserData, userData, isLoading: localDataLoading } = useLocalData();
  const [completionStatus, setCompletionStatus] = useState({
    questionnaire: false,
    selfAssessment: false,
    isLoaded: false,
    hasChecked: false
  });
  const [forceComplete, setForceComplete] = useState(false);

  // ✅ SIMPLE: Direct completion check without complex logic
  const checkCompletionStatus = useCallback(async () => {
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
      const userId = currentUser.uid;
      let questComplete = false;
      let selfComplete = false;

      console.log('🔍 SIMPLE Completion Check for:', userId);

      // ✅ METHOD 1: Check LocalDataContext first
      const data = comprehensiveUserData || userData;
      if (data && data.questionnaire && data.questionnaire.completed) {
        questComplete = true;
        console.log('✅ Questionnaire completed via LocalDataContext');
      }
      if (data && data.selfAssessment && data.selfAssessment.completed) {
        selfComplete = true;
        console.log('✅ Self-assessment completed via LocalDataContext');
      }

      // ✅ METHOD 2: Check localStorage directly
      if (!questComplete || !selfComplete) {
        const storageKey = `comprehensiveUserData_${userId}`;
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            if (!questComplete && parsedData.questionnaire && parsedData.questionnaire.completed) {
              questComplete = true;
              console.log('✅ Questionnaire completed via localStorage');
            }
            if (!selfComplete && parsedData.selfAssessment && parsedData.selfAssessment.completed) {
              selfComplete = true;
              console.log('✅ Self-assessment completed via localStorage');
            }
          } catch (error) {
            console.warn('Error parsing localStorage data:', error);
          }
        }
      }

      console.log('🎯 Final Completion Status:', { questComplete, selfComplete });

      setCompletionStatus({
        questionnaire: questComplete,
        selfAssessment: selfComplete,
        isLoaded: true,
        hasChecked: true
      });

      // ✅ FORCE: If both completed but we're stuck, set force flag
      if (questComplete && selfComplete && !forceComplete) {
        console.log('🚀 Both assessments completed - setting force flag');
        setForceComplete(true);
        
        // Force navigation after small delay
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (currentPath === '/questionnaire' || currentPath === '/introduction' || currentPath === '/self-assessment') {
            console.log('🚀 Force navigating to /home');
            window.location.href = '/home';
          }
        }, 1000);
      }

    } catch (error) {
      console.error('Error in completion check:', error);
      setCompletionStatus({
        questionnaire: false,
        selfAssessment: false,
        isLoaded: true,
        hasChecked: true
      });
    }
  }, [currentUser, comprehensiveUserData, userData, forceComplete]);

  // ✅ TRIGGER: Check completion when dependencies change
  useEffect(() => {
    if (!localDataLoading) {
      const timer = setTimeout(checkCompletionStatus, 100);
      return () => clearTimeout(timer);
    }
  }, [checkCompletionStatus, localDataLoading]);

  // ✅ OVERRIDE: If force flag is set, return completed status
  const finalStatus = forceComplete ? {
    questionnaire: true,
    selfAssessment: true,
    isLoaded: true,
    hasChecked: true
  } : completionStatus;

  return { completionStatus: finalStatus, recheckStatus: checkCompletionStatus };
};

// ✅ MAIN APP CONTENT: Simplified with better error handling
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  
  // ✅ FIXED: Split auth and data contexts
  const { 
    signIn, 
    signUp, 
    logout,
    currentUser, 
    userProfile,
    updateUserProfile,
    isLoading 
  } = useAuth();
  
  // ✅ NEW: Use LocalDataContext for all data operations
  const {
    markQuestionnaireComplete,
    markSelfAssessmentComplete
  } = useLocalData();

  // ✅ FIXED: Use simple completion status checker
  const { completionStatus, recheckStatus } = useCompletionStatus(currentUser);
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(false);
  const [loadingStartTime] = useState(Date.now());
  const [hasTriedForceNavigation, setHasTriedForceNavigation] = useState(false);

  // Helper to check if user is authenticated
  const isAuthenticated = !!currentUser;

  // ✅ CRITICAL: Admin bypass check (but hooks must come first!)
  const isAdminUser = currentUser?.email === 'asiriamarasinghe35@gmail.com';

  // ✅ Knowledge base initialization
  useEffect(() => {
    const initializeKnowledgeBase = () => {
      const bookContent = localStorage.getItem('roa_book_content');
      if (!bookContent) {
        try {
          setKnowledgeBaseReady(true);
        } catch (error) {
          setKnowledgeBaseReady(false);
        }
      } else {
        setKnowledgeBaseReady(true);
      }
    };
    initializeKnowledgeBase();
  }, []);

  // ✅ FORCE NAVIGATION: If both completed but stuck in loading
  useEffect(() => {
    if (completionStatus.questionnaire && 
        completionStatus.selfAssessment && 
        completionStatus.isLoaded && 
        !hasTriedForceNavigation &&
        isAuthenticated) {
      
      const currentPath = window.location.pathname;
      console.log('🚀 Both assessments completed, current path:', currentPath);
      
      if (currentPath === '/' || currentPath === '/questionnaire' || currentPath === '/introduction' || currentPath === '/self-assessment') {
        console.log('🚀 Force navigating to /home due to completion');
        setHasTriedForceNavigation(true);
        setTimeout(() => {
          navigate('/home');
        }, 500);
      }
    }
  }, [completionStatus, isAuthenticated, navigate, hasTriedForceNavigation]);

  // ✅ ADMIN BYPASS: After all hooks are called
  if (isAdminUser) {
    return <AdminBypassApp />;
  }

  // ✅ ALL YOUR EVENT HANDLERS (updated to use LocalDataContext)
  const handleStartPracticeWrapper = () => {
    if (!completionStatus.selfAssessment) {
      alert('Please complete your self-assessment first before starting practice sessions.');
      navigate('/self-assessment');
      return;
    }
    navigate('/stage1');
  };

  const handleViewProgress = () => navigate('/analytics');
  const handleViewLearning = () => navigate('/learning/pahm');
  const handleShowPostureGuide = () => navigate("/posture-guide");
  const handleShowPAHMExplanation = () => navigate('/learning/pahm');
  const handleShowWhatIsPAHM = () => navigate('/learning/pahm');
  const handleStartStage2 = () => navigate('/stage2');
  const handleStartStage3 = () => navigate('/stage3');
  const handleStartStage4 = () => navigate('/stage4');
  const handleStartStage5 = () => navigate('/stage5');
  const handleStartStage6 = () => navigate('/stage6');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      navigate('/');
    }
  };

  const handleSignUp = async (email: string, password: string, name: string, rememberMe: boolean = false) => {
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
  };

  const handleSignIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      await signIn(email, password);
      // ✅ FIXED: After sign in, recheck completion status, then navigate
      setTimeout(async () => {
        await recheckStatus();
        console.log('🔄 Sign in successful, completion status rechecked');
      }, 500);
    } catch (error: any) {
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  };

  // ✅ FIXED: Use LocalDataContext for questionnaire completion with proper data flow
  const handleQuestionnaireComplete = async (answers: any) => {
    try {
      console.log('🎯 App.tsx: Handling questionnaire completion with answers:', answers);
      
      // ✅ FIXED: Pass raw answers to LocalDataContext, which will properly structure them
      await markQuestionnaireComplete(answers);
      
      // Force recheck completion status
      await recheckStatus();
      
      setTimeout(() => {
        navigate('/introduction');
      }, 100);
    } catch (error) {
      console.error('❌ App.tsx: Failed to complete questionnaire:', error);
      // Still navigate even if there's an error
      navigate('/introduction');
    }
  };

  // ✅ FIXED: Use LocalDataContext for self-assessment completion with proper data flow
  const handleSelfAssessmentComplete = async (data?: any) => {
    try {
      console.log('🎯 App.tsx: Handling self-assessment completion with data:', data);
      
      // ✅ FIXED: Pass data to LocalDataContext, which will properly structure it
      await markSelfAssessmentComplete(data);
      
      // ✅ FIXED: Update user profile
      try {
        await updateUserProfile({ 
          currentStage: '1'
        });
      } catch (profileError) {
        console.warn('Could not update profile:', profileError);
      }
      
      // Force recheck completion status
      await recheckStatus();
      
      setTimeout(() => {
        navigate('/self-assessment-completion');
      }, 200);
    } catch (error) {
      console.error('❌ App.tsx: Failed to complete self-assessment:', error);
      alert('Failed to complete self-assessment. Please try again.');
    }
  };

  // ✅ FIXED GOOGLE HANDLERS to match SignIn interface
  const handleGoogleSignIn = async () => {
    try {
      console.log('Google Sign In clicked');
      alert('Google Sign In not fully implemented yet - please use regular sign in');
    } catch (error: any) {
      alert(`Google sign-in failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleGoogleSignUp = async (googleUser: any) => {
    try {
      console.log('Google Sign Up:', googleUser);
      
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
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality not implemented yet');
  };

  const handleIntroductionComplete = () => {
    navigate('/self-assessment');
  };

  const handleIntroductionSkip = () => {
    navigate('/self-assessment');
  };

  const handleSelfAssessmentBack = () => {
    navigate('/introduction');
  };

  const handleSelfAssessmentCompletionGetStarted = () => {
    navigate('/home');
  };

  const handleSelfAssessmentCompletionBack = () => {
    navigate('/self-assessment');
  };

  // ✅ SIMPLIFIED: Loading state with aggressive timeout
  if (isLoading || !completionStatus.isLoaded || !completionStatus.hasChecked) {
    const loadingTime = Date.now() - loadingStartTime;
    
    console.log('🔄 App in loading state:', {
      authLoading: isLoading,
      completionLoaded: completionStatus.isLoaded,
      completionChecked: completionStatus.hasChecked,
      questionnaire: completionStatus.questionnaire,
      selfAssessment: completionStatus.selfAssessment,
      loadingTimeMs: loadingTime
    });
    
    // ✅ AGGRESSIVE TIMEOUT: Force navigation if stuck
    if (loadingTime > 3000) {
      console.log('🚀 Loading timeout - forcing app to continue');
      if (currentUser && completionStatus.questionnaire && completionStatus.selfAssessment) {
        setTimeout(() => {
          window.location.href = '/home';
        }, 100);
      } else if (currentUser) {
        setTimeout(() => {
          window.location.href = '/questionnaire';
        }, 100);
      }
    }
    
    return <FastLoader message="Initializing practices for the happiness that stays..." />;
  }

  // ✅ UNAUTHENTICATED ROUTES: Public landing pages and auth
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
              onSignUp={() => navigate('/signup')}
              onForgotPassword={handleForgotPassword}
            />
          } />
          <Route path="/signup" element={
            <SignUp 
              onSignUp={handleSignUp}
              onGoogleSignUp={handleGoogleSignUp}
              onSignIn={() => navigate('/signin')}
            />
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // ✅ AUTHENTICATED ROUTES: Simplified route guards with better logic
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ SMART ROOT ROUTE: Direct navigation logic */}
        <Route path="/" element={
          (() => {
            console.log('🔍 ROOT ROUTE - Status:', {
              quest: completionStatus.questionnaire,
              self: completionStatus.selfAssessment
            });
            
            if (completionStatus.questionnaire && completionStatus.selfAssessment) {
              return <Navigate to="/home" replace />;
            } else if (!completionStatus.questionnaire) {
              return <Navigate to="/questionnaire" replace />;
            } else {
              return <Navigate to="/introduction" replace />;
            }
          })()
        } />
        
        {/* ✅ QUESTIONNAIRE ROUTE: Allow access if not completed */}
        <Route path="/questionnaire" element={
          completionStatus.questionnaire && completionStatus.selfAssessment ? 
            <Navigate to="/home" replace /> : 
            <Questionnaire onComplete={handleQuestionnaireComplete} />
        } />
        
        {/* ✅ INTRODUCTION ROUTE: Simple guard */}
        <Route path="/introduction" element={
          !completionStatus.questionnaire ? 
            <Navigate to="/questionnaire" replace /> :
            completionStatus.questionnaire && completionStatus.selfAssessment ?
              <Navigate to="/home" replace /> :
              <Introduction 
                onComplete={handleIntroductionComplete}
                onSkip={handleIntroductionSkip}
              />
        } />
        
        {/* ✅ SELF ASSESSMENT ROUTE: Simple guard */}
        <Route path="/self-assessment" element={
          !completionStatus.questionnaire ? 
            <Navigate to="/questionnaire" replace /> :
            completionStatus.questionnaire && completionStatus.selfAssessment ?
              <Navigate to="/home" replace /> :
              <SelfAssessment 
                onComplete={handleSelfAssessmentComplete}
                onBack={handleSelfAssessmentBack}
              />
        } />
        
        {/* ✅ COMPLETION ROUTE: Simple guard */}
        <Route path="/self-assessment-completion" element={
          (!completionStatus.questionnaire || !completionStatus.selfAssessment) ? 
            <Navigate to="/questionnaire" replace /> :
            <SelfAssessmentCompletion 
              onGetStarted={handleSelfAssessmentCompletionGetStarted}
              onBack={handleSelfAssessmentCompletionBack}
            />
        } />
        
        {/* ✅ HOME ROUTE: Main dashboard */}
        <Route path="/home" element={
          (!completionStatus.questionnaire || !completionStatus.selfAssessment) ? 
            <Navigate to="/questionnaire" replace /> :
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
        
        {/* ✅ ALL OTHER AUTHENTICATED ROUTES */}
        <Route path="/*" element={
          (!completionStatus.questionnaire || !completionStatus.selfAssessment) ? 
            <Navigate to="/questionnaire" replace /> :
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
                  
                  {/* ✅ HAPPINESS ROUTES */}
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
};

// ✅ SIMPLIFIED: LocalDataProvider wrapper
const AppWithData: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LocalDataProvider>
      {children}
    </LocalDataProvider>
  );
};

// ✅ MAIN App component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <AppWithData>
            <AppContent />
          </AppWithData>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;