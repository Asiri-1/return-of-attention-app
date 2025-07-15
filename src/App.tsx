import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// ✅ ESSENTIAL: All imports at the top
import PageViewTracker from './components/PageViewTracker';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext';
import AdminPanel from './components/AdminPanel';
import LogoutWarning from './components/LogoutWarning';

// ✅ FIXED: Import LocalDataProvider directly
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

// ✅ OPTIMIZED: FastLoader with better performance
const FastLoader: React.FC<{ message?: string }> = React.memo(({ message = "Loading..." }) => {
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

// ✅ OPTIMIZED: AdminBypassApp with better performance
const AdminBypassApp: React.FC = React.memo(() => {
  const navigate = useNavigate();
  
  // ✅ PERFORMANCE: Stable navigation handlers
  const navigationHandlers = useMemo(() => ({
    home: () => navigate('/home'),
    happiness: () => navigate('/happiness-tracker'),
    analytics: () => navigate('/analytics'),
    notes: () => navigate('/notes'),
    chat: () => navigate('/chatwithguru'),
    stage1: () => navigate('/stage1'),
    stage2: () => navigate('/stage2'),
    stage3: () => navigate('/stage3'),
    stage4: () => navigate('/stage4'),
    stage5: () => navigate('/stage5'),
    stage6: () => navigate('/stage6'),
    learning: () => navigate('/learning/pahm'),
    posture: () => navigate('/posture-guide')
  }), [navigate]);

  // ✅ PERFORMANCE: Stable style handlers
  const styleHandlers = useMemo(() => ({
    onMouseOver: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
    },
    onMouseOut: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
    }
  }), []);

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
          <button onClick={navigationHandlers.home} style={buttonStyle} {...styleHandlers}>
            🏠 Go to Dashboard
          </button>
          <button onClick={navigationHandlers.happiness} style={buttonStyle} {...styleHandlers}>
            😊 Happiness Tracker
          </button>
          <button onClick={navigationHandlers.analytics} style={buttonStyle} {...styleHandlers}>
            📊 Analytics
          </button>
          <button onClick={navigationHandlers.notes} style={buttonStyle} {...styleHandlers}>
            📝 Notes
          </button>
          <button onClick={navigationHandlers.chat} style={buttonStyle} {...styleHandlers}>
            🧘 Chat with Guru
          </button>
          <button onClick={navigationHandlers.stage1} style={buttonStyle} {...styleHandlers}>
            🎯 Practice Stage 1
          </button>
        </div>
        
        <Routes>
          <Route path="/home" element={
            <Suspense fallback={<FastLoader message="Loading practices for happiness..." />}>
              <HomeDashboard 
                onStartPractice={navigationHandlers.stage1}
                onStartStage2={navigationHandlers.stage2}
                onStartStage3={navigationHandlers.stage3}
                onStartStage4={navigationHandlers.stage4}
                onStartStage5={navigationHandlers.stage5}
                onStartStage6={navigationHandlers.stage6}
                onViewProgress={navigationHandlers.analytics}
                onViewLearning={navigationHandlers.learning}
                onShowPostureGuide={navigationHandlers.posture}
                onShowPAHMExplanation={navigationHandlers.learning}
                onShowWhatIsPAHM={navigationHandlers.learning}
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
              <PostureGuide onContinue={navigationHandlers.home} />
            </Suspense>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
});

// ✅ FIXED: Simplified completion status checker using LocalDataContext directly
const useCompletionStatus = () => {
  const { isQuestionnaireCompleted, isSelfAssessmentCompleted } = useLocalData();
  const { currentUser } = useAuth();
  
  const [completionStatus, setCompletionStatus] = useState({
    questionnaire: false,
    selfAssessment: false,
    isLoaded: false,
    hasChecked: false
  });

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
      // ✅ FIXED: Use LocalDataContext methods directly (as per audit report)
      const questComplete = isQuestionnaireCompleted();
      const selfComplete = isSelfAssessmentCompleted();

      setCompletionStatus({
        questionnaire: questComplete,
        selfAssessment: selfComplete,
        isLoaded: true,
        hasChecked: true
      });

    } catch (error) {
      console.error('❌ Error checking completion status:', error);
      // ✅ FALLBACK: Check localStorage as backup
      const questComplete = localStorage.getItem('questionnaire_completed') === 'true';
      const selfComplete = localStorage.getItem('self_assessment_completed') === 'true';
      
      setCompletionStatus({
        questionnaire: questComplete,
        selfAssessment: selfComplete,
        isLoaded: true,
        hasChecked: true
      });
    }
  }, [currentUser, isQuestionnaireCompleted, isSelfAssessmentCompleted]);

  useEffect(() => {
    checkCompletionStatus();
  }, [checkCompletionStatus]);

  return { completionStatus, recheckStatus: checkCompletionStatus };
};

