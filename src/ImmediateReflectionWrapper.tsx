// src/ImmediateReflectionWrapper.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PAHMReflectionShared from './PAHMReflectionShared';

const ImmediateReflectionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get session data from navigation state
  const navigationState = location.state as {
    stageLevel?: string;
    stageName?: string;
    duration?: number;
    posture?: string;
    pahmData?: {
      presentAttachment: number;
      presentNeutral: number;
      presentAversion: number;
      pastAttachment: number;
      pastNeutral: number;
      pastAversion: number;
      futureAttachment: number;
      futureNeutral: number;
      futureAversion: number;
    };
    sessionData?: any;
    convertedPAHMCounts?: any;
  } | null;

  // 🔍 DEBUG: Log navigation state
  console.log('🔍 ImmediateReflectionWrapper - Full Location State:', navigationState);
  console.log('🔍 ImmediateReflectionWrapper - PAHM Data Received:', navigationState?.pahmData);

  // Redirect if no session data
  if (!navigationState) {
    console.warn('🚨 No session data found, redirecting to Stage 2');
    navigate('/stage2');
    return null;
  }

  const {
    stageLevel = "Stage 2",
    stageName = "PAHM Trainee",
    duration = 0,
    posture = 'seated',
    pahmData
  } = navigationState;

  // 🔍 DEBUG: Log extracted data
  console.log('🔍 ImmediateReflectionWrapper - Extracted Data:', {
    stageLevel,
    stageName,
    duration,
    posture,
    pahmData
  });

  // 🚨 FIX: Type-safe data conversion with proper checks
  const finalPahmData = (pahmData && Object.keys(pahmData).length > 0) ? {
    presentAttachment: Number(pahmData.presentAttachment) || 0,
    presentNeutral: Number(pahmData.presentNeutral) || 0,
    presentAversion: Number(pahmData.presentAversion) || 0,
    pastAttachment: Number(pahmData.pastAttachment) || 0,
    pastNeutral: Number(pahmData.pastNeutral) || 0,
    pastAversion: Number(pahmData.pastAversion) || 0,
    futureAttachment: Number(pahmData.futureAttachment) || 0,
    futureNeutral: Number(pahmData.futureNeutral) || 0,
    futureAversion: Number(pahmData.futureAversion) || 0
  } : {
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

  // 🔍 DEBUG: Log final data with types and totals
  console.log('🔍 ImmediateReflectionWrapper - Final PAHM Data to Send:', finalPahmData);
  console.log('🔍 ImmediateReflectionWrapper - Data validation:', {
    presentAttachment: typeof finalPahmData.presentAttachment,
    futureAttachment: typeof finalPahmData.futureAttachment,
    grandTotal: Object.values(finalPahmData).reduce((sum, val) => sum + val, 0),
    allAreNumbers: Object.values(finalPahmData).every(val => typeof val === 'number' && !isNaN(val))
  });

  const handleComplete = () => {
    console.log('🔍 ImmediateReflectionWrapper - Reflection completed, navigating to home');
    navigate('/home');
  };

  const handleBack = () => {
    console.log('🔍 ImmediateReflectionWrapper - Going back to stage 2');
    navigate('/stage2');
  };

  return (
    <PAHMReflectionShared
      stageLevel={stageLevel}
      stageName={stageName}
      duration={duration}
      posture={posture}
      pahmData={finalPahmData}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};

export default ImmediateReflectionWrapper;