import React, { useState, useEffect } from 'react';
// 🚀 UPDATED: Use focused onboarding context instead of LocalDataContext
import { useOnboarding } from './contexts/onboarding/OnboardingContext';

interface QuestionnaireProps {
  onComplete: (answers: any) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 UPDATED: Use focused onboarding context
  const { markQuestionnaireComplete } = useOnboarding();

  // Load saved progress
  useEffect(() => {
    const savedData = localStorage.getItem('questionnaire_progress');
    if (savedData) {
      try {
        const { answers: savedAnswers, currentQuestion: savedQuestion } = JSON.parse(savedData);
        setAnswers(savedAnswers);
        setCurrentQuestion(savedQuestion);
      } catch (error) {
        console.error('Error loading saved progress:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('questionnaire_progress', JSON.stringify({
        answers,
        currentQuestion,
        timestamp: new Date().toISOString()
      }));
    }
  }, [answers, currentQuestion, isLoading]);

  const handleAnswer = (questionId: string, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    // ✅ MANDATORY: Check if current question is answered before proceeding
    if (!isCurrentQuestionAnswered()) {
      console.log('❌ Cannot proceed: Current question not answered');
      return; // Block progression
    }

    if (currentQuestion < 27) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeQuestionnaire();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeQuestionnaire = async () => {
    console.log('🔧 QUESTIONNAIRE COMPLETION STARTING...');
    localStorage.removeItem('questionnaire_progress');
    
    // ✅ FIXED: Send ONLY raw responses - OnboardingContext will add metadata
    const rawResponses = {
      // Demographics & Background (1-7)
      experience_level: answers.experience_level || 1,
      goals: answers.goals || [],
      age_range: answers.age_range || '25-34',
      location: answers.location || 'Urban area',
      occupation: answers.occupation || 'Other',
      education_level: answers.education_level || 'Bachelor\'s degree',
      meditation_background: answers.meditation_background || 'Never tried meditation',
      // Lifestyle Patterns (8-15)  
      sleep_pattern: answers.sleep_pattern || 5,
      physical_activity: answers.physical_activity || 'moderate',
      stress_triggers: answers.stress_triggers || [],
      daily_routine: answers.daily_routine || 'Somewhat organized',
      diet_pattern: answers.diet_pattern || 'Balanced with occasional treats',
      screen_time: answers.screen_time || '3-4 hours daily',
      social_connections: answers.social_connections || 'Few but close relationships',
      work_life_balance: answers.work_life_balance || 'Sometimes struggle but generally good',
      // Thinking Patterns (16-21)
      emotional_awareness: answers.emotional_awareness || 5,
      stress_response: answers.stress_response || 'Usually manage well',
      decision_making: answers.decision_making || 'Balanced approach',
      self_reflection: answers.self_reflection || 'Occasional deep thinking',
      thought_patterns: answers.thought_patterns || 'Mixed emotions',
      mindfulness_in_daily_life: answers.mindfulness_in_daily_life || 'Try to be mindful but forget',
      // Mindfulness Specific (22-27)
      mindfulness_experience: answers.mindfulness_experience || 1,
      meditation_background_detail: answers.meditation_background_detail || 'None',
      practice_goals: answers.practice_goals || 'Quick stress relief',
      preferred_duration: answers.preferred_duration || 10,
      biggest_challenges: answers.biggest_challenges || 'Finding time and staying consistent',
      motivation: answers.motivation || 'Stress reduction and emotional balance',
      // ✅ REMOVED: No metadata here - OnboardingContext will add it
      totalQuestions: 27,
      answeredQuestions: Object.keys(answers).length
    };

    try {
      console.log('📝 Sending raw responses to OnboardingContext:', rawResponses);
      if (markQuestionnaireComplete) {
        await markQuestionnaireComplete(rawResponses);
      }
      onComplete(rawResponses);
    } catch (error) {
      console.error('❌ QUESTIONNAIRE: Error during completion:', error);
      onComplete(rawResponses);
    }
  };

  if (isLoading) {
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
          Loading your assessment...
        </h2>
      </div>
    );
  }

  const progress = (currentQuestion / 27) * 100;
  const currentAnswer = answers[getQuestionKey(currentQuestion)];

  function getQuestionKey(questionNum: number): string {
    const keyMap: Record<number, string> = {
      // Demographics & Background (1-7)
      1: 'experience_level', 2: 'goals', 3: 'age_range', 4: 'location', 5: 'occupation',
      6: 'education_level', 7: 'meditation_background',
      // Lifestyle Patterns (8-15)
      8: 'sleep_pattern', 9: 'physical_activity', 10: 'stress_triggers', 11: 'daily_routine',
      12: 'diet_pattern', 13: 'screen_time', 14: 'social_connections', 15: 'work_life_balance',
      // Thinking Patterns (16-21)
      16: 'emotional_awareness', 17: 'stress_response', 18: 'decision_making', 19: 'self_reflection',
      20: 'thought_patterns', 21: 'mindfulness_in_daily_life',
      // Mindfulness Specific (22-27)
      22: 'mindfulness_experience', 23: 'meditation_background_detail', 24: 'practice_goals',
      25: 'preferred_duration', 26: 'biggest_challenges', 27: 'motivation'
    };
    return keyMap[questionNum] || `q${questionNum}`;
  }

  const getPhaseInfo = (questionNum: number) => {
    if (questionNum <= 7) return { phase: 1, name: 'Demographics & Background', icon: '🎯', color: '#667eea' };
    if (questionNum <= 15) return { phase: 2, name: 'Lifestyle Patterns', icon: '🏠', color: '#10b981' };
    if (questionNum <= 21) return { phase: 3, name: 'Thinking Patterns', icon: '🧠', color: '#f59e0b' };
    return { phase: 4, name: 'Mindfulness Specific', icon: '🧘', color: '#8b5cf6' };
  };

  const isCurrentQuestionAnswered = () => {
    const questionKey = getQuestionKey(currentQuestion);
    const answer = answers[questionKey];
    
    // ✅ ENHANCED: More comprehensive validation
    if (Array.isArray(answer)) {
      return answer.length > 0; // Arrays must have at least one selection
    }
    
    if (typeof answer === 'string') {
      return answer.trim().length > 0; // Strings must not be empty
    }
    
    if (typeof answer === 'number') {
      return !isNaN(answer) && answer > 0; // Numbers must be valid and positive
    }
    
    // All other cases: must not be undefined, null, or empty
    return answer !== undefined && answer !== null && answer !== '';
  };

  const renderQuestion = () => {
    const questionKey = getQuestionKey(currentQuestion);
    const answer = answers[questionKey];

    switch (currentQuestion) {
      // DEMOGRAPHICS & BACKGROUND (1-7)
      case 1:
        return (
          <div className="question-container">
            <h2>🎯 Experience Level</h2>
            <p>How would you rate your meditation/mindfulness experience level?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 1}
                onChange={(e) => handleAnswer('experience_level', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <span>Complete Beginner (1)</span>
                <span>Some Experience (4)</span>
                <span>Advanced (8)</span>
                <span>Expert (10)</span>
              </div>
              <div className="slider-value">Current: {answer || 1}/10</div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="question-container">
            <h2>🎯 Goals</h2>
            <p>What are your main goals? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'stress-reduction', label: 'Stress Reduction', icon: '😌' },
                { id: 'better-sleep', label: 'Better Sleep', icon: '😴' },
                { id: 'emotional-balance', label: 'Emotional Balance', icon: '⚖️' },
                { id: 'spiritual-growth', label: 'Spiritual Growth', icon: '🌱' },
                { id: 'inner-peace', label: 'Inner Peace', icon: '☮️' },
                { id: 'liberation', label: 'Liberation', icon: '🕊️' }
              ].map((goal) => (
                <button
                  key={goal.id}
                  className={`option-button ${(answer || []).includes(goal.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(goal.id)
                      ? current.filter((g: string) => g !== goal.id)
                      : [...current, goal.id];
                    handleAnswer('goals', updated);
                  }}
                >
                  <span className="option-icon">{goal.icon}</span>
                  <span className="option-text">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="question-container">
            <h2>📅 Age Range</h2>
            <p>What is your age range?</p>
            <div className="options-grid">
              {[
                { id: '18-24', label: '18-24 years', icon: '🌱' },
                { id: '25-34', label: '25-34 years', icon: '🚀' },
                { id: '35-44', label: '35-44 years', icon: '💼' },
                { id: '45-54', label: '45-54 years', icon: '🏡' },
                { id: '55-64', label: '55-64 years', icon: '🌟' },
                { id: '65+', label: '65+ years', icon: '🌿' }
              ].map((ageRange) => (
                <button
                  key={ageRange.id}
                  className={`option-button ${answer === ageRange.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('age_range', ageRange.id)}
                >
                  <span className="option-icon">{ageRange.icon}</span>
                  <span className="option-text">{ageRange.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="question-container">
            <h2>🌍 Location</h2>
            <p>Where do you live?</p>
            <div className="options-grid">
              {[
                { id: 'Urban area', label: 'Urban area', icon: '🏙️' },
                { id: 'Suburban area', label: 'Suburban area', icon: '🏘️' },
                { id: 'Rural area', label: 'Rural area', icon: '🌾' },
                { id: 'Quiet suburb', label: 'Quiet suburb', icon: '🏡' },
                { id: 'Busy city center', label: 'Busy city center', icon: '🌆' }
              ].map((location) => (
                <button
                  key={location.id}
                  className={`option-button ${answer === location.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('location', location.id)}
                >
                  <span className="option-icon">{location.icon}</span>
                  <span className="option-text">{location.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="question-container">
            <h2>💼 Occupation</h2>
            <p>What is your occupation?</p>
            <div className="options-grid">
              {[
                { id: 'Software Developer', label: 'Software Developer', icon: '💻' },
                { id: 'Teacher', label: 'Teacher', icon: '👨‍🏫' },
                { id: 'Sales Associate', label: 'Sales Associate', icon: '🛍️' },
                { id: 'Healthcare Worker', label: 'Healthcare Worker', icon: '⚕️' },
                { id: 'Student', label: 'Student', icon: '📚' },
                { id: 'Yoga Instructor / Spiritual Counselor', label: 'Yoga Instructor / Spiritual Counselor', icon: '🧘‍♀️' },
                { id: 'Business Professional', label: 'Business Professional', icon: '💼' },
                { id: 'Creative Professional', label: 'Creative Professional', icon: '🎨' },
                { id: 'Service Industry', label: 'Service Industry', icon: '🍽️' },
                { id: 'Retired', label: 'Retired', icon: '🌴' },
                { id: 'Other', label: 'Other', icon: '👤' }
              ].map((occupation) => (
                <button
                  key={occupation.id}
                  className={`option-button ${answer === occupation.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('occupation', occupation.id)}
                >
                  <span className="option-icon">{occupation.icon}</span>
                  <span className="option-text">{occupation.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="question-container">
            <h2>🎓 Education Level</h2>
            <p>What is your highest education level?</p>
            <div className="options-grid">
              {[
                { id: 'High school', label: 'High school', icon: '🏫' },
                { id: "Bachelor's degree", label: "Bachelor's degree", icon: '🎓' },
                { id: "Master's degree", label: "Master's degree", icon: '📚' },
                { id: 'PhD/Doctorate', label: 'PhD/Doctorate', icon: '👨‍🎓' },
                { id: 'Other', label: 'Other', icon: '📖' }
              ].map((education) => (
                <button
                  key={education.id}
                  className={`option-button ${answer === education.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('education_level', education.id)}
                >
                  <span className="option-icon">{education.icon}</span>
                  <span className="option-text">{education.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="question-container">
            <h2>🧘 Meditation Background</h2>
            <p>Describe your meditation background</p>
            <div className="options-grid">
              {[
                { id: 'Never tried meditation', label: 'Never tried meditation', icon: '🆕' },
                { id: 'Some guided meditation experience', label: 'Some guided meditation experience', icon: '📱' },
                { id: 'Regular practice with apps', label: 'Regular practice with apps', icon: '📲' },
                { id: '1-3 years of practice', label: '1-3 years of practice', icon: '🌱' },
                { id: '3-10 years of practice', label: '3-10 years of practice', icon: '🌳' },
                { id: '10+ years of daily practice', label: '10+ years of daily practice', icon: '🧘‍♂️' },
                { id: 'Advanced Vipassana and Zen practice', label: 'Advanced Vipassana and Zen practice', icon: '☯️' }
              ].map((background) => (
                <button
                  key={background.id}
                  className={`option-button ${answer === background.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('meditation_background', background.id)}
                >
                  <span className="option-icon">{background.icon}</span>
                  <span className="option-text">{background.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // LIFESTYLE PATTERNS (8-15)
      case 8:
        return (
          <div className="question-container">
            <h2>😴 Sleep Pattern</h2>
            <p>How would you rate your sleep quality?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 5}
                onChange={(e) => handleAnswer('sleep_pattern', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <span>Very Poor (1)</span>
                <span>Poor (4)</span>
                <span>Good (7)</span>
                <span>Excellent (10)</span>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="question-container">
            <h2>🏃‍♂️ Physical Activity</h2>
            <p>How would you describe your physical activity level?</p>
            <div className="options-grid">
              {[
                { id: 'sedentary', label: 'Sedentary (minimal exercise)', icon: '🪑' },
                { id: 'light', label: 'Light (occasional walks)', icon: '🚶‍♂️' },
                { id: 'moderate', label: 'Moderate (regular exercise)', icon: '🏃‍♂️' },
                { id: 'active', label: 'Active (frequent exercise)', icon: '💪' },
                { id: 'very_active', label: 'Very Active (yoga, meditation)', icon: '🧘‍♀️' }
              ].map((activity) => (
                <button
                  key={activity.id}
                  className={`option-button ${answer === activity.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('physical_activity', activity.id)}
                >
                  <span className="option-icon">{activity.icon}</span>
                  <span className="option-text">{activity.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="question-container">
            <h2>😰 Stress Triggers</h2>
            <p>What are your main stress triggers? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'work-pressure', label: 'Work Pressure', icon: '💼' },
                { id: 'traffic', label: 'Traffic', icon: '🚗' },
                { id: 'social-media', label: 'Social Media', icon: '📱' },
                { id: 'finances', label: 'Finances', icon: '💰' },
                { id: 'relationships', label: 'Relationships', icon: '💑' },
                { id: 'loud-noises', label: 'Loud Noises', icon: '🔊' }
              ].map((trigger) => (
                <button
                  key={trigger.id}
                  className={`option-button ${(answer || []).includes(trigger.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(trigger.id)
                      ? current.filter((t: string) => t !== trigger.id)
                      : [...current, trigger.id];
                    handleAnswer('stress_triggers', updated);
                  }}
                >
                  <span className="option-icon">{trigger.icon}</span>
                  <span className="option-text">{trigger.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="question-container">
            <h2>📅 Daily Routine</h2>
            <p>How would you describe your daily routine?</p>
            <div className="options-grid">
              {[
                { id: 'Structured but flexible', label: 'Structured but flexible', icon: '📋' },
                { id: 'Very structured and disciplined', label: 'Very structured and disciplined', icon: '⏰' },
                { id: 'Disciplined practice schedule', label: 'Disciplined practice schedule', icon: '🧘' },
                { id: 'Somewhat organized', label: 'Somewhat organized', icon: '📝' },
                { id: 'Chaotic and unpredictable', label: 'Chaotic and unpredictable', icon: '🌪️' },
                { id: 'Varies by day', label: 'Varies by day', icon: '🔄' }
              ].map((routine) => (
                <button
                  key={routine.id}
                  className={`option-button ${answer === routine.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('daily_routine', routine.id)}
                >
                  <span className="option-icon">{routine.icon}</span>
                  <span className="option-text">{routine.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 12:
        return (
          <div className="question-container">
            <h2>🍽️ Diet Pattern</h2>
            <p>How would you describe your eating habits?</p>
            <div className="options-grid">
              {[
                { id: 'Balanced with occasional treats', label: 'Balanced with occasional treats', icon: '🥗' },
                { id: 'Mindful eating, mostly vegetarian', label: 'Mindful eating, mostly vegetarian', icon: '🌱' },
                { id: 'Very healthy and disciplined', label: 'Very healthy and disciplined', icon: '🥬' },
                { id: 'Mostly healthy with some flexibility', label: 'Mostly healthy with some flexibility', icon: '🍎' },
                { id: 'Fast food and convenience meals', label: 'Fast food and convenience meals', icon: '🍔' },
                { id: 'Irregular eating patterns', label: 'Irregular eating patterns', icon: '🔄' }
              ].map((diet) => (
                <button
                  key={diet.id}
                  className={`option-button ${answer === diet.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('diet_pattern', diet.id)}
                >
                  <span className="option-icon">{diet.icon}</span>
                  <span className="option-text">{diet.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 13:
        return (
          <div className="question-container">
            <h2>📱 Screen Time</h2>
            <p>How much time do you spend on screens daily?</p>
            <div className="options-grid">
              {[
                { id: '1-2 hours daily', label: '1-2 hours daily', icon: '🟢' },
                { id: '3-4 hours daily', label: '3-4 hours daily', icon: '🟡' },
                { id: '5-6 hours daily', label: '5-6 hours daily', icon: '🟠' },
                { id: '6-8 hours daily', label: '6-8 hours daily', icon: '🔴' },
                { id: '10+ hours daily', label: '10+ hours daily', icon: '⚫' },
                { id: '12+ hours daily', label: '12+ hours daily', icon: '🚨' }
              ].map((screenTime) => (
                <button
                  key={screenTime.id}
                  className={`option-button ${answer === screenTime.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('screen_time', screenTime.id)}
                >
                  <span className="option-icon">{screenTime.icon}</span>
                  <span className="option-text">{screenTime.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 14:
        return (
          <div className="question-container">
            <h2>👥 Social Connections</h2>
            <p>How would you describe your social relationships?</p>
            <div className="options-grid">
              {[
                { id: 'Good friends and family relationships', label: 'Good friends and family relationships', icon: '👨‍👩‍👧‍👦' },
                { id: 'Deep, meaningful relationships', label: 'Deep, meaningful relationships', icon: '❤️' },
                { id: 'Strong support network', label: 'Strong support network', icon: '🤝' },
                { id: 'Few but close relationships', label: 'Few but close relationships', icon: '👯‍♀️' },
                { id: 'Superficial social media connections', label: 'Superficial social media connections', icon: '📱' },
                { id: 'Mostly isolated', label: 'Mostly isolated', icon: '🏝️' }
              ].map((connection) => (
                <button
                  key={connection.id}
                  className={`option-button ${answer === connection.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('social_connections', connection.id)}
                >
                  <span className="option-icon">{connection.icon}</span>
                  <span className="option-text">{connection.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 15:
        return (
          <div className="question-container">
            <h2>⚖️ Work Life Balance</h2>
            <p>How would you describe your work-life balance?</p>
            <div className="options-grid">
              {[
                { id: 'Sometimes struggle but generally good', label: 'Sometimes struggle but generally good', icon: '⚖️' },
                { id: 'Perfect integration of work and practice', label: 'Perfect integration of work and practice', icon: '🧘‍♂️' },
                { id: 'Excellent balance', label: 'Excellent balance', icon: '✅' },
                { id: 'Good boundaries', label: 'Good boundaries', icon: '🚧' },
                { id: 'Work dominates everything', label: 'Work dominates everything', icon: '💼' },
                { id: 'Struggling to find balance', label: 'Struggling to find balance', icon: '😰' }
              ].map((balance) => (
                <button
                  key={balance.id}
                  className={`option-button ${answer === balance.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('work_life_balance', balance.id)}
                >
                  <span className="option-icon">{balance.icon}</span>
                  <span className="option-text">{balance.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // THINKING PATTERNS (16-21)
      case 16:
        return (
          <div className="question-container">
            <h2>💭 Emotional Awareness</h2>
            <p>How aware are you of your emotions throughout the day?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 5}
                onChange={(e) => handleAnswer('emotional_awareness', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <span>Low Awareness (3)</span>
                <span>Good Awareness (6)</span>
                <span>Very High Awareness (9)</span>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      case 17:
        return (
          <div className="question-container">
            <h2>😤 Stress Response</h2>
            <p>How do you typically respond to stress?</p>
            <div className="options-grid">
              {[
                { id: 'Usually manage well', label: 'Usually manage well', icon: '😌' },
                { id: 'Observe and let go', label: 'Observe and let go', icon: '🧘‍♀️' },
                { id: 'Take deep breaths and calm down', label: 'Take deep breaths and calm down', icon: '💨' },
                { id: 'Talk to someone', label: 'Talk to someone', icon: '💬' },
                { id: 'Get overwhelmed easily', label: 'Get overwhelmed easily', icon: '😰' },
                { id: 'React emotionally', label: 'React emotionally', icon: '😡' }
              ].map((response) => (
                <button
                  key={response.id}
                  className={`option-button ${answer === response.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('stress_response', response.id)}
                >
                  <span className="option-icon">{response.icon}</span>
                  <span className="option-text">{response.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 18:
        return (
          <div className="question-container">
            <h2>🤔 Decision Making</h2>
            <p>How do you typically make decisions?</p>
            <div className="options-grid">
              {[
                { id: 'Balanced approach', label: 'Balanced approach', icon: '⚖️' },
                { id: 'Intuitive with mindful consideration', label: 'Intuitive with mindful consideration', icon: '🧘‍♂️' },
                { id: 'Careful analysis', label: 'Careful analysis', icon: '🔍' },
                { id: 'Ask for advice', label: 'Ask for advice', icon: '💭' },
                { id: 'Impulsive decisions', label: 'Impulsive decisions', icon: '⚡' },
                { id: 'Overthink everything', label: 'Overthink everything', icon: '🌪️' }
              ].map((decision) => (
                <button
                  key={decision.id}
                  className={`option-button ${answer === decision.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('decision_making', decision.id)}
                >
                  <span className="option-icon">{decision.icon}</span>
                  <span className="option-text">{decision.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 19:
        return (
          <div className="question-container">
            <h2>🪞 Self Reflection</h2>
            <p>How often do you engage in self-reflection?</p>
            <div className="options-grid">
              {[
                { id: 'Regular journaling', label: 'Regular journaling', icon: '📔' },
                { id: 'Daily meditation and contemplation', label: 'Daily meditation and contemplation', icon: '🧘‍♀️' },
                { id: 'Weekly reflection time', label: 'Weekly reflection time', icon: '📅' },
                { id: 'Occasional deep thinking', label: 'Occasional deep thinking', icon: '💭' },
                { id: 'Rarely think deeply', label: 'Rarely think deeply', icon: '🤷‍♂️' },
                { id: 'Avoid self-reflection', label: 'Avoid self-reflection', icon: '🚫' }
              ].map((reflection) => (
                <button
                  key={reflection.id}
                  className={`option-button ${answer === reflection.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('self_reflection', reflection.id)}
                >
                  <span className="option-icon">{reflection.icon}</span>
                  <span className="option-text">{reflection.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 20:
        return (
          <div className="question-container">
            <h2>💭 Thought Patterns</h2>
            <p>How would you describe your typical thought patterns?</p>
            <div className="options-grid">
              {[
                { id: 'Generally positive with some worry', label: 'Generally positive with some worry', icon: '🌤️' },
                { id: 'Peaceful and accepting', label: 'Peaceful and accepting', icon: '☮️' },
                { id: 'Optimistic and hopeful', label: 'Optimistic and hopeful', icon: '🌟' },
                { id: 'Mixed emotions', label: 'Mixed emotions', icon: '🎭' },
                { id: 'Anxious and scattered', label: 'Anxious and scattered', icon: '😰' },
                { id: 'Negative and pessimistic', label: 'Negative and pessimistic', icon: '☁️' }
              ].map((pattern) => (
                <button
                  key={pattern.id}
                  className={`option-button ${answer === pattern.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('thought_patterns', pattern.id)}
                >
                  <span className="option-icon">{pattern.icon}</span>
                  <span className="option-text">{pattern.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 21:
        return (
          <div className="question-container">
            <h2>🧘 Mindfulness in Daily Life</h2>
            <p>How mindful are you during daily activities?</p>
            <div className="options-grid">
              {[
                { id: 'Occasionally remember to be present', label: 'Occasionally remember to be present', icon: '🔔' },
                { id: 'Constant awareness and presence', label: 'Constant awareness and presence', icon: '✨' },
                { id: 'Regular mindful moments', label: 'Regular mindful moments', icon: '🌸' },
                { id: 'Try to be mindful but forget', label: 'Try to be mindful but forget', icon: '💭' },
                { id: 'Always distracted and multitasking', label: 'Always distracted and multitasking', icon: '🤹‍♂️' },
                { id: 'Live on autopilot', label: 'Live on autopilot', icon: '🤖' }
              ].map((mindfulness) => (
                <button
                  key={mindfulness.id}
                  className={`option-button ${answer === mindfulness.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('mindfulness_in_daily_life', mindfulness.id)}
                >
                  <span className="option-icon">{mindfulness.icon}</span>
                  <span className="option-text">{mindfulness.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // MINDFULNESS SPECIFIC (22-27)
      case 22:
        return (
          <div className="question-container">
            <h2>🧘 Mindfulness Experience</h2>
            <p>How would you rate your mindfulness experience level?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 1}
                onChange={(e) => handleAnswer('mindfulness_experience', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <span>No Experience (1)</span>
                <span>Some Training (5)</span>
                <span>Advanced (8)</span>
              </div>
              <div className="slider-value">Current: {answer || 1}/10</div>
            </div>
          </div>
        );

      case 23:
        return (
          <div className="question-container">
            <h2>📚 Meditation Background Detail</h2>
            <p>Describe your meditation experience in detail</p>
            <div className="options-grid">
              {[
                { id: 'None', label: 'None', icon: '❌' },
                { id: 'Guided meditations, apps', label: 'Guided meditations, apps', icon: '📱' },
                { id: 'Some formal training', label: 'Some formal training', icon: '🎓' },
                { id: 'Regular retreat experience', label: 'Regular retreat experience', icon: '🏔️' },
                { id: 'Advanced Vipassana and Zen practice', label: 'Advanced Vipassana and Zen practice', icon: '☯️' },
                { id: 'Teacher training', label: 'Teacher training', icon: '👨‍🏫' }
              ].map((background) => (
                <button
                  key={background.id}
                  className={`option-button ${answer === background.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('meditation_background_detail', background.id)}
                >
                  <span className="option-icon">{background.icon}</span>
                  <span className="option-text">{background.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 24:
        return (
          <div className="question-container">
            <h2>🎯 Practice Goals</h2>
            <p>What are your meditation practice goals?</p>
            <div className="options-grid">
              {[
                { id: 'Daily 15-20 minutes', label: 'Daily 15-20 minutes', icon: '⏰' },
                { id: 'Liberation from suffering', label: 'Liberation from suffering', icon: '🕊️' },
                { id: 'Quick stress relief', label: 'Quick stress relief', icon: '😌' },
                { id: 'Improve focus', label: 'Improve focus', icon: '🎯' },
                { id: 'Better sleep', label: 'Better sleep', icon: '😴' },
                { id: 'Spiritual awakening', label: 'Spiritual awakening', icon: '✨' }
              ].map((goal) => (
                <button
                  key={goal.id}
                  className={`option-button ${answer === goal.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('practice_goals', goal.id)}
                >
                  <span className="option-icon">{goal.icon}</span>
                  <span className="option-text">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 25:
        return (
          <div className="question-container">
            <h2>⏰ Preferred Duration</h2>
            <p>How long would you like to meditate (in minutes)?</p>
            <div className="options-grid">
              {[
                { id: '5', label: '5 minutes', icon: '⏱️' },
                { id: '10', label: '10 minutes', icon: '⏰' },
                { id: '20', label: '20 minutes', icon: '🕐' },
                { id: '30', label: '30 minutes', icon: '🕕' },
                { id: '60', label: '60 minutes', icon: '⏳' }
              ].map((duration) => (
                <button
                  key={duration.id}
                  className={`option-button ${answer === parseInt(duration.id) ? 'selected' : ''}`}
                  onClick={() => handleAnswer('preferred_duration', parseInt(duration.id))}
                >
                  <span className="option-icon">{duration.icon}</span>
                  <span className="option-text">{duration.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 26:
        return (
          <div className="question-container">
            <h2>🚧 Biggest Challenges</h2>
            <p>What do you think will be your biggest challenges?</p>
            <div className="options-grid">
              {[
                { id: 'Finding time and staying consistent', label: 'Finding time and staying consistent', icon: '⏰' },
                { id: 'None, practice is integrated', label: 'None, practice is integrated', icon: '✅' },
                { id: "Can't sit still, mind too busy", label: "Can't sit still, mind too busy", icon: '🤯' },
                { id: 'Getting distracted', label: 'Getting distracted', icon: '📱' },
                { id: 'Physical discomfort', label: 'Physical discomfort', icon: '😣' },
                { id: 'Remembering to practice', label: 'Remembering to practice', icon: '🤔' }
              ].map((challenge) => (
                <button
                  key={challenge.id}
                  className={`option-button ${answer === challenge.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('biggest_challenges', challenge.id)}
                >
                  <span className="option-icon">{challenge.icon}</span>
                  <span className="option-text">{challenge.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 27:
        return (
          <div className="question-container">
            <h2>🌟 Motivation</h2>
            <p>What motivates you to start this mindfulness journey?</p>
            <div className="options-grid">
              {[
                { id: 'Stress reduction and emotional balance', label: 'Stress reduction and emotional balance', icon: '😌' },
                { id: 'Service to others and spiritual awakening', label: 'Service to others and spiritual awakening', icon: '🕊️' },
                { id: 'Doctor recommended for anxiety', label: 'Doctor recommended for anxiety', icon: '⚕️' },
                { id: 'Improve focus and productivity', label: 'Improve focus and productivity', icon: '🎯' },
                { id: 'Better relationships', label: 'Better relationships', icon: '❤️' },
                { id: 'Personal growth', label: 'Personal growth', icon: '🌱' }
              ].map((motivation) => (
                <button
                  key={motivation.id}
                  className={`option-button ${answer === motivation.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('motivation', motivation.id)}
                >
                  <span className="option-icon">{motivation.icon}</span>
                  <span className="option-text">{motivation.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Question not found</div>;
    }
  };

  const phaseInfo = getPhaseInfo(currentQuestion);

  return (
    <div className="questionnaire-container">
      <style>{`
        /* ✅ UNIVERSAL QUESTIONNAIRE DESIGN - FULLY IPHONE OPTIMIZED */
        .questionnaire-container {
          min-height: 100vh;
          min-height: 100dvh; /* Dynamic viewport height for iPhone */
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
        }

        /* ✅ TOP PROGRESS BAR - IPHONE OPTIMIZED */
        .progress-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
          padding: max(16px, env(safe-area-inset-top, 16px)) 20px 16px 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid #e2e8f0;
        }

        .progress-content {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .progress-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .progress-text {
          font-size: clamp(16px, 4vw, 20px);
          font-weight: 700;
          color: #1a202c;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }

        .progress-percentage {
          font-size: clamp(14px, 3.5vw, 16px);
          color: #667eea;
          font-weight: 600;
          flex-shrink: 0;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
        }

        .phase-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: linear-gradient(135deg, ${phaseInfo.color}15 0%, ${phaseInfo.color}08 100%);
          border: 1px solid ${phaseInfo.color}30;
          border-radius: 12px;
          font-size: clamp(12px, 3.5vw, 14px);
          font-weight: 600;
          color: ${phaseInfo.color};
          width: fit-content;
        }

        /* ✅ MAIN CONTENT - IPHONE CENTERED DESIGN */
        .main-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          padding-bottom: max(140px, calc(140px + env(safe-area-inset-bottom)));
          min-height: calc(100vh - 200px);
          min-height: calc(100dvh - 200px);
        }

        .question-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          padding: clamp(24px, 6vw, 40px);
          max-width: 700px;
          width: 100%;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin: 0 auto;
          transition: all 0.3s ease;
        }

        .question-card.answer-required-card {
          border: 2px solid #f59e0b;
          box-shadow: 0 20px 60px rgba(245, 158, 11, 0.15);
        }

        .answer-required-message {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 16px;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          animation: shake 0.5s ease-in-out;
        }

        .answer-required-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .answer-required-text {
          color: #92400e;
          font-weight: 600;
          font-size: clamp(13px, 3.5vw, 15px);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .question-container h2 {
          font-size: clamp(20px, 6vw, 36px);
          color: #1a202c;
          margin: 0 0 16px 0;
          font-weight: 800;
          line-height: 1.2;
        }

        .question-container p {
          font-size: clamp(14px, 4vw, 20px);
          color: #4a5568;
          margin: 0 0 30px 0;
          line-height: 1.6;
          font-weight: 500;
        }

        /* ✅ OPTIONS GRID - IPHONE RESPONSIVE */
        .options-grid {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
          max-width: 600px;
          margin: 0 auto;
        }

        .option-button {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: left;
          min-height: 60px; /* iPhone touch target minimum */
          -webkit-tap-highlight-color: rgba(102, 126, 234, 0.1);
          touch-action: manipulation;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
          -webkit-user-select: none;
        }

        .option-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          transition: left 0.6s;
        }

        .option-button:hover::before {
          left: 100%;
        }

        .option-button:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .option-button:active {
          transform: translateY(0px) scale(0.98);
        }

        .option-button.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25);
        }

        .option-icon {
          font-size: clamp(18px, 5vw, 24px);
          flex-shrink: 0;
        }

        .option-text {
          font-size: clamp(13px, 3.5vw, 16px);
          font-weight: 600;
          line-height: 1.4;
          word-break: break-word;
        }

        /* ✅ SLIDER DESIGN - IPHONE OPTIMIZED */
        .slider-container {
          padding: 20px;
          max-width: 500px;
          margin: 0 auto;
        }

        .range-slider {
          width: 100%;
          height: 12px;
          border-radius: 6px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 20px;
          position: relative;
          touch-action: manipulation;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: all 0.2s ease;
          border: none;
        }

        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .range-slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }

        .range-slider::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: clamp(10px, 2.5vw, 13px);
          color: #6b7280;
          font-weight: 500;
          flex-wrap: wrap;
          gap: 4px;
        }

        .slider-value {
          text-align: center;
          font-size: clamp(16px, 4vw, 22px);
          font-weight: 700;
          color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ✅ BOTTOM NAVIGATION - IPHONE OPTIMIZED */
        .bottom-navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid #e2e8f0;
          padding: 16px 20px;
          padding-bottom: max(16px, env(safe-area-inset-bottom, 16px));
          z-index: 1000;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
        }

        .navigation-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .nav-button {
          padding: 16px 24px;
          border: none;
          border-radius: 16px;
          font-size: clamp(13px, 3.5vw, 16px);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 56px; /* iPhone touch target */
          min-width: 100px;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
          -webkit-user-select: none;
        }

        .back-button {
          background: #f1f5f9;
          color: #475569;
          border: 2px solid #e2e8f0;
        }

        .back-button:hover:not(:disabled) {
          background: #e2e8f0;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        .back-button:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }

        .back-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .next-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border: 2px solid transparent !important;
          position: relative;
          flex: 1;
          max-width: 250px;
          opacity: 1 !important;
          visibility: visible !important;
          display: flex !important;
        }

        .next-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.6s;
          pointer-events: none;
        }

        .next-button:hover::before {
          left: 100%;
        }

        .next-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%) !important;
          color: white !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: flex !important;
        }

        .next-button:active:not(:disabled) {
          transform: translateY(0px) scale(0.98) !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .next-button:disabled {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          color: white !important;
          cursor: not-allowed !important;
          opacity: 0.8 !important;
          transform: none !important;
          box-shadow: none !important;
          pointer-events: none !important;
        }

        .next-button:disabled:hover {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          transform: none !important;
          box-shadow: none !important;
          cursor: not-allowed !important;
        }

        .answer-required {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          color: white !important;
          animation: pulse 2s infinite;
          opacity: 1 !important;
          visibility: visible !important;
          display: flex !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }

        .answer-required:hover {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          color: white !important;
          transform: none !important;
          box-shadow: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          cursor: not-allowed !important;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ✅ IPHONE SE (375px and smaller) */
        @media (max-width: 374px) {
          .progress-header {
            padding: max(12px, env(safe-area-inset-top, 12px)) 16px 12px 16px;
          }

          .main-content {
            padding: 16px 12px;
            padding-bottom: max(120px, calc(120px + env(safe-area-inset-bottom)));
          }

          .question-card {
            padding: 20px 16px;
            border-radius: 20px;
          }

          .options-grid {
            gap: 10px;
          }

          .option-button {
            padding: 14px 16px;
            min-height: 56px;
            gap: 12px;
          }

          .option-icon {
            font-size: 20px;
          }

          .option-text {
            font-size: 13px;
          }

          .navigation-content {
            gap: 12px;
          }

          .nav-button {
            min-width: 80px;
            padding: 14px 16px;
            font-size: 13px;
          }

          .phase-indicator {
            padding: 6px 12px;
            font-size: 11px;
          }
        }

        /* ✅ IPHONE STANDARD (375px - 414px) */
        @media (min-width: 375px) and (max-width: 414px) {
          .main-content {
            padding: 20px 16px;
            padding-bottom: max(130px, calc(130px + env(safe-area-inset-bottom)));
          }

          .question-card {
            padding: 24px 20px;
          }

          .options-grid {
            gap: 12px;
          }
        }

        /* ✅ IPHONE PLUS/PRO MAX (415px+) */
        @media (min-width: 415px) and (max-width: 768px) {
          .main-content {
            padding: 24px 20px;
            padding-bottom: max(140px, calc(140px + env(safe-area-inset-bottom)));
          }

          .question-card {
            padding: 32px 24px;
          }

          .options-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 14px;
          }
        }

        /* ✅ LANDSCAPE MODE - IPHONE OPTIMIZATION */
        @media (max-width: 768px) and (orientation: landscape) {
          .main-content {
            padding: 16px 20px;
            padding-bottom: max(100px, calc(100px + env(safe-area-inset-bottom)));
            align-items: flex-start;
            padding-top: 16px;
          }

          .question-card {
            padding: 20px 24px;
            margin-top: 0;
          }

          .question-container h2 {
            font-size: clamp(18px, 5vw, 24px);
            margin-bottom: 12px;
          }

          .question-container p {
            font-size: clamp(13px, 3.5vw, 16px);
            margin-bottom: 20px;
          }

          .options-grid {
            gap: 10px;
          }

          .option-button {
            padding: 12px 16px;
            min-height: 48px;
          }

          .slider-container {
            padding: 16px;
          }

          .bottom-navigation {
            padding: 12px 20px;
            padding-bottom: max(12px, env(safe-area-inset-bottom, 12px));
          }

          .nav-button {
            min-height: 48px;
            padding: 12px 20px;
          }
        }

        /* ✅ TABLET AND DESKTOP */
        @media (min-width: 769px) {
          .options-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
          }

          .question-card {
            padding: 40px;
          }
        }

        /* ✅ SAFE AREA SUPPORT (iPhone X and newer) */
        @supports (padding: max(0px)) {
          .progress-header {
            padding-top: max(16px, env(safe-area-inset-top));
          }

          .bottom-navigation {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }

          .main-content {
            padding-bottom: max(140px, calc(140px + env(safe-area-inset-bottom)));
          }
        }

        /* ✅ HIGH CONTRAST MODE SUPPORT */
        @media (prefers-contrast: high) {
          .option-button {
            border-width: 3px;
          }

          .progress-fill {
            box-shadow: none;
          }

          .nav-button {
            border-width: 3px;
          }
        }

        /* ✅ REDUCED MOTION SUPPORT */
        @media (prefers-reduced-motion: reduce) {
          .option-button::before {
            transition: none;
          }

          .next-button::before {
            transition: none;
          }

          .progress-fill {
            transition: none;
          }

          .pulse {
            animation: none;
          }

          * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }

        /* ✅ DARK MODE SUPPORT */
        @media (prefers-color-scheme: dark) {
          .questionnaire-container {
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
          }

          .progress-header {
            background: rgba(26, 32, 44, 0.95);
            border-bottom-color: #4a5568;
          }

          .question-card {
            background: #2d3748;
            border-color: #4a5568;
          }

          .question-container h2 {
            color: #f7fafc;
          }

          .question-container p {
            color: #e2e8f0;
          }

          .option-button {
            background: #374151;
            border-color: #4a5568;
            color: #f7fafc;
          }

          .option-button:hover {
            border-color: #667eea;
          }

          .bottom-navigation {
            background: rgba(26, 32, 44, 0.95);
            border-top-color: #4a5568;
          }

          .back-button {
            background: #374151;
            color: #e2e8f0;
            border-color: #4a5568;
          }
        }
      `}</style>

      {/* ✅ TOP PROGRESS BAR */}
      <div className="progress-header">
        <div className="progress-content">
          <div className="progress-main">
            <h1 className="progress-text">Question {currentQuestion} of 27</h1>
            <span className="progress-percentage">{Math.round(progress)}% Complete</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="phase-indicator">
            <span>{phaseInfo.icon}</span>
            <span>Phase {phaseInfo.phase}: {phaseInfo.name}</span>
          </div>
        </div>
      </div>

      {/* ✅ CENTERED MAIN CONTENT */}
      <div className="main-content">
        <div className={`question-card ${!isCurrentQuestionAnswered() ? 'answer-required-card' : ''}`}>
          {renderQuestion()}
          
          {/* ✅ ANSWER REQUIRED MESSAGE */}
          {!isCurrentQuestionAnswered() && (
            <div className="answer-required-message">
              <div className="answer-required-icon">⚠️</div>
              <div className="answer-required-text">
                Please select an answer to continue
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ BOTTOM NAVIGATION */}
      <div className="bottom-navigation">
        <div className="navigation-content">
          <button 
            className="nav-button back-button" 
            onClick={prevQuestion}
            disabled={currentQuestion === 1}
          >
            ← Back
          </button>

          <button 
            className={`nav-button next-button ${!isCurrentQuestionAnswered() ? 'answer-required' : ''}`}
            onClick={nextQuestion}
            disabled={!isCurrentQuestionAnswered()}
            title={!isCurrentQuestionAnswered() ? 'Please answer this question before continuing' : ''}
          >
            {currentQuestion === 27 ? 'Complete Assessment' : 
             !isCurrentQuestionAnswered() ? '⚠️ Please Answer First' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;