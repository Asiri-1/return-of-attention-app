// ✅ ENHANCED OnboardingContext.tsx - Firebase/Firestore Integration
// src/contexts/onboarding/OnboardingContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

// ✅ FIREBASE IMPORTS - FIXED PATH AND SIMPLIFIED
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../../firebase'; // FIXED: Correct path to your firebase.js

// ================================
// ONBOARDING DATA INTERFACES (UNCHANGED)
// ================================
interface QuestionnaireData {
  completed: boolean;
  completedAt?: string;
  firestoreId?: string;
  createdAt?: string;
  updatedAt?: string;
  responses: {
    // Demographics & Background (1-7)
    experience_level: number;
    goals: string[];
    age_range: string;
    location: string;
    occupation: string;
    education_level: string;
    meditation_background: string;
    
    // Lifestyle Patterns (8-15)  
    sleep_pattern: number;
    physical_activity: string;
    stress_triggers: string[];
    daily_routine: string;
    diet_pattern: string;
    screen_time: string;
    social_connections: string;
    work_life_balance: string;
    
    // Thinking Patterns (16-21)
    emotional_awareness: number;
    stress_response: string;
    decision_making: string;
    self_reflection: string;
    thought_patterns: string;
    mindfulness_in_daily_life: string;
    
    // Mindfulness Specific (22-27)
    mindfulness_experience: number;
    meditation_background_detail: string;
    practice_goals: string;
    preferred_duration: number;
    biggest_challenges: string;
    motivation: string;
    
    // Additional fields
    totalQuestions: number;
    answeredQuestions: number;
    [key: string]: any;
  };
}

interface SelfAssessmentData {
  completed: boolean;
  completedAt?: string;
  firestoreId?: string;
  createdAt?: string;
  updatedAt?: string;
  format?: 'standard' | string;
  version?: string;
  type?: 'selfAssessment' | string;
  
  // Direct category values (for simple access)
  taste: 'none' | 'some' | 'strong';
  smell: 'none' | 'some' | 'strong';
  sound: 'none' | 'some' | 'strong';
  sight: 'none' | 'some' | 'strong';
  touch: 'none' | 'some' | 'strong';
  mind: 'none' | 'some' | 'strong';
  
  // Categories object format (for LocalDataContext compatibility)
  categories: {
    taste: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    smell: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    sound: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    sight: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    touch: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    mind: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
  };
  
  // CRITICAL: Responses object (for happiness calculator compatibility)
  responses: {
    taste: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    smell: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    sound: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    sight: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    touch: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
    mind: { level: 'none' | 'some' | 'strong'; details?: string; category: string; };
  };
  
  // Pre-calculated scores at top level
  attachmentScore: number;
  nonAttachmentCount: number;
  
  // Metrics object (for backward compatibility)
  metrics: {
    nonAttachmentCount: number;
    attachmentScore: number;
    attachmentLevel: string;
  };
  
  // Legacy support
  [key: string]: any;
}

interface OnboardingInsights {
  userType: 'beginner' | 'intermediate' | 'advanced';
  recommendedStartStage: number;
  primaryGoals: string[];
  stressTriggers: string[];
  optimalPracticeTime: string;
  recommendedDuration: number;
  attachmentLevel: string;
  personalizedTips: string[];
}

interface OnboardingContextType {
  // Data
  questionnaire: QuestionnaireData | null;
  selfAssessment: SelfAssessmentData | null;
  isLoading: boolean;
  
  // Questionnaire Management
  updateQuestionnaire: (questionnaireData: Omit<QuestionnaireData, 'completed' | 'completedAt'>) => Promise<void>;
  markQuestionnaireComplete: (responses: any) => Promise<void>;
  saveQuestionnaireProgress: (responses: any, currentQuestion?: number) => Promise<void>;
  getQuestionnaire: () => QuestionnaireData | null;
  isQuestionnaireCompleted: () => boolean;
  
  // Self-Assessment Management
  updateSelfAssessment: (selfAssessmentData: Omit<SelfAssessmentData, 'completed' | 'completedAt'>) => Promise<void>;
  markSelfAssessmentComplete: (responses: any) => Promise<void>;
  saveSelfAssessmentProgress: (responses: any) => Promise<void>;
  getSelfAssessment: () => SelfAssessmentData | null;
  isSelfAssessmentCompleted: () => boolean;
  
  // Progress Tracking
  getOnboardingProgress: () => { questionnaire: number; assessment: number; overall: number };
  getCompletionStatus: () => { questionnaire: boolean; assessment: boolean; overall: boolean };
  
