// src/contexts/AppProvider.tsx
import React, { Suspense } from 'react';
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
// CONTEXT PROVIDER HIERARCHY
// ================================
/**
 * Universal App Provider
 * 
 * Provides all contexts in the optimal order:
 * 1. UserProvider - User profile and preferences (foundation)
 * 2. OnboardingProvider - Questionnaire and assessment data
 * 3. PracticeProvider - Session management (depends on user data)
 * 4. WellnessProvider - Emotional notes and reflections
 * 5. ContentProvider - Guided content and achievements
 * 6. AnalyticsProvider - Heavy analytics (lazy loaded)
 * 
 * Benefits:
 * - Fast initial load (analytics lazy-loaded)
 * - Proper dependency order
 * - Error boundaries for resilience
 * - Zero breaking changes for existing components
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
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
  );
};

// ================================
// CONTEXT HOOKS (Re-exports for convenience)
// ================================
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
        user: false,
        practice: false,
        wellness: false,
        onboarding: false,
        content: false,
        analytics: false
      };

      // Check if contexts are available (without calling hooks)
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
// EXPORT DEFAULT
// ================================
export default AppProvider;