// This is a mock data service for the Return of the Attention app
// It provides dummy data for various components to use

// User data
export interface User {
  id: string;
  name: string;
  email: string;
  experienceLevel: string;
  practiceTime: number;
  frequency: string;
  goals: string[];
  joinDate: Date;
}

// Session data
export interface Session {
  id: string;
  userId: string;
  date: Date;
  duration: number;
  type: string;
  pahmScore: number;
  notes: string;
}

// Mock user data
export const getMockUser = (): User => {
  return {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    experienceLevel: 'intermediate',
    practiceTime: 15,
    frequency: 'daily',
    goals: ['stress-reduction', 'focus'],
    joinDate: new Date(2025, 0, 15)
  };
};

// Mock sessions data
export const getMockSessions = (): Session[] => {
  return [
    {
      id: 'session-1',
      userId: 'user-1',
      date: new Date(2025, 5, 1),
      duration: 15,
      type: 'standard',
      pahmScore: 8.2,
      notes: 'Felt calm and focused throughout the session.'
    },
    {
      id: 'session-2',
      userId: 'user-1',
      date: new Date(2025, 5, 2),
      duration: 10,
      type: 'short',
      pahmScore: 7.5,
      notes: 'Mind was wandering a bit today.'
    },
    {
      id: 'session-3',
      userId: 'user-1',
      date: new Date(2025, 5, 3),
      duration: 20,
      type: 'extended',
      pahmScore: 8.7,
      notes: 'Deep sense of presence in the second half.'
    }
  ];
};

// Mock progress data
export const getMockProgressData = () => {
  return {
    totalSessions: 24,
    totalMinutes: 390,
    currentStreak: 5,
    longestStreak: 12,
    averagePahmScore: 7.8,
    weeklyProgress: [
      { day: 'Mon', score: 7.2 },
      { day: 'Tue', score: 7.5 },
      { day: 'Wed', score: 8.1 },
      { day: 'Thu', score: 7.9 },
      { day: 'Fri', score: 8.3 },
      { day: 'Sat', score: 0 },
      { day: 'Sun', score: 8.0 }
    ]
  };
};

// Export default to make this a proper module
export default {
  getMockUser,
  getMockSessions,
  getMockProgressData
};
