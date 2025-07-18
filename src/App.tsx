// ✅ Complete App.tsx - Progress Tracker Only on Home Dashboard
// File: src/App.tsx

import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// ✅ ESSENTIAL: All imports at the top
import PageViewTracker from './components/PageViewTracker';
import PAHMProgressTracker from './PAHMProgressTracker';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider } from './AdminContext';
import AdminPanel from './components/AdminPanel';
import LogoutWarning from './components/LogoutWarning';

// ✅ FIXED: Import LocalDataProvider and PracticeProvider
import { LocalDataProvider, useLocalData } from './contexts/LocalDataContext';
import { PracticeProvider } from './PracticeContext';

// ✅ CRITICAL COMPONENTS: Import normally to avoid chunk loading errors
import SignIn from './SignIn';
import SignUp from './SignUp';
import Introduction from './Introduction';
import Questionnaire from './Questionnaire';
import SelfAssessment from './SelfAssessment';
import SelfAssessmentCompletion from './SelfAssessmentCompletion';

// ✅ NEW: Import Stage1Introduction directly (not lazy loaded for better UX)
import Stage1Introduction from './Stage1Introduction';

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
const ImmediateReflectionWrapper = lazy(() => import('./ImmediateReflectionWrapper'));
const ChatInterface = lazy(() => import('./components/Chatwithguru/ChatInterface'));

// ✅ NEW: Practice Reflection Component (for T1-T5)
const PracticeReflection = lazy(() => import('./PracticeReflection'));

// Public landing pages
const AboutMethod = lazy(() => import('./components/AboutMethod'));
const PublicFAQ = lazy(() => import('./components/PublicFAQ'));

// Other components
const PostureGuide = lazy(() => import('./PostureGuide'));
const UserProfile = lazy(() => import('./UserProfile'));
const HappinessTrackerPage = lazy(() => import('./components/HappinessTrackerPage'));

// ✅ FIXED: FastLoader with proper TypeScript interface
interface FastLoaderProps {
  message?: string;
}

const FastLoader: React.FC<FastLoaderProps> = React.memo(({ message = "Loading..." }) => {
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

// ✅ NEW: T-Level Selection Page Component
const TLevelSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const tLevels = [
    { level: 'T1', duration: 10, title: 'T1: Physical Stillness for 10 minutes', desc: 'Perfect for beginners' },
    { level: 'T2', duration: 15, title: 'T2: Physical Stillness for 15 minutes', desc: 'Building endurance' },
    { level: 'T3', duration: 20, title: 'T3: Physical Stillness for 20 minutes', desc: 'Intermediate practice' },
    { level: 'T4', duration: 25, title: 'T4: Physical Stillness for 25 minutes', desc: 'Advanced focus' },
    { level: 'T5', duration: 30, title: 'T5: Physical Stillness for 30 minutes', desc: 'Master level practice' }
  ];

  const handleTLevelClick = useCallback((level: string, duration: number) => {
    sessionStorage.setItem('currentTLevel', level.toLowerCase());

    navigate(`/stage1/${level}`, { 
      state: { 
        showT1Introduction: false,
        level: level,
        duration: duration,
        stageLevel: `${level}: Physical Stillness for ${duration} minutes`,
        returnToStage: 1
      } 
    });
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <button 
          onClick={handleBack}
          style={{
            position: 'absolute',
            left: '30px',
            top: '30px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ← Back
        </button>
        
        <h1 style={{
          color: 'white',
          fontSize: '32px',
          fontWeight: '700',
          margin: '0 0 10px 0',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          🧘‍♂️ Choose Your Practice Level
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '18px',
          margin: 0
        }}>
          Select a T-level to begin your Stage 1 physical stillness practice
        </p>
      </div>

      {/* T-Levels Grid */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {tLevels.map((tLevel, index) => (
          <button
            key={tLevel.level}
            onClick={() => handleTLevelClick(tLevel.level, tLevel.duration)}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '20px',
              padding: '30px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            }}
          >
            {/* Level badge */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {tLevel.level}
            </div>

            {/* Duration */}
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px'
            }}>
              {tLevel.duration}
              <span style={{ fontSize: '24px', color: '#666' }}>min</span>
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Physical Stillness Practice
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 20px 0',
              lineHeight: '1.5'
            }}>
              {tLevel.desc}
            </p>

            {/* Start button */}
            <div style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              Start {tLevel.level} Practice →
            </div>
          </button>
        ))}
      </div>

      {/* Footer guidance */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        marginTop: '30px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '30px auto 0 auto'
      }}>
        <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '10px' }}>
          💡 Practice Guidance
        </h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.6' }}>
          Start with T1 if you're new to meditation. Progress to higher levels as you become comfortable maintaining physical stillness. Each level builds the foundation for deeper practice.
        </p>
      </div>
    </div>
  );
};

