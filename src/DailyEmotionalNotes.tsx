import React, { useState, useEffect, useCallback } from 'react';
// 🚀 UPDATED: Use Wellness Context instead of LocalDataCompat
import { useWellness } from './contexts/wellness/WellnessContext';

// Updated interface to match WellnessContext
interface EmotionalNote {
  noteId: string;
  content: string;
  emotion: string;
  energyLevel: number;
  tags: string[];
  timestamp: string;
  date: string;
  gratitude?: string[];
}

const DailyEmotionalNotes: React.FC = () => {
  // 🚀 UPDATED: Use focused wellness context
  const { emotionalNotes, addEmotionalNote, isLoading } = useWellness();
  
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState<string[]>(['']);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emotions = [
    'happy', 'sad', 'anxious', 'calm', 'excited', 'tired', 'frustrated', 
    'content', 'overwhelmed', 'peaceful', 'motivated', 'confused',
    'grateful', 'stressed', 'hopeful', 'angry', 'loved', 'lonely'
  ];

  const commonTags = [
    'meditation', 'work', 'family', 'health', 'goals', 'relationships',
    'exercise', 'sleep', 'food', 'weather', 'social', 'learning'
  ];

  // ✅ FIXED: Remove timestamp from addEmotionalNote call
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !emotion) return;

    setIsSubmitting(true);
    try {
      // ✅ FIXED: Don't pass timestamp - let context generate it
      await addEmotionalNote({
        content: content.trim(),
        emotion,
        energyLevel,
        intensity: energyLevel, 
        tags,
        gratitude: gratitude.filter(g => g.trim())
      });

      // Reset form
      setContent('');
      setEmotion('');
      setEnergyLevel(5);
      setTags([]);
      setGratitude(['']);
      setTagInput('');
    } catch (error) {
      console.error('Error adding emotional note:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, emotion, energyLevel, tags, gratitude, addEmotionalNote]);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addGratitudeItem = () => {
    setGratitude([...gratitude, '']);
  };

  const updateGratitudeItem = (index: number, value: string) => {
    const updated = [...gratitude];
    updated[index] = value;
    setGratitude(updated);
  };

  const removeGratitudeItem = (index: number) => {
    setGratitude(gratitude.filter((_, i) => i !== index));
  };

  // ✅ FIXED: Quick emotion logging without timestamp
  const quickLog = useCallback((quickEmotion: string, quickContent: string) => {
    addEmotionalNote({
      content: quickContent,
      emotion: quickEmotion,
      energyLevel: 7,
      intensity: 7,
      tags: ['quick-log']
    });
  }, [addEmotionalNote]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <div>Loading emotional notes...</div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        color: '#2c3e50',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        Daily Emotional Notes
      </h1>

      {/* Quick Log Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => quickLog('grateful', 'Feeling grateful today 🙏')}
          style={{
            background: 'linear-gradient(135deg, #f39c12, #e67e22)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🙏 Grateful
        </button>
        <button
          onClick={() => quickLog('accomplished', 'Completed something meaningful today ✅')}
          style={{
            background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✅ Accomplished
        </button>
        <button
          onClick={() => quickLog('peaceful', 'Found a moment of peace 🕊️')}
          style={{
            background: 'linear-gradient(135deg, #3498db, #74b9ff)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🕊️ Peaceful
        </button>
        <button
          onClick={() => quickLog('motivated', 'Feeling motivated and energized! 🚀')}
          style={{
            background: 'linear-gradient(135deg, #e74c3c, #fd79a8)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🚀 Motivated
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            What's on your mind? *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, feelings, or experiences..."
            required
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Emotion Selection */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              Current Emotion *
            </label>
            <select
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">Select emotion...</option>
              {emotions.map(em => (
                <option key={em} value={em}>
                  {em.charAt(0).toUpperCase() + em.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Energy Level */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold',
              color: '#2c3e50'
            }}>
              Energy Level: {energyLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              style={{
                width: '100%',
                marginBottom: '8px'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Tags
          </label>
          
          {/* Common Tags */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '10px'
          }}>
            {commonTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={tags.includes(tag)}
                style={{
                  background: tags.includes(tag) ? '#27ae60' : '#ecf0f1',
                  color: tags.includes(tag) ? 'white' : '#2c3e50',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  cursor: tags.includes(tag) ? 'default' : 'pointer',
                  opacity: tags.includes(tag) ? 0.7 : 1
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Custom Tag Input */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
              placeholder="Add custom tag..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Add
            </button>
          </div>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div style={{
              marginTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px'
            }}>
              {tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0',
                      marginLeft: '4px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Gratitude Section */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            What are you grateful for today?
          </label>
          
          {gratitude.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '8px'
            }}>
              <input
                type="text"
                value={item}
                onChange={(e) => updateGratitudeItem(index, e.target.value)}
                placeholder={`Gratitude ${index + 1}...`}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {gratitude.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGratitudeItem(index)}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addGratitudeItem}
            style={{
              background: '#27ae60',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            + Add Another
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || !emotion}
          style={{
            background: isSubmitting ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            width: '100%',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save Emotional Note'}
        </button>
      </form>

      {/* Recent Notes */}
      <div>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '20px'
        }}>
          Recent Notes ({emotionalNotes.length})
        </h2>
        
        {emotionalNotes.length === 0 ? (
          <div style={{
            background: '#f8f9fa',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center',
            color: '#666'
          }}>
            No emotional notes yet. Start by writing your first note above! 📝
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {emotionalNotes
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((note) => (
                <div
                  key={note.noteId}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        background: '#3498db',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {note.emotion}
                      </span>
                      <span style={{
                        background: '#e9ecef',
                        color: '#495057',
                        padding: '4px 8px',
                        borderRadius: '10px',
                        fontSize: '12px'
                      }}>
                        Energy: {note.energyLevel}/10
                      </span>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {new Date(note.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '16px',
                    lineHeight: '1.5',
                    marginBottom: '10px',
                    color: '#2c3e50'
                  }}>
                    {note.content}
                  </div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px',
                      marginBottom: '10px'
                    }}>
                      {note.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            background: '#f8f9fa',
                            color: '#495057',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {note.gratitude && note.gratitude.length > 0 && (
                    <div style={{
                      background: '#fff3cd',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '10px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#856404',
                        marginBottom: '5px'
                      }}>
                        Grateful for:
                      </div>
                      <ul style={{
                        margin: '0',
                        paddingLeft: '15px',
                        fontSize: '14px',
                        color: '#856404'
                      }}>
                        {note.gratitude.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyEmotionalNotes;