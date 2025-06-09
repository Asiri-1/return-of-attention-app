// PAHMTypes.ts - Centralized type definitions for PAHM components

// Define the counts type for reuse across all components
export type PAHMCounts = {
  nostalgia: number;
  likes: number;
  anticipation: number;
  past: number;
  present: number;
  future: number;
  regret: number;
  dislikes: number;
  worry: number;
};

// Define reflection data interface for reuse
export interface PAHMReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

// Define session data interfaces
export interface BaseSessionData {
  duration: number;
  stage: number;
  stageTitle: string;
  posture?: string; // Make posture optional to maintain backward compatibility
}

export interface SeekerSessionData extends BaseSessionData {
  // Seeker-specific session data properties
}

export interface PAHMSessionData extends BaseSessionData {
  pahmCounts: PAHMCounts;
  posture?: string; // Make posture optional to maintain backward compatibility
}

// Define props interfaces for components that need posture
export interface PAHMPracticeReflectionProps {
  onBack: () => void;
  onSaveReflection: (reflectionData: PAHMReflectionData) => void;
  pahmCounts: PAHMCounts;
  posture?: string; // Make posture optional to maintain backward compatibility
}

// Define props interface for PracticeComplete component
export interface PracticeCompleteProps {
  onBack: () => void;
  onSaveAndContinue: (rating: number, reflectionData?: PAHMReflectionData) => void;
  sessionData: SeekerSessionData;
}

// Define props interface for PAHMPracticeComplete component
export interface PAHMPracticeCompleteProps {
  onBack: () => void;
  onSaveAndContinue: (rating: number, reflectionData?: PAHMReflectionData) => void;
  sessionData: PAHMSessionData;
}
