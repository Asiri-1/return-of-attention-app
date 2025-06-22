import React from 'react';
import { useLocalData } from './contexts/LocalDataContext';
import PAHMReflectionShared from './PAHMReflectionShared';

interface PAHMReflection2Props {
  onComplete: () => void;
  onBack: () => void;
}

const PAHMReflection2: React.FC<PAHMReflection2Props> = ({
  onComplete,
  onBack
}) => {
  const { userData } = useLocalData();

  // 🔍 DEBUG: Log component load
  console.log('🔍 PAHMReflection2 - Component loaded');
  console.log('🔍 PAHMReflection2 - userData:', userData);

  // Get the most recent Stage 2 session from practice sessions
  const stage2Sessions = userData?.practiceSessions?.filter(session => session.stageLevel === 2) || [];
  const mostRecentSession = stage2Sessions.length > 0 
    ? stage2Sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : null;

  // 🔍 DEBUG: Log session data
  console.log('🔍 PAHMReflection2 - Stage 2 sessions found:', stage2Sessions.length);
  console.log('🔍 PAHMReflection2 - Most recent session:', mostRecentSession);

  // Fallback if no recent session found - use sessionStorage as backup
  let pahmTrackingData;
  let practiceDuration = 0;
  let posture = 'Not recorded';

  if (mostRecentSession) {
    // Use data from LocalDataContext
    const pahmCounts = mostRecentSession.pahmCounts || {
      present_attachment: 0,
      present_neutral: 0,
      present_aversion: 0,
      past_attachment: 0,
      past_neutral: 0,
      past_aversion: 0,
      future_attachment: 0,
      future_neutral: 0,
      future_aversion: 0
    };

    // 🔍 DEBUG: Log PAHM counts from session
    console.log('🔍 PAHMReflection2 - Raw PAHM counts from LocalDataContext (underscore format):', pahmCounts);

    // 🎯 FIXED: Correct conversion from underscore to camelCase format
    pahmTrackingData = {
      // Present
      presentAttachment: Number(pahmCounts.present_attachment) || 0,
      presentNeutral: Number(pahmCounts.present_neutral) || 0,
      presentAversion: Number(pahmCounts.present_aversion) || 0,
      
      // Past
      pastAttachment: Number(pahmCounts.past_attachment) || 0,
      pastNeutral: Number(pahmCounts.past_neutral) || 0,
      pastAversion: Number(pahmCounts.past_aversion) || 0,
      
      // Future
      futureAttachment: Number(pahmCounts.future_attachment) || 0,
      futureNeutral: Number(pahmCounts.future_neutral) || 0,
      futureAversion: Number(pahmCounts.future_aversion) || 0
    };

    practiceDuration = mostRecentSession.duration || 0;
    posture = mostRecentSession.environment?.posture || 'seated';

    console.log('🔍 PAHMReflection2 - Using LocalDataContext data');
    console.log('🔍 PAHMReflection2 - Converted PAHM data (camelCase):', pahmTrackingData);
    console.log('🔍 PAHMReflection2 - Conversion validation:', {
      underscore_future_attachment: pahmCounts.future_attachment,
      camelCase_futureAttachment: pahmTrackingData.futureAttachment,
      conversionWorking: pahmCounts.future_attachment === pahmTrackingData.futureAttachment
    });
    console.log('🔍 PAHMReflection2 - Duration:', practiceDuration, 'Posture:', posture);

  } else {
    // Fallback to sessionStorage (for backward compatibility)
    console.warn('🚨 PAHMReflection2 - No Stage 2 session found in LocalDataContext, falling back to sessionStorage');
    
    const rawPahmData = JSON.parse(sessionStorage.getItem('pahmTracking') || '{}');
    
    // 🔍 DEBUG: Log sessionStorage fallback data
    console.log('🔍 PAHMReflection2 - SessionStorage fallback data:', rawPahmData);

    pahmTrackingData = {
      // Present
      presentAttachment: rawPahmData.likes || 0,
      presentNeutral: rawPahmData.present || 0,
      presentAversion: rawPahmData.dislikes || 0,
      
      // Past
      pastAttachment: rawPahmData.nostalgia || 0,
      pastNeutral: rawPahmData.past || 0,
      pastAversion: rawPahmData.regret || 0,
      
      // Future
      futureAttachment: rawPahmData.anticipation || 0,
      futureNeutral: rawPahmData.future || 0,
      futureAversion: rawPahmData.worry || 0
    };

    // Get practice duration from sessionStorage
    const startTime = new Date(sessionStorage.getItem('practiceStartTime') || new Date().toISOString());
    const endTime = new Date(sessionStorage.getItem('practiceEndTime') || new Date().toISOString());
    practiceDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    posture = sessionStorage.getItem('currentPosture') || 'seated';

    console.log('🔍 PAHMReflection2 - Using sessionStorage fallback');
    console.log('🔍 PAHMReflection2 - Fallback PAHM data:', pahmTrackingData);
    console.log('🔍 PAHMReflection2 - Fallback duration:', practiceDuration, 'Posture:', posture);
  }

  // Calculate total for validation
  const totalPahmCount = Object.values(pahmTrackingData).reduce((sum, count) => sum + count, 0);
  console.log('🔍 PAHMReflection2 - Total PAHM interactions:', totalPahmCount);

  // Handle completion
  const handleComplete = () => {
    console.log('🔍 PAHMReflection2 - Reflection completed');
    
    // Update stage progress in sessionStorage for backward compatibility
    sessionStorage.setItem('stageProgress', '2');
    
    // Call the parent completion handler
    onComplete();
  };

  // 🚨 Show warning if no data found
  if (totalPahmCount === 0 && !mostRecentSession) {
    console.warn('🚨 PAHMReflection2 - No PAHM data found in either LocalDataContext or sessionStorage');
  }

  return (
    <PAHMReflectionShared
      stageLevel="Stage 2"
      stageName="PAHM Trainee"
      duration={practiceDuration}
      posture={posture}
      pahmData={pahmTrackingData}
      onComplete={handleComplete}
      onBack={onBack}
    />
  );
};

export default PAHMReflection2;