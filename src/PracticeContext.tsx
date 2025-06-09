import React, { createContext, useState, useEffect, useContext } from 'react';

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
}

interface PracticeData {
  sessions: PracticeSession[];
  currentStreak: number;
  totalSessions: number;
  totalMinutes: number;
  positionStats: Position;
  lastPosition: string;
}

interface PracticeContextType {
  practiceData: PracticeData;
  addSession: (session: Omit<PracticeSession, 'id' | 'date'>) => void;
  updatePosition: (position: string) => void;
}

export const PracticeContext = createContext<PracticeContextType | null>(null);

// Practice data provider component
export const PracticeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [practiceData, setPracticeData] = useState<PracticeData>({
    sessions: [],
    currentStreak: 0,
    totalSessions: 0,
    totalMinutes: 0,
    positionStats: {
      present: 0,
      nostalgia: 0,
      past: 0,
      regret: 0,
      anticipation: 0,
      future: 0,
      worry: 0,
      attachment: 0,
      aversion: 0
    },
    lastPosition: 'present'
  });
  
  // Load practice data from local storage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem('practiceData');
    if (storedData) {
      try {
        setPracticeData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing stored practice data:', error);
      }
    }
  }, []);
  
  // Save practice data to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('practiceData', JSON.stringify(practiceData));
  }, [practiceData]);
  
  // Add a new practice session
  const addSession = (session: Omit<PracticeSession, 'id' | 'date'>) => {
    setPracticeData((prev: PracticeData) => {
      const newSessions = [...prev.sessions, {
        ...session,
        id: `session-${Date.now()}`,
        date: new Date().toISOString()
      }];
      
      // Calculate new stats
      const totalMinutes = prev.totalMinutes + session.duration;
      const totalSessions = prev.totalSessions + 1;
      
      // Update position stats
      const positionStats = { ...prev.positionStats };
      Object.keys(session.positions).forEach(position => {
        positionStats[position] = (positionStats[position] || 0) + session.positions[position];
      });
      
      // Calculate streak
      let currentStreak = prev.currentStreak;
      const today = new Date().setHours(0, 0, 0, 0);
      const lastSessionDate = prev.sessions.length > 0 
        ? new Date(prev.sessions[prev.sessions.length - 1].date).setHours(0, 0, 0, 0)
        : null;
      
      if (lastSessionDate === today) {
        // Already practiced today, streak unchanged
      } else if (!lastSessionDate || (today - lastSessionDate) <= 86400000) {
        // First session or consecutive day
        currentStreak += 1;
      } else {
        // Streak broken
        currentStreak = 1;
      }
      
      return {
        ...prev,
        sessions: newSessions,
        totalSessions,
        totalMinutes,
        positionStats,
        currentStreak,
        lastPosition: session.lastPosition || 'present'
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
  
  return (
    <PracticeContext.Provider value={{ 
      practiceData, 
      addSession,
      updatePosition
    }}>
      {children}
    </PracticeContext.Provider>
  );
};

// Hook for using practice context
export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};
