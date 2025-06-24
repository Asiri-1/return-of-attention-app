import React, { useEffect, useState } from 'react';
import { useLocalData } from './contexts/LocalDataContext';
import { useLocation } from 'react-router-dom';
import PAHMReflectionShared from './PAHMReflectionShared';

interface PAHMReflection2Props {
  onComplete: () => void;
  onBack: () => void;
}

// 🔒 ORIGINAL INTERFACE - UNCHANGED
interface PAHMReflectionData {
  presentAttachment: number;
  presentNeutral: number;
  presentAversion: number;
  pastAttachment: number;
  pastNeutral: number;
  pastAversion: number;
  futureAttachment: number;
  futureNeutral: number;
  futureAversion: number;
}

const PAHMReflection2: React.FC<PAHMReflection2Props> = ({
  onComplete,
  onBack
}) => {
  // 🔒 ORIGINAL STATE - UNCHANGED
  const { userData, refreshTrigger } = useLocalData();
  const location = useLocation();
  const [pahmData, setPahmData] = useState<PAHMReflectionData | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [posture, setPosture] = useState<string>('seated');

  // 🔥 ONLY CHANGE: Enhanced data loading with better format conversion
  useEffect(() => {
    console.log('🔍 PAHMReflection2 - Loading data...');

    // Priority 1: Navigation state
    if (location.state && (location.state as any).pahmData) {
      const state = location.state as any;
      setPahmData(state.pahmData);
      setDuration(state.duration || 30);
      setPosture(state.posture || 'seated');
      console.log('✅ Using navigation state data');
      return;
    }

    // Priority 2: Most recent Stage 2 session with better conversion
    if (userData?.practiceSessions) {
      const stage2Sessions = userData.practiceSessions.filter(session => session.stageLevel === 2);
      
      if (stage2Sessions.length > 0) {
        const mostRecentSession = stage2Sessions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        if (mostRecentSession.pahmCounts) {
          const pahmCounts = mostRecentSession.pahmCounts;
          
          // 🔥 ONLY CHANGE: Better format conversion
          const convertedData: PAHMReflectionData = {
            presentAttachment: Number(pahmCounts.present_attachment) || 0,
            presentNeutral: Number(pahmCounts.present_neutral) || 0,
            presentAversion: Number(pahmCounts.present_aversion) || 0,
            pastAttachment: Number(pahmCounts.past_attachment) || 0,
            pastNeutral: Number(pahmCounts.past_neutral) || 0,
            pastAversion: Number(pahmCounts.past_aversion) || 0,
            futureAttachment: Number(pahmCounts.future_attachment) || 0,
            futureNeutral: Number(pahmCounts.future_neutral) || 0,
            futureAversion: Number(pahmCounts.future_aversion) || 0
          };

          setPahmData(convertedData);
          setDuration(mostRecentSession.duration || 30);
          setPosture(mostRecentSession.environment?.posture || 'seated');
          console.log('✅ Using LocalDataContext session data');
          return;
        }
      }
    }

    // Priority 3: PAHMTraineePracticeRecorder fallback
    try {
      const lastPAHMSession = JSON.parse(sessionStorage.getItem('lastPAHMSession') || '{}');
      if (lastPAHMSession.pahmCounts) {
        // Convert any format to reflection format
        const pahmCounts = lastPAHMSession.pahmCounts;
        const convertedData: PAHMReflectionData = {
          presentAttachment: Number(pahmCounts.presentAttachment || pahmCounts.present_attachment || pahmCounts.likes) || 0,
          presentNeutral: Number(pahmCounts.presentNeutral || pahmCounts.present_neutral || pahmCounts.present) || 0,
          presentAversion: Number(pahmCounts.presentAversion || pahmCounts.present_aversion || pahmCounts.dislikes) || 0,
          pastAttachment: Number(pahmCounts.pastAttachment || pahmCounts.past_attachment || pahmCounts.nostalgia) || 0,
          pastNeutral: Number(pahmCounts.pastNeutral || pahmCounts.past_neutral || pahmCounts.past) || 0,
          pastAversion: Number(pahmCounts.pastAversion || pahmCounts.past_aversion || pahmCounts.regret) || 0,
          futureAttachment: Number(pahmCounts.futureAttachment || pahmCounts.future_attachment || pahmCounts.anticipation) || 0,
          futureNeutral: Number(pahmCounts.futureNeutral || pahmCounts.future_neutral || pahmCounts.future) || 0,
          futureAversion: Number(pahmCounts.futureAversion || pahmCounts.future_aversion || pahmCounts.worry) || 0
        };

        setPahmData(convertedData);
        setDuration(lastPAHMSession.targetDuration || 30);
        setPosture(sessionStorage.getItem('currentPosture') || 'seated');
        console.log('✅ Using lastPAHMSession data');
        return;
      }
    } catch (error) {
      console.error('Error parsing lastPAHMSession:', error);
    }

    // Priority 4: SessionStorage fallback
    try {
      const rawPahmData = JSON.parse(sessionStorage.getItem('pahmTracking') || '{}');
      
      if (Object.keys(rawPahmData).length > 0) {
        const fallbackData: PAHMReflectionData = {
          presentAttachment: rawPahmData.likes || 0,
          presentNeutral: rawPahmData.present || 0,
          presentAversion: rawPahmData.dislikes || 0,
          pastAttachment: rawPahmData.nostalgia || 0,
          pastNeutral: rawPahmData.past || 0,
          pastAversion: rawPahmData.regret || 0,
          futureAttachment: rawPahmData.anticipation || 0,
          futureNeutral: rawPahmData.future || 0,
          futureAversion: rawPahmData.worry || 0
        };

        setPahmData(fallbackData);
        setDuration(30);
        setPosture(sessionStorage.getItem('currentPosture') || 'seated');
        console.log('✅ Using sessionStorage fallback');
        return;
      }
    } catch (error) {
      console.error('Error parsing sessionStorage:', error);
    }

    // Priority 5: Empty structure
    console.warn('🚨 No PAHM data found, using empty structure');
    const emptyData: PAHMReflectionData = {
      presentAttachment: 0,
      presentNeutral: 0,
      presentAversion: 0,
      pastAttachment: 0,
      pastNeutral: 0,
      pastAversion: 0,
      futureAttachment: 0,
      futureNeutral: 0,
      futureAversion: 0
    };
    
    setPahmData(emptyData);
    setDuration(30);
    setPosture('seated');

  }, [userData, refreshTrigger, location.state]);

  // 🔒 ORIGINAL COMPLETION HANDLER - UNCHANGED
  const handleComplete = () => {
    console.log('🔍 PAHMReflection2 - Reflection completed');
    sessionStorage.setItem('stageProgress', '2');
    onComplete();
  };

  // 🔒 ORIGINAL LOADING STATE - UNCHANGED
  if (!pahmData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧘</div>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading Reflection...</div>
          <div style={{ fontSize: '16px', opacity: 0.8 }}>Preparing your PAHM session analysis</div>
        </div>
      </div>
    );
  }

  // 🔒 ORIGINAL CALCULATION AND RENDER - UNCHANGED
  const totalPahmCount = Object.values(pahmData as PAHMReflectionData).reduce((sum: number, count: number) => sum + count, 0);
  
  console.log('🔍 PAHMReflection2 - Final PAHM data:', pahmData);
  console.log('🔍 PAHMReflection2 - Total PAHM interactions:', totalPahmCount);

  return (
    <PAHMReflectionShared
      stageLevel="Stage 2"
      stageName="PAHM Trainee"
      duration={duration}
      posture={posture}
      pahmData={pahmData}
      onComplete={handleComplete}
      onBack={onBack}
    />
  );
};

export default PAHMReflection2;