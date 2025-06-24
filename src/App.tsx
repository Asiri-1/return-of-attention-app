import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // BrowserRouter added back here
import PageViewTracker from './components/PageViewTracker';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext'; // Add this import
import DevPanelToggle from './DevPanelToggle';
import MainNavigation from './MainNavigation';
import DailyEmotionalNotesWrapper from './DailyEmotionalNotesWrapper';
import AnalyticsBoardWrapper from './AnalyticsBoardWrapper';
import MindRecoverySelectionWrapper from './MindRecoverySelectionWrapper';
import MindRecoveryTimerWrapper from './MindRecoveryTimerWrapper';

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

// 🎯 ADDED: Import ImmediateReflectionWrapper
import ImmediateReflectionWrapper from './ImmediateReflectionWrapper';

// Import Chat with Guru components
import ChatInterface from './components/Chatwithguru/ChatInterface';

// Import Landing Page
import LandingPage from './LandingPage';

// Authentication components
import SignIn from './SignIn';
import SignUp from './SignUp';

// Import Introduction and SelfAssessment components
import Introduction from './Introduction';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';
import PostureGuide from './PostureGuide';
import UserProfile from './UserProfile';

// Import the Questionnaire component
import Questionnaire from './Questionnaire';

// Import Knowledge Base Components
import { LocalDataProvider } from './contexts/LocalDataContext';
import { EnhancedLocalStorageManager } from './services/EnhancedLocalStorageManager';
import { apiService } from './services/api'; // For backend persistence

// Helper component to wrap authenticated pages with navigation
const AuthenticatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const handleStartPracticeWrapper = () => {
    console.log('Starting practice from dashboard');
    navigate('/stage1');
  };
  
  const handleViewProgress = () => {
    console.log('Viewing progress');
    navigate('/analytics');
  };
  
  const handleViewLearning = () => {
    console.log('Viewing learning resources');
    navigate('/learning/pahm');
  };

  return (
    <MainNavigation
      onPracticeClick={handleStartPracticeWrapper}
      onProgressClick={handleViewProgress}
      onLearnClick={handleViewLearning}
    >
      {children}
    </MainNavigation>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, currentUser, updateUserProfileInContext, logout, isLoading } = useAuth();

  // Knowledge Base Initialization
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(false);

  // Initialize knowledge base when app loads
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
  
  // Wrapper function for HomeDashboard that matches the expected signature
  const handleStartPracticeWrapper = () => {
    // Check assessment completion before navigating
    if (!currentUser?.assessmentCompleted) {
      alert('Please complete your self-assessment first before starting practice sessions.');
      navigate('/self-assessment');
      return;
    }
    
    console.log('Starting practice from dashboard');
    navigate('/stage1');
  };
  
  // Handle viewing progress from dashboard
  const handleViewProgress = () => {
    console.log('Viewing progress');
    navigate('/analytics');
  };
  
  // Handle viewing learning resources from dashboard
  const handleViewLearning = () => {
    console.log('Viewing learning resources');
    navigate('/learning/pahm');
  };
  
  // Handle showing posture guide
  const handleShowPostureGuide = () => {
    console.log("Showing posture guide");
    navigate("/posture-guide");
  };
  
  // Handle showing PAHM explanation
  const handleShowPAHMExplanation = () => {
    console.log('Showing PAHM explanation');
    navigate('/learning/pahm');
  };
  
  // Handle showing What is PAHM
  const handleShowWhatIsPAHM = () => {
    console.log('Showing What is PAHM');
    navigate('/learning/pahm');
  };
  
  // Stage navigation handlers
  const handleStartStage2 = () => {
    console.log('Starting stage 2');
    navigate('/stage2');
  };
  
  const handleStartStage3 = () => {
    console.log('Starting stage 3');
    navigate('/stage3');
  };
  
  const handleStartStage4 = () => {
    console.log('Starting stage 4');
    navigate('/stage4');
  };
  
  const handleStartStage5 = () => {
    console.log('Starting stage 5');
    navigate('/stage5');
  };
  
  const handleStartStage6 = () => {
    console.log('Starting stage 6');
    navigate('/stage6');
  };
  
  // Handle logout from dashboard - UPDATED TO USE FIREBASE AUTH
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if logout fails, redirect to landing page
      navigate('/');
    }
  };

  // Handle sign-up with proper flow to introduction - UPDATED TO USE FIREBASE AUTH
  const handleSignUp = async (email: string, password: string, name: string) => {
    try {
      await signup(email, password, name);
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

  // Handle sign-in
  const handleSignIn = async (email: string, password: string) => {
    try {
      await login(email, password);
      navigate('/home');
    } catch (error: any) {
      console.error("Sign-in error:", error);
      alert(`Failed to sign in: ${error.message || 'Please check your credentials.'}`);
    }
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (answers: any) => {
    updateUserProfileInContext({ 
      questionnaireAnswers: answers, 
      questionnaireCompleted: true 
    });
    navigate('/introduction');
  };

  // Check if user should see introduction flow
  const shouldShowIntroductionFlow = (): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    return !currentUser.assessmentCompleted;
  };

  // Check if user should see questionnaire flow
  const shouldShowQuestionnaireFlow = (): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    return !currentUser.questionnaireCompleted;
  };

  // Handle placeholder functions for future implementation
  const handleGoogleAuth = async () => {
    alert("Google authentication not yet implemented with Firebase.");
  };

  const handleAppleAuth = async () => {
    alert("Apple authentication not yet implemented with Firebase.");
  };

  const handleForgotPassword = () => {
    alert("Forgot password functionality will be implemented soon.");
  };

  return (
    <div className="app-container">
      <DevPanelToggle />
      <PageViewTracker />
      
      {/* Show loading spinner while authentication state is being determined */}
      {isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px'
        }}>
          Loading...
        </div>
      ) : (
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Routes */}
          <Route 
            path="/signin" 
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <SignIn 
                  onSignIn={handleSignIn}
                  onGoogleSignIn={handleGoogleAuth}
                  onAppleSignIn={handleAppleAuth}
                  onSignUp={() => navigate('/signup')} 
                  onForgotPassword={handleForgotPassword} 
                />
              )
            }
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <SignUp 
                  onSignUp={handleSignUp}
                  onGoogleSignUp={handleGoogleAuth}
                  onAppleSignUp={handleAppleAuth}
                  onSignIn={() => navigate('/signin')} 
                />
              )
            }
          />

          {/* Questionnaire Route - Fixed: Removed onSkip prop */}
          <Route 
            path="/questionnaire" 
            element={
              isAuthenticated ? (
                <Questionnaire 
                  onComplete={handleQuestionnaireComplete} 
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          {/* Introduction Flow Routes */}
          <Route 
            path="/introduction" 
            element={
              isAuthenticated ? (
                <Introduction 
                  onComplete={() => navigate('/self-assessment')} 
                  onSkip={() => navigate('/home')} 
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />
          
          <Route 
            path="/self-assessment" 
            element={
              isAuthenticated ? (
                <SelfAssessment 
                  onComplete={() => navigate('/self-assessment-completion')} 
                  onBack={() => navigate('/introduction')} 
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          <Route 
            path="/self-assessment-completion" 
            element={
              isAuthenticated ? (
                <SelfAssessmentCompletion 
                  onGetStarted={() => navigate('/stage1')} 
                  onBack={() => navigate('/self-assessment')} 
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          {/* Authenticated Routes */}
          <Route
            path="/*"
            element={isAuthenticated ? (
              <MainNavigation
                onPracticeClick={handleStartPracticeWrapper}
                onProgressClick={handleViewProgress}
                onLearnClick={handleViewLearning}
              >
                <Routes>
                  {/* Home Dashboard with conditional redirects */}
                  <Route 
                    path="/home" 
                    element={
                      shouldShowQuestionnaireFlow() ? (
                        <Navigate to="/questionnaire" replace />
                      ) : shouldShowIntroductionFlow() ? (
                        <Navigate to="/introduction" replace />
                      ) : (
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
                      )
                    } 
                  />
                  
                  {/* Stage Routes */}
                  <Route path="/stage1" element={<Stage1Wrapper />} />
                  <Route path="/stage2" element={<Stage2Wrapper />} />
                  <Route path="/stage3" element={<Stage3Wrapper />} />
                  <Route path="/stage4" element={<Stage4Wrapper />} />
                  <Route path="/stage5" element={<Stage5Wrapper />} />
                  <Route path="/stage6" element={<Stage6Wrapper />} />
                  
                  {/* 🎯 ADDED: Immediate Reflection Route */}
                  <Route path="/immediate-reflection" element={<ImmediateReflectionWrapper />} />
                  
                  {/* Learning Routes */}
                  <Route path="/learning/pahm" element={<WhatIsPAHMWrapper />} />
                  
                  {/* Practice Timer Routes */}
                  <Route path="/seeker-practice-timer" element={<SeekerPracticeTimerWrapper />} />
                  <Route path="/seeker-practice-complete" element={<SeekerPracticeCompleteWrapper />} />
                  
                  {/* Feature Routes */}
                  <Route path="/notes" element={<DailyEmotionalNotesWrapper />} />
                  <Route path="/analytics" element={<AnalyticsBoardWrapper />} />
                  <Route path="/mind-recovery" element={<MindRecoverySelectionWrapper />} />
                  <Route path="/mind-recovery/:practiceType" element={<MindRecoveryTimerWrapper />} />
                  <Route 
                    path="/posture-guide" 
                    element={
                      <PostureGuide onContinue={() => navigate('/home')} />
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <UserProfile 
                        onBack={() => navigate('/home')} 
                        onLogout={handleLogout} 
                      />
                    } 
                  />
                  
                  {/* Enhanced Chat with Guru Route */}
                  <Route 
                    path="/chatwithguru" 
                    element={
                      <ChatInterface 
                        knowledgeBaseReady={knowledgeBaseReady}
                        currentUser={currentUser}
                      />
                    } 
                  />
                  
                  {/* Redirect any unknown routes to home */}
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </MainNavigation>
            ) : (
              <Navigate to="/signin" replace />
            )}
          />
        </Routes>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AdminProvider>
        <LocalDataProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </LocalDataProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;