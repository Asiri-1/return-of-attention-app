import React, { useState, useEffect, useCallback } from 'react';
import { useLocalData } from './contexts/LocalDataContext';

// Updated interface to match LocalDataContext
interface EmotionalNote {
  noteId: string;
  content: string;
  timestamp: string;
  emotion?: string;
  tags?: string[];
  energyLevel?: number;
}

const DailyEmotionalNotes: React.FC = () => {
  // Use LocalDataContext instead of local state
  const { getDailyEmotionalNotes, addEmotionalNote } = useLocalData();
  
  const [notes, setNotes] = useState<EmotionalNote[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<string>('neutral');
  const [tags, setTags] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'create' | 'history'>('create');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [migrationComplete, setMigrationComplete] = useState<boolean>(false);
  
  // Enhanced emotion data with better colors and descriptions
  const emotions = [
    { key: 'joy', name: 'Joy', icon: '😊', color: '#4caf50' },
    { key: 'gratitude', name: 'Grateful', icon: '🙏', color: '#8bc34a' },
    { key: 'calm', name: 'Calm', icon: '😌', color: '#00bcd4' },
    { key: 'excited', name: 'Excited', icon: '🤩', color: '#ff9800' },
    { key: 'neutral', name: 'Neutral', icon: '😐', color: '#9e9e9e' },
    { key: 'thoughtful', name: 'Thoughtful', icon: '🤔', color: '#607d8b' },
    { key: 'stressed', name: 'Stressed', icon: '😰', color: '#ff5722' },
    { key: 'sad', name: 'Sad', icon: '😢', color: '#3f51b5' }
  ];

  // Migration function to move old localStorage data to LocalDataContext
  const migrateOldData = useCallback(() => {
    try {
      const oldNotes = localStorage.getItem('dailyEmotionalNotes');
      if (oldNotes && !migrationComplete) {
        const parsedOldNotes = JSON.parse(oldNotes);
        
        // Migrate each old note to new format
        parsedOldNotes.forEach((oldNote: any) => {
          // Convert old format to new format and add via context
          addEmotionalNote({
            content: oldNote.content,
            timestamp: oldNote.timestamp,
            emotion: oldNote.emotion,
            energyLevel: oldNote.energyLevel,
            tags: oldNote.tags
          });
        });
        
        // Clean up old storage
        localStorage.removeItem('dailyEmotionalNotes');
        setMigrationComplete(true);
        
        console.log('✅ Migrated old emotional notes to new system');
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }, [addEmotionalNote, migrationComplete]);

  // Load notes from LocalDataContext
  const loadNotesFromContext = useCallback(() => {
    try {
      const contextNotes = getDailyEmotionalNotes();
      // Convert to local interface format
      const formattedNotes = contextNotes.map(note => ({
        noteId: note.noteId,
        content: note.content,
        timestamp: note.timestamp,
        emotion: note.emotion,
        tags: note.tags,
        energyLevel: note.energyLevel
      }));
      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error loading notes from context:', error);
    }
  }, [getDailyEmotionalNotes]);

  // Load data and handle migration on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // First, try to migrate old data
        migrateOldData();
        
        // Then load from context
        loadNotesFromContext();
        
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeData();
  }, [migrateOldData, loadNotesFromContext]);

  // Refresh notes when context changes
  useEffect(() => {
    if (isLoaded) {
      loadNotesFromContext();
    }
  }, [isLoaded, loadNotesFromContext]);
  
  // Handle note submission using LocalDataContext
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate brief processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Add note via LocalDataContext
      addEmotionalNote({
        content: newNote.trim(),
        timestamp: new Date().toISOString(),
        emotion: selectedEmotion,
        energyLevel,
        tags: tagArray.length > 0 ? tagArray : undefined
      });
      
      // Refresh notes from context
      loadNotesFromContext();
      
      // Reset form
      setNewNote('');
      setSelectedEmotion('neutral');
      setTags('');
      setEnergyLevel(5);
      
      // Switch to history view to show the new note
      setViewMode('history');
      
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete note function (no changes needed since we're working with local state)
  const deleteNote = useCallback((noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      // For now, just remove from local state
      // Note: You might want to add a deleteEmotionalNote method to LocalDataContext
      const updatedNotes = notes.filter(note => note.noteId !== noteId);
      setNotes(updatedNotes);
      
      console.log('⚠️ Note deleted from local view. Consider adding deleteEmotionalNote to LocalDataContext for persistence.');
    }
  }, [notes]);
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  // Get emotion data
  const getEmotionData = (emotionKey: string) => {
    return emotions.find(e => e.key === emotionKey) || emotions.find(e => e.key === 'neutral')!;
  };

  // Show loading state
  if (!isLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <h2>Loading your notes...</h2>
          {migrationComplete && (
            <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '10px' }}>
              ✅ Data migration complete
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Daily Emotional Notes 📝
        </h1>
        <p style={{
          fontSize: '16px',
          opacity: 0.9,
          margin: '0 0 30px 0'
        }}>
          Track your emotional experiences and build self-awareness
        </p>
        
        {/* View Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '25px',
          padding: '5px',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => setViewMode('create')}
            style={{
              background: viewMode === 'create' 
                ? 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)'
                : 'transparent',
              color: viewMode === 'create' ? '#333' : 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flex: 1
            }}
          >
            ✏️ Create Note
          </button>
          <button
            onClick={() => setViewMode('history')}
            style={{
              background: viewMode === 'history' 
                ? 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)'
                : 'transparent',
              color: viewMode === 'history' ? '#333' : 'white',
              border: 'none',
              borderRadius: '20px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              flex: 1
            }}
          >
            📚 History ({notes.length})
          </button>
        </div>
      </header>
      
      {viewMode === 'create' ? (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '30px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              {/* Emotion Selection */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  How are you feeling? 💭
                </label>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '10px'
                }}>
                  {emotions.map(emotion => (
                    <button
                      key={emotion.key}
                      type="button"
                      onClick={() => setSelectedEmotion(emotion.key)}
                      style={{
                        background: selectedEmotion === emotion.key 
                          ? `linear-gradient(135deg, ${emotion.color} 0%, ${emotion.color}dd 100%)`
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: selectedEmotion === emotion.key ? `2px solid ${emotion.color}` : '2px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '15px',
                        padding: '15px 10px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        transform: selectedEmotion === emotion.key ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: selectedEmotion === emotion.key ? `0 4px 15px ${emotion.color}40` : 'none'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '5px' }}>{emotion.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{emotion.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  Energy Level: {energyLevel}/10 ⚡
                </label>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '14px', opacity: 0.8 }}>Low</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    style={{
                      flex: 1,
                      maxWidth: '200px',
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.3)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '14px', opacity: 0.8 }}>High</span>
                </div>
              </div>
              
              {/* Note Content */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  What's happening? 📖
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Describe your experience, thoughts, or feelings..."
                  required
                  style={{
                    width: '100%',
                    height: '120px',
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
              
              {/* Tags */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  Tags (optional) 🏷️
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, family, health, meditation..."
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !newNote.trim()}
                style={{
                  width: '100%',
                  background: !newNote.trim() 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : isSubmitting 
                    ? 'rgba(76, 175, 80, 0.7)'
                    : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '15px 30px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: !newNote.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: !newNote.trim() ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {notes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '40px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No notes yet</h3>
              <p style={{ fontSize: '16px', opacity: 0.8 }}>
                Start by creating your first emotional note!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px'
            }}>
              {notes.map(note => {
                const emotionData = getEmotionData(note.emotion || 'neutral');
                return (
                  <div
                    key={note.noteId}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      padding: '25px',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteNote(note.noteId)}
                      style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(244, 67, 54, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete note"
                    >
                      ×
                    </button>

                    {/* Note Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      paddingRight: '40px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{
                          background: `linear-gradient(135deg, ${emotionData.color} 0%, ${emotionData.color}dd 100%)`,
                          borderRadius: '20px',
                          padding: '8px 15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>{emotionData.icon}</span>
                          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            {emotionData.name}
                          </span>
                        </div>
                        
                        {note.energyLevel && (
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '15px',
                            padding: '5px 10px',
                            fontSize: '12px'
                          }}>
                            ⚡ {note.energyLevel}/10
                          </div>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        opacity: 0.8
                      }}>
                        {formatDate(note.timestamp)}
                      </div>
                    </div>
                    
                    {/* Note Content */}
                    <div style={{
                      fontSize: '16px',
                      lineHeight: '1.5',
                      marginBottom: '15px'
                    }}>
                      {note.content}
                    </div>
                    
                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {note.tags.map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              borderRadius: '12px',
                              padding: '4px 8px',
                              fontSize: '12px'
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Wrapper component
const DailyEmotionalNotesWrapper: React.FC = () => {
  return <DailyEmotionalNotes />;
};

export default DailyEmotionalNotesWrapper;