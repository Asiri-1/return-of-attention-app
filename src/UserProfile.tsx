import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onLogout }) => {
  const { currentUser } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLogout = async () => {
    try {
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 🔧 PRESERVED: Get proper experience level based on app's progression system
  const getExperienceLevel = () => {
    if (!currentUser) return 'Seeker';
    
    // Check enhanced profile first
    if (currentUser.enhancedProfile?.currentProgress?.currentTLevel) {
      return currentUser.enhancedProfile.currentProgress.currentTLevel;
    }
    
    // Check current stage to determine level
    const stage = parseInt(currentUser.currentStage) || 1;
    if (stage === 1) return 'Seeker';
    if (stage === 2) return 'PAHM Trainee';
    if (stage === 3) return 'PAHM Beginner';
    if (stage === 4) return 'PAHM Practitioner';
    if (stage === 5) return 'PAHM Master';
    if (stage === 6) return 'PAHM Illuminator';
    
    // Fallback to stored experience level
    return currentUser.experienceLevel || 'Seeker';
  };

  // 🔧 PRESERVED: Get proper join date from Firebase user creation
  const getJoinDate = () => {
    if (!currentUser) return new Date().toLocaleDateString();
    
    if (currentUser.enhancedProfile?.onboardingData?.onboardingCompletedAt) {
      return new Date(currentUser.enhancedProfile.onboardingData.onboardingCompletedAt).toLocaleDateString();
    }
    
    // Last resort: use a reasonable default
    return new Date().toLocaleDateString();
  };

  // 🔧 PRESERVED: Generate membership ID from UID
  const getMembershipId = () => {
    if (!currentUser) return 'SP-UNKNOWN';
    
    if (currentUser.uid) {
      // Create a readable membership ID from UID
      const shortUid = currentUser.uid.substring(0, 8).toUpperCase();
      return `SP-${shortUid}`;
    }
    return 'SP-UNKNOWN';
  };

  // 🔧 PRESERVED: Get account type based on proper completion checking
  const getAccountType = () => {
    if (!currentUser) return 'New Member';
    
    const isAdmin = currentUser.email === 'asiriamarasinghe35@gmail.com';
    if (isAdmin) return 'Administrator';
    
    // Check if onboarding is completed
    const hasCompletedOnboarding = currentUser.questionnaireCompleted && currentUser.assessmentCompleted;
    if (hasCompletedOnboarding) return 'Active Member';
    
    return 'New Member';
  };

  // 🔧 PRESERVED: Get current stage name
  const getCurrentStageName = () => {
    if (!currentUser) return 'Stage 1';
    
    const stage = parseInt(currentUser.currentStage) || 1;
    const stageNames = {
      1: 'Seeker - Physical stillness training',
      2: 'PAHM Trainee - Basic attention training', 
      3: 'PAHM Beginner - Structured practice',
      4: 'PAHM Practitioner - Advanced techniques',
      5: 'PAHM Master - Refined awareness',
      6: 'PAHM Illuminator - Complete mastery'
    };
    
    return stageNames[stage as keyof typeof stageNames] || `Stage ${stage}`;
  };

  // 🔧 PRESERVED: Format goals function
  const formatGoals = (goals: string[]) => {
    if (!goals || goals.length === 0) return 'None specified';
    return goals.map(goal => goal.replace('-', ' ')).join(', ');
  };

  // 🔧 FIXED: Format questionnaire responses for display - HANDLES CORRECT DATA STRUCTURE
  const formatQuestionnaireResponses = (questionnaire: any) => {
    if (!questionnaire) return null;

    console.log('🔍 DEBUG: Full questionnaire data:', questionnaire);

    const sections = [
      {
        id: 'demographics',
        title: 'Demographics & Background',
        data: questionnaire.demographics || {},
        fallbackData: {
          experience_level: questionnaire.experienceLevel || questionnaire.experience_level || questionnaire.mindfulnessExperience,
          goals: questionnaire.goals,
          age_range: questionnaire.ageRange || questionnaire.age_range,
          location: questionnaire.location,
          occupation: questionnaire.occupation
        }
      },
      {
        id: 'lifestyle',
        title: 'Lifestyle Patterns',
        data: questionnaire.lifestyle_patterns || {},
        fallbackData: {
          sleep_pattern: questionnaire.sleepQuality || questionnaire.sleep_pattern || questionnaire.sleep,
          physical_activity: questionnaire.physicalActivity || questionnaire.exercise,
          stress_triggers: questionnaire.stressTriggers || questionnaire.stress_triggers,
          daily_routine: questionnaire.dailyRoutine || questionnaire.routine,
          stress_level: questionnaire.stressLevel || questionnaire.stress_level
        }
      },
      {
        id: 'thinking',
        title: 'Thinking Patterns',
        data: questionnaire.thinking_patterns || {},
        fallbackData: {
          // 🔧 FIXED: Use correct property names that match your actual questionnaire
          emotional_awareness: questionnaire.emotionalAwareness || questionnaire.emotional_awareness,
          stress_response: questionnaire.stressResponse || questionnaire.stress_response,
          decision_making: questionnaire.decisionMaking || questionnaire.decision_making,
          self_reflection: questionnaire.selfReflection || questionnaire.self_reflection,
          focus_ability: questionnaire.focusAbility || questionnaire.focus_ability,
          mind_wandering: questionnaire.mindWandering || questionnaire.mind_wandering,
          emotional_regulation: questionnaire.emotionalRegulation || questionnaire.emotional_regulation
        }
      },
      {
        id: 'mindfulness',
        title: 'Mindfulness Experience',
        data: questionnaire.mindfulness_specific || {},
        fallbackData: {
          // 🔧 FIXED: Use correct property names that match your actual questionnaire
          mindfulness_experience: questionnaire.mindfulnessExperience || questionnaire.mindfulness_experience,
          meditation_background: questionnaire.meditationBackground || questionnaire.meditation_background,
          practice_goals: questionnaire.practiceGoals || questionnaire.practice_goals,
          preferred_duration: questionnaire.preferredDuration || questionnaire.preferred_duration,
          practice_frequency: questionnaire.practiceFrequency || questionnaire.practice_frequency || questionnaire.frequency,
          current_practices: questionnaire.currentPractices || questionnaire.current_practices,
          meditation_style: questionnaire.meditationStyle || questionnaire.meditation_style,
          guidance_preference: questionnaire.guidancePreference || questionnaire.guidance_preference
        }
      }
    ];

    return sections.map(section => {
      const data = Object.keys(section.data).length > 0 ? section.data : section.fallbackData;
      
      // 🔧 FILTER OUT empty/null values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          return value !== null && value !== undefined && value !== '' && 
                 (Array.isArray(value) ? value.length > 0 : true);
        })
      );
      
      if (!filteredData || Object.keys(filteredData).length === 0) {
        console.log(`⚠️ No data found for section: ${section.title}`);
        return null;
      }

      console.log(`✅ Found data for section: ${section.title}`, filteredData);

      return (
        <div key={section.id} style={{ marginBottom: '20px' }}>
          <button
            onClick={() => toggleSection(section.id)}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}
          >
            <span>{section.title} ({Object.keys(filteredData).length} items)</span>
            <span>{expandedSections[section.id] ? '▼' : '▶'}</span>
          </button>
          
          {expandedSections[section.id] && (
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '20px'
            }}>
              {Object.entries(filteredData).map(([key, value]: [string, any]) => {
                return (
                  <div key={key} style={{ marginBottom: '15px' }}>
                    <strong style={{ 
                      color: '#495057', 
                      textTransform: 'capitalize',
                      display: 'block',
                      marginBottom: '5px'
                    }}>
                      {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </strong>
                    <div style={{ 
                      color: '#6c757d',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {Array.isArray(value) ? (
                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                          {value.map((item, index) => (
                            <li key={index}>{String(item)}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  // 🎯 UPDATED: Format self-assessment responses for display - HANDLES NEW SIMPLE FORMAT
  const formatSelfAssessmentResponses = (selfAssessment: any) => {
    if (!selfAssessment) return null;

    console.log('🔍 DEBUG: Self-assessment data received:', selfAssessment);

    // 🎯 NEW: Handle simple format (like questionnaire) - PRIORITY CHECK
    const simpleFormatCategories = ['taste', 'smell', 'sound', 'sight', 'touch', 'mind'];
    const hasSimpleFormat = simpleFormatCategories.some(cat => selfAssessment[cat] !== undefined);
    
    if (hasSimpleFormat) {
      console.log('✅ SIMPLE FORMAT: Detected new simple self-assessment format');
      
      const categoryInfo = {
        taste: { icon: '🍽️', title: 'Food & Taste' },
        smell: { icon: '👃', title: 'Scents & Aromas' },
        sound: { icon: '🎵', title: 'Sounds & Music' },
        sight: { icon: '👁️', title: 'Visual & Beauty' },
        touch: { icon: '✋', title: 'Touch & Textures' },
        mind: { icon: '🧠', title: 'Thoughts & Mental Images' }
      };

      return (
        <div>
          {/* Header for simple format */}
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>
              ✨ Simple Assessment Format (New)
            </h4>
            <p style={{ color: '#1b5e20', fontSize: '14px', margin: 0 }}>
              Completed: {selfAssessment.completedAt ? new Date(selfAssessment.completedAt).toLocaleDateString() : 'Recently'}<br/>
              Version: {selfAssessment.version || '1.0'} | Type: {selfAssessment.type || 'selfAssessment'}
            </p>
            
            {/* Show attachment scoring */}
            {selfAssessment.attachmentScore !== undefined && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px',
                background: '#ffffff',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <strong style={{ color: '#2e7d32' }}>📊 Scoring Summary:</strong>
                <div style={{ marginTop: '5px', color: '#1b5e20' }}>
                  • Attachment Penalty: <strong>{selfAssessment.attachmentScore} points</strong><br/>
                  • Non-attachment Count: <strong>{selfAssessment.nonAttachmentCount || 0}/6 categories</strong><br/>
                  • Non-attachment Percentage: <strong>{Math.round(((selfAssessment.nonAttachmentCount || 0) / 6) * 100)}%</strong>
                </div>
              </div>
            )}
          </div>

          {/* Display each category */}
          {simpleFormatCategories.map(category => {
            const value = selfAssessment[category];
            if (value === undefined) return null;
            
            const info = categoryInfo[category as keyof typeof categoryInfo];
            const points = value === 'none' ? 0 : value === 'some' ? -7 : value === 'strong' ? -15 : 0;
            
            return (
              <div key={category} style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '15px'
              }}>
                <h4 style={{ 
                  color: '#495057',
                  margin: '0 0 10px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {info.icon} {info.title}
                </h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <strong style={{ color: '#6c757d' }}>Preference Level: </strong>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: value === 'none' ? '#e8f5e8' : 
                               value === 'some' ? '#fff3cd' : '#f8d7da',
                    color: value === 'none' ? '#2e7d32' : 
                           value === 'some' ? '#856404' : '#721c24'
                  }}>
                    {value === 'none' && '✨ No particular preferences'}
                    {value === 'some' && '⚖️ Some preferences, flexible'}
                    {value === 'strong' && '🔥 Strong preferences'}
                  </span>
                  
                  {/* Show point value */}
                  <span style={{
                    marginLeft: '10px',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: points === 0 ? '#d4edda' : '#f8d7da',
                    color: points === 0 ? '#155724' : '#721c24'
                  }}>
                    {points >= 0 ? `+${points}` : `${points}`} pts
                  </span>
                </div>
                
                <div style={{ fontSize: '12px', color: '#adb5bd' }}>
                  Category: {category} | Value: {value}
                </div>
              </div>
            );
          })}
          
          {/* Show any additional metadata */}
          {Object.keys(selfAssessment).filter(key => 
            !simpleFormatCategories.includes(key) && 
            !['completedAt', 'version', 'type', 'attachmentScore', 'nonAttachmentCount'].includes(key)
          ).length > 0 && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#0c4a6e', margin: '0 0 10px 0' }}>
                📋 Additional Data
              </h4>
              {Object.entries(selfAssessment).filter(([key]) => 
                !simpleFormatCategories.includes(key) && 
                !['completedAt', 'version', 'type', 'attachmentScore', 'nonAttachmentCount'].includes(key)
              ).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '8px', fontSize: '14px' }}>
                  <strong style={{ color: '#075985' }}>{key.replace(/_/g, ' ')}: </strong>
                  <span style={{ color: '#0369a1' }}>{String(value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Handle intent-based format (existing code preserved)
    if (selfAssessment.intentBased && selfAssessment.responses) {
      console.log('✅ INTENT-BASED FORMAT: Detected intent-based assessment format');
      
      return (
        <div>
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>
              ✨ Intent-Based Assessment
            </h4>
            <p style={{ color: '#1b5e20', fontSize: '14px', margin: 0 }}>
              Completed: {new Date(selfAssessment.completedAt).toLocaleDateString()}<br/>
              Format: {selfAssessment.format} (Version {selfAssessment.version})
            </p>
            {selfAssessment.summary && (
              <div style={{ marginTop: '10px', fontSize: '13px', color: '#2e7d32' }}>
                Summary: {selfAssessment.summary.noneCount} non-attached, {selfAssessment.summary.someCount} flexible, {selfAssessment.summary.strongCount} strong preferences
              </div>
            )}
          </div>

          {Object.entries(selfAssessment.responses).map(([category, response]: [string, any]) => (
            <div key={category} style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h4 style={{ 
                color: '#495057',
                margin: '0 0 10px 0',
                textTransform: 'capitalize',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {category === 'taste' && '🍽️'}
                {category === 'smell' && '👃'}
                {category === 'sound' && '🎵'}
                {category === 'sight' && '👁️'}
                {category === 'touch' && '✋'}
                {category === 'mind' && '🧠'}
                {response.category || category}
              </h4>
              
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#6c757d' }}>Preference Level: </strong>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: response.level === 'none' ? '#e8f5e8' : 
                             response.level === 'some' ? '#fff3cd' : '#f8d7da',
                  color: response.level === 'none' ? '#2e7d32' : 
                         response.level === 'some' ? '#856404' : '#721c24'
                }}>
                  {response.level === 'none' && '✨ No particular preferences'}
                  {response.level === 'some' && '⚖️ Some preferences, flexible'}
                  {response.level === 'strong' && '🔥 Strong preferences'}
                </span>
              </div>
              
              {response.details && response.details.trim() && (
                <div>
                  <strong style={{ color: '#6c757d' }}>Details: </strong>
                  <span style={{ color: '#495057' }}>{response.details}</span>
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '8px' }}>
                Recorded: {new Date(response.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Handle legacy text-based format (existing code preserved)
    console.log('⚠️ LEGACY FORMAT: Detected legacy text-based assessment format');
    
    return (
      <div>
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>
            🔄 Text-Based Assessment (Legacy Format)
          </h4>
          <p style={{ color: '#664d03', fontSize: '14px', margin: 0 }}>
            Completed: {selfAssessment.completedAt ? new Date(selfAssessment.completedAt).toLocaleDateString() : 'Unknown'}
          </p>
        </div>

        {/* Try to display any available response data */}
        {selfAssessment.responses && Object.entries(selfAssessment.responses).map(([key, value]: [string, any]) => (
          <div key={key} style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <h4 style={{ 
              color: '#495057',
              margin: '0 0 10px 0',
              textTransform: 'capitalize'
            }}>
              {key.replace(/-/g, ' ').replace(/_/g, ' ')}
            </h4>
            <div style={{ color: '#6c757d' }}>
              {Array.isArray(value) ? (
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {value.map((item, index) => (
                    <li key={index}>{String(item)}</li>
                  ))}
                </ul>
              ) : (
                <span>{String(value)}</span>
              )}
            </div>
          </div>
        ))}

        {/* Fallback for other data structures */}
        {!selfAssessment.responses && Object.entries(selfAssessment).map(([key, value]: [string, any]) => {
          if (key === 'completedAt' || key === 'timestamp' || typeof value === 'object') return null;
          
          return (
            <div key={key} style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <h4 style={{ 
                color: '#495057',
                margin: '0 0 10px 0',
                textTransform: 'capitalize'
              }}>
                {key.replace(/-/g, ' ').replace(/_/g, ' ')}
              </h4>
              <div style={{ color: '#6c757d' }}>
                {String(value)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          color: 'white',
          margin: 0,
          fontSize: '28px',
          fontWeight: '700'
        }}>
          User Profile
        </h1>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Basic Information */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px'
          }}>
            Basic Information
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Name:</strong>
              <span style={{ color: '#6c757d' }}>{currentUser.displayName}</span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Email:</strong>
              <span style={{ color: '#6c757d' }}>{currentUser.email}</span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Experience Level:</strong>
              <span style={{ color: '#6c757d' }}>{getExperienceLevel()}</span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Current Stage:</strong>
              <span style={{ color: '#6c757d' }}>{getCurrentStageName()}</span>
            </div>
          </div>
        </div>

        {/* Practice Preferences */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px'
          }}>
            🎯 Practice Preferences
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Goals:</strong>
              <span style={{ color: '#6c757d' }}>{formatGoals(currentUser.goals || [])}</span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Practice Time:</strong>
              <span style={{ color: '#6c757d' }}>{currentUser.practiceTime || 0} minutes</span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Frequency:</strong>
              <span style={{ color: '#6c757d' }}>{currentUser.frequency || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px'
          }}>
            👤 Account Status
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Account Type:</strong>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                background: getAccountType() === 'Administrator' ? '#ffd700' : 
                           getAccountType() === 'Active Member' ? '#d4edda' : '#f8d7da',
                color: getAccountType() === 'Administrator' ? '#b8860b' : 
                       getAccountType() === 'Active Member' ? '#155724' : '#721c24',
                display: 'inline-block'
              }}>
                {getAccountType()}
              </span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Membership ID:</strong>
              <span style={{ color: '#6c757d', fontFamily: 'monospace' }}>{getMembershipId()}</span>
            </div>
            <div>
              <strong style={{ color: '#495057', display: 'block', marginBottom: '5px' }}>Member Since:</strong>
              <span style={{ color: '#6c757d' }}>{getJoinDate()}</span>
            </div>
          </div>
        </div>

        {/* Questionnaire Responses */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📋 Questionnaire Responses
            {currentUser.questionnaireCompleted && (
              <span style={{
                background: '#d4edda',
                color: '#155724',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ✅ Completed
              </span>
            )}
          </h2>
          
          {currentUser.questionnaireAnswers ? (
            <div>
              {formatQuestionnaireResponses(currentUser.questionnaireAnswers)}
            </div>
          ) : (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              No questionnaire responses found. Please complete the questionnaire.
            </div>
          )}
        </div>

        {/* Self-Assessment Responses */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #eee',
            paddingBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            🧠 Self-Assessment Responses
            {currentUser.assessmentCompleted && (
              <span style={{
                background: '#d4edda',
                color: '#155724',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ✅ Completed
              </span>
            )}
          </h2>
          
          {currentUser.selfAssessmentData ? (
            <div>
              {formatSelfAssessmentResponses(currentUser.selfAssessmentData)}
            </div>
          ) : (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              No self-assessment responses found. Please complete the self-assessment.
            </div>
          )}
        </div>

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;