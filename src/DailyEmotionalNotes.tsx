import React, { useState, useEffect } from 'react';
import './DailyEmotionalNotes.css';
import { useAuth } from './AuthContext';

interface EmotionalNote {
  id: string;
  content: string;
  timestamp: string;
  emotion?: string;
  tags?: string[];
}

const DailyEmotionalNotes: React.FC = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<EmotionalNote[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('neutral');
  const [tags, setTags] = useState<string>('');
  const [viewMode, setViewMode] = useState<'create' | 'history'>('create');
  
  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('emotionalNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error parsing saved notes:', e);
      }
    }
  }, []);
  
  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emotionalNotes', JSON.stringify(notes));
  }, [notes]);
  
  // Handle note submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;
    
    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const newNoteObj: EmotionalNote = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date().toISOString(),
      emotion: selectedEmotion,
      tags: tagArray.length > 0 ? tagArray : undefined
    };
    
    setNotes([newNoteObj, ...notes]);
    setNewNote('');
    setSelectedEmotion('neutral');
    setTags('');
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get emotion color
  const getEmotionColor = (emotion: string): string => {
    switch (emotion) {
      case 'joy': return '#FFD700';
      case 'sadness': return '#6495ED';
      case 'anger': return '#FF6347';
      case 'fear': return '#9370DB';
      case 'disgust': return '#8FBC8F';
      case 'surprise': return '#FF69B4';
      default: return '#A9A9A9'; // neutral
    }
  };
  
  // Get emotion icon
  const getEmotionIcon = (emotion: string): string => {
    switch (emotion) {
      case 'joy': return '😊';
      case 'sadness': return '😢';
      case 'anger': return '😠';
      case 'fear': return '😨';
      case 'disgust': return '🤢';
      case 'surprise': return '😲';
      default: return '😐'; // neutral
    }
  };
  
  return (
    <div className="daily-emotional-notes">
      <header className="notes-header">
        <h1>Daily Emotional Notes</h1>
        <p className="notes-description">
          Track your emotional experiences throughout the day.
        </p>
        
        <div className="view-toggle">
          <button 
            className={`view-button ${viewMode === 'create' ? 'active' : ''}`}
            onClick={() => setViewMode('create')}
          >
            Create Note
          </button>
          <button 
            className={`view-button ${viewMode === 'history' ? 'active' : ''}`}
            onClick={() => setViewMode('history')}
          >
            History
          </button>
        </div>
      </header>
      
      {viewMode === 'create' ? (
        <div className="create-note-section">
          <form onSubmit={handleSubmit}>
            <div className="emotion-selector">
              <label>How are you feeling?</label>
              <div className="emotion-buttons">
                {['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'neutral'].map(emotion => (
                  <button
                    key={emotion}
                    type="button"
                    className={`emotion-button ${selectedEmotion === emotion ? 'selected' : ''}`}
                    onClick={() => setSelectedEmotion(emotion)}
                    style={{ 
                      backgroundColor: selectedEmotion === emotion ? getEmotionColor(emotion) : 'transparent',
                      color: selectedEmotion === emotion ? '#fff' : '#333'
                    }}
                  >
                    <span className="emotion-icon">{getEmotionIcon(emotion)}</span>
                    <span className="emotion-name">
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="note-input-container">
              <label htmlFor="note-content">What's happening?</label>
              <textarea
                id="note-content"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Describe your experience..."
                rows={5}
                required
              />
            </div>
            
            <div className="tags-input-container">
              <label htmlFor="note-tags">Tags (comma separated)</label>
              <input
                id="note-tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="work, family, health..."
              />
            </div>
            
            <button type="submit" className="save-note-button">
              Save Note
            </button>
          </form>
        </div>
      ) : (
        <div className="notes-history-section">
          {notes.length === 0 ? (
            <div className="empty-history">
              <p>No notes yet. Start by creating your first emotional note!</p>
            </div>
          ) : (
            <div className="notes-list">
              {notes.map(note => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <div className="note-emotion" style={{ backgroundColor: getEmotionColor(note.emotion || 'neutral') }}>
                      <span className="emotion-icon">{getEmotionIcon(note.emotion || 'neutral')}</span>
                      <span className="emotion-name">
                        {note.emotion ? note.emotion.charAt(0).toUpperCase() + note.emotion.slice(1) : 'Neutral'}
                      </span>
                    </div>
                    <div className="note-date">{formatDate(note.timestamp)}</div>
                  </div>
                  
                  <div className="note-content">{note.content}</div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyEmotionalNotes;
