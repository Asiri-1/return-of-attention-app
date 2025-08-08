import React, { useState, useCallback } from 'react';

// Type definitions
interface EmotionalNote {
  noteId: string;
  content: string;
  emotion: string;
  intensity: number;
  timestamp: string;
  trigger: string;
}

interface NewEmotionalNote {
  content: string;
  emotion: string;
  intensity: number;
  trigger: string;
}

interface EmotionData {
  value: string;
  label: string;
  icon: string;
  color: string;
}

// Mock wellness context for demonstration
const useWellness = () => {
  const [emotionalNotes, setEmotionalNotes] = useState<EmotionalNote[]>([
    {
      noteId: '1',
      content: 'Meeting went really well, feeling accomplished',
      emotion: 'confident',
      intensity: 7,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      trigger: 'work success'
    },
    {
      noteId: '2',
      content: 'Traffic jam made me late, feeling stressed',
      emotion: 'frustrated',
      intensity: 6,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      trigger: 'external circumstances'
    },
    {
      noteId: '3',
      content: 'Morning coffee and sunrise - peaceful start',
      emotion: 'peaceful',
      intensity: 8,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      trigger: 'morning routine'
    }
  ]);
  
  const addEmotionalNote = useCallback((note: NewEmotionalNote) => {
    const newNote: EmotionalNote = {
      ...note,
      noteId: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setEmotionalNotes(prev => [newNote, ...prev]);
  }, []);
  
  return { emotionalNotes, addEmotionalNote, isLoading: false };
};

const DailyEmotionalNotes = () => {
  const { emotionalNotes, addEmotionalNote, isLoading } = useWellness();
  
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(true);

  // Core emotions for daily fluctuations
  const emotions: EmotionData[] = [
    { value: 'happy', label: 'Happy', icon: '😊', color: '#27ae60' },
    { value: 'excited', label: 'Excited', icon: '🤩', color: '#e74c3c' },
    { value: 'calm', label: 'Calm', icon: '😌', color: '#3498db' },
    { value: 'confident', label: 'Confident', icon: '💪', color: '#9b59b6' },
    { value: 'peaceful', label: 'Peaceful', icon: '🕊️', color: '#16a085' },
    { value: 'energetic', label: 'Energetic', icon: '⚡', color: '#f1c40f' },
    
    { value: 'neutral', label: 'Neutral', icon: '😐', color: '#95a5a6' },
    { value: 'tired', label: 'Tired', icon: '😴', color: '#7f8c8d' },
    { value: 'bored', label: 'Bored', icon: '😑', color: '#bdc3c7' },
    
    { value: 'sad', label: 'Sad', icon: '😢', color: '#3498db' },
    { value: 'anxious', label: 'Anxious', icon: '😰', color: '#f39c12' },
    { value: 'frustrated', label: 'Frustrated', icon: '😤', color: '#e67e22' },
    { value: 'stressed', label: 'Stressed', icon: '😖', color: '#e74c3c' },
    { value: 'overwhelmed', label: 'Overwhelmed', icon: '🤯', color: '#c0392b' },
    { value: 'angry', label: 'Angry', icon: '😠', color: '#e74c3c' },
    { value: 'lonely', label: 'Lonely', icon: '😔', color: '#8e44ad' }
  ];

  const commonTriggers = [
    'work/career', 'relationships', 'health', 'family', 'finances', 
    'social situation', 'weather', 'news/media', 'personal achievement', 
    'daily routine', 'unexpected event', 'physical state'
  ];

  const getEmotionData = useCallback((emotionValue: string): EmotionData => {
    return emotions.find(e => e.value === emotionValue) || emotions[0];
  }, [emotions]);

  const quickLog = useCallback((emotionValue: string) => {
    const emotionData = getEmotionData(emotionValue);
    addEmotionalNote({
      content: `Quick emotional check-in: ${emotionData.label}`,
      emotion: emotionValue,
      intensity: 5,
      trigger: 'quick check-in'
    });
  }, [addEmotionalNote, getEmotionData]);

  const handleSubmit = useCallback(async () => {
    if (!emotion) return;

    setIsSubmitting(true);
    try {
      const emotionData = getEmotionData(emotion);
      await addEmotionalNote({
        content: content.trim() || `Feeling ${emotionData.label.toLowerCase()}`,
        emotion,
        intensity,
        trigger: trigger || 'unspecified'
      });

      // Reset form
      setContent('');
      setEmotion('');
      setIntensity(5);
      setTrigger('');
    } catch (error) {
      console.error('Error adding emotional note:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, emotion, intensity, trigger, addEmotionalNote, getEmotionData]);

  const getTimeDisplay = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const todayNotes = emotionalNotes.filter(note => {
    const noteDate = new Date(note.timestamp).toDateString();
    const today = new Date().toDateString();
    return noteDate === today;
  });

  if (isLoading) {
    return (
      <div className="daily-emotional-notes">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading emotional notes...
        </div>
      </div>
    );
  }

  return (
    <div className="daily-emotional-notes">
      <style>{`
        .daily-emotional-notes {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .notes-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .notes-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 2.2em;
          font-weight: 600;
        }

        .notes-description {
          color: #666;
          font-size: 1.1em;
          margin-bottom: 20px;
        }

        .view-toggle {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .view-toggle-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 4px;
          display: flex;
        }

        .view-button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .view-button.active {
          background: #3498db;
          color: white;
        }

        .create-note-section {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 25px;
          margin-bottom: 30px;
        }

        .emotion-selector {
          margin-bottom: 20px;
        }

        .emotion-selector h3 {
          margin: 0 0 20px 0;
          color: #2c3e50;
          font-size: 1.2em;
          text-align: center;
        }

        .emotion-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .emotion-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px 10px;
          background: white;
          border: 2px solid var(--emotion-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
          font-weight: 500;
          color: var(--emotion-color);
        }

        .emotion-button:hover {
          background: var(--emotion-color);
          color: white;
        }

        .emotion-icon {
          font-size: 24px;
          margin-bottom: 5px;
        }

        .note-input-container {
          margin-bottom: 20px;
        }

        .note-input-container label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .intensity-container label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .intensity-slider {
          width: 100%;
          margin-bottom: 8px;
        }

        .intensity-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }

        textarea, select {
          width: 100%;
          padding: 12px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
        }

        .save-note-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: opacity 0.2s ease;
        }

        .save-note-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .notes-history-section {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 25px;
        }

        .notes-history-section h2 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 1.5em;
        }

        .empty-history {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .empty-history .emoji {
          font-size: 48px;
          display: block;
          margin-bottom: 10px;
        }

        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .note-card {
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 16px;
          background: rgba(0,0,0,0.02);
        }

        .note-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .note-emotion-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .note-emotion {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .note-emotion .emotion-icon {
          font-size: 20px;
        }

        .note-emotion-label {
          font-weight: 600;
          font-size: 16px;
        }

        .note-intensity {
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }

        .note-date {
          font-size: 12px;
          color: #666;
        }

        .note-content {
          color: #2c3e50;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .note-trigger {
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .note-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>

      <div className="notes-header">
        <h1>Emotional Check-ins</h1>
        <p className="notes-description">
          Capture how you're feeling throughout the day
        </p>
      </div>

      {/* Toggle between Quick and Detailed */}
      <div className="view-toggle">
        <div className="view-toggle-container">
          <button
            onClick={() => setShowQuickLog(true)}
            className={`view-button ${showQuickLog ? 'active' : ''}`}
          >
            Quick Log
          </button>
          <button
            onClick={() => setShowQuickLog(false)}
            className={`view-button ${!showQuickLog ? 'active' : ''}`}
          >
            Detailed
          </button>
        </div>
      </div>

      {/* Quick Emotion Buttons */}
      {showQuickLog && (
        <div className="create-note-section">
          <div className="emotion-selector">
            <h3>How are you feeling right now?</h3>
            <div className="emotion-buttons">
              {emotions.slice(0, 12).map(emotion => (
                <button
                  key={emotion.value}
                  onClick={() => quickLog(emotion.value)}
                  className="emotion-button"
                  style={{ '--emotion-color': emotion.color } as React.CSSProperties}
                >
                  <span className="emotion-icon">{emotion.icon}</span>
                  {emotion.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Form */}
      {!showQuickLog && (
        <div className="create-note-section">
          <div className="note-input-container">
            <label>What's happening? (Optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe what triggered this emotion or what's on your mind..."
              rows={3}
            />
          </div>

          <div className="form-grid">
            {/* Emotion Selection */}
            <div>
              <label>Emotion *</label>
              <select
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                required
              >
                <option value="">How are you feeling?</option>
                {emotions.map(em => (
                  <option key={em.value} value={em.value}>
                    {em.icon} {em.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Intensity */}
            <div className="intensity-container">
              <label>Intensity: {intensity}/10</label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="intensity-slider"
              />
              <div className="intensity-labels">
                <span>Mild</span>
                <span>Intense</span>
              </div>
            </div>
          </div>

          {/* Trigger */}
          <div className="note-input-container">
            <label>What triggered this? (Optional)</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
            >
              <option value="">Select a trigger...</option>
              {commonTriggers.map(trig => (
                <option key={trig} value={trig}>{trig}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !emotion}
            className="save-note-button"
          >
            {isSubmitting ? 'Saving...' : 'Log Emotion'}
          </button>
        </div>
      )}

      {/* Today's Emotional Journey */}
      <div className="notes-history-section">
        <h2>Today's Emotional Journey ({todayNotes.length})</h2>
        
        {todayNotes.length === 0 ? (
          <div className="empty-history">
            <span className="emoji">💭</span>
            No emotions logged today yet. Start tracking your feelings above!
          </div>
        ) : (
          <div className="notes-list">
            {todayNotes
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((note) => {
                const emotionData = getEmotionData(note.emotion);
                return (
                  <div
                    key={note.noteId}
                    className="note-card"
                    style={{ 
                      borderColor: `${emotionData.color}40`,
                      background: `${emotionData.color}08`
                    }}
                  >
                    <div className="note-header">
                      <div className="note-emotion-info">
                        <div className="note-emotion">
                          <span className="emotion-icon">{emotionData.icon}</span>
                          <span 
                            className="note-emotion-label"
                            style={{ color: emotionData.color }}
                          >
                            {emotionData.label}
                          </span>
                        </div>
                        <span 
                          className="note-intensity"
                          style={{ background: emotionData.color }}
                        >
                          {note.intensity}/10
                        </span>
                      </div>
                      <span className="note-date">
                        {getTimeDisplay(note.timestamp)}
                      </span>
                    </div>
                    
                    {note.content && (
                      <div className="note-content">
                        {note.content}
                      </div>
                    )}
                    
                    {note.trigger && note.trigger !== 'unspecified' && (
                      <div className="note-trigger">
                        Triggered by: {note.trigger}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyEmotionalNotes;