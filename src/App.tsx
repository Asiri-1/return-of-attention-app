import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PageViewTracker from './components/PageViewTracker';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
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

// Import Chat with Guru components
import ChatInterface from './components/Chatwithguru/ChatInterface';

// Import Landing Page
import LandingPage from './LandingPage';

// Assuming you have SignIn and SignUp components
import SignIn from './SignIn';
import SignUp from './SignUp';

// Import Introduction and SelfAssessment components
import Introduction from './Introduction';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';
import PostureGuide from './PostureGuide';
import UserProfile from './UserProfile';

// Import the new Questionnaire component
import Questionnaire from './Questionnaire';

// Define types
interface PracticeData {
  sessions: Array<{
    id: string;
    date: string;
    duration: number;
    stageLevel: string;
    position: string;
    rating?: number;
    notes?: string;
  }>;
  lastPosition: string;
  lastStageLevel: string;
  lastDuration: number;
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isAuthenticated, currentUser, updateUserProfileInContext, logout } = useAuth();

  // State for practice data - CONSIDER MOVING THIS TO FIRESTORE LATER
  const [practiceData, setPracticeData] = useState<PracticeData>({
    sessions: [],
    lastPosition: 'chair',
    lastStageLevel: 'T1: Physical Stillness for 10 minutes',
    lastDuration: 10
  });
  
  // Load practice data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('practiceData');
    if (savedData) {
      try {
        setPracticeData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error parsing practice data:', e);
      }
    }
  }, []);
  
  // Save practice data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('practiceData', JSON.stringify(practiceData));
  }, [practiceData]);
  
  // Add a new practice session
  const addSession = (session: any) => {
    setPracticeData((prev: PracticeData) => {
      const newSessions = [...prev.sessions, {
        ...session,
        id: `session-${Date.now()}`,
        date: new Date().toISOString()
      }];
      
      return {
        ...prev,
        sessions: newSessions,
        lastPosition: session.position || prev.lastPosition,
        lastStageLevel: session.stageLevel || prev.lastStageLevel,
        lastDuration: session.duration || prev.lastDuration
      };
    });
  };
  
  // Update session with reflection data
  const updateSessionReflection = (sessionId: string, reflectionData: any) => {
    setPracticeData(prev => {
      const updatedSessions = prev.sessions.map(session => {
        if (session.id === sessionId) {
          return { ...session, ...reflectionData };
        }
        return session;
      });
      
      return {
        ...prev,
        sessions: updatedSessions
      };
    });
  };
  
  // Update position during practice
  const updatePosition = (position: string) => {
    setPracticeData((prev: PracticeData) => ({
      ...prev,
      lastPosition: position
    }));
  };
  
  // Handle starting practice from dashboard
  const handleStartPractice = (stageLevel: string) => {
    console.log(`Starting practice: ${stageLevel}`);
    // Navigation will be handled by the router
  };
  
  // Wrapper function for HomeDashboard that matches the expected signature
  const handleStartPracticeWrapper = () => {
    console.log('Starting practice from dashboard');
    // This wrapper function has no parameters to match HomeDashboard's expected prop type
  };
  
  // Handle viewing progress from dashboard
  const handleViewProgress = () => {
    console.log('Viewing progress');
    // Will be implemented in future
  };
  
  // Handle viewing learning resources from dashboard
  const handleViewLearning = () => {
    console.log('Viewing learning resources');
    // Will be implemented in future
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
  
  // Handle starting stage 2
  const handleStartStage2 = () => {
    console.log('Starting stage 2');
    navigate('/stage2');
  };
  
  // Handle starting stage 3
  const handleStartStage3 = () => {
    console.log('Starting stage 3');
    navigate('/stage3');
  };
  
  // Handle starting stage 4
  const handleStartStage4 = () => {
    console.log('Starting stage 4');
    navigate('/stage4');
  };
  
  // Handle starting stage 5
  const handleStartStage5 = () => {
    console.log('Starting stage 5');
    navigate('/stage5');
  };
  
  // Handle starting stage 6
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
        alert(`Signup failed: ${error.message}`);
      }
    }
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (answers: any) => {
    updateUserProfileInContext({ questionnaireAnswers: answers, questionnaireCompleted: true });
    navigate('/introduction');
  };

  // Check if user should see introduction flow
  const shouldShowIntroductionFlow = () => {
    if (!isAuthenticated || !currentUser) return false;
    return !currentUser.assessmentCompleted;
  };

  // Check if user should see questionnaire flow
  const shouldShowQuestionnaireFlow = () => {
    if (!isAuthenticated || !currentUser) return false;
    return !currentUser.questionnaireCompleted;
  };

  return (
    <div className="app-container">
      <DevPanelToggle />
      <PageViewTracker />
      <Routes>
        {/* Landing Page Route - NEW: This is now the default route */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication Routes - always accessible */}
        <Route 
          path="/signin" 
          element={
            <SignIn 
              onSignIn={async (email, password) => { 
                try {
                  await login(email, password); 
                  navigate('/home'); 
                } catch (error) {
                  console.error("Sign-in error:", error);
                  alert("Failed to sign in. Please check your credentials.");
                }
              }}
              onGoogleSignIn={async () => { 
                alert("Google Sign-In not yet implemented with Firebase.");
              }}
              onAppleSignIn={async () => { 
                alert("Apple Sign-In not yet implemented with Firebase.");
              }}
              onSignUp={() => navigate('/signup')} 
              onForgotPassword={() => { /* handle forgot password */ }} 
            />
          }
        />
        <Route 
          path="/signup" 
          element={
            <SignUp 
              onSignUp={handleSignUp}
              onGoogleSignUp={async () => { 
                alert("Google Sign-Up not yet implemented with Firebase.");
              }}
              onAppleSignUp={async () => { 
                alert("Apple Sign-Up not yet implemented with Firebase.");
              }}
              onSignIn={() => navigate('/signin')} 
            />
          }
        />

        {/* Questionnaire Route - accessible to authenticated users who haven't completed the questionnaire */}
        <Route 
          path="/questionnaire" 
          element={
            isAuthenticated ? (
              <Questionnaire 
                onComplete={handleQuestionnaireComplete} 
                onSkip={() => navigate('/introduction')}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* Introduction Flow Routes - accessible to authenticated users who haven't completed assessment */}
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
        
        {/* Self-Assessment Route - accessible to authenticated users */}
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

        {/* Self-Assessment Completion Route - accessible after self-assessment */}
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

        {/* Authenticated Routes - conditionally rendered based on authentication */}
        <Route
          path="/*"
          element={isAuthenticated ? (
            <MainNavigation
              onPracticeClick={handleStartPracticeWrapper}
              onProgressClick={handleViewProgress}
              onLearnClick={handleViewLearning}
            >
              <Routes>
                {/* Conditional redirect based on authentication status and assessment completion */}
                <Route 
                  path="/home" 
                  element={
                    shouldShowQuestionnaireFlow() ?
                      <Navigate to="/questionnaire" replace /> :
                    shouldShowIntroductionFlow() ? 
                      <Navigate to="/introduction" replace /> : 
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
                
                {/* Stage Routes */}
                <Route path="/stage1" element={<Stage1Wrapper />} />
                <Route path="/stage2" element={<Stage2Wrapper />} />
                <Route path="/stage3" element={<Stage3Wrapper />} />
                <Route path="/stage4" element={<Stage4Wrapper />} />
                <Route path="/stage5" element={<Stage5Wrapper />} />
                <Route path="/stage6" element={<Stage6Wrapper />} />
                
                {/* Learning Routes */}
                <Route path="/learning/pahm" element={<WhatIsPAHMWrapper />} />
                
                {/* Practice Timer Routes */}
                <Route path="/seeker-practice-timer" element={<SeekerPracticeTimerWrapper />} />
                <Route path="/seeker-practice-complete" element={<SeekerPracticeCompleteWrapper />} />
                
                {/* New Feature Routes */}
                <Route path="/notes" element={<DailyEmotionalNotesWrapper />} />
                <Route path="/analytics" element={<AnalyticsBoardWrapper />} />
                <Route path="/mind-recovery" element={<MindRecoverySelectionWrapper />} />
                <Route path="/mind-recovery/:practiceType" element={<MindRecoveryTimerWrapper />} />
                <Route path="/posture-guide" element={<PostureGuide onContinue={() => navigate('/home')} />} />
                <Route path="/profile" element={<UserProfile onBack={() => navigate('/home')} onLogout={handleLogout} />} />
                
                {/* Chat with Guru Route */}
                <Route path="/chatwithguru" element={<ChatInterface />} />
                
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </MainNavigation>
          ) : (
            <Navigate to="/signin" replace />
          )}
        />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
