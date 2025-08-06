// ✅ Firebase-Only SelfAssessment.tsx - Using OnboardingContext (CORRECTED)
// File: src/SelfAssessment.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  // ✅ FIREBASE-ONLY: Get current user and Firebase data
  const { currentUser } = useAuth();
  const { 
    markSelfAssessmentComplete,
    saveSelfAssessmentProgress,
    selfAssessment,
    isSelfAssessmentCompleted,
    isLoading: onboardingLoading
  } = useOnboarding();
  
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateTransition, setAnimateTransition] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ FIREBASE-ONLY: Load progress from OnboardingContext
  useEffect(() => {
    const loadProgress = async () => {
      if (!currentUser?.uid) {
        console.warn('🚨 No current user - cannot load self-assessment progress');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // ✅ Check if self-assessment is already completed
        if (isSelfAssessmentCompleted()) {
          console.log(`📋 Self-assessment already completed for user ${currentUser.uid.substring(0, 8)}...`);
          if (selfAssessment?.responses) {
            setResponses(selfAssessment.responses);
            setCurrentCategoryIndex(getCategories().length - 1); // Go to end
          }
          setIsLoading(false);
          return;
        }

        // ✅ Load from OnboardingContext (Firebase)
        if (selfAssessment?.responses) {
          console.log(`📦 Loading self-assessment progress from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
          setResponses(selfAssessment.responses);
          
          // Find the first incomplete category
          const categories = getCategories();
          const firstIncompleteIndex = categories.findIndex(cat => {
            const response = (selfAssessment.responses as any)?.[cat.id];
            return !response || !response.level;
          });
          
          if (firstIncompleteIndex >= 0) {
            setCurrentCategoryIndex(firstIncompleteIndex);
          } else {
            // All completed, go to last one
            setCurrentCategoryIndex(categories.length - 1);
          }
          setIsLoading(false);
          return;
        }
        
        // No saved progress found
        console.log(`🆕 Starting fresh self-assessment for user ${currentUser.uid.substring(0, 8)}...`);
        setResponses({});
        setCurrentCategoryIndex(0);
        
      } catch (error) {
        console.error('Error loading self-assessment progress:', error);
        setResponses({});
        setCurrentCategoryIndex(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (!onboardingLoading) {
      loadProgress();
    }
  }, [selfAssessment, isSelfAssessmentCompleted, currentUser, onboardingLoading]);

  // ✅ FIREBASE-ONLY: Auto-save progress to Firebase
  useEffect(() => {
    const saveProgress = async () => {
      if (isLoading || isSubmitting || !currentUser?.uid || onboardingLoading) return;
      if (Object.keys(responses).length === 0) return; // Don't save empty responses
      
      try {
        if (saveSelfAssessmentProgress) {
          await saveSelfAssessmentProgress(responses);
        }
        
        console.log(`💾 Auto-saved self-assessment progress to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      } catch (error) {
        console.warn('Failed to auto-save self-assessment progress to Firebase:', error);
      }
    };

    // Debounce auto-save to avoid too frequent saves
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [responses, currentCategoryIndex, isLoading, isSubmitting, saveSelfAssessmentProgress, currentUser, onboardingLoading]);

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
    const standardizedData = {
      userId: currentUser.uid,
      format: 'standard',
      version: '3.0_firebase_onboarding',
      
      // Direct category values
      taste: responses.taste?.level || 'none',
      smell: responses.smell?.level || 'none', 
      sound: responses.sound?.level || 'none',
      sight: responses.sight?.level || 'none',
      touch: responses.touch?.level || 'none',
      mind: responses.mind?.level || 'none',
      
      // Categories object format
      categories: {
        taste: { level: responses.taste?.level || 'none', details: responses.taste?.details || '', category: 'taste' },
        smell: { level: responses.smell?.level || 'none', details: responses.smell?.details || '', category: 'smell' },
        sound: { level: responses.sound?.level || 'none', details: responses.sound?.details || '', category: 'sound' },
        sight: { level: responses.sight?.level || 'none', details: responses.sight?.details || '', category: 'sight' },
        touch: { level: responses.touch?.level || 'none', details: responses.touch?.details || '', category: 'touch' },
        mind: { level: responses.mind?.level || 'none', details: responses.mind?.details || '', category: 'mind' }
      } as any,
      
      // Responses object - for happiness calculator
      responses: {
        taste: { level: responses.taste?.level || 'none', details: responses.taste?.details || '', category: 'taste' },
        smell: { level: responses.smell?.level || 'none', details: responses.smell?.details || '', category: 'smell' },
        sound: { level: responses.sound?.level || 'none', details: responses.sound?.details || '', category: 'sound' },
        sight: { level: responses.sight?.level || 'none', details: responses.sight?.details || '', category: 'sight' },
        touch: { level: responses.touch?.level || 'none', details: responses.touch?.details || '', category: 'touch' },
        mind: { level: responses.mind?.level || 'none', details: responses.mind?.details || '', category: 'mind' }
      } as any,
      
      // Pre-calculated scores
      attachmentScore: calculateAttachmentScore(responses),
      nonAttachmentCount: Object.values(responses).filter((r: any) => r.level === 'none').length,
      
      // Complete metrics object
      metrics: {
        attachmentScore: calculateAttachmentScore(responses),
        nonAttachmentCount: Object.values(responses).filter((r: any) => r.level === 'none').length,
        attachmentLevel: getAttachmentLevel(calculateAttachmentScore(responses)),
        totalNetScore: calculateTotalScore(responses),
        nonAttachmentBonus: Object.values(responses).filter((r: any) => r.level === 'none').length * 12
      },
      
      // Metadata
      completed: true,
      completedAt: new Date().toISOString(),
      type: 'selfAssessment'
    };

    console.log(`✅ Standardized assessment data for user ${currentUser.uid.substring(0, 8)}:`, standardizedData);

    try {
      console.log(`🔄 Saving to Firebase via OnboardingContext for user ${currentUser.uid.substring(0, 8)}...`);
      
      // ✅ Save to Firebase using OnboardingContext
      if (markSelfAssessmentComplete) {
        await markSelfAssessmentComplete(standardizedData);
        console.log(`✅ Self-assessment saved successfully to Firebase for user ${currentUser.uid.substring(0, 8)}!`);
      }
      
      // Call onComplete to proceed to next step
      onComplete(standardizedData);
      
    } catch (error) {
      console.error(`❌ Error saving to Firebase for user ${currentUser.uid.substring(0, 8)}:`, error);
      alert('Failed to save self-assessment to Firebase. Please try again.');
      setIsSubmitting(false);
      return;
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

  if (isLoading || onboardingLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '24px'
        }}></div>
        <h2 style={{ fontSize: 'clamp(20px, 5vw, 28px)', textAlign: 'center', margin: 0 }}>
          Loading from Firebase...
        </h2>
        <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', textAlign: 'center', marginTop: '8px', opacity: 0.8 }}>
          Syncing your self-assessment progress
        </p>
        <p style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', textAlign: 'center', marginTop: '4px', opacity: 0.6 }}>
          User: {currentUser.email}
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
              {isSubmitting ? 'Saving to Firebase...' : 'Complete Assessment ✓'}
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
        🔥 Firebase-Only | User: {currentUser.email}
      </div>
    </div>
  );
};

export default SelfAssessment;