import React, { useState, useEffect, useRef } from 'react';
// ✅ FIXED: Import both AuthContext for user info and OnboardingContext for data storage
import { useAuth } from './contexts/auth/AuthContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';
import './SelfAssessment.css';

interface SelfAssessmentProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface Category {
  id: string;
  title: string;
  question: string;
  description: string;
  icon: string;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onComplete, onBack }) => {
  // ✅ FIXED: Split the hooks - Auth for user info, OnboardingContext for data storage
  const { currentUser } = useAuth();
  const { markSelfAssessmentComplete } = useOnboarding();
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateTransition, setAnimateTransition] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ USER-SPECIFIC: Generate user-specific storage keys
  const getUserStorageKey = (baseKey: string): string => {
    const userId = currentUser?.uid;
    if (!userId) {
      console.warn('🚨 No user ID for self-assessment storage');
      return baseKey; // Fallback to base key
    }
    return `${baseKey}_${userId}`;
  };

  // Animation effect when changing categories
  useEffect(() => {
    if (animateTransition) {
      const timer = setTimeout(() => {
        setAnimateTransition(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animateTransition]);

  // Scroll to top when changing categories
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentCategoryIndex]);

  // ✅ ENHANCED: Load saved responses with user isolation
  useEffect(() => {
    const loadSavedResponses = () => {
      // ✅ SECURITY: Must have current user
      if (!currentUser?.uid) {
        console.warn('🚨 No current user - cannot load self-assessment progress');
        return;
      }

      try {
        // ✅ PRIORITY 1: Try user-specific localStorage
        const userResponsesKey = getUserStorageKey('tempSelfAssessmentResponses');
        const savedResponses = localStorage.getItem(userResponsesKey);
        
        if (savedResponses) {
          const parsed = JSON.parse(savedResponses);
          
          // ✅ SECURITY: Verify ownership
          if (parsed.userId && parsed.userId !== currentUser.uid) {
            console.error(`🚨 DATA LEAK PREVENTED: Self-assessment responses belong to ${parsed.userId}, not ${currentUser.uid}`);
            localStorage.removeItem(userResponsesKey); // Clean up contaminated data
            return;
          }
          
          console.log(`📦 Loading self-assessment progress for user ${currentUser.uid.substring(0, 8)}...`);
          setResponses(parsed.responses || parsed); // Handle both formats
          
          // Find the first incomplete category
          const categories = getCategories();
          const responseData = parsed.responses || parsed;
          const firstIncompleteIndex = categories.findIndex(cat => {
            return !responseData[cat.id] || !responseData[cat.id].level;
          });
          
          if (firstIncompleteIndex >= 0) {
            setCurrentCategoryIndex(firstIncompleteIndex);
          } else if (Object.keys(responseData).length === categories.length) {
            // All categories completed, go to last one
            setCurrentCategoryIndex(categories.length - 1);
          }
          return;
        }

        // ✅ FALLBACK: Check legacy global localStorage but verify ownership
        const legacyData = localStorage.getItem('tempSelfAssessmentResponses');
        if (legacyData) {
          try {
            const parsed = JSON.parse(legacyData);
            
            // Only use legacy data if it belongs to current user or has no userId
            if (parsed.userId && parsed.userId === currentUser.uid) {
              console.log(`📦 Migrating legacy self-assessment progress for user ${currentUser.uid.substring(0, 8)}...`);
              const responseData = parsed.responses || parsed;
              setResponses(responseData);
              
              // Migrate to user-specific storage
              const migratedData = {
                responses: responseData,
                userId: currentUser.uid,
                migratedAt: new Date().toISOString()
              };
              localStorage.setItem(userResponsesKey, JSON.stringify(migratedData));
              
              // Find first incomplete category
              const categories = getCategories();
              const firstIncompleteIndex = categories.findIndex(cat => {
                return !responseData[cat.id] || !responseData[cat.id].level;
              });
              
              if (firstIncompleteIndex >= 0) {
                setCurrentCategoryIndex(firstIncompleteIndex);
              } else if (Object.keys(responseData).length === categories.length) {
                setCurrentCategoryIndex(categories.length - 1);
              }
              
            } else if (!parsed.userId) {
              console.warn(`⚠️ Legacy self-assessment progress has no userId - assuming belongs to current user ${currentUser.uid.substring(0, 8)}...`);
              const responseData = parsed.responses || parsed;
              setResponses(responseData);
              
              // Save to user-specific storage
              const dataWithUser = {
                responses: responseData,
                userId: currentUser.uid,
                migratedAt: new Date().toISOString()
              };
              localStorage.setItem(userResponsesKey, JSON.stringify(dataWithUser));
            }
          } catch (parseError) {
            console.error('Error parsing legacy self-assessment progress:', parseError);
            localStorage.removeItem('tempSelfAssessmentResponses'); // Clean up corrupted data
          }
        }
        
      } catch (error) {
        console.error('Error loading self-assessment responses:', error);
      }
    };

    loadSavedResponses();
  }, [currentUser]);

  // ✅ ENHANCED: Save responses with user isolation
  useEffect(() => {
    if (Object.keys(responses).length > 0 && currentUser?.uid) {
      const userResponsesKey = getUserStorageKey('tempSelfAssessmentResponses');
      const dataToSave = {
        responses,
        userId: currentUser.uid,
        timestamp: new Date().toISOString(),
        version: '3.0_user_isolated'
      };
      
      localStorage.setItem(userResponsesKey, JSON.stringify(dataToSave));
      
      // ✅ SECURITY: Also clear any legacy global storage to prevent contamination
      localStorage.removeItem('tempSelfAssessmentResponses');
      
      console.log(`💾 Auto-saved self-assessment progress for user ${currentUser.uid.substring(0, 8)}...`);
    }
  }, [responses, currentUser]);

  const getCategories = (): Category[] => {
    return [
      {
        id: 'taste',
        title: 'Food & Taste',
        question: 'How would you describe your relationship with food and flavors?',
        description: 'Think about your eating habits, favorite foods, and how much you think about taste',
        icon: '🍽️'
      },
      {
        id: 'smell',
        title: 'Scents & Aromas',
        question: 'How do you feel about different scents and fragrances?',
        description: 'Consider perfumes, cooking smells, nature scents, and how they affect you',
        icon: '👃'
      },
      {
        id: 'sound',
        title: 'Sounds & Music',
        question: 'What\'s your relationship with sounds, music, and audio?',
        description: 'Think about music preferences, environmental sounds, and audio experiences',
        icon: '🎵'
      },
      {
        id: 'sight',
        title: 'Visual & Beauty',
        question: 'How do you respond to visual beauty, colors, and sights?',
        description: 'Consider art, nature, design, colors, and visual experiences that move you',
        icon: '👁️'
      },
      {
        id: 'touch',
        title: 'Touch & Textures',
        question: 'How do you feel about different textures and physical sensations?',
        description: 'Think about fabrics, temperatures, physical comfort, and tactile experiences',
        icon: '✋'
      },
      {
        id: 'mind',
        title: 'Thoughts & Mental Images',
        question: 'What\'s your relationship with thoughts, ideas, and mental imagery?',
        description: 'Consider daydreaming, planning, fantasizing, and mental scenarios',
        icon: '🧠'
      }
    ];
  };

  const categories = getCategories();
  const currentCategory = categories[currentCategoryIndex];

  const handleResponse = (level: string, details?: string) => {
    setResponses(prev => ({
      ...prev,
      [currentCategory.id]: {
        level,
        details: details || '',
        timestamp: new Date().toISOString(),
        category: currentCategory.title
      }
    }));
  };

  const handleNext = () => {
    const currentResponse = responses[currentCategory.id];
    if (!currentResponse || !currentResponse.level) {
      alert('Please select an option before continuing.');
      return;
    }

    if (currentCategoryIndex < categories.length - 1) {
      setAnimateTransition(true);
      setTimeout(() => {
        setCurrentCategoryIndex(prev => prev + 1);
      }, 300);
    } else {
      processAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setAnimateTransition(true);
      setTimeout(() => {
        setCurrentCategoryIndex(prev => prev - 1);
      }, 300);
    } else {
      // First category, go back
      onBack();
    }
  };

  const processAssessment = async () => {
    // ✅ SECURITY: Must have current user
    if (!currentUser?.uid) {
      console.error('🚨 No current user - cannot complete self-assessment');
      alert('Authentication error. Please sign in again.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    
    console.log(`🔄 Processing self-assessment for user ${currentUser.uid.substring(0, 8)}... with responses:`, responses);

    // Check if all categories are completed
    const incompleteCategories = categories.filter(cat => {
      const response = responses[cat.id];
      return !response || !response.level;
    });

    if (incompleteCategories.length > 0) {
      alert(`Please complete all categories. Missing: ${incompleteCategories.map(cat => cat.title).join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // Show confetti animation
    setShowConfetti(true);
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    // ===== STANDARDIZED DATA FORMAT WITH USER ID =====
    // Create standardized format that works with ALL components
    const standardizedData = {
      // ✅ SECURITY: Include user ID in all data
      userId: currentUser.uid,
      
      // Format identifier - helps with detection
      format: 'standard',
      version: '3.0_user_isolated',
      
      // Direct category values - for UserProfile and simple calculations
      taste: responses.taste?.level || 'none',
      smell: responses.smell?.level || 'none', 
      sound: responses.sound?.level || 'none',
      sight: responses.sight?.level || 'none',
      touch: responses.touch?.level || 'none',
      mind: responses.mind?.level || 'none',
      
      // ✅ FIXED: Categories object format for OnboardingContext compatibility
      categories: {
        taste: { level: responses.taste?.level || 'none', details: responses.taste?.details || '', category: 'taste' },
        smell: { level: responses.smell?.level || 'none', details: responses.smell?.details || '', category: 'smell' },
        sound: { level: responses.sound?.level || 'none', details: responses.sound?.details || '', category: 'sound' },
        sight: { level: responses.sight?.level || 'none', details: responses.sight?.details || '', category: 'sight' },
        touch: { level: responses.touch?.level || 'none', details: responses.touch?.details || '', category: 'touch' },
        mind: { level: responses.mind?.level || 'none', details: responses.mind?.details || '', category: 'mind' }
      },
      
      // Responses object - for happiness calculator
      responses: {
        taste: { level: responses.taste?.level || 'none', details: responses.taste?.details || '', category: 'taste' },
        smell: { level: responses.smell?.level || 'none', details: responses.smell?.details || '', category: 'smell' },
        sound: { level: responses.sound?.level || 'none', details: responses.sound?.details || '', category: 'sound' },
        sight: { level: responses.sight?.level || 'none', details: responses.sight?.details || '', category: 'sight' },
        touch: { level: responses.touch?.level || 'none', details: responses.touch?.details || '', category: 'touch' },
        mind: { level: responses.mind?.level || 'none', details: responses.mind?.details || '', category: 'mind' }
      },
      
      // Pre-calculated scores - for quick access
      attachmentScore: calculateAttachmentScore(responses),
      nonAttachmentCount: Object.values(responses).filter((r: any) => r.level === 'none').length,
      
      // ✅ FIXED: Add complete metrics object with total net score
      metrics: {
        attachmentScore: calculateAttachmentScore(responses),
        nonAttachmentCount: Object.values(responses).filter((r: any) => r.level === 'none').length,
        attachmentLevel: getAttachmentLevel(calculateAttachmentScore(responses)),
        totalNetScore: calculateTotalScore(responses), // ← ADD THIS LINE
        nonAttachmentBonus: Object.values(responses).filter((r: any) => r.level === 'none').length * 12
      },
      
      // Metadata
      completed: true,
      completedAt: new Date().toISOString(),
      type: 'selfAssessment'
    };
    // ===== END OF STANDARDIZED DATA FORMAT =====

    console.log(`✅ Standardized assessment data for user ${currentUser.uid.substring(0, 8)}:`, standardizedData);

    try {
      // ✅ FIXED: Use OnboardingContext method with standardized data
      console.log(`🔄 Calling OnboardingContext markSelfAssessmentComplete for user ${currentUser.uid.substring(0, 8)}...`);
      
      await markSelfAssessmentComplete(standardizedData);
      
      console.log(`✅ Self-assessment saved successfully via OnboardingContext for user ${currentUser.uid.substring(0, 8)}!`);
      
      // ✅ CLEAR: Remove user-specific temporary storage
      const userResponsesKey = getUserStorageKey('tempSelfAssessmentResponses');
      localStorage.removeItem(userResponsesKey);
      localStorage.removeItem('tempSelfAssessmentResponses'); // Also clear legacy
      
      // Call onComplete to proceed to next step
      onComplete(standardizedData);
      
    } catch (error) {
      console.error(`❌ Error saving through OnboardingContext for user ${currentUser.uid.substring(0, 8)}:`, error);
      
      // Fallback: Save directly to storage in standardized format with user ID
      console.log(`🔄 Attempting fallback save for user ${currentUser.uid.substring(0, 8)}...`);
      
      try {
        // ✅ USER-SPECIFIC: Save to user-specific profile storage
        const userProfileKey = `userProfile_${currentUser.uid}`;
        const userProfile = JSON.parse(localStorage.getItem(userProfileKey) || '{}');
        const updatedProfile = {
          ...userProfile,
          selfAssessmentData: standardizedData,
          assessmentCompleted: true,
          lastUpdated: new Date().toISOString(),
          userId: currentUser.uid // Ensure user ID is always included
        };

        // Save to user-specific storage
        localStorage.setItem(userProfileKey, JSON.stringify(updatedProfile));
        
        // ✅ LEGACY COMPATIBILITY: Also save to global userProfile but with user verification
        const globalProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedGlobalProfile = {
          ...globalProfile,
          selfAssessmentData: standardizedData,
          assessmentCompleted: true,
          lastUpdated: new Date().toISOString(),
          userId: currentUser.uid // Mark ownership
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedGlobalProfile));

        console.log(`✅ Fallback save successful for user ${currentUser.uid.substring(0, 8)}!`);
        
        // ✅ CLEAR: Remove user-specific temporary storage
        const userResponsesKey = getUserStorageKey('tempSelfAssessmentResponses');
        localStorage.removeItem(userResponsesKey);
        localStorage.removeItem('tempSelfAssessmentResponses'); // Also clear legacy
        
        onComplete(standardizedData);
        
      } catch (fallbackError) {
        console.error(`❌ Fallback save failed for user ${currentUser.uid.substring(0, 8)}:`, fallbackError);
        // Still call onComplete to not block user progress
        onComplete(standardizedData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ SECURITY: Show error if no user
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🚨</div>
        <h2 style={{ fontSize: 'clamp(20px, 5vw, 28px)', textAlign: 'center', margin: 0 }}>
          Authentication Required
        </h2>
        <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', textAlign: 'center', marginTop: '8px', opacity: 0.9 }}>
          Please sign in to access the self-assessment
        </p>
      </div>
    );
  }

  // Attachment = minus points, Non-attachment = zero points
  const calculateAttachmentScore = (responses: Record<string, any>): number => {
    let attachmentPenalty = 0;
    
    Object.values(responses).forEach((response: any) => {
      if (response.level === 'strong') {
        attachmentPenalty -= 15; // Strong attachment = -15 points
      } else if (response.level === 'some') {
        attachmentPenalty -= 7;  // Some attachment = -7 points  
      }
      // 'none' = 0 points (no penalty for non-attachment)
    });
    
    console.log('🔧 Attachment penalty calculated:', attachmentPenalty);
    return attachmentPenalty;
  };

  const calculateTotalScore = (responses: Record<string, any>): number => {
    const attachmentPenalty = calculateAttachmentScore(responses);
    const nonAttachmentCount = Object.values(responses).filter((r: any) => r.level === 'none').length;
    const nonAttachmentBonus = nonAttachmentCount * 12; // +12 per "none" response
    
    return attachmentPenalty + nonAttachmentBonus;
  };

  const getAttachmentLevel = (score: number): string => {
    if (score >= -10) return 'Very Low';
    if (score >= -30) return 'Low';
    if (score >= -50) return 'Moderate';
    if (score >= -70) return 'High';
    return 'Very High';
  };

  const getAttachmentColor = (score: number): string => {
    if (score >= -10) return '#10b981'; // Green
    if (score >= -30) return '#60a5fa'; // Blue
    if (score >= -50) return '#f59e0b'; // Yellow
    if (score >= -70) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const currentResponse = responses[currentCategory.id];
  const completedCategories = Object.keys(responses).filter(key => responses[key]?.level).length;
  const progressPercentage = (completedCategories / categories.length) * 100;
  const attachmentScore = calculateAttachmentScore(responses);
  const nonAttachmentCount = Object.values(responses).filter((r: any) => r.level === 'none').length;
  const nonAttachmentBonus = nonAttachmentCount * 12;
  const totalScore = calculateTotalScore(responses);
  const attachmentLevel = getAttachmentLevel(attachmentScore);
  const attachmentColor = getAttachmentColor(attachmentScore);

  return (
    <div className="self-assessment-container">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="assessment-header">
        <button className="back-button" onClick={handlePrevious}>
          ← {currentCategoryIndex === 0 ? 'Exit' : 'Back'}
        </button>
        <div className="progress-indicator">
          {currentCategory.icon} {currentCategoryIndex + 1} of {categories.length}
        </div>
        <div className="category-progress">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={contentRef}
        className={`assessment-content ${animateTransition ? 'fade-out' : 'fade-in'}`}
      >
        <div className="category-header">
          <div className="category-icon">{currentCategory.icon}</div>
          <h2>{currentCategory.title}</h2>
          <p className="category-question">{currentCategory.question}</p>
          <p className="category-description">{currentCategory.description}</p>
        </div>

        {/* Response Options */}
        <div className="response-options">
          
          {/* Option 1: No particular preferences = ZERO POINTS */}
          <label className={`response-option ${currentResponse?.level === 'none' ? 'selected' : ''}`}>
            <input
              type="radio"
              name={currentCategory.id}
              checked={currentResponse?.level === 'none'}
              onChange={() => handleResponse('none')}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">✨</span>
                <strong>I don't have particular preferences for this </strong>
              </div>
              <div className="option-description">
                I'm generally content with whatever comes my way in this area (No)
              </div>
            </div>
          </label>

          {/* Option 2: Some preferences = MINUS 7 POINTS */}
          <label className={`response-option ${currentResponse?.level === 'some' ? 'selected' : ''}`}>
            <input
              type="radio"
              name={currentCategory.id}
              checked={currentResponse?.level === 'some'}
              onChange={() => handleResponse('some')}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">⚖️</span>
                <strong>I have some preferences, but I'm flexible </strong>
              </div>
              <div className="option-description">
                I enjoy certain things more than others, but I adapt easily (Some)
              </div>
            </div>
          </label>

          {/* Option 3: Strong preferences = MINUS 15 POINTS */}
          <label className={`response-option ${currentResponse?.level === 'strong' ? 'selected' : ''}`}>
            <input
              type="radio"
              name={currentCategory.id}
              checked={currentResponse?.level === 'strong'}
              onChange={() => handleResponse('strong')}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">🔥</span>
                <strong>I have strong preferences and specific likes/dislikes </strong>
              </div>
              <div className="option-description">
                There are clear things I love or avoid in this area (More)
              </div>
            </div>
          </label>

          {/* Optional details field */}
          {currentResponse?.level && currentResponse.level !== 'none' && (
            <div className="details-section">
              <label className="details-label">
                Optional: Feel free to share examples (completely optional)
              </label>
              <textarea
                value={currentResponse.details || ''}
                onChange={(e) => handleResponse(currentResponse.level, e.target.value)}
                placeholder={`e.g., ${currentCategory.id === 'taste' ? "'I really enjoy spicy foods and chocolate'" : 
                            currentCategory.id === 'sound' ? "'I love classical music and nature sounds'" : 
                            currentCategory.id === 'sight' ? "'I'm drawn to sunsets and modern art'" :
                            currentCategory.id === 'smell' ? "'I love the smell of coffee and lavender'" :
                            currentCategory.id === 'touch' ? "'I enjoy soft fabrics and warm temperatures'" :
                            "'I often daydream about traveling and future plans'"}`}
                className="details-textarea"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Scoring Preview */}
        <div className="scoring-preview">
          <h4>🎯 Current Score Preview:</h4>
          <div className="score-breakdown">
            {Object.entries(responses).map(([categoryId, response]: [string, any]) => {
              if (!response?.level) return null;
              
              const points = response.level === 'none' ? 12 : 
                           response.level === 'some' ? -7 : -15;
              const color = response.level === 'none' ? '#10b981' : points === -7 ? '#f59e0b' : '#ef4444';
              
              return (
                <div key={categoryId} className="score-item">
                  <span>{categories.find(c => c.id === categoryId)?.icon}</span>
                  <span>{categories.find(c => c.id === categoryId)?.title}</span>
                  <span style={{ color, fontWeight: 'bold' }}>
                    {points >= 0 ? `+${points}` : `${points}`} points
                  </span>
                </div>
              );
            })}
            
            {Object.keys(responses).length > 0 && (
              <div className="total-score">
                <div className="score-summary">
                  <div>Attachment Penalty: {attachmentScore} points</div>
                  <div style={{ color: '#10b981' }}>Non-Attachment Bonus: +{nonAttachmentBonus} points</div>
                  <strong style={{ color: totalScore >= 0 ? '#10b981' : '#ef4444' }}>
                    Total Net Score: {totalScore >= 0 ? `+${totalScore}` : totalScore} points
                  </strong>
                </div>
                <div className="attachment-level" style={{ color: attachmentColor }}>
                  Attachment Level: {attachmentLevel}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          {currentCategoryIndex < categories.length - 1 ? (
            <button 
              onClick={handleNext}
              className={`next-button ${!currentResponse?.level ? 'disabled' : ''}`}
              disabled={!currentResponse?.level}
            >
              Next Category →
            </button>
          ) : (
            <button 
              onClick={processAssessment}
              className={`complete-button ${!currentResponse?.level || isSubmitting ? 'disabled' : ''}`}
              disabled={!currentResponse?.level || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Complete Assessment ✓'}
            </button>
          )}
        </div>

        {/* Overall Progress */}
        <div className="overall-progress">
          <h4>Progress Overview:</h4>
          <div className="categories-grid">
            {categories.map((category, index) => {
              const response = responses[category.id];
              const isCompleted = response?.level;
              const isCurrent = index === currentCategoryIndex;
              
              return (
                <div 
                  key={category.id} 
                  className={`category-item ${isCompleted ? 'completed' : 'pending'} ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    if (isCompleted || index <= completedCategories) {
                      setAnimateTransition(true);
                      setTimeout(() => {
                        setCurrentCategoryIndex(index);
                      }, 300);
                    }
                  }}
                >
                  <span className="category-icon-small">{category.icon}</span>
                  <span className="category-name">{category.title}</span>
                  <span className="category-status">
                    {isCompleted ? '✓' : '○'}
                  </span>
                  {isCompleted && (
                    <span className="response-level">
                      {response.level === 'none' ? '✨ (+12)' : 
                       response.level === 'some' ? '⚖️ (-7)' : '🔥 (-15)'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-toggle">
            <details>
              <summary>Need help understanding this assessment?</summary>
              <div className="help-content">
                <h4>About Attachment & Non-Attachment</h4>
                <p>
                  This assessment measures your level of attachment to sensory experiences and mental patterns.
                  In mindfulness practice, non-attachment (being content with whatever arises) is associated with
                  greater peace and happiness.
                </p>
                
                <h4>Scoring Explained</h4>
                <ul>
                  <li><strong>No particular preferences (+12 wisdom bonus):</strong> Non-attachment, rewarded for flexibility and contentment</li>
                  <li><strong>Some preferences (-7 points):</strong> Moderate attachment, some specific likes and dislikes</li>
                  <li><strong>Strong preferences (-15 points):</strong> Strong attachment, very specific requirements for happiness</li>
                </ul>
                
                <p>
                  Your total score reflects your overall attachment level. Higher scores indicate greater non-attachment 
                  and potentially more stable happiness. Non-attachment responses receive wisdom bonuses because they 
                  represent freedom from conditional happiness.
                </p>
                
                <p>
                  <strong>Note:</strong> This is not about suppressing preferences, but recognizing how they
                  affect your happiness. There are no "right" or "wrong" answers - just honest self-reflection.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-notice">
        Your responses are stored securely and used only to personalize your experience.
        User: {currentUser.email}
      </div>
    </div>
  );
};

export default SelfAssessment;