import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// ✅ ESSENTIAL: All imports at the top
import PageViewTracker from './components/PageViewTracker';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext';
import AdminPanel from './components/AdminPanel';
import LogoutWarning from './components/LogoutWarning';

// ✅ CRITICAL COMPONENTS: Import normally to avoid chunk loading errors
import SignIn from './SignIn';
import SignUp from './SignUp';
import Introduction from './Introduction';
import Questionnaire from './Questionnaire';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';
import Logo from './Logo';

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
const PublicLandingHero = lazy(() => import('./components/PublicLandingHero'));
const AboutMethod = lazy(() => import('./components/AboutMethod'));
const PublicFAQ = lazy(() => import('./components/PublicFAQ'));

// Other components
const PostureGuide = lazy(() => import('./PostureGuide'));
const UserProfile = lazy(() => import('./UserProfile'));
const HappinessTrackerPage = lazy(() => import('./components/HappinessTrackerPage'));

// Knowledge Base Components
const LocalDataProvider = lazy(() => 
  import('./contexts/LocalDataContext').then(module => ({ 
    default: module.LocalDataProvider 
  }))
);

// ✅ SINGLE FastLoader component (only one declaration)
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

// ✅ ADMIN BYPASS COMPONENT: Full featured version
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
        
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <h3>🔍 Debug Info:</h3>
          <p>User: asiriamarasinghe35@gmail.com (Admin)</p>
          <p>Status: Firebase bypassed for testing</p>
          <p>All features unlocked</p>
        </div>
      </div>
      
      <Routes>
        {/* All your normal routes but accessible without Firebase auth */}
        <Route path="/home" element={
          <Suspense fallback={<FastLoader message="Loading dashboard..." />}>
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
          <Suspense fallback={<FastLoader message="Loading happiness tracker..." />}>
            <HappinessTrackerPage />
          </Suspense>
        } />
        
        <Route path="/happiness-test" element={
          <Suspense fallback={<FastLoader message="Loading happiness test..." />}>
            <HappinessTrackerPage />
          </Suspense>
        } />
        
        <Route path="/analytics" element={
          <Suspense fallback={<FastLoader message="Loading analytics..." />}>
            <AnalyticsBoardWrapper />
          </Suspense>
        } />
        
        <Route path="/notes" element={
          <Suspense fallback={<FastLoader message="Loading notes..." />}>
            <DailyEmotionalNotesWrapper />
          </Suspense>
        } />
        
        <Route path="/chatwithguru" element={
          <Suspense fallback={<FastLoader message="Loading AI teacher..." />}>
            <ChatInterface />
          </Suspense>
        } />
        
        <Route path="/stage1" element={
          <Suspense fallback={<FastLoader message="Loading Stage 1..." />}>
            <Stage1Wrapper />
          </Suspense>
        } />
        
        <Route path="/stage2" element={
          <Suspense fallback={<FastLoader message="Loading Stage 2..." />}>
            <Stage2Wrapper />
          </Suspense>
        } />
        
        <Route path="/stage3" element={
          <Suspense fallback={<FastLoader message="Loading Stage 3..." />}>
            <Stage3Wrapper />
          </Suspense>
        } />
        
        <Route path="/stage4" element={
          <Suspense fallback={<FastLoader message="Loading Stage 4..." />}>
            <Stage4Wrapper />
          </Suspense>
        } />
        
        <Route path="/stage5" element={
          <Suspense fallback={<FastLoader message="Loading Stage 5..." />}>
            <Stage5Wrapper />
          </Suspense>
        } />
        
        <Route path="/stage6" element={
          <Suspense fallback={<FastLoader message="Loading Stage 6..." />}>
            <Stage6Wrapper />
          </Suspense>
        } />
        
        <Route path="/mind-recovery" element={
          <Suspense fallback={<FastLoader message="Loading mind recovery..." />}>
            <MindRecoverySelectionWrapper />
          </Suspense>
        } />
        
        <Route path="/learning/pahm" element={
          <Suspense fallback={<FastLoader message="Loading PAHM guide..." />}>
            <WhatIsPAHMWrapper />
          </Suspense>
        } />
        
        <Route path="/posture-guide" element={
          <Suspense fallback={<FastLoader message="Loading posture guide..." />}>
            <PostureGuide onContinue={() => navigate('/home')} />
          </Suspense>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// ✅ MAIN APP CONTENT: Full featured version with all your original functionality
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { 
    signIn, 
    signUp, 
    logout,
    currentUser, 
    userProfile,
    updateUserProfile,
    markQuestionnaireComplete,
    markSelfAssessmentComplete,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    isLoading 
  } = useAuth();
  
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
          console.log('✅ Knowledge base initialized successfully');
          setKnowledgeBaseReady(true);
        } catch (error) {
          console.error('❌ Failed to initialize knowledge base', error);
          setKnowledgeBaseReady(false);
        }
      } else {
        setKnowledgeBaseReady(true);
        console.log('✅ Knowledge base already available');
      }
    };
    initializeKnowledgeBase();
  }, []);

  // ✅ Auto-redirect logic (only for non-admin users)
  useEffect(() => {
    // Skip navigation logic for admin users
    if (isAdminUser) {
      console.log('🔧 ADMIN BYPASS: Skipping navigation checks');
      return;
    }

    if (isAuthenticated && userProfile && !isLoading) {
      const currentPath = window.location.pathname;
      console.log('🔍 Navigation check:', {
        currentPath,
        questionnaireCompleted: isQuestionnaireCompleted(),
        selfAssessmentCompleted: isSelfAssessmentCompleted(),
        email: currentUser?.email
      });

      // ✅ FIX: Don't interfere with onboarding flow - allow these paths
      const onboardingPaths = [
        '/questionnaire',
        '/introduction', 
        '/self-assessment',
        '/self-assessment-completion'
      ];
      
      const isOnOnboardingPath = onboardingPaths.some(path => currentPath.startsWith(path));

      // Allow access to main app features
      const protectedAppRoutes = [
        '/home', 
        '/happiness-tracker',
        '/happiness-test', 
        '/analytics', 
        '/notes', 
        '/mind-recovery',
        '/profile',
        '/chatwithguru',
        '/stage1', '/stage2', '/stage3', '/stage4', '/stage5', '/stage6',
        '/seeker-practice-timer',
        '/seeker-practice-complete',
        '/immediate-reflection',
        '/learning/pahm',
        '/posture-guide'
      ];
      
      const isUsingApp = protectedAppRoutes.some(route => currentPath.startsWith(route));
      const isEntryPoint = ['/signin', '/signup', '/'].includes(currentPath);
      
      // ✅ FIX: Only redirect from true entry points, not during onboarding
      if (isEntryPoint) {
        const getRedirectPath = (): string => {
          if (!isQuestionnaireCompleted()) return '/questionnaire';
          if (!isSelfAssessmentCompleted()) return '/introduction';
          return '/home';
        };

        const targetPath = getRedirectPath();
        if (currentPath !== targetPath) {
          console.log(`🔄 ENTRY POINT REDIRECT: ${currentPath} → ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      } else if (isOnOnboardingPath) {
        // ✅ FIX: Allow onboarding flow to proceed without interference
        console.log(`✅ ALLOWING ONBOARDING: ${currentPath}`);
      } else if (isUsingApp) {
        console.log(`✅ ALLOWING APP USAGE: ${currentPath}`);
      }
    }
  }, [isAuthenticated, userProfile, isLoading, navigate, currentUser, isQuestionnaireCompleted, isSelfAssessmentCompleted, isAdminUser]);

  // ✅ ADMIN BYPASS: After all hooks are called
  if (isAdminUser) {
    console.log('🔧 ADMIN BYPASS ACTIVATED: Skipping all Firebase auth checks');
    return <AdminBypassApp />;
  }

  // ✅ Helper function with debugging
  const getRedirectPath = (): string => {
    const currentPath = window.location.pathname;
    
    const appRoutes = [
      '/home', 
      '/happiness-tracker',
      '/happiness-test', 
      '/analytics', 
      '/notes', 
      '/mind-recovery',
      '/profile',
      '/chatwithguru'
    ];
    
    // ✅ Add debugging to see what's happening
    const questComplete = isQuestionnaireCompleted();
    const selfComplete = isSelfAssessmentCompleted();
    
    console.log('🔍 DEBUG getRedirectPath:', {
      currentPath,
      questComplete,
      selfComplete,
      isAuthenticated,
      hasUserProfile: !!userProfile
    });
    
    if (appRoutes.some(route => currentPath.startsWith(route))) {
      console.log(`✅ STAYING ON APP ROUTE: ${currentPath}`);
      return currentPath;
    }
    
    if (!isAuthenticated || !userProfile) return '/signin';
    if (!questComplete) return '/questionnaire';
    if (!selfComplete) return '/introduction';
    return '/home';
  };

  // ✅ ALL YOUR EVENT HANDLERS (exactly the same as original)
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
      console.error("Error during logout:", error);
      navigate('/');
    }
  };

  const handleSignUp = async (email: string, password: string, name: string, rememberMe: boolean = false) => {
    try {
      await signUp(email, password, name);
      console.log('🔧 Sign up successful, redirecting to questionnaire');
      navigate('/questionnaire');
    } catch (error: any) {
      console.error('Signup error:', error);
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
      console.log('🔧 Sign in successful');
    } catch (error: any) {
      console.error("Sign-in error:", error);
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  };

  const handleQuestionnaireComplete = async (answers: any) => {
    console.log('📝 Questionnaire completed');
    
    try {
      // ✅ FIX: Wait for the questionnaire to be marked complete
      await markQuestionnaireComplete(answers);
      
      // ✅ FIX: Add a small delay to ensure state has updated
      setTimeout(() => {
        console.log('🔧 Questionnaire marked as complete, navigating to introduction');
        navigate('/introduction');
      }, 100);
      
    } catch (error) {
      console.error('🔧 Error completing questionnaire:', error);
    }
  };

  const handleSelfAssessmentComplete = async (data?: any) => {
    console.log('🎯 Self-assessment completed with data:', data);
    
    try {
      // ✅ FIX: Ensure both operations complete before navigation
      console.log('🔧 Saving self-assessment data...');
      await markSelfAssessmentComplete(data);
      
      console.log('🔧 Updating user profile...');
      await updateUserProfile({ 
        currentStage: '1'
      });
      
      // ✅ FIX: Wait longer to ensure AuthContext state is fully updated
      console.log('🔧 Waiting for state to update...');
      setTimeout(() => {
        console.log('🔧 Self-assessment marked as complete, navigating to completion page');
        console.log('🔍 Current self-assessment status:', isSelfAssessmentCompleted());
        navigate('/self-assessment-completion');
      }, 500); // Increased delay to 500ms
      
    } catch (error) {
      console.error('🔧 Error completing self-assessment:', error);
      // Show user-friendly error
      alert('There was an error saving your assessment. Please try again.');
    }
  };

  const handleGoogleAuth = async () => alert("Google authentication not yet implemented with Firebase.");
  const handleAppleAuth = async () => alert("Apple authentication not yet implemented with Firebase.");
  const handleForgotPassword = () => alert("Forgot password functionality will be implemented soon.");

  return (
    <div className="app-container">
      <AdminPanel />
      <PageViewTracker />
      <LogoutWarning />
      
      {isLoading ? (
        <FastLoader message="Loading your mindfulness journey..." />
      ) : (
        <Routes>
          {/* ✅ KEEP: Public routes (with lazy loading for performance) */}
          <Route path="/" element={
            <Suspense fallback={<FastLoader />}>
              <PublicLandingHero />
            </Suspense>
          } />
          <Route path="/about" element={
            <Suspense fallback={<FastLoader />}>
              <AboutMethod />
            </Suspense>
          } />
          <Route path="/faq" element={
            <Suspense fallback={<FastLoader />}>
              <PublicFAQ />
            </Suspense>
          } />

          {/* ✅ KEEP: Authentication routes (same logic, no Suspense for critical components) */}
          <Route 
            path="/signin" 
            element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : (
              <SignIn 
                onSignIn={handleSignIn}
                onGoogleSignIn={handleGoogleAuth}
                onAppleSignIn={handleAppleAuth}
                onSignUp={() => navigate('/signup')} 
                onForgotPassword={handleForgotPassword} 
              />
            )}
          />

          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : (
              <SignUp 
                onSignUp={handleSignUp}
                onGoogleSignUp={handleGoogleAuth}
                onAppleSignUp={handleAppleAuth}
                onSignIn={() => navigate('/signin')} 
              />
            )}
          />

          {/* ✅ KEEP: Onboarding routes (exactly the same) */}
          <Route 
            path="/questionnaire" 
            element={isAuthenticated ? (
              <Questionnaire onComplete={handleQuestionnaireComplete} />
            ) : <Navigate to="/signin" replace />}
          />

          <Route 
            path="/introduction" 
            element={isAuthenticated ? (
              <Introduction 
                onComplete={() => navigate('/self-assessment')} 
                onSkip={() => navigate('/home')} 
              />
            ) : <Navigate to="/signin" replace />}
          />
          
          <Route 
            path="/self-assessment" 
            element={isAuthenticated ? (
              <SelfAssessment 
                onComplete={handleSelfAssessmentComplete}
                onBack={() => navigate('/introduction')} 
              />
            ) : <Navigate to="/signin" replace />}
          />

          {/* ✅ KEEP: Self-assessment completion (exactly the same) */}
          <Route 
            path="/self-assessment-completion" 
            element={isAuthenticated ? (
              <SelfAssessmentCompletion 
                onGetStarted={async (data) => {
                  console.log('🎉 Start Your Journey clicked with data:', data);
                  
                  try {
                    if (data) {
                      console.log('🔧 Updating final profile data...');
                      await updateUserProfile(data);
                    }
                    
                    console.log('🚀 Navigating to home dashboard');
                    console.log('🔍 Final completion status:', {
                      questionnaire: isQuestionnaireCompleted(),
                      selfAssessment: isSelfAssessmentCompleted()
                    });
                    
                    // ✅ FIX: Add delay here too to ensure everything is saved
                    setTimeout(() => {
                      navigate('/home');
                    }, 200);
                    
                  } catch (error) {
                    console.error('🔧 Error in final step:', error);
                    // Still navigate to home even if final update fails
                    navigate('/home');
                  }
                }}
                onBack={() => navigate('/self-assessment')} 
              />
            ) : <Navigate to="/signin" replace />}
          />

          {/* ✅ MAIN APP ROUTES: All your original routes with navigation wrapper */}
          <Route
            path="/*"
            element={isAuthenticated ? (
              <Suspense fallback={<FastLoader message="Loading main navigation..." />}>
                <MainNavigation
                  onPracticeClick={handleStartPracticeWrapper}
                  onProgressClick={handleViewProgress}
                  onLearnClick={handleViewLearning}
                >
                  <Routes>
                    <Route 
                      path="/home" 
                      element={
                        <Suspense fallback={<FastLoader message="Loading dashboard..." />}>
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
                        </Suspense>
                      } 
                    />
                    
                    {/* ✅ ALL YOUR STAGE ROUTES */}
                    <Route path="/stage1" element={
                      <Suspense fallback={<FastLoader message="Loading Stage 1..." />}>
                        <Stage1Wrapper />
                      </Suspense>
                    } />
                    <Route path="/stage2" element={
                      <Suspense fallback={<FastLoader message="Loading Stage 2..." />}>
                        <Stage2Wrapper />
                      </Suspense>
                    } />
                    <Route path="/stage3" element={
                      <Suspense fallback={<FastLoader message="Loading Stage 3..." />}>
                        <Stage3Wrapper />
                      </Suspense>
                    } />
                    <Route path="/stage4" element={
                      <Suspense fallback={<FastLoader message="Loading Stage 4..." />}>
                        <Stage4Wrapper />
                      </Suspense>
                    } />
                    <Route path="/stage5" element={
                      <Suspense fallback={<FastLoader message="Loading Stage 5..." />}>
                        <Stage5Wrapper />
                      </Suspense>
                    } />
                    <Route path="/stage6" element={
                      <Suspense fallback={<FastLoader message="Loading Stage 6..." />}>
                        <Stage6Wrapper />
                      </Suspense>
                    } />
                    
                    {/* ✅ ALL YOUR OTHER ROUTES */}
                    <Route path="/immediate-reflection" element={
                      <Suspense fallback={<FastLoader message="Loading reflection..." />}>
                        <ImmediateReflectionWrapper />
                      </Suspense>
                    } />
                    <Route path="/learning/pahm" element={
                      <Suspense fallback={<FastLoader message="Loading PAHM guide..." />}>
                        <WhatIsPAHMWrapper />
                      </Suspense>
                    } />
                    <Route path="/seeker-practice-timer" element={
                      <Suspense fallback={<FastLoader message="Loading practice timer..." />}>
                        <SeekerPracticeTimerWrapper />
                      </Suspense>
                    } />
                    <Route path="/seeker-practice-complete" element={
                      <Suspense fallback={<FastLoader message="Loading completion..." />}>
                        <SeekerPracticeCompleteWrapper />
                      </Suspense>
                    } />
                    <Route path="/notes" element={
                      <Suspense fallback={<FastLoader message="Loading notes..." />}>
                        <DailyEmotionalNotesWrapper />
                      </Suspense>
                    } />
                    <Route path="/analytics" element={
                      <Suspense fallback={<FastLoader message="Loading analytics..." />}>
                        <AnalyticsBoardWrapper />
                      </Suspense>
                    } />
                    <Route path="/mind-recovery" element={
                      <Suspense fallback={<FastLoader message="Loading mind recovery..." />}>
                        <MindRecoverySelectionWrapper />
                      </Suspense>
                    } />
                    <Route path="/mind-recovery/:practiceType" element={
                      <Suspense fallback={<FastLoader message="Loading mind recovery timer..." />}>
                        <MindRecoveryTimerWrapper />
                      </Suspense>
                    } />
                    <Route path="/posture-guide" element={
                      <Suspense fallback={<FastLoader message="Loading posture guide..." />}>
                        <PostureGuide onContinue={() => navigate('/home')} />
                      </Suspense>
                    } />
                    <Route path="/profile" element={
                      <Suspense fallback={<FastLoader message="Loading profile..." />}>
                        <UserProfile onBack={() => navigate('/home')} onLogout={handleLogout} />
                      </Suspense>
                    } />
                    <Route 
                      path="/chatwithguru" 
                      element={
                        <Suspense fallback={<FastLoader message="Loading AI teacher..." />}>
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
                      <Suspense fallback={<FastLoader message="Calculating happiness..." />}>
                        <HappinessTrackerPage />
                      </Suspense>
                    } />
                    
                    <Route path="/happiness-tracker" element={
                      <Suspense fallback={<FastLoader message="Loading happiness tracker..." />}>
                        <HappinessTrackerPage />
                      </Suspense>
                    } />
                    
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </MainNavigation>
              </Suspense>
            ) : <Navigate to="/signin" replace />}
          />
        </Routes>
      )}
    </div>
  );
};

// ✅ KEEP: Load LocalDataProvider only when needed
const AppWithData: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={<FastLoader message="Loading app data..." />}>
      <LocalDataProvider>
        {children}
      </LocalDataProvider>
    </Suspense>
  );
};

// ✅ KEEP: Main App component (same structure, but optimized loading)
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