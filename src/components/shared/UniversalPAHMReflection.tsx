import React, { useState } from 'react';
// 🚀 UPDATED: Use focused contexts instead of LocalDataCompat
import { usePractice } from '../../contexts/practice/PracticeContext';
import { useWellness } from '../../contexts/wellness/WellnessContext';
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

interface EmotionOption {
  key: string;
  name: string;
  color: string;
  icon: string;
}

const EMOTION_OPTIONS: EmotionOption[] = [
  { key: 'happy', name: 'Happy', color: '#4caf50', icon: '😊' },
  { key: 'calm', name: 'Calm', color: '#2196f3', icon: '😌' },
  { key: 'grateful', name: 'Grateful', color: '#ff9800', icon: '🙏' },
  { key: 'focused', name: 'Focused', color: '#9c27b0', icon: '🧘' },
  { key: 'peaceful', name: 'Peaceful', color: '#00bcd4', icon: '☮️' },
  { key: 'energized', name: 'Energized', color: '#cddc39', icon: '⚡' },
  { key: 'thoughtful', name: 'Thoughtful', color: '#607d8b', icon: '🤔' },
  { key: 'content', name: 'Content', color: '#8bc34a', icon: '😄' },
];

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
  // 🚀 UPDATED: Use focused contexts for practice and wellness data
  const { sessions } = usePractice();
  const { addEmotionalNote } = useWellness();
  const navigate = useNavigate();
  const location = useLocation();
  const stageConfig = STAGE_CONFIGS[stageLevel as keyof typeof STAGE_CONFIGS];

  // 🎭 EMOTION SELECTION STATE
  const [showEmotionSelection, setShowEmotionSelection] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [emotionNote, setEmotionNote] = useState<string>('');

  // 🎯 Get data from navigation state (same pattern as PAHMTimer3)
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
    // Fallback: Get the most recent session from practice context
    const allSessions = sessions || [];
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

  // 🎭 EMOTION SELECTION STEP
  const handleAddEmotionalNote = () => {
    setShowEmotionSelection(true);
  };

  const handleSkipEmotionalNote = () => {
    // Skip emotional note, just complete
    sessionStorage.setItem('stageProgress', stageLevel.toString());
    onComplete();
  };

  const handleSaveEmotionalNote = () => {
    if (!selectedEmotion) return;

    const presentPercentage = totalPahmCount > 0 ? 
      Math.round(((pahmTrackingData.presentAttachment + pahmTrackingData.presentNeutral + pahmTrackingData.presentAversion) / totalPahmCount) * 100) : 0;

    // Create a natural emotional note (not a data dump)
    const baseContent = emotionNote.trim() || 
      `After my ${practiceDuration}-minute Stage ${stageLevel} meditation session. ${presentPercentage}% present-moment awareness today.`;
    
    addEmotionalNote({
      content: baseContent,
      emotion: selectedEmotion,
      energyLevel: 7, // Default moderate-high energy after meditation
      intensity: 7,
      tags: ['meditation', `stage-${stageLevel}`]
    });

    sessionStorage.setItem('stageProgress', stageLevel.toString());
    onComplete();
  };

  const handleSkipFromSelection = () => {
    setShowEmotionSelection(false);
    handleSkipEmotionalNote();
  };

  // 🎭 EMOTION SELECTION UI
  if (showEmotionSelection) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '600px',
          width: '100%',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>How are you feeling? 💭</h2>
          <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '30px' }}>
            Add an optional emotional note about your meditation experience
          </p>

          {/* Emotion Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {EMOTION_OPTIONS.map((emotion: EmotionOption) => (
              <button
                key={emotion.key}
                onClick={() => setSelectedEmotion(emotion.key)}
                style={{
                  background: selectedEmotion === emotion.key 
                    ? `linear-gradient(135deg, ${emotion.color} 0%, ${emotion.color}dd 100%)`
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: selectedEmotion === emotion.key ? `2px solid ${emotion.color}` : '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  padding: '20px 15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  transform: selectedEmotion === emotion.key ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedEmotion === emotion.key ? `0 4px 15px ${emotion.color}40` : 'none'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{emotion.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{emotion.name}</div>
              </button>
            ))}
          </div>

          {/* Optional Note */}
          {selectedEmotion && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                Add a note (optional) 📝
              </label>
              <textarea
                value={emotionNote}
                onChange={(e) => setEmotionNote(e.target.value)}
                placeholder="How was your meditation? Any insights or reflections..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '15px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={handleSkipFromSelection}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '25px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Skip Note
            </button>
            
            {selectedEmotion && (
              <button
                onClick={handleSaveEmotionalNote}
                style={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                Save Emotional Note
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 🎯 ORIGINAL REFLECTION UI WITH EMOTION OPTION
  const handleComplete = () => {
    // Show emotion selection option instead of auto-completing
    setShowEmotionSelection(true);
  };

  const handleReflectionComplete = () => {
    // Option to add emotional note after seeing reflection
    const shouldAddNote = window.confirm(
      "Would you like to add an emotional note about how you're feeling after this meditation?"
    );
    
    if (shouldAddNote) {
      setShowEmotionSelection(true);
    } else {
      sessionStorage.setItem('stageProgress', stageLevel.toString());
      onComplete();
    }
  };

  // 🎭 HANDLE EMOTION SELECTION FROM SHARED COMPONENT
  const handleEmotionFromShared = (emotion: string, note: string) => {
    const presentPercentage = totalPahmCount > 0 ? 
      Math.round(((pahmTrackingData.presentAttachment + pahmTrackingData.presentNeutral + pahmTrackingData.presentAversion) / totalPahmCount) * 100) : 0;

    // Create a natural emotional note
    const finalNote = note.trim() || 
      `After my ${practiceDuration}-minute Stage ${stageLevel} meditation session. ${presentPercentage}% present-moment awareness today.`;
    
    addEmotionalNote({
      content: finalNote,
      emotion: emotion,
      energyLevel: 7, // Default moderate-high energy after meditation
      intensity: 7, 
      tags: ['meditation', `stage-${stageLevel}`]
    });

    sessionStorage.setItem('stageProgress', stageLevel.toString());
  };

  return (
    <PAHMReflectionShared
      stageLevel={`Stage ${stageLevel}`}
      stageName={stageConfig.name}
      duration={practiceDuration}
      posture={posture}
      pahmData={pahmTrackingData}
      onComplete={onComplete}
      onBack={onBack}
      onEmotionSelected={handleEmotionFromShared}
      allowEmotionSelection={true}
    />
  );
};

export default UniversalPAHMReflection;