import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useLocalData } from './contexts/LocalDataContext';

interface UserProgress {
  happiness_points: number;
  focus_ability: number;
  habit_change_score: number;
  practice_streak: number;
  current_level: string;
  breakdown?: {
    baseHappiness: number;
    pahmMasteryBonus: number;
    sessionQualityBonus: number;
    emotionalStabilityBonus: number;        // Updated: was emotionalProcessingBonus
    mindRecoveryBonus: number;
    environmentBonus: number;
    attachmentPenalty: number;
    questionnaireBonus: number;
    consistencyBonus: number;
  };
}

const HappinessProgressTracker: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser } = useAuth();
  
  const {
    getPracticeSessions,
    getDailyEmotionalNotes, 
    getMindRecoverySessions,
    getMeditationSessions,
    getAnalyticsData,
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    refreshTrigger
  } = useLocalData();

  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 342,
    focus_ability: 67,
    habit_change_score: 58,
    practice_streak: 1,
    current_level: 'Intermediate'
  });

  // 🎯 COMPREHENSIVE HAPPINESS CALCULATION ENGINE
  const calculateComprehensiveHappiness = () => {
    try {
      console.log('🧠 Starting Comprehensive Happiness Calculation...');
      
      // Get ALL real-time data from your app
      const practiceHistory = getPracticeSessions();
      const meditationSessions = getMeditationSessions();
      const emotionalNotes = getDailyEmotionalNotes();
      const mindRecoveryHistory = getMindRecoverySessions();
      const analytics = getAnalyticsData();
      const pahmData = getPAHMData();
      const environmentData = getEnvironmentData();
      const mindRecoveryAnalytics = getMindRecoveryAnalytics();
      
      // Auth context data
      const selfAssessment = currentUser?.selfAssessmentData;
      const questionnaire = currentUser?.questionnaireAnswers;

      console.log('📊 Real-time Data Summary:', {
        totalSessions: practiceHistory.length,
        meditationSessions: meditationSessions.length,
        mindRecoverySessions: mindRecoveryHistory.length,
        emotionalNotes: emotionalNotes.length,
        hasPAHMData: !!pahmData,
        hasEnvironmentData: environmentData ? Object.keys(environmentData).length > 0 : false,
        selfAssessment: selfAssessment ? 'Available' : 'Missing',
        questionnaire: questionnaire ? 'Available' : 'Missing'
      });

      // Initialize calculation components
      let baseHappiness = 200;
      let pahmMasteryBonus = 0;
      let sessionQualityBonus = 0;
      let emotionalStabilityBonus = 0;        // Updated: was emotionalProcessingBonus
      let mindRecoveryBonus = 0;
      let environmentBonus = 0;
      let attachmentPenalty = 0;
      let questionnaireBonus = 0;
      let consistencyBonus = 0;

      // 1. 📈 BASE HAPPINESS from total practice engagement
      if (practiceHistory.length > 0) {
        const totalSessions = practiceHistory.length;
        const totalMinutes = practiceHistory.reduce((sum, session) => sum + session.duration, 0);
        const avgQuality = practiceHistory.reduce((sum, session) => sum + (session.rating ?? 7), 0) / practiceHistory.length;
        
        // Enhanced base calculation
        baseHappiness = Math.round(
          (totalSessions * 12) + 
          (totalMinutes * 0.8) + 
          (avgQuality * 15) +
          Math.min(totalSessions * 2, 100) // Engagement bonus, capped at 100
        );
        
        console.log('📈 Base Happiness:', {
          totalSessions,
          totalMinutes,
          avgQuality: avgQuality.toFixed(1),
          baseHappiness
        });
      }

      // 2. 🧠 PAHM MASTERY BONUS (Core teaching: Present + Neutral)
      if (pahmData && pahmData.totalCounts > 0) {
        const presentNeutralCount = pahmData.totalPAHM.present_neutral;
        const presentNeutralPercentage = (presentNeutralCount / pahmData.totalCounts) * 100;
        
        // Exponential bonus for Present+Neutral mastery
        if (presentNeutralPercentage >= 70) {
          pahmMasteryBonus = 150 + Math.round((presentNeutralPercentage - 70) * 3);
        } else if (presentNeutralPercentage >= 50) {
          pahmMasteryBonus = 80 + Math.round((presentNeutralPercentage - 50) * 3.5);
        } else if (presentNeutralPercentage >= 30) {
          pahmMasteryBonus = 30 + Math.round((presentNeutralPercentage - 30) * 2.5);
        } else if (presentNeutralPercentage >= 15) {
          pahmMasteryBonus = Math.round(presentNeutralPercentage * 2);
        }
        
        // Additional bonus for high present moment awareness
        const presentTotalPercentage = pahmData.presentPercentage;
        if (presentTotalPercentage >= 80) {
          pahmMasteryBonus += 40;
        } else if (presentTotalPercentage >= 60) {
          pahmMasteryBonus += 20;
        }
        
        console.log('🧠 PAHM Mastery Analysis:', {
          presentNeutralPercentage: presentNeutralPercentage.toFixed(1),
          presentTotalPercentage,
          totalObservations: pahmData.totalCounts,
          masteryBonus: pahmMasteryBonus
        });
      }

      // 3. ⭐ SESSION QUALITY BONUS
      if (practiceHistory.length > 0) {
        const recentSessions = practiceHistory.slice(-10); // Last 10 sessions
        const avgRecentQuality = recentSessions.reduce((sum, s) => sum + (s.rating ?? 7), 0) / recentSessions.length;
        const highQualitySessions = recentSessions.filter(s => (s.rating ?? 7) >= 8).length;
        
        sessionQualityBonus = Math.round(
          (avgRecentQuality - 5) * 20 + // Base quality bonus
          (highQualitySessions * 8) + // High quality session bonus
          (avgRecentQuality >= 9 ? 25 : 0) // Excellence bonus
        );
        
        sessionQualityBonus = Math.max(0, sessionQualityBonus);
        
        console.log('⭐ Session Quality Analysis:', {
          avgRecentQuality: avgRecentQuality.toFixed(1),
          highQualitySessions,
          qualityBonus: sessionQualityBonus
        });
      }

      // 4. 💝 EMOTIONAL STABILITY PROGRESSION (Abhidhamma-Based)
      if (emotionalNotes.length > 0) {
        const isWithinDays = (timestamp: string, days: number, startDays = 0) => {
          const noteDate = new Date(timestamp);
          const endDate = new Date(Date.now() - startDays * 24 * 60 * 60 * 1000);
          const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          return noteDate >= startDate && noteDate <= endDate;
        };

        const recentNotes = emotionalNotes.filter(note => isWithinDays(note.timestamp, 30));
        const olderNotes = emotionalNotes.filter(note => isWithinDays(note.timestamp, 60, 30));
        
        // 1. EMOTIONAL STABILITY PROGRESSION (fewer disturbances = progress)
        const neutralEmotions = ['neutral', 'peaceful', 'calm', 'serene', 'content', 'equanimous', 'balanced'];
        const recentInstability = recentNotes.filter(note => 
          !neutralEmotions.includes(note.emotion.toLowerCase())
        ).length;
        const olderInstability = olderNotes.length > 0 ? 
          olderNotes.filter(note => !neutralEmotions.includes(note.emotion.toLowerCase())).length : 
          recentInstability;
        
        const stabilityImprovement = Math.max(0, (olderInstability - recentInstability) * 15);
        
        // 2. NEUTRALITY MASTERY BONUS (core Abhidhamma goal)
        const totalNotes = emotionalNotes.length;
        const neutralCount = emotionalNotes.filter(note => 
          neutralEmotions.includes(note.emotion.toLowerCase())
        ).length;
        const neutralityPercentage = (neutralCount / totalNotes) * 100;
        
        let neutralityBonus = 0;
        if (neutralityPercentage >= 80) {
          neutralityBonus = 100 + (neutralityPercentage - 80) * 5; // Master level
        } else if (neutralityPercentage >= 60) {
          neutralityBonus = 60 + (neutralityPercentage - 60) * 2;  // Advanced level
        } else if (neutralityPercentage >= 40) {
          neutralityBonus = 20 + (neutralityPercentage - 40) * 2;  // Intermediate level
        } else if (neutralityPercentage >= 20) {
          neutralityBonus = neutralityPercentage;                   // Beginner level
        }
        
        // 3. TRACKING CONSISTENCY BONUS (commitment to self-observation)
        const last30Days = Array.from({length: 30}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toDateString();
        });
        const trackedDays = last30Days.filter(day => 
          emotionalNotes.some(note => new Date(note.timestamp).toDateString() === day)
        ).length;
        const consistencyTrackingBonus = Math.round(trackedDays * 2); // Up to 60 points
        
        // 4. ENERGY STABILITY BONUS (stable energy = emotional mastery)
        const notesWithEnergy = emotionalNotes.filter(note => note.energyLevel !== undefined);
        let energyStabilityBonus = 0;
        if (notesWithEnergy.length >= 5) {
          const energyLevels = notesWithEnergy.map(note => note.energyLevel!);
          const avgEnergy = energyLevels.reduce((sum, level) => sum + level, 0) / energyLevels.length;
          const variance = energyLevels.reduce((sum, level) => sum + Math.pow(level - avgEnergy, 2), 0) / energyLevels.length;
          const standardDeviation = Math.sqrt(variance);
          
          const stabilityScore = Math.max(0, 3 - standardDeviation); // Lower deviation = more stable
          const energyScore = Math.max(0, avgEnergy - 5); // Bonus for energy above 5
          energyStabilityBonus = Math.round((stabilityScore * 10) + (energyScore * 2));
        }
        
        emotionalStabilityBonus = Math.round(
          stabilityImprovement + 
          neutralityBonus + 
          consistencyTrackingBonus + 
          energyStabilityBonus
        );
        
        console.log('💝 Emotional Stability Analysis (Abhidhamma):', {
          totalNotes: emotionalNotes.length,
          neutralityPercentage: neutralityPercentage.toFixed(1),
          stabilityImprovement,
          neutralityBonus: Math.round(neutralityBonus),
          consistencyTracking: trackedDays,
          emotionalStabilityScore: emotionalStabilityBonus
        });
      }

      // 5. 🕐 MIND RECOVERY INTEGRATION (Split Analysis)
      if (mindRecoveryHistory.length > 0) {
        const isWithinDays = (timestamp: string, days: number, startDays = 0) => {
          const sessionDate = new Date(timestamp);
          const endDate = new Date(Date.now() - startDays * 24 * 60 * 60 * 1000);
          const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
          return sessionDate >= startDate && sessionDate <= endDate;
        };

        // CATEGORY A: General Mind Recovery (Wellness/Lifestyle)
        const generalRecoverySessions = mindRecoveryHistory.filter(session => 
          session.mindRecoveryContext !== 'emotional-reset'
        );
        
        // CATEGORY B: Emotional Reset Sessions (Reactivity Management)
        const emotionalResetSessions = mindRecoveryHistory.filter(session => 
          session.mindRecoveryContext === 'emotional-reset'
        );
        
        let generalMindRecoveryBonus = 0;
        let emotionalResetEffectivenessBonus = 0;
        let emotionalMasteryBonus = 0;
        
        // GENERAL MIND RECOVERY CALCULATION
        if (generalRecoverySessions.length > 0) {
          const baseBonus = Math.min(generalRecoverySessions.length * 6, 80);
          const avgRating = generalRecoverySessions.reduce((sum, s) => sum + (s.rating || 6), 0) / generalRecoverySessions.length;
          const qualityBonus = avgRating >= 8 ? 30 : (avgRating >= 6 ? 15 : 0);
          
          // Variety bonus for different recovery techniques
          const uniqueContexts = new Set(generalRecoverySessions.map(s => s.mindRecoveryContext)).size;
          const varietyBonus = Math.min(uniqueContexts * 8, 40);
          
          // Integration bonus for optimal duration
          const avgDuration = generalRecoverySessions.reduce((sum, s) => sum + s.duration, 0) / generalRecoverySessions.length;
          const integrationBonus = (avgDuration >= 3 && avgDuration <= 10) ? 20 : 0;
          
          generalMindRecoveryBonus = baseBonus + qualityBonus + varietyBonus + integrationBonus;
        }
        
        // EMOTIONAL RESET EFFECTIVENESS CALCULATION
        if (emotionalResetSessions.length === 0) {
          // No emotional resets needed = excellent emotional stability
          emotionalResetEffectivenessBonus = 100; // High bonus for not needing emotional interventions
        } else {
          // Analyze frequency trend (fewer over time = progress)
          const recentResets = emotionalResetSessions.filter(s => isWithinDays(s.timestamp, 30));
          const olderResets = emotionalResetSessions.filter(s => isWithinDays(s.timestamp, 60, 30));
          
          const recentFrequency = recentResets.length;
          const olderFrequency = olderResets.length || recentFrequency; // Fallback for new users
          
          // Progress bonus: fewer recent resets compared to older period
          const progressBonus = Math.max(0, (olderFrequency - recentFrequency) * 10);
          
          // Effectiveness bonus: when you do need resets, how effective are they?
          const avgEffectiveness = emotionalResetSessions.reduce((sum, session) => {
            const stressReduction = session.recoveryMetrics?.stressReduction || 0;
            const rating = session.rating || 0;
            return sum + Math.max(stressReduction * 10, rating * 8);
          }, 0) / emotionalResetSessions.length;
          
          const effectivenessBonus = Math.round(avgEffectiveness * 0.5); // Max ~40 points
          
          // Frequency penalty: too many resets indicates emotional instability
          const frequencyPenalty = Math.min(recentFrequency * 5, 50); // Up to -50 for high reactivity
          
          // Speed bonus: quick emotional recovery
          const avgDuration = emotionalResetSessions.reduce((sum, s) => sum + s.duration, 0) / emotionalResetSessions.length;
          const speedBonus = avgDuration <= 5 ? 15 : (avgDuration <= 10 ? 8 : 0);
          
          emotionalResetEffectivenessBonus = Math.max(0, progressBonus + effectivenessBonus + speedBonus - frequencyPenalty);
        }
        
        // EMOTIONAL MASTERY BONUS (Advanced Practitioner Recognition)
        const recentResets = emotionalResetSessions.filter(s => isWithinDays(s.timestamp, 90));
        const recentEmotionalDisturbances = emotionalNotes.filter(note => 
          isWithinDays(note.timestamp, 90) && 
          ['angry', 'frustrated', 'irritated', 'upset', 'anxious', 'worried'].includes(note.emotion.toLowerCase())
        );
        
        // Master level: No emotional resets AND minimal emotional disturbances
        if (recentResets.length === 0 && recentEmotionalDisturbances.length <= 2) {
          emotionalMasteryBonus = 75; // Exceptional emotional mastery bonus
        } else if (recentResets.length <= 1 && recentEmotionalDisturbances.length <= 5) {
          emotionalMasteryBonus = 40; // Advanced emotional stability bonus
        }
        
        mindRecoveryBonus = Math.round(generalMindRecoveryBonus + emotionalResetEffectivenessBonus + emotionalMasteryBonus);
        
        console.log('🕐 Mind Recovery Analysis (Split Categories):', {
          generalSessions: generalRecoverySessions.length,
          emotionalResetSessions: emotionalResetSessions.length,
          generalBonus: Math.round(generalMindRecoveryBonus),
          resetEffectivenessBonus: Math.round(emotionalResetEffectivenessBonus),
          masteryBonus: emotionalMasteryBonus,
          totalRecoveryBonus: mindRecoveryBonus
        });
      }

      // 6. 🌿 ENVIRONMENT OPTIMIZATION BONUS
      if (environmentData) {
        let optimalEnvironments = 0;
        let totalEnvironmentFactors = 0;
        
        ['posture', 'location', 'lighting', 'sounds'].forEach(factor => {
          const factorData = environmentData[factor as keyof typeof environmentData];
          if (Array.isArray(factorData) && factorData.length > 0) {
            totalEnvironmentFactors++;
            const bestOption = factorData.find(option => option.avgRating >= 8);
            if (bestOption) optimalEnvironments++;
          }
        });
        
        if (totalEnvironmentFactors > 0) {
          const optimizationRatio = optimalEnvironments / totalEnvironmentFactors;
          environmentBonus = Math.round(optimizationRatio * 35 + totalEnvironmentFactors * 5);
        }
        
        console.log('🌿 Environment Analysis:', {
          totalFactors: totalEnvironmentFactors,
          optimalEnvironments,
          environmentBonus
        });
      }

      // 7. 🧘 SELF-ASSESSMENT PENALTY (Buddhist Detachment Principle)
      if (selfAssessment) {
        let totalAttachment = 0;
        let sensesCount = 0;
        
        // Handle multiple possible data structures
        if (selfAssessment.sixSenses) {
          const senses = selfAssessment.sixSenses;
          const senseValues = Object.values(senses).filter(val => typeof val === 'number');
          if (senseValues.length > 0) {
            totalAttachment = senseValues.reduce((sum: number, val: any) => sum + val, 0) / senseValues.length;
            sensesCount = senseValues.length;
          }
        } else if (Array.isArray(selfAssessment.scores)) {
          const scores = selfAssessment.scores.filter((score: any) => typeof score === 'number');
          if (scores.length > 0) {
            totalAttachment = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
            sensesCount = scores.length;
          }
        } else if (typeof selfAssessment.averageAttachment === 'number') {
          totalAttachment = selfAssessment.averageAttachment;
          sensesCount = 6;
        }
        
        if (sensesCount > 0) {
          // Progressive penalty: higher attachment = exponentially more penalty
          if (totalAttachment >= 8) {
            attachmentPenalty = Math.round(totalAttachment * 18);
          } else if (totalAttachment >= 6) {
            attachmentPenalty = Math.round(totalAttachment * 14);
          } else if (totalAttachment >= 4) {
            attachmentPenalty = Math.round(totalAttachment * 10);
          } else {
            attachmentPenalty = Math.round(totalAttachment * 6);
          }
          
          console.log('🧘 Detachment Analysis:', {
            averageAttachment: totalAttachment.toFixed(1),
            attachmentPenalty,
            sensesAnalyzed: sensesCount
          });
        }
      }

      // 8. 📋 LIFESTYLE & MINDFULNESS QUESTIONNAIRE BONUS
      if (questionnaire) {
        // Experience level bonus
        const experience = questionnaire.mindfulnessExperience || questionnaire.experienceLevel || 0;
        if (experience >= 8) questionnaireBonus += 40;
        else if (experience >= 6) questionnaireBonus += 25;
        else if (experience >= 4) questionnaireBonus += 15;
        
        // Sleep quality bonus
        const sleepQuality = questionnaire.sleepQuality || questionnaire.sleep || 0;
        if (sleepQuality >= 9) questionnaireBonus += 30;
        else if (sleepQuality >= 7) questionnaireBonus += 20;
        else if (sleepQuality >= 5) questionnaireBonus += 10;
        
        // Stress management bonus
        const stressLevel = questionnaire.stressLevel || questionnaire.stress || 10;
        if (stressLevel <= 2) questionnaireBonus += 35;
        else if (stressLevel <= 4) questionnaireBonus += 25;
        else if (stressLevel <= 6) questionnaireBonus += 15;
        
        // Physical activity bonus
        const physicalActivity = questionnaire.physicalActivity || questionnaire.exercise || 0;
        if (physicalActivity >= 8) questionnaireBonus += 25;
        else if (physicalActivity >= 6) questionnaireBonus += 15;
        else if (physicalActivity >= 4) questionnaireBonus += 10;
        
        // Goal clarity bonus
        if (questionnaire.goals && Array.isArray(questionnaire.goals) && questionnaire.goals.length >= 2) {
          questionnaireBonus += 15;
        } else if (questionnaire.goals && Array.isArray(questionnaire.goals) && questionnaire.goals.length >= 1) {
          questionnaireBonus += 8;
        }
        
        console.log('📋 Lifestyle Assessment Bonus:', {
          totalBonus: questionnaireBonus,
          experience,
          sleepQuality,
          stressLevel,
          physicalActivity
        });
      }

      // 9. 📅 CONSISTENCY & COMMITMENT BONUS
      if (analytics) {
        const streakBonus = Math.min(analytics.currentStreak * 5, 75);
        const frequencyBonus = analytics.totalSessions >= 20 ? 25 : 
                              analytics.totalSessions >= 10 ? 15 : 
                              analytics.totalSessions >= 5 ? 8 : 0;
        
        consistencyBonus = streakBonus + frequencyBonus;
        
        // Long-term commitment bonus
        if (analytics.totalSessions >= 50) consistencyBonus += 30;
        else if (analytics.totalSessions >= 30) consistencyBonus += 20;
        
        console.log('📅 Consistency Analysis:', {
          currentStreak: analytics.currentStreak,
          totalSessions: analytics.totalSessions,
          consistencyBonus
        });
      }

      // 🎯 FINAL HAPPINESS CALCULATION
      const finalHappiness = Math.max(50,
        baseHappiness +
        pahmMasteryBonus +
        sessionQualityBonus +
        emotionalStabilityBonus +        // Updated: was emotionalProcessingBonus
        mindRecoveryBonus +
        environmentBonus +
        questionnaireBonus +
        consistencyBonus -
        attachmentPenalty
      );

      // Determine level based on happiness points
      let currentLevel = 'Newcomer';
      if (finalHappiness >= 1200) currentLevel = 'Master';
      else if (finalHappiness >= 1000) currentLevel = 'Expert';
      else if (finalHappiness >= 800) currentLevel = 'Advanced';
      else if (finalHappiness >= 600) currentLevel = 'Intermediate';
      else if (finalHappiness >= 400) currentLevel = 'Beginner';

      console.log('🎯 Final Happiness Calculation:', {
        baseHappiness,
        pahmMasteryBonus,
        sessionQualityBonus,
        emotionalStabilityBonus,         // Updated: was emotionalProcessingBonus
        mindRecoveryBonus,
        environmentBonus,
        questionnaireBonus,
        consistencyBonus,
        attachmentPenalty: -attachmentPenalty,
        finalHappiness,
        level: currentLevel
      });

      return {
        happiness_points: finalHappiness,
        current_level: currentLevel,
        breakdown: {
          baseHappiness,
          pahmMasteryBonus,
          sessionQualityBonus,
          emotionalStabilityBonus,       // Updated: was emotionalProcessingBonus
          mindRecoveryBonus,
          environmentBonus,
          attachmentPenalty,
          questionnaireBonus,
          consistencyBonus
        }
      };

    } catch (error) {
      console.error('❌ Error in comprehensive happiness calculation:', error);
      return {
        happiness_points: 200,
        current_level: 'Newcomer',
        breakdown: {
          baseHappiness: 200,
          pahmMasteryBonus: 0,
          sessionQualityBonus: 0,
          emotionalStabilityBonus: 0,    // Updated: was emotionalProcessingBonus
          mindRecoveryBonus: 0,
          environmentBonus: 0,
          attachmentPenalty: 0,
          questionnaireBonus: 0,
          consistencyBonus: 0
        }
      };
    }
  };

  // 🎯 REAL-TIME DATA LOADING WITH ENHANCED CALCULATIONS
  useEffect(() => {
    loadRealTimeData();
  }, [refreshTrigger]);

  const loadRealTimeData = () => {
    try {
      console.log('🔄 Loading real-time data and calculating comprehensive metrics...');
      
      // Get comprehensive happiness data
      const happinessData = calculateComprehensiveHappiness();
      
      // Get current analytics for other metrics
      const practiceHistory = getPracticeSessions();
      const mindRecoveryHistory = getMindRecoverySessions();
      const analytics = getAnalyticsData();
      
      let calculatedProgress: UserProgress = {
        happiness_points: happinessData.happiness_points,
        current_level: happinessData.current_level,
        focus_ability: 67,
        habit_change_score: 58,
        practice_streak: 1,
        breakdown: happinessData.breakdown
      };

      // Calculate focus ability from recent session quality and present moment awareness
      if (practiceHistory.length > 0) {
        const recentSessions = practiceHistory.slice(-7); // Last week
        const avgPresentMoment = recentSessions.reduce((sum, session) => {
          const presentPercentage = session.presentPercentage || 
                                   (session.rating ? session.rating * 10 : 70);
          return sum + presentPercentage;
        }, 0) / recentSessions.length;
        
        const avgQuality = recentSessions.reduce((sum, session) => {
          return sum + (session.rating || 7);
        }, 0) / recentSessions.length;
        
        // Combined focus score from present moment and quality
        calculatedProgress.focus_ability = Math.round(
          Math.min(100, (avgPresentMoment * 0.6) + (avgQuality * 10 * 0.4))
        );
      }

      // Calculate habit change from mind recovery effectiveness
      if (mindRecoveryHistory.length > 0) {
        const recentRecoveries = mindRecoveryHistory.slice(-10);
        const avgEffectiveness = recentRecoveries.reduce((sum, session) => {
          const rating = session.rating || 6;
          const stressReduction = session.recoveryMetrics?.stressReduction || 0;
          const effectiveness = stressReduction > 0 ? 
                               (stressReduction * 10 + rating * 5) / 2 : 
                               rating * 10;
          return sum + effectiveness;
        }, 0) / recentRecoveries.length;
        
        calculatedProgress.habit_change_score = Math.round(Math.min(100, avgEffectiveness));
      }

      // Get practice streak from analytics
      if (analytics) {
        calculatedProgress.practice_streak = analytics.currentStreak || 0;
      }

      setUserProgress(calculatedProgress);

      // Save happiness points for header display
      localStorage.setItem('happiness_points', calculatedProgress.happiness_points.toString());
      localStorage.setItem('user_level', calculatedProgress.current_level);

      console.log('✅ Real-time data loaded successfully:', calculatedProgress);

    } catch (error) {
      console.error('❌ Error loading real-time data:', error);
    }
  };

  // Get current data for display
  const practiceHistory = getPracticeSessions();
  const emotionalNotes = getDailyEmotionalNotes();
  const mindRecoveryHistory = getMindRecoverySessions();
  const pahmData = getPAHMData();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: 'white'
          }}>
            😊 Comprehensive Happiness Analysis
          </h1>
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
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          background: 'white',
          margin: '20px',
          borderRadius: '20px',
          padding: '30px',
          maxHeight: 'calc(90vh - 120px)',
          overflowY: 'auto'
        }}>
          {/* Main Happiness Score */}
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #32cd32 100%)',
            color: 'white',
            borderRadius: '20px',
            marginBottom: '30px'
          }}>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '10px' }}>
              {userProgress.happiness_points}
            </div>
            <div style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
              Comprehensive Happiness Points
            </div>
            <div style={{ 
              fontSize: '1.3rem', 
              marginBottom: '10px',
              padding: '10px 20px', 
              background: 'rgba(255,255,255,0.2)', 
              borderRadius: '10px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}>
              {userProgress.current_level}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>
              Based on {practiceHistory.length} sessions, {pahmData?.totalCounts || 0} PAHM observations, 
              {emotionalNotes.length} notes, {mindRecoveryHistory.length} recovery sessions
            </div>
          </div>

          {/* Detailed Breakdown */}
          {userProgress.breakdown && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                Happiness Components Breakdown
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    +{userProgress.breakdown.baseHappiness}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Base Practice</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    +{userProgress.breakdown.pahmMasteryBonus}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>PAHM Mastery</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    +{userProgress.breakdown.sessionQualityBonus}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Session Quality</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    +{userProgress.breakdown.emotionalStabilityBonus}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Emotional Stability</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    +{userProgress.breakdown.mindRecoveryBonus}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Mind Recovery</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    -{userProgress.breakdown.attachmentPenalty}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Attachment Penalty</div>
                </div>
              </div>
            </div>
          )}

          {/* Other Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                {userProgress.focus_ability}%
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Focus Ability</div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              padding: '24px',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                {userProgress.habit_change_score}%
              </div>
              <div style={{ fontSize: '1rem', opacity: 0.9 }}>Habit Change</div>
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
            </div>
          </div>

          {/* PAHM Insight */}
          {pahmData && (
            <div style={{
              background: '#e8f4fd',
              padding: '20px',
              borderRadius: '15px',
              borderLeft: '5px solid #3498db',
              marginTop: '20px'
            }}>
              <h4 style={{ color: '#2980b9', marginBottom: '10px' }}>
                🧠 PAHM Analysis: Present + Neutral Mastery
              </h4>
              <p style={{ color: '#34495e', fontSize: '14px', margin: 0 }}>
                Present+Neutral: {Math.round((pahmData.totalPAHM.present_neutral / pahmData.totalCounts) * 100)}% of {pahmData.totalCounts} total observations. 
                This is the only non-poisonous position in the mind - all other mental positions involve suffering.
              </p>
            </div>
          )}

          {/* Abhidhamma-Based Emotional Progress Note */}
          <div style={{
            background: '#fff3cd',
            padding: '20px',
            borderRadius: '15px',
            borderLeft: '5px solid #ffc107',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#856404', marginBottom: '10px' }}>
              🧘 Abhidhamma-Based Progress Tracking
            </h4>
            <p style={{ color: '#664d03', fontSize: '14px', margin: 0 }}>
              <strong>Emotional Stability:</strong> Advanced practitioners experience fewer emotional fluctuations and more neutral states. 
              Progress is measured by increased emotional neutrality, not emotional variety.<br/>
              <strong>Mind Recovery:</strong> Needing fewer "emotional reset" sessions indicates better emotional mastery. 
              General recovery sessions support daily wellness integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HappinessProgressTracker;