// ✅ NEW: Practice Reflection Wrapper for T1-T5
const PracticeReflectionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    navigate('/home');
  };
  
  const handleSaveReflection = (reflectionData: any) => {
    // Save reflection data to localStorage
    const existingReflections = JSON.parse(localStorage.getItem('practiceReflections') || '[]');
    existingReflections.push({
      ...reflectionData,
      timestamp: new Date().toISOString(),
      sessionData: location.state || {}
    });
    localStorage.setItem('practiceReflections', JSON.stringify(existingReflections));
    
    console.log('Practice reflection saved:', reflectionData);
    
    // Check if this is T5 completion
    const state = location.state as any;
    if (state?.tLevel === 'T5' || state?.isT5Completion) {
      // Set T5 completion flags
      sessionStorage.setItem('t5Completed', 'true');
      localStorage.setItem('t5Completed', 'true');
      
      // Set stage progress to allow Stage 2 access
      sessionStorage.setItem('stageProgress', '2');
      localStorage.setItem('devCurrentStage', '2');
      
      // Force current T level to be beyond T5 to ensure unlock
      sessionStorage.setItem('currentTLevel', 't6');
      
      console.log('T5 completed, unlocking Stage 2');
      
      // Force a page reload to ensure all components update
      window.location.href = '/home';
      return;
    }
    
    navigate('/home');
  };
  
  return (
    <Suspense fallback={<FastLoader message="Loading practice reflection..." />}>
      <PracticeReflection 
        onBack={handleBack}
        onSaveReflection={handleSaveReflection}
      />
    </Suspense>
  );
};

// ✅ NEW: Legacy Redirect Components for Backward Compatibility
const SeekerPracticeTimerRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    // Get T-level from state or default to T1
    const state = location.state as { level?: string } || {};
    const tLevel = (state.level || 't1').toLowerCase();
    
    // Extract just the T-level (T1, T2, etc.)
    const tLevelUpper = tLevel.toUpperCase();
    
    console.log('🔄 Redirecting legacy seeker-practice-timer to Stage1Wrapper');
    console.log('Target T-Level:', tLevelUpper);
    
    // Redirect to modern Stage1Wrapper flow
    navigate(`/stage1/${tLevelUpper}`, { replace: true });
  }, [navigate, location]);
  
  return (
    <FastLoader message="Redirecting to modern practice flow..." />
  );
};

