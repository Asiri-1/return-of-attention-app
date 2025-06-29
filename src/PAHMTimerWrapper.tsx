import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PAHMTimer from './PAHMTimer';
import { PAHMCounts } from './types/PAHMTypes';
import { useLocalData } from './contexts/LocalDataContext'; // ✨ NEW: LocalDataContext integration

// Define the interface for the component props
interface PAHMTimerWrapperProps {}

const PAHMTimerWrapper: React.FC<PAHMTimerWrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addPracticeSession, addEmotionalNote } = useLocalData(); // ✨ NEW: LocalDataContext hooks
  
  // Get data from location state
  const state = location.state as { 
    stageLevel?: string; 
    duration?: number;
    stage?: number;
    posture?: string;
  } || {};
  
  // Default values if state is not provided
  const stageLevel = state.stageLevel || 'PAHM Practice';
  const initialMinutes = state.duration || 30;
  const stage = state.stage || 2;
  const posture = state.posture || sessionStorage.getItem('currentPosture') || 'seated';
  
  // ✨ ENHANCED: Handle completion with LocalDataContext + original navigation
  const handleComplete = (pahmCounts: PAHMCounts) => {
    const endTime = new Date().toISOString();
    
    // Convert PAHM counts to storage format (underscore format for LocalDataContext)
    const convertedPAHMCounts = {
      present_attachment: pahmCounts.likes,
      present_neutral: pahmCounts.present,
      present_aversion: pahmCounts.dislikes,
      past_attachment: pahmCounts.nostalgia,
      past_neutral: pahmCounts.past,
      past_aversion: pahmCounts.regret,
      future_attachment: pahmCounts.anticipation,
      future_neutral: pahmCounts.future,
      future_aversion: pahmCounts.worry
    };

    // Calculate metrics
    const totalInteractions = Object.values(pahmCounts).reduce((sum, count) => sum + count, 0);
    const presentMomentCounts = pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes;
    const presentPercentage = totalInteractions > 0 ? Math.round((presentMomentCounts / totalInteractions) * 100) : 85;
    
    // Calculate session quality
    let sessionQuality = 7; // Base quality
    if (presentPercentage >= 80) sessionQuality += 1.5;
    else if (presentPercentage >= 60) sessionQuality += 1;
    else if (presentPercentage < 40) sessionQuality -= 1;
    
    const interactionRate = totalInteractions / (initialMinutes / 60);
    if (interactionRate > 15) sessionQuality -= 0.5;
    else if (interactionRate < 3) sessionQuality += 0.5;
    
    sessionQuality = Math.min(10, Math.max(1, Math.round(sessionQuality * 10) / 10));

    // ✨ NEW: Save to LocalDataContext for analytics
    const sessionData = {
      timestamp: endTime,
      duration: initialMinutes,
      sessionType: 'meditation' as const,
      stageLevel: stage,
      stageLabel: stageLevel,
      rating: sessionQuality,
      notes: `PAHM practice session with ${totalInteractions} attention observations. ${presentPercentage}% present-moment awareness.`,
      presentPercentage,
      environment: {
        posture: posture.toLowerCase(),
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      pahmCounts: convertedPAHMCounts
    };

    // Save session to LocalDataContext
    addPracticeSession(sessionData);

    // Calculate time and emotional distribution for detailed note
    const timeStats = {
      present: pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes,
      past: pahmCounts.past + pahmCounts.nostalgia + pahmCounts.regret,
      future: pahmCounts.future + pahmCounts.anticipation + pahmCounts.worry
    };

    const emotionalStats = {
      attachment: pahmCounts.likes + pahmCounts.nostalgia + pahmCounts.anticipation,
      neutral: pahmCounts.present + pahmCounts.past + pahmCounts.future,
      aversion: pahmCounts.dislikes + pahmCounts.regret + pahmCounts.worry
    };

    // Add comprehensive emotional note
    addEmotionalNote({
      timestamp: endTime,
      content: `✅ Completed ${initialMinutes}-minute ${stageLevel} session!

📈 Session Analytics:
• Total Observations: ${totalInteractions}
• Present Awareness: ${presentPercentage}%
• Quality Rating: ${sessionQuality}/10

⏰ Attention Distribution:
• Present: ${timeStats.present} | Past: ${timeStats.past} | Future: ${timeStats.future}

😊 Emotional Patterns:
• Attachment: ${emotionalStats.attachment} | Neutral: ${emotionalStats.neutral} | Aversion: ${emotionalStats.aversion}

📊 Detailed Matrix:
• Nostalgia(${pahmCounts.nostalgia}) Past(${pahmCounts.past}) Regret(${pahmCounts.regret})
• Likes(${pahmCounts.likes}) Present(${pahmCounts.present}) Dislikes(${pahmCounts.dislikes})
• Anticipation(${pahmCounts.anticipation}) Future(${pahmCounts.future}) Worry(${pahmCounts.worry})

🎯 This data helps track your meditation progress and attention patterns over time.`,
      emotion: 'accomplished',
      energyLevel: sessionQuality >= 8 ? 9 : sessionQuality >= 6 ? 7 : 6,
      tags: ['pahm-practice', `stage-${stage}`, posture.toLowerCase(), '9-category-matrix'],
      gratitude: [
        'mindfulness practice',
        'present-moment awareness', 
        'attention training',
        'session completion'
      ]
    });

    console.log('✅ PAHMTimerWrapper - Session saved to LocalDataContext:', {
      stageLevel: stage,
      duration: initialMinutes,
      presentPercentage,
      totalInteractions,
      sessionQuality
    });

    // ✨ OPTION 1: Navigate directly to reflection (recommended)
    navigate('/immediate-reflection-pahm-2', { 
      state: { 
        // Convert to camelCase format for reflection component
        pahmData: {
          presentAttachment: pahmCounts.likes,
          presentNeutral: pahmCounts.present,
          presentAversion: pahmCounts.dislikes,
          pastAttachment: pahmCounts.nostalgia,
          pastNeutral: pahmCounts.past,
          pastAversion: pahmCounts.regret,
          futureAttachment: pahmCounts.anticipation,
          futureNeutral: pahmCounts.future,
          futureAversion: pahmCounts.worry
        },
        duration: initialMinutes,
        posture: posture,
        stageLevel: "Stage 2",
        stageName: "PAHM Trainee"
      },
      replace: true
    });

    // ✨ OPTION 2: Keep original navigation flow (alternative)
    // navigate('/pahm-practice-complete', { 
    //   state: { 
    //     duration: initialMinutes,
    //     stage: stage,
    //     stageTitle: stageLevel.replace('PAHM Stage ', '').replace(' Practice', ''),
    //     pahmCounts,
    //     posture
    //   } 
    // });
  };
  
  return (
    <PAHMTimer 
      initialMinutes={initialMinutes}
      stageLevel={stageLevel}
      onComplete={handleComplete}
      onBack={() => navigate('/home')}
    />
  );
};

export default PAHMTimerWrapper;