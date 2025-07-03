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

// 🔒 NEW: Import LogoutWarning component
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

// Import Knowledge Base Components
import { LocalDataProvider } from './contexts/LocalDataContext';
import { EnhancedLocalStorageManager } from './services/AdaptiveWisdomEngine';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, currentUser, updateUserProfileInContext, logout, isLoading } = useAuth();
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(false);

  // ✅ PRESERVED: Your existing knowledge base initialization
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

  // ✅ PRESERVED: Your existing auto-redirect logic
  useEffect(() => {
    if (isAuthenticated && currentUser && !isLoading) {
      const getRedirectPath = (): string => {
        if (!isAuthenticated || !currentUser) return '/signin';
        if (currentUser.email === 'asiriamarasinghe35@gmail.com') return '/home';
        if (!currentUser.questionnaireCompleted) return '/questionnaire';
        if (!currentUser.assessmentCompleted) return '/introduction';
        return '/home';
      };

      const targetPath = getRedirectPath();
      const currentPath = window.location.pathname;
      const shouldRedirect = ['/signin', '/signup', '/'].includes(currentPath) || currentPath === '/home';
      
      if (shouldRedirect && currentPath !== targetPath) {
        console.log(`🔄 Auto-redirecting from ${currentPath} to ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, isLoading, navigate]);

  // ✅ PRESERVED: Your existing getRedirectPath helper
  const getRedirectPath = (): string => {
    if (!isAuthenticated || !currentUser) return '/signin';
    if (currentUser.email === 'asiriamarasinghe35@gmail.com') return '/home';
    if (!currentUser.questionnaireCompleted) return '/questionnaire';
    if (!currentUser.assessmentCompleted) return '/introduction';
    return '/home';
  };

  // ✅ PRESERVED: All your existing handlers
  const handleStartPracticeWrapper = () => {
    if (!currentUser?.assessmentCompleted) {
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

  // 🔒 ENHANCED: Your existing handleSignUp with optional rememberMe
  const handleSignUp = async (email: string, password: string, name: string, rememberMe: boolean = false) => {
    try {
      await signup(email, password, name, rememberMe);
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

  // 🔒 ENHANCED: Your existing handleSignIn with optional rememberMe
  const handleSignIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      await login(email, password, rememberMe);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  };

  // ✅ PRESERVED: All your existing handlers
  const handleQuestionnaireComplete = (answers: any) => {
    updateUserProfileInContext({ 
      questionnaireAnswers: answers, 
      questionnaireCompleted: true 
    });
    navigate('/introduction');
  };

  const handleSelfAssessmentComplete = (data?: any) => {
    updateUserProfileInContext({ 
      selfAssessmentData: data,
      assessmentCompleted: true,
      currentStage: '1'
    });
    navigate('/self-assessment-completion');
  };

  const handleFinalCompletion = () => navigate('/home');
  const handleGoogleAuth = async () => alert("Google authentication not yet implemented with Firebase.");
  const handleAppleAuth = async () => alert("Apple authentication not yet implemented with Firebase.");
  const handleForgotPassword = () => alert("Forgot password functionality will be implemented soon.");

  return (
    <div className="app-container">
      <AdminPanel />
      <PageViewTracker />
      
      {/* 🔒 NEW: LogoutWarning component */}
      <LogoutWarning />
      
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>
          Loading...
        </div>
      ) : (
        <Routes>
          {/* ✅ PRESERVED: Your existing public routes */}
          <Route path="/" element={<PublicLandingHero />} />
          <Route path="/about" element={<AboutMethod />} />
          <Route path="/faq" element={<PublicFAQ />} />

          {/* ✅ PRESERVED: Your existing signin route */}
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

          {/* ✅ PRESERVED: Your existing signup route */}
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

          {/* ✅ PRESERVED: All your existing protected routes */}
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

          <Route 
            path="/self-assessment-completion" 
            element={isAuthenticated ? (
              <SelfAssessmentCompletion 
                onGetStarted={handleFinalCompletion}
                onBack={() => navigate('/self-assessment')} 
              />
            ) : <Navigate to="/signin" replace />}
          />

          {/* ✅ PRESERVED: Your existing MainNavigation wrapper and all nested routes */}
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

// ✅ PRESERVED: Your existing App component structure
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