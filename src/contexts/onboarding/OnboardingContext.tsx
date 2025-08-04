// ✅ FIREBASE-ONLY OnboardingContext - No localStorage conflicts
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

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
// FIREBASE-ONLY ONBOARDING PROVIDER
// ================================
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ================================
  // FIREBASE-ONLY: Data persistence
  // ================================
  const saveQuestionnaireToFirebase = useCallback(async (questionnaireData: QuestionnaireData) => {
    if (!currentUser?.uid) return;
    
    try {
      const questionnaireDoc = {
        ...questionnaireData,
        userId: currentUser.uid,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userOnboarding', currentUser.uid, 'questionnaire', 'current'), questionnaireDoc);
      console.log(`✅ Questionnaire saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save questionnaire to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const saveSelfAssessmentToFirebase = useCallback(async (assessmentData: SelfAssessmentData) => {
    if (!currentUser?.uid) return;
    
    try {
      const assessmentDoc = {
        ...assessmentData,
        userId: currentUser.uid,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userOnboarding', currentUser.uid, 'selfAssessment', 'current'), assessmentDoc);
      console.log(`✅ Self-assessment saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save self-assessment to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;
    
    setIsLoading(true);
    
    try {
      // Load questionnaire
      const questionnaireDocRef = doc(db, 'userOnboarding', currentUser.uid, 'questionnaire', 'current');
      const questionnaireDoc = await getDoc(questionnaireDocRef);
      
      if (questionnaireDoc.exists()) {
        const data = questionnaireDoc.data();
        const questionnaireData = {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
          completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
        } as QuestionnaireData;
        setQuestionnaire(questionnaireData);
        console.log(`📦 Questionnaire loaded from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      }
      
      // Load self-assessment
      const assessmentDocRef = doc(db, 'userOnboarding', currentUser.uid, 'selfAssessment', 'current');
      const assessmentDoc = await getDoc(assessmentDocRef);
      
      if (assessmentDoc.exists()) {
        const data = assessmentDoc.data();
        const assessmentData = {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
          completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
        } as SelfAssessmentData;
        setSelfAssessment(assessmentData);
        console.log(`📦 Self-assessment loaded from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      }
      
    } catch (error) {
      console.error('❌ Failed to load onboarding data from Firebase:', error);
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
      setQuestionnaire(null);
      setSelfAssessment(null);
    }
  }, [currentUser?.uid, loadFromFirebase]);

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
  // QUESTIONNAIRE MANAGEMENT (FIREBASE-ONLY)
  // ================================
  const updateQuestionnaire = useCallback(async (questionnaireData: Omit<QuestionnaireData, 'completed' | 'completedAt'>) => {
    const updatedQuestionnaire: QuestionnaireData = {
      ...questionnaireData,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to Firebase
    await saveQuestionnaireToFirebase(updatedQuestionnaire);
    
    setQuestionnaire(updatedQuestionnaire);
    emitOnboardingEvent('questionnaire', updatedQuestionnaire);
  }, [saveQuestionnaireToFirebase, emitOnboardingEvent]);

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
    
    // Save to Firebase
    await saveQuestionnaireToFirebase(questionnaireData);
    
    setQuestionnaire(questionnaireData);
    emitOnboardingEvent('questionnaire', questionnaireData);
  }, [saveQuestionnaireToFirebase, emitOnboardingEvent]);

  const saveQuestionnaireProgress = useCallback(async (responses: any, currentQuestion?: number) => {
    if (!currentUser?.uid) return;

    try {
      const progressData = {
        type: 'questionnaire_progress',
        responses,
        currentQuestion,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      // Save progress to Firebase
      const progressDocRef = doc(db, 'userOnboarding', currentUser.uid, 'progress', 'questionnaire');
      await setDoc(progressDocRef, progressData, { merge: true });
      
      console.log('💾 Saved questionnaire progress to Firebase');
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
  // SELF-ASSESSMENT MANAGEMENT (FIREBASE-ONLY)
  // ================================
  const updateSelfAssessment = useCallback(async (selfAssessmentData: Omit<SelfAssessmentData, 'completed' | 'completedAt'>) => {
    const updatedAssessment: SelfAssessmentData = {
      ...selfAssessmentData,
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as SelfAssessmentData;
    
    // Save to Firebase
    await saveSelfAssessmentToFirebase(updatedAssessment);
    
    setSelfAssessment(updatedAssessment);
    emitOnboardingEvent('selfAssessment', updatedAssessment);
  }, [saveSelfAssessmentToFirebase, emitOnboardingEvent]);

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
    
    // Save to Firebase
    await saveSelfAssessmentToFirebase(selfAssessmentData);
    
    setSelfAssessment(selfAssessmentData);
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
  }, [saveSelfAssessmentToFirebase, emitOnboardingEvent]);

  const saveSelfAssessmentProgress = useCallback(async (responses: any) => {
    if (!currentUser?.uid) return;

    try {
      const progressData = {
        type: 'self_assessment_progress',
        responses,
        userId: currentUser.uid,
        updatedAt: serverTimestamp()
      };

      // Save progress to Firebase
      const progressDocRef = doc(db, 'userOnboarding', currentUser.uid, 'progress', 'selfAssessment');
      await setDoc(progressDocRef, progressData, { merge: true });
      
      console.log('💾 Saved self-assessment progress to Firebase');
    } catch (error) {
      console.error('❌ Error saving self-assessment progress:', error);
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
  // UTILITY METHODS (FIREBASE-ONLY)
  // ================================
  const clearOnboardingData = useCallback(async () => {
    setQuestionnaire(null);
    setSelfAssessment(null);
    
    // Clear Firebase data
    if (currentUser?.uid) {
      try {
        // Clear questionnaire
        await setDoc(doc(db, 'userOnboarding', currentUser.uid, 'questionnaire', 'current'), {
          cleared: true,
          clearedAt: serverTimestamp()
        });
        
        // Clear self-assessment
        await setDoc(doc(db, 'userOnboarding', currentUser.uid, 'selfAssessment', 'current'), {
          cleared: true,
          clearedAt: serverTimestamp()
        });
        
        console.log(`🧹 Onboarding data cleared in Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      } catch (error) {
        console.error('❌ Error clearing onboarding data in Firebase:', error);
      }
    }
  }, [currentUser?.uid]);

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