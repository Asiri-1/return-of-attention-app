// src/contexts/wellness/WellnessContext.tsx
// ✅ COMPLETE Working WellnessContext Implementation

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// ================================
// TYPES & INTERFACES
// ================================

export interface EmotionalNoteData {
  noteId: string;
  content: string;
  emotion: string;
  intensity: number;
  timestamp: string;
  tags?: string[];
  mood?: string;
  triggers?: string[];
  date: string;
}

export interface ReflectionData {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  tags?: string[];
  mood?: string;
  insights?: string[];
}

export interface WellnessContextType {
  // Data
  emotionalNotes: EmotionalNoteData[];
  reflections: ReflectionData[];
  isLoading: boolean;
  
  // Emotional Notes Management
  addEmotionalNote: (note: Omit<EmotionalNoteData, 'noteId' | 'timestamp' | 'date'>) => void;
  updateEmotionalNote: (noteId: string, updates: Partial<EmotionalNoteData>) => void;
  deleteEmotionalNote: (noteId: string) => void;
  getEmotionalNotesByDate: (date: string) => EmotionalNoteData[];
  getEmotionalNotesByEmotion: (emotion: string) => EmotionalNoteData[];
  
  // Reflections Management
  addReflection: (reflection: Omit<ReflectionData, 'id' | 'timestamp'>) => void;
  updateReflection: (id: string, updates: Partial<ReflectionData>) => void;
  deleteReflection: (id: string) => void;
  getReflectionsByType: (type: string) => ReflectionData[];
  getReflectionsByDateRange: (startDate: string, endDate: string) => ReflectionData[];
  
  // Data Retrieval
  getDailyEmotionalNotes: () => EmotionalNoteData[];
  getReflections: () => ReflectionData[];
  getRecentNotes: (days?: number) => EmotionalNoteData[];
  getRecentReflections: (days?: number) => ReflectionData[];
  
  // Analytics & Insights
  getEmotionInsights: (period: string) => any;
  getMoodTrends: () => any;
  getGratitudePractice: () => any;
  getEnergyPatterns: () => any;
  
  // Wellness Scoring
  calculateWellnessScore: () => number;
  getWellnessRecommendations: () => string[];
  
  // Utility
  clearWellnessData: () => void;
  exportWellnessData: () => any;
  getLegacyEmotionalNotes: () => EmotionalNoteData[];
}

// ================================
// CONTEXT CREATION
// ================================

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const useWellness = (): WellnessContextType => {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};

// ================================
// PROVIDER COMPONENT
// ================================

interface WellnessProviderProps {
  children: ReactNode;
}

