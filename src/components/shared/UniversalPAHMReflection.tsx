import React, { useState } from 'react';
// ✅ SINGLE-POINT: Use ONLY appropriate contexts for their purposes
import { usePractice } from '../../contexts/practice/PracticeContext'; // ✅ For session data only
import { useWellness } from '../../contexts/wellness/WellnessContext'; // ✅ For emotional notes only
import { useUser } from '../../contexts/user/UserContext'; // ✅ For profile management only
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
  // ✅ SINGLE-POINT: Use contexts for their specific purposes only
  const { sessions } = usePractice(); // ✅ Only for getting session data
  const { addEmotionalNote } = useWellness(); // ✅ Only for emotional notes
  const { userProfile, updateProfile } = useUser(); // ✅ Only for profile updates
  const navigate = useNavigate();
  const location = useLocation();
  const stageConfig = STAGE_CONFIGS[stageLevel as keyof typeof STAGE_CONFIGS];

  // 🎭 EMOTION SELECTION STATE (preserved exactly)
  const [showEmotionSelection, setShowEmotionSelection] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [emotionNote, setEmotionNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // 🎯 Get data from navigation state (preserved exactly)
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

  // ✅ PRESERVED: Same data extraction logic
  if (navigationState?.pahmData) {
    pahmTrackingData = navigationState.pahmData;
    practiceDuration = navigationState.duration || 0;
    posture = navigationState.posture || 'seated';
  } else {
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
      console.log('No recent session found in Firebase, using default values');
      practiceDuration = stageConfig.minDuration;
      posture = 'seated';
    }
  }

  const totalPahmCount = Object.values(pahmTrackingData).reduce((sum, count) => sum + count, 0);

  // 🎭 PRESERVED: Same emotion selection handlers but with SINGLE-POINT stage progress update
  const handleAddEmotionalNote = () => {
    setShowEmotionSelection(true);
  };

  // ✅ SINGLE-POINT: Update stage progress via UserContext profile management (not session tracking)
  const updateStageProgressViaPractice = async () => {
    try {
      if (!userProfile) {
        console.warn('⚠️ No user profile found, cannot update stage progress');
        return;
      }

      // ✅ SINGLE-POINT: Update user profile to reflect stage completion
      const updatedStageProgress = {
        ...userProfile.stageProgress,
        currentStage: Math.max(userProfile.stageProgress?.currentStage || 1, stageLevel + 1),
        stageCompletionFlags: {
          ...userProfile.stageProgress?.stageCompletionFlags,
          [`stage${stageLevel}`]: true
        },
        completedStages: [
          ...(userProfile.stageProgress?.completedStages || []),
          ...(userProfile.stageProgress?.completedStages?.includes(stageLevel) ? [] : [stageLevel])
        ],
        maxStageReached: Math.max(userProfile.stageProgress?.maxStageReached || 1, stageLevel + 1),
        lastAdvancement: new Date().toISOString()
      };

      // ✅ SINGLE-POINT: Update via UserContext profile management
      await updateProfile({
        stageProgress: updatedStageProgress,
        currentProgress: updatedStageProgress // ✅ Keep both for backward compatibility
      });

      console.log(`✅ Stage ${stageLevel} completion updated in user profile`);
    } catch (error) {
      console.error('❌ Error updating stage progress via profile:', error);
      // Don't throw - allow completion to continue even if profile update fails
    }
  };

  const handleSkipEmotionalNote = async () => {
    try {
      setIsSaving(true);
      
      // ✅ SINGLE-POINT: Update stage progress via profile management
      await updateStageProgressViaPractice();
      
      onComplete();
    } catch (error) {
      console.error('Error updating stage progress:', error);
      // Still complete even if stage progress update fails
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmotionalNote = async () => {
    if (!selectedEmotion) return;

    try {
      setIsSaving(true);
      
      const presentPercentage = totalPahmCount > 0 ? 
        Math.round(((pahmTrackingData.presentAttachment + pahmTrackingData.presentNeutral + pahmTrackingData.presentAversion) / totalPahmCount) * 100) : 0;

      // Create a natural emotional note (not a data dump)
      const baseContent = emotionNote.trim() || 
        `After my ${practiceDuration}-minute Stage ${stageLevel} meditation session. ${presentPercentage}% present-moment awareness today.`;
      
      // ✅ PRESERVED: Save emotional note via WellnessContext
      await addEmotionalNote({
        content: baseContent,
        emotion: selectedEmotion,
        energyLevel: 7, // Default moderate-high energy after meditation
        intensity: 7,
        tags: ['meditation', `stage-${stageLevel}`]
      });

      // ✅ SINGLE-POINT: Update stage progress via profile management
      await updateStageProgressViaPractice();

      onComplete();
    } catch (error) {
      console.error('Error saving emotional note or stage progress:', error);
      alert('Failed to save data. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipFromSelection = () => {
    setShowEmotionSelection(false);
    handleSkipEmotionalNote();
  };

  // 🎭 PRESERVED: Same emotion selection UI (no changes)
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
                disabled={isSaving}
                style={{
                  background: selectedEmotion === emotion.key 
                    ? `linear-gradient(135deg, ${emotion.color} 0%, ${emotion.color}dd 100%)`
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: selectedEmotion === emotion.key ? `2px solid ${emotion.color}` : '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  padding: '20px 15px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  transform: selectedEmotion === emotion.key ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedEmotion === emotion.key ? `0 4px 15px ${emotion.color}40` : 'none',
                  opacity: isSaving ? 0.6 : 1
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
                disabled={isSaving}
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
                  fontFamily: 'inherit',
                  opacity: isSaving ? 0.6 : 1
                }}
              />
            </div>
          )}

          {/* Loading Indicator */}
          {isSaving && (
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              color: 'white'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Saving to Firebase...
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              onClick={handleSkipFromSelection}
              disabled={isSaving}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '25px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Skip Note
            </button>
            
            {selectedEmotion && (
              <button
                onClick={handleSaveEmotionalNote}
                disabled={isSaving}
                style={{
                  background: isSaving 
                    ? 'rgba(76, 175, 80, 0.6)' 
                    : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: isSaving ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Emotional Note'}
              </button>
            )}
          </div>
        </div>

        {/* CSS for loading spinner */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 🎯 PRESERVED: Same reflection handlers
  const handleComplete = () => {
    setShowEmotionSelection(true);
  };

  const handleReflectionComplete = () => {
    const shouldAddNote = window.confirm(
      "Would you like to add an emotional note about how you're feeling after this meditation?"
    );
    
    if (shouldAddNote) {
      setShowEmotionSelection(true);
    } else {
      handleSkipEmotionalNote();
    }
  };

  // 🎭 SINGLE-POINT: Handle emotion selection from shared component with profile-based stage update
  const handleEmotionFromShared = async (emotion: string, note: string) => {
    try {
      setIsSaving(true);
      
      const presentPercentage = totalPahmCount > 0 ? 
        Math.round(((pahmTrackingData.presentAttachment + pahmTrackingData.presentNeutral + pahmTrackingData.presentAversion) / totalPahmCount) * 100) : 0;

      // Create a natural emotional note
      const finalNote = note.trim() || 
        `After my ${practiceDuration}-minute Stage ${stageLevel} meditation session. ${presentPercentage}% present-moment awareness today.`;
      
      // ✅ PRESERVED: Save emotional note via WellnessContext
      await addEmotionalNote({
        content: finalNote,
        emotion: emotion,
        energyLevel: 7, // Default moderate-high energy after meditation
        intensity: 7, 
        tags: ['meditation', `stage-${stageLevel}`]
      });

      // ✅ SINGLE-POINT: Update stage progress via profile management
      await updateStageProgressViaPractice();

      onComplete();
    } catch (error) {
      console.error('Error saving emotion from shared component:', error);
      alert('Failed to save data. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ PRESERVED: Same shared component usage
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