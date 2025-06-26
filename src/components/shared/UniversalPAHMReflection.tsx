import React from 'react';
import { useLocalData } from '../../contexts/LocalDataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import PAHMReflectionShared from '../../PAHMReflectionShared';

interface UniversalPAHMReflectionProps {
  stageLevel: number;  // 2, 3, 4, 5, or 6
  onComplete: () => void;
  onBack: () => void;
}

interface PAHMTrackingData {
  presentAttachment: number;
  presentNeutral: number;
  presentAversion: number;
  pastAttachment: number;
  pastNeutral: number;
  pastAversion: number;
  futureAttachment: number;
  futureNeutral: number;
  futureAversion: number;
}

interface PAHMCountsFromSession {
  present_attachment?: number;
  present_neutral?: number;
  present_aversion?: number;
  past_attachment?: number;
  past_neutral?: number;
  past_aversion?: number;
  future_attachment?: number;
  future_neutral?: number;
  future_aversion?: number;
}

const STAGE_CONFIGS = {
  2: { name: "PAHM Trainee", minDuration: 15 },
  3: { name: "PAHM Apprentice", minDuration: 20 },
  4: { name: "PAHM Practitioner", minDuration: 25 },
  5: { name: "PAHM Adept", minDuration: 30 },
  6: { name: "PAHM Master", minDuration: 35 }
};

const UniversalPAHMReflection: React.FC<UniversalPAHMReflectionProps> = ({ 
  stageLevel, 
  onComplete, 
  onBack 
}) => {
  const { userData, addEmotionalNote } = useLocalData();
  const navigate = useNavigate();
  const location = useLocation();
  const stageConfig = STAGE_CONFIGS[stageLevel as keyof typeof STAGE_CONFIGS];

  // 🎯 FIXED: Get data from navigation state (same pattern as PAHMTimer3)
  const navigationState = location.state as {
    stageLevel?: string;
    stageName?: string;
    duration?: number;
    posture?: string;
    pahmData?: PAHMTrackingData;
  } | null;

  let pahmTrackingData: PAHMTrackingData = {
    presentAttachment: 0,
    presentNeutral: 0,
    presentAversion: 0,
    pastAttachment: 0,
    pastNeutral: 0,
    pastAversion: 0,
    futureAttachment: 0,
    futureNeutral: 0,
    futureAversion: 0
  };
  let practiceDuration = 0;
  let posture = 'seated';

  if (navigationState?.pahmData) {
    // Use data from navigation state (preferred method)
    pahmTrackingData = navigationState.pahmData;
    practiceDuration = navigationState.duration || 0;
    posture = navigationState.posture || 'seated';
  } else {
    // Fallback: Get the most recent session from database
    const allSessions = userData?.practiceSessions || [];
    const mostRecentSession = allSessions.length > 0 
      ? allSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;

    if (mostRecentSession && mostRecentSession.stageLevel === stageLevel) {
      const pahmCounts: PAHMCountsFromSession = mostRecentSession.pahmCounts || {};

      pahmTrackingData = {
        presentAttachment: Number(pahmCounts.present_attachment) || 0,
        presentNeutral: Number(pahmCounts.present_neutral) || 0, 
        presentAversion: Number(pahmCounts.present_aversion) || 0,
        pastAttachment: Number(pahmCounts.past_attachment) || 0,
        pastNeutral: Number(pahmCounts.past_neutral) || 0,
        pastAversion: Number(pahmCounts.past_aversion) || 0,
        futureAttachment: Number(pahmCounts.future_attachment) || 0,
        futureNeutral: Number(pahmCounts.future_neutral) || 0,
        futureAversion: Number(pahmCounts.future_aversion) || 0
      };

      practiceDuration = mostRecentSession.duration || 0;
      posture = mostRecentSession.environment?.posture || 'seated';
    } else {
      // Final fallback: sessionStorage
      const rawPahmData = JSON.parse(sessionStorage.getItem('pahmTracking') || '{}');
      
      pahmTrackingData = {
        presentAttachment: rawPahmData.likes || 0,
        presentNeutral: rawPahmData.present || 0,
        presentAversion: rawPahmData.dislikes || 0,
        pastAttachment: rawPahmData.nostalgia || 0,
        pastNeutral: rawPahmData.past || 0,
        pastAversion: rawPahmData.regret || 0,
        futureAttachment: rawPahmData.anticipation || 0,
        futureNeutral: rawPahmData.future || 0,
        futureAversion: rawPahmData.worry || 0
      };

      const startTime = new Date(sessionStorage.getItem('practiceStartTime') || new Date().toISOString());
      const endTime = new Date(sessionStorage.getItem('practiceEndTime') || new Date().toISOString());
      practiceDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      posture = sessionStorage.getItem('currentPosture') || 'seated';
    }
  }

  const totalPahmCount = Object.values(pahmTrackingData).reduce((sum, count) => sum + count, 0);

  const handleComplete = () => {
    const presentPercentage = totalPahmCount > 0 ? 
      Math.round(((pahmTrackingData.presentAttachment + pahmTrackingData.presentNeutral + pahmTrackingData.presentAversion) / totalPahmCount) * 100) : 0;

    const stageInsight = `Stage ${stageLevel} (${stageConfig.name}) completed with ${totalPahmCount} attention observations across all 9 PAHM quadrants. ${presentPercentage}% present-moment awareness shows your mindfulness development.`;
    
    const emotionalNote = {
      timestamp: new Date().toISOString(),
      content: stageInsight,
      emotion: 'reflective',
      metadata: {
        stageLevel: stageLevel,
        stageName: stageConfig.name,
        pahmBreakdown: pahmTrackingData,
        totalObservations: totalPahmCount,
        presentPercentage,
        allNineQuadrants: {
          present: {
            attachment: pahmTrackingData.presentAttachment,
            neutral: pahmTrackingData.presentNeutral,
            aversion: pahmTrackingData.presentAversion
          },
          past: {
            attachment: pahmTrackingData.pastAttachment,
            neutral: pahmTrackingData.pastNeutral,
            aversion: pahmTrackingData.pastAversion
          },
          future: {
            attachment: pahmTrackingData.futureAttachment,
            neutral: pahmTrackingData.futureNeutral,
            aversion: pahmTrackingData.futureAversion
          }
        }
      }
    };
    
    addEmotionalNote(emotionalNote);
    sessionStorage.setItem('stageProgress', stageLevel.toString());
    onComplete();
  };

  return (
    <PAHMReflectionShared
      stageLevel={`Stage ${stageLevel}`}
      stageName={stageConfig.name}
      duration={practiceDuration}
      posture={posture}
      pahmData={pahmTrackingData}
      onComplete={handleComplete}
      onBack={onBack}
    />
  );
};

export default UniversalPAHMReflection;