// ✅ OPTIMIZED: Main app content with better performance and cleaner logic
const AppContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { currentUser, isLoading, signIn, signUp, logout, updateUserProfile } = useAuth();
  const { markQuestionnaireComplete, markSelfAssessmentComplete } = useLocalData();
  
  // ✅ FIXED: Use simplified completion status checker
  const { completionStatus, recheckStatus } = useCompletionStatus();
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // ✅ PERFORMANCE: Stable computed values
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  const isAdminUser = useMemo(() => currentUser?.email === 'asiriamarasinghe35@gmail.com', [currentUser?.email]);

  // ✅ PERFORMANCE: Stable navigation components
  const navigationComponents = useMemo(() => ({
    home: <Navigate to="/home" replace />,
    questionnaire: <Navigate to="/questionnaire" replace />,
    introduction: <Navigate to="/introduction" replace />
  }), []);

  // ✅ PERFORMANCE: Force app ready quickly
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ PERFORMANCE: Initialize knowledge base
  useEffect(() => {
    setKnowledgeBaseReady(true);
  }, []);

  // ✅ PERFORMANCE: Stable event handlers with proper dependencies
  const handlers = useMemo(() => ({
    // ✅ NAVIGATION HANDLERS
    startPractice: () => {
      if (!completionStatus.selfAssessment) {
        alert('Please complete your self-assessment first before starting practice sessions.');
        navigate('/self-assessment');
        return;
      }
      navigate('/stage1');
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
    
    // ✅ AUTH HANDLERS
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
    },
    
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password);
        // ✅ FIXED: Recheck status after successful login
        setTimeout(() => {
          recheckStatus();
        }, 500);
      } catch (error: any) {
        alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
      }
    },
    
    // ✅ COMPLETION HANDLERS
    questionnaireComplete: async (answers: any) => {
      try {
        await markQuestionnaireComplete(answers);
        await recheckStatus();
        navigate('/introduction');
      } catch (error) {
        console.error('Error completing questionnaire:', error);
        navigate('/introduction');
      }
    },
    
    selfAssessmentComplete: async (data?: any) => {
      try {
        await markSelfAssessmentComplete(data);
        
        // ✅ SAFE: Update user profile without blocking flow
        try {
          await updateUserProfile({ currentStage: '1' });
        } catch (profileError) {
          console.warn('Profile update failed, continuing anyway:', profileError);
        }
        
        await recheckStatus();
        navigate('/self-assessment-completion');
      } catch (error) {
        console.error('Error completing self-assessment:', error);
        alert('Failed to complete self-assessment. Please try again.');
      }
    },
    
    // ✅ OTHER HANDLERS
    googleSignIn: async () => {
      alert('Google Sign In not fully implemented yet - please use regular sign in');
    },
    
    googleSignUp: async (googleUser: any) => {
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
    completionStatus.selfAssessment, 
    navigate, 
    logout, 
    signUp, 
    signIn, 
    markQuestionnaireComplete, 
    markSelfAssessmentComplete, 
    updateUserProfile,
    recheckStatus
  ]);

  // ✅ ADMIN BYPASS
  if (isAdminUser) {
    return <AdminBypassApp />;
  }

  // ✅ OPTIMIZED: Only show loading when necessary
  if (isLoading && !currentUser && !appReady) {
    return <FastLoader message="Initializing practices for the happiness that stays..." />;
  }

  // ✅ UNAUTHENTICATED ROUTES
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

  // ✅ AUTHENTICATED ROUTES
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ SIMPLIFIED ROOT ROUTE LOGIC */}
        <Route path="/" element={
          (() => {
            if (completionStatus.questionnaire && completionStatus.selfAssessment) {
              return navigationComponents.home;
            } else if (!completionStatus.questionnaire) {
              return navigationComponents.questionnaire;
            } else {
              return navigationComponents.introduction;
            }
          })()
        } />
        
        {/* ✅ ONBOARDING ROUTES */}
        <Route path="/questionnaire" element={
          <Questionnaire onComplete={handlers.questionnaireComplete} />
        } />
        
        <Route path="/introduction" element={
          !completionStatus.questionnaire ? 
            navigationComponents.questionnaire :
            <Introduction 
              onComplete={handlers.introductionComplete}
              onSkip={handlers.introductionSkip}
            />
        } />
        
        <Route path="/self-assessment" element={
          !completionStatus.questionnaire ? 
            navigationComponents.questionnaire :
            <SelfAssessment 
              onComplete={handlers.selfAssessmentComplete}
              onBack={handlers.selfAssessmentBack}
            />
        } />
        
        <Route path="/self-assessment-completion" element={
          <SelfAssessmentCompletion 
            onGetStarted={handlers.selfAssessmentCompletionGetStarted}
            onBack={handlers.selfAssessmentCompletionBack}
          />
        } />
        
        {/* ✅ MAIN DASHBOARD */}
        <Route path="/home" element={
          <Suspense fallback={<FastLoader message="Loading practices for happiness..." />}>
            <MainNavigation>
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
            </MainNavigation>
          </Suspense>
        } />
        
        {/* ✅ ALL OTHER ROUTES */}
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
                    <UserProfile onBack={() => navigate('/home')} onLogout={handlers.logout} />
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

// ✅ MAIN App component
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