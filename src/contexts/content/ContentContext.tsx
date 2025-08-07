// ✅ FIREBASE-ONLY ContentContext - No localStorage conflicts
// File: src/contexts/content/ContentContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// CONTENT DATA INTERFACES
// ================================
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'practice' | 'consistency' | 'milestone' | 'special';
  criteria: {
    type: 'session_count' | 'streak' | 'time' | 'quality' | 'stage' | 'special';
    target: number;
    description: string;
  };
  unlockedAt?: string;
  progress?: number;
  isUnlocked: boolean;
}

interface GuidedContent {
  id: string;
  title: string;
  description: string;
  type: 'guided_meditation' | 'breathing_exercise' | 'body_scan' | 'loving_kindness' | 'mindful_moment';
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  stage?: number;
  audioUrl?: string;
  scriptContent?: string;
  tags: string[];
  prerequisites?: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt?: string;
  rating?: number;
  notes?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor?: string;
  totalSessions: number;
  estimatedDuration: number; // total minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'foundations' | 'stress_relief' | 'sleep' | 'focus' | 'emotional_wellness';
  sessions: GuidedContent[];
  prerequisites?: string[];
  isEnrolled: boolean;
  enrolledAt?: string;
  progress: number; // 0-100
  completedSessions: string[];
}

interface ContentProgress {
  totalContentCompleted: number;
  totalTimeSpent: number;
  averageRating: number;
  completionsByType: { [key: string]: number };
  streakDays: number;
  favoriteContent: string[];
}

interface ContentContextType {
  // Data
  achievements: Achievement[];
  guidedContent: GuidedContent[];
  courses: Course[];
  contentProgress: ContentProgress;
  isLoading: boolean;
  
  // Achievement Management
  checkAndUnlockAchievements: (sessionData?: any) => string[];
  addCustomAchievement: (achievement: Omit<Achievement, 'id' | 'unlockedAt' | 'isUnlocked'>) => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementProgress: (achievementId: string) => number;
  
  // Guided Content Management
  getGuidedContent: (filters?: { type?: string; level?: string; stage?: number }) => GuidedContent[];
  markContentCompleted: (contentId: string, rating?: number, notes?: string) => void;
  getCompletedContent: () => GuidedContent[];
  getRecommendedContent: (userLevel?: string) => GuidedContent[];
  rateContent: (contentId: string, rating: number, notes?: string) => void;
  
  // Course Management
  getCourses: (filters?: { level?: string; category?: string }) => Course[];
  enrollInCourse: (courseId: string) => void;
  getEnrolledCourses: () => Course[];
  markSessionComplete: (courseId: string, sessionId: string) => void;
  getCourseProgress: (courseId: string) => number;
  
  // Content Discovery
  getContentByStage: (stage: number) => GuidedContent[];
  getContentByDuration: (maxMinutes: number) => GuidedContent[];
  getFavoriteContent: () => GuidedContent[];
  addToFavorites: (contentId: string) => void;
  removeFromFavorites: (contentId: string) => void;
  
  // Analytics
  getContentAnalytics: () => ContentProgress;
  getUsagePatterns: () => any;
  getPopularContent: () => GuidedContent[];
  
  // Utility
  clearContentData: () => void;
  exportContentData: () => any;
  syncContentProgress: (sessionData: any) => void;
  
  // Legacy Compatibility
  getAchievements: () => string[];
  addAchievement: (achievement: string) => void;
}

// ================================
// CREATE CONTEXT
// ================================
const ContentContext = createContext<ContentContextType | undefined>(undefined);

