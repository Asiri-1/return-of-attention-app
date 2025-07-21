import React from 'react';

interface MindRecoveryHubProps {
  onBack: () => void;
  onExerciseSelect: (exerciseId: string) => void;
  userData?: any;
}

const MindRecoveryHub: React.FC<MindRecoveryHubProps> = ({ 
  onBack, 
  onExerciseSelect,
  userData
}) => {
  
  // ✅ UPDATED: Added 5th exercise for bedtime
  const exercises = [
    {
      id: 'morning-recharge',
      title: 'Morning Recharge',
      description: 'Start your day with clarity and focus',
      duration: '5 minutes',
      icon: '🌅',
      timeOfDay: 'morning'
    },
    {
      id: 'mid-day-reset',
      title: 'Mid-Day Reset',
      description: 'Quick refresh to maintain focus',
      duration: '3 minutes',
      icon: '☀️',
      timeOfDay: 'midday'
    },
    {
      id: 'emotional-reset',
      title: 'Emotional Reset',
      description: 'Settle your emotions and find balance',
      duration: '5 minutes',
      icon: '🧘',
      timeOfDay: 'anytime'
    },
    {
      id: 'work-home-transition',
      title: 'Work-Home Transition',
      description: 'Shift from work mode to personal time',
      duration: '5 minutes',
      icon: '🏠',
      timeOfDay: 'evening'
    },
    {
      id: 'bedtime-winddown',
      title: 'Bedtime Wind Down',
      description: 'Gentle preparation for restful sleep',
      duration: '8 minutes',
      icon: '🌙',
      timeOfDay: 'bedtime'
    }
  ];

  // ✅ FIXED: Enhanced exercise selection with debugging
  const handleExerciseSelect = (exerciseId: string) => {
    console.log('🎯 MindRecoveryHub: Exercise selected:', exerciseId);
    
    // Find the exercise for additional context
    const selectedExercise = exercises.find(ex => ex.id === exerciseId);
    console.log('🎯 Selected exercise details:', selectedExercise);
    
    // Call the parent's onExerciseSelect
    try {
      onExerciseSelect(exerciseId);
    } catch (error) {
      console.error('❌ Error in onExerciseSelect:', error);
    }
  };

  // ✅ NEW: Get time-based recommendations
  const getTimeBasedRecommendation = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 10) {
      return 'morning-recharge';
    } else if (hour >= 10 && hour < 15) {
      return 'mid-day-reset';
    } else if (hour >= 15 && hour < 18) {
      return 'emotional-reset';
    } else if (hour >= 18 && hour < 21) {
      return 'work-home-transition';
    } else {
      return 'bedtime-winddown';
    }
  };

  const recommendedExercise = getTimeBasedRecommendation();

  // ✅ NEW: Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good morning! Start your day mindfully 🌅";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon! Take a moment to reset ☀️";
    } else if (hour >= 17 && hour < 21) {
      return "Good evening! Transition peacefully 🌅";
    } else {
      return "Wind down for restful sleep 🌙";
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: 'clamp(16px, 4vw, 24px)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          ← Back
        </button>
        
        <div style={{ 
          flex: 1, 
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 36px)', 
            fontWeight: '700', 
            margin: '0',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Mind Recovery
          </h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{
        padding: 'clamp(20px, 4vw, 40px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* ✅ NEW: Time-based greeting */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 28px)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ 
            fontSize: 'clamp(18px, 3vw, 22px)', 
            margin: '0 0 8px 0',
            color: 'white',
            opacity: 0.95,
            lineHeight: '1.4',
            fontWeight: '600'
          }}>
            {getTimeBasedGreeting()}
          </p>
          <p style={{ 
            fontSize: 'clamp(14px, 2.5vw, 16px)', 
            margin: '0',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.5'
          }}>
            Choose a PAHM practice to reset and recover your mind
          </p>
        </div>
        
        {/* Exercises Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {exercises.map(exercise => {
            const isRecommended = exercise.id === recommendedExercise;
            const isBedtime = exercise.id === 'bedtime-winddown';
            
            return (
              <div
                key={exercise.id}
                onClick={() => handleExerciseSelect(exercise.id)}
                style={{
                  background: isRecommended 
                    ? 'rgba(255, 255, 255, 1)' 
                    : 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px',
                  padding: '32px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(20px)',
                  border: isRecommended 
                    ? '2px solid rgba(255, 215, 0, 0.8)' 
                    : isBedtime
                    ? '2px solid rgba(138, 43, 226, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isRecommended 
                    ? '0 15px 35px rgba(255, 215, 0, 0.2)' 
                    : isBedtime
                    ? '0 15px 35px rgba(138, 43, 226, 0.2)'
                    : '0 10px 25px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = isRecommended 
                    ? '0 20px 45px rgba(255, 215, 0, 0.25)' 
                    : isBedtime
                    ? '0 20px 45px rgba(138, 43, 226, 0.25)'
                    : '0 20px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isRecommended 
                    ? '0 15px 35px rgba(255, 215, 0, 0.2)' 
                    : isBedtime
                    ? '0 15px 35px rgba(138, 43, 226, 0.2)'
                    : '0 10px 25px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* ✅ NEW: Recommended badge */}
                {isRecommended && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    color: '#1f2937',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)'
                  }}>
                    ⭐ Recommended
                  </div>
                )}
                
                {/* ✅ NEW: Bedtime special badge */}
                {isBedtime && !isRecommended && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'linear-gradient(135deg, #8A2BE2 0%, #4B0082 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(138, 43, 226, 0.4)'
                  }}>
                    🌙 Sleep
                  </div>
                )}
                
                {/* Icon */}
                <div style={{
                  fontSize: isBedtime ? '52px' : '48px',
                  marginBottom: '20px',
                  padding: '16px',
                  background: isBedtime 
                    ? 'linear-gradient(135deg, rgba(75, 0, 130, 0.15) 0%, rgba(25, 25, 112, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  borderRadius: '20px',
                  display: 'inline-block'
                }}>
                  {exercise.icon}
                </div>
                
                {/* Title */}
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  margin: '0 0 12px 0',
                  color: '#1f2937'
                }}>
                  {exercise.title}
                </h3>
                
                {/* Description */}
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.5', 
                  margin: '0 0 16px 0',
                  color: '#6b7280'
                }}>
                  {exercise.description}
                </p>
                
                {/* Duration */}
                <div style={{
                  background: isBedtime
                    ? 'linear-gradient(135deg, rgba(75, 0, 130, 0.15) 0%, rgba(25, 25, 112, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  color: isBedtime ? '#4B0082' : '#667eea',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: isBedtime
                    ? '1px solid rgba(75, 0, 130, 0.3)'
                    : '1px solid rgba(102, 126, 234, 0.2)',
                  display: 'inline-block',
                  marginBottom: '24px'
                }}>
                  {exercise.duration}
                </div>
                
                {/* ✅ FIXED: Enhanced Start Button with better click handling */}
                <div style={{ marginTop: '24px' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent double-click issues
                      console.log('🎯 Button clicked for exercise:', exercise.id);
                      handleExerciseSelect(exercise.id);
                    }}
                    style={{
                      width: '100%',
                      background: isBedtime
                        ? 'linear-gradient(135deg, #4B0082 0%, #191970 100%)'
                        : isRecommended
                          ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: isBedtime || !isRecommended ? 'white' : '#1f2937',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '16px 24px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isBedtime
                        ? '0 8px 25px rgba(75, 0, 130, 0.3)'
                        : isRecommended
                          ? '0 8px 25px rgba(255, 215, 0, 0.3)'
                          : '0 8px 25px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isBedtime
                        ? '0 12px 30px rgba(75, 0, 130, 0.4)'
                        : isRecommended
                          ? '0 12px 30px rgba(255, 215, 0, 0.4)'
                          : '0 12px 30px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = isBedtime
                        ? '0 8px 25px rgba(75, 0, 130, 0.3)'
                        : isRecommended
                          ? '0 8px 25px rgba(255, 215, 0, 0.3)'
                          : '0 8px 25px rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    {isBedtime ? '🌙 Prepare for Sleep' : 'Start Exercise'} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ NEW: Daily Schedule Guide */}
        <div style={{
          marginTop: '48px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: 'clamp(24px, 4vw, 32px)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: 'clamp(18px, 3vw, 22px)',
            fontWeight: '600',
            margin: '0 0 20px 0'
          }}>
            💡 Daily Practice Guide
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>🌅 Morning:</strong> Start with clarity and intention
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>☀️ Midday:</strong> Quick reset to maintain focus
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>🏠 Evening:</strong> Transition from work to personal
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>🌙 Bedtime:</strong> Gentle preparation for sleep
            </div>
          </div>
        </div>

        {/* ✅ NEW: Debug Information (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '32px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            fontSize: '14px',
            fontFamily: 'monospace'
          }}>
            <h4>🐛 Debug Info (Development Only)</h4>
            <p>Current time: {new Date().getHours()}:00</p>
            <p>Recommended exercise: {recommendedExercise}</p>
            <p>Available exercises: {exercises.map(ex => ex.id).join(', ')}</p>
            <p>Bedtime exercise ID: bedtime-winddown</p>
          </div>
        )}
      </main>

      {/* CSS for Mobile */}
      <style>{`
        @media (max-width: 768px) {
          .exercises-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MindRecoveryHub;