export const WellnessProvider: React.FC<WellnessProviderProps> = ({ children }) => {
  // ================================
  // STATE
  // ================================
  const [emotionalNotes, setEmotionalNotes] = useState<EmotionalNoteData[]>([]);
  const [reflections, setReflections] = useState<ReflectionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // STORAGE HELPERS
  // ================================
  const getNotesStorageKey = useCallback(() => 'emotionalNotes', []);
  const getReflectionsStorageKey = useCallback(() => 'reflections', []);

  const saveToStorage = useCallback((notes: EmotionalNoteData[], reflectionsData: ReflectionData[]) => {
    try {
      localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
      localStorage.setItem(getReflectionsStorageKey(), JSON.stringify(reflectionsData));
    } catch (error) {
      console.error('Error saving wellness data to storage:', error);
    }
  }, [getNotesStorageKey, getReflectionsStorageKey]);

  const loadFromStorage = useCallback(() => {
    try {
      setIsLoading(true);
      
      const notesData = localStorage.getItem(getNotesStorageKey());
      const reflectionsData = localStorage.getItem(getReflectionsStorageKey());
      
      if (notesData) {
        const parsedNotes = JSON.parse(notesData);
        setEmotionalNotes(Array.isArray(parsedNotes) ? parsedNotes : []);
      }
      
      if (reflectionsData) {
        const parsedReflections = JSON.parse(reflectionsData);
        setReflections(Array.isArray(parsedReflections) ? parsedReflections : []);
      }
    } catch (error) {
      console.error('Error loading wellness data from storage:', error);
      setEmotionalNotes([]);
      setReflections([]);
    } finally {
      setIsLoading(false);
    }
  }, [getNotesStorageKey, getReflectionsStorageKey]);

  // ================================
  // EMOTIONAL NOTES MANAGEMENT
  // ================================
  const addEmotionalNote = useCallback((noteData: Omit<EmotionalNoteData, 'noteId' | 'timestamp' | 'date'>) => {
    const newNote: EmotionalNoteData = {
      ...noteData,
      noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };
    
    setEmotionalNotes(prev => {
      const updated = [...prev, newNote];
      saveToStorage(updated, reflections);
      return updated;
    });
  }, [reflections, saveToStorage]);

  const updateEmotionalNote = useCallback((noteId: string, updates: Partial<EmotionalNoteData>) => {
    setEmotionalNotes(prev => {
      const updated = prev.map(note => 
        note.noteId === noteId ? { ...note, ...updates } : note
      );
      saveToStorage(updated, reflections);
      return updated;
    });
  }, [reflections, saveToStorage]);

  const deleteEmotionalNote = useCallback((noteId: string) => {
    setEmotionalNotes(prev => {
      const updated = prev.filter(note => note.noteId !== noteId);
      saveToStorage(updated, reflections);
      return updated;
    });
  }, [reflections, saveToStorage]);

  const getEmotionalNotesByDate = useCallback((date: string) => {
    return emotionalNotes.filter(note => note.date === date);
  }, [emotionalNotes]);

  const getEmotionalNotesByEmotion = useCallback((emotion: string) => {
    return emotionalNotes.filter(note => note.emotion.toLowerCase() === emotion.toLowerCase());
  }, [emotionalNotes]);

  // ================================
  // REFLECTIONS MANAGEMENT
  // ================================
  const addReflection = useCallback((reflectionData: Omit<ReflectionData, 'id' | 'timestamp'>) => {
    const newReflection: ReflectionData = {
      ...reflectionData,
      id: `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    setReflections(prev => {
      const updated = [...prev, newReflection];
      saveToStorage(emotionalNotes, updated);
      return updated;
    });
  }, [emotionalNotes, saveToStorage]);

  const updateReflection = useCallback((id: string, updates: Partial<ReflectionData>) => {
    setReflections(prev => {
      const updated = prev.map(reflection => 
        reflection.id === id ? { ...reflection, ...updates } : reflection
      );
      saveToStorage(emotionalNotes, updated);
      return updated;
    });
  }, [emotionalNotes, saveToStorage]);

  const deleteReflection = useCallback((id: string) => {
    setReflections(prev => {
      const updated = prev.filter(reflection => reflection.id !== id);
      saveToStorage(emotionalNotes, updated);
      return updated;
    });
  }, [emotionalNotes, saveToStorage]);

  const getReflectionsByType = useCallback((type: string) => {
    return reflections.filter(reflection => reflection.type === type);
  }, [reflections]);

  const getReflectionsByDateRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return reflections.filter(reflection => {
      const reflectionDate = new Date(reflection.timestamp);
      return reflectionDate >= start && reflectionDate <= end;
    });
  }, [reflections]);

  // ================================
  // DATA RETRIEVAL
  // ================================
  const getDailyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    return emotionalNotes;
  }, [emotionalNotes]);

  const getReflections = useCallback((): ReflectionData[] => {
    return reflections;
  }, [reflections]);

  const getRecentNotes = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return emotionalNotes.filter(note => new Date(note.timestamp) >= cutoffDate);
  }, [emotionalNotes]);

  const getRecentReflections = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return reflections.filter(reflection => new Date(reflection.timestamp) >= cutoffDate);
  }, [reflections]);

  // ================================
  // ANALYTICS & INSIGHTS
  // ================================
  const getEmotionInsights = useCallback((period: string = 'week') => {
    const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : 7;
    const recentNotes = getRecentNotes(periodDays);
    
    // Calculate emotion distribution
    const emotionCounts: { [key: string]: number } = {};
    recentNotes.forEach(note => {
      emotionCounts[note.emotion] = (emotionCounts[note.emotion] || 0) + 1;
    });
    
    // Calculate average intensity by emotion
    const emotionIntensity: { [key: string]: number[] } = {};
    recentNotes.forEach(note => {
      if (!emotionIntensity[note.emotion]) {
        emotionIntensity[note.emotion] = [];
      }
      emotionIntensity[note.emotion].push(note.intensity);
    });
    
    const avgIntensity: { [key: string]: number } = {};
    Object.keys(emotionIntensity).forEach(emotion => {
      const intensities = emotionIntensity[emotion];
      avgIntensity[emotion] = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
    });
    
    return {
      emotionCounts,
      avgIntensity,
      totalNotes: recentNotes.length,
      period,
      mostCommonEmotion: Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b, Object.keys(emotionCounts)[0]
      )
    };
  }, [getRecentNotes]);

  const getMoodTrends = useCallback(() => {
    const last30Days = getRecentNotes(30);
    const dailyMoods: { [key: string]: number[] } = {};
    
    last30Days.forEach(note => {
      const date = note.date;
      if (!dailyMoods[date]) {
        dailyMoods[date] = [];
      }
      dailyMoods[date].push(note.intensity);
    });
    
    const dailyAverages = Object.keys(dailyMoods).map(date => ({
      date,
      averageIntensity: dailyMoods[date].reduce((sum, val) => sum + val, 0) / dailyMoods[date].length
    }));
    
    return {
      dailyAverages,
      trend: dailyAverages.length > 1 ? 
        (dailyAverages[dailyAverages.length - 1].averageIntensity > dailyAverages[0].averageIntensity ? 'improving' : 'declining') : 'stable'
    };
  }, [getRecentNotes]);

  const getGratitudePractice = useCallback(() => {
    const gratitudeReflections = reflections.filter(r => 
      r.type.toLowerCase().includes('gratitude') || 
      r.content.toLowerCase().includes('grateful') ||
      r.content.toLowerCase().includes('thankful')
    );
    
    return {
      totalGratitudeEntries: gratitudeReflections.length,
      recentGratitude: gratitudeReflections.slice(-5),
      gratitudeFrequency: gratitudeReflections.length > 0 ? 'regular' : 'none'
    };
  }, [reflections]);

  const getEnergyPatterns = useCallback(() => {
    const energyNotes = emotionalNotes.filter(note => 
      note.tags?.some(tag => tag.toLowerCase().includes('energy')) ||
      note.emotion.toLowerCase().includes('energy') ||
      note.content.toLowerCase().includes('energy')
    );
    
    return {
      totalEnergyNotes: energyNotes.length,
      averageEnergyLevel: energyNotes.length > 0 ? 
        energyNotes.reduce((sum, note) => sum + note.intensity, 0) / energyNotes.length : 0,
      energyTrend: 'stable'
    };
  }, [emotionalNotes]);

  // ================================
  // WELLNESS SCORING
  // ================================
  const calculateWellnessScore = useCallback((): number => {
    const recentNotes = getRecentNotes(7);
    const recentReflections = getRecentReflections(7);
    
    if (recentNotes.length === 0 && recentReflections.length === 0) {
      return 0;
    }
    
    // Calculate based on emotional intensity and frequency
    const avgIntensity = recentNotes.length > 0 ? 
      recentNotes.reduce((sum, note) => sum + note.intensity, 0) / recentNotes.length : 5;
    
    const reflectionScore = Math.min(recentReflections.length * 10, 50);
    const consistencyScore = Math.min(recentNotes.length * 5, 30);
    const intensityScore = Math.max(0, 10 - Math.abs(avgIntensity - 5)) * 2;
    
    return Math.round(reflectionScore + consistencyScore + intensityScore);
  }, [getRecentNotes, getRecentReflections]);

  const getWellnessRecommendations = useCallback((): string[] => {
    const score = calculateWellnessScore();
    const insights = getEmotionInsights('week');
    const energyPatterns = getEnergyPatterns();
    
    const recommendations: string[] = [];
    
    if (score < 30) {
      recommendations.push("Consider increasing your emotional check-ins and reflection practice");
    }
    
    if (score >= 30 && score < 60) {
      recommendations.push("Great progress! Try to maintain consistent emotional awareness");
    }
    
    if (score >= 60) {
      recommendations.push("Excellent emotional wellness! Keep up the mindful practices");
    }
    
    if (emotionalNotes.length < 10) {
      recommendations.push("Regular emotional check-ins can improve self-awareness");
    }
    
    return recommendations;
  }, [calculateWellnessScore, getEmotionInsights, getEnergyPatterns, emotionalNotes.length]);

  // ================================
  // UTILITY METHODS
  // ================================
  const clearWellnessData = useCallback(() => {
    setEmotionalNotes([]);
    setReflections([]);
    
    try {
      localStorage.removeItem(getNotesStorageKey());
      localStorage.removeItem(getReflectionsStorageKey());
      localStorage.removeItem('emotionalNotes');
      localStorage.removeItem('reflections');
    } catch (error) {
      console.error('Error clearing wellness data:', error);
    }
    
    saveToStorage([], []);
  }, [getNotesStorageKey, getReflectionsStorageKey, saveToStorage]);

  const exportWellnessData = useCallback(() => {
    return {
      emotionalNotes: emotionalNotes,
      reflections: reflections,
      insights: getEmotionInsights('year'),
      wellnessScore: calculateWellnessScore(),
      exportedAt: new Date().toISOString()
    };
  }, [emotionalNotes, reflections, getEmotionInsights, calculateWellnessScore]);

  // ================================
  // LEGACY COMPATIBILITY
  // ================================
  const getLegacyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    return getDailyEmotionalNotes();
  }, [getDailyEmotionalNotes]);

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ================================
  // CONTEXT VALUE
  // ================================
  const contextValue: WellnessContextType = useMemo(() => ({
    // Data
    emotionalNotes,
    reflections,
    isLoading,
    
    // Emotional Notes Management
    addEmotionalNote,
    updateEmotionalNote,
    deleteEmotionalNote,
    getEmotionalNotesByDate,
    getEmotionalNotesByEmotion,
    
    // Reflections Management
    addReflection,
    updateReflection,
    deleteReflection,
    getReflectionsByType,
    getReflectionsByDateRange,
    
    // Data Retrieval
    getDailyEmotionalNotes,
    getReflections,
    getRecentNotes,
    getRecentReflections,
    
    // Analytics & Insights
    getEmotionInsights,
    getMoodTrends,
    getGratitudePractice,
    getEnergyPatterns,
    
    // Wellness Scoring
    calculateWellnessScore,
    getWellnessRecommendations,
    
    // Utility
    clearWellnessData,
    exportWellnessData,
    getLegacyEmotionalNotes
  }), [
    emotionalNotes, reflections, isLoading,
    addEmotionalNote, updateEmotionalNote, deleteEmotionalNote, getEmotionalNotesByDate, getEmotionalNotesByEmotion,
    addReflection, updateReflection, deleteReflection, getReflectionsByType, getReflectionsByDateRange,
    getDailyEmotionalNotes, getReflections, getRecentNotes, getRecentReflections,
    getEmotionInsights, getMoodTrends, getGratitudePractice, getEnergyPatterns,
    calculateWellnessScore, getWellnessRecommendations,
    clearWellnessData, exportWellnessData,
    getLegacyEmotionalNotes
  ]);

  return (
    <WellnessContext.Provider value={contextValue}>
      {children}
    </WellnessContext.Provider>
  );
};

// ================================
// CUSTOM HOOK
// ================================
export default useWellness;