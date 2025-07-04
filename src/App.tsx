import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PageViewTracker from './components/PageViewTracker';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext';
import AdminPanel from './components/AdminPanel';
import MainNavigation from './MainNavigation';
import DailyEmotionalNotesWrapper from './DailyEmotionalNotesWrapper';
import AnalyticsBoardWrapper from './AnalyticsBoardWrapper';
import MindRecoverySelectionWrapper from './MindRecoverySelectionWrapper';
import MindRecoveryTimerWrapper from './MindRecoveryTimerWrapper';

// Import LogoutWarning component
import LogoutWarning from './components/LogoutWarning';

// Import components
import HomeDashboard from './HomeDashboard';
import Stage1Wrapper from './Stage1Wrapper';
import Stage2Wrapper from './Stage2Wrapper';
import Stage3Wrapper from './Stage3Wrapper';
import Stage4Wrapper from './Stage4Wrapper';
import Stage5Wrapper from './Stage5Wrapper';
import Stage6Wrapper from './Stage6Wrapper';
import WhatIsPAHMWrapper from './WhatIsPAHMWrapper';
import SeekerPracticeTimerWrapper from './SeekerPracticeTimerWrapper';
import SeekerPracticeCompleteWrapper from './SeekerPracticeCompleteWrapper';
import ImmediateReflectionWrapper from './ImmediateReflectionWrapper';
import ChatInterface from './components/Chatwithguru/ChatInterface';

// Import public landing pages
import PublicLandingHero from './components/PublicLandingHero';
import AboutMethod from './components/AboutMethod';
import PublicFAQ from './components/PublicFAQ';

// Authentication and other components
import SignIn from './SignIn';
import SignUp from './SignUp';
import Introduction from './Introduction';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';
import PostureGuide from './PostureGuide';
import UserProfile from './UserProfile';
import Questionnaire from './Questionnaire';

// 🔧 ENABLED: Import the happiness test page
import HappinessTrackerPage from './components/HappinessTrackerPage';

