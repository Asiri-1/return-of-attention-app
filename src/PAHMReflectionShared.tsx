import React, { useState, useEffect } from 'react';
import './Reflection.css';
import './PAHMReflection.css';

interface PAHMReflectionProps {
  stageLevel: string;
  stageName: string;
  duration: number;
  posture: string;
  pahmData?: {
    presentAttachment?: number;
    presentNeutral?: number;
    presentAversion?: number;
    pastAttachment?: number;
    pastNeutral?: number;
    pastAversion?: number;
    futureAttachment?: number;
    futureNeutral?: number;
    futureAversion?: number;
  };
  onComplete: () => void;
  onBack: () => void;
  // NEW: Optional props for emotion selection
  onEmotionSelected?: (emotion: string, note: string) => void;
  allowEmotionSelection?: boolean;
}

// 🎭 EMOTION OPTIONS - Same as DailyEmotionalNotes
const EMOTION_OPTIONS = [
  { key: 'joy', name: 'Joy', icon: '😊', color: '#4caf50' },
  { key: 'gratitude', name: 'Grateful', icon: '🙏', color: '#8bc34a' },
  { key: 'calm', name: 'Calm', icon: '😌', color: '#00bcd4' },
  { key: 'excited', name: 'Excited', icon: '🤩', color: '#ff9800' },
  { key: 'neutral', name: 'Neutral', icon: '😐', color: '#9e9e9e' },
  { key: 'thoughtful', name: 'Thoughtful', icon: '🤔', color: '#607d8b' },
  { key: 'stressed', name: 'Stressed', icon: '😰', color: '#ff5722' },
  { key: 'sad', name: 'Sad', icon: '😢', color: '#3f51b5' }
];

