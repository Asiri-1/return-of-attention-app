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

// Analytics hook with error handling
export const useAnalytics = () => {
  try {
    // Dynamic import of the analytics hook
    const { useAnalytics } = require('./analytics/AnalyticsContext');
    return useAnalytics();
  } catch (error) {
    console.warn('Analytics context not available:', error);
    // Return a fallback object with placeholder methods
    return {
      isLoading: false,
      lastUpdated: null,
      getPAHMData: () => null,
      getEnvironmentData: () => ({ posture: [], location: [], lighting: [], sounds: [], optimalConditions: {} }),
      getMindRecoveryAnalytics: () => ({ 
        totalMindRecoverySessions: 0, 
        totalMindRecoveryMinutes: 0,
        avgMindRecoveryRating: 0,
        avgMindRecoveryDuration: 0,
        contextStats: [],
        purposeStats: [],
        recommendations: [],
        timePatterns: { morningEffectiveness: 0, afternoonEffectiveness: 0, eveningEffectiveness: 0, optimalTime: 'Unknown' }
      }),
      getComprehensiveAnalytics: () => ({ overview: {}, detailed: {}, insights: {}, predictions: {} }),
      getFilteredData: () => ({ practice: [], notes: [] }),
      getPracticeDurationData: () => [],
      getEmotionDistribution: () => [],
      getPracticeDistribution: () => [],
      getAppUsagePatterns: () => ({}),
      getEngagementMetrics: () => ({}),
      getFeatureUtilization: () => [],
      getProgressTrends: () => ({}),
      getPredictiveInsights: () => ({}),
      getPersonalizedRecommendations: () => [],
      getOptimalPracticeConditions: () => ({}),
      getComprehensiveStats: () => ({}),
      get9CategoryPAHMInsights: () => null,
      getMindRecoveryInsights: () => ({ 
        totalMindRecoverySessions: 0, 
        totalMindRecoveryMinutes: 0,
        avgMindRecoveryRating: 0,
        avgMindRecoveryDuration: 0,
        contextStats: [],
        purposeStats: [],
        recommendations: [],
        timePatterns: { morningEffectiveness: 0, afternoonEffectiveness: 0, eveningEffectiveness: 0, optimalTime: 'Unknown' }
      }),
      getDashboardAnalytics: () => ({ 
        practiceDurationData: [], 
        emotionDistribution: [], 
        practiceDistribution: [],
        appUsagePatterns: {},
        engagementMetrics: {},
        featureUtilization: []
      }),
      exportDataForAnalysis: () => ({}),
      generateInsightsReport: () => ({}),
      refreshAnalytics: () => {},
      clearAnalyticsCache: () => {}
    };
  }
};

// ================================
// PROVIDER STATUS HOOK
// ================================
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
    // Check which contexts are available
    try {
      const { useUser } = require('./user/UserContext');
      useUser();
      setContextStatus(prev => ({ ...prev, user: true }));
    } catch {} // silently fail

    try {
      const { usePractice } = require('./practice/PracticeContext');
      usePractice();
      setContextStatus(prev => ({ ...prev, practice: true }));
    } catch {} // silently fail

    try {
      const { useWellness } = require('./wellness/WellnessContext');
      useWellness();
      setContextStatus(prev => ({ ...prev, wellness: true }));
    } catch {} // silently fail

    try {
      const { useOnboarding } = require('./onboarding/OnboardingContext');
      useOnboarding();
      setContextStatus(prev => ({ ...prev, onboarding: true }));
    } catch {} // silently fail

    try {
      const { useContent } = require('./content/ContentContext');
      useContent();
      setContextStatus(prev => ({ ...prev, content: true }));
    } catch {} // silently fail

    try {
      const { useAnalytics } = require('./analytics/AnalyticsContext');
      useAnalytics();
      setContextStatus(prev => ({ ...prev, analytics: true }));
    } catch {} // silently fail
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
export const DevTools: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  const contextStatus = useProviderStatus();
  const performance = usePerformanceMonitor();

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
      <div>Load: {performance.loadTime.toFixed(1)}ms</div>
      <div>Analytics: {performance.analyticsLoadTime.toFixed(1)}ms</div>
      {performance.memoryUsage > 0 && (
        <div>Memory: {performance.memoryUsage.toFixed(1)}MB</div>
      )}
    </div>
  );
};

// ================================
// EXPORT DEFAULT
// ================================
export default AppProvider;