  // Insights & Analysis
  getOnboardingInsights: () => OnboardingInsights | null;
  getPersonalizedRecommendations: () => string[];
  calculateAttachmentScore: () => number;
  getUserProfile: () => any;
  
  // Utility
  clearOnboardingData: () => Promise<void>;
  exportOnboardingData: () => any;
  resetProgress: () => Promise<void>;
  
  // Legacy Compatibility
  getOnboardingStatusFromAuth: () => { questionnaire: boolean; assessment: boolean };
}

// ================================
// CREATE CONTEXT
// ================================
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// ================================
// FIREBASE UTILITIES - SIMPLIFIED
// ================================
const getOnboardingCollections = (userId: string) => {
  if (!db) {
    console.warn('Firebase not available');
    return null;
  }
  
  return {
    questionnaires: collection(db, 'users', userId, 'questionnaires'),
    selfAssessments: collection(db, 'users', userId, 'selfAssessments'),
    progressDrafts: collection(db, 'users', userId, 'progressDrafts')
  };
};

// ================================
// ONBOARDING PROVIDER IMPLEMENTATION
// ================================
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // STORAGE UTILITIES (UNCHANGED)
  // ================================
  const getQuestionnaireStorageKey = useCallback((): string => {
    return currentUser?.uid ? `questionnaire_${currentUser.uid}` : 'questionnaire';
  }, [currentUser?.uid]);

  const getSelfAssessmentStorageKey = useCallback((): string => {
    return currentUser?.uid ? `selfAssessment_${currentUser.uid}` : 'selfAssessment';
  }, [currentUser?.uid]);

  // ================================
  // FIREBASE OPERATIONS - SIMPLIFIED WITH ERROR HANDLING
  // ================================
  const saveQuestionnaireToFirestore = useCallback(async (questionnaireData: QuestionnaireData) => {
    if (!currentUser?.uid || !db) {
      console.log('📱 Firebase not available, using localStorage only');
      return null;
    }

    try {
      const collections = getOnboardingCollections(currentUser.uid);
      if (!collections) return null;

      const firestoreData = {
        ...questionnaireData,
        userId: currentUser.uid,
        createdAt: questionnaireData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (questionnaireData.firestoreId) {
        // Update existing document
        const docRef = doc(collections.questionnaires, questionnaireData.firestoreId);
        await updateDoc(docRef, firestoreData);
        console.log('✅ Updated questionnaire in Firestore:', questionnaireData.firestoreId);
        return questionnaireData.firestoreId;
      } else {
        // Create new document
        const docRef = await addDoc(collections.questionnaires, firestoreData);
        console.log('✅ Saved questionnaire to Firestore:', docRef.id);
        return docRef.id;
      }
    } catch (error) {
      console.error('❌ Error saving questionnaire to Firestore:', error);
      setError('Failed to save questionnaire to cloud. Data saved locally.');
      return null;
    }
  }, [currentUser?.uid]);

  const saveSelfAssessmentToFirestore = useCallback(async (assessmentData: SelfAssessmentData) => {
    if (!currentUser?.uid || !db) {
      console.log('📱 Firebase not available, using localStorage only');
      return null;
    }

    try {
      const collections = getOnboardingCollections(currentUser.uid);
      if (!collections) return null;

      const firestoreData = {
        ...assessmentData,
        userId: currentUser.uid,
        createdAt: assessmentData.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (assessmentData.firestoreId) {
        // Update existing document
        const docRef = doc(collections.selfAssessments, assessmentData.firestoreId);
        await updateDoc(docRef, firestoreData);
        console.log('✅ Updated self-assessment in Firestore:', assessmentData.firestoreId);
        return assessmentData.firestoreId;
      } else {
        // Create new document
        const docRef = await addDoc(collections.selfAssessments, firestoreData);
        console.log('✅ Saved self-assessment to Firestore:', docRef.id);
        return docRef.id;
      }
    } catch (error) {
      console.error('❌ Error saving self-assessment to Firestore:', error);
      setError('Failed to save assessment to cloud. Data saved locally.');
      return null;
    }
  }, [currentUser?.uid]);

  const loadFromFirestore = useCallback(async () => {
    if (!currentUser?.uid || !db) {
      console.log('📱 Firebase not available, using localStorage only');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const collections = getOnboardingCollections(currentUser.uid);
      if (!collections) return;

      // Load questionnaire
      const questionnaireQuery = query(
        collections.questionnaires,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const selfAssessmentQuery = query(
        collections.selfAssessments,
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      // Set up real-time listeners for questionnaire
      const unsubscribeQuestionnaire = onSnapshot(questionnaireQuery, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const questionnaireData = {
            ...latestDoc.data(),
            firestoreId: latestDoc.id,
            createdAt: latestDoc.data().createdAt?.toDate?.()?.toISOString(),
            updatedAt: latestDoc.data().updatedAt?.toDate?.()?.toISOString()
          } as QuestionnaireData;
          
          setQuestionnaire(questionnaireData);
          console.log('📦 Loaded questionnaire from Firestore (real-time)');
        }
      }, (error) => {
        console.warn('Failed to load questionnaire from Firestore:', error);
        setError('Failed to sync questionnaire from cloud');
      });

      // Set up real-time listeners for self-assessment
      const unsubscribeSelfAssessment = onSnapshot(selfAssessmentQuery, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const assessmentData = {
            ...latestDoc.data(),
            firestoreId: latestDoc.id,
            createdAt: latestDoc.data().createdAt?.toDate?.()?.toISOString(),
            updatedAt: latestDoc.data().updatedAt?.toDate?.()?.toISOString()
          } as SelfAssessmentData;
          
          setSelfAssessment(assessmentData);
          console.log('📦 Loaded self-assessment from Firestore (real-time)');
        }
      }, (error) => {
        console.warn('Failed to load self-assessment from Firestore:', error);
        setError('Failed to sync assessment from cloud');
      });

      // Return cleanup function
      return () => {
        unsubscribeQuestionnaire();
        unsubscribeSelfAssessment();
      };

    } catch (error) {
      console.error('❌ Error loading from Firestore:', error);
      setError('Failed to load data from cloud');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid]);

  // ================================
  // EMIT COMPLETION EVENTS (UNCHANGED)
  // ================================
  const emitOnboardingEvent = useCallback((eventType: 'questionnaire' | 'selfAssessment', data: any) => {
    const event = new CustomEvent('onboardingUpdated', {
      detail: {
        type: eventType,
        data: data,
        timestamp: new Date().toISOString(),
        userId: currentUser?.uid
      }
    });
    window.dispatchEvent(event);
    
    // Also emit specific events
    const specificEvent = new CustomEvent(`${eventType}Completed`, {
      detail: {
        data: data,
        timestamp: new Date().toISOString(),
        userId: currentUser?.uid
      }
    });
    window.dispatchEvent(specificEvent);
    
    console.log(`🎯 Emitted ${eventType} completion event:`, data);
  }, [currentUser?.uid]);

  // ================================
  // STORAGE MANAGEMENT (UNCHANGED)
  // ================================
  const saveToStorage = useCallback((questionnaireData: QuestionnaireData | null, assessmentData: SelfAssessmentData | null) => {
    try {
      if (questionnaireData) {
        const questionnaireKey = getQuestionnaireStorageKey();
        localStorage.setItem(questionnaireKey, JSON.stringify(questionnaireData));
        // Legacy compatibility
        localStorage.setItem('questionnaire_responses', JSON.stringify(questionnaireData.responses));
        localStorage.setItem('questionnaire_completed', questionnaireData.completed ? 'true' : 'false');
        console.log('💾 Saved questionnaire to localStorage');
      }
      
      if (assessmentData) {
        const assessmentKey = getSelfAssessmentStorageKey();
        localStorage.setItem(assessmentKey, JSON.stringify(assessmentData));
        // Legacy compatibility - CRITICAL for happiness calculation
        localStorage.setItem('self_assessment_responses', JSON.stringify(assessmentData));
        localStorage.setItem('self_assessment_completed', assessmentData.completed ? 'true' : 'false');
        localStorage.setItem('selfAssessment', JSON.stringify(assessmentData));
        console.log('💾 Saved self-assessment to localStorage');
      }
    } catch (error) {
      console.warn('Failed to save onboarding data to localStorage:', error);
    }
  }, [getQuestionnaireStorageKey, getSelfAssessmentStorageKey]);

  const loadFromStorage = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Load questionnaire
      const questionnaireKey = getQuestionnaireStorageKey();
      const questionnaireData = localStorage.getItem(questionnaireKey);
      if (questionnaireData) {
        try {
          const parsedQuestionnaire = JSON.parse(questionnaireData);
          setQuestionnaire(parsedQuestionnaire);
          console.log('📦 Loaded questionnaire from localStorage');
        } catch (parseError) {
          console.warn('Error parsing questionnaire data:', parseError);
        }
      } else {
        // Try legacy storage
        const legacyResponses = localStorage.getItem('questionnaire_responses');
        const legacyCompleted = localStorage.getItem('questionnaire_completed') === 'true';
        
        if (legacyResponses) {
          try {
            const responses = JSON.parse(legacyResponses);
            const legacyQuestionnaire: QuestionnaireData = {
              completed: legacyCompleted,
              completedAt: legacyCompleted ? new Date().toISOString() : undefined,
              responses
            };
            setQuestionnaire(legacyQuestionnaire);
            console.log('📦 Migrated questionnaire from legacy localStorage');
          } catch (parseError) {
            console.warn('Error parsing legacy questionnaire data:', parseError);
          }
        }
      }
      
      // Load self-assessment
      const assessmentKey = getSelfAssessmentStorageKey();
      const assessmentData = localStorage.getItem(assessmentKey);
      if (assessmentData) {
        try {
          const parsedAssessment = JSON.parse(assessmentData);
          setSelfAssessment(parsedAssessment);
          console.log('📦 Loaded self-assessment from localStorage');
        } catch (parseError) {
          console.warn('Error parsing self-assessment data:', parseError);
        }
      } else {
        // Try legacy storage
        const legacyAssessment = localStorage.getItem('selfAssessment');
        if (legacyAssessment) {
          try {
            const assessment = JSON.parse(legacyAssessment);
            setSelfAssessment(assessment);
            console.log('📦 Migrated self-assessment from legacy localStorage');
          } catch (parseError) {
            console.warn('Error parsing legacy self-assessment data:', parseError);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load onboarding data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getQuestionnaireStorageKey, getSelfAssessmentStorageKey]);

  // ================================
  // QUESTIONNAIRE MANAGEMENT (UNCHANGED FUNCTIONALITY)
  // ================================
  const updateQuestionnaire = useCallback(async (questionnaireData: Omit<QuestionnaireData, 'completed' | 'completedAt'>) => {
    const updatedQuestionnaire: QuestionnaireData = {
      ...questionnaireData,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to Firestore first (if available)
    const firestoreId = await saveQuestionnaireToFirestore(updatedQuestionnaire);
    if (firestoreId) {
      updatedQuestionnaire.firestoreId = firestoreId;
    }
    
    setQuestionnaire(updatedQuestionnaire);
    saveToStorage(updatedQuestionnaire, selfAssessment);
    emitOnboardingEvent('questionnaire', updatedQuestionnaire);
  }, [selfAssessment, saveQuestionnaireToFirestore, saveToStorage, emitOnboardingEvent]);

  const markQuestionnaireComplete = useCallback(async (responses: any) => {
    // Handle both raw responses and already-structured data
    let cleanResponses = responses;
    
    if (responses.completed || responses.completedAt) {
      const { completed, completedAt, totalQuestions, answeredQuestions, ...rawData } = responses;
      cleanResponses = rawData;
    }
    
    const questionnaireData: QuestionnaireData = {
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: {
        experience_level: cleanResponses.experience_level || 1,
        goals: cleanResponses.goals || [],
        age_range: cleanResponses.age_range || '',
        location: cleanResponses.location || '',
        occupation: cleanResponses.occupation || '',
        education_level: cleanResponses.education_level || '',
        meditation_background: cleanResponses.meditation_background || '',
        sleep_pattern: cleanResponses.sleep_pattern || 5,
        physical_activity: cleanResponses.physical_activity || '',
        stress_triggers: cleanResponses.stress_triggers || [],
        daily_routine: cleanResponses.daily_routine || '',
        diet_pattern: cleanResponses.diet_pattern || '',
        screen_time: cleanResponses.screen_time || '',
        social_connections: cleanResponses.social_connections || '',
        work_life_balance: cleanResponses.work_life_balance || '',
        emotional_awareness: cleanResponses.emotional_awareness || 5,
        stress_response: cleanResponses.stress_response || '',
        decision_making: cleanResponses.decision_making || '',
        self_reflection: cleanResponses.self_reflection || '',
        thought_patterns: cleanResponses.thought_patterns || '',
        mindfulness_in_daily_life: cleanResponses.mindfulness_in_daily_life || '',
        mindfulness_experience: cleanResponses.mindfulness_experience || 1,
        meditation_background_detail: cleanResponses.meditation_background_detail || '',
        practice_goals: cleanResponses.practice_goals || '',
        preferred_duration: cleanResponses.preferred_duration || 10,
        biggest_challenges: cleanResponses.biggest_challenges || '',
        motivation: cleanResponses.motivation || '',
        totalQuestions: cleanResponses.totalQuestions || 27,
        answeredQuestions: cleanResponses.answeredQuestions || Object.keys(cleanResponses).length,
        ...cleanResponses
      }
    };
    
    // Save to Firestore first (if available)
    const firestoreId = await saveQuestionnaireToFirestore(questionnaireData);
    if (firestoreId) {
      questionnaireData.firestoreId = firestoreId;
    }
    
    setQuestionnaire(questionnaireData);
    saveToStorage(questionnaireData, selfAssessment);
    emitOnboardingEvent('questionnaire', questionnaireData);
  }, [selfAssessment, saveQuestionnaireToFirestore, saveToStorage, emitOnboardingEvent]);

  const saveQuestionnaireProgress = useCallback(async (responses: any, currentQuestion?: number) => {
    if (!currentUser?.uid || !db) {
      // Fallback to localStorage for non-authenticated users or when Firebase unavailable
      localStorage.setItem('questionnaire_progress', JSON.stringify({
        responses,
        currentQuestion,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    try {
      const collections = getOnboardingCollections(currentUser.uid);
      if (!collections) return;

      const progressData = {
        type: 'questionnaire_progress',
        responses,
        currentQuestion,
        userId: currentUser.uid,
        updatedAt: Timestamp.now()
      };

      // Save/update progress draft in Firestore
      const progressDocRef = doc(collections.progressDrafts, 'questionnaire');
      await setDoc(progressDocRef, progressData, { merge: true });
      
      console.log('💾 Saved questionnaire progress to Firestore');
    } catch (error) {
      console.error('❌ Error saving questionnaire progress:', error);
      // Fallback to localStorage
      localStorage.setItem('questionnaire_progress', JSON.stringify({
        responses,
        currentQuestion,
        timestamp: new Date().toISOString()
      }));
    }
  }, [currentUser?.uid]);

  const getQuestionnaire = useCallback((): QuestionnaireData | null => {
    return questionnaire;
  }, [questionnaire]);

  const isQuestionnaireCompleted = useCallback((): boolean => {
    return questionnaire?.completed || false;
  }, [questionnaire?.completed]);

  // ================================
  // SELF-ASSESSMENT MANAGEMENT (UNCHANGED FUNCTIONALITY)
  // ================================
  const updateSelfAssessment = useCallback(async (selfAssessmentData: Omit<SelfAssessmentData, 'completed' | 'completedAt'>) => {
    const updatedAssessment: SelfAssessmentData = {
      ...selfAssessmentData,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as SelfAssessmentData;
    
    // Save to Firestore first (if available)
    const firestoreId = await saveSelfAssessmentToFirestore(updatedAssessment);
    if (firestoreId) {
      updatedAssessment.firestoreId = firestoreId;
    }
    
    setSelfAssessment(updatedAssessment);
    saveToStorage(questionnaire, updatedAssessment);
    emitOnboardingEvent('selfAssessment', updatedAssessment);
  }, [questionnaire, saveSelfAssessmentToFirestore, saveToStorage, emitOnboardingEvent]);

  const markSelfAssessmentComplete = useCallback(async (responses: any) => {
    console.log('🎯 Marking self-assessment complete with responses:', responses);
    
    let selfAssessmentData: SelfAssessmentData;
    
    // Handle multiple input formats
    if (responses.categories || responses.responses) {
      // Enhanced format from SelfAssessment component
      const categories = responses.categories || responses.responses || {};
      
      selfAssessmentData = {
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        format: responses.format || 'standard',
        version: responses.version || '2.0',
        type: responses.type || 'selfAssessment',
        
        // Direct category values
        taste: responses.taste || categories.taste?.level || 'none',
        smell: responses.smell || categories.smell?.level || 'none',
        sound: responses.sound || categories.sound?.level || 'none',
        sight: responses.sight || categories.sight?.level || 'none',
        touch: responses.touch || categories.touch?.level || 'none',
        mind: responses.mind || categories.mind?.level || 'none',
        
        // Categories object format
        categories: responses.categories || {
          taste: { level: responses.taste || categories.taste?.level || 'none', category: 'taste', details: categories.taste?.details || '' },
          smell: { level: responses.smell || categories.smell?.level || 'none', category: 'smell', details: categories.smell?.details || '' },
          sound: { level: responses.sound || categories.sound?.level || 'none', category: 'sound', details: categories.sound?.details || '' },
          sight: { level: responses.sight || categories.sight?.level || 'none', category: 'sight', details: categories.sight?.details || '' },
          touch: { level: responses.touch || categories.touch?.level || 'none', category: 'touch', details: categories.touch?.details || '' },
          mind: { level: responses.mind || categories.mind?.level || 'none', category: 'mind', details: categories.mind?.details || '' }
        },
        
        // CRITICAL: Responses object (for happiness calculator compatibility)
        responses: responses.responses || responses.categories || {
          taste: { level: responses.taste || categories.taste?.level || 'none', category: 'taste', details: categories.taste?.details || '' },
          smell: { level: responses.smell || categories.smell?.level || 'none', category: 'smell', details: categories.smell?.details || '' },
          sound: { level: responses.sound || categories.sound?.level || 'none', category: 'sound', details: categories.sound?.details || '' },
          sight: { level: responses.sight || categories.sight?.level || 'none', category: 'sight', details: categories.sight?.details || '' },
          touch: { level: responses.touch || categories.touch?.level || 'none', category: 'touch', details: categories.touch?.details || '' },
          mind: { level: responses.mind || categories.mind?.level || 'none', category: 'mind', details: categories.mind?.details || '' }
        },
        
        // Pre-calculated scores
        attachmentScore: responses.attachmentScore || 0,
        nonAttachmentCount: responses.nonAttachmentCount || 0,
        
        // Metrics object
        metrics: responses.metrics || {
          nonAttachmentCount: responses.nonAttachmentCount || 0,
          attachmentScore: responses.attachmentScore || 0,
          attachmentLevel: responses.attachmentLevel || 'Unknown'
        }
      };
    } else {
      // Legacy format handling
      selfAssessmentData = {
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        format: 'standard',
        version: '2.0',
        type: 'selfAssessment',
        
        // Direct category values
        taste: responses.taste || 'none',
        smell: responses.smell || 'none',
        sound: responses.sound || 'none',
        sight: responses.sight || 'none',
        touch: responses.touch || 'none',
        mind: responses.mind || 'none',
        
        // Categories object
        categories: {
          taste: { level: responses.taste || 'none', category: 'taste' },
          smell: { level: responses.smell || 'none', category: 'smell' },
          sound: { level: responses.sound || 'none', category: 'sound' },
          sight: { level: responses.sight || 'none', category: 'sight' },
          touch: { level: responses.touch || 'none', category: 'touch' },
          mind: { level: responses.mind || 'none', category: 'mind' }
        },
        
        // CRITICAL: Responses object (duplicate of categories for compatibility)
        responses: {
          taste: { level: responses.taste || 'none', category: 'taste' },
          smell: { level: responses.smell || 'none', category: 'smell' },
          sound: { level: responses.sound || 'none', category: 'sound' },
          sight: { level: responses.sight || 'none', category: 'sight' },
          touch: { level: responses.touch || 'none', category: 'touch' },
          mind: { level: responses.mind || 'none', category: 'mind' }
        },
        
        // Pre-calculated scores
        attachmentScore: responses.attachmentScore || 0,
        nonAttachmentCount: responses.nonAttachmentCount || 0,
        
        // Metrics object
        metrics: {
          nonAttachmentCount: responses.nonAttachmentCount || 0,
          attachmentScore: responses.attachmentScore || 0,
          attachmentLevel: responses.attachmentLevel || 'Unknown'
        }
      };
    }
    
    console.log('🎯 Created self-assessment data:', selfAssessmentData);
    
    // Save to Firestore first (if available)
    const firestoreId = await saveSelfAssessmentToFirestore(selfAssessmentData);
    if (firestoreId) {
      selfAssessmentData.firestoreId = firestoreId;
    }
    
    setSelfAssessment(selfAssessmentData);
    saveToStorage(questionnaire, selfAssessmentData);
    emitOnboardingEvent('selfAssessment', selfAssessmentData);
    
    // Trigger happiness recalculation
    setTimeout(() => {
      const happinessEvent = new CustomEvent('triggerHappinessRecalculation', {
        detail: {
          source: 'selfAssessmentComplete',
          data: selfAssessmentData,
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(happinessEvent);
      console.log('🚀 Triggered happiness recalculation from self-assessment completion');
    }, 100);
    
    // Force storage event for cross-tab communication
    setTimeout(() => {
      localStorage.setItem('lastAssessmentUpdate', new Date().toISOString());
    }, 150);
  }, [questionnaire, saveSelfAssessmentToFirestore, saveToStorage, emitOnboardingEvent]);

  const saveSelfAssessmentProgress = useCallback(async (responses: any) => {
    if (!currentUser?.uid || !db) {
      // Fallback to localStorage for non-authenticated users or when Firebase unavailable
      localStorage.setItem('self_assessment_progress', JSON.stringify({
        responses,
        timestamp: new Date().toISOString()
      }));
      return;
    }

    try {
      const collections = getOnboardingCollections(currentUser.uid);
      if (!collections) return;

      const progressData = {
        type: 'self_assessment_progress',
        responses,
        userId: currentUser.uid,
        updatedAt: Timestamp.now()
      };

      // Save/update progress draft in Firestore
      const progressDocRef = doc(collections.progressDrafts, 'selfAssessment');
      await setDoc(progressDocRef, progressData, { merge: true });
      
      console.log('💾 Saved self-assessment progress to Firestore');
    } catch (error) {
      console.error('❌ Error saving self-assessment progress:', error);
      // Fallback to localStorage
      localStorage.setItem('self_assessment_progress', JSON.stringify({
        responses,
        timestamp: new Date().toISOString()
      }));
    }
  }, [currentUser?.uid]);

  const getSelfAssessment = useCallback((): SelfAssessmentData | null => {
    return selfAssessment;
  }, [selfAssessment]);

  const isSelfAssessmentCompleted = useCallback((): boolean => {
    return selfAssessment?.completed || false;
  }, [selfAssessment?.completed]);

  // ================================
  // PROGRESS TRACKING (UNCHANGED)
  // ================================
  const getOnboardingProgress = useCallback(() => {
    const questionnaireProgress = questionnaire?.completed ? 100 : 
      questionnaire?.responses?.answeredQuestions ? 
      Math.round((questionnaire.responses.answeredQuestions / (questionnaire.responses.totalQuestions || 27)) * 100) : 0;
    
    const assessmentProgress = selfAssessment?.completed ? 100 : 0;
    
    const overall = Math.round((questionnaireProgress + assessmentProgress) / 2);
    
    return {
      questionnaire: questionnaireProgress,
      assessment: assessmentProgress,
      overall
    };
  }, [questionnaire, selfAssessment]);

  const getCompletionStatus = useCallback(() => {
    const questionnaireCompleted = questionnaire?.completed || false;
    const assessmentCompleted = selfAssessment?.completed || false;
    const overallCompleted = questionnaireCompleted && assessmentCompleted;
    
    return {
      questionnaire: questionnaireCompleted,
      assessment: assessmentCompleted,
      overall: overallCompleted
    };
  }, [questionnaire?.completed, selfAssessment?.completed]);

  // ================================
  // INSIGHTS & ANALYSIS (UNCHANGED)
  // ================================
  const getOnboardingInsights = useCallback((): OnboardingInsights | null => {
    if (!questionnaire?.completed || !selfAssessment?.completed) {
      return null;
    }
    
    const responses = questionnaire.responses;
    const assessment = selfAssessment;
    
    // Determine user type
    let userType: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (responses.experience_level >= 7 && responses.mindfulness_experience >= 7) {
      userType = 'advanced';
    } else if (responses.experience_level >= 4 || responses.mindfulness_experience >= 4) {
      userType = 'intermediate';
    }
    
    // Recommended start stage
    const recommendedStartStage = userType === 'beginner' ? 1 : userType === 'intermediate' ? 2 : 3;
    
    // Primary goals
    const primaryGoals = Array.isArray(responses.goals) ? responses.goals : [];
    
    // Stress triggers
    const stressTriggers = Array.isArray(responses.stress_triggers) ? responses.stress_triggers : [];
    
    // Optimal practice time (infer from responses)
    const optimalPracticeTime = responses.daily_routine || 'morning';
    
    // Recommended duration
    const recommendedDuration = responses.preferred_duration || (userType === 'beginner' ? 10 : userType === 'intermediate' ? 15 : 20);
    
    // Attachment level
    const attachmentLevel = assessment.metrics?.attachmentLevel || 'Unknown';
    
    // Personalized tips
    const personalizedTips: string[] = [];
    
    if (userType === 'beginner') {
      personalizedTips.push("Start with short, guided sessions to build consistency");
      personalizedTips.push("Focus on breath awareness and body sensations");
    }
    
    if (stressTriggers.length > 0) {
      personalizedTips.push(`Consider practicing before ${stressTriggers[0]} situations`);
    }
    
    if (responses.sleep_pattern < 5) {
      personalizedTips.push("Evening meditation sessions might help improve sleep quality");
    }
    
    if (assessment.nonAttachmentCount < 3) {
      personalizedTips.push("Practice mindful observation without judgment");
    }
    
    return {
      userType,
      recommendedStartStage,
      primaryGoals,
      stressTriggers,
      optimalPracticeTime,
      recommendedDuration,
      attachmentLevel,
      personalizedTips
    };
  }, [questionnaire, selfAssessment]);

  const getPersonalizedRecommendations = useCallback((): string[] => {
    const insights = getOnboardingInsights();
    if (!insights) return [];
    
    return insights.personalizedTips;
  }, [getOnboardingInsights]);

  const calculateAttachmentScore = useCallback((): number => {
    if (!selfAssessment?.completed) return 0;
    return selfAssessment.attachmentScore || 0;
  }, [selfAssessment]);

  const getUserProfile = useCallback(() => {
    if (!questionnaire?.completed || !selfAssessment?.completed) return null;
    
    return {
      questionnaire: questionnaire.responses,
      selfAssessment: selfAssessment,
      insights: getOnboardingInsights(),
      profileCreatedAt: new Date().toISOString()
    };
  }, [questionnaire, selfAssessment, getOnboardingInsights]);

  // ================================
  // UTILITY METHODS (UNCHANGED)
  // ================================
  const clearOnboardingData = useCallback(async () => {
    setQuestionnaire(null);
    setSelfAssessment(null);
    
    // Clear Firestore data (if available)
    if (currentUser?.uid && db) {
      try {
        console.log('🗑️ Clearing Firestore data for user:', currentUser.uid);
        // Note: In a real app, you might want to delete documents individually
        // or mark them as deleted rather than actually deleting them
      } catch (error) {
        console.error('❌ Error clearing Firestore data:', error);
      }
    }
    
    // Clear localStorage
    try {
      const questionnaireKey = getQuestionnaireStorageKey();
      const assessmentKey = getSelfAssessmentStorageKey();
      
      localStorage.removeItem(questionnaireKey);
      localStorage.removeItem(assessmentKey);
      localStorage.removeItem('questionnaire_responses');
      localStorage.removeItem('questionnaire_completed');
      localStorage.removeItem('self_assessment_responses');
      localStorage.removeItem('self_assessment_completed');
      localStorage.removeItem('selfAssessment');
      localStorage.removeItem('lastAssessmentUpdate');
      localStorage.removeItem('questionnaire_progress');
      localStorage.removeItem('self_assessment_progress');
    } catch (error) {
      console.warn('Failed to clear localStorage onboarding data:', error);
    }
  }, [currentUser?.uid, getQuestionnaireStorageKey, getSelfAssessmentStorageKey]);

  const exportOnboardingData = useCallback(() => {
    return {
      questionnaire: questionnaire,
      selfAssessment: selfAssessment,
      insights: getOnboardingInsights(),
      progress: getOnboardingProgress(),
      exportedAt: new Date().toISOString()
    };
  }, [questionnaire, selfAssessment, getOnboardingInsights, getOnboardingProgress]);

  const resetProgress = useCallback(async () => {
    await clearOnboardingData();
  }, [clearOnboardingData]);

  // ================================
  // LEGACY COMPATIBILITY (UNCHANGED)
  // ================================
  const getOnboardingStatusFromAuth = useCallback(() => {
    return {
      questionnaire: isQuestionnaireCompleted(),
      assessment: isSelfAssessmentCompleted()
    };
  }, [isQuestionnaireCompleted, isSelfAssessmentCompleted]);

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeData = async () => {
      if (currentUser?.uid && db) {
        // Load from Firestore with real-time updates (if available)
        try {
          unsubscribe = await loadFromFirestore();
        } catch (error) {
          console.warn('Firestore initialization failed, using localStorage:', error);
          await loadFromStorage();
        }
      } else {
        // Load from localStorage for non-authenticated users or when Firebase unavailable
        await loadFromStorage();
      }
    };

    initializeData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid, loadFromFirestore, loadFromStorage]);

  // ================================
  // CONTEXT VALUE (UNCHANGED)
  // ================================
  const contextValue: OnboardingContextType = useMemo(() => ({
    // Data
    questionnaire,
    selfAssessment,
    isLoading,
    
    // Questionnaire Management
    updateQuestionnaire,
    markQuestionnaireComplete,
    saveQuestionnaireProgress,
    getQuestionnaire,
    isQuestionnaireCompleted,
    
    // Self-Assessment Management
    updateSelfAssessment,
    markSelfAssessmentComplete,
    saveSelfAssessmentProgress,
    getSelfAssessment,
    isSelfAssessmentCompleted,
    
    // Progress Tracking
    getOnboardingProgress,
    getCompletionStatus,
    
    // Insights & Analysis
    getOnboardingInsights,
    getPersonalizedRecommendations,
    calculateAttachmentScore,
    getUserProfile,
    
    // Utility
    clearOnboardingData,
    exportOnboardingData,
    resetProgress,
    
    // Legacy Compatibility
    getOnboardingStatusFromAuth
  }), [
    questionnaire, selfAssessment, isLoading,
    updateQuestionnaire, markQuestionnaireComplete, saveQuestionnaireProgress, getQuestionnaire, isQuestionnaireCompleted,
    updateSelfAssessment, markSelfAssessmentComplete, saveSelfAssessmentProgress, getSelfAssessment, isSelfAssessmentCompleted,
    getOnboardingProgress, getCompletionStatus,
    getOnboardingInsights, getPersonalizedRecommendations, calculateAttachmentScore, getUserProfile,
    clearOnboardingData, exportOnboardingData, resetProgress,
    getOnboardingStatusFromAuth
  ]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// ================================
// CUSTOM HOOK (UNCHANGED)
// ================================
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;