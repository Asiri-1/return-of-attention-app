// src/contexts/practice/PracticeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext'
import { useUser } from '../user/UserContext';

// ================================
// PRACTICE SESSION INTERFACES
// ================================
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number;
  stageLabel?: string;
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'mid-day-reset' | 'work-home-transition' | 'evening-wind-down' | 'breathing-reset' | 'thought-labeling' | 'body-scan' | 'single-point-focus' | 'loving-kindness' | 'gratitude-moment' | 'mindful-transition' | 'stress-release';
  mindRecoveryPurpose?: 'energy-boost' | 'stress-relief' | 'mental-refresh' | 'transition-support' | 'sleep-preparation' | 'emotional-balance' | 'quick-reset' | 'awareness-anchor';
  rating?: number;
  notes?: string;
  presentPercentage?: number;
  environment?: {
    posture: string;
    location: string;
    lighting: string;
    sounds: string;
  };
  pahmCounts?: {
    present_attachment: number;
    present_neutral: number;
    present_aversion: number;
    past_attachment: number;
    past_neutral: number;
    past_aversion: number;
    future_attachment: number;
    future_neutral: number;
    future_aversion: number;
  };
  recoveryMetrics?: {
    stressReduction: number;
    energyLevel: number;
    clarityImprovement: number;
    moodImprovement: number;
  };
  metadata?: any;
}

interface PracticeStats {
  totalSessions: number;
  totalMinutes: number;
  averageQuality: number;
  averagePresentPercentage: number;
  currentStreak: number;
  longestStreak: number;
  totalMindRecoverySessions: number;
  totalMindRecoveryMinutes: number;
  averageMindRecoveryRating: number;
}

interface PracticeContextType {
  // Data
  sessions: PracticeSessionData[];
  isLoading: boolean;
  stats: PracticeStats;
  
  // Session management
  addPracticeSession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
  addMindRecoverySession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
  deletePracticeSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<PracticeSessionData>) => void;
  
  // Data retrieval
  getPracticeSessions: () => PracticeSessionData[];
  getMindRecoverySessions: () => PracticeSessionData[];
  getMeditationSessions: () => PracticeSessionData[];
  getSessionsByStage: (stage: number) => PracticeSessionData[];
  getSessionsByDateRange: (startDate: Date, endDate: Date) => PracticeSessionData[];
  getRecentSessions: (count: number) => PracticeSessionData[];
  
  // Stage progression
  getCurrentStage: () => number;
  getStageProgress: (stage: number) => { completed: number; total: number; percentage: number };
  canAdvanceToStage: (stage: number) => boolean;
  
  // Statistics
  calculateStats: () => PracticeStats;
  getSessionFrequency: () => { daily: number; weekly: number; monthly: number };
  getProgressTrend: () => 'improving' | 'stable' | 'declining';
  
  // Utility
  clearPracticeData: () => void;
  exportPracticeData: () => any;
  
  // Legacy compatibility
  getLegacyPracticeHistory: () => PracticeSessionData[];
  getLegacyMindRecoveryHistory: () => PracticeSessionData[];
}

// ================================
// CREATE CONTEXT
// ================================
const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