// Import Knowledge Base Components
import { LocalDataProvider } from './contexts/LocalDataContext';
import { EnhancedLocalStorageManager } from './services/AdaptiveWisdomEngine';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { 
    // 🔧 FIXED: Use the new AuthContext methods
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

  // Knowledge base initialization
  useEffect(() => {
    const initializeKnowledgeBase = () => {
      const bookContent = localStorage.getItem('roa_book_content');
      if (!bookContent) {
        const success = EnhancedLocalStorageManager.initializeBookContent();
        if (success) {
          console.log('✅ Knowledge base initialized successfully');
          setKnowledgeBaseReady(true);
        } else {
          console.error('❌ Failed to initialize knowledge base');
          setKnowledgeBaseReady(false);
        }
      } else {
        setKnowledgeBaseReady(true);
        console.log('✅ Knowledge base already available');
      }
    };
    initializeKnowledgeBase();
  }, []);

  // 🔧 FIXED: Auto-redirect logic with proper completion checking
  useEffect(() => {
    if (isAuthenticated && userProfile && !isLoading) {
      const currentPath = window.location.pathname;
      console.log('🔍 FIXED: Navigation check:', {
        currentPath,
        questionnaireCompleted: isQuestionnaireCompleted(),
        selfAssessmentCompleted: isSelfAssessmentCompleted(),
        email: currentUser?.email
      });

      // Only redirect from entry points, not during normal app usage
      const isEntryPoint = ['/signin', '/signup', '/'].includes(currentPath);
      
      if (isEntryPoint) {
        const getRedirectPath = (): string => {
          if (currentUser?.email === 'asiriamarasinghe35@gmail.com') return '/home';
          if (!isQuestionnaireCompleted()) return '/questionnaire';
          if (!isSelfAssessmentCompleted()) return '/introduction';
          return '/home';
        };

        const targetPath = getRedirectPath();
        if (currentPath !== targetPath) {
          console.log(`🔄 FIXED: Redirecting from ${currentPath} to ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      }
    }
  }, [isAuthenticated, userProfile, isLoading, navigate, currentUser, isQuestionnaireCompleted, isSelfAssessmentCompleted]);

  // 🔧 FIXED: Helper function for redirect path
  const getRedirectPath = (): string => {
    if (!isAuthenticated || !userProfile) return '/signin';
    if (currentUser?.email === 'asiriamarasinghe35@gmail.com') return '/home';
    if (!isQuestionnaireCompleted()) return '/questionnaire';
    if (!isSelfAssessmentCompleted()) return '/introduction';
    return '/home';
  };

  // Event handlers
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

  // 🔧 FIXED: Sign up handler with new AuthContext
  const handleSignUp = async (email: string, password: string, name: string, rememberMe: boolean = false) => {
    try {
      await signUp(email, password, name);
      console.log('🔧 FIXED: Sign up successful, redirecting to questionnaire');
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

  // 🔧 FIXED: Sign in handler with new AuthContext
  const handleSignIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      await signIn(email, password, rememberMe);
      console.log('🔧 FIXED: Sign in successful');
    } catch (error: any) {
      console.error("Sign-in error:", error);
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  };

  // 🔧 FIXED: Questionnaire completion handler
  const handleQuestionnaireComplete = async (answers: any) => {
    console.log('📝 FIXED: Questionnaire completed');
    
    try {
      // Use the new markQuestionnaireComplete method
      await markQuestionnaireComplete(answers);
      console.log('🔧 FIXED: Questionnaire marked as complete, navigating to introduction');
      navigate('/introduction');
    } catch (error) {
      console.error('🔧 Error completing questionnaire:', error);
    }
  };

  // 🔧 FIXED: Self-assessment completion handler
  const handleSelfAssessmentComplete = async (data?: any) => {
    console.log('🎯 FIXED: Self-assessment completed');
    
    try {
      // Use the new markSelfAssessmentComplete method
      await markSelfAssessmentComplete(data);
      
      // Also update any additional profile data
      await updateUserProfile({ 
        currentStage: '1'
      });
      
      console.log('🔧 FIXED: Self-assessment marked as complete, navigating to completion page');
      navigate('/self-assessment-completion');
    } catch (error) {
      console.error('🔧 Error completing self-assessment:', error);
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>
          Loading...
        </div>
      ) : (
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLandingHero />} />
          <Route path="/about" element={<AboutMethod />} />
          <Route path="/faq" element={<PublicFAQ />} />

          {/* Authentication routes */}
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

          {/* Onboarding routes */}
          <Route 
            path="/questionnaire" 
            element={isAuthenticated ? <Questionnaire onComplete={handleQuestionnaireComplete} /> : <Navigate to="/signin" replace />}
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

          {/* 🔧 FIXED: Self-assessment completion with proper navigation */}
          <Route 
            path="/self-assessment-completion" 
            element={isAuthenticated ? (
              <SelfAssessmentCompletion 
                onGetStarted={async (data) => {
                  console.log('🎉 FIXED: Start Your Journey clicked!');
                  
                  // Update any final data
                  if (data) {
                    await updateUserProfile(data);
                  }
                  
                  // Navigate to home
                  console.log('🚀 FIXED: Navigating to home dashboard');
                  navigate('/home');
                }}
                onBack={() => navigate('/self-assessment')} 
              />
            ) : <Navigate to="/signin" replace />}
          />

          {/* Main app routes with navigation wrapper */}
          <Route
            path="/*"
            element={isAuthenticated ? (
              <MainNavigation
                onPracticeClick={handleStartPracticeWrapper}
                onProgressClick={handleViewProgress}
                onLearnClick={handleViewLearning}
              >
                <Routes>
                  <Route 
                    path="/home" 
                    element={
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
                    } 
                  />
                  
                  <Route path="/stage1" element={<Stage1Wrapper />} />
                  <Route path="/stage2" element={<Stage2Wrapper />} />
                  <Route path="/stage3" element={<Stage3Wrapper />} />
                  <Route path="/stage4" element={<Stage4Wrapper />} />
                  <Route path="/stage5" element={<Stage5Wrapper />} />
                  <Route path="/stage6" element={<Stage6Wrapper />} />
                  <Route path="/immediate-reflection" element={<ImmediateReflectionWrapper />} />
                  <Route path="/learning/pahm" element={<WhatIsPAHMWrapper />} />
                  <Route path="/seeker-practice-timer" element={<SeekerPracticeTimerWrapper />} />
                  <Route path="/seeker-practice-complete" element={<SeekerPracticeCompleteWrapper />} />
                  <Route path="/notes" element={<DailyEmotionalNotesWrapper />} />
                  <Route path="/analytics" element={<AnalyticsBoardWrapper />} />
                  <Route path="/mind-recovery" element={<MindRecoverySelectionWrapper />} />
                  <Route path="/mind-recovery/:practiceType" element={<MindRecoveryTimerWrapper />} />
                  <Route path="/posture-guide" element={<PostureGuide onContinue={() => navigate('/home')} />} />
                  <Route path="/profile" element={<UserProfile onBack={() => navigate('/home')} onLogout={handleLogout} />} />
                  <Route 
                    path="/chatwithguru" 
                    element={knowledgeBaseReady ? <ChatInterface /> : (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '18px' }}>
                        Loading knowledge base...
                      </div>
                    )} 
                  />
                  
                  {/* 🔧 ENABLED: Happiness test route */}
                  <Route path="/happiness-test" element={<HappinessTrackerPage />} />
                  
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </MainNavigation>
            ) : <Navigate to="/signin" replace />}
          />
        </Routes>
      )}
    </div>
  );
};

// Main App component with all providers
const App: React.FC = () => {
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
};

export default App;