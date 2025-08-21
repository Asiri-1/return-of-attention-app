// ✅ FIXED AppProvider - Added AnalyticsProvider
// File: src/contexts/AppProvider.tsx

import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import { UserProvider } from './user/UserContext';
import { PracticeProvider } from './practice/PracticeContext';
import { WellnessProvider } from './wellness/WellnessContext';
import { OnboardingProvider } from './onboarding/OnboardingContext';
import { ContentProvider } from './content/ContentContext';
import { AnalyticsProvider } from './analytics/AnalyticsContext'; // ✅ ADDED: Import AnalyticsProvider

// ================================
// COMPLETE CONTEXT PROVIDER HIERARCHY (WITH ANALYTICS)
// ================================
/**
 * Complete App Provider - Now includes AnalyticsProvider
 * 
 * Provides all contexts in the optimal order:
 * 1. AuthProvider - Firebase authentication (foundation)
 * 2. UserProvider - User profile and preferences (depends on auth)
 * 3. OnboardingProvider - Questionnaire and assessment data (depends on auth)
 * 4. PracticeProvider - Session management (depends on user and auth)
 * 5. WellnessProvider - Emotional notes and reflections (depends on auth)
 * 6. ContentProvider - Guided content and achievements (depends on auth)
 * 7. AnalyticsProvider - Analytics and insights (depends on all above contexts)
 * 
 * Benefits:
 * - Single AuthProvider (no conflicts)
 * - Proper authentication flow
 * - Proper dependency order
 * - AnalyticsProvider can access all other contexts
 * - User isolation across all contexts
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <OnboardingProvider>
          <PracticeProvider>
            <WellnessProvider>
              <ContentProvider>
                <AnalyticsProvider>  {/* ✅ ADDED: AnalyticsProvider */}
                  {children}
                </AnalyticsProvider>
              </ContentProvider>
            </WellnessProvider>
          </PracticeProvider>
        </OnboardingProvider>
      </UserProvider>
    </AuthProvider>
  );
};

// ================================
// CONTEXT HOOKS (Re-exports for convenience)
// ================================
export { useAuth } from './auth/AuthContext';
export { useUser } from './user/UserContext';
export { usePractice } from './practice/PracticeContext';
export { useWellness } from './wellness/WellnessContext';
export { useOnboarding } from './onboarding/OnboardingContext';
export { useContent } from './content/ContentContext';
export { useAnalytics } from './analytics/AnalyticsContext'; // ✅ ADDED: Export useAnalytics

// ================================
// PROVIDER STATUS HOOK  
// ================================
export const useProviderStatus = () => {
  const [contextStatus, setContextStatus] = React.useState({
    auth: false,
    user: false,
    practice: false,
    wellness: false,
    onboarding: false,
    content: false,
    analytics: false // ✅ ADDED: Analytics status
  });

  React.useEffect(() => {
    const checkContexts = () => {
      const status = {
        auth: false,
        user: false,
        practice: false,
        wellness: false,
        onboarding: false,
        content: false,
        analytics: false // ✅ ADDED: Analytics status
      };

      // Check if contexts are available
      try {
        require('./auth/AuthContext');
        status.auth = true;
      } catch {}

      try {
        require('./user/UserContext');
        status.user = true;
      } catch {}

      try {
        require('./practice/PracticeContext');
        status.practice = true;
      } catch {}

      try {
        require('./wellness/WellnessContext');
        status.wellness = true;
      } catch {}

      try {
        require('./onboarding/OnboardingContext');
        status.onboarding = true;
      } catch {}

      try {
        require('./content/ContentContext');
        status.content = true;
      } catch {}

      // ✅ ADDED: Check AnalyticsContext
      try {
        require('./analytics/AnalyticsContext');
        status.analytics = true;
      } catch {}

      setContextStatus(status);
    };

    checkContexts();
  }, []);

  return contextStatus;
};

// ================================
// PERFORMANCE MONITORING HOOK
// ================================
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    loadTime: 0,
    contextInitTime: 0,
    memoryUsage: 0
  });

  React.useEffect(() => {
    const startTime = performance.now();
    
    // Monitor context initialization time
    const contextStartTime = performance.now();
    Promise.resolve().then(() => {
      const contextEndTime = performance.now();
      setMetrics(prev => ({
        ...prev,
        contextInitTime: contextEndTime - contextStartTime,
        loadTime: contextEndTime - startTime
      }));
    });

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memoryInfo.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  return metrics;
};

// ================================
// DEVELOPMENT UTILITIES
// ================================
export const DevTools: React.FC = () => {
  const contextStatus = useProviderStatus();
  const performanceMetrics = usePerformanceMonitor();

  // Only return null after hooks have been called
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: '12px',
      zIndex: 10000,
      maxWidth: '200px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Context Status</div>
      {Object.entries(contextStatus).map(([context, status]) => (
        <div key={context} style={{ color: status ? '#4caf50' : '#f44336' }}>
          {context}: {status ? '✓' : '✗'}
        </div>
      ))}
      <div style={{ marginTop: '8px', fontWeight: 'bold' }}>Performance</div>
      <div>Load: {performanceMetrics.loadTime.toFixed(1)}ms</div>
      {performanceMetrics.memoryUsage > 0 && (
        <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB</div>
      )}
    </div>
  );
};

