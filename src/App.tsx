import React, { useState, useEffect, Suspense, lazy } from 'react';
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
              <Stage6Wrapper />
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

// ✅ MAIN APP CONTENT: Updated to use LocalDataContext for data operations
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
    markSelfAssessmentComplete,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted
  } = useLocalData();
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(false);

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

  // ✅ ADMIN BYPASS: After all hooks are called
  if (isAdminUser) {
    return <AdminBypassApp />;
  }

  // ✅ ALL YOUR EVENT HANDLERS (updated to use LocalDataContext)
  const handleStartPracticeWrapper = () => {
    if (!isSelfAssessmentCompleted()) {
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
      // ✅ FIXED: Proper redirect after sign in based on completion status
      setTimeout(() => {
        const questComplete = isQuestionnaireCompleted();
        const selfComplete = isSelfAssessmentCompleted();
        
        if (!questComplete) {
          navigate('/questionnaire');
        } else if (!selfComplete) {
          navigate('/introduction');
        } else {
          navigate('/home');
        }
      }, 500); // Small delay to ensure state is updated
    } catch (error: any) {
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  };

  // ✅ FIXED: Use LocalDataContext for questionnaire completion
  const handleQuestionnaireComplete = async (answers: any) => {
    try {
      await markQuestionnaireComplete(answers);
      setTimeout(() => {
        navigate('/introduction');
      }, 100);
    } catch (error) {
      // Silent error handling
    }
  };

  // ✅ FIXED: Use LocalDataContext for self-assessment completion with safe property update
  const handleSelfAssessmentComplete = async (data?: any) => {
    try {
      await markSelfAssessmentComplete(data);
      
      // ✅ FIXED: Safe property update - check if currentStage is available
      try {
        await updateUserProfile({ 
          currentStage: '1'
        });
      } catch (profileError) {
        console.warn('Could not update currentStage in profile:', profileError);
        // Continue without failing - the important data is saved in LocalDataContext
      }
      
      setTimeout(() => {
        navigate('/self-assessment-completion');
      }, 200);
    } catch (error) {
      alert('Failed to complete self-assessment. Please try again.');
    }
  };

  // ✅ FIXED GOOGLE HANDLERS to match SignIn interface
  const handleGoogleSignIn = async () => {
    try {
      console.log('Google Sign In clicked');
      // For now, just show alert since SignIn expects () => Promise<void>
      alert('Google Sign In not fully implemented yet - please use regular sign in');
    } catch (error: any) {
      alert(`Google sign-in failed: ${error.message || 'Unknown error'}`);
    }
  };

  const handleGoogleSignUp = async (googleUser: any) => {
    try {
      console.log('Google Sign Up:', googleUser);
      
      // Send Google user data to your backend for sign-up
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

  // ✅ UPDATED Loading state with better message
  if (isLoading) {
    return <FastLoader message="Initializing practices for the happiness that stays..." />;
  }

  // ✅ UNAUTHENTICATED ROUTES: Public landing pages and auth
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <PageViewTracker />
        <Routes>
          {/* ✅ FIXED: Public landing page - no Suspense needed, direct import */}
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
          
          {/* ✅ CORRECTED Authentication routes - removed Apple props */}
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
          
          {/* Redirect all other routes to home for unauthenticated users */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // ✅ AUTHENTICATED ROUTES: Full app functionality with INDIVIDUAL ROUTE GUARDS
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* Onboarding flow with all required props */}
        <Route path="/introduction" element={
          <Introduction 
            onComplete={handleIntroductionComplete}
            onSkip={handleIntroductionSkip}
          />
        } />
        <Route path="/questionnaire" element={
          <Questionnaire onComplete={handleQuestionnaireComplete} />
        } />
        <Route path="/self-assessment" element={
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
        
        {/* ✅ FIXED: Individual route guards instead of global redirect */}
        <Route path="/" element={
          (() => {
            const questComplete = isQuestionnaireCompleted();
            const selfComplete = isSelfAssessmentCompleted();
            
            if (!questComplete) {
              return <Navigate to="/questionnaire" replace />;
            } else if (!selfComplete) {
              return <Navigate to="/introduction" replace />;
            } else {
              return <Navigate to="/home" replace />;
            }
          })()
        } />
        
        {/* Main app routes with individual guards */}
        <Route 
          path="/home" 
          element={
            (() => {
              const questComplete = isQuestionnaireCompleted();
              const selfComplete = isSelfAssessmentCompleted();
              
              if (!questComplete) {
                return <Navigate to="/questionnaire" replace />;
              } else if (!selfComplete) {
                return <Navigate to="/introduction" replace />;
              } else {
                return (
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
                );
              }
            })()
          } 
        />
        
        {/* All other authenticated routes with guards */}
        <Route 
          path="/*" 
          element={
            (() => {
              const questComplete = isQuestionnaireCompleted();
              const selfComplete = isSelfAssessmentCompleted();
              
              if (!questComplete) {
                return <Navigate to="/questionnaire" replace />;
              } else if (!selfComplete) {
                return <Navigate to="/introduction" replace />;
              } else {
                return (
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
                );
              }
            })()
          }
        />
      </Routes>
    </div>
  );
};

// ✅ SIMPLIFIED: LocalDataProvider wrapper (no lazy loading for context providers)
const AppWithData: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LocalDataProvider>
      {children}
    </LocalDataProvider>
  );
};

// ✅ MAIN App component (fixed import structure)
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