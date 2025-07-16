// ✅ Updated PracticeContext.tsx - Integrated with Progressive Onboarding
// File: src/PracticeContext.tsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Create a context for practice data
interface Position {
  [key: string]: number;
}

interface PracticeSession {
  id: string;
  date: string;
  duration: number;
  positions: Position;
  lastPosition?: string;
  rating?: number;
  reflectionData?: any;
  stage?: number;
  level?: string; // T1, T2, etc.
}

interface PracticeStats {
  totalSessions: number;
  totalTime: number;
  averageSession: number;
  longestSession: number;
  currentStreak: number;
  longestStreak: number;
  positionDistribution: Position;
  weeklyProgress: number[];
  monthlyProgress: number[];
}

interface PracticeContextType {
  sessions: PracticeSession[];
  stats: PracticeStats;
  addSession: (sessionData: Omit<PracticeSession, 'id' | 'date'>) => void;
  getSessionsByStage: (stage: number) => PracticeSession[];
  getSessionsByLevel: (level: string) => PracticeSession[];
  updateSession: (id: string, updates: Partial<PracticeSession>) => void;
  deleteSession: (id: string) => void;
  calculateStats: () => PracticeStats;
  exportSessions: () => string;
  importSessions: (data: string) => boolean;
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

// ✅ Enhanced PracticeProvider with progressive onboarding integration
export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<PracticeStats>({
    totalSessions: 0,
    totalTime: 0,
    averageSession: 0,
    longestSession: 0,
    currentStreak: 0,
    longestStreak: 0,
    positionDistribution: {},
    weeklyProgress: [],
    monthlyProgress: []
  });

  // ✅ Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem('practice_sessions');
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions);
        setSessions(parsedSessions);
      }
    } catch (error) {
      console.error('Error loading practice sessions:', error);
    }
  }, []);

  // ✅ Generate unique session ID
  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // ✅ Calculate comprehensive statistics
  const calculateStats = useCallback((): PracticeStats => {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageSession: 0,
        longestSession: 0,
        currentStreak: 0,
        longestStreak: 0,
        positionDistribution: {},
        weeklyProgress: [],
        monthlyProgress: []
      };
    }

    // Basic stats
    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSession = totalTime / totalSessions;
    const longestSession = Math.max(...sessions.map(session => session.duration));

    // Position distribution (for PAHM stages)
    const positionDistribution: Position = {};
    sessions.forEach(session => {
      Object.entries(session.positions).forEach(([position, time]) => {
        positionDistribution[position] = (positionDistribution[position] || 0) + time;
      });
    });

    // Streak calculation
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const daysDiff = lastDate ? Math.abs((sessionDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      if (!lastDate || daysDiff <= 1) {
        tempStreak++;
        if (!lastDate) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        currentStreak = daysDiff <= 2 ? tempStreak : 0;
      }

      lastDate = sessionDate;
    });

    longestStreak = Math.max(longestStreak, tempStreak);

    // Weekly progress (last 7 days)
    const weeklyProgress: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTotal = sessions
        .filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= dayStart && sessionDate <= dayEnd;
        })
        .reduce((sum, session) => sum + session.duration, 0);
      
      weeklyProgress.push(dayTotal);
    }

    // Monthly progress (last 30 days)
    const monthlyProgress: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayTotal = sessions
        .filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= dayStart && sessionDate <= dayEnd;
        })
        .reduce((sum, session) => sum + session.duration, 0);
      
      monthlyProgress.push(dayTotal);
    }

    return {
      totalSessions,
      totalTime,
      averageSession,
      longestSession,
      currentStreak,
      longestStreak,
      positionDistribution,
      weeklyProgress,
      monthlyProgress
    };
  }, [sessions]);

  // ✅ Save sessions to localStorage when sessions change
  useEffect(() => {
    try {
      localStorage.setItem('practice_sessions', JSON.stringify(sessions));
      const newStats = calculateStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error saving practice sessions:', error);
    }
  }, [sessions, calculateStats]);

  // ✅ Add new session with progressive onboarding integration
  const addSession = (sessionData: Omit<PracticeSession, 'id' | 'date'>) => {
    const newSession: PracticeSession = {
      ...sessionData,
      id: generateSessionId(),
      date: new Date().toISOString()
    };

    setSessions(prev => [...prev, newSession]);

    // ✅ INTEGRATION: Update progressive onboarding system
    if (sessionData.stage === 1 && sessionData.level) {
      // For T-stages, update the specific T-stage sessions
      const tStageKey = `${sessionData.level.toLowerCase()}Sessions`;
      const existingSessions = JSON.parse(localStorage.getItem(tStageKey) || '[]');
      existingSessions.push({
        ...sessionData,
        id: newSession.id,
        date: newSession.date,
        isCompleted: true
      });
      localStorage.setItem(tStageKey, JSON.stringify(existingSessions));

      // Check if T-stage is complete (3 sessions)
      const completedSessions = existingSessions.filter((s: any) => s.isCompleted).length;
      if (completedSessions >= 3) {
        localStorage.setItem(`${sessionData.level.toLowerCase()}Complete`, 'true');
      }
    } else if (sessionData.stage && sessionData.stage >= 2) {
      // For PAHM stages, update hours
      const stageKey = `stage${sessionData.stage}Hours`;
      const currentHours = parseFloat(localStorage.getItem(stageKey) || '0');
      const sessionHours = sessionData.duration / 60;
      const newTotal = currentHours + sessionHours;
      localStorage.setItem(stageKey, newTotal.toString());

      // Check if PAHM stage is complete (15 hours)
      if (newTotal >= 15) {
        localStorage.setItem(`stage${sessionData.stage}Complete`, 'true');
      }
    }

    console.log('✅ Session added and integrated with progressive onboarding:', newSession);
  };

  // ✅ Get sessions by stage
  const getSessionsByStage = (stage: number): PracticeSession[] => {
    return sessions.filter(session => session.stage === stage);
  };

  // ✅ Get sessions by level (T1, T2, etc.)
  const getSessionsByLevel = (level: string): PracticeSession[] => {
    return sessions.filter(session => session.level === level);
  };

  // ✅ Update existing session
  const updateSession = (id: string, updates: Partial<PracticeSession>) => {
    setSessions(prev => prev.map(session => 
      session.id === id ? { ...session, ...updates } : session
    ));
  };

  // ✅ Delete session
  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(session => session.id !== id));
  };

  // ✅ Export sessions as JSON
  const exportSessions = (): string => {
    return JSON.stringify({
      sessions,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  };

  // ✅ Import sessions from JSON
  const importSessions = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        setSessions(parsed.sessions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing sessions:', error);
      return false;
    }
  };

  // ✅ Context value with all functions
  const contextValue: PracticeContextType = {
    sessions,
    stats,
    addSession,
    getSessionsByStage,
    getSessionsByLevel,
    updateSession,
    deleteSession,
    calculateStats,
    exportSessions,
    importSessions
  };

  return (
    <PracticeContext.Provider value={contextValue}>
      {children}
    </PracticeContext.Provider>
  );
};