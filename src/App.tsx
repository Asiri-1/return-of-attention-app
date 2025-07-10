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

// ✅ FIXED: Robust completion status checker
const useCompletionStatus = (currentUser: any) => {
  const { isQuestionnaireCompleted, isSelfAssessmentCompleted } = useLocalData();
  const [completionStatus, setCompletionStatus] = useState({
    questionnaire: false,
    selfAssessment: false,
    isLoaded: false,
    hasChecked: false
  });

  // ✅ ENHANCED: Check completion status with multiple fallbacks
  const checkCompletionStatus = React.useCallback(async () => {
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
      // ✅ WAIT: Small delay to ensure LocalDataContext is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ METHOD 1: Check via LocalDataContext
      let questComplete = false;
      let selfComplete = false;

      try {
        questComplete = isQuestionnaireCompleted();
        selfComplete = isSelfAssessmentCompleted();
      } catch (error) {
        console.warn('LocalDataContext methods failed, using fallback');
      }

      // ✅ METHOD 2: Direct localStorage fallback check
      if (!questComplete || !selfComplete) {
        try {
          const userId = currentUser.uid;

          // Check questionnaire completion (multiple possible keys)
          const questKeys = [
            `questionnaire_${userId}`,
            `questionnaire_completed_${userId}`,
            'questionnaireData'
          ];

          for (const key of questKeys) {
            const questData = localStorage.getItem(key);
            if (questData) {
              try {
                const parsed = JSON.parse(questData);
                if (parsed.completed || parsed.questionnaireCompleted) {
                  questComplete = true;
                  break;
                }
              } catch (e) {
                // If it's not JSON, check if it's just "true"
                if (questData === 'true') {
                  questComplete = true;
                  break;
                }
              }
            }
          }

          // Check self-assessment completion (multiple possible keys)
          const selfKeys = [
            `self_assessment_${userId}`,
            `selfAssessment_${userId}`,
            'selfAssessmentData'
          ];

          for (const key of selfKeys) {
            const selfData = localStorage.getItem(key);
            if (selfData) {
              try {
                const parsed = JSON.parse(selfData);
                if (parsed.completed || parsed.selfAssessmentCompleted) {
                  selfComplete = true;
                  break;
                }
              } catch (e) {
                // If it's not JSON, check if it's just "true"
                if (selfData === 'true') {
                  selfComplete = true;
                  break;
                }
              }
            }
          }

          // ✅ METHOD 3: Check user profile data (from AuthContext)
          if (!selfComplete && currentUser.assessmentCompleted) {
            selfComplete = true;
          }

        } catch (error) {
          console.error('Fallback completion check failed:', error);
        }
      }

      console.log('🔍 FINAL Completion Status Check:', {
        userId: currentUser.uid,
        questComplete,
        selfComplete,
        currentUserAssessmentCompleted: currentUser.assessmentCompleted
      });

      setCompletionStatus({
        questionnaire: questComplete,
        selfAssessment: selfComplete,
        isLoaded: true,
        hasChecked: true
      });

    } catch (error) {
      console.error('Error checking completion status:', error);
      setCompletionStatus({
        questionnaire: false,
        selfAssessment: false,
        isLoaded: true,
        hasChecked: true
      });
    }
  }, [currentUser, isQuestionnaireCompleted, isSelfAssessmentCompleted]);

  // ✅ CHECK: Run completion check when user changes
  useEffect(() => {
    checkCompletionStatus();
  }, [checkCompletionStatus]);

  return { completionStatus, recheckStatus: checkCompletionStatus };
};

// ✅ MAIN APP CONTENT: Updated to use robust completion checking
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

  // ✅ FIXED: Use robust completion status checker
  const { completionStatus, recheckStatus } = useCompletionStatus(currentUser);
  
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

  // ✅ FIXED: Use LocalDataContext for questionnaire completion
  const handleQuestionnaireComplete = async (answers: any) => {
    try {
      await markQuestionnaireComplete(answers);
      // Force recheck completion status
      await recheckStatus();
      setTimeout(() => {
        navigate('/introduction');
      }, 100);
    } catch (error) {
      console.error('Failed to complete questionnaire:', error);
    }
  };

  // ✅ FIXED: Use LocalDataContext for self-assessment completion
  const handleSelfAssessmentComplete = async (data?: any) => {
    try {
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

  // ✅ UPDATED Loading state with better message
  if (isLoading || !completionStatus.isLoaded || !completionStatus.hasChecked) {
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

  // ✅ AUTHENTICATED ROUTES: Full app functionality with ROBUST ROUTE GUARDS
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
        
        {/* ✅ FIXED: Root route with ROBUST completion checking */}
        <Route path="/" element={
          (() => {
            console.log('🔍 ROOT ROUTE - Completion Status:', completionStatus);
            
            // ✅ ENHANCED: If both are completed, go directly to dashboard
            if (completionStatus.questionnaire && completionStatus.selfAssessment) {
              console.log('✅ Both completed - redirecting to /home');
              return <Navigate to="/home" replace />;
            }
            
            // If questionnaire not completed, start there
            if (!completionStatus.questionnaire) {
              console.log('📝 Questionnaire not completed - redirecting to /questionnaire');
              return <Navigate to="/questionnaire" replace />;
            }
            
            // If only self-assessment remaining, go to introduction
            if (!completionStatus.selfAssessment) {
              console.log('🎯 Self-assessment not completed - redirecting to /introduction');
              return <Navigate to="/introduction" replace />;
            }
            
            // Default fallback
            return <Navigate to="/home" replace />;
          })()
        } />
        
        {/* ✅ FIXED: Main app routes with proper individual guards */}
        <Route 
          path="/home" 
          element={
            (() => {
              if (!completionStatus.questionnaire) {
                return <Navigate to="/questionnaire" replace />;
              } else if (!completionStatus.selfAssessment) {
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
        
        {/* ✅ FIXED: All other authenticated routes with proper guards */}
        <Route 
          path="/*" 
          element={
            (() => {
              if (!completionStatus.questionnaire) {
                return <Navigate to="/questionnaire" replace />;
              } else if (!completionStatus.selfAssessment) {
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