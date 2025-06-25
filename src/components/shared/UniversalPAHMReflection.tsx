import React, { useEffect, useState } from 'react';
import { useLocalData } from '../../contexts/LocalDataContext';
import { useLocation } from 'react-router-dom';
import PAHMReflectionShared from '../../PAHMReflectionShared';

interface UniversalPAHMReflectionProps {
  stageLevel: number;  // 2, 3, 4, 5, or 6
  onComplete: () => void;
  onBack: () => void;
}

// 🎯 Stage-specific configurations
const STAGE_CONFIGS = {
  2: { name: "PAHM Trainee", minDuration: 15, insights: "foundation" },
  3: { name: "PAHM Apprentice", minDuration: 20, insights: "development" },
  4: { name: "PAHM Practitioner", minDuration: 25, insights: "deepening" },
  5: { name: "PAHM Adept", minDuration: 30, insights: "mastery" },
  6: { name: "PAHM Master", minDuration: 35, insights: "transcendence" }
};

interface PAHMCounts {
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

const UniversalPAHMReflection: React.FC<UniversalPAHMReflectionProps> = ({ 
  stageLevel, 
  onComplete, 
  onBack 
}) => {
  const { getPracticeSessions, addEmotionalNote } = useLocalData();
  const location = useLocation();
  const [pahmData, setPahmData] = useState<PAHMCounts | null>(null);
  const [loading, setLoading] = useState(true);

  const stageConfig = STAGE_CONFIGS[stageLevel as keyof typeof STAGE_CONFIGS];

  // 🔧 Convert UniversalPAHMTimer format to reflection format
  const convertPAHMData = (pahmCounts: any): PAHMCounts | null => {
    if (!pahmCounts) return null;
    
    // Handle both old format (likes, nostalgia) and new format (presentAttachment)
    const converted: PAHMCounts = {
      // Present moment categories
      presentAttachment: pahmCounts.likes || pahmCounts.presentAttachment || pahmCounts.present_attachment || 0,
      presentNeutral: pahmCounts.present || pahmCounts.presentNeutral || pahmCounts.present_neutral || 0,  
      presentAversion: pahmCounts.dislikes || pahmCounts.presentAversion || pahmCounts.present_aversion || 0,
      
      // Past categories  
      pastAttachment: pahmCounts.nostalgia || pahmCounts.pastAttachment || pahmCounts.past_attachment || 0,
      pastNeutral: pahmCounts.past || pahmCounts.pastNeutral || pahmCounts.past_neutral || 0,
      pastAversion: pahmCounts.regret || pahmCounts.pastAversion || pahmCounts.past_aversion || 0,
      
      // Future categories
      futureAttachment: pahmCounts.anticipation || pahmCounts.futureAttachment || pahmCounts.future_attachment || 0,
      futureNeutral: pahmCounts.future || pahmCounts.futureNeutral || pahmCounts.future_neutral || 0,
      futureAversion: pahmCounts.worry || pahmCounts.futureAversion || pahmCounts.future_aversion || 0,
    };

    return converted;
  };

  // 🎯 Generate stage-specific insights
  const generateStageInsights = (data: PAHMCounts): string => {
    const total = (Object.values(data) as number[]).reduce((sum, count) => sum + count, 0);
    const presentPercentage = total > 0 ? 
      Math.round(((data.presentAttachment + data.presentNeutral + data.presentAversion) / total) * 100) : 0;

    const insights = {
      foundation: `As a PAHM Trainee (Stage 2), you're building awareness of where your mind goes. ${presentPercentage}% present focus is a great start!`,
      development: `PAHM Apprentice (Stage 3) shows growing mindfulness. Your ${presentPercentage}% present moment awareness indicates developing stability.`,
      deepening: `As a PAHM Practitioner (Stage 4), you're deepening your understanding. ${presentPercentage}% present focus reflects your growing mastery.`,
      mastery: `PAHM Adept (Stage 5) demonstrates significant skill. Your ${presentPercentage}% present awareness shows advanced mindfulness.`,
      transcendence: `PAHM Master (Stage 6) - approaching transcendent awareness. ${presentPercentage}% present focus reflects profound understanding.`
    };

    return insights[stageConfig.insights as keyof typeof insights];
  };

  useEffect(() => {
    const loadPAHMData = async () => {
      try {
        let convertedSessionData: PAHMCounts | null = null;
        let sessionMetadata: any = {};

        // Priority 1: Navigation state (from UniversalPAHMTimer)
        if (location.state?.pahmData) {
          convertedSessionData = convertPAHMData(location.state.pahmData);
          sessionMetadata = {
            duration: location.state.duration,
            posture: location.state.posture,
            stageLevel: stageLevel
          };
        }
        
        // Priority 2: Latest session from LocalDataContext
        if (!convertedSessionData) {
          const sessions = getPracticeSessions();
          
          if (sessions?.length > 0) {
            const latestSession = sessions[sessions.length - 1];
            if (latestSession?.pahmCounts) {
              convertedSessionData = convertPAHMData(latestSession.pahmCounts);
              sessionMetadata = {
                duration: latestSession.duration,
                posture: latestSession.environment?.posture,
                stageLevel: latestSession.stageLevel || stageLevel
              };
            }
          }
        }

        // Priority 3: Legacy sessionStorage (fallback for old PAHMReflection2-6)
        if (!convertedSessionData) {
          const storedData = sessionStorage.getItem(`lastPAHMSession-stage${stageLevel}`) || 
                           sessionStorage.getItem('lastPAHMSession');
          if (storedData) {
            const parsed = JSON.parse(storedData);
            convertedSessionData = convertPAHMData(parsed.pahmCounts || parsed);
            sessionMetadata = { duration: parsed.duration || stageConfig.minDuration };
          }
        }

        if (convertedSessionData) {
          setPahmData({ ...convertedSessionData, ...sessionMetadata } as any);
          
          // 🎯 Generate stage-specific emotional note (only once)
          if (!sessionStorage.getItem(`reflection-saved-stage${stageLevel}-${Date.now()}`)) {
            const stageInsight = generateStageInsights(convertedSessionData);
            const emotionalNote = {
              timestamp: new Date().toISOString(),
              content: stageInsight,
              emotion: 'reflective',
              metadata: {
                stageLevel: stageLevel,
                stageName: stageConfig.name,
                pahmBreakdown: convertedSessionData,
                sessionMetadata
              }
            };
            
            // Save stage-aware reflection
            await addEmotionalNote(emotionalNote);
            
            // Mark as saved to prevent duplicate saves
            sessionStorage.setItem(`reflection-saved-stage${stageLevel}-${Date.now()}`, 'true');
          }
          
        } else {
          // Create empty structure so reflection doesn't crash
          setPahmData({
            presentAttachment: 0, presentNeutral: 0, presentAversion: 0,
            pastAttachment: 0, pastNeutral: 0, pastAversion: 0,
            futureAttachment: 0, futureNeutral: 0, futureAversion: 0,
          });
        }
      } catch (error) {
        console.error(`❌ Stage ${stageLevel} reflection error:`, error);
        setPahmData(null);
      } finally {
        setLoading(false);
      }
    };

    loadPAHMData();
  }, [location.state, stageLevel]); // ✅ FIXED: Only depend on primitive values

  if (loading) {
    return (
      <div className="reflection-loading">
        <div className="loading-spinner"></div>
        <p>Loading Stage {stageLevel} reflection...</p>
      </div>
    );
  }

  if (!pahmData) {
    return (
      <div className="reflection-error">
        <h3>Unable to load Stage {stageLevel} reflection</h3>
        <p>Please try the practice again.</p>
        <button onClick={onBack} className="btn-secondary">
          Back to Practice
        </button>
      </div>
    );
  }

  return (
    <PAHMReflectionShared
      stageLevel={`Stage ${stageLevel}`}
      stageName={stageConfig.name}
      duration={(pahmData as any).duration || stageConfig.minDuration}
      posture={(pahmData as any).posture || 'seated'}
      pahmData={pahmData}
      onComplete={onComplete}
      onBack={onBack}
    />
  );
};

export default UniversalPAHMReflection;