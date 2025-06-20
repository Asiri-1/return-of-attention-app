// src/services/LocalStorageManager.ts
import {
    ComprehensiveUserData,
    DetailedSession,
    DailyEmotionalNote,
    MindRecoverySession,
    PostPracticeReflection,
    ChatbotConversation,
    UserProfile
  } from '../types/userDataTypes';
  
  export class LocalStorageManager {
    private static readonly STORAGE_KEYS = {
      USER_PROFILE: 'meditation_user_profile',
      PRACTICE_SESSIONS: 'meditation_practice_sessions',
      DAILY_NOTES: 'meditation_daily_notes',
      RECOVERY_SESSIONS: 'meditation_recovery_sessions',
      REFLECTIONS: 'meditation_reflections',
      CHATBOT_CONVERSATIONS: 'meditation_chatbot_conversations',
      ANALYTICS_CACHE: 'meditation_analytics_cache',
      COMPLETE_DATA: 'meditation_complete_data'
    };
  
    // Generic storage methods with error handling
    private static setItem(key: string, value: any): boolean {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error(`Error saving to localStorage for key ${key}:`, error);
        return false;
      }
    }
  
    private static getItem<T>(key: string, defaultValue: T): T {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return defaultValue;
      }
    }
  
    // Initialize user data structure
    static initializeUserData(userId: string, basicInfo: Partial<UserProfile>): boolean {
      const defaultProfile: UserProfile = {
        userId,
        email: basicInfo.email || '',
        displayName: basicInfo.displayName || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        demographics: {
          age: '',
          gender: '',
          nationality: '',
          countryResidence: '',
          maritalStatus: '',
          children: '',
          occupation: '',
          livingArrangement: ''
        },
        healthProfile: {
          workStressLevel: 5,
          financialSituation: '',
          physicalHealth: 5,
          sleepQuality: 5,
          dailyChallenges: []
        },
        meditationProfile: {
          primaryMotivations: [],
          specificGoals: [],
          experienceLevel: 'beginner',
          preferredTimes: [],
          challengeAreas: []
        },
        currentProgress: {
          currentStage: 1,
          currentTLevel: 'T1',
          completedStages: [],
          completedTLevels: [],
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastPracticeDate: ''
        },
        preferences: {
          sessionDuration: 20,
          reminderTimes: [],
          guidanceStyle: 'gentle',
          feedbackPreference: 'detailed',
          privacySettings: {
            shareProgress: false,
            dataAnalytics: true
          }
        }
      };
  
      const completeData: ComprehensiveUserData = {
        profile: { ...defaultProfile, ...basicInfo },
        practiceSessions: [],
        dailyEmotionalNotes: [],
        mindRecoverySession: [],
        practiceReflections: [],
        chatbotConversations: [],
        analyticsCache: {
          lastCalculated: new Date().toISOString(),
          trends: {
            presentPercentageTrend: [],
            moodImprovementTrend: [],
            stressReductionTrend: [],
            consistencyScore: 0
          },
          insights: {
            optimalPracticeTime: '',
            mostEffectiveDuration: 20,
            emotionalPatterns: [],
            progressPredictions: []
          },
          personalityProfile: {
            meditationPersonalityType: 'seeker',
            learningStyle: 'balanced',
            motivationDrivers: [],
            challengePatterns: []
          }
        }
      };
  
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, completeData);
    }
  
    // Get complete user data
    static getCompleteUserData(): ComprehensiveUserData | null {
      const data = this.getItem<ComprehensiveUserData | null>(this.STORAGE_KEYS.COMPLETE_DATA, null);
      return data;
    }
  
    // Update user profile
    static updateUserProfile(profileUpdates: Partial<UserProfile>): boolean {
      const data = this.getCompleteUserData();
      if (!data) return false;
  
      data.profile = { ...data.profile, ...profileUpdates, lastLoginAt: new Date().toISOString() };
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
    }
  
    // Add practice session
    static addPracticeSession(sessionData: Omit<DetailedSession, 'sessionId' | 'timestamp'>): boolean {
      const data = this.getCompleteUserData();
      if (!data) return false;
  
      const session: DetailedSession = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...sessionData,
        calculatedMetrics: {
          moodImprovement: sessionData.postSession.mood - sessionData.preSession.mood,
          stressReduction: sessionData.preSession.stress - sessionData.postSession.stress,
          focusQuality: sessionData.presentPercentage / 10,
          consistencyScore: this.calculateConsistencyScore(data.practiceSessions)
        }
      };
  
      data.practiceSessions.push(session);
      
      // Update user progress
      data.profile.currentProgress.totalSessions += 1;
      data.profile.currentProgress.totalMinutes += session.duration;
      data.profile.currentProgress.lastPracticeDate = session.timestamp;
      
      // Update streak
      const streakInfo = this.calculateStreak(data.practiceSessions);
      data.profile.currentProgress.currentStreak = streakInfo.current;
      data.profile.currentProgress.longestStreak = Math.max(
        data.profile.currentProgress.longestStreak,
        streakInfo.current
      );
  
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
    }
  
    // Add daily emotional note
    static addDailyEmotionalNote(noteData: Omit<DailyEmotionalNote, 'noteId' | 'timestamp'>): boolean {
      const data = this.getCompleteUserData();
      if (!data) return false;
  
      const note: DailyEmotionalNote = {
        noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...noteData
      };
  
      // Remove any existing note for the same date
      data.dailyEmotionalNotes = data.dailyEmotionalNotes.filter(n => n.date !== note.date);
      data.dailyEmotionalNotes.push(note);
  
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
    }
  
    // Add mind recovery session
    static addMindRecoverySession(recoveryData: Omit<MindRecoverySession, 'recoveryId' | 'timestamp'>): boolean {
      const data = this.getCompleteUserData();
      if (!data) return false;
  
      const recovery: MindRecoverySession = {
        recoveryId: `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...recoveryData
      };
  
      data.mindRecoverySession.push(recovery);
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
    }
  
    // Add practice reflection
    static addPracticeReflection(reflectionData: Omit<PostPracticeReflection, 'reflectionId' | 'timestamp'>): boolean {
      const data = this.getCompleteUserData();
      if (!data) return false;
  
      const reflection: PostPracticeReflection = {
        reflectionId: `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...reflectionData
      };
  
      data.practiceReflections.push(reflection);
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
    }
  
    // Add chatbot conversation
    static addChatbotConversation(conversationData: Omit<ChatbotConversation, 'conversationId' | 'timestamp'>): boolean {
      const data = this.getCompleteUserData();
      if (!data) return false;
  
      const conversation: ChatbotConversation = {
        conversationId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...conversationData
      };
  
      data.chatbotConversations.push(conversation);
      return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
    }
  
    // Calculate consistency score
    private static calculateConsistencyScore(sessions: DetailedSession[]): number {
      if (sessions.length < 2) return 0;
      
      const last7Sessions = sessions.slice(-7);
      const dates = last7Sessions.map(s => new Date(s.timestamp).toDateString());
      const uniqueDates = new Set(dates);
      
      return (uniqueDates.size / 7) * 100; // Percentage of days practiced in last week
    }
  
    // Calculate streak
    private static calculateStreak(sessions: DetailedSession[]): { current: number; longest: number } {
      if (sessions.length === 0) return { current: 0, longest: 0 };
  
      const sortedSessions = sessions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const uniqueDates = Array.from(new Set(sortedSessions.map(s => new Date(s.timestamp).toDateString()))).sort();
  
      let currentStreak = 1;
      let longestStreak = 1;
      let tempStreak = 1;
  
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currentDate = new Date(uniqueDates[i]);
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
  
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
  
      longestStreak = Math.max(longestStreak, tempStreak);
  
      // Calculate current streak from most recent date
      const today = new Date();
      const mostRecentDate = new Date(uniqueDates[uniqueDates.length - 1]);
      const daysSinceLastPractice = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  
      if (daysSinceLastPractice <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
  
      return { current: currentStreak, longest: longestStreak };
    }
  
    // Get analytics data
    static getAnalyticsData(): any {
      const data = this.getCompleteUserData();
      if (!data) return null;
  
      const sessions = data.practiceSessions;
      const notes = data.dailyEmotionalNotes;
  
      return {
        // Basic stats
        totalSessions: sessions.length,
        totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
        averageSessionLength: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0,
        currentStreak: data.profile.currentProgress.currentStreak,
        
        // Trends
        presentPercentageTrend: sessions.slice(-10).map(s => s.presentPercentage),
        moodImprovementTrend: sessions.slice(-10).map(s => s.calculatedMetrics.moodImprovement),
        stressReductionTrend: sessions.slice(-10).map(s => s.calculatedMetrics.stressReduction),
        
        // Recent data
        recentSessions: sessions.slice(-5).reverse(),
        recentNotes: notes.slice(-5).reverse(),
        
        // Emotional patterns
        emotionalDistribution: this.getEmotionalDistribution(notes),
        
        // Practice patterns
        practiceTimeDistribution: this.getPracticeTimeDistribution(sessions),
        durationPreferences: this.getDurationPreferences(sessions)
      };
    }
  
    private static getEmotionalDistribution(notes: DailyEmotionalNote[]) {
      const emotions: { [key: string]: number } = {};
      notes.forEach(note => {
        note.emotionalAwareness.emotionsIdentified.forEach(emotion => {
          emotions[emotion.emotion] = (emotions[emotion.emotion] || 0) + 1;
        });
      });
      return emotions;
    }
  
    private static getPracticeTimeDistribution(sessions: DetailedSession[]) {
      const times: { [key: string]: number } = {};
      sessions.forEach(session => {
        times[session.environment.timeOfDay] = (times[session.environment.timeOfDay] || 0) + 1;
      });
      return times;
    }
  
    private static getDurationPreferences(sessions: DetailedSession[]) {
      const durations = sessions.map(s => s.duration);
      return {
        average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        most_common: this.getMostCommon(durations),
        range: { min: Math.min(...durations), max: Math.max(...durations) }
      };
    }
  
    private static getMostCommon(arr: number[]): number {
      const counts: { [key: number]: number } = {};
      arr.forEach(item => counts[item] = (counts[item] || 0) + 1);
      return parseInt(Object.keys(counts).reduce((a, b) => counts[parseInt(a)] > counts[parseInt(b)] ? a : b));
    }
  
    // Export data for backup
    static exportAllData(): string {
      const data = this.getCompleteUserData();
      return JSON.stringify(data, null, 2);
    }
  
    // Import data from backup
    static importData(jsonData: string): boolean {
      try {
        const data = JSON.parse(jsonData);
        return this.setItem(this.STORAGE_KEYS.COMPLETE_DATA, data);
      } catch (error) {
        console.error('Error importing data:', error);
        return false;
      }
    }
  
    // Clear all data
    static clearAllData(): boolean {
      try {
        Object.values(this.STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        return true;
      } catch (error) {
        console.error('Error clearing data:', error);
        return false;
      }
    }
  
    // Get data size
    static getDataSize(): { used: string; remaining: string } {
      const used = new Blob([this.exportAllData()]).size;
      const remaining = 5 * 1024 * 1024 - used; // 5MB localStorage limit
      
      return {
        used: `${(used / 1024).toFixed(2)} KB`,
        remaining: `${(remaining / 1024).toFixed(2)} KB`
      };
    }
  }