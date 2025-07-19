import React, { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../AdminContext';
import { useAuth } from '../AuthContext';
import { useLocalData } from '../contexts/LocalDataContext';

function AdminPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    averageHappiness: 0,
    completedAssessments: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // Testing state
  const [sessionCounts, setSessionCounts] = useState({
    T1: 0, T2: 0, T3: 0, T4: 0, T5: 0
  });
  const [pahmProgress, setPahmProgress] = useState({
    stage2: { hours: 0, completed: false, name: 'PAHM Trainee' },
    stage3: { hours: 0, completed: false, name: 'PAHM Beginner' },
    stage4: { hours: 0, completed: false, name: 'PAHM Practitioner' },
    stage5: { hours: 0, completed: false, name: 'PAHM Master' },
    stage6: { hours: 0, completed: false, name: 'PAHM Illuminator' }
  });
  const [onboardingStatus, setOnboardingStatus] = useState({
    questionnaire: false,
    selfAssessment: false,
    introduction: false
  });
  const [userProfileData, setUserProfileData] = useState(null);

  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { currentUser, logout } = useAuth();
  const { addPracticeSession, addEmotionalNote, getAllUsers, isLocalMode, getQuestionnaire, getSelfAssessment } = useLocalData();

  // Admin email for fallback checking
  const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';

  // Enhanced admin detection with multiple fallbacks
  const isUserAdmin = React.useMemo(() => {
    console.log('🔍 AdminPanel: Checking admin status', {
      isAdmin,
      adminLoading,
      currentUserEmail: currentUser?.email,
      directEmailCheck: currentUser?.email === ADMIN_EMAIL,
      timestamp: new Date().toISOString()
    });

    // Primary check: AdminContext
    if (!adminLoading && isAdmin) {
      console.log('✅ AdminPanel: Admin confirmed via AdminContext');
      return true;
    }

    // Fallback check: Direct email comparison
    if (currentUser?.email === ADMIN_EMAIL) {
      console.log('✅ AdminPanel: Admin confirmed via direct email check');
      return true;
    }

    console.log('❌ AdminPanel: Admin status not confirmed');
    return false;
  }, [isAdmin, adminLoading, currentUser?.email]);

  // ENHANCED DEBUG FUNCTIONS
  const debugStorageData = () => {
    console.log('🔍 DEBUG: Checking all localStorage data...');
    
    // Check individual keys (what admin panel creates)
    const individualKeys = [
      'questionnaireCompleted',
      'selfAssessmentCompleted', 
      'T1Sessions', 'T2Sessions', 'T3Sessions', 'T4Sessions', 'T5Sessions',
      't1Sessions', 't2Sessions', 't3Sessions', 't4Sessions', 't5Sessions', // lowercase versions
      'T1Complete', 'T2Complete', 'T3Complete', 'T4Complete', 'T5Complete',
      't1Complete', 't2Complete', 't3Complete', 't4Complete', 't5Complete', // lowercase versions
      'stage1Progress',
      'stage2Hours', 'stage3Hours', 'stage4Hours', 'stage5Hours', 'stage6Hours'
    ];
    
    console.log('📋 Individual Keys (Admin Panel format):');
    individualKeys.forEach(key => {
      const value = localStorage.getItem(key);
      try {
        console.log(`${key}:`, value ? JSON.parse(value) : null);
      } catch (e) {
        console.log(`${key}:`, value);
      }
    });
    
    // Check comprehensive data (what LocalDataContext expects)
    const comprehensiveKeys = [
      'comprehensiveUserData',
      'comprehensiveUserData_guest',
    ];
    
    console.log('📦 Comprehensive Data (LocalDataContext format):');
    comprehensiveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`${key}:`, {
            questionnaire: parsed.questionnaire?.completed,
            selfAssessment: parsed.selfAssessment?.completed,
            practiceSessionsCount: parsed.practiceSessions?.length,
            profile: parsed.profile
          });
        } catch (e) {
          console.log(`${key}: Parse error`, e);
        }
      } else {
        console.log(`${key}:`, null);
      }
    });
    
    // Check what Stage logic might be looking for
    console.log('🎯 Stage Logic Keys (useProgressiveOnboarding expects):');
    const stageKeys = ['t1Complete', 't2Complete', 't3Complete', 't4Complete', 't5Complete', 'Stage1Complete', 'Stage2Unlocked', 'currentStage'];
    stageKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`${key}:`, value);
    });
    
    // Check happiness calculation dependencies
    console.log('😊 Happiness Calculation Keys:');
    const happinessKeys = ['questionnaireAnswers', 'selfAssessmentData'];
    happinessKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          console.log(`${key}:`, Object.keys(parsed));
        } catch (e) {
          console.log(`${key}:`, value);
        }
      } else {
        console.log(`${key}:`, null);
      }
    });

    // NEW: Check user profile data from LocalDataContext
    console.log('👤 User Profile Data (LocalDataContext):');
    const questionnaire = getQuestionnaire();
    const selfAssessment = getSelfAssessment();
    console.log('Questionnaire from LocalDataContext:', questionnaire);
    console.log('Self-Assessment from LocalDataContext:', selfAssessment);
    
    window.alert('Debug data logged to console! Check browser console (F12) for detailed analysis.');
  };

  const forceSyncAdminDataToLocalDataContext = () => {
    console.log('🔄 FORCE SYNC: Converting admin data to LocalDataContext format...');
    
    try {
      const currentUser = { uid: 'guest' }; // Adjust based on your auth
      const storageKey = currentUser?.uid ? `comprehensiveUserData_${currentUser.uid}` : 'comprehensiveUserData';
      
      // Create comprehensive data structure
      const comprehensiveData = {
        profile: {
          userId: currentUser?.uid || 'guest',
          displayName: 'Admin Test User',
          email: 'admin@test.com',
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageQuality: 0,
          averagePresentPercentage: 0,
          totalMindRecoverySessions: 0,
          totalMindRecoveryMinutes: 0,
          averageMindRecoveryRating: 0
        },
        practiceSessions: [],
        emotionalNotes: [],
        reflections: [],
        questionnaire: null,
        selfAssessment: null,
        achievements: ['journey_started'],
        notes: [],
        analytics: {
          totalPracticeTime: 0,
          averageSessionLength: 0,
          consistencyScore: 0,
          progressTrend: 'stable',
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Convert questionnaire data
      const questionnaireCompleted = localStorage.getItem('questionnaireCompleted') === 'true';
      const questionnaireAnswers = localStorage.getItem('questionnaireAnswers');
      if (questionnaireCompleted && questionnaireAnswers) {
        try {
          const answers = JSON.parse(questionnaireAnswers);
          comprehensiveData.questionnaire = {
            completed: true,
            completedAt: new Date().toISOString(),
            responses: answers.answers || answers
          };
        } catch (e) {
          console.warn('Questionnaire data parse error:', e);
        }
      }
      
      // Convert self-assessment data
      const selfAssessmentCompleted = localStorage.getItem('selfAssessmentCompleted') === 'true';
      const selfAssessmentData = localStorage.getItem('selfAssessmentData');
      if (selfAssessmentCompleted && selfAssessmentData) {
        try {
          const assessment = JSON.parse(selfAssessmentData);
          comprehensiveData.selfAssessment = {
            completed: true,
            completedAt: new Date().toISOString(),
            // Support multiple formats
            taste: assessment.taste || 'none',
            smell: assessment.smell || 'none', 
            sound: assessment.sound || 'none',
            sight: assessment.sight || 'none',
            touch: assessment.touch || 'none',
            mind: assessment.mind || 'none',
            categories: assessment.categories || {},
            responses: assessment.responses || assessment.categories || {},
            attachmentScore: assessment.attachmentScore || 0,
            nonAttachmentCount: assessment.nonAttachmentCount || 0,
            metrics: assessment.metrics || {}
          };
        } catch (e) {
          console.warn('Self-assessment data parse error:', e);
        }
      }
      
      // Convert T-stage sessions - check both uppercase and lowercase
      ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(tLevel => {
        // Check both T1Sessions and t1Sessions
        const upperSessions = localStorage.getItem(`${tLevel}Sessions`);
        const lowerSessions = localStorage.getItem(`${tLevel.toLowerCase()}Sessions`);
        const sessions = upperSessions || lowerSessions;
        
        if (sessions) {
          try {
            const parsed = JSON.parse(sessions);
            parsed.forEach(session => {
              if (session.isCompleted) {
                comprehensiveData.practiceSessions.push({
                  sessionId: session.id || `sync_${Date.now()}_${Math.random()}`,
                  timestamp: session.timestamp || session.completedAt,
                  duration: session.duration,
                  sessionType: 'meditation',
                  stageLevel: parseInt(tLevel.substring(1)),
                  stageLabel: `${tLevel}: Physical Stillness Training`,
                  rating: session.rating || 8,
                  notes: session.notes || '',
                  presentPercentage: 85,
                  environment: {
                    posture: session.posture || 'seated',
                    location: 'indoor',
                    lighting: 'natural',
                    sounds: 'quiet'
                  },
                  pahmCounts: {
                    present_attachment: 0, present_neutral: 0, present_aversion: 0,
                    past_attachment: 0, past_neutral: 0, past_aversion: 0,
                    future_attachment: 0, future_neutral: 0, future_aversion: 0
                  }
                });
              }
            });
          } catch (e) {
            console.warn(`${tLevel} sessions parse error:`, e);
          }
        }
      });
      
      // Add emotional notes for admin sessions
      if (comprehensiveData.practiceSessions.length > 0) {
        comprehensiveData.emotionalNotes.push({
          noteId: `admin_note_${Date.now()}`,
          timestamp: new Date().toISOString(),
          content: `Admin generated test data: ${comprehensiveData.practiceSessions.length} practice sessions created`,
          emotion: 'accomplished',
          energyLevel: 8,
          tags: ['admin', 'test', 'data-sync']
        });
      }
      
      // Update profile stats
      const totalMinutes = comprehensiveData.practiceSessions.reduce((sum, s) => sum + s.duration, 0);
      const avgQuality = comprehensiveData.practiceSessions.length > 0 ? 
        comprehensiveData.practiceSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / comprehensiveData.practiceSessions.length : 0;
      
      comprehensiveData.profile.totalSessions = comprehensiveData.practiceSessions.length;
      comprehensiveData.profile.totalMinutes = totalMinutes;
      comprehensiveData.profile.averageQuality = Math.round(avgQuality * 10) / 10;
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(comprehensiveData));
      
      // Also save to legacy keys for compatibility
      localStorage.setItem('practiceHistory', JSON.stringify(comprehensiveData.practiceSessions));
      localStorage.setItem('emotionalNotes', JSON.stringify(comprehensiveData.emotionalNotes));
      
      // 🔥 CRITICAL FIX: Create BOTH uppercase and lowercase completion keys
      ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(tLevel => {
        const upperComplete = localStorage.getItem(`${tLevel}Complete`);
        const lowerComplete = localStorage.getItem(`${tLevel.toLowerCase()}Complete`);
        
        if (upperComplete === 'true' && !lowerComplete) {
          // Admin created uppercase, stage logic needs lowercase
          localStorage.setItem(`${tLevel.toLowerCase()}Complete`, 'true');
          console.log(`✅ Fixed case sensitivity: ${tLevel}Complete → ${tLevel.toLowerCase()}Complete`);
        }
      });
      
      console.log('✅ SYNC COMPLETE: Admin data converted to LocalDataContext format');
      console.log('📊 Synced data:', {
        questionnaire: comprehensiveData.questionnaire?.completed,
        selfAssessment: comprehensiveData.selfAssessment?.completed,
        practiceSessionsCount: comprehensiveData.practiceSessions.length,
        totalMinutes: comprehensiveData.profile.totalMinutes
      });
      
      window.alert('✅ Data sync complete! Fixed case sensitivity issues. Page will refresh to load new data format.');
      
      // Trigger page refresh to load new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ SYNC ERROR:', error);
      window.alert(`❌ Sync failed: ${error.message}`);
    }
  };

  // ✅ FIXED: Load user profile data with useCallback to prevent infinite re-renders
  const loadUserProfileData = useCallback(() => {
    try {
      const questionnaire = getQuestionnaire();
      const selfAssessment = getSelfAssessment();
      
      const profileData = {
        questionnaire: questionnaire,
        selfAssessment: selfAssessment,
        localStorage: {
          questionnaireCompleted: localStorage.getItem('questionnaireCompleted'),
          selfAssessmentCompleted: localStorage.getItem('selfAssessmentCompleted'),
          questionnaireAnswers: localStorage.getItem('questionnaireAnswers'),
          selfAssessmentData: localStorage.getItem('selfAssessmentData')
        },
        stageProgress: {
          // Check both uppercase and lowercase
          T1Complete: localStorage.getItem('T1Complete'),
          t1Complete: localStorage.getItem('t1Complete'),
          T5Complete: localStorage.getItem('T5Complete'),
          t5Complete: localStorage.getItem('t5Complete')
        }
      };
      
      setUserProfileData(profileData);
    } catch (error) {
      console.error('Error loading user profile data:', error);
    }
  }, [getQuestionnaire, getSelfAssessment]);

  // ✅ FIXED: Load session counts with useCallback
  const loadSessionCounts = useCallback(() => {
    const counts = {
      T1: 0, T2: 0, T3: 0, T4: 0, T5: 0
    };

    ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(tLevel => {
      try {
        // Check both uppercase and lowercase sessions
        const upperSessions = localStorage.getItem(`${tLevel}Sessions`);
        const lowerSessions = localStorage.getItem(`${tLevel.toLowerCase()}Sessions`);
        const sessionsData = upperSessions || lowerSessions;
        
        if (sessionsData) {
          const sessions = JSON.parse(sessionsData);
          counts[tLevel] = sessions.filter(s => s.isCompleted).length;
        }
      } catch (error) {
        console.warn(`Error loading ${tLevel} sessions:`, error);
      }
    });

    setSessionCounts(counts);
  }, []);

  // ✅ FIXED: Load PAHM progress with useCallback
  const loadPahmProgress = useCallback(() => {
    const progress = {
      stage2: { hours: 0, completed: false, name: 'PAHM Trainee' },
      stage3: { hours: 0, completed: false, name: 'PAHM Beginner' },
      stage4: { hours: 0, completed: false, name: 'PAHM Practitioner' },
      stage5: { hours: 0, completed: false, name: 'PAHM Master' },
      stage6: { hours: 0, completed: false, name: 'PAHM Illuminator' }
    };

    [2, 3, 4, 5, 6].forEach(stage => {
      try {
        const hours = parseFloat(localStorage.getItem(`stage${stage}Hours`) || '0');
        const completed = localStorage.getItem(`stage${stage}Complete`) === 'true';
        progress[`stage${stage}`] = {
          hours: Math.round(hours * 10) / 10, // Round to 1 decimal
          completed,
          name: progress[`stage${stage}`].name
        };
      } catch (error) {
        console.warn(`Error loading stage${stage} progress:`, error);
      }
    });

    setPahmProgress(progress);
  }, []);

  // ✅ FIXED: Load onboarding status with useCallback
  const loadOnboardingStatus = useCallback(() => {
    try {
      const status = {
        questionnaire: localStorage.getItem('questionnaireCompleted') === 'true',
        selfAssessment: localStorage.getItem('selfAssessmentCompleted') === 'true',
        introduction: localStorage.getItem('introductionCompleted') === 'true'
      };
      setOnboardingStatus(status);
    } catch (error) {
      console.warn('Error loading onboarding status:', error);
    }
  }, []);

  // Complete questionnaire (admin testing)
  const completeQuestionnaire = () => {
    try {
      const now = new Date().toISOString();
      
      // Set completion flag
      localStorage.setItem('questionnaireCompleted', 'true');
      localStorage.setItem('questionnaireCompletedAt', now);
      
      // Add realistic questionnaire data
      const questionnaireData = {
        completedAt: now,
        answers: {
          meditationExperience: 'beginner',
          dailyStress: 6,
          sleepQuality: 7,
          physicalActivity: 'moderate',
          goals: ['stress-reduction', 'better-sleep'],
          availableTime: '15-30-minutes',
          preferredTime: 'evening',
          challenges: ['restlessness', 'busy-mind']
        }
      };
      
      localStorage.setItem('questionnaireAnswers', JSON.stringify(questionnaireData));
      
      // Add emotional note
      addEmotionalNote({
        timestamp: now,
        content: 'Admin completed questionnaire for testing. Set up meditation profile and preferences.',
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['admin', 'test', 'questionnaire', 'onboarding']
      });

      console.log('✅ Admin: Questionnaire completed');
      loadOnboardingStatus();
      loadUserProfileData();
    } catch (error) {
      console.error('❌ Error completing questionnaire:', error);
    }
  };

  // Complete self-assessment (admin testing)
  const completeSelfAssessment = () => {
    try {
      const now = new Date().toISOString();
      
      // Set completion flag
      localStorage.setItem('selfAssessmentCompleted', 'true');
      localStorage.setItem('selfAssessmentCompletedAt', now);
      
      // Add realistic self-assessment data
      const assessmentData = {
        completedAt: now,
        scores: {
          mindfulness: 6,
          stressLevel: 7,
          emotionalBalance: 5,
          focus: 6,
          wellbeing: 7,
          happiness: 7
        },
        insights: {
          strengths: ['motivated', 'consistent'],
          challenges: ['overthinking', 'impatience'],
          goals: ['inner-peace', 'emotional-stability']
        }
      };
      
      localStorage.setItem('selfAssessmentData', JSON.stringify(assessmentData));
      
      // Add emotional note
      addEmotionalNote({
        timestamp: now,
        content: 'Admin completed self-assessment for testing. Established baseline mindfulness and wellbeing scores.',
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['admin', 'test', 'self-assessment', 'onboarding']
      });

      console.log('✅ Admin: Self-assessment completed');
      loadOnboardingStatus();
      loadUserProfileData();
    } catch (error) {
      console.error('❌ Error completing self-assessment:', error);
    }
  };

  // Complete introduction
  const completeIntroduction = () => {
    try {
      const now = new Date().toISOString();
      localStorage.setItem('introductionCompleted', 'true');
      localStorage.setItem('introductionCompletedAt', now);
      localStorage.setItem('hasSeenWelcome', 'true');
      
      console.log('✅ Admin: Introduction completed');
      loadOnboardingStatus();
    } catch (error) {
      console.error('❌ Error completing introduction:', error);
    }
  };

  // === TEST SCENARIOS FOR HAPPINESS POINTS ===
  
  // Scenario 1: Complete Beginner (~15-25 happiness points)
  const runScenario1 = () => {
    if (!window.confirm('Run Scenario 1: Complete Beginner (~15-25 happiness points)?')) return;

    try {
      const now = new Date().toISOString();
      
      // Clear existing data first
      clearAllProgress();
      
      setTimeout(() => {
        // 1. Complete basic questionnaire (beginner responses)
        localStorage.setItem('questionnaireCompleted', 'true');
        localStorage.setItem('questionnaireCompletedAt', now);
        const questionnaireData = {
          completedAt: now,
          responses: {
            experience_level: 2, // Low experience
            meditation_background: 'Never tried meditation',
            goals: ['stress-reduction'],
            sleep_pattern: 4, // Poor sleep
            physical_activity: 'sedentary',
            emotional_awareness: 3, // Low awareness
            stress_response: 'Get overwhelmed easily',
            mindfulness_experience: 1, // No experience
            social_connections: 'Mostly isolated',
            work_life_balance: 'Work dominates everything'
          }
        };
        localStorage.setItem('questionnaireAnswers', JSON.stringify(questionnaireData));

        // 2. Complete self-assessment (high attachment)
        localStorage.setItem('selfAssessmentCompleted', 'true');
        localStorage.setItem('selfAssessmentCompletedAt', now);
        const assessmentData = {
          taste: 'strong', smell: 'strong', sound: 'strong',
          sight: 'strong', touch: 'some', mind: 'strong',
          attachmentScore: -67, // High attachment
          nonAttachmentCount: 0,
          completed: true
        };
        localStorage.setItem('selfAssessmentData', JSON.stringify(assessmentData));

        // 3. Add 2 basic practice sessions
        const sessions = [
          {
            id: 'scenario1_session1',
            timestamp: now,
            duration: 5,
            targetDuration: 5,
            isCompleted: true,
            completedAt: now,
            tLevel: 't1',
            rating: 3,
            posture: 'seated',
            notes: 'Beginner session - struggled to focus'
          },
          {
            id: 'scenario1_session2', 
            timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            duration: 5,
            targetDuration: 10,
            isCompleted: false, // Incomplete session
            tLevel: 't1',
            rating: 2,
            posture: 'seated',
            notes: 'Had to stop early'
          }
        ];
        
        localStorage.setItem('T1Sessions', JSON.stringify(sessions));
        localStorage.setItem('stage1Progress', JSON.stringify({T1: 1, T2: 0, T3: 0, T4: 0, T5: 0}));

        // 4. Add to LocalDataContext
        sessions.forEach(session => {
          if (session.isCompleted) {
            const sessionData = {
              timestamp: session.timestamp,
              duration: session.duration,
              sessionType: 'meditation',
              stageLevel: 1,
              stageLabel: 'T1: Physical Stillness Training - Beginner',
              rating: session.rating,
              notes: session.notes,
              presentPercentage: 45, // Low present awareness
              environment: { posture: session.posture, location: 'indoor', lighting: 'natural', sounds: 'noisy' },
              pahmCounts: {
                present_attachment: 2, present_neutral: 3, present_aversion: 4,
                past_attachment: 8, past_neutral: 2, past_aversion: 6,
                future_attachment: 7, future_neutral: 1, future_aversion: 5
              }
            };
            addPracticeSession(sessionData);
          }
        });

        console.log('✅ Scenario 1 complete: Beginner with high attachment');
        window.alert('Scenario 1 loaded: Complete Beginner\nExpected: 15-25 happiness points\n\nFeatures:\n• Low meditation experience\n• High attachment (strong preferences)\n• Poor lifestyle factors\n• Minimal practice sessions\n• Low present-moment awareness');
        
        loadSessionCounts();
        loadPahmProgress();
        loadOnboardingStatus();
        loadUserProfileData();
      }, 1000);

    } catch (error) {
      console.error('❌ Error running Scenario 1:', error);
    }
  };

  // Scenario 2: Developing Practitioner (~45-55 happiness points)
  const runScenario2 = () => {
    if (!window.confirm('Run Scenario 2: Developing Practitioner (~45-55 happiness points)?')) return;

    try {
      const now = new Date().toISOString();
      
      // Clear existing data first
      clearAllProgress();
      
      setTimeout(() => {
        // 1. Complete balanced questionnaire (developing responses)
        localStorage.setItem('questionnaireCompleted', 'true');
        localStorage.setItem('questionnaireCompletedAt', now);
        const questionnaireData = {
          completedAt: now,
          responses: {
            experience_level: 5, // Some experience
            meditation_background: 'Some guided meditation experience',
            goals: ['stress-reduction', 'better-sleep', 'emotional-balance'],
            sleep_pattern: 6, // Decent sleep
            physical_activity: 'moderate',
            emotional_awareness: 6, // Good awareness
            stress_response: 'Usually manage well',
            mindfulness_experience: 4, // Some training
            social_connections: 'Few but close relationships',
            work_life_balance: 'Sometimes struggle but generally good',
            thought_patterns: 'Mixed emotions',
            self_reflection: 'Occasional deep thinking'
          }
        };
        localStorage.setItem('questionnaireAnswers', JSON.stringify(questionnaireData));

        // 2. Complete self-assessment (moderate attachment)
        localStorage.setItem('selfAssessmentCompleted', 'true');
        localStorage.setItem('selfAssessmentCompletedAt', now);
        const assessmentData = {
          taste: 'some', smell: 'none', sound: 'some',
          sight: 'some', touch: 'none', mind: 'some',
          attachmentScore: -21, // Moderate attachment
          nonAttachmentCount: 2,
          completed: true
        };
        localStorage.setItem('selfAssessmentData', JSON.stringify(assessmentData));

        // 3. Add multiple T1 sessions (developing practice)
        const t1Sessions = [];
        for (let i = 0; i < 8; i++) {
          const sessionDate = new Date(Date.now() - (i * 86400000 * 2)).toISOString();
          t1Sessions.push({
            id: `scenario2_t1_${i}`,
            timestamp: sessionDate,
            duration: 10 + (i * 2), // Gradually increasing duration
            targetDuration: 10,
            isCompleted: true,
            completedAt: sessionDate,
            tLevel: 't1',
            rating: 5 + (i % 3), // Varying quality
            posture: 'seated',
            notes: `Session ${i + 1} - Getting better at focusing`
          });
        }
        localStorage.setItem('T1Sessions', JSON.stringify(t1Sessions));
        localStorage.setItem('T1Complete', 'true');

        // Add some T2 sessions
        const t2Sessions = [];
        for (let i = 0; i < 5; i++) {
          const sessionDate = new Date(Date.now() - (i * 86400000)).toISOString();
          t2Sessions.push({
            id: `scenario2_t2_${i}`,
            timestamp: sessionDate,
            duration: 15,
            targetDuration: 15,
            isCompleted: true,
            completedAt: sessionDate,
            tLevel: 't2',
            rating: 6 + (i % 2),
            posture: 'seated',
            notes: `T2 session ${i + 1} - Building consistency`
          });
        }
        localStorage.setItem('T2Sessions', JSON.stringify(t2Sessions));
        localStorage.setItem('stage1Progress', JSON.stringify({T1: 8, T2: 5, T3: 0, T4: 0, T5: 0}));

        // 4. Add to LocalDataContext
        [...t1Sessions, ...t2Sessions].forEach(session => {
          const sessionData = {
            timestamp: session.timestamp,
            duration: session.duration,
            sessionType: 'meditation',
            stageLevel: session.tLevel === 't1' ? 1 : 2,
            stageLabel: `${session.tLevel.toUpperCase()}: Physical Stillness Training`,
            rating: session.rating,
            notes: session.notes,
            presentPercentage: 65 + Math.random() * 15, // Moderate present awareness
            environment: { posture: session.posture, location: 'indoor', lighting: 'natural', sounds: 'quiet' },
            pahmCounts: {
              present_attachment: 3, present_neutral: 8, present_aversion: 2,
              past_attachment: 4, past_neutral: 5, past_aversion: 3,
              future_attachment: 3, future_neutral: 6, future_aversion: 2
            }
          };
          addPracticeSession(sessionData);
        });

        console.log('✅ Scenario 2 complete: Developing practitioner');
        window.alert('Scenario 2 loaded: Developing Practitioner\nExpected: 45-55 happiness points\n\nFeatures:\n• Some meditation experience\n• Moderate attachment levels\n• Good lifestyle balance\n• Regular practice (13 sessions)\n• Improving present-moment awareness');
        
        loadSessionCounts();
        loadPahmProgress();
        loadOnboardingStatus();
        loadUserProfileData();
      }, 1000);

    } catch (error) {
      console.error('❌ Error running Scenario 2:', error);
    }
  };

  // Scenario 3: Advanced Practitioner (~75-85 happiness points)
  const runScenario3 = () => {
    if (!window.confirm('Run Scenario 3: Advanced Practitioner (~75-85 happiness points)?')) return;

    try {
      const now = new Date().toISOString();
      
      // Clear existing data first
      clearAllProgress();
      
      setTimeout(() => {
        // 1. Complete advanced questionnaire (optimal responses)
        localStorage.setItem('questionnaireCompleted', 'true');
        localStorage.setItem('questionnaireCompletedAt', now);
        const questionnaireData = {
          completedAt: now,
          responses: {
            experience_level: 9, // High experience
            meditation_background: 'Advanced Vipassana and Zen practice',
            goals: ['liberation', 'inner-peace', 'spiritual-growth'],
            sleep_pattern: 9, // Excellent sleep
            physical_activity: 'very_active',
            emotional_awareness: 9, // Very high awareness
            stress_response: 'Observe and let go',
            mindfulness_experience: 9, // Advanced
            social_connections: 'Deep, meaningful relationships',
            work_life_balance: 'Perfect integration of work and practice',
            thought_patterns: 'Peaceful and accepting',
            self_reflection: 'Daily meditation and contemplation',
            mindfulness_in_daily_life: 'Constant awareness and presence',
            decision_making: 'Intuitive with mindful consideration',
            motivation: 'Service to others and spiritual awakening'
          }
        };
        localStorage.setItem('questionnaireAnswers', JSON.stringify(questionnaireData));

        // 2. Complete self-assessment (very low attachment)
        localStorage.setItem('selfAssessmentCompleted', 'true');
        localStorage.setItem('selfAssessmentCompletedAt', now);
        const assessmentData = {
          taste: 'none', smell: 'none', sound: 'none',
          sight: 'none', touch: 'some', mind: 'none',
          attachmentScore: -7, // Very low attachment
          nonAttachmentCount: 5,
          completed: true
        };
        localStorage.setItem('selfAssessmentData', JSON.stringify(assessmentData));

        // 3. Add extensive practice sessions (all T-levels complete)
        const allSessions = [];
        
        // Complete T1-T5 with high quality
        ['T1', 'T2', 'T3', 'T4', 'T5'].forEach((tLevel, levelIndex) => {
          const sessions = [];
          const numSessions = 6 + levelIndex; // Increasing sessions per level
          const baseDuration = 10 + (levelIndex * 5); // Increasing duration
          
          for (let i = 0; i < numSessions; i++) {
            const sessionDate = new Date(Date.now() - ((levelIndex * 10 + i) * 86400000 / 2)).toISOString();
            const session = {
              id: `scenario3_${tLevel.toLowerCase()}_${i}`,
              timestamp: sessionDate,
              duration: baseDuration + Math.floor(Math.random() * 5),
              targetDuration: baseDuration,
              isCompleted: true,
              completedAt: sessionDate,
              tLevel: tLevel.toLowerCase(),
              rating: 8 + Math.floor(Math.random() * 2), // High ratings
              posture: 'seated',
              notes: `Advanced ${tLevel} practice - Deep concentration`
            };
            sessions.push(session);
            allSessions.push(session);
          }
          
          localStorage.setItem(`${tLevel}Sessions`, JSON.stringify(sessions));
          // 🔥 CRITICAL FIX: Set both uppercase and lowercase completion flags
          localStorage.setItem(`${tLevel}Complete`, 'true');
          localStorage.setItem(`${tLevel.toLowerCase()}Complete`, 'true');
        });

        // Add PAHM stage sessions
        [2, 3, 4].forEach(stage => {
          const hours = 15 + Math.random() * 5; // Complete + extra
          localStorage.setItem(`stage${stage}Hours`, hours.toString());
          localStorage.setItem(`stage${stage}Complete`, 'true');
          localStorage.setItem(`stage${stage}LastCompleted`, now);
        });

        localStorage.setItem('stage1Progress', JSON.stringify({T1: 6, T2: 7, T3: 8, T4: 9, T5: 10}));

        // 4. Add to LocalDataContext
        allSessions.forEach(session => {
          const sessionData = {
            timestamp: session.timestamp,
            duration: session.duration,
            sessionType: 'meditation',
            stageLevel: ['t1', 't2', 't3', 't4', 't5'].indexOf(session.tLevel) + 1,
            stageLabel: `${session.tLevel.toUpperCase()}: Physical Stillness Training - Advanced`,
            rating: session.rating,
            notes: session.notes,
            presentPercentage: 85 + Math.random() * 10, // High present awareness
            environment: { posture: session.posture, location: 'indoor', lighting: 'natural', sounds: 'quiet' },
            pahmCounts: {
              present_attachment: 1, present_neutral: 15, present_aversion: 1,
              past_attachment: 1, past_neutral: 8, past_aversion: 1,
              future_attachment: 1, future_neutral: 6, future_aversion: 0
            }
          };
          addPracticeSession(sessionData);
        });

        // Add PAHM sessions
        for (let i = 0; i < 10; i++) {
          const sessionDate = new Date(Date.now() - (i * 86400000)).toISOString();
          const sessionData = {
            timestamp: sessionDate,
            duration: 45 + Math.random() * 15,
            sessionType: 'meditation',
            stageLevel: 2,
            stageLabel: 'Stage 2: PAHM Trainee - Advanced Practice',
            rating: 9,
            notes: 'Advanced PAHM practice with excellent present-moment awareness',
            presentPercentage: 90 + Math.random() * 8,
            environment: { posture: 'seated', location: 'indoor', lighting: 'natural', sounds: 'quiet' },
            pahmCounts: {
              present_attachment: 0, present_neutral: 20, present_aversion: 0,
              past_attachment: 1, past_neutral: 3, past_aversion: 0,
              future_attachment: 0, future_neutral: 2, future_aversion: 0
            }
          };
          addPracticeSession(sessionData);
        }

        console.log('✅ Scenario 3 complete: Advanced practitioner');
        window.alert('Scenario 3 loaded: Advanced Practitioner\nExpected: 75-85 happiness points\n\nFeatures:\n• Extensive meditation experience\n• Very low attachment (high non-attachment)\n• Optimal lifestyle integration\n• Complete T-stage progression (40+ sessions)\n• PAHM stage completion\n• Excellent present-moment awareness');
        
        loadSessionCounts();
        loadPahmProgress();
        loadOnboardingStatus();
        loadUserProfileData();
      }, 1000);

    } catch (error) {
      console.error('❌ Error running Scenario 3:', error);
    }
  };

  // Clear onboarding status
  const clearOnboardingStatus = () => {
    if (!window.confirm('Clear all onboarding progress (questionnaire, self-assessment, introduction)?')) return;

    try {
      // Clear completion flags
      localStorage.removeItem('questionnaireCompleted');
      localStorage.removeItem('questionnaireCompletedAt');
      localStorage.removeItem('questionnaireAnswers');
      localStorage.removeItem('selfAssessmentCompleted');
      localStorage.removeItem('selfAssessmentCompletedAt');
      localStorage.removeItem('selfAssessmentData');
      localStorage.removeItem('introductionCompleted');
      localStorage.removeItem('introductionCompletedAt');
      localStorage.removeItem('hasSeenWelcome');

      console.log('✅ Admin: Onboarding status cleared');
      loadOnboardingStatus();
      loadUserProfileData();
    } catch (error) {
      console.error('❌ Error clearing onboarding status:', error);
    }
  };

  // 🔥 FIXED: Fast forward function with proper case sensitivity
  const fastForwardSession = (tLevel) => {
    try {
      const now = new Date().toISOString();
      const durations = { T1: 10, T2: 15, T3: 20, T4: 25, T5: 30 };
      const duration = durations[tLevel] || 10;

      // 1. Create session object compatible with Stage1Wrapper
      const sessionObject = {
        id: `admin_session_${Date.now()}`,
        timestamp: now,
        duration: duration,
        targetDuration: duration,
        isCompleted: true,
        completedAt: now,
        tLevel: tLevel.toLowerCase(),
        rating: 8,
        posture: 'seated',
        notes: 'Admin fast-forward session',
        metadata: { adminGenerated: true }
      };

      // 2. Update localStorage immediately
      const existingSessions = JSON.parse(localStorage.getItem(`${tLevel}Sessions`) || '[]');
      existingSessions.push(sessionObject);
      localStorage.setItem(`${tLevel}Sessions`, JSON.stringify(existingSessions));

      // 🔥 CRITICAL FIX: Set BOTH uppercase and lowercase completion status
      localStorage.setItem(`${tLevel}Complete`, 'true');
      localStorage.setItem(`${tLevel.toLowerCase()}Complete`, 'true'); // This is what useProgressiveOnboarding expects!
      localStorage.setItem(`${tLevel}LastCompleted`, now);

      // 4. Update stage1Progress
      const existingProgress = JSON.parse(localStorage.getItem('stage1Progress') || '{"T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0}');
      existingProgress[tLevel] = existingSessions.filter(s => s.isCompleted).length;
      localStorage.setItem('stage1Progress', JSON.stringify(existingProgress));

      // 5. Add to LocalDataContext
      const enhancedSessionData = {
        timestamp: now,
        duration: duration,
        sessionType: 'meditation',
        stageLevel: parseInt(tLevel.substring(1)),
        stageLabel: `${tLevel}: Physical Stillness Training - Admin Test`,
        rating: 8,
        notes: `Admin fast-forward session for ${tLevel}`,
        presentPercentage: 85,
        environment: {
          posture: 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 0,
          present_neutral: 0,
          present_aversion: 0,
          past_attachment: 0,
          past_neutral: 0,
          past_aversion: 0,
          future_attachment: 0,
          future_neutral: 0,
          future_aversion: 0
        }
      };

      addPracticeSession(enhancedSessionData);

      // 6. Add emotional note
      addEmotionalNote({
        timestamp: now,
        content: `Admin generated ${tLevel} session for testing purposes.`,
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['admin', 'test', tLevel.toLowerCase(), 't-level']
      });

      // 7. Dispatch events for UI updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${tLevel}Sessions`,
        newValue: JSON.stringify(existingSessions),
        storageArea: localStorage
      }));

      window.dispatchEvent(new CustomEvent('sessionUpdate', {
        detail: { tLevel: tLevel, completed: true }
      }));

      console.log(`✅ Admin fast-forward: ${tLevel} session added (set both ${tLevel}Complete and ${tLevel.toLowerCase()}Complete)`);
      
      // Reload counts and profile data
      loadSessionCounts();
      loadUserProfileData();

    } catch (error) {
      console.error(`❌ Error fast-forwarding ${tLevel}:`, error);
      window.alert(`Error adding ${tLevel} session: ${error.message}`);
    }
  };

  // Add individual PAHM session (like UniversalPAHMTimer does)
  const addPahmSession = (stage, durationMinutes = 30) => {
    try {
      const now = new Date().toISOString();
      const stageNames = {
        2: 'PAHM Trainee',
        3: 'PAHM Beginner', 
        4: 'PAHM Practitioner',
        5: 'PAHM Master',
        6: 'PAHM Illuminator'
      };

      // Calculate hours to add
      const hoursToAdd = durationMinutes / 60;
      
      // Update stage hours
      const currentHours = parseFloat(localStorage.getItem(`stage${stage}Hours`) || '0');
      const newTotalHours = currentHours + hoursToAdd;
      localStorage.setItem(`stage${stage}Hours`, newTotalHours.toString());
      
      // Check if stage is now complete
      const isCompleted = newTotalHours >= 15;
      if (isCompleted) {
        localStorage.setItem(`stage${stage}Complete`, 'true');
        localStorage.setItem(`stage${stage}LastCompleted`, now);
      }

      // Create realistic PAHM session data (like UniversalPAHMTimer)
      const sessionData = {
        timestamp: now,
        duration: durationMinutes,
        sessionType: 'meditation',
        stageLevel: stage,
        stageLabel: `Stage ${stage}: ${stageNames[stage]} - Admin Session`,
        rating: Math.floor(Math.random() * 3) + 7, // 7-9 rating
        notes: `Admin generated ${durationMinutes}-minute Stage ${stage} PAHM session. Total progress: ${newTotalHours.toFixed(1)}/15 hours.`,
        presentPercentage: Math.floor(Math.random() * 30) + 70, // 70-100%
        environment: {
          posture: 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: Math.floor(Math.random() * 8),
          present_neutral: Math.floor(Math.random() * 12) + 8,
          present_aversion: Math.floor(Math.random() * 5),
          past_attachment: Math.floor(Math.random() * 6),
          past_neutral: Math.floor(Math.random() * 8),
          past_aversion: Math.floor(Math.random() * 4),
          future_attachment: Math.floor(Math.random() * 7),
          future_neutral: Math.floor(Math.random() * 6),
          future_aversion: Math.floor(Math.random() * 5)
        }
      };

      // Add to LocalDataContext (like real sessions)
      addPracticeSession(sessionData);

      // Add emotional note
      addEmotionalNote({
        timestamp: now,
        content: `Completed ${durationMinutes}-minute Stage ${stage} session. Practicing ${stageNames[stage]} techniques with mindful attention. Total: ${newTotalHours.toFixed(1)}/15 hours.`,
        emotion: 'accomplished',
        energyLevel: Math.floor(Math.random() * 3) + 7,
        tags: ['admin', 'test', `stage${stage}`, 'pahm', 'meditation']
      });

      console.log(`✅ Admin PAHM session: ${durationMinutes}min Stage ${stage}. Total: ${newTotalHours.toFixed(1)} hours`);
      
      // Reload progress
      loadPahmProgress();

    } catch (error) {
      console.error(`❌ Error adding Stage ${stage} session:`, error);
      window.alert(`Error adding Stage ${stage} session: ${error.message}`);
    }
  };

  // Fast forward PAHM stage hours (bulk addition)
  const fastForwardPahmHours = (stage, hours = 1) => {
    try {
      const currentHours = parseFloat(localStorage.getItem(`stage${stage}Hours`) || '0');
      const newHours = currentHours + hours;
      const isCompleted = newHours >= 15;

      // Update hours
      localStorage.setItem(`stage${stage}Hours`, newHours.toString());
      
      // Update completion status
      if (isCompleted) {
        localStorage.setItem(`stage${stage}Complete`, 'true');
        localStorage.setItem(`stage${stage}LastCompleted`, new Date().toISOString());
      }

      // Add practice session to LocalDataContext
      const now = new Date().toISOString();
      const sessionData = {
        timestamp: now,
        duration: hours * 60, // Convert hours to minutes
        sessionType: 'meditation',
        stageLevel: stage,
        stageLabel: `Stage ${stage}: ${pahmProgress[`stage${stage}`].name} - Admin Bulk Hours`,
        rating: 8,
        notes: `Admin fast-forward: ${hours} hour(s) added to Stage ${stage}`,
        presentPercentage: 85,
        environment: {
          posture: 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 0,
          present_neutral: 0,
          present_aversion: 0,
          past_attachment: 0,
          past_neutral: 0,
          past_aversion: 0,
          future_attachment: 0,
          future_neutral: 0,
          future_aversion: 0
        }
      };

      addPracticeSession(sessionData);

      // Add emotional note
      addEmotionalNote({
        timestamp: now,
        content: `Admin added ${hours} hour(s) to Stage ${stage} (${pahmProgress[`stage${stage}`].name}). Total: ${newHours.toFixed(1)}/15 hours.`,
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['admin', 'test', `stage${stage}`, 'pahm']
      });

      console.log(`✅ Admin fast-forward: Added ${hours} hour(s) to Stage ${stage}. Total: ${newHours.toFixed(1)} hours`);
      
      // Reload progress
      loadPahmProgress();

    } catch (error) {
      console.error(`❌ Error fast-forwarding Stage ${stage}:`, error);
      window.alert(`Error adding hours to Stage ${stage}: ${error.message}`);
    }
  };

  // Auto-complete T-level (3 sessions)
  const autoCompleteLevel = (tLevel) => {
    if (!window.confirm(`Add 3 completed sessions for ${tLevel}?`)) return;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => fastForwardSession(tLevel), i * 100);
    }
  };

  // Auto-complete PAHM stage (add 15 hours)
  const autoCompletePahmStage = (stage) => {
    if (!window.confirm(`Complete Stage ${stage} (${pahmProgress[`stage${stage}`].name}) with 15 hours?`)) return;

    try {
      const currentHours = parseFloat(localStorage.getItem(`stage${stage}Hours`) || '0');
      const hoursNeeded = Math.max(0, 15 - currentHours);
      
      if (hoursNeeded > 0) {
        fastForwardPahmHours(stage, hoursNeeded);
      } else {
        window.alert(`Stage ${stage} is already complete with ${currentHours} hours!`);
      }
    } catch (error) {
      console.error(`❌ Error auto-completing Stage ${stage}:`, error);
    }
  };

  // Clear PAHM stage progress
  const clearPahmStage = (stage) => {
    if (!window.confirm(`Clear all Stage ${stage} progress (${pahmProgress[`stage${stage}`].name})?`)) return;

    try {
      localStorage.removeItem(`stage${stage}Hours`);
      localStorage.removeItem(`stage${stage}Complete`);
      localStorage.removeItem(`stage${stage}LastCompleted`);

      console.log(`✅ Admin: Stage ${stage} progress cleared`);
      loadPahmProgress();
    } catch (error) {
      console.error(`❌ Error clearing Stage ${stage}:`, error);
    }
  };

  // 🔥 ENHANCED: Clear all progress with case sensitivity fixes
  const clearAllProgress = () => {
    if (!window.confirm('Are you sure you want to clear ALL session progress (T-stages + PAHM stages + onboarding)? This cannot be undone.')) {
      return;
    }

    try {
      // Clear T-stages (both uppercase and lowercase)
      ['T1', 'T2', 'T3', 'T4', 'T5'].forEach(tLevel => {
        localStorage.removeItem(`${tLevel}Sessions`);
        localStorage.removeItem(`${tLevel.toLowerCase()}Sessions`);
        localStorage.removeItem(`${tLevel}Complete`);
        localStorage.removeItem(`${tLevel.toLowerCase()}Complete`);
        localStorage.removeItem(`${tLevel}LastCompleted`);
        localStorage.removeItem(`${tLevel.toLowerCase()}LastCompleted`);
      });

      // Clear PAHM stages
      [2, 3, 4, 5, 6].forEach(stage => {
        localStorage.removeItem(`stage${stage}Hours`);
        localStorage.removeItem(`stage${stage}Complete`);
        localStorage.removeItem(`stage${stage}LastCompleted`);
      });

      // Clear onboarding data
      localStorage.removeItem('questionnaireCompleted');
      localStorage.removeItem('questionnaireCompletedAt');
      localStorage.removeItem('questionnaireAnswers');
      localStorage.removeItem('selfAssessmentCompleted');
      localStorage.removeItem('selfAssessmentCompletedAt');
      localStorage.removeItem('selfAssessmentData');
      localStorage.removeItem('introductionCompleted');
      localStorage.removeItem('introductionCompletedAt');
      localStorage.removeItem('hasSeenWelcome');

      // Clear other progress data
      localStorage.removeItem('stage1Progress');
      localStorage.removeItem('practiceHistory');
      localStorage.removeItem('comprehensiveUserData');
      localStorage.removeItem('comprehensiveUserData_guest');

      console.log('✅ Admin: All progress cleared (T-stages + PAHM + onboarding + comprehensive data)');
      window.alert('All session progress has been cleared (T-stages + PAHM stages + onboarding)!');
      
      loadSessionCounts();
      loadPahmProgress();
      loadOnboardingStatus();
      loadUserProfileData();
    } catch (error) {
      console.error('❌ Error clearing progress:', error);
      window.alert(`Error clearing progress: ${error.message}`);
    }
  };

  // 🔥 FIXED: Clear specific T-level with case sensitivity
  const clearTLevel = (tLevel) => {
    if (!window.confirm(`Clear all ${tLevel} progress?`)) return;

    try {
      // Clear both uppercase and lowercase versions
      localStorage.removeItem(`${tLevel}Sessions`);
      localStorage.removeItem(`${tLevel.toLowerCase()}Sessions`);
      localStorage.removeItem(`${tLevel}Complete`);
      localStorage.removeItem(`${tLevel.toLowerCase()}Complete`);
      localStorage.removeItem(`${tLevel}LastCompleted`);
      localStorage.removeItem(`${tLevel.toLowerCase()}LastCompleted`);

      // Update stage1Progress
      const existingProgress = JSON.parse(localStorage.getItem('stage1Progress') || '{"T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0}');
      existingProgress[tLevel] = 0;
      localStorage.setItem('stage1Progress', JSON.stringify(existingProgress));

      console.log(`✅ Admin: ${tLevel} progress cleared (both upper and lowercase)`);
      loadSessionCounts();
      loadUserProfileData();
    } catch (error) {
      console.error(`❌ Error clearing ${tLevel}:`, error);
    }
  };

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      console.log('🚪 Admin logout initiated');
      
      if (logout) {
        await logout();
      } else if (currentUser?.signOut) {
        await currentUser.signOut();
      } else {
        const { getAuth, signOut } = await import('firebase/auth');
        const auth = getAuth();
        await signOut(auth);
      }
      
      setIsExpanded(false);
      console.log('✅ Admin logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      window.alert('Logout failed. Please try again.');
    }
  };

  // ✅ FIXED: Load admin data with proper dependencies
  useEffect(() => {
    if (!isUserAdmin) {
      setIsLoading(false);
      return;
    }

    const loadAdminData = async () => {
      try {
        console.log('📊 AdminPanel: Loading admin data...');
        setIsLoading(true);

        if (isLocalMode && getAllUsers) {
          const allUsers = getAllUsers();
          const userData = Object.values(allUsers).map((user) => {
            return {
              uid: String(user.uid || ''),
              email: String(user.email || ''),
              displayName: String(user.displayName || 'Unknown'),
              happiness_points: Number(user.happiness_points) || 0,
              user_level: String(user.user_level || 'Seeker'),
              questionnaireCompleted: Boolean(user.questionnaireCompleted),
              assessmentCompleted: Boolean(user.assessmentCompleted),
              lastLogin: String(user.lastLogin || new Date().toISOString()),
              joinDate: String(user.joinDate || new Date().toISOString()),
              questionnaireAnswers: user.questionnaireAnswers || {},
              selfAssessmentData: user.selfAssessmentData || {}
            };
          });

          setUsers(userData);

          const totalUsers = userData.length;
          const activeUsers = userData.filter(user => {
            const lastLogin = new Date(user.lastLogin);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return lastLogin > weekAgo;
          }).length;

          const averageHappiness = totalUsers > 0 
            ? userData.reduce((sum, user) => sum + user.happiness_points, 0) / totalUsers 
            : 0;

          const completedAssessments = userData.filter(user => 
            user.questionnaireCompleted && user.assessmentCompleted
          ).length;

          setStats({
            totalUsers,
            activeUsers,
            averageHappiness: Math.round(averageHappiness),
            completedAssessments
          });

          console.log('✅ AdminPanel: Data loaded successfully');
        }

        // Load session counts for testing tools
        loadSessionCounts();
        loadPahmProgress();
        loadOnboardingStatus();
        loadUserProfileData();

      } catch (error) {
        console.error('❌ AdminPanel: Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isUserAdmin, isLocalMode, getAllUsers, loadSessionCounts, loadPahmProgress, loadOnboardingStatus, loadUserProfileData]);

  // ✅ FIXED: Auto-refresh with proper dependencies
  useEffect(() => {
    if (!isUserAdmin) return;

    const interval = setInterval(() => {
      loadSessionCounts();
      loadPahmProgress();
      loadOnboardingStatus();
      loadUserProfileData();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [isUserAdmin, loadSessionCounts, loadPahmProgress, loadOnboardingStatus, loadUserProfileData]);

  // Don't render if not admin and not loading
  if (!adminLoading && !isUserAdmin) {
    if (debugMode) {
      return (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#FFA500',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 1000,
          border: '2px solid #FF8C00'
        }}>
          ⚠️ Admin Debug
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Current: {currentUser?.email || 'No user'}<br/>
            Admin Context: {String(isAdmin)}<br/>
            Loading: {String(adminLoading)}
          </div>
        </div>
      );
    }
    return null;
  }

  // Show loading state
  if (adminLoading || isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 1000
      }}>
        ⏳ Loading Admin...
      </div>
    );
  }

  // Render admin panel
  return (
    <>
      {/* Admin Toggle Button */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚙️</span>
          <span>Admin</span>
          <span style={{ 
            fontSize: '12px',
            opacity: 0.8,
            marginLeft: '4px'
          }}>
            ({stats.totalUsers} users)
          </span>
        </button>
      </div>

      {/* Admin Panel */}
      {isExpanded && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          width: '700px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          zIndex: 999,
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Header with Logout Button */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>
              🛠️ Admin Dashboard
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background 0.2s'
                }}
                title="Logout Admin"
              >
                🚪 Logout
              </button>
              
              <button
                onClick={() => setDebugMode(!debugMode)}
                style={{
                  background: debugMode ? '#FFA500' : 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {debugMode ? 'Debug ON' : 'Debug'}
              </button>
              
              <button
                onClick={() => setIsExpanded(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '24px',
                  height: '24px'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0'
          }}>
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'users', label: '👥 Users' },
              { id: 'analytics', label: '📈 Analytics' },
              { id: 'profile', label: '👤 Profile' },
              { id: 'testing', label: '🧪 Testing' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  background: activeTab === tab.id ? '#f8fafc' : 'white',
                  color: activeTab === tab.id ? '#667eea' : '#4a5568',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #667eea' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{
            padding: '20px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {activeTab === 'overview' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                      {stats.totalUsers}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Total Users</div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                      {stats.activeUsers}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Active Users</div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F59E0B' }}>
                      {stats.averageHappiness}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Avg Happiness</div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '15px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B5CF6' }}>
                      {stats.completedAssessments}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4a5568' }}>Completed</div>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <strong>System Status:</strong>
                  <div style={{ marginTop: '8px', lineHeight: '1.5' }}>
                    🟢 Database: {isLocalMode ? 'Local Storage' : 'Firebase'}<br/>
                    🟢 Authentication: Active<br/>
                    🟢 Admin Panel: Operational
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div style={{ marginBottom: '15px', fontSize: '14px', color: '#4a5568' }}>
                  <strong>{users.length} Registered Users</strong>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {users.map((user, index) => (
                    <div key={user.uid || index} style={{
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {user.displayName || 'Unknown User'}
                      </div>
                      <div style={{ color: '#666', fontSize: '12px' }}>
                        📧 {user.email}<br/>
                        🎯 {user.happiness_points} points ({user.user_level})<br/>
                        ✅ Q: {user.questionnaireCompleted ? 'Yes' : 'No'} | 
                        A: {user.assessmentCompleted ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    📊 Happiness Distribution
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    {users.length > 0 ? (
                      <>
                        🟢 High (400+): {users.filter(u => u.happiness_points >= 400).length} users<br/>
                        🟡 Medium (100-399): {users.filter(u => u.happiness_points >= 100 && u.happiness_points < 400).length} users<br/>
                        🔴 Low (0-99): {users.filter(u => u.happiness_points < 100).length} users
                      </>
                    ) : (
                      'No user data available'
                    )}
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    📈 Completion Rates
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    Questionnaire: {users.length > 0 ? Math.round((users.filter(u => u.questionnaireCompleted).length / users.length) * 100) : 0}%<br/>
                    Self-Assessment: {users.length > 0 ? Math.round((users.filter(u => u.assessmentCompleted).length / users.length) * 100) : 0}%<br/>
                    Both Complete: {users.length > 0 ? Math.round((stats.completedAssessments / users.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <div style={{
                  background: '#f3e8ff',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #8b5cf6'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#7c3aed' }}>
                    👤 User Profile Data (LocalDataContext)
                  </div>
                  
                  <button
                    onClick={loadUserProfileData}
                    style={{
                      background: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      marginBottom: '15px'
                    }}
                  >
                    🔄 Refresh Profile Data
                  </button>

                  {userProfileData && (
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', background: 'white', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Questionnaire Status:</strong><br/>
                        LocalDataContext: {userProfileData.questionnaire ? '✅ Loaded' : '❌ Not loaded'}<br/>
                        localStorage Flag: {userProfileData.localStorage.questionnaireCompleted || 'null'}<br/>
                        Data Present: {userProfileData.localStorage.questionnaireAnswers ? '✅ Yes' : '❌ No'}
                      </div>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Self-Assessment Status:</strong><br/>
                        LocalDataContext: {userProfileData.selfAssessment ? '✅ Loaded' : '❌ Not loaded'}<br/>
                        localStorage Flag: {userProfileData.localStorage.selfAssessmentCompleted || 'null'}<br/>
                        Data Present: {userProfileData.localStorage.selfAssessmentData ? '✅ Yes' : '❌ No'}
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <strong>🔥 Stage Completion Flags (Case Sensitivity Check):</strong><br/>
                        T5Complete (uppercase): {userProfileData.stageProgress.T5Complete || 'null'}<br/>
                        t5Complete (lowercase): {userProfileData.stageProgress.t5Complete || 'null'}<br/>
                        <span style={{ color: userProfileData.stageProgress.t5Complete === 'true' ? 'green' : 'red', fontWeight: 'bold' }}>
                          {userProfileData.stageProgress.t5Complete === 'true' ? 
                            '✅ Stage 2 should be unlocked!' : 
                            '❌ Stage 2 locked - needs t5Complete=true'}
                        </span>
                      </div>

                      {userProfileData.questionnaire && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Questionnaire Data:</strong><br/>
                          Completed: {userProfileData.questionnaire.completed ? '✅' : '❌'}<br/>
                          Response Count: {userProfileData.questionnaire.responses ? Object.keys(userProfileData.questionnaire.responses).length : 0}
                        </div>
                      )}

                      {userProfileData.selfAssessment && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Self-Assessment Data:</strong><br/>
                          Completed: {userProfileData.selfAssessment.completed ? '✅' : '❌'}<br/>
                          Attachment Score: {userProfileData.selfAssessment.attachmentScore || 0}<br/>
                          Non-Attachment Count: {userProfileData.selfAssessment.nonAttachmentCount || 0}
                        </div>
                      )}
                    </div>
                  )}

                  {!userProfileData && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      Click "Refresh Profile Data" to load current user profile information
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'testing' && (
              <div>
                {/* === DEBUG STORAGE DATA === */}
                <div style={{
                  background: '#f0f0f0',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #666'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#333' }}>
                    🔍 Debug Storage Data (Fix Data Mismatch Issues)
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    Check if admin data format matches what the app expects for stage progression and happiness points
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <button
                      onClick={debugStorageData}
                      style={{
                        background: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔍 Debug All Storage Data
                    </button>
                    
                    <button
                      onClick={forceSyncAdminDataToLocalDataContext}
                      style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      🔄 Force Sync Admin Data
                    </button>
                  </div>
                  
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    <strong>💡 How to debug:</strong><br/>
                    1. <strong>Debug All Storage Data:</strong> Logs all localStorage keys to console - check for format mismatches<br/>
                    2. <strong>Force Sync Admin Data:</strong> Converts admin panel data to LocalDataContext format and <strong>fixes case sensitivity issues</strong><br/>
                    3. After sync, check if Stage 2 unlocks and happiness points appear<br/>
                    4. 🔥 This version specifically fixes <code>T5Complete → t5Complete</code> case sensitivity
                  </div>
                </div>

                {/* === ONBOARDING STATUS === */}
                <div style={{
                  background: '#fff7ed',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #fb923c'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#ea580c' }}>
                    📋 Onboarding Status (For Stage Unlocking & Happiness Tracking)
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '10px',
                    fontSize: '14px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ 
                      textAlign: 'center',
                      padding: '8px',
                      background: onboardingStatus.questionnaire ? '#dcfce7' : 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Questionnaire</div>
                      <div style={{ fontSize: '18px', color: onboardingStatus.questionnaire ? '#16a34a' : '#6b7280' }}>
                        {onboardingStatus.questionnaire ? '✅' : '❌'}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {onboardingStatus.questionnaire ? 'Complete' : 'Pending'}
                      </div>
                    </div>

                    <div style={{ 
                      textAlign: 'center',
                      padding: '8px',
                      background: onboardingStatus.selfAssessment ? '#dcfce7' : 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Self-Assessment</div>
                      <div style={{ fontSize: '18px', color: onboardingStatus.selfAssessment ? '#16a34a' : '#6b7280' }}>
                        {onboardingStatus.selfAssessment ? '✅' : '❌'}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {onboardingStatus.selfAssessment ? 'Complete' : 'Pending'}
                      </div>
                    </div>

                    <div style={{ 
                      textAlign: 'center',
                      padding: '8px',
                      background: onboardingStatus.introduction ? '#dcfce7' : 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>Introduction</div>
                      <div style={{ fontSize: '18px', color: onboardingStatus.introduction ? '#16a34a' : '#6b7280' }}>
                        {onboardingStatus.introduction ? '✅' : '❌'}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {onboardingStatus.introduction ? 'Complete' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#ea580c', marginBottom: '10px' }}>
                    Complete onboarding components:
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    <button
                      onClick={completeQuestionnaire}
                      disabled={onboardingStatus.questionnaire}
                      style={{
                        background: onboardingStatus.questionnaire ? '#d1d5db' : '#fb923c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: onboardingStatus.questionnaire ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Complete Questionnaire
                    </button>
                    
                    <button
                      onClick={completeSelfAssessment}
                      disabled={onboardingStatus.selfAssessment}
                      style={{
                        background: onboardingStatus.selfAssessment ? '#d1d5db' : '#fb923c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: onboardingStatus.selfAssessment ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Complete Assessment
                    </button>

                    <button
                      onClick={completeIntroduction}
                      disabled={onboardingStatus.introduction}
                      style={{
                        background: onboardingStatus.introduction ? '#d1d5db' : '#fb923c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: onboardingStatus.introduction ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Complete Introduction
                    </button>
                  </div>

                  <button
                    onClick={clearOnboardingStatus}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    Clear All Onboarding
                  </button>
                </div>

                {/* === HAPPINESS TESTING SCENARIOS === */}
                <div style={{
                  background: '#f3e8ff',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #8b5cf6'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#7c3aed' }}>
                    🎯 Happiness Points Test Scenarios
                  </div>
                  <div style={{ fontSize: '12px', color: '#7c3aed', marginBottom: '15px' }}>
                    Test different user profiles and their expected happiness points
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <button
                      onClick={runScenario1}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        🔴 Scenario 1: Complete Beginner (15-25 points)
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>
                        High attachment • Low experience • Minimal practice
                      </div>
                    </button>

                    <button
                      onClick={runScenario2}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        🟡 Scenario 2: Developing Practitioner (45-55 points)
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>
                        Moderate attachment • Some experience • Regular practice
                      </div>
                    </button>

                    <button
                      onClick={runScenario3}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        🟢 Scenario 3: Advanced Practitioner (75-85 points)
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>
                        Low attachment • High experience • Extensive practice
                      </div>
                    </button>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#6b7280',
                    lineHeight: '1.4'
                  }}>
                    <strong>💡 How to test:</strong><br/>
                    1. Click a scenario button to load test data<br/>
                    2. Go to Happiness Tracker page to see calculated points<br/>
                    3. Expected ranges are based on PAHM-centered calculation<br/>
                    4. Scenarios include questionnaire + self-assessment + practice sessions + case sensitivity fixes
                  </div>
                </div>

                {/* === STAGE 1: T-STAGES PROGRESS === */}
                <div style={{
                  background: '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px' }}>
                    📊 Stage 1: T-Stage Progress (Session-Based)
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '10px',
                    fontSize: '14px'
                  }}>
                    {['T1', 'T2', 'T3', 'T4', 'T5'].map(tLevel => (
                      <div key={tLevel} style={{ 
                        textAlign: 'center',
                        padding: '8px',
                        background: sessionCounts[tLevel] >= 3 ? '#dcfce7' : 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontWeight: 'bold' }}>{tLevel}</div>
                        <div style={{ fontSize: '18px', color: sessionCounts[tLevel] >= 3 ? '#16a34a' : '#6b7280' }}>
                          {sessionCounts[tLevel]}/3
                        </div>
                        {sessionCounts[tLevel] >= 3 && <div style={{ fontSize: '12px', color: '#16a34a' }}>✅ Complete</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* === STAGES 2-6: PAHM PROGRESS === */}
                <div style={{
                  background: '#f0f9ff',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#0c4a6e' }}>
                    🧘 Stages 2-6: PAHM Progress (Hour-Based)
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '10px',
                    fontSize: '14px'
                  }}>
                    {[2, 3, 4, 5, 6].map(stage => (
                      <div key={stage} style={{ 
                        textAlign: 'center',
                        padding: '8px',
                        background: pahmProgress[`stage${stage}`].completed ? '#dcfce7' : 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                          Stage {stage}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '2px' }}>
                          {pahmProgress[`stage${stage}`].name}
                        </div>
                        <div style={{ fontSize: '16px', color: pahmProgress[`stage${stage}`].completed ? '#16a34a' : '#6b7280' }}>
                          {pahmProgress[`stage${stage}`].hours.toFixed(1)}/15h
                        </div>
                        {pahmProgress[`stage${stage}`].completed && (
                          <div style={{ fontSize: '12px', color: '#16a34a' }}>✅ Complete</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* === T-STAGE CONTROLS === */}
                <div style={{
                  background: '#fef3c7',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#92400e' }}>
                    🚀 T-Stage Fast Forward (Stage 1) - CASE SENSITIVITY FIXED
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '15px' }}>
                    Add single completed sessions for testing - now sets both T5Complete AND t5Complete
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    {['T1', 'T2', 'T3', 'T4', 'T5'].map(tLevel => (
                      <button
                        key={tLevel}
                        onClick={() => fastForwardSession(tLevel)}
                        style={{
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        +1 {tLevel}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '10px' }}>
                    Auto-complete levels (add 3 sessions)
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '8px'
                  }}>
                    {['T1', 'T2', 'T3', 'T4', 'T5'].map(tLevel => (
                      <button
                        key={tLevel}
                        onClick={() => autoCompleteLevel(tLevel)}
                        style={{
                          background: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Complete {tLevel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* === PAHM SESSION CONTROLS === */}
                <div style={{
                  background: '#f0f9ff',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  border: '1px solid #0ea5e9'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#0c4a6e' }}>
                    🧘 PAHM Session Controls (Stages 2-6)
                  </div>
                  
                  {/* Individual PAHM Sessions */}
                  <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '10px' }}>
                    Add individual practice sessions (realistic like UniversalPAHMTimer)
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '11px', color: '#0c4a6e', marginBottom: '8px' }}>30-minute sessions:</div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gap: '6px',
                      marginBottom: '10px'
                    }}>
                      {[2, 3, 4, 5, 6].map(stage => (
                        <button
                          key={stage}
                          onClick={() => addPahmSession(stage, 30)}
                          disabled={pahmProgress[`stage${stage}`].completed}
                          style={{
                            background: pahmProgress[`stage${stage}`].completed ? '#d1d5db' : '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: pahmProgress[`stage${stage}`].completed ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          +30min S{stage}
                        </button>
                      ))}
                    </div>
                    
                    <div style={{ fontSize: '11px', color: '#0c4a6e', marginBottom: '8px' }}>60-minute sessions:</div>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gap: '6px'
                    }}>
                      {[2, 3, 4, 5, 6].map(stage => (
                        <button
                          key={stage}
                          onClick={() => addPahmSession(stage, 60)}
                          disabled={pahmProgress[`stage${stage}`].completed}
                          style={{
                            background: pahmProgress[`stage${stage}`].completed ? '#d1d5db' : '#0284c7',
                            color: 'white',
                            border: 'none',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: pahmProgress[`stage${stage}`].completed ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          +1hr S{stage}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Hour Addition */}
                  <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '10px' }}>
                    Bulk hour addition (fast testing)
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    {[2, 3, 4, 5, 6].map(stage => (
                      <button
                        key={stage}
                        onClick={() => fastForwardPahmHours(stage, 1)}
                        disabled={pahmProgress[`stage${stage}`].completed}
                        style={{
                          background: pahmProgress[`stage${stage}`].completed ? '#d1d5db' : '#7c3aed',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: pahmProgress[`stage${stage}`].completed ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        +1hr S{stage}
                      </button>
                    ))}
                  </div>

                  {/* Auto-complete PAHM Stages */}
                  <div style={{ fontSize: '12px', color: '#0c4a6e', marginBottom: '10px' }}>
                    Auto-complete stages (add 15 hours)
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '8px'
                  }}>
                    {[2, 3, 4, 5, 6].map(stage => (
                      <button
                        key={stage}
                        onClick={() => autoCompletePahmStage(stage)}
                        disabled={pahmProgress[`stage${stage}`].completed}
                        style={{
                          background: pahmProgress[`stage${stage}`].completed ? '#d1d5db' : '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: pahmProgress[`stage${stage}`].completed ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Complete S{stage}
                      </button>
                    ))}
                  </div>
                </div>

                {/* === CLEAR CONTROLS === */}
                <div style={{
                  background: '#fef2f2',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ef4444'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '16px', color: '#dc2626' }}>
                    🗑️ Clear Controls
                  </div>
                  
                  {/* Clear T-Stages */}
                  <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '8px' }}>
                    Clear T-Stages (Stage 1):
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    {['T1', 'T2', 'T3', 'T4', 'T5'].map(tLevel => (
                      <button
                        key={tLevel}
                        onClick={() => clearTLevel(tLevel)}
                        disabled={sessionCounts[tLevel] === 0}
                        style={{
                          background: sessionCounts[tLevel] === 0 ? '#d1d5db' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: sessionCounts[tLevel] === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Clear {tLevel}
                      </button>
                    ))}
                  </div>

                  {/* Clear PAHM Stages */}
                  <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '8px' }}>
                    Clear PAHM Stages (2-6):
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(5, 1fr)', 
                    gap: '8px',
                    marginBottom: '15px'
                  }}>
                    {[2, 3, 4, 5, 6].map(stage => (
                      <button
                        key={stage}
                        onClick={() => clearPahmStage(stage)}
                        disabled={pahmProgress[`stage${stage}`].hours === 0}
                        style={{
                          background: pahmProgress[`stage${stage}`].hours === 0 ? '#d1d5db' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: pahmProgress[`stage${stage}`].hours === 0 ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Clear S{stage}
                      </button>
                    ))}
                  </div>
                  
                  {/* Clear All */}
                  <button
                    onClick={clearAllProgress}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      width: '100%'
                    }}
                  >
                    🚨 Clear ALL Progress (T-Stages + PAHM + Case Sensitivity Fixed)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPanel;