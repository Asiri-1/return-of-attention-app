import React, { useState, useEffect } from 'react';
// ✅ UPDATED: Use PAHM-centered calculation system
import { 
  calculateHappiness, 
  debugUserData,
  HappinessBreakdown,
  HappinessResult,
  PAHMCentralAnalysis
} from './happinessCalculations';
// ✅ UPDATED: Use LocalDataContext directly (same as HomeDashboard)
import { useLocalData } from './contexts/LocalDataContext';

// ✅ UPDATED: Simplified props - use LocalDataContext for data consistency
export interface HappinessProgressTrackerProps {
  onClose?: () => void;
}

interface UserProgress {
  happiness_points: number;
  focus_ability: number;
  habit_change_score: number;
  practice_streak: number;
  user_level: string;
  breakdown?: HappinessBreakdown;
  pahmAnalysis?: PAHMCentralAnalysis;
  debugInfo?: any;
}

const HappinessProgressTracker: React.FC<HappinessProgressTrackerProps> = ({ 
  onClose
}) => {
  // ✅ UPDATED: Get data from LocalDataContext (EXACT same source as HomeDashboard)
  const {
    practiceSessions,
    getQuestionnaire,
    getSelfAssessment,
    emotionalNotes // ✅ NEW: Get emotional notes for PAHM-centered calculation
  } = useLocalData();

  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 0,
    focus_ability: 0,
    habit_change_score: 0,
    practice_streak: 0,
    user_level: 'Beginning: Starting the return to present happiness'
  });

  const [showDebug, setShowDebug] = useState(false);
  const [calculationDebugInfo, setCalculationDebugInfo] = useState<any>(null);

  // ✅ UPDATED: Use PAHM-centered calculation with emotional notes
  useEffect(() => {
    console.log('🔄 HappinessProgressTracker: Using PAHM-CENTERED calculation with LocalDataContext...');
    
    try {
      // ✅ UPDATED: Use EXACT same data access as HomeDashboard
      const questionnaire = getQuestionnaire();
      const selfAssessment = getSelfAssessment();
      
      console.log('📊 HappinessProgressTracker Data (PAHM-CENTERED):', {
        hasQuestionnaire: !!questionnaire,
        hasSelfAssessment: !!selfAssessment,
        questionnaireData: questionnaire,
        selfAssessmentData: selfAssessment,
        practiceSessionCount: practiceSessions?.length || 0,
        emotionalNotesCount: emotionalNotes?.length || 0
      });
      
      // ✅ UPDATED: Use PAHM-centered calculation system with emotional notes
      const happinessResult: HappinessResult = calculateHappiness(
        questionnaire, 
        selfAssessment, 
        practiceSessions || [],
        emotionalNotes || [] // ✅ NEW: Include emotional notes
      );
      
      console.log('✅ HappinessProgressTracker: PAHM-CENTERED calculation result:', {
        happiness_points: happinessResult.happiness_points,
        user_level: happinessResult.user_level,
        breakdown: happinessResult.breakdown,
        pahmAnalysis: happinessResult.pahmAnalysis,
        presentAttentionSkills: happinessResult.presentAttentionSkills,
        practiceMilestones: happinessResult.practiceMilestones?.length || 0,
        debugInfo: happinessResult.debugInfo
      });
      
      // ✅ UPDATED: Save to localStorage so HomeDashboard displays same values
      localStorage.setItem('happiness_points', happinessResult.happiness_points.toString());
      localStorage.setItem('user_level', happinessResult.user_level);
      localStorage.setItem('happiness_breakdown', JSON.stringify(happinessResult.breakdown));
      localStorage.setItem('happiness_last_calculated', Date.now().toString());
      
      // ✅ UPDATED: Dispatch event to notify HomeDashboard
      window.dispatchEvent(new CustomEvent('happinessUpdated', {
        detail: {
          happiness_points: happinessResult.happiness_points,
          user_level: happinessResult.user_level,
          breakdown: happinessResult.breakdown
        }
      }));
      
      console.log('✅ HappinessProgressTracker: PAHM-centered values saved to localStorage for HomeDashboard:', {
        happiness_points: happinessResult.happiness_points,
        user_level: happinessResult.user_level
      });
      
      // ✅ UPDATED: Calculate other progress metrics using PAHM-centered data
      let calculatedProgress: UserProgress = {
        happiness_points: happinessResult.happiness_points,
        user_level: happinessResult.user_level,
        focus_ability: 0,
        habit_change_score: 0,
        practice_streak: 0,
        breakdown: happinessResult.breakdown,
        pahmAnalysis: happinessResult.pahmAnalysis,
        debugInfo: happinessResult.debugInfo
      };

      // ✅ UPDATED: Calculate focus ability from PAHM analysis and present attention skills
      if (happinessResult.pahmAnalysis && happinessResult.presentAttentionSkills) {
        const pahmPresentRatio = happinessResult.pahmAnalysis.presentNeutralRatio * 100;
        const attentionSkill = happinessResult.presentAttentionSkills.attention;
        const presenceSkill = happinessResult.presentAttentionSkills.presence;
        
        // Focus ability based on present-neutral mastery and attention skills
        calculatedProgress.focus_ability = Math.round(
          Math.min(100, (pahmPresentRatio * 0.4) + (attentionSkill * 0.3) + (presenceSkill * 0.3))
        );
      }

      // ✅ UPDATED: Calculate practice streak from debugInfo
      if (happinessResult.debugInfo?.currentStreak !== undefined) {
        calculatedProgress.practice_streak = happinessResult.debugInfo.currentStreak;
      }

      // ✅ UPDATED: Enhanced habit change score based on PAHM development and consistency
      if (happinessResult.breakdown) {
        const pahmScore = happinessResult.breakdown.pahmDevelopment;
        const consistencyScore = happinessResult.breakdown.practiceConsistency;
        const streakBonus = calculatedProgress.practice_streak >= 7 ? 20 : calculatedProgress.practice_streak >= 3 ? 10 : 0;
        
        // Habit change = PAHM development + consistency + streak bonus
        calculatedProgress.habit_change_score = Math.round(
          Math.min(100, (pahmScore * 0.4) + (consistencyScore * 0.4) + (streakBonus * 0.2))
        );
      }

      setUserProgress(calculatedProgress);
      setCalculationDebugInfo(happinessResult.debugInfo);
      console.log('✅ HappinessProgressTracker: PAHM-centered progress calculation completed:', calculatedProgress);

    } catch (error) {
      console.error('❌ HappinessProgressTracker: Error in PAHM-centered calculation:', error);
      setUserProgress({
        happiness_points: 0,
        focus_ability: 0,
        habit_change_score: 0,
        practice_streak: 0,
        user_level: 'Beginning: Starting the return to present happiness'
      });
    }

  }, [practiceSessions, getQuestionnaire, getSelfAssessment, emotionalNotes]);

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '24px' }}>
          🧘‍♀️ PAHM-Centered Present Attention Journey
        </h1>
        <div>
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 15px',
              color: 'white',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px'
      }}>
        {/* Main Happiness Score */}
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          borderRadius: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '10px' }}>
            {userProgress.happiness_points}
          </div>
          <div style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
            PAHM-Centered Happiness Points
          </div>
          <div style={{ 
            fontSize: '1.2rem', 
            marginBottom: '10px',
            padding: '10px 20px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '10px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            {userProgress.user_level}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            Based on {practiceSessions?.length || 0} practice sessions & {emotionalNotes?.length || 0} emotional notes
          </div>
        </div>

        {/* ✅ NEW: PAHM Development Analysis */}
        {userProgress.pahmAnalysis && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '25px',
            borderRadius: '15px',
            marginBottom: '25px'
          }}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
              🎯 PAHM Development Analysis - The Core Component (30% Weight)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {Math.round(userProgress.pahmAnalysis.presentNeutralRatio * 100)}%
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Present-Neutral Mastery</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>THE ULTIMATE GOAL</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {Math.round(userProgress.pahmAnalysis.presentMomentRatio * 100)}%
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Present-Moment Focus</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Overall Present Awareness</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {userProgress.pahmAnalysis.overallPAHMScore}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>PAHM Score</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>0-100 Scale</div>
              </div>
            </div>
            
            {/* PAHM Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '15px'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {userProgress.pahmAnalysis.breakdown.presentNeutralMastery}/50
                </div>
                <div style={{ fontSize: '0.8rem' }}>Present-Neutral Mastery</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {userProgress.pahmAnalysis.breakdown.presentMomentDevelopment}/30
                </div>
                <div style={{ fontSize: '0.8rem' }}>Present Development</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {userProgress.pahmAnalysis.breakdown.therapeuticProgress}/15
                </div>
                <div style={{ fontSize: '0.8rem' }}>Therapeutic Progress</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {userProgress.pahmAnalysis.breakdown.sessionQuality}/5
                </div>
                <div style={{ fontSize: '0.8rem' }}>Session Quality</div>
              </div>
            </div>

            {/* Development Stage & Progression */}
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                padding: '8px 15px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '20px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                Stage: {userProgress.pahmAnalysis.developmentStage}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                {userProgress.pahmAnalysis.stageDescription}
              </div>
            </div>

            {/* Progression Path */}
            <div style={{ 
              fontSize: '0.9rem', 
              textAlign: 'center',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}>
              <strong>Progression Path:</strong> {userProgress.pahmAnalysis.progressionPath}
            </div>
          </div>
        )}

        {/* ✅ UPDATED: PAHM-Centered Component Breakdown */}
        {userProgress.breakdown && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              🎯 PAHM-Centered Happiness Components (Research-Based Weighting)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {/* PRIMARY COMPONENT - PAHM Development (30%) */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '3px solid #ffd700'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  {userProgress.breakdown.pahmDevelopment}/100
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  PAHM Development
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                  30% Weight - THE CORE
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '5px' }}>
                  Present attention IS happiness
                </div>
              </div>

              {/* SUPPORTING COMPONENTS */}
              <div style={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.emotionalStabilityProgress}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Emotional Stability</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>20% Weight - Validation</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.currentMoodState}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Current Mood</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>15% Weight - Enhanced</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.mindRecoveryEffectiveness}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Mind Recovery</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>12% Weight - Support</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.emotionalRegulation}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Emotional Regulation</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>10% Weight - Skills</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.attachmentFlexibility}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Attachment Flexibility</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>8% Weight - Freedom</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.socialConnection}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Social Connection</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>3% Weight - Background</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                padding: '18px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {userProgress.breakdown.practiceConsistency}/100
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Practice Consistency</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>2% Weight - Supporting</div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: PAHM-Enhanced Other Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProgress.focus_ability}%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Focus Ability</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
              PAHM Present-Neutral + Attention Skills
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProgress.habit_change_score}%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Habit Change</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
              PAHM Development + Consistency
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProgress.practice_streak}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Day Streak</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
              Present Attention Practice
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: PAHM Insights & Recommendations */}
        {userProgress.pahmAnalysis && userProgress.pahmAnalysis.insights.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
            padding: '20px',
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ color: '#2d3436', marginBottom: '15px', textAlign: 'center' }}>
              💡 PAHM Development Insights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h5 style={{ color: '#2d3436', marginBottom: '10px' }}>📊 Current Insights:</h5>
                <ul style={{ color: '#2d3436', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {userProgress.pahmAnalysis.insights.map((insight, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>{insight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 style={{ color: '#2d3436', marginBottom: '10px' }}>🎯 Recommendations:</h5>
                <ul style={{ color: '#2d3436', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {userProgress.pahmAnalysis.recommendations.map((rec, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ✅ UPDATED: Enhanced PAHM-Centered Debug Panel */}
        {showDebug && (
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid #e9ecef',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>🔍 PAHM-Centered Debug Information</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Data Sources (LocalDataContext):</strong>
                <br />• Practice Sessions: {practiceSessions?.length || 0} sessions
                <br />• Emotional Notes: {emotionalNotes?.length || 0} notes ✅ NEW
                <br />• Questionnaire: {getQuestionnaire() ? '✅ Available' : '❌ Missing'}
                <br />• Self-Assessment: {getSelfAssessment() ? '✅ Available' : '❌ Missing'}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>PAHM-Centered System (30% Weight):</strong>
                <br />• PAHM Development: {userProgress.breakdown?.pahmDevelopment || 0}/100 (30% weight)
                <br />• Emotional Stability: {userProgress.breakdown?.emotionalStabilityProgress || 0}/100 (20% weight)
                <br />• Current Mood: {userProgress.breakdown?.currentMoodState || 0}/100 (15% weight)
                <br />• Mind Recovery: {userProgress.breakdown?.mindRecoveryEffectiveness || 0}/100 (12% weight)
                <br />• Emotional Regulation: {userProgress.breakdown?.emotionalRegulation || 0}/100 (10% weight)
                <br />• Attachment Flexibility: {userProgress.breakdown?.attachmentFlexibility || 0}/100 (8% weight)
                <br />• Social Connection: {userProgress.breakdown?.socialConnection || 0}/100 (3% weight)
                <br />• Practice Consistency: {userProgress.breakdown?.practiceConsistency || 0}/100 (2% weight)
              </div>
              {userProgress.pahmAnalysis && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>PAHM Analysis Details:</strong>
                  <br />• Development Stage: {userProgress.pahmAnalysis.developmentStage}
                  <br />• Present-Neutral Ratio: {Math.round(userProgress.pahmAnalysis.presentNeutralRatio * 100)}%
                  <br />• Present-Moment Ratio: {Math.round(userProgress.pahmAnalysis.presentMomentRatio * 100)}%
                  <br />• Overall PAHM Score: {userProgress.pahmAnalysis.overallPAHMScore}/100
                  <br />• Present-Neutral Mastery: {userProgress.pahmAnalysis.breakdown.presentNeutralMastery}/50
                  <br />• Present Development: {userProgress.pahmAnalysis.breakdown.presentMomentDevelopment}/30
                  <br />• Therapeutic Progress: {userProgress.pahmAnalysis.breakdown.therapeuticProgress}/15
                  <br />• Session Quality: {userProgress.pahmAnalysis.breakdown.sessionQuality}/5
                </div>
              )}
              {calculationDebugInfo && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Calculation Debug Info:</strong>
                  <br />• Total Sessions: {calculationDebugInfo.sessionCount || 0}
                  <br />• Current Streak: {calculationDebugInfo.currentStreak || 0} days
                  <br />• Longest Streak: {calculationDebugInfo.longestStreak || 0} days
                  <br />• PAHM-Centric Calculation: {calculationDebugInfo.pahmCentricCalculation ? '✅' : '❌'}
                  <br />• PAHM Weight: {calculationDebugInfo.pahmWeight || 'N/A'}
                  <br />• Emotional Notes Count: {calculationDebugInfo.emotionalNotesCount || 0}
                  <br />• Present-Neutral Ratio: {calculationDebugInfo.presentNeutralRatio ? Math.round(calculationDebugInfo.presentNeutralRatio * 100) + '%' : 'N/A'}
                </div>
              )}
              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={() => debugUserData(getQuestionnaire(), getSelfAssessment(), practiceSessions || [])}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '8px 15px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  🔍 Debug PAHM Data (Console)
                </button>
                <button 
                  onClick={() => console.log('PAHM-Centered Progress State:', userProgress)}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '8px 15px',
                    cursor: 'pointer'
                  }}
                >
                  📊 Log PAHM Progress
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HappinessProgressTracker;