const SeekerPracticeCompleteRedirect: React.FC = () => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    console.log('🔄 Redirecting legacy seeker-practice-complete to home');
    navigate('/home', { replace: true });
  }, [navigate]);
  
  return (
    <FastLoader message="Redirecting to dashboard..." />
  );
};

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

  // ✅ FIXED: Proper TypeScript event handlers
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
          
          <Route path="/stage1/*" element={
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

// ✅ SIMPLIFIED: Completion status checker interface
interface CompletionStatusState {
  questionnaire: boolean;
  selfAssessment: boolean;
  isLoaded: boolean;
  hasChecked: boolean;
}

const useCompletionStatus = () => {
  const { isQuestionnaireCompleted, isSelfAssessmentCompleted } = useLocalData();
  const { currentUser } = useAuth();

  const checkCompletionStatus = useCallback(() => {
    if (!currentUser) {
      return;
    }

    try {
      isQuestionnaireCompleted();
      isSelfAssessmentCompleted();
    } catch (error) {
      console.error('❌ Error checking completion status:', error);
    }
  }, [currentUser, isQuestionnaireCompleted, isSelfAssessmentCompleted]);

  useEffect(() => {
    checkCompletionStatus();
  }, [checkCompletionStatus]);

  return { recheckStatus: checkCompletionStatus };
};

// ✅ Fixed Questionnaire Component with Location Handling
const QuestionnaireComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markQuestionnaireComplete } = useLocalData();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleQuestionnaireComplete = async (answers: any) => {
    try {
      setIsCompleting(true);
      await markQuestionnaireComplete(answers);
      
      // ✅ FIXED: Properly access React Router location state
      const returnTo = (location.state as any)?.returnTo || '/home';
      navigate(returnTo);
    } catch (error) {
      console.error('Error completing questionnaire:', error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="questionnaire-container">
      <Suspense fallback={<FastLoader />}>
        <Questionnaire onComplete={handleQuestionnaireComplete} />
      </Suspense>
      {isCompleting && <FastLoader />}
    </div>
  );
};

// ✅ Fixed Self Assessment Component with Location Handling
const SelfAssessmentComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { markSelfAssessmentComplete } = useLocalData();
  const { updateUserProfile } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleSelfAssessmentComplete = async (data: any) => {
    try {
      setIsCompleting(true);
      await markSelfAssessmentComplete(data);
      
      try {
        await updateUserProfile({ currentStage: '1' });
      } catch (profileError) {
        console.warn('Profile update failed, continuing anyway:', profileError);
      }
      
      // ✅ FIXED: Properly access React Router location state
      const returnTo = (location.state as any)?.returnTo;
      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/self-assessment-completion');
      }
    } catch (error) {
      console.error('Error completing self-assessment:', error);
      setIsCompleting(false);
    }
  };

  return (
    <div className="self-assessment-container">
      <Suspense fallback={<FastLoader />}>
        <SelfAssessment 
          onComplete={handleSelfAssessmentComplete}
          onBack={() => navigate('/introduction')}
        />
      </Suspense>
      {isCompleting && <FastLoader />}
    </div>
  );
};

