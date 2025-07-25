// src/contexts/wellness/WellnessContext.tsx
// ✅ COMPLETE Working WellnessContext Implementation - Full Functionality Preserved

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

// ================================
// TYPES & INTERFACES
// ================================

export interface EmotionalNoteData {
  noteId: string;
  content: string;
  emotion: string;
  intensity: number;
  energyLevel?: number;  // ✅ Added for new component compatibility
  timestamp: string;
  tags?: string[];
  mood?: string;
  triggers?: string[];
  date: string;
  gratitude?: string[];  // ✅ Added for gratitude functionality
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
      // Save to multiple storage locations for robustness
      localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
      localStorage.setItem(getReflectionsStorageKey(), JSON.stringify(reflectionsData));
      
      // Also save to comprehensive user data
      const existing = JSON.parse(localStorage.getItem('comprehensiveUserData') || '{}');
      if (!existing.wellness) existing.wellness = {};
      existing.wellness.emotionalNotes = notes;
      existing.wellness.reflections = reflectionsData;
      existing.wellness.lastUpdated = new Date().toISOString();
      localStorage.setItem('comprehensiveUserData', JSON.stringify(existing));
      
      console.log(`✅ WellnessContext: Saved ${notes.length} notes and ${reflectionsData.length} reflections to storage`);
    } catch (error) {
      console.error('❌ WellnessContext: Error saving wellness data to storage:', error);
    }
  }, [getNotesStorageKey, getReflectionsStorageKey]);

  const loadFromStorage = useCallback(() => {
    try {
      setIsLoading(true);
      console.log('🔄 WellnessContext: Loading wellness data from storage...');
      
      // Try multiple storage sources for robustness
      let notesData = localStorage.getItem(getNotesStorageKey());
      let reflectionsData = localStorage.getItem(getReflectionsStorageKey());
      
      // Fallback to comprehensive user data if primary storage is empty
      if (!notesData || !reflectionsData) {
        const comprehensive = JSON.parse(localStorage.getItem('comprehensiveUserData') || '{}');
        if (comprehensive.wellness) {
          notesData = notesData || JSON.stringify(comprehensive.wellness.emotionalNotes || []);
          reflectionsData = reflectionsData || JSON.stringify(comprehensive.wellness.reflections || []);
        }
      }
      
      if (notesData) {
        const parsedNotes = JSON.parse(notesData);
        const validatedNotes = Array.isArray(parsedNotes) ? parsedNotes : [];
        setEmotionalNotes(validatedNotes);
        console.log(`✅ WellnessContext: Loaded ${validatedNotes.length} emotional notes`);
      }
      
      if (reflectionsData) {
        const parsedReflections = JSON.parse(reflectionsData);
        const validatedReflections = Array.isArray(parsedReflections) ? parsedReflections : [];
        setReflections(validatedReflections);
        console.log(`✅ WellnessContext: Loaded ${validatedReflections.length} reflections`);
      }
      
    } catch (error) {
      console.error('❌ WellnessContext: Error loading wellness data from storage:', error);
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
    try {
      console.log('🔄 WellnessContext: Adding new emotional note...');
      
      const newNote: EmotionalNoteData = {
        ...noteData,
        noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        // ✅ Handle both intensity and energyLevel for compatibility
        intensity: noteData.intensity || noteData.energyLevel || 5,
        energyLevel: noteData.energyLevel || noteData.intensity || 5,
        tags: noteData.tags || [],
        gratitude: noteData.gratitude || []
      };
      
      setEmotionalNotes(prev => {
        const updated = [...prev, newNote];
        saveToStorage(updated, reflections);
        return updated;
      });
      
      console.log('✅ WellnessContext: Added emotional note:', {
        noteId: newNote.noteId,
        emotion: newNote.emotion,
        intensity: newNote.intensity,
        energyLevel: newNote.energyLevel,
        hasGratitude: (newNote.gratitude?.length || 0) > 0
      });
      
    } catch (error) {
      console.error('❌ WellnessContext: Error adding emotional note:', error);
    }
  }, [reflections, saveToStorage]);

  const updateEmotionalNote = useCallback((noteId: string, updates: Partial<EmotionalNoteData>) => {
    try {
      console.log('🔄 WellnessContext: Updating emotional note:', noteId);
      
      setEmotionalNotes(prev => {
        const updated = prev.map(note => {
          if (note.noteId === noteId) {
            const updatedNote = { ...note, ...updates };
            // Sync intensity and energyLevel
            if (updates.intensity !== undefined) updatedNote.energyLevel = updates.intensity;
            if (updates.energyLevel !== undefined) updatedNote.intensity = updates.energyLevel;
            return updatedNote;
          }
          return note;
        });
        saveToStorage(updated, reflections);
        return updated;
      });
      
      console.log('✅ WellnessContext: Updated emotional note:', noteId);
    } catch (error) {
      console.error('❌ WellnessContext: Error updating emotional note:', error);
    }
  }, [reflections, saveToStorage]);

  const deleteEmotionalNote = useCallback((noteId: string) => {
    try {
      console.log('🔄 WellnessContext: Deleting emotional note:', noteId);
      
      setEmotionalNotes(prev => {
        const updated = prev.filter(note => note.noteId !== noteId);
        saveToStorage(updated, reflections);
        return updated;
      });
      
      console.log('✅ WellnessContext: Deleted emotional note:', noteId);
    } catch (error) {
      console.error('❌ WellnessContext: Error deleting emotional note:', error);
    }
  }, [reflections, saveToStorage]);

  const getEmotionalNotesByDate = useCallback((date: string) => {
    const filtered = emotionalNotes.filter(note => note.date === date);
    console.log(`🔍 WellnessContext: Found ${filtered.length} notes for date ${date}`);
    return filtered;
  }, [emotionalNotes]);

  const getEmotionalNotesByEmotion = useCallback((emotion: string) => {
    const filtered = emotionalNotes.filter(note => note.emotion.toLowerCase() === emotion.toLowerCase());
    console.log(`🔍 WellnessContext: Found ${filtered.length} notes for emotion "${emotion}"`);
    return filtered;
  }, [emotionalNotes]);

  // ================================
  // REFLECTIONS MANAGEMENT
  // ================================
  const addReflection = useCallback((reflectionData: Omit<ReflectionData, 'id' | 'timestamp'>) => {
    try {
      console.log('🔄 WellnessContext: Adding new reflection...');
      
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
      
      console.log('✅ WellnessContext: Added reflection:', {
        id: newReflection.id,
        type: newReflection.type
      });
      
    } catch (error) {
      console.error('❌ WellnessContext: Error adding reflection:', error);
    }
  }, [emotionalNotes, saveToStorage]);

  const updateReflection = useCallback((id: string, updates: Partial<ReflectionData>) => {
    try {
      console.log('🔄 WellnessContext: Updating reflection:', id);
      
      setReflections(prev => {
        const updated = prev.map(reflection => 
          reflection.id === id ? { ...reflection, ...updates } : reflection
        );
        saveToStorage(emotionalNotes, updated);
        return updated;
      });
      
      console.log('✅ WellnessContext: Updated reflection:', id);
    } catch (error) {
      console.error('❌ WellnessContext: Error updating reflection:', error);
    }
  }, [emotionalNotes, saveToStorage]);

  const deleteReflection = useCallback((id: string) => {
    try {
      console.log('🔄 WellnessContext: Deleting reflection:', id);
      
      setReflections(prev => {
        const updated = prev.filter(reflection => reflection.id !== id);
        saveToStorage(emotionalNotes, updated);
        return updated;
      });
      
      console.log('✅ WellnessContext: Deleted reflection:', id);
    } catch (error) {
      console.error('❌ WellnessContext: Error deleting reflection:', error);
    }
  }, [emotionalNotes, saveToStorage]);

  const getReflectionsByType = useCallback((type: string) => {
    const filtered = reflections.filter(reflection => reflection.type === type);
    console.log(`🔍 WellnessContext: Found ${filtered.length} reflections of type "${type}"`);
    return filtered;
  }, [reflections]);

  const getReflectionsByDateRange = useCallback((startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filtered = reflections.filter(reflection => {
      const reflectionDate = new Date(reflection.timestamp);
      return reflectionDate >= start && reflectionDate <= end;
    });
    
    console.log(`🔍 WellnessContext: Found ${filtered.length} reflections between ${startDate} and ${endDate}`);
    return filtered;
  }, [reflections]);

  // ================================
  // DATA RETRIEVAL
  // ================================
  const getDailyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    console.log(`📊 WellnessContext: Returning ${emotionalNotes.length} daily emotional notes`);
    return emotionalNotes;
  }, [emotionalNotes]);

  const getReflections = useCallback((): ReflectionData[] => {
    console.log(`📊 WellnessContext: Returning ${reflections.length} reflections`);
    return reflections;
  }, [reflections]);

  const getRecentNotes = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filtered = emotionalNotes.filter(note => new Date(note.timestamp) >= cutoffDate);
    console.log(`📊 WellnessContext: Found ${filtered.length} notes from last ${days} days`);
    return filtered;
  }, [emotionalNotes]);

  const getRecentReflections = useCallback((days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filtered = reflections.filter(reflection => new Date(reflection.timestamp) >= cutoffDate);
    console.log(`📊 WellnessContext: Found ${filtered.length} reflections from last ${days} days`);
    return filtered;
  }, [reflections]);

  // ================================
  // ANALYTICS & INSIGHTS
  // ================================
  const getEmotionInsights = useCallback((period: string = 'week') => {
    try {
      console.log(`📈 WellnessContext: Calculating emotion insights for period: ${period}`);
      
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : period === 'year' ? 365 : 7;
      const recentNotes = getRecentNotes(periodDays);
      
      if (recentNotes.length === 0) {
        return {
          emotionCounts: {},
          avgIntensity: {},
          totalNotes: 0,
          period,
          mostCommonEmotion: ''
        };
      }
      
      // Calculate emotion distribution
      const emotionCounts: { [key: string]: number } = {};
      recentNotes.forEach(note => {
        emotionCounts[note.emotion] = (emotionCounts[note.emotion] || 0) + 1;
      });
      
      // Calculate average intensity by emotion (support both fields)
      const emotionIntensity: { [key: string]: number[] } = {};
      recentNotes.forEach(note => {
        if (!emotionIntensity[note.emotion]) {
          emotionIntensity[note.emotion] = [];
        }
        const intensity = note.intensity || note.energyLevel || 5;
        emotionIntensity[note.emotion].push(intensity);
      });
      
      const avgIntensity: { [key: string]: number } = {};
      Object.keys(emotionIntensity).forEach(emotion => {
        const intensities = emotionIntensity[emotion];
        avgIntensity[emotion] = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
      });
      
      const mostCommonEmotion = Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b, Object.keys(emotionCounts)[0] || ''
      );
      
      const insights = {
        emotionCounts,
        avgIntensity,
        totalNotes: recentNotes.length,
        period,
        mostCommonEmotion
      };
      
      console.log('✅ WellnessContext: Emotion insights calculated:', insights);
      return insights;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error calculating emotion insights:', error);
      return {
        emotionCounts: {},
        avgIntensity: {},
        totalNotes: 0,
        period,
        mostCommonEmotion: ''
      };
    }
  }, [getRecentNotes]);

  const getMoodTrends = useCallback(() => {
    try {
      console.log('📈 WellnessContext: Calculating mood trends...');
      
      const last30Days = getRecentNotes(30);
      const dailyMoods: { [key: string]: number[] } = {};
      
      last30Days.forEach(note => {
        const date = note.date;
        if (!dailyMoods[date]) {
          dailyMoods[date] = [];
        }
        const intensity = note.intensity || note.energyLevel || 5;
        dailyMoods[date].push(intensity);
      });
      
      const dailyAverages = Object.keys(dailyMoods).map(date => ({
        date,
        averageIntensity: dailyMoods[date].reduce((sum, val) => sum + val, 0) / dailyMoods[date].length
      }));
      
      const trend = dailyAverages.length > 1 ? 
        (dailyAverages[dailyAverages.length - 1].averageIntensity > dailyAverages[0].averageIntensity ? 'improving' : 'declining') : 'stable';
      
      const result = { dailyAverages, trend };
      console.log('✅ WellnessContext: Mood trends calculated:', result);
      return result;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error calculating mood trends:', error);
      return { dailyAverages: [], trend: 'stable' };
    }
  }, [getRecentNotes]);

  const getGratitudePractice = useCallback(() => {
    try {
      console.log('🙏 WellnessContext: Analyzing gratitude practice...');
      
      // Check gratitude in both reflections and notes
      const gratitudeReflections = reflections.filter(r => 
        r.type.toLowerCase().includes('gratitude') || 
        r.content.toLowerCase().includes('grateful') ||
        r.content.toLowerCase().includes('thankful')
      );
      
      const gratitudeNotes = emotionalNotes.filter(note =>
        note.emotion.toLowerCase().includes('grateful') ||
        note.content.toLowerCase().includes('grateful') ||
        note.content.toLowerCase().includes('thankful') ||
        (note.gratitude && note.gratitude.length > 0)
      );
      
      const result = {
        totalGratitudeEntries: gratitudeReflections.length + gratitudeNotes.length,
        recentGratitude: [...gratitudeReflections.slice(-3), ...gratitudeNotes.slice(-3)],
        gratitudeFrequency: (gratitudeReflections.length + gratitudeNotes.length) > 0 ? 'regular' : 'none',
        gratitudeItemsCount: emotionalNotes.reduce((sum, note) => sum + (note.gratitude?.length || 0), 0)
      };
      
      console.log('✅ WellnessContext: Gratitude practice analyzed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error analyzing gratitude practice:', error);
      return {
        totalGratitudeEntries: 0,
        recentGratitude: [],
        gratitudeFrequency: 'none',
        gratitudeItemsCount: 0
      };
    }
  }, [reflections, emotionalNotes]);

  const getEnergyPatterns = useCallback(() => {
    try {
      console.log('⚡ WellnessContext: Analyzing energy patterns...');
      
      const energyNotes = emotionalNotes.filter(note => 
        note.tags?.some(tag => tag.toLowerCase().includes('energy')) ||
        note.emotion.toLowerCase().includes('energy') ||
        note.content.toLowerCase().includes('energy') ||
        note.intensity !== undefined ||
        note.energyLevel !== undefined
      );
      
      const totalEnergyLevel = energyNotes.reduce((sum, note) => {
        return sum + (note.intensity || note.energyLevel || 5);
      }, 0);
      
      const result = {
        totalEnergyNotes: energyNotes.length,
        averageEnergyLevel: energyNotes.length > 0 ? totalEnergyLevel / energyNotes.length : 0,
        energyTrend: 'stable', // Could be enhanced with trend calculation
        highEnergyDays: energyNotes.filter(note => (note.intensity || note.energyLevel || 0) >= 7).length,
        lowEnergyDays: energyNotes.filter(note => (note.intensity || note.energyLevel || 0) <= 3).length
      };
      
      console.log('✅ WellnessContext: Energy patterns analyzed:', result);
      return result;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error analyzing energy patterns:', error);
      return {
        totalEnergyNotes: 0,
        averageEnergyLevel: 0,
        energyTrend: 'stable',
        highEnergyDays: 0,
        lowEnergyDays: 0
      };
    }
  }, [emotionalNotes]);

  // ================================
  // WELLNESS SCORING
  // ================================
  const calculateWellnessScore = useCallback((): number => {
    try {
      console.log('📊 WellnessContext: Calculating wellness score...');
      
      const recentNotes = getRecentNotes(7);
      const recentReflections = getRecentReflections(7);
      
      if (recentNotes.length === 0 && recentReflections.length === 0) {
        console.log('ℹ️ WellnessContext: No recent data for wellness score');
        return 0;
      }
      
      // Calculate based on emotional intensity and frequency
      const avgIntensity = recentNotes.length > 0 ? 
        recentNotes.reduce((sum, note) => sum + (note.intensity || note.energyLevel || 5), 0) / recentNotes.length : 5;
      
      const reflectionScore = Math.min(recentReflections.length * 10, 50);
      const consistencyScore = Math.min(recentNotes.length * 5, 30);
      const intensityScore = Math.max(0, 10 - Math.abs(avgIntensity - 5)) * 2;
      
      // Bonus for gratitude practice
      const gratitudeBonus = recentNotes.filter(note => note.gratitude && note.gratitude.length > 0).length * 2;
      
      const totalScore = Math.round(reflectionScore + consistencyScore + intensityScore + gratitudeBonus);
      
      console.log('✅ WellnessContext: Wellness score calculated:', {
        totalScore,
        reflectionScore,
        consistencyScore,
        intensityScore,
        gratitudeBonus
      });
      
      return totalScore;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error calculating wellness score:', error);
      return 0;
    }
  }, [getRecentNotes, getRecentReflections]);

  const getWellnessRecommendations = useCallback((): string[] => {
    try {
      console.log('💡 WellnessContext: Generating wellness recommendations...');
      
      const score = calculateWellnessScore();
      const insights = getEmotionInsights('week');
      const energyPatterns = getEnergyPatterns();
      const gratitudePractice = getGratitudePractice();
      
      const recommendations: string[] = [];
      
      // Score-based recommendations
      if (score < 30) {
        recommendations.push("Consider increasing your emotional check-ins and reflection practice");
        recommendations.push("Try setting a daily reminder for mindful awareness");
      } else if (score >= 30 && score < 60) {
        recommendations.push("Great progress! Try to maintain consistent emotional awareness");
        recommendations.push("Consider adding gratitude practice to boost wellness");
      } else if (score >= 60) {
        recommendations.push("Excellent emotional wellness! Keep up the mindful practices");
        recommendations.push("You might enjoy exploring advanced mindfulness techniques");
      }
      
      // Data-based recommendations
      if (emotionalNotes.length < 10) {
        recommendations.push("Regular emotional check-ins can improve self-awareness");
      }
      
      if (energyPatterns.averageEnergyLevel < 4) {
        recommendations.push("Focus on activities that boost your energy levels");
      }
      
      if (gratitudePractice.totalGratitudeEntries < 5) {
        recommendations.push("Try adding gratitude journaling to your routine");
      }
      
      if (insights.totalNotes < 3) {
        recommendations.push("Consider more frequent emotional check-ins");
      }
      
      console.log('✅ WellnessContext: Generated recommendations:', recommendations);
      return recommendations;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error generating recommendations:', error);
      return ["Continue your wellness journey with regular reflection"];
    }
  }, [calculateWellnessScore, getEmotionInsights, getEnergyPatterns, getGratitudePractice, emotionalNotes.length]);

  // ================================
  // UTILITY METHODS
  // ================================
  const clearWellnessData = useCallback(() => {
    try {
      console.log('🗑️ WellnessContext: Clearing all wellness data...');
      
      setEmotionalNotes([]);
      setReflections([]);
      
      // Clear from all storage locations
      const keysToRemove = [
        getNotesStorageKey(),
        getReflectionsStorageKey(),
        'emotionalNotes',
        'reflections'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`⚠️ WellnessContext: Could not remove ${key}:`, error);
        }
      });
      
      // Clear from comprehensive user data
      try {
        const existing = JSON.parse(localStorage.getItem('comprehensiveUserData') || '{}');
        if (existing.wellness) {
          delete existing.wellness;
          localStorage.setItem('comprehensiveUserData', JSON.stringify(existing));
        }
      } catch (error) {
        console.warn('⚠️ WellnessContext: Could not clear comprehensive data:', error);
      }
      
      saveToStorage([], []);
      console.log('✅ WellnessContext: All wellness data cleared');
      
    } catch (error) {
      console.error('❌ WellnessContext: Error clearing wellness data:', error);
    }
  }, [getNotesStorageKey, getReflectionsStorageKey, saveToStorage]);

  const exportWellnessData = useCallback(() => {
    try {
      console.log('📤 WellnessContext: Exporting wellness data...');
      
      const exportData = {
        emotionalNotes: emotionalNotes,
        reflections: reflections,
        insights: getEmotionInsights('year'),
        moodTrends: getMoodTrends(),
        gratitudePractice: getGratitudePractice(),
        energyPatterns: getEnergyPatterns(),
        wellnessScore: calculateWellnessScore(),
        recommendations: getWellnessRecommendations(),
        exportedAt: new Date().toISOString(),
        version: '2.0'
      };
      
      console.log('✅ WellnessContext: Wellness data exported successfully');
      return exportData;
      
    } catch (error) {
      console.error('❌ WellnessContext: Error exporting wellness data:', error);
      return {
        emotionalNotes: [],
        reflections: [],
        exportedAt: new Date().toISOString(),
        error: 'Export failed'
      };
    }
  }, [emotionalNotes, reflections, getEmotionInsights, getMoodTrends, getGratitudePractice, getEnergyPatterns, calculateWellnessScore, getWellnessRecommendations]);

  // ================================
  // LEGACY COMPATIBILITY
  // ================================
  const getLegacyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    console.log('🔄 WellnessContext: Providing legacy emotional notes compatibility');
    return getDailyEmotionalNotes();
  }, [getDailyEmotionalNotes]);

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    console.log('🚀 WellnessContext: Initializing WellnessProvider');
    loadFromStorage();
  }, []);  // ✅ CORRECT - empty array, runs only once

  // Debug effect
  useEffect(() => {
    console.log('📊 WellnessContext: State updated:', {
      emotionalNotesCount: emotionalNotes.length,
      reflectionsCount: reflections.length,
      isLoading
    });
  }, [emotionalNotes.length, reflections.length, isLoading]);

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
// CUSTOM HOOK EXPORT
// ================================
export default useWellness;