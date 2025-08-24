// ✅ FIXED OnboardingContext - Root Collections Implementation with Single Document Progress
// File: src/contexts/onboarding/OnboardingContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  doc, 
  collection, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// ONBOARDING DATA INTERFACES
// ================================
interface QuestionnaireData {
  userId: string; // ✅ Added for root collection
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
  userId: string; // ✅ Added for root collection
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
  
  // ✅ NEW: Progress utilities
  getProgressStatus: () => Promise<any>;
  cleanupOldProgressDocuments: () => Promise<void>;
  
  // Legacy Compatibility
  getOnboardingStatusFromAuth: () => { questionnaire: boolean; assessment: boolean };
}

// ================================
// CREATE CONTEXT
// ================================
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// ================================
// ROOT COLLECTIONS ONBOARDING PROVIDER WITH REAL-TIME LISTENERS
// ================================
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // ✅ ROOT COLLECTIONS SAVE OPERATIONS
  // ================================
  const saveQuestionnaireToFirebase = useCallback(async (questionnaireData: QuestionnaireData) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }
    
    try {
      const questionnaireDoc = {
        ...questionnaireData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // ✅ Save to ROOT collection instead of subcollection
      await addDoc(collection(db, 'questionnaires'), questionnaireDoc);
      console.log(`✅ Questionnaire saved to ROOT collection for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save questionnaire to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const saveSelfAssessmentToFirebase = useCallback(async (assessmentData: SelfAssessmentData) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }
    
    try {
      const assessmentDoc = {
        ...assessmentData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // ✅ Save to ROOT collection instead of subcollection
      await addDoc(collection(db, 'selfAssessments'), assessmentDoc);
      console.log(`✅ Self-assessment saved to ROOT collection for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save self-assessment to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  // ================================
  // ✅ ROOT COLLECTIONS REAL-TIME LISTENERS
  // ================================
  useEffect(() => {
    if (!currentUser?.uid) {
      setQuestionnaire(null);
      setSelfAssessment(null);
      setIsLoading(false);
      return;
    }

    console.log(`🔄 Setting up real-time ROOT collection listeners for user: ${currentUser.uid.substring(0, 8)}...`);
    setIsLoading(true);

    // ✅ Real-time listener for questionnaire from ROOT collection
    const questionnaireQuery = query(
      collection(db, 'questionnaires'),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribeQuestionnaire = onSnapshot(questionnaireQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0]; // Get first (should be only one)
        const data = docSnapshot.data();
        const questionnaireData = {
          ...data,
          firestoreId: docSnapshot.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
        } as QuestionnaireData;
        setQuestionnaire(questionnaireData);
        console.log(`🔄 Real-time questionnaire update from ROOT collection for user ${currentUser.uid.substring(0, 8)}...`);
      } else {
        setQuestionnaire(null);
      }
    }, (error) => {
      console.error('❌ Questionnaire ROOT collection listener error:', error);
    });

    // ✅ Real-time listener for self-assessment from ROOT collection
    const assessmentQuery = query(
      collection(db, 'selfAssessments'),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribeAssessment = onSnapshot(assessmentQuery, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0]; // Get first (should be only one)
        const data = docSnapshot.data();
        const assessmentData = {
          ...data,
          firestoreId: docSnapshot.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
        } as SelfAssessmentData;
        setSelfAssessment(assessmentData);
        console.log(`🔄 Real-time self-assessment update from ROOT collection for user ${currentUser.uid.substring(0, 8)}...`);
      } else {
        setSelfAssessment(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Self-assessment ROOT collection listener error:', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeQuestionnaire();
      unsubscribeAssessment();
    };
  }, [currentUser?.uid]);

  // ================================
  // EVENT EMISSION
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
  // QUESTIONNAIRE MANAGEMENT
  // ================================
  const updateQuestionnaire = useCallback(async (questionnaireData: Omit<QuestionnaireData, 'completed' | 'completedAt'>) => {
    const updatedQuestionnaire: QuestionnaireData = {
      ...questionnaireData,
      userId: currentUser?.uid || '',
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // ✅ NO IMMEDIATE STATE UPDATE - Real-time listener will handle this
      await saveQuestionnaireToFirebase(updatedQuestionnaire);
      emitOnboardingEvent('questionnaire', updatedQuestionnaire);
      console.log('🔄 Real-time listener will update questionnaire automatically...');
    } catch (error) {
      console.error('❌ Failed to update questionnaire:', error);
      throw error;
    }
  }, [currentUser?.uid, saveQuestionnaireToFirebase, emitOnboardingEvent]);

  const markQuestionnaireComplete = useCallback(async (responses: any) => {
    // Handle both raw responses and already-structured data
    let cleanResponses = responses;
    
    if (responses.completed || responses.completedAt) {
      const { completed, completedAt, totalQuestions, answeredQuestions, ...rawData } = responses;
      cleanResponses = rawData;
    }
    
    const questionnaireData: QuestionnaireData = {
      userId: currentUser?.uid || '',
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
    
    try {
      // ✅ NO IMMEDIATE STATE UPDATE - Real-time listener will handle this
      await saveQuestionnaireToFirebase(questionnaireData);
      emitOnboardingEvent('questionnaire', questionnaireData);
      console.log('🔄 Real-time listener will update questionnaire automatically...');
    } catch (error) {
      console.error('❌ Failed to complete questionnaire:', error);
      throw error;
    }
  }, [currentUser?.uid, saveQuestionnaireToFirebase, emitOnboardingEvent]);

  // ✅ FIXED: Questionnaire Progress - Single Document Update
  const saveQuestionnaireProgress = useCallback(async (responses: any, currentQuestion?: number) => {
    if (!currentUser?.uid) return;

    try {
      // Calculate completion percentage
      const totalQuestions = 27;
      const completionPercentage = currentQuestion ? Math.round((currentQuestion / totalQuestions) * 100) : 0;
      const answeredQuestions = responses ? Object.keys(responses).length : 0;

      const progressData = {
        type: 'questionnaire_progress',
        userId: currentUser.uid,
        responses: responses || {},
        currentQuestion: currentQuestion || answeredQuestions,
        totalQuestions,
        completionPercentage,
        answeredQuestions,
        isComplete: completionPercentage >= 100,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // Will only set on first creation
        version: '2.0', // ✅ Version to distinguish from old multi-document approach
        source: 'onboarding_context_v2'
      };

      // ✅ FIXED: Use setDoc with merge to update same document
      const docRef = doc(db, 'onboardingProgress', `${currentUser.uid}_questionnaire`);
      await setDoc(docRef, progressData, { merge: true });
      
      console.log('💾 Updated questionnaire progress in ROOT collection:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        currentQuestion: progressData.currentQuestion,
        completionPercentage: progressData.completionPercentage,
        answeredQuestions: progressData.answeredQuestions,
        documentId: `${currentUser.uid}_questionnaire`
      });
    } catch (error) {
      console.error('❌ Error saving questionnaire progress:', error);
    }
  }, [currentUser?.uid]);

  const getQuestionnaire = useCallback((): QuestionnaireData | null => {
    return questionnaire;
  }, [questionnaire]);

  const isQuestionnaireCompleted = useCallback((): boolean => {
    return questionnaire?.completed || false;
  }, [questionnaire?.completed]);

  // ================================
  // SELF-ASSESSMENT MANAGEMENT
  // ================================
  const updateSelfAssessment = useCallback(async (selfAssessmentData: Omit<SelfAssessmentData, 'completed' | 'completedAt'>) => {
    const updatedAssessment: SelfAssessmentData = {
      ...selfAssessmentData,
      userId: currentUser?.uid || '',
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as SelfAssessmentData;
    
    try {
      // ✅ NO IMMEDIATE STATE UPDATE - Real-time listener will handle this
      await saveSelfAssessmentToFirebase(updatedAssessment);
      emitOnboardingEvent('selfAssessment', updatedAssessment);
      console.log('🔄 Real-time listener will update self-assessment automatically...');
    } catch (error) {
      console.error('❌ Failed to update self-assessment:', error);
      throw error;
    }
  }, [currentUser?.uid, saveSelfAssessmentToFirebase, emitOnboardingEvent]);

  const markSelfAssessmentComplete = useCallback(async (responses: any) => {
    console.log('🎯 Marking self-assessment complete with responses:', responses);
    
    let selfAssessmentData: SelfAssessmentData;
    
    // Handle multiple input formats
    if (responses.categories && responses.responses) {
      // Already structured format
      selfAssessmentData = {
        userId: currentUser?.uid || '',
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        format: 'standard',
        version: '1.0',
        type: 'selfAssessment',
        ...responses
      } as SelfAssessmentData;
    } else {
      // Raw responses format - need to structure
      const categories = {
        taste: responses.taste || { level: 'none', category: 'taste' },
        smell: responses.smell || { level: 'none', category: 'smell' },
        sound: responses.sound || { level: 'none', category: 'sound' },
        sight: responses.sight || { level: 'none', category: 'sight' },
        touch: responses.touch || { level: 'none', category: 'touch' },
        mind: responses.mind || { level: 'none', category: 'mind' }
      };
      
      // Calculate scores
      const attachmentScore = Object.values(categories).reduce((score, cat: any) => {
        if (cat.level === 'some') return score + 1;
        if (cat.level === 'strong') return score + 2;
        return score;
      }, 0);
      
      const nonAttachmentCount = Object.values(categories).filter((cat: any) => cat.level === 'none').length;
      
      selfAssessmentData = {
        userId: currentUser?.uid || '',
        completed: true,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        format: 'standard',
        version: '1.0',
        type: 'selfAssessment',
        
        // Direct category values
        taste: categories.taste.level,
        smell: categories.smell.level,
        sound: categories.sound.level,
        sight: categories.sight.level,
        touch: categories.touch.level,
        mind: categories.mind.level,
        
        // Structured formats
        categories,
        responses: categories,
        
        // Calculated scores
        attachmentScore,
        nonAttachmentCount,
        
        // Metrics object
        metrics: {
          nonAttachmentCount,
          attachmentScore,
          attachmentLevel: attachmentScore <= 2 ? 'low' : attachmentScore <= 6 ? 'medium' : 'high'
        }
      };
    }
    
    try {
      // ✅ NO IMMEDIATE STATE UPDATE - Real-time listener will handle this
      await saveSelfAssessmentToFirebase(selfAssessmentData);
      emitOnboardingEvent('selfAssessment', selfAssessmentData);
      console.log('🔄 Real-time listener will update self-assessment automatically...');
    } catch (error) {
      console.error('❌ Failed to save self-assessment:', error);
      throw error;
    }
  }, [currentUser?.uid, saveSelfAssessmentToFirebase, emitOnboardingEvent]);

  // ✅ FIXED: Self-Assessment Progress - Single Document Update
  const saveSelfAssessmentProgress = useCallback(async (responses: any) => {
    if (!currentUser?.uid) {
      throw new Error('User not authenticated');
    }

    try {
      // Calculate completion based on responses
      const categories = ['taste', 'smell', 'sound', 'sight', 'touch', 'mind'];
      const answeredCategories = responses ? Object.keys(responses).filter(key => 
        categories.includes(key) && responses[key]
      ) : [];
      const completionPercentage = Math.round((answeredCategories.length / categories.length) * 100);

      const progressData = {
        type: 'selfAssessment_progress',
        userId: currentUser.uid,
        responses: responses || {},
        answeredCategories,
        totalCategories: categories.length,
        completionPercentage,
        isComplete: completionPercentage >= 100,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(), // Will only set on first creation
        version: '2.0', // ✅ Version to distinguish from old multi-document approach
        source: 'onboarding_context_v2'
      };

      // ✅ FIXED: Use setDoc with merge to update same document
      const docRef = doc(db, 'onboardingProgress', `${currentUser.uid}_selfAssessment`);
      await setDoc(docRef, progressData, { merge: true });
      
      console.log('💾 Updated self-assessment progress in ROOT collection:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        answeredCategories: progressData.answeredCategories.length,
        completionPercentage: progressData.completionPercentage,
        documentId: `${currentUser.uid}_selfAssessment`
      });
    } catch (error) {
      console.error('❌ Error saving self-assessment progress:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const getSelfAssessment = useCallback((): SelfAssessmentData | null => {
    return selfAssessment;
  }, [selfAssessment]);

  const isSelfAssessmentCompleted = useCallback((): boolean => {
    return selfAssessment?.completed || false;
  }, [selfAssessment?.completed]);

  // ================================
  // PROGRESS TRACKING
  // ================================
  const getOnboardingProgress = useCallback(() => {
    const questionnaireProgress = questionnaire?.completed ? 100 : 0;
    const assessmentProgress = selfAssessment?.completed ? 100 : 0;
    const overallProgress = (questionnaireProgress + assessmentProgress) / 2;
    
    return {
      questionnaire: questionnaireProgress,
      assessment: assessmentProgress,
      overall: overallProgress
    };
  }, [questionnaire?.completed, selfAssessment?.completed]);

  const getCompletionStatus = useCallback(() => {
    return {
      questionnaire: questionnaire?.completed || false,
      assessment: selfAssessment?.completed || false,
      overall: (questionnaire?.completed || false) && (selfAssessment?.completed || false)
    };
  }, [questionnaire?.completed, selfAssessment?.completed]);

  // ================================
  // INSIGHTS & ANALYSIS
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

    // Recommended start stage based on experience and attachment
    let recommendedStartStage = 1;
    if (userType === 'intermediate' && assessment.attachmentScore <= 4) {
      recommendedStartStage = 2;
    } else if (userType === 'advanced' && assessment.attachmentScore <= 2) {
      recommendedStartStage = 3;
    }

    return {
      userType,
      recommendedStartStage,
      primaryGoals: responses.goals || [],
      stressTriggers: responses.stress_triggers || [],
      optimalPracticeTime: responses.preferred_duration ? `${responses.preferred_duration} minutes` : '10 minutes',
      recommendedDuration: responses.preferred_duration || 10,
      attachmentLevel: assessment.metrics?.attachmentLevel || 'low',
      personalizedTips: [
        `Start with ${responses.preferred_duration || 10}-minute sessions`,
        `Focus on ${responses.goals?.[0] || 'mindfulness development'}`,
        `Practice during your optimal time based on your ${responses.daily_routine || 'schedule'}`
      ]
    };
  }, [questionnaire, selfAssessment]);

  const getPersonalizedRecommendations = useCallback((): string[] => {
    const insights = getOnboardingInsights();
    if (!insights) return [];

    return insights.personalizedTips;
  }, [getOnboardingInsights]);

  const calculateAttachmentScore = useCallback((): number => {
    return selfAssessment?.attachmentScore || 0;
  }, [selfAssessment?.attachmentScore]);

  const getUserProfile = useCallback(() => {
    return {
      questionnaire,
      selfAssessment,
      insights: getOnboardingInsights(),
      progress: getOnboardingProgress(),
      completionStatus: getCompletionStatus()
    };
  }, [questionnaire, selfAssessment, getOnboardingInsights, getOnboardingProgress, getCompletionStatus]);

  // ================================
  // ✅ UTILITY FUNCTIONS - ROOT COLLECTIONS
  // ================================
  const clearOnboardingData = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      // ✅ Clear questionnaires from ROOT collection
      const questionnaireQuery = query(
        collection(db, 'questionnaires'),
        where('userId', '==', currentUser.uid)
      );
      const questionnaireSnapshot = await getDocs(questionnaireQuery);
      const questionnaireDeletePromises = questionnaireSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // ✅ Clear self assessments from ROOT collection
      const assessmentQuery = query(
        collection(db, 'selfAssessments'),
        where('userId', '==', currentUser.uid)
      );
      const assessmentSnapshot = await getDocs(assessmentQuery);
      const assessmentDeletePromises = assessmentSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // ✅ Clear progress documents from ROOT collection
      const progressQuery = query(
        collection(db, 'onboardingProgress'),
        where('userId', '==', currentUser.uid)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const progressDeletePromises = progressSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all([...questionnaireDeletePromises, ...assessmentDeletePromises, ...progressDeletePromises]);
      
      // Real-time listeners will clear local state automatically
      console.log('🗑️ Cleared all onboarding data from ROOT collections - real-time listeners will update UI');
    } catch (error) {
      console.error('❌ Error clearing onboarding data from ROOT collections:', error);
    }
  }, [currentUser?.uid]);

  const exportOnboardingData = useCallback(() => {
    return {
      questionnaire,
      selfAssessment,
      insights: getOnboardingInsights(),
      progress: getOnboardingProgress(),
      exportedAt: new Date().toISOString()
    };
  }, [questionnaire, selfAssessment, getOnboardingInsights, getOnboardingProgress]);

  const resetProgress = useCallback(async () => {
    await clearOnboardingData();
  }, [clearOnboardingData]);

  // ✅ NEW: Get current progress status
  const getProgressStatus = useCallback(async () => {
    if (!currentUser?.uid) return null;

    try {
      const [questionnaireDoc, selfAssessmentDoc] = await Promise.all([
        getDoc(doc(db, 'onboardingProgress', `${currentUser.uid}_questionnaire`)),
        getDoc(doc(db, 'onboardingProgress', `${currentUser.uid}_selfAssessment`))
      ]);

      const questionnaireData = questionnaireDoc.exists() ? questionnaireDoc.data() : null;
      const selfAssessmentData = selfAssessmentDoc.exists() ? selfAssessmentDoc.data() : null;

      return {
        questionnaire: {
          exists: questionnaireDoc.exists(),
          completionPercentage: questionnaireData?.completionPercentage || 0,
          currentQuestion: questionnaireData?.currentQuestion || 0,
          answeredQuestions: questionnaireData?.answeredQuestions || 0,
          isComplete: questionnaireData?.isComplete || false
        },
        selfAssessment: {
          exists: selfAssessmentDoc.exists(),
          completionPercentage: selfAssessmentData?.completionPercentage || 0,
          answeredCategories: selfAssessmentData?.answeredCategories?.length || 0,
          isComplete: selfAssessmentData?.isComplete || false
        }
      };
    } catch (error) {
      console.error('Error getting progress status:', error);
      return null;
    }
  }, [currentUser?.uid]);

  // ✅ NEW: Cleanup old progress documents (optional)
  const cleanupOldProgressDocuments = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      console.log('🧹 Cleaning up old progress documents...');
      
      // Find old multi-document progress entries
      const oldProgressQuery = query(
        collection(db, 'onboardingProgress'),
        where('userId', '==', currentUser.uid)
      );
      
      const oldProgressSnapshot = await getDocs(oldProgressQuery);
      const deletePromises: Promise<void>[] = [];
      let oldDocsCount = 0;
      
      oldProgressSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Only delete old version documents (without version field or version < 2.0)
        const isOldVersion = !data.version || parseFloat(data.version) < 2.0;
        const isNotUserSpecificDoc = !docSnap.id.includes(currentUser.uid);
        
        if (isOldVersion && isNotUserSpecificDoc) {
          deletePromises.push(deleteDoc(docSnap.ref));
          oldDocsCount++;
        }
      });
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log(`✅ Cleaned up ${oldDocsCount} old progress documents`);
      } else {
        console.log('✅ No old progress documents to clean up');
      }
    } catch (error) {
      console.warn('⚠️ Error cleaning up old progress documents (non-critical):', error);
    }
  }, [currentUser?.uid]);

  // ================================
  // LEGACY COMPATIBILITY
  // ================================
  const getOnboardingStatusFromAuth = useCallback(() => {
    return {
      questionnaire: questionnaire?.completed || false,
      assessment: selfAssessment?.completed || false
    };
  }, [questionnaire?.completed, selfAssessment?.completed]);

  // ✅ ONE-TIME CLEANUP: Run cleanup on component mount
  useEffect(() => {
    if (currentUser?.uid) {
      // Run cleanup 5 seconds after component mounts (one time only)
      const timer = setTimeout(() => {
        cleanupOldProgressDocuments();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser?.uid, cleanupOldProgressDocuments]);

  // ================================
  // CONTEXT VALUE
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
    
    // ✅ NEW: Progress utilities
    getProgressStatus,
    cleanupOldProgressDocuments,
    
    // Legacy Compatibility
    getOnboardingStatusFromAuth
  }), [
    questionnaire,
    selfAssessment,
    isLoading,
    updateQuestionnaire,
    markQuestionnaireComplete,
    saveQuestionnaireProgress,
    getQuestionnaire,
    isQuestionnaireCompleted,
    updateSelfAssessment,
    markSelfAssessmentComplete,
    saveSelfAssessmentProgress,
    getSelfAssessment,
    isSelfAssessmentCompleted,
    getOnboardingProgress,
    getCompletionStatus,
    getOnboardingInsights,
    getPersonalizedRecommendations,
    calculateAttachmentScore,
    getUserProfile,
    clearOnboardingData,
    exportOnboardingData,
    resetProgress,
    getProgressStatus,
    cleanupOldProgressDocuments,
    getOnboardingStatusFromAuth
  ]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

// ================================
// HOOK TO USE CONTEXT
// ================================
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;