// ✅ OPTIMIZED: Main app content with PROGRESSIVE ONBOARDING + NEW STAGE 1 FLOW
const AppContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ ADD: Get current location for progress tracker
  const { currentUser, isLoading, signIn, signUp, logout } = useAuth();
  
  // ✅ FIXED: Define isAuthenticated BEFORE using it
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);
  const isAdminUser = useMemo(() => currentUser?.email === 'asiriamarasinghe35@gmail.com', [currentUser?.email]);
  
  // ✅ SIMPLIFIED: Keep completion status for optional features only
  const { recheckStatus } = useCompletionStatus();
  
  // ✅ Get current stage from progressive onboarding (only if authenticated)
  const currentStage = isAuthenticated ? (() => {
    try {
      // We'll calculate current stage based on localStorage since we can't use hooks conditionally
      const t5Complete = localStorage.getItem('t5Complete') === 'true';
      if (!t5Complete) return 1;
      
      // Check PAHM stages
      for (let stage = 2; stage <= 6; stage++) {
        const stageComplete = localStorage.getItem(`stage${stage}Complete`) === 'true';
        if (!stageComplete) return stage;
      }
      return 6; // All completed
    } catch (error) {
      return 1;
    }
  })() : 1;
  
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // ✅ PERFORMANCE: Force app ready quickly
  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ PERFORMANCE: Initialize knowledge base
  useEffect(() => {
    setKnowledgeBaseReady(true);
  }, []);

  // ✅ PERFORMANCE: Stable event handlers with proper TypeScript
  const handlers = useMemo(() => ({
    // ✅ NAVIGATION HANDLERS (NO MORE BLOCKING!)
    startPractice: () => navigate('/stage1'), // Direct navigation - modal will handle requirements
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
    
    // ✅ AUTH HANDLERS with proper types
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
        // ✅ NEW: Go directly to home after signup
        navigate('/home');
      } catch (error: any) {
        if (error?.code === 'auth/email-already-in-use') {
          alert('This email is already registered. Please sign in instead.');
          navigate('/signin');
        } else {
          alert(`Signup failed: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    
    signIn: async (email: string, password: string) => {
      try {
        await signIn(email, password);
        // ✅ NEW: Go directly to home after signin
        navigate('/home');
        setTimeout(() => {
          recheckStatus();
        }, 500);
      } catch (error: any) {
        alert(`Failed to sign in: ${error?.message || 'Please check your credentials.'}`);
      }
    },
    
    // ✅ OTHER HANDLERS with proper types
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
          navigate('/home'); // ✅ NEW: Direct to home
        }
      } catch (error: any) {
        alert(`Google sign-up failed: ${error?.message || 'Unknown error'}`);
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
    navigate, 
    logout, 
    signUp, 
    signIn, 
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

  // ✅ AUTHENTICATED ROUTES WITH PROGRESSIVE ONBOARDING + NEW STAGE 1 FLOW
  return (
    <div className="app-container">
      <PageViewTracker />
      <LogoutWarning />
      
      <Routes>
        {/* ✅ NEW: ALWAYS GO TO HOME AFTER AUTHENTICATION */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* ✅ NEW: Stage 1 Introduction Route */}
        <Route 
          path="/stage1-introduction" 
          element={
            <Stage1Introduction 
              onComplete={() => navigate('/stage1-tlevel-selection')}
              onBack={() => navigate('/home')}
              hasSeenBefore={JSON.parse(localStorage.getItem('completedStageIntros') || '[]').includes(1)}
            />
          } 
        />
        
        {/* ✅ NEW: T-Level Selection Route */}
        <Route 
          path="/stage1-tlevel-selection" 
          element={<TLevelSelectionPage />} 
        />
        
        {/* ✅ OPTIONAL ONBOARDING ROUTES (accessible via modals) */}
        <Route path="/questionnaire" element={<QuestionnaireComponent />} />
        
        <Route path="/introduction" element={
          <Introduction 
            onComplete={handlers.introductionComplete}
            onSkip={handlers.introductionSkip}
          />
        } />
        
        <Route path="/self-assessment" element={<SelfAssessmentComponent />} />
        
        <Route path="/self-assessment-completion" element={
          <SelfAssessmentCompletion 
            onGetStarted={handlers.selfAssessmentCompletionGetStarted}
            onBack={handlers.selfAssessmentCompletionBack}
          />
        } />
        
        {/* ✅ MAIN DASHBOARD - ALWAYS ACCESSIBLE */}
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
        
        {/* ✅ ALL OTHER ROUTES - ALWAYS ACCESSIBLE */}
        <Route path="/*" element={
          <Suspense fallback={<FastLoader message="Loading your practice space..." />}>
            <MainNavigation>
              <Routes>
                <Route path="/stage1/*" element={
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
                
                {/* ✅ NEW: Practice Reflection Route for T1-T5 */}
                <Route path="/practice-reflection" element={<PracticeReflectionWrapper />} />
                
                {/* ✅ LEGACY REDIRECTS: Backward Compatibility */}
                <Route path="/seeker-practice-timer" element={<SeekerPracticeTimerRedirect />} />
                <Route path="/seeker-practice-complete" element={<SeekerPracticeCompleteRedirect />} />
                
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

      {/* ✅ OPTION 2: Progress Tracker - ONLY shows on Home Dashboard */}
      {isAuthenticated && location.pathname === '/home' && <PAHMProgressTracker currentStage={currentStage} />}
    </div>
  );
});

// ✅ MAIN App component with complete provider chain
const App: React.FC = React.memo(() => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <LocalDataProvider>
            <PracticeProvider>
              <AppContent />
            </PracticeProvider>
          </LocalDataProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
});

export default App;