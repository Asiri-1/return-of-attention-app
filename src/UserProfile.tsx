import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack, onLogout }) => {
  const { currentUser, userProfile } = useAuth();
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

  // ✅ FIXED: Get proper happiness points from localStorage (where HappinessProgressTracker saves them)
  const getHappinessPoints = () => {
    try {
      // Read from localStorage where HappinessProgressTracker saves the calculated results
      const savedPoints = localStorage.getItem('happiness_points');
      if (savedPoints) {
        const points = parseInt(savedPoints, 10);
        if (!isNaN(points)) {
          console.log('✅ UserProfile: Using happiness points from localStorage:', points);
          return points;
        }
      }
      
      // Fallback to userProfile if available
      if (userProfile?.happinessPoints) {
        console.log('⚠️ UserProfile: Using fallback happiness points from userProfile:', userProfile.happinessPoints);
        return userProfile.happinessPoints;
      }
      
      // Default for new users
      console.log('⚠️ UserProfile: Using default happiness points for new user');
      return 50;
    } catch (error) {
      console.error('❌ Error getting happiness points:', error);
      return 50;
    }
  };

  // Get proper experience level based on app's progression system
  const getExperienceLevel = () => {
    if (!currentUser) return 'Seeker';
    
    // Check enhanced profile first
    if (userProfile?.experienceLevel) {
      return userProfile.experienceLevel;
    }
    
    // Check current stage to determine level
    const stage = parseInt(userProfile?.currentStage || '1') || 1;
    if (stage === 1) return 'Seeker';
    if (stage === 2) return 'PAHM Trainee';
    if (stage === 3) return 'PAHM Beginner';
    if (stage === 4) return 'PAHM Practitioner';
    if (stage === 5) return 'PAHM Master';
    if (stage === 6) return 'PAHM Illuminator';
    
    // Fallback to stored experience level
    return 'Seeker';
  };

  // Get proper join date from Firebase user creation
  const getJoinDate = () => {
    if (!userProfile) return new Date().toLocaleDateString();
    
    if (userProfile.memberSince) {
      return new Date(userProfile.memberSince).toLocaleDateString();
    }
    
    // Last resort: use a reasonable default
    return new Date().toLocaleDateString();
  };

  // Generate membership ID from UID
  const getMembershipId = () => {
    if (!userProfile) return 'SP-UNKNOWN';
    
    if (userProfile.membershipId) {
      return userProfile.membershipId;
    }
    
    if (currentUser?.uid) {
      // Create a readable membership ID from UID
      const shortUid = currentUser.uid.substring(0, 8).toUpperCase();
      return `SP-${shortUid}`;
    }
    
    return 'SP-UNKNOWN';
  };

  // Get account type based on proper completion checking
  const getAccountType = () => {
    if (!userProfile) return 'New Member';
    
    if (userProfile.membershipType) {
      return userProfile.membershipType === 'admin' ? 'Administrator' : 
             userProfile.membershipType === 'premium' ? 'Premium Member' : 'Free Member';
    }
    
    const isAdmin = currentUser?.email === 'asiriamarasinghe35@gmail.com';
    if (isAdmin) return 'Administrator';
    
    // Check if onboarding is completed
    const hasCompletedOnboarding = userProfile.questionnaire?.completed && userProfile.selfAssessment?.completed;
    if (hasCompletedOnboarding) return 'Active Member';
    
    return 'New Member';
  };

  // Get current stage name
  const getCurrentStageName = () => {
    if (!userProfile) return 'Stage 1';
    
    const stage = parseInt(userProfile.currentStage || '1') || 1;
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

  // Format goals function
  const formatGoals = (goals: string[]) => {
    if (!goals || goals.length === 0) return 'None specified';
    return goals.map(goal => goal.replace('-', ' ')).join(', ');
  };

  // Format questionnaire responses for display - HANDLES CORRECT DATA STRUCTURE
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
      
      // FILTER OUT empty/null values
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

  // Format self-assessment responses for display - HANDLES ALL FORMATS
  const formatSelfAssessmentResponses = (selfAssessment: any) => {
    if (!selfAssessment) {
      console.log('⚠️ No self-assessment data found');
      return null;
    }

    console.log('🔍 DEBUG: Self-assessment data received:', selfAssessment);

    // Define all possible categories
    const allCategories = ['taste', 'smell', 'touch', 'sight', 'sound', 'thought', 'emotion', 'bodyAwareness'];
    
    // Check which format we're dealing with
    const hasDirectProperties = allCategories.some(cat => selfAssessment[cat] !== undefined);
    const hasResponsesObject = selfAssessment.responses && Object.keys(selfAssessment.responses).length > 0;
    const hasStandardFormat = selfAssessment.format === 'standard';
    
    console.log(`Format detection: Direct properties: ${hasDirectProperties}, Responses object: ${hasResponsesObject}, Standard format: ${hasStandardFormat}`);
    
    // Prepare data for display based on available format
    const displayData: Record<string, any> = {};
    
    // Category display information
    const categoryInfo: Record<string, { icon: string, title: string }> = {
      taste: { icon: '🍽️', title: 'Food & Taste' },
      smell: { icon: '👃', title: 'Scents & Aromas' },
      sound: { icon: '🎵', title: 'Sounds & Music' },
      sight: { icon: '👁️', title: 'Visual & Beauty' },
      touch: { icon: '✋', title: 'Touch & Textures' },
      thought: { icon: '🧠', title: 'Thoughts & Ideas' },
      emotion: { icon: '❤️', title: 'Emotions & Feelings' },
      bodyAwareness: { icon: '🧘', title: 'Body Awareness' }
    };
    
    // Process each category
    allCategories.forEach(category => {
      let level = 'none';
      let details = '';
      
      // Try to get data from different possible formats
      if (hasDirectProperties && selfAssessment[category] !== undefined) {
        level = selfAssessment[category];
        details = selfAssessment[`${category}Details`] || '';
      } 
      else if (hasResponsesObject && selfAssessment.responses[category]) {
        const response = selfAssessment.responses[category];
        if (typeof response === 'object') {
          level = response.level || 'none';
          details = response.details || '';
        } else {
          level = response || 'none';
        }
      }
      
      // Only add categories that have data
      if (level !== undefined) {
        displayData[category] = { level, details };
      }
    });
    
    // Calculate attachment metrics if not already provided
    const attachmentScore = selfAssessment.attachmentScore !== undefined ? 
      selfAssessment.attachmentScore : 
      calculateAttachmentScore(displayData);
      
    const nonAttachmentCount = selfAssessment.nonAttachmentCount !== undefined ?
      selfAssessment.nonAttachmentCount :
      Object.values(displayData).filter((item: any) => item.level === 'none').length;
    
    const totalCategories = Object.keys(displayData).length;
    const nonAttachmentPercentage = totalCategories > 0 ? 
      Math.round((nonAttachmentCount / totalCategories) * 100) : 0;
    
    // Helper function to calculate attachment score
    function calculateAttachmentScore(data: Record<string, any>): number {
      let attachmentCount = 0;
      let totalCategories = Object.keys(data).length;
      
      Object.values(data).forEach((item: any) => {
        if (item.level === 'high' || item.level === 'strong' || item.level === 'attached') {
          attachmentCount++;
        }
      });
      
      return totalCategories > 0 ? Math.round((attachmentCount / totalCategories) * 100) : 0;
    }
    
    // Helper function to get level display text
    function getLevelDisplayText(level: string): string {
      switch(level) {
        case 'none': return '✨ No particular preferences';
        case 'some': return '⚖️ Some preferences, flexible';
        case 'low': return '⚖️ Some preferences, flexible';
        case 'high': return '🔥 Strong preferences';
        case 'strong': return '🔥 Strong preferences';
        case 'attached': return '🔥 Strong preferences';
        case 'averse': return '⚠️ Strong aversion';
        case 'neutral': return '✨ Neutral awareness';
        default: return level;
      }
    }
    
    // Helper function to get level color
    function getLevelColor(level: string): { bg: string, text: string } {
      switch(level) {
        case 'none':
        case 'neutral':
          return { bg: '#e8f5e8', text: '#2e7d32' };
        case 'some':
        case 'low':
          return { bg: '#fff3cd', text: '#856404' };
        case 'high':
        case 'strong':
        case 'attached':
          return { bg: '#f8d7da', text: '#721c24' };
        case 'averse':
          return { bg: '#cce5ff', text: '#004085' };
        default:
          return { bg: '#f8f9fa', text: '#495057' };
      }
    }
    
    // Helper function to get points for a level
    function getPointsForLevel(level: string): number {
      switch(level) {
        case 'none':
        case 'neutral':
          return 0;
        case 'some':
        case 'low':
          return -7;
        case 'high':
        case 'strong':
        case 'attached':
          return -15;
        case 'averse':
          return -10;
        default:
          return 0;
      }
    }

    return (
      <div>
        {/* Header with summary information */}
        <div style={{
          background: '#e8f5e8',
          border: '1px solid #4caf50',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>
            ✨ Self-Assessment Summary
          </h4>
          <p style={{ color: '#1b5e20', fontSize: '14px', margin: 0 }}>
            Completed: {selfAssessment.lastUpdated ? new Date(selfAssessment.lastUpdated).toLocaleDateString() : 'Recently'}<br/>
            Format: {selfAssessment.format || 'Standard'} | Version: {selfAssessment.version || '1.0'}
          </p>
          
          {/* Show attachment scoring */}
          <div style={{ 
            marginTop: '10px', 
            padding: '10px',
            background: '#ffffff',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong style={{ color: '#2e7d32' }}>📊 Scoring Summary:</strong>
            <div style={{ marginTop: '5px', color: '#1b5e20' }}>
              • Attachment Score: <strong>{attachmentScore}%</strong><br/>
              • Non-attachment Count: <strong>{nonAttachmentCount}/{totalCategories} categories</strong><br/>
              • Non-attachment Percentage: <strong>{nonAttachmentPercentage}%</strong>
            </div>
          </div>
        </div>

        {/* Display each category */}
        {Object.entries(displayData).map(([category, data]: [string, any]) => {
          const info = categoryInfo[category] || { icon: '📋', title: category };
          const level = data.level;
          const details = data.details;
          const points = getPointsForLevel(level);
          const colors = getLevelColor(level);
          
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
                  background: colors.bg,
                  color: colors.text
                }}>
                  {getLevelDisplayText(level)}
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
              
              {/* Show details if available */}
              {details && (
                <div style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  marginTop: '10px',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                }}>
                  <strong>Details:</strong> {details}
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#adb5bd', marginTop: '10px' }}>
                Category: {category} | Value: {level}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <button 
        onClick={onBack}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: '#333',
          border: '2px solid #333',
          borderRadius: '25px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Back
      </button>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0 }}>User Profile</h1>
        <button 
          onClick={handleLogout}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      {/* Account Status */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: '#8a2be2',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>👤</span>
          Account Status
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>Account Type:</div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              {getAccountType()}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>Membership ID:</div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              {getMembershipId()}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>Member Since:</div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '8px 12px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              {getJoinDate()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Questionnaire Responses */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#333'
        }}>
          <span style={{
            background: '#f0f0f0',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>📋</span>
          Questionnaire Responses
        </h2>
        
        {userProfile?.questionnaire?.completed ? (
          formatQuestionnaireResponses(userProfile.questionnaire.responses)
        ) : (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            No questionnaire responses found. Please complete the questionnaire.
          </div>
        )}
      </div>
      
      {/* Self-Assessment Responses */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#333'
        }}>
          <span style={{
            background: '#f0f0f0',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}>🧠</span>
          Self-Assessment Responses
        </h2>
        
        {userProfile?.selfAssessment?.completed ? (
          formatSelfAssessmentResponses(userProfile.selfAssessment)
        ) : (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            No self-assessment responses found. Please complete the self-assessment.
          </div>
        )}
      </div>
      
      {/* Practice Stats */}
      {userProfile?.practiceStats && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#333'
          }}>
            <span style={{
              background: '#f0f0f0',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>📊</span>
            Practice Statistics
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <div style={{
              background: '#e8f5e8',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '5px' }}>Total Sessions</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1b5e20' }}>
                {userProfile.practiceStats.totalSessions || 0}
              </div>
            </div>
            
            <div style={{
              background: '#e3f2fd',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#0d47a1', marginBottom: '5px' }}>Total Minutes</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0d47a1' }}>
                {userProfile.practiceStats.totalMinutes || 0}
              </div>
            </div>
            
            <div style={{
              background: '#fff3cd',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#856404', marginBottom: '5px' }}>Current Streak</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
                {userProfile.practiceStats.streakDays || 0} days
              </div>
            </div>
            
            <div style={{
              background: '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#721c24', marginBottom: '5px' }}>Longest Streak</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
                {userProfile.practiceStats.longestStreak || 0} days
              </div>
            </div>
          </div>
          
          {userProfile.practiceStats.lastSessionDate && (
            <div style={{
              marginTop: '15px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              Last session: {new Date(userProfile.practiceStats.lastSessionDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      
      {/* ✅ FIXED: Happiness Points - Now reads from localStorage */}
      <div style={{
        background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
        color: '#721c24',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Happiness Points</h2>
        <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
          {getHappinessPoints()}
        </div>
        <div style={{ fontSize: '14px', marginTop: '10px' }}>
          Earn points by completing practices and reducing attachments
        </div>
      </div>
      
      {/* Achievements */}
      {userProfile?.achievements && userProfile.achievements.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#333'
          }}>
            <span style={{
              background: '#f0f0f0',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>🏆</span>
            Achievements
          </h2>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {userProfile.achievements.map((achievement, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '20px',
                padding: '8px 15px',
                fontSize: '14px',
                color: '#495057'
              }}>
                {achievement.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;