// ================================
// DEFAULT ACHIEVEMENTS
// ================================
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'journey_started',
    title: 'Journey Started',
    description: 'Welcome to your mindfulness journey!',
    icon: '🌟',
    category: 'milestone',
    criteria: { type: 'special', target: 1, description: 'Complete onboarding' },
    isUnlocked: true
  },
  {
    id: 'first_session',
    title: 'First Step',
    description: 'Complete your first meditation session',
    icon: '🧘',
    category: 'practice',
    criteria: { type: 'session_count', target: 1, description: 'Complete 1 session' },
    isUnlocked: false
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Practice for 7 consecutive days',
    icon: '⚔️',
    category: 'consistency',
    criteria: { type: 'streak', target: 7, description: 'Maintain 7-day streak' },
    isUnlocked: false
  },
  {
    id: 'session_master',
    title: 'Session Master',
    description: 'Complete 50 meditation sessions',
    icon: '🏆',
    category: 'practice',
    criteria: { type: 'session_count', target: 50, description: 'Complete 50 sessions' },
    isUnlocked: false
  },
  {
    id: 'time_keeper',
    title: 'Time Keeper',
    description: 'Accumulate 10 hours of practice',
    icon: '⏰',
    category: 'milestone',
    criteria: { type: 'time', target: 600, description: 'Practice for 10 hours total' },
    isUnlocked: false
  },
  {
    id: 'quality_seeker',
    title: 'Quality Seeker',
    description: 'Maintain average session rating of 4+',
    icon: '⭐',
    category: 'practice',
    criteria: { type: 'quality', target: 4, description: 'Average rating 4+' },
    isUnlocked: false
  },
  {
    id: 'stage_climber',
    title: 'Stage Climber',
    description: 'Advance to meditation stage 3',
    icon: '🏔️',
    category: 'milestone',
    criteria: { type: 'stage', target: 3, description: 'Reach stage 3' },
    isUnlocked: false
  },
  {
    id: 'month_marathon',
    title: 'Month Marathon',
    description: 'Practice for 30 consecutive days',
    icon: '🏃‍♂️',
    category: 'consistency',
    criteria: { type: 'streak', target: 30, description: 'Maintain 30-day streak' },
    isUnlocked: false
  },
  {
    id: 'mind_recovery_master',
    title: 'Mind Recovery Master',
    description: 'Complete 25 mind recovery sessions',
    icon: '🧠',
    category: 'special',
    criteria: { type: 'session_count', target: 25, description: 'Complete 25 mind recovery sessions' },
    isUnlocked: false
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Complete 100 total sessions',
    icon: '💯',
    category: 'milestone',
    criteria: { type: 'session_count', target: 100, description: 'Complete 100 sessions' },
    isUnlocked: false
  }
];

// ================================
// DEFAULT GUIDED CONTENT
// ================================
const DEFAULT_GUIDED_CONTENT: GuidedContent[] = [
  {
    id: 'breath_awareness_beginner',
    title: 'Basic Breath Awareness',
    description: 'Learn to focus on your breath',
    type: 'breathing_exercise',
    duration: 10,
    level: 'beginner',
    stage: 1,
    tags: ['breathing', 'foundation', 'calm'],
    isUnlocked: true,
    isCompleted: false
  },
  {
    id: 'body_scan_intro',
    title: 'Introduction to Body Scan',
    description: 'Explore bodily sensations with awareness',
    type: 'body_scan',
    duration: 15,
    level: 'beginner',
    stage: 1,
    tags: ['body_awareness', 'relaxation', 'mindfulness'],
    isUnlocked: true,
    isCompleted: false
  },
  {
    id: 'loving_kindness_basic',
    title: 'Basic Loving-Kindness',
    description: 'Cultivate compassion for self and others',
    type: 'loving_kindness',
    duration: 12,
    level: 'intermediate',
    stage: 2,
    tags: ['compassion', 'emotional_wellness', 'relationships'],
    prerequisites: ['breath_awareness_beginner'],
    isUnlocked: false,
    isCompleted: false
  },
  {
    id: 'stress_release_quick',
    title: 'Quick Stress Release',
    description: '5-minute stress relief practice',
    type: 'mindful_moment',
    duration: 5,
    level: 'beginner',
    tags: ['stress_relief', 'quick', 'workplace'],
    isUnlocked: true,
    isCompleted: false
  }
];

// ================================
// FIREBASE-ONLY CONTENT PROVIDER
// ================================
export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(DEFAULT_ACHIEVEMENTS);
  const [guidedContent, setGuidedContent] = useState<GuidedContent[]>(DEFAULT_GUIDED_CONTENT);
  const [courses, setCourses] = useState<Course[]>([]);
  const [contentProgress, setContentProgress] = useState<ContentProgress>({
    totalContentCompleted: 0,
    totalTimeSpent: 0,
    averageRating: 0,
    completionsByType: {},
    streakDays: 0,
    favoriteContent: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // FIREBASE-ONLY: Data persistence
  // ================================
  const saveToFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    try {
      const contentDoc = {
        achievements,
        guidedContent,
        courses,
        contentProgress,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userContent', currentUser.uid), contentDoc);
      console.log(`✅ Content data saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save content data to Firebase:', error);
    }
  }, [currentUser?.uid, achievements, guidedContent, courses, contentProgress]);

  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    setIsLoading(true);
    
    try {
      const contentDocRef = doc(db, 'userContent', currentUser.uid);
      const contentDoc = await getDoc(contentDocRef);
      
      if (contentDoc.exists()) {
        const data = contentDoc.data();
        
        // Load saved data
        if (data.achievements) setAchievements(data.achievements);
        if (data.guidedContent) setGuidedContent(data.guidedContent);
        if (data.courses) setCourses(data.courses);
        if (data.contentProgress) setContentProgress(data.contentProgress);
        
        console.log(`📦 Content data loaded from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      } else {
        // Initialize new user with defaults
        console.log(`🆕 Initializing default content for new user ${currentUser.uid.substring(0, 8)}...`);
        await saveToFirebase();
      }
    } catch (error) {
      console.error('❌ Failed to load content data from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  // ================================
  // 🔧 FIXED: LOAD DATA ON USER CHANGE (NO INFINITE LOOP)
  // ================================
  useEffect(() => {
    if (currentUser?.uid) {
      loadFromFirebase();
    } else {
      // Reset to defaults when no user
      setAchievements(DEFAULT_ACHIEVEMENTS);
      setGuidedContent(DEFAULT_GUIDED_CONTENT);
      setCourses([]);
      setContentProgress({
        totalContentCompleted: 0,
        totalTimeSpent: 0,
        averageRating: 0,
        completionsByType: {},
        streakDays: 0,
        favoriteContent: []
      });
    }
  }, [currentUser?.uid]); // ✅ FIXED: Only depend on currentUser?.uid

  // ================================
  // 🔧 FIXED: AUTO-SAVE TO FIREBASE (DEBOUNCED, NO INFINITE LOOP)
  // ================================
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // ✅ DEBOUNCE: Only save after changes stop for 2 seconds
    const saveTimer = setTimeout(() => {
      console.log('💾 Auto-saving content data to Firebase...');
      saveToFirebase().catch(error => {
        console.error('❌ Auto-save failed:', error);
      });
    }, 2000);
    
    return () => {
      clearTimeout(saveTimer);
    };
  }, [achievements, guidedContent, courses, contentProgress]); // ✅ FIXED: Removed saveToFirebase from dependencies

  // ================================
  // ACHIEVEMENT MANAGEMENT
  // ================================
  const checkAndUnlockAchievements = useCallback((sessionData?: any): string[] => {
    if (!sessionData) return [];
    
    const newlyUnlocked: string[] = [];
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.isUnlocked) return achievement;
      
      let shouldUnlock = false;
      const { criteria } = achievement;
      
      switch (criteria.type) {
        case 'session_count':
          shouldUnlock = sessionData.totalSessions >= criteria.target;
          break;
        case 'streak':
          shouldUnlock = sessionData.currentStreak >= criteria.target;
          break;
        case 'time':
          shouldUnlock = sessionData.totalMinutes >= criteria.target;
          break;
        case 'quality':
          shouldUnlock = sessionData.averageQuality >= criteria.target;
          break;
        case 'stage':
          shouldUnlock = sessionData.currentStage >= criteria.target;
          break;
        default:
          break;
      }
      
      if (shouldUnlock) {
        newlyUnlocked.push(achievement.id);
        return {
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          progress: 100
        };
      }
      
      // Update progress for locked achievements
      let progress = 0;
      switch (criteria.type) {
        case 'session_count':
          progress = Math.min((sessionData.totalSessions / criteria.target) * 100, 100);
          break;
        case 'streak':
          progress = Math.min((sessionData.currentStreak / criteria.target) * 100, 100);
          break;
        case 'time':
          progress = Math.min((sessionData.totalMinutes / criteria.target) * 100, 100);
          break;
        case 'quality':
          progress = Math.min((sessionData.averageQuality / criteria.target) * 100, 100);
          break;
        case 'stage':
          progress = Math.min((sessionData.currentStage / criteria.target) * 100, 100);
          break;
        default:
          break;
      }
      
      return { ...achievement, progress: Math.round(progress) };
    });
    
    setAchievements(updatedAchievements);
    return newlyUnlocked;
  }, [achievements]);

  const addCustomAchievement = useCallback((achievement: Omit<Achievement, 'id' | 'unlockedAt' | 'isUnlocked'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: `custom_${Date.now()}`,
      isUnlocked: true,
      unlockedAt: new Date().toISOString()
    };
    
    setAchievements(prev => [...prev, newAchievement]);
  }, []);

  const getUnlockedAchievements = useCallback((): Achievement[] => {
    return achievements.filter(a => a.isUnlocked);
  }, [achievements]);

  const getLockedAchievements = useCallback((): Achievement[] => {
    return achievements.filter(a => !a.isUnlocked);
  }, [achievements]);

  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement?.progress || 0;
  }, [achievements]);

  // ================================
  // GUIDED CONTENT MANAGEMENT
  // ================================
  const getGuidedContent = useCallback((filters?: { type?: string; level?: string; stage?: number }): GuidedContent[] => {
    let filtered = guidedContent.filter(content => content.isUnlocked);
    
    if (filters?.type) {
      filtered = filtered.filter(content => content.type === filters.type);
    }
    if (filters?.level) {
      filtered = filtered.filter(content => content.level === filters.level);
    }
    if (filters?.stage) {
      filtered = filtered.filter(content => content.stage === filters.stage);
    }
    
    return filtered;
  }, [guidedContent]);

  const markContentCompleted = useCallback((contentId: string, rating?: number, notes?: string) => {
    const updatedContent = guidedContent.map(content =>
      content.id === contentId ? {
        ...content,
        isCompleted: true,
        completedAt: new Date().toISOString(),
        rating,
        notes
      } : content
    );
    
    setGuidedContent(updatedContent);
    
    // Update progress
    const completedContent = updatedContent.filter(c => c.isCompleted);
    const totalTime = completedContent.reduce((sum, c) => sum + c.duration, 0);
    const avgRating = completedContent.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / completedContent.filter(c => c.rating).length || 0;
    
    setContentProgress(prev => ({
      ...prev,
      totalContentCompleted: completedContent.length,
      totalTimeSpent: totalTime,
      averageRating: Math.round(avgRating * 10) / 10
    }));
  }, [guidedContent]);

  const getCompletedContent = useCallback((): GuidedContent[] => {
    return guidedContent.filter(content => content.isCompleted);
  }, [guidedContent]);

  const getRecommendedContent = useCallback((userLevel?: string): GuidedContent[] => {
    const level = userLevel || 'beginner';
    return guidedContent
      .filter(content => content.isUnlocked && !content.isCompleted)
      .filter(content => content.level === level || content.level === 'beginner')
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 5);
  }, [guidedContent]);

  const rateContent = useCallback((contentId: string, rating: number, notes?: string) => {
    const updatedContent = guidedContent.map(content =>
      content.id === contentId ? { ...content, rating, notes } : content
    );
    setGuidedContent(updatedContent);
  }, [guidedContent]);

  // ================================
  // CONTENT DISCOVERY
  // ================================
  const getContentByStage = useCallback((stage: number): GuidedContent[] => {
    return guidedContent.filter(content => content.stage === stage && content.isUnlocked);
  }, [guidedContent]);

  const getContentByDuration = useCallback((maxMinutes: number): GuidedContent[] => {
    return guidedContent.filter(content => content.duration <= maxMinutes && content.isUnlocked);
  }, [guidedContent]);

  const getFavoriteContent = useCallback((): GuidedContent[] => {
    return guidedContent.filter(content => contentProgress.favoriteContent.includes(content.id));
  }, [guidedContent, contentProgress.favoriteContent]);

  const addToFavorites = useCallback((contentId: string) => {
    setContentProgress(prev => ({
      ...prev,
      favoriteContent: [...prev.favoriteContent.filter(id => id !== contentId), contentId]
    }));
  }, []);

  const removeFromFavorites = useCallback((contentId: string) => {
    setContentProgress(prev => ({
      ...prev,
      favoriteContent: prev.favoriteContent.filter(id => id !== contentId)
    }));
  }, []);

  // ================================
  // COURSE MANAGEMENT
  // ================================
  const getCourses = useCallback((filters?: { level?: string; category?: string }): Course[] => {
    let filtered = courses;
    
    if (filters?.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }
    if (filters?.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }
    
    return filtered;
  }, [courses]);

  const enrollInCourse = useCallback((courseId: string) => {
    const updatedCourses = courses.map(course =>
      course.id === courseId ? {
        ...course,
        isEnrolled: true,
        enrolledAt: new Date().toISOString()
      } : course
    );
    setCourses(updatedCourses);
  }, [courses]);

  const getEnrolledCourses = useCallback((): Course[] => {
    return courses.filter(course => course.isEnrolled);
  }, [courses]);

  const markSessionComplete = useCallback((courseId: string, sessionId: string) => {
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        const completedSessions = [...course.completedSessions, sessionId];
        const progress = Math.round((completedSessions.length / course.totalSessions) * 100);
        return {
          ...course,
          completedSessions,
          progress
        };
      }
      return course;
    });
    setCourses(updatedCourses);
  }, [courses]);

  const getCourseProgress = useCallback((courseId: string): number => {
    const course = courses.find(c => c.id === courseId);
    return course?.progress || 0;
  }, [courses]);

  // ================================
  // ANALYTICS
  // ================================
  const getContentAnalytics = useCallback((): ContentProgress => {
    return contentProgress;
  }, [contentProgress]);

  const getUsagePatterns = useCallback(() => {
    const completedContent = getCompletedContent();
    const typeStats: { [key: string]: number } = {};
    
    completedContent.forEach(content => {
      typeStats[content.type] = (typeStats[content.type] || 0) + 1;
    });
    
    return {
      contentByType: typeStats,
      averageSessionLength: completedContent.length > 0 ? 
        completedContent.reduce((sum, c) => sum + c.duration, 0) / completedContent.length : 0,
      totalSessions: completedContent.length,
      favoriteTypes: Object.entries(typeStats).sort((a, b) => b[1] - a[1]).slice(0, 3)
    };
  }, [getCompletedContent]);

  const getPopularContent = useCallback((): GuidedContent[] => {
    return guidedContent
      .filter(content => content.rating && content.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [guidedContent]);

  // ================================
  // UTILITY METHODS
  // ================================
  const clearContentData = useCallback(async () => {
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setGuidedContent(DEFAULT_GUIDED_CONTENT);
    setCourses([]);
    setContentProgress({
      totalContentCompleted: 0,
      totalTimeSpent: 0,
      averageRating: 0,
      completionsByType: {},
      streakDays: 0,
      favoriteContent: []
    });
    
    // Clear Firebase data
    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'userContent', currentUser.uid), {
          achievements: DEFAULT_ACHIEVEMENTS,
          guidedContent: DEFAULT_GUIDED_CONTENT,
          courses: [],
          contentProgress: {
            totalContentCompleted: 0,
            totalTimeSpent: 0,
            averageRating: 0,
            completionsByType: {},
            streakDays: 0,
            favoriteContent: []
          },
          lastUpdated: serverTimestamp()
        });
        console.log(`🧹 Content data cleared in Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      } catch (error) {
        console.error('❌ Failed to clear content data in Firebase:', error);
      }
    }
  }, [currentUser?.uid]);

  const exportContentData = useCallback(() => {
    return {
      achievements: achievements,
      guidedContent: guidedContent,
      courses: courses,
      contentProgress: contentProgress,
      exportedAt: new Date().toISOString()
    };
  }, [achievements, guidedContent, courses, contentProgress]);

  const syncContentProgress = useCallback((sessionData: any) => {
    // This will be called by PracticeContext when sessions are updated
    const newlyUnlocked = checkAndUnlockAchievements(sessionData);
    return newlyUnlocked;
  }, [checkAndUnlockAchievements]);

  // ================================
  // LEGACY COMPATIBILITY
  // ================================
  const getAchievements = useCallback((): string[] => {
    return achievements.filter(a => a.isUnlocked).map(a => a.id);
  }, [achievements]);

  const addAchievement = useCallback((achievement: string) => {
    const existingAchievement = achievements.find(a => a.id === achievement);
    if (existingAchievement && !existingAchievement.isUnlocked) {
      const updatedAchievements = achievements.map(a =>
        a.id === achievement ? {
          ...a,
          isUnlocked: true,
          unlockedAt: new Date().toISOString()
        } : a
      );
      setAchievements(updatedAchievements);
    }
  }, [achievements]);

  // ================================
  // CONTEXT VALUE
  // ================================
  const contextValue: ContentContextType = useMemo(() => ({
    // Data
    achievements,
    guidedContent,
    courses,
    contentProgress,
    isLoading,
    
    // Achievement Management
    checkAndUnlockAchievements,
    addCustomAchievement,
    getUnlockedAchievements,
    getLockedAchievements,
    getAchievementProgress,
    
    // Guided Content Management
    getGuidedContent,
    markContentCompleted,
    getCompletedContent,
    getRecommendedContent,
    rateContent,
    
    // Course Management
    getCourses,
    enrollInCourse,
    getEnrolledCourses,
    markSessionComplete,
    getCourseProgress,
    
    // Content Discovery
    getContentByStage,
    getContentByDuration,
    getFavoriteContent,
    addToFavorites,
    removeFromFavorites,
    
    // Analytics
    getContentAnalytics,
    getUsagePatterns,
    getPopularContent,
    
    // Utility
    clearContentData,
    exportContentData,
    syncContentProgress,
    
    // Legacy Compatibility
    getAchievements,
    addAchievement
  }), [
    achievements, guidedContent, courses, contentProgress, isLoading,
    checkAndUnlockAchievements, addCustomAchievement, getUnlockedAchievements, getLockedAchievements, getAchievementProgress,
    getGuidedContent, markContentCompleted, getCompletedContent, getRecommendedContent, rateContent,
    getCourses, enrollInCourse, getEnrolledCourses, markSessionComplete, getCourseProgress,
    getContentByStage, getContentByDuration, getFavoriteContent, addToFavorites, removeFromFavorites,
    getContentAnalytics, getUsagePatterns, getPopularContent,
    clearContentData, exportContentData, syncContentProgress,
    getAchievements, addAchievement
  ]);

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

// ================================
// CUSTOM HOOK
// ================================
export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export default ContentContext;