// ================================
// FIREBASE-ONLY ARCHITECTURE VALIDATOR
// ================================
export const useFirebaseArchitectureValidator = () => {
  const [validationStatus, setValidationStatus] = React.useState({
    isValid: false,
    warnings: [] as string[],
    suggestions: [] as string[]
  });

  React.useEffect(() => {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for localStorage usage in development
    if (process.env.NODE_ENV === 'development') {
      // Monitor for localStorage usage
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function(key: string, value: string) {
        if (key.includes('user') || key.includes('questionnaire') || key.includes('assessment') || key.includes('practice') || key.includes('wellness')) {
          warnings.push(`localStorage usage detected for key: ${key}`);
          suggestions.push(`Consider migrating ${key} to Firebase-only storage`);
        }
        return originalSetItem.call(this, key, value);
      };

      // Restore original function after validation
      setTimeout(() => {
        localStorage.setItem = originalSetItem;
      }, 5000);
    }

    const isValid = warnings.length === 0;
    
    setValidationStatus({
      isValid,
      warnings,
      suggestions
    });

    if (isValid) {
      console.log('✅ Firebase-only architecture validation passed');
    } else {
      console.warn('⚠️ Firebase architecture validation warnings:', warnings);
    }
  }, []);

  return validationStatus;
};

// ================================
// HAPPINESS CALCULATION DEBUGGING HOOK
// ================================
export const useHappinessDebugger = () => {
  const [debugInfo, setDebugInfo] = React.useState<{
    onboardingData: any;
    selfAssessmentData: any;
    practiceData: any;
    userProfileData: any;
    lastUpdate: string | null;
    dataFlow: string[];
  }>({
    onboardingData: null,
    selfAssessmentData: null,
    practiceData: null,
    userProfileData: null,
    lastUpdate: null,
    dataFlow: []
  });

  React.useEffect(() => {
    // Listen for happiness calculation events
    const handleHappinessEvent = (event: CustomEvent) => {
      setDebugInfo(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        dataFlow: [...prev.dataFlow.slice(-10), `${event.type}: ${JSON.stringify(event.detail)}`]
      }));
      console.log('🎯 Happiness calculation event:', event.type, event.detail);
    };

    const handleOnboardingUpdate = (event: CustomEvent) => {
      setDebugInfo(prev => ({
        ...prev,
        onboardingData: event.detail.data,
        lastUpdate: new Date().toISOString()
      }));
      console.log('🎯 Onboarding data updated for happiness calculation');
    };

    // Add event listeners
    window.addEventListener('triggerHappinessRecalculation', handleHappinessEvent as EventListener);
    window.addEventListener('onboardingUpdated', handleOnboardingUpdate as EventListener);
    window.addEventListener('selfAssessmentCompleted', handleOnboardingUpdate as EventListener);

    return () => {
      window.removeEventListener('triggerHappinessRecalculation', handleHappinessEvent as EventListener);
      window.removeEventListener('onboardingUpdated', handleOnboardingUpdate as EventListener);
      window.removeEventListener('selfAssessmentCompleted', handleOnboardingUpdate as EventListener);
    };
  }, []);

  return debugInfo;
};

// ================================
// ENHANCED DEVELOPMENT TOOLS
// ================================
export const EnhancedDevTools: React.FC = () => {
  const contextStatus = useProviderStatus();
  const performanceMetrics = usePerformanceMonitor();
  const architectureValidation = useFirebaseArchitectureValidator();
  const happinessDebugInfo = useHappinessDebugger();

  // Only return null after hooks have been called
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '11px',
      zIndex: 10000,
      maxWidth: '280px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      {/* Context Status */}
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#3498db' }}>🔧 Context Status</div>
      {Object.entries(contextStatus).map(([context, status]) => (
        <div key={context} style={{ color: status ? '#4caf50' : '#f44336', marginBottom: '2px' }}>
          {context}: {status ? '✓' : '✗'}
        </div>
      ))}
      
      {/* Performance Metrics */}
      <div style={{ fontWeight: 'bold', marginTop: '12px', marginBottom: '6px', color: '#e74c3c' }}>⚡ Performance</div>
      <div>Load: {performanceMetrics.loadTime.toFixed(1)}ms</div>
      {performanceMetrics.memoryUsage > 0 && (
        <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB</div>
      )}
      
      {/* Architecture Validation */}
      <div style={{ fontWeight: 'bold', marginTop: '12px', marginBottom: '6px', color: '#f39c12' }}>🔥 Firebase Architecture</div>
      <div style={{ color: architectureValidation.isValid ? '#4caf50' : '#f44336' }}>
        Status: {architectureValidation.isValid ? '✓ Valid' : '⚠️ Issues Found'}
      </div>
      {architectureValidation.warnings.length > 0 && (
        <div style={{ marginTop: '4px', fontSize: '10px', color: '#ffeb3b' }}>
          Warnings: {architectureValidation.warnings.length}
        </div>
      )}
      
      {/* Happiness Calculation Debug */}
      <div style={{ fontWeight: 'bold', marginTop: '12px', marginBottom: '6px', color: '#9b59b6' }}>😊 Happiness Debug</div>
      <div>Last Update: {happinessDebugInfo.lastUpdate ? new Date(happinessDebugInfo.lastUpdate).toLocaleTimeString() : 'None'}</div>
      <div>Data Events: {happinessDebugInfo.dataFlow.length}</div>
      {happinessDebugInfo.onboardingData && (
        <div style={{ color: '#4caf50' }}>✓ Onboarding Data Available</div>
      )}
    </div>
  );
};

// ================================
// EXPORT DEFAULT
// ================================
export default AppProvider;