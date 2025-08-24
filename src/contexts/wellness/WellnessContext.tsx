// ✅ FIREBASE-ONLY WellnessContext - Root Collection Structure
// File: src/contexts/wellness/WellnessContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// TYPES & INTERFACES (UNCHANGED)
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
  firestoreId?: string; // Firebase ID
  userId: string; // ✅ Required for root collection
}

export interface ReflectionData {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  tags?: string[];
  mood?: string;
  insights?: string[];
  firestoreId?: string; // Firebase ID
  userId: string; // ✅ Required for root collection
}

export interface WellnessContextType {
  // Data
  emotionalNotes: EmotionalNoteData[];
  reflections: ReflectionData[];
  isLoading: boolean;
  
  // Emotional Notes Management
  addEmotionalNote: (note: Omit<EmotionalNoteData, 'noteId' | 'timestamp' | 'date' | 'userId'>) => void;
  updateEmotionalNote: (noteId: string, updates: Partial<EmotionalNoteData>) => void;
  deleteEmotionalNote: (noteId: string) => void;
  getEmotionalNotesByDate: (date: string) => EmotionalNoteData[];
  getEmotionalNotesByEmotion: (emotion: string) => EmotionalNoteData[];
  
  // Reflections Management
  addReflection: (reflection: Omit<ReflectionData, 'id' | 'timestamp' | 'userId'>) => void;
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
// FIREBASE-ONLY WELLNESS PROVIDER - ROOT COLLECTIONS
// ================================

interface WellnessProviderProps {
  children: ReactNode;
}

export const WellnessProvider: React.FC<WellnessProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [emotionalNotes, setEmotionalNotes] = useState<EmotionalNoteData[]>([]);
  const [reflections, setReflections] = useState<ReflectionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // FIREBASE-ONLY: Data persistence - ROOT COLLECTIONS
  // ================================
  const saveNoteToFirebase = useCallback(async (note: EmotionalNoteData) => {
    if (!currentUser?.uid) return;

    try {
      const noteDoc = {
        ...note,
        userId: currentUser.uid,
        lastUpdated: serverTimestamp()
      };
      
      // ✅ SAVE TO ROOT COLLECTION: emotionalNotes
      const docRef = await addDoc(collection(db, 'emotionalNotes'), noteDoc);
      console.log(`✅ Emotional note saved to ROOT collection for user ${currentUser.uid.substring(0, 8)}...`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save emotional note to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const saveReflectionToFirebase = useCallback(async (reflection: ReflectionData) => {
    if (!currentUser?.uid) return;

    try {
      const reflectionDoc = {
        ...reflection,
        userId: currentUser.uid,
        lastUpdated: serverTimestamp()
      };
      
      // ✅ SAVE TO ROOT COLLECTION: reflections
      const docRef = await addDoc(collection(db, 'reflections'), reflectionDoc);
      console.log(`✅ Reflection saved to ROOT collection for user ${currentUser.uid.substring(0, 8)}...`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save reflection to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    
    try {
      // ✅ Load emotional notes from ROOT collection with userId filter
      const notesQuery = query(
        collection(db, 'emotionalNotes'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const notesSnapshot = await getDocs(notesQuery);
      
      const firestoreNotes: EmotionalNoteData[] = [];
      notesSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const note: EmotionalNoteData = {
          ...data,
          firestoreId: docSnapshot.id,
          timestamp: data.timestamp || new Date().toISOString(),
          date: data.date || new Date().toISOString().split('T')[0],
          userId: data.userId || currentUser.uid
        } as EmotionalNoteData;
        firestoreNotes.push(note);
      });

      // ✅ Load reflections from ROOT collection with userId filter
      const reflectionsQuery = query(
        collection(db, 'reflections'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const reflectionsSnapshot = await getDocs(reflectionsQuery);
      
      const firestoreReflections: ReflectionData[] = [];
      reflectionsSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const reflection: ReflectionData = {
          ...data,
          firestoreId: docSnapshot.id,
          timestamp: data.timestamp || new Date().toISOString(),
          userId: data.userId || currentUser.uid
        } as ReflectionData;
        firestoreReflections.push(reflection);
      });

      setEmotionalNotes(firestoreNotes);
      setReflections(firestoreReflections);
      
      console.log(`📦 Loaded ${firestoreNotes.length} notes and ${firestoreReflections.length} reflections from ROOT collections for user ${currentUser.uid.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Failed to load wellness data from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  // ================================
  // LOAD DATA ON USER CHANGE
  // ================================
  useEffect(() => {
    if (currentUser?.uid) {
      loadFromFirebase();
    } else {
      // Reset to defaults when no user
      setEmotionalNotes([]);
      setReflections([]);
    }
  }, [currentUser?.uid, loadFromFirebase]);

  // ================================
  // EMOTIONAL NOTES MANAGEMENT (ROOT COLLECTION)
  // ================================
  const addEmotionalNote = useCallback(async (noteData: Omit<EmotionalNoteData, 'noteId' | 'timestamp' | 'date' | 'userId'>) => {
    if (!currentUser?.uid) return;
    
    try {
      console.log('🔄 WellnessContext: Adding new emotional note to ROOT collection...');
      
      const newNote: EmotionalNoteData = {
        ...noteData,
        noteId: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        userId: currentUser.uid, // ✅ Add userId for root collection
        // ✅ Handle both intensity and energyLevel for compatibility
        intensity: noteData.intensity || noteData.energyLevel || 5,
        energyLevel: noteData.energyLevel || noteData.intensity || 5,
        tags: noteData.tags || [],
        gratitude: noteData.gratitude || []
      };
      
      // ✅ IMMEDIATE UI UPDATE
      setEmotionalNotes(prev => [...prev, newNote]);
      
      // ✅ SAVE TO FIREBASE ROOT COLLECTION
      try {
        const firestoreId = await saveNoteToFirebase(newNote);
        if (firestoreId) {
          // Update note with Firestore ID
          const finalNote = { ...newNote, firestoreId };
          setEmotionalNotes(prev => prev.map(n => n.noteId === newNote.noteId ? finalNote : n));
        }
      } catch (error) {
        console.error('Failed to save note to Firebase:', error);
        // Remove from UI if Firebase save failed
        setEmotionalNotes(prev => prev.filter(n => n.noteId !== newNote.noteId));
        throw error;
      }
      
      console.log('✅ WellnessContext: Added emotional note to ROOT collection:', {
        noteId: newNote.noteId,
        emotion: newNote.emotion,
        intensity: newNote.intensity,
        energyLevel: newNote.energyLevel,
        hasGratitude: (newNote.gratitude?.length || 0) > 0
      });
      
    } catch (error) {
      console.error('❌ WellnessContext: Error adding emotional note:', error);
    }
  }, [saveNoteToFirebase, currentUser?.uid]);

  const updateEmotionalNote = useCallback(async (noteId: string, updates: Partial<EmotionalNoteData>) => {
    try {
      console.log('🔄 WellnessContext: Updating emotional note in ROOT collection:', noteId);
      
      setEmotionalNotes(prev => {
        return prev.map(note => {
          if (note.noteId === noteId) {
            const updatedNote = { ...note, ...updates };
            // Sync intensity and energyLevel
            if (updates.intensity !== undefined) updatedNote.energyLevel = updates.intensity;
            if (updates.energyLevel !== undefined) updatedNote.intensity = updates.energyLevel;
            return updatedNote;
          }
          return note;
        });
      });
      
      // ✅ UPDATE IN FIREBASE ROOT COLLECTION
      const note = emotionalNotes.find(n => n.noteId === noteId);
      if (note?.firestoreId) {
        try {
          const noteDoc = doc(db, 'emotionalNotes', note.firestoreId);
          await updateDoc(noteDoc, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          console.log(`✅ Note updated in ROOT collection for user ${currentUser?.uid?.substring(0, 8)}...`);
        } catch (error) {
          console.error('❌ Failed to update note in Firebase:', error);
        }
      }
      
      console.log('✅ WellnessContext: Updated emotional note:', noteId);
    } catch (error) {
      console.error('❌ WellnessContext: Error updating emotional note:', error);
    }
  }, [emotionalNotes, currentUser?.uid]);

  const deleteEmotionalNote = useCallback(async (noteId: string) => {
    try {
      console.log('🔄 WellnessContext: Deleting emotional note from ROOT collection:', noteId);
      
      const note = emotionalNotes.find(n => n.noteId === noteId);
      
      setEmotionalNotes(prev => prev.filter(note => note.noteId !== noteId));
      
      // ✅ DELETE FROM FIREBASE ROOT COLLECTION
      if (note?.firestoreId) {
        try {
          const noteDoc = doc(db, 'emotionalNotes', note.firestoreId);
          await deleteDoc(noteDoc);
          console.log(`✅ Note deleted from ROOT collection for user ${currentUser?.uid?.substring(0, 8)}...`);
        } catch (error) {
          console.error('❌ Failed to delete note from Firebase:', error);
        }
      }
      
      console.log('✅ WellnessContext: Deleted emotional note:', noteId);
    } catch (error) {
      console.error('❌ WellnessContext: Error deleting emotional note:', error);
    }
  }, [emotionalNotes, currentUser?.uid]);

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
  // REFLECTIONS MANAGEMENT (ROOT COLLECTION)
  // ================================
  const addReflection = useCallback(async (reflectionData: Omit<ReflectionData, 'id' | 'timestamp' | 'userId'>) => {
    if (!currentUser?.uid) return;
    
    try {
      console.log('🔄 WellnessContext: Adding new reflection to ROOT collection...');
      
      const newReflection: ReflectionData = {
        ...reflectionData,
        id: `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId: currentUser.uid // ✅ Add userId for root collection
      };
      
      // ✅ IMMEDIATE UI UPDATE
      setReflections(prev => [...prev, newReflection]);
      
      // ✅ SAVE TO FIREBASE ROOT COLLECTION
      try {
        const firestoreId = await saveReflectionToFirebase(newReflection);
        if (firestoreId) {
          // Update reflection with Firestore ID
          const finalReflection = { ...newReflection, firestoreId };
          setReflections(prev => prev.map(r => r.id === newReflection.id ? finalReflection : r));
        }
      } catch (error) {
        console.error('Failed to save reflection to Firebase:', error);
        // Remove from UI if Firebase save failed
        setReflections(prev => prev.filter(r => r.id !== newReflection.id));
        throw error;
      }
      
      console.log('✅ WellnessContext: Added reflection to ROOT collection:', {
        id: newReflection.id,
        type: newReflection.type
      });
      
    } catch (error) {
      console.error('❌ WellnessContext: Error adding reflection:', error);
    }
  }, [saveReflectionToFirebase, currentUser?.uid]);

  const updateReflection = useCallback(async (id: string, updates: Partial<ReflectionData>) => {
    try {
      console.log('🔄 WellnessContext: Updating reflection in ROOT collection:', id);
      
      setReflections(prev => {
        return prev.map(reflection => 
          reflection.id === id ? { ...reflection, ...updates } : reflection
        );
      });
      
      // ✅ UPDATE IN FIREBASE ROOT COLLECTION
      const reflection = reflections.find(r => r.id === id);
      if (reflection?.firestoreId) {
        try {
          const reflectionDoc = doc(db, 'reflections', reflection.firestoreId);
          await updateDoc(reflectionDoc, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          console.log(`✅ Reflection updated in ROOT collection for user ${currentUser?.uid?.substring(0, 8)}...`);
        } catch (error) {
          console.error('❌ Failed to update reflection in Firebase:', error);
        }
      }
      
      console.log('✅ WellnessContext: Updated reflection:', id);
    } catch (error) {
      console.error('❌ WellnessContext: Error updating reflection:', error);
    }
  }, [reflections, currentUser?.uid]);

  const deleteReflection = useCallback(async (id: string) => {
    try {
      console.log('🔄 WellnessContext: Deleting reflection from ROOT collection:', id);
      
      const reflection = reflections.find(r => r.id === id);
      
      setReflections(prev => prev.filter(reflection => reflection.id !== id));
      
      // ✅ DELETE FROM FIREBASE ROOT COLLECTION
      if (reflection?.firestoreId) {
        try {
          const reflectionDoc = doc(db, 'reflections', reflection.firestoreId);
          await deleteDoc(reflectionDoc);
          console.log(`✅ Reflection deleted from ROOT collection for user ${currentUser?.uid?.substring(0, 8)}...`);
        } catch (error) {
          console.error('❌ Failed to delete reflection from Firebase:', error);
        }
      }
      
      console.log('✅ WellnessContext: Deleted reflection:', id);
    } catch (error) {
      console.error('❌ WellnessContext: Error deleting reflection:', error);
    }
  }, [reflections, currentUser?.uid]);

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
  // DATA RETRIEVAL (UNCHANGED)
  // ================================
  const getDailyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    console.log(`📊 WellnessContext: Returning ${emotionalNotes.length} daily emotional notes from ROOT collection`);
    return emotionalNotes;
  }, [emotionalNotes]);

  const getReflections = useCallback((): ReflectionData[] => {
    console.log(`📊 WellnessContext: Returning ${reflections.length} reflections from ROOT collection`);
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
  // ANALYTICS & INSIGHTS (UNCHANGED)
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
  // WELLNESS SCORING (UNCHANGED)
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
  // UTILITY METHODS (ROOT COLLECTIONS)
  // ================================
  const clearWellnessData = useCallback(async () => {
    try {
      console.log('🗑️ WellnessContext: Clearing all wellness data from ROOT collections...');
      
      setEmotionalNotes([]);
      setReflections([]);
      
      // Clear Firebase data from ROOT collections
      if (currentUser?.uid) {
        try {
          // ✅ Clear emotional notes from ROOT collection
          const notesQuery = query(
            collection(db, 'emotionalNotes'),
            where('userId', '==', currentUser.uid)
          );
          const notesSnapshot = await getDocs(notesQuery);
          const deleteNotesPromises = notesSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deleteNotesPromises);
          
          // ✅ Clear reflections from ROOT collection
          const reflectionsQuery = query(
            collection(db, 'reflections'),
            where('userId', '==', currentUser.uid)
          );
          const reflectionsSnapshot = await getDocs(reflectionsQuery);
          const deleteReflectionsPromises = reflectionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deleteReflectionsPromises);
          
          console.log(`🧹 Wellness data cleared in ROOT collections for user ${currentUser.uid.substring(0, 8)}...`);
        } catch (error) {
          console.error('❌ Error clearing wellness data in Firebase:', error);
        }
      }
      
      console.log('✅ WellnessContext: All wellness data cleared from ROOT collections');
      
    } catch (error) {
      console.error('❌ WellnessContext: Error clearing wellness data:', error);
    }
  }, [currentUser?.uid]);

  const exportWellnessData = useCallback(() => {
    try {
      console.log('📤 WellnessContext: Exporting wellness data from ROOT collections...');
      
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
        version: '3.0',
        source: 'firebase_root_collections'
      };
      
      console.log('✅ WellnessContext: Wellness data exported successfully from ROOT collections');
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
  // LEGACY COMPATIBILITY (UNCHANGED)
  // ================================
  const getLegacyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    console.log('🔄 WellnessContext: Providing legacy emotional notes compatibility from ROOT collection');
    return getDailyEmotionalNotes();
  }, [getDailyEmotionalNotes]);

  // ================================
  // REAL-TIME FIREBASE LISTENERS (ROOT COLLECTIONS)
  // ================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    // ✅ Real-time listener for emotional notes from ROOT collection
    const notesQuery = query(
      collection(db, 'emotionalNotes'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribeNotes = onSnapshot(notesQuery, (querySnapshot) => {
      const firestoreNotes: EmotionalNoteData[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const note: EmotionalNoteData = {
          ...data,
          firestoreId: docSnapshot.id,
          timestamp: data.timestamp || new Date().toISOString(),
          date: data.date || new Date().toISOString().split('T')[0],
          userId: data.userId || currentUser.uid
        } as EmotionalNoteData;
        firestoreNotes.push(note);
      });

      setEmotionalNotes(firestoreNotes);
      console.log(`🔄 Real-time notes update from ROOT collection: ${firestoreNotes.length} notes for user ${currentUser.uid.substring(0, 8)}...`);
    }, (error) => {
      console.error('❌ Firebase notes listener error:', error);
    });

    // ✅ Real-time listener for reflections from ROOT collection
    const reflectionsQuery = query(
      collection(db, 'reflections'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribeReflections = onSnapshot(reflectionsQuery, (querySnapshot) => {
      const firestoreReflections: ReflectionData[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const reflection: ReflectionData = {
          ...data,
          firestoreId: docSnapshot.id,
          timestamp: data.timestamp || new Date().toISOString(),
          userId: data.userId || currentUser.uid
        } as ReflectionData;
        firestoreReflections.push(reflection);
      });

      setReflections(firestoreReflections);
      console.log(`🔄 Real-time reflections update from ROOT collection: ${firestoreReflections.length} reflections for user ${currentUser.uid.substring(0, 8)}...`);
    }, (error) => {
      console.error('❌ Firebase reflections listener error:', error);
    });

    return () => {
      unsubscribeNotes();
      unsubscribeReflections();
    };
  }, [currentUser?.uid]);

  // ================================
  // CONTEXT VALUE (UNCHANGED)
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
// CUSTOM HOOK EXPORT (UNCHANGED)
// ================================
export default useWellness;