// ================================
// PRACTICE PROVIDER IMPLEMENTATION
// ================================
export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData } = useAuth();
  const { syncProfile } = useUser();
  const [sessions, setSessions] = useState<PracticeSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // STORAGE UTILITIES
  // ================================
  const getStorageKey = useCallback((): string => {
    return currentUser?.uid ? `practiceSessions_${currentUser.uid}` : 'practiceSessions';
  }, [currentUser?.uid]);

  const generateId = useCallback((prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ================================
  // SAVE TO STORAGE
  // ================================
  const saveToStorage = useCallback((sessionData: PracticeSessionData[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(sessionData));
      
      // Legacy compatibility
      if (currentUser) {
        localStorage.setItem('practiceHistory', JSON.stringify(sessionData));
        
        const mindRecoverySessions = sessionData.filter(s => s.sessionType === 'mind_recovery');
        localStorage.setItem('mindRecoveryHistory', JSON.stringify(mindRecoverySessions));
      }
      
      // Sync with auth if available
      if (currentUser && syncWithLocalData) {
        setTimeout(() => syncWithLocalData(), 100);
      }
    } catch (error) {
      console.warn('Failed to save practice data:', error);
    }
  }, [getStorageKey, currentUser, syncWithLocalData]);

  // ================================
  // LOAD FROM STORAGE
  // ================================
  const loadFromStorage = useCallback(() => {
    setIsLoading(true);
    
    try {
      const sessionData = localStorage.getItem(getStorageKey());
      
      if (sessionData) {
        const parsedSessions = JSON.parse(sessionData);
        setSessions(parsedSessions);
      } else {
        // Try to load from legacy storage
        const legacyData = localStorage.getItem('practiceHistory');
        if (legacyData) {
          const legacySessions = JSON.parse(legacyData);
          setSessions(legacySessions);
          saveToStorage(legacySessions);
        } else {
          setSessions([]);
        }
      }
    } catch (error) {
      console.warn('Failed to load practice data:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey, saveToStorage]);

  // ================================
  // CALCULATE STATISTICS
  // ================================
  const calculateStats = useCallback((): PracticeStats => {
    const allSessions = sessions;
    const mindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery');
    const meditationSessions = sessions.filter(s => s.sessionType === 'meditation');
    
    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageQuality = totalSessions > 0 ? 
      Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions) * 10) / 10 : 0;
    const averagePresentPercentage = totalSessions > 0 ?
      Math.round(allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / totalSessions) : 0;
    
    // Calculate streaks
    const sortedSessions = [...allSessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakCount = 0;
    let maxStreakCount = 0;
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreakCount) {
        currentStreakCount++;
        if (currentStreak === 0) currentStreak = currentStreakCount;
      } else if (daysDiff > currentStreakCount) {
        if (currentStreakCount > maxStreakCount) {
          maxStreakCount = currentStreakCount;
        }
        break;
      }
    }
    
    longestStreak = Math.max(maxStreakCount, currentStreak);
    
    // Mind recovery stats
    const totalMindRecoverySessions = mindRecoverySessions.length;
    const totalMindRecoveryMinutes = mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0);
    const averageMindRecoveryRating = totalMindRecoverySessions > 0 ?
      Math.round((mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalMindRecoverySessions) * 10) / 10 : 0;

    return {
      totalSessions,
      totalMinutes,
      averageQuality,
      averagePresentPercentage,
      currentStreak,
      longestStreak,
      totalMindRecoverySessions,
      totalMindRecoveryMinutes,
      averageMindRecoveryRating
    };
  }, [sessions]);

  // ================================
  // SESSION MANAGEMENT METHODS
  // ================================
  const addPracticeSession = useCallback((session: Omit<PracticeSessionData, 'sessionId'>) => {
    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session')
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    saveToStorage(updatedSessions);
    
    // Sync with user profile
    const newStats = calculateStats();
    syncProfile(newStats);
  }, [sessions, generateId, saveToStorage, calculateStats, syncProfile]);

  const addMindRecoverySession = useCallback((session: Omit<PracticeSessionData, 'sessionId'>) => {
    const mindRecoverySession: Omit<PracticeSessionData, 'sessionId'> = {
      ...session,
      sessionType: 'mind_recovery'
    };
    addPracticeSession(mindRecoverySession);
  }, [addPracticeSession]);

  const deletePracticeSession = useCallback((sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.sessionId !== sessionId);
    setSessions(updatedSessions);
    saveToStorage(updatedSessions);
    
    // Sync with user profile
    const newStats = calculateStats();
    syncProfile(newStats);
  }, [sessions, saveToStorage, calculateStats, syncProfile]);

  const updateSession = useCallback((sessionId: string, updates: Partial<PracticeSessionData>) => {
    const updatedSessions = sessions.map(session =>
      session.sessionId === sessionId ? { ...session, ...updates } : session
    );
    setSessions(updatedSessions);
    saveToStorage(updatedSessions);
  }, [sessions, saveToStorage]);

  // ================================
  // DATA RETRIEVAL METHODS
  // ================================
  const getPracticeSessions = useCallback((): PracticeSessionData[] => {
    return sessions;
  }, [sessions]);

  const getMindRecoverySessions = useCallback((): PracticeSessionData[] => {
    return sessions.filter(session => session.sessionType === 'mind_recovery');
  }, [sessions]);

  const getMeditationSessions = useCallback((): PracticeSessionData[] => {
    return sessions.filter(session => session.sessionType === 'meditation');
  }, [sessions]);

  const getSessionsByStage = useCallback((stage: number): PracticeSessionData[] => {
    return sessions.filter(session => session.stageLevel === stage);
  }, [sessions]);

  const getSessionsByDateRange = useCallback((startDate: Date, endDate: Date): PracticeSessionData[] => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }, [sessions]);

  const getRecentSessions = useCallback((count: number): PracticeSessionData[] => {
    return [...sessions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }, [sessions]);

  // ================================
  // STAGE PROGRESSION METHODS
  // ================================
  const getCurrentStage = useCallback((): number => {
    const meditationSessions = getMeditationSessions();
    if (meditationSessions.length === 0) return 1;
    
    // Determine stage based on session count and quality
    const totalSessions = meditationSessions.length;
    const avgQuality = meditationSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalSessions;
    
    if (totalSessions >= 50 && avgQuality >= 4.0) return 5;
    if (totalSessions >= 30 && avgQuality >= 3.5) return 4;
    if (totalSessions >= 15 && avgQuality >= 3.0) return 3;
    if (totalSessions >= 5 && avgQuality >= 2.5) return 2;
    return 1;
  }, [getMeditationSessions]);

  const getStageProgress = useCallback((stage: number): { completed: number; total: number; percentage: number } => {
    const stageSessions = getSessionsByStage(stage);
    const stageRequirements = {
      1: 5,
      2: 10,
      3: 15,
      4: 20,
      5: 25
    };
    
    const required = stageRequirements[stage as keyof typeof stageRequirements] || 10;
    const completed = stageSessions.length;
    const percentage = Math.min(Math.round((completed / required) * 100), 100);
    
    return { completed, total: required, percentage };
  }, [getSessionsByStage]);

  const canAdvanceToStage = useCallback((stage: number): boolean => {
    const currentStage = getCurrentStage();
    return stage <= currentStage + 1;
  }, [getCurrentStage]);

  // ================================
  // STATISTICS METHODS
  // ================================
  const getSessionFrequency = useCallback(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const daily = sessions.filter(s => new Date(s.timestamp) >= oneDayAgo).length;
    const weekly = sessions.filter(s => new Date(s.timestamp) >= oneWeekAgo).length;
    const monthly = sessions.filter(s => new Date(s.timestamp) >= oneMonthAgo).length;
    
    return { daily, weekly, monthly };
  }, [sessions]);

  const getProgressTrend = useCallback((): 'improving' | 'stable' | 'declining' => {
    if (sessions.length < 10) return 'stable';
    
    const recentSessions = sessions.slice(-5);
    const earlierSessions = sessions.slice(-10, -5);
    
    const recentAvg = recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length;
    const earlierAvg = earlierSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / earlierSessions.length;
    
    const difference = recentAvg - earlierAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }, [sessions]);

  // ================================
  // UTILITY METHODS
  // ================================
  const clearPracticeData = useCallback(() => {
    setSessions([]);
    
    try {
      localStorage.removeItem(getStorageKey());
      localStorage.removeItem('practiceHistory');
      localStorage.removeItem('mindRecoveryHistory');
    } catch (error) {
      console.warn('Failed to clear practice data:', error);
    }
    
    saveToStorage([]);
  }, [getStorageKey, saveToStorage]);

  const exportPracticeData = useCallback(() => {
    return {
      sessions: sessions,
      stats: calculateStats(),
      exportedAt: new Date().toISOString()
    };
  }, [sessions, calculateStats]);

  // ================================
  // LEGACY COMPATIBILITY
  // ================================
  const getLegacyPracticeHistory = useCallback((): PracticeSessionData[] => {
    return getPracticeSessions();
  }, [getPracticeSessions]);

  const getLegacyMindRecoveryHistory = useCallback((): PracticeSessionData[] => {
    return getMindRecoverySessions();
  }, [getMindRecoverySessions]);

  // ================================
  // COMPUTED VALUES
  // ================================
  const stats = useMemo(() => calculateStats(), [calculateStats]);

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Auto-sync with user profile when stats change
  useEffect(() => {
    if (sessions.length > 0) {
      syncProfile(stats);
    }
  }, [stats, sessions.length, syncProfile]);

  // ================================
  // CONTEXT VALUE
  // ================================
  const contextValue: PracticeContextType = useMemo(() => ({
    // Data
    sessions,
    isLoading,
    stats,
    
    // Session management
    addPracticeSession,
    addMindRecoverySession,
    deletePracticeSession,
    updateSession,
    
    // Data retrieval
    getPracticeSessions,
    getMindRecoverySessions,
    getMeditationSessions,
    getSessionsByStage,
    getSessionsByDateRange,
    getRecentSessions,
    
    // Stage progression
    getCurrentStage,
    getStageProgress,
    canAdvanceToStage,
    
    // Statistics
    calculateStats,
    getSessionFrequency,
    getProgressTrend,
    
    // Utility
    clearPracticeData,
    exportPracticeData,
    
    // Legacy compatibility
    getLegacyPracticeHistory,
    getLegacyMindRecoveryHistory
  }), [
    sessions, isLoading, stats,
    addPracticeSession, addMindRecoverySession, deletePracticeSession, updateSession,
    getPracticeSessions, getMindRecoverySessions, getMeditationSessions,
    getSessionsByStage, getSessionsByDateRange, getRecentSessions,
    getCurrentStage, getStageProgress, canAdvanceToStage,
    calculateStats, getSessionFrequency, getProgressTrend,
    clearPracticeData, exportPracticeData,
    getLegacyPracticeHistory, getLegacyMindRecoveryHistory
  ]);

  return (
    <PracticeContext.Provider value={contextValue}>
      {children}
    </PracticeContext.Provider>
  );
};

// ================================
// CUSTOM HOOK
// ================================
export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

export default PracticeContext;