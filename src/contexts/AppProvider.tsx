// ✅ COMPLETE AppProvider with AuthProvider Integration
// File: src/contexts/AppProvider.tsx

import React, { Suspense } from 'react';
import { AuthProvider } from './auth/AuthContext'; // ✅ CRITICAL: Added AuthProvider
import { UserProvider } from './user/UserContext';
import { PracticeProvider } from './practice/PracticeContext';
import { WellnessProvider } from './wellness/WellnessContext';
import { OnboardingProvider } from './onboarding/OnboardingContext';
import { ContentProvider } from './content/ContentContext';

// ================================
// LAZY LOAD ANALYTICS CONTEXT
// ================================
// Analytics is lazy-loaded to improve initial app performance
const AnalyticsProvider = React.lazy(() => import('./analytics/AnalyticsContext').then(module => ({
  default: module.AnalyticsProvider
})));

// ================================
// LOADING FALLBACK COMPONENT
// ================================
const AnalyticsLoadingFallback: React.FC = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#666',
    fontSize: '14px',
    zIndex: 9999
  }}>
    <div style={{
      width: '16px',
      height: '16px',
      border: '2px solid #e0e0e0',
      borderTop: '2px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    Loading insights...
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ================================
// ERROR BOUNDARY FOR ANALYTICS
// ================================
interface AnalyticsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AnalyticsErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AnalyticsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Analytics context failed to load:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Gracefully degrade - analytics features won't be available but app continues to work
      return this.props.children;
    }

    return this.props.children;
  }
}

// ================================
// FIREBASE-ONLY CONTEXT PROVIDER HIERARCHY
// ================================
/**
 * Complete Firebase-Only App Provider
 * 
 * Provides all contexts in the optimal order:
 * 1. AuthProvider - Firebase authentication (foundation)
 * 2. UserProvider - User profile and preferences (depends on auth)
 * 3. OnboardingProvider - Questionnaire and assessment data (depends on auth)
 * 4. PracticeProvider - Session management (depends on user and auth)
 * 5. WellnessProvider - Emotional notes and reflections (depends on auth)
 * 6. ContentProvider - Guided content and achievements (depends on auth)
 * 7. AnalyticsProvider - Heavy analytics (lazy loaded, depends on all others)
 * 
 * Benefits:
 * - Complete Firebase-only architecture
 * - Proper authentication flow
 * - Fast initial load (analytics lazy-loaded)
 * - Proper dependency order
 * - Error boundaries for resilience
 * - Zero breaking changes for existing components
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
                <AnalyticsErrorBoundary>
                  <Suspense fallback={<AnalyticsLoadingFallback />}>
                    <AnalyticsProvider>
                      {children}
                    </AnalyticsProvider>
                  </Suspense>
                </AnalyticsErrorBoundary>
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
export { useAuth } from './auth/AuthContext'; // ✅ ADDED: Export useAuth
export { useUser } from './user/UserContext';
export { usePractice } from './practice/PracticeContext';
export { useWellness } from './wellness/WellnessContext';
export { useOnboarding } from './onboarding/OnboardingContext';
export { useContent } from './content/ContentContext';

// ✅ FIXED: Simple direct export - no conditional hooks
export { useAnalytics } from './analytics/AnalyticsContext';

// ================================
// PROVIDER STATUS HOOK  
// ================================
// ✅ FIXED: No hooks called inside callbacks or conditionally
export const useProviderStatus = () => {
  const [contextStatus, setContextStatus] = React.useState({
    auth: false,
    user: false,
    practice: false,
    wellness: false,
    onboarding: false,
    content: false,
    analytics: false
  });

  React.useEffect(() => {
    // ✅ FIXED: Check context availability without calling hooks inside callbacks
    const checkContexts = () => {
      const status = {
        auth: false,
        user: false,
        practice: false,
        wellness: false,
        onboarding: false,
        content: false,
        analytics: false
      };

      // Check if contexts are available (without calling hooks)
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
// ✅ FIXED: No hooks called conditionally
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    loadTime: 0,
    contextInitTime: 0,
    analyticsLoadTime: 0,
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

    // Monitor analytics lazy loading
    const analyticsStartTime = performance.now();
    import('./analytics/AnalyticsContext').then(() => {
      const analyticsEndTime = performance.now();
      setMetrics(prev => ({
        ...prev,
        analyticsLoadTime: analyticsEndTime - analyticsStartTime
      }));
    }).catch(() => {
      // Analytics failed to load, but that's okay
    });
  }, []);

  return metrics;
};

// ================================
// DEVELOPMENT UTILITIES
// ================================
// ✅ FIXED: Always call hooks at the top level (no conditional hooks)
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
      <div>Analytics: {performanceMetrics.analyticsLoadTime.toFixed(1)}ms</div>
      {performanceMetrics.memoryUsage > 0 && (
        <div>Memory: {performanceMetrics.memoryUsage.toFixed(1)}MB</div>
      )}
    </div>
  );
};

// ================================
// FIREBASE-ONLY ARCHITECTURE VALIDATOR
// ================================
/**
 * Hook to validate that all contexts are using Firebase-only architecture
 * This helps ensure data consistency and prevents localStorage conflicts
 */
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
/**
 * Hook to help debug happiness calculation issues
 * Monitors data flow from all contexts to happiness calculation
 */
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
      <div>Analytics: {performanceMetrics.analyticsLoadTime.toFixed(1)}ms</div>
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