const PAHMReflectionShared: React.FC<PAHMReflectionProps> = ({
  stageLevel,
  stageName,
  duration,
  posture,
  pahmData = {},
  onComplete,
  onBack,
  onEmotionSelected,
  allowEmotionSelection = true
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  const [challenges, setChallenges] = useState<{[key: string]: boolean}>({
    discomfort: false,
    sleepiness: false,
    restlessness: false,
    distraction: false,
    boredom: false,
    anxiety: false,
    other: false
  });
  
  // 🎭 EMOTION SELECTION STATE
  const [showEmotionSelection, setShowEmotionSelection] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [emotionNote, setEmotionNote] = useState<string>('');
  
  const formatPostureName = (postureId: string): string => {
    switch(postureId) {
      case 'chair': return 'Chair Sitting';
      case 'cushion': return 'Cushion Sitting';
      case 'seiza': return 'Seiza Position';
      case 'burmese': return 'Burmese Position';
      case 'lotus': return 'Half Lotus';
      case 'full-lotus': return 'Full Lotus';
      case 'lying': return 'Lying Down';
      case 'standing': return 'Standing';
      case 'other': return 'Other';
      case 'seated': return 'Seated Position';
      default: return postureId;
    }
  };
  
  const handleRatingClick = (value: number) => {
    setRating(value);
  };
  
  const handleChallengeChange = (challenge: string) => {
    setChallenges(prev => ({
      ...prev,
      [challenge]: !prev[challenge]
    }));
  };
  
  const calculatePAHMTotals = () => {
    // Ensure all values are numbers with better validation
    const data = {
      presentAttachment: Number(pahmData?.presentAttachment) || 0,
      presentNeutral: Number(pahmData?.presentNeutral) || 0,
      presentAversion: Number(pahmData?.presentAversion) || 0,
      pastAttachment: Number(pahmData?.pastAttachment) || 0,
      pastNeutral: Number(pahmData?.pastNeutral) || 0,
      pastAversion: Number(pahmData?.pastAversion) || 0,
      futureAttachment: Number(pahmData?.futureAttachment) || 0,
      futureNeutral: Number(pahmData?.futureNeutral) || 0,
      futureAversion: Number(pahmData?.futureAversion) || 0
    };
    
    const presentTotal = data.presentAttachment + data.presentNeutral + data.presentAversion;
    const pastTotal = data.pastAttachment + data.pastNeutral + data.pastAversion;
    const futureTotal = data.futureAttachment + data.futureNeutral + data.futureAversion;
    
    const attachmentTotal = data.presentAttachment + data.pastAttachment + data.futureAttachment;
    const neutralTotal = data.presentNeutral + data.pastNeutral + data.futureNeutral;
    const aversionTotal = data.presentAversion + data.pastAversion + data.futureAversion;
    
    const grandTotal = presentTotal + pastTotal + futureTotal;
    
    return {
      presentTotal,
      pastTotal,
      futureTotal,
      attachmentTotal,
      neutralTotal,
      aversionTotal,
      grandTotal,
      data
    };
  };
  
  const pahmTotals = calculatePAHMTotals();
  
  const getPercentage = (count: number) => {
    if (pahmTotals.grandTotal === 0) return 0;
    return Math.round((count / pahmTotals.grandTotal) * 100);
  };
  
  // 🎭 EMOTION SELECTION HANDLERS
  const handleShowEmotionSelection = () => {
    setShowEmotionSelection(true);
  };

  const handleSaveEmotionalNote = () => {
    if (selectedEmotion && onEmotionSelected) {
      onEmotionSelected(selectedEmotion, emotionNote);
    }
    handleSubmit();
  };

  const handleSkipEmotionalNote = () => {
    handleSubmit();
  };
  
  const handleSubmit = () => {
    const reflectionData = {
      stageLevel,
      stageName,
      duration,
      posture,
      rating,
      feedback,
      insights,
      challenges,
      pahmData,
      pahmTotals,
      timestamp: new Date().toISOString()
    };
    
    const previousReflections = JSON.parse(localStorage.getItem('reflectionHistory') || '[]');
    localStorage.setItem('reflectionHistory', JSON.stringify([...previousReflections, reflectionData]));
    
    onComplete();
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
            {EMOTION_OPTIONS.map(emotion => (
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
              onClick={handleSkipEmotionalNote}
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

  return (
    <div className="reflection-screen">
      <div className="reflection-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{stageName} Practice Reflection</h1>
      </div>
      
      <div className="reflection-content">
        <div className="session-summary">
          <h2>Session Summary</h2>
          <div className="summary-item">
            <div className="summary-label">Practice Level:</div>
            <div className="summary-value">{stageLevel}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Duration:</div>
            <div className="summary-value">{duration} minutes</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Posture:</div>
            <div className="summary-value">{formatPostureName(posture)}</div>
          </div>
        </div>
        
        <div className="pahm-tracking-results">
          <h2>PAHM Tracking Results</h2>
          <p className="tracking-explanation">
            Below are the total counts of where your attention went during practice.
          </p>
          
          <div className="pahm-matrix-results">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '120px 100px 100px 100px 100px 100px',
              gap: '1px',
              background: '#ddd',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {/* Header Row */}
              <div style={{
                background: '#4a90a4',
                color: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Time / Emotion</div>
              <div style={{
                background: '#e8b4a0',
                color: '#2c3e50',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Attachment</div>
              <div style={{
                background: '#f8f9fa',
                color: '#2c3e50',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px',
                border: '2px solid #4a90a4'
              }}>Neutral</div>
              <div style={{
                background: '#f5b7b1',
                color: '#2c3e50',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Aversion</div>
              <div style={{
                background: '#6c757d',
                color: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Total</div>
              <div style={{
                background: '#4a90a4',
                color: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>%</div>

              {/* Present Row */}
              <div style={{
                background: '#a8e6cf',
                color: '#2c3e50',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px',
                border: '2px solid #4a90a4'
              }}>Present</div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.presentAttachment}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.presentNeutral}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.presentAversion}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.presentTotal}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {getPercentage(pahmTotals.presentTotal)}%
              </div>

              {/* Past Row */}
              <div style={{
                background: '#f4d03f',
                color: '#2c3e50',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Past</div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.pastAttachment}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.pastNeutral}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.pastAversion}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.pastTotal}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {getPercentage(pahmTotals.pastTotal)}%
              </div>

              {/* Future Row */}
              <div style={{
                background: '#85c1e9',
                color: '#2c3e50',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Future</div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.futureAttachment}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.futureNeutral}
                </div>
              </div>
              <div style={{
                background: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.data.futureAversion}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.futureTotal}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                {getPercentage(pahmTotals.futureTotal)}%
              </div>

              {/* Total Row */}
              <div style={{
                background: '#6c757d',
                color: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>Total</div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.attachmentTotal}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.neutralTotal}
                </div>
              </div>
              <div style={{
                background: '#e9ecef',
                padding: '12px 8px',
                textAlign: 'center',
                border: '2px solid #6c757d',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {pahmTotals.aversionTotal}
                </div>
              </div>
              <div style={{
                background: '#4a90a4',
                color: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '3px solid #2c3e50',
                fontWeight: 'bold'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {pahmTotals.grandTotal}
                </div>
              </div>
              <div style={{
                background: '#4a90a4',
                color: 'white',
                padding: '12px 8px',
                textAlign: 'center',
                border: '3px solid #2c3e50',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                100%
              </div>
            </div>
          </div>
        </div>
        
        <div className="challenges-section" style={{ marginBottom: '30px' }}>
          <h2>Challenges Encountered</h2>
          <p>Select any challenges you experienced during this practice:</p>
          <div className="challenge-checkboxes" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginTop: '15px'
          }}>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.discomfort}
                onChange={() => handleChallengeChange('discomfort')}
                style={{ marginRight: '8px' }}
              />
              Physical Discomfort
            </label>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.sleepiness}
                onChange={() => handleChallengeChange('sleepiness')}
                style={{ marginRight: '8px' }}
              />
              Sleepiness
            </label>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.restlessness}
                onChange={() => handleChallengeChange('restlessness')}
                style={{ marginRight: '8px' }}
              />
              Restlessness
            </label>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.distraction}
                onChange={() => handleChallengeChange('distraction')}
                style={{ marginRight: '8px' }}
              />
              Distraction
            </label>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.boredom}
                onChange={() => handleChallengeChange('boredom')}
                style={{ marginRight: '8px' }}
              />
              Boredom
            </label>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.anxiety}
                onChange={() => handleChallengeChange('anxiety')}
                style={{ marginRight: '8px' }}
              />
              Anxiety
            </label>
            <label className="challenge-item" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={challenges.other}
                onChange={() => handleChallengeChange('other')}
                style={{ marginRight: '8px' }}
              />
              Other
            </label>
          </div>
        </div>
        
        <div className="feedback-section" style={{ marginBottom: '30px' }}>
          <h2>Your Feedback</h2>
          <div className="feedback-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="practice-feedback" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>What did you notice during your practice?</label>
            <textarea
              id="practice-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe your experience..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div className="feedback-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="practice-insights" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>Any insights or learnings from this session?</label>
            <textarea
              id="practice-insights"
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="Share your insights..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
        
        <div className="rating-section" style={{
          textAlign: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <h2>Rate Your Practice</h2>
          <p>How would you rate your overall practice experience?</p>
          <div className="star-rating" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '5px',
            fontSize: '36px',
            marginBottom: '10px'
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  cursor: 'pointer',
                  color: star <= (hoverRating || rating) ? '#ffd700' : '#ddd',
                  transition: 'color 0.2s ease',
                  userSelect: 'none'
                }}
              >
                ★
              </span>
            ))}
          </div>
          <div className="rating-label" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#4a90a4'
          }}>
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
            {rating === 0 && 'Please rate your session'}
          </div>
        </div>
        
        <div className="next-steps" style={{
          textAlign: 'center',
          padding: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '15px'
        }}>
          <h2>Next Steps</h2>
          <p style={{ marginBottom: '30px', lineHeight: '1.6' }}>
            Regular practice helps build the foundation for deeper awareness.
            Consider practicing at this level again, or move to the next level when you feel ready.
          </p>
          
          {/* 🎭 NEW: Emotion Selection Buttons */}
          {allowEmotionSelection && (
            <div style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              <button
                onClick={handleShowEmotionSelection}
                style={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                💭 Add How I'm Feeling
              </button>
              
              <button 
                onClick={handleSubmit}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 24px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Skip & Complete
              </button>
            </div>
          )}
          
          {/* Original Complete Button (shown if emotion selection is disabled) */}
          {!allowEmotionSelection && (
            <button 
              className="complete-button" 
              onClick={handleSubmit}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                padding: '15px 40px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                transition: 'transform 0.2s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Complete Reflection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PAHMReflectionShared;