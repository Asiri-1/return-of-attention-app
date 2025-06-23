import React, { useState, useEffect } from 'react';

interface QuestionnaireProps {
  onComplete: (answers: any) => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Complete countries list with flags
  const countries = [
    { value: 'us', label: '🇺🇸 United States' },
    { value: 'ca', label: '🇨🇦 Canada' },
    { value: 'gb', label: '🇬🇧 United Kingdom' },
    { value: 'au', label: '🇦🇺 Australia' },
    { value: 'de', label: '🇩🇪 Germany' },
    { value: 'fr', label: '🇫🇷 France' },
    { value: 'jp', label: '🇯🇵 Japan' },
    { value: 'kr', label: '🇰🇷 South Korea' },
    { value: 'cn', label: '🇨🇳 China' },
    { value: 'in', label: '🇮🇳 India' },
    { value: 'br', label: '🇧🇷 Brazil' },
    { value: 'mx', label: '🇲🇽 Mexico' },
    { value: 'es', label: '🇪🇸 Spain' },
    { value: 'it', label: '🇮🇹 Italy' },
    { value: 'nl', label: '🇳🇱 Netherlands' },
    { value: 'se', label: '🇸🇪 Sweden' },
    { value: 'no', label: '🇳🇴 Norway' },
    { value: 'dk', label: '🇩🇰 Denmark' },
    { value: 'fi', label: '🇫🇮 Finland' },
    { value: 'ch', label: '🇨🇭 Switzerland' },
    { value: 'at', label: '🇦🇹 Austria' },
    { value: 'be', label: '🇧🇪 Belgium' },
    { value: 'ie', label: '🇮🇪 Ireland' },
    { value: 'nz', label: '🇳🇿 New Zealand' },
    { value: 'sg', label: '🇸🇬 Singapore' },
    { value: 'hk', label: '🇭🇰 Hong Kong' },
    { value: 'tw', label: '🇹🇼 Taiwan' },
    { value: 'th', label: '🇹🇭 Thailand' },
    { value: 'id', label: '🇮🇩 Indonesia' },
    { value: 'my', label: '🇲🇾 Malaysia' },
    { value: 'ph', label: '🇵🇭 Philippines' },
    { value: 'vn', label: '🇻🇳 Vietnam' },
    { value: 'za', label: '🇿🇦 South Africa' },
    { value: 'eg', label: '🇪🇬 Egypt' },
    { value: 'ng', label: '🇳🇬 Nigeria' },
    { value: 'ke', label: '🇰🇪 Kenya' },
    { value: 'ar', label: '🇦🇷 Argentina' },
    { value: 'cl', label: '🇨🇱 Chile' },
    { value: 'co', label: '🇨🇴 Colombia' },
    { value: 'pe', label: '🇵🇪 Peru' },
    { value: 'ua', label: '🇺🇦 Ukraine' },
    { value: 'pl', label: '🇵🇱 Poland' },
    { value: 'cz', label: '🇨🇿 Czech Republic' },
    { value: 'hu', label: '🇭🇺 Hungary' },
    { value: 'ro', label: '🇷🇴 Romania' },
    { value: 'bg', label: '🇧🇬 Bulgaria' },
    { value: 'hr', label: '🇭🇷 Croatia' },
    { value: 'rs', label: '🇷🇸 Serbia' },
    { value: 'si', label: '🇸🇮 Slovenia' },
    { value: 'sk', label: '🇸🇰 Slovakia' },
    { value: 'lt', label: '🇱🇹 Lithuania' },
    { value: 'lv', label: '🇱🇻 Latvia' },
    { value: 'ee', label: '🇪🇪 Estonia' },
    { value: 'is', label: '🇮🇸 Iceland' },
    { value: 'tr', label: '🇹🇷 Turkey' },
    { value: 'il', label: '🇮🇱 Israel' },
    { value: 'ae', label: '🇦🇪 United Arab Emirates' },
    { value: 'sa', label: '🇸🇦 Saudi Arabia' },
    { value: 'other', label: '🌍 Other' }
  ];

  // Phase definitions for AI personality assessment
  const phases = [
    { id: 1, name: 'Demographics & Motivation', questions: [1, 2, 3, 4, 5, 6, 7], icon: '🎯', description: 'Understanding your background and goals' },
    { id: 2, name: 'Lifestyle & Daily Patterns', questions: [8, 9, 10, 11, 12, 13, 14], icon: '🏠', description: 'Analyzing your daily routines and environment' },
    { id: 3, name: 'Thinking Patterns & Mental Habits', questions: [15, 16, 17, 18, 19, 20, 21, 22], icon: '🧠', description: 'Exploring your cognitive and emotional patterns' },
    { id: 4, name: 'Mindfulness-Specific Assessment', questions: [23, 24, 25, 26, 27], icon: '🧘', description: 'Tailoring your mindfulness journey' }
  ];

  // Load saved progress
  useEffect(() => {
    const savedData = localStorage.getItem('questionnaire_progress');
    if (savedData) {
      try {
        const { answers: savedAnswers, currentQuestion: savedQuestion } = JSON.parse(savedData);
        setAnswers(savedAnswers);
        setCurrentQuestion(savedQuestion);
        
        // Determine current phase based on question number
        const phase = phases.find(p => p.questions.includes(savedQuestion));
        if (phase) setCurrentPhase(phase.id);
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
    if (currentQuestion < 27) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      
      // Update phase if needed
      const phase = phases.find(p => p.questions.includes(nextQ));
      if (phase && phase.id !== currentPhase) {
        setCurrentPhase(phase.id);
      }
    } else {
      completeQuestionnaire();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 1) {
      const prevQ = currentQuestion - 1;
      setCurrentQuestion(prevQ);
      
      // Update phase if needed
      const phase = phases.find(p => p.questions.includes(prevQ));
      if (phase && phase.id !== currentPhase) {
        setCurrentPhase(phase.id);
      }
    }
  };

  const completeQuestionnaire = () => {
    // Clear saved progress
    localStorage.removeItem('questionnaire_progress');
    
    // Organize answers by phases for AI analysis
    const organizedData = {
      demographics: {
        nationality: answers.nationality || '',
        residence_country: answers.residence_country || '',
        age_range: answers.age_range || '',
        goals: answers.goals || [],
        experience_level: answers.experience_level || 1,
        time_commitment: answers.time_commitment || '',
        learning_styles: answers.learning_styles || []
      },
      lifestyle_patterns: {
        energy_pattern: answers.energy_pattern || '',
        stress_triggers: answers.stress_triggers || [],
        coping_mechanisms: answers.coping_mechanisms || [],
        sleep_pattern: answers.sleep_pattern || 5,
        technology_relationship: answers.technology_relationship || '',
        physical_activity: answers.physical_activity || '',
        social_environment: answers.social_environment || []
      },
      thinking_patterns: {
        attention_focus: answers.attention_focus || 5,
        mind_wandering: answers.mind_wandering || [],
        emotional_awareness: answers.emotional_awareness || 5,
        rumination_patterns: answers.rumination_patterns || '',
        decision_making: answers.decision_making || '',
        self_talk: answers.self_talk || {},
        perfectionism: answers.perfectionism || '',
        openness_experience: answers.openness_experience || 5
      },
      mindfulness_specific: {
        mindfulness_knowledge: answers.mindfulness_knowledge || {},
        posture_preferences: answers.posture_preferences || [],
        sensory_preferences: answers.sensory_preferences || {},
        anticipated_barriers: answers.anticipated_barriers || [],
        success_metrics: answers.success_metrics || []
      },
      metadata: {
        completion_date: new Date().toISOString(),
        total_questions: 27,
        completion_rate: 100
      }
    };

    onComplete(organizedData);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '20px',
        padding: '40px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Loading your assessment...</h2>
      </div>
    );
  }

  const currentPhaseInfo = phases.find(p => p.id === currentPhase);
  const progress = (currentQuestion / 27) * 100;
  const currentAnswer = answers[getQuestionKey(currentQuestion)];

  function getQuestionKey(questionNum: number): string {
    const keyMap: Record<number, string> = {
      1: 'goals', 2: 'experience_level', 3: 'nationality', 4: 'residence_country', 5: 'age_range',
      6: 'time_commitment', 7: 'learning_styles', 8: 'energy_pattern', 9: 'stress_triggers', 
      10: 'coping_mechanisms', 11: 'sleep_pattern', 12: 'technology_relationship',
      13: 'physical_activity', 14: 'social_environment', 15: 'attention_focus', 16: 'mind_wandering', 
      17: 'emotional_awareness', 18: 'rumination_patterns', 19: 'decision_making', 20: 'self_talk', 
      21: 'perfectionism', 22: 'openness_experience', 23: 'mindfulness_knowledge', 24: 'posture_preferences', 
      25: 'sensory_preferences', 26: 'anticipated_barriers', 27: 'success_metrics'
    };
    return keyMap[questionNum] || `q${questionNum}`;
  }

  const renderQuestion = () => {
    const questionKey = getQuestionKey(currentQuestion);
    const answer = answers[questionKey];

    switch (currentQuestion) {
      // PHASE 1: DEMOGRAPHICS & MOTIVATION ASSESSMENT (1-7)
      case 1:
        return (
          <div className="question-container">
            <h2>🎯 Welcome to your mindfulness journey!</h2>
            <p>What brings you to the Return of Attention app today? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'meditation', label: 'Learn meditation and mindfulness', icon: '🧘' },
                { id: 'stress', label: 'Reduce stress and anxiety', icon: '😌' },
                { id: 'focus', label: 'Improve focus and concentration', icon: '🎯' },
                { id: 'sleep', label: 'Better sleep quality', icon: '😴' },
                { id: 'resilience', label: 'Build mental resilience', icon: '💪' },
                { id: 'growth', label: 'Personal growth and self-awareness', icon: '🌱' },
                { id: 'mental_health', label: 'Support mental health treatment', icon: '🏥' },
                { id: 'consciousness', label: 'Explore consciousness and attention training', icon: '🧠' }
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

      case 2:
        return (
          <div className="question-container">
            <h2>📊 Experience Level Assessment</h2>
            <p>How would you describe your experience with meditation or mindfulness practices?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 5}
                onChange={(e) => handleAnswer('experience_level', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <div className="slider-label-container">
                  <span className="slider-label">Complete beginner</span>
                  <span className="slider-label">Some experience</span>
                  <span className="slider-label">Regular practitioner</span>
                  <span className="slider-label">Advanced</span>
                </div>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="question-container">
            <h2>🌍 Nationality</h2>
            <p>What is your nationality?</p>
            <div className="dropdown-container">
              <select
                value={answer || ''}
                onChange={(e) => handleAnswer('nationality', e.target.value)}
                className="country-dropdown"
              >
                <option value="">Select your nationality...</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="question-container">
            <h2>🏠 Country of Residence</h2>
            <p>Which country do you currently live in?</p>
            <div className="dropdown-container">
              <select
                value={answer || ''}
                onChange={(e) => handleAnswer('residence_country', e.target.value)}
                className="country-dropdown"
              >
                <option value="">Select your country of residence...</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 5:
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

      case 6:
        return (
          <div className="question-container">
            <h2>⏰ Time Commitment Reality Check</h2>
            <p>Realistically, how much time can you dedicate to mindfulness practice on most days?</p>
            <div className="options-grid">
              {[
                { id: '5-10min', label: '5-10 minutes', desc: 'Beginner friendly', icon: '⏱️' },
                { id: '10-20min', label: '10-20 minutes', desc: 'Building consistency', icon: '⏰' },
                { id: '20-30min', label: '20-30 minutes', desc: 'Committed practice', icon: '🕐' },
                { id: '30+min', label: '30+ minutes', desc: 'Intensive development', icon: '⏳' },
                { id: 'varies', label: 'Varies day to day', desc: 'Flexible approach', icon: '🔄' }
              ].map((option) => (
                <button
                  key={option.id}
                  className={`option-button ${answer === option.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('time_commitment', option.id)}
                >
                  <span className="option-icon">{option.icon}</span>
                  <div className="option-content">
                    <span className="option-label">{option.label}</span>
                    <span className="option-desc">{option.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="question-container">
            <h2>🎓 Learning Style Preferences</h2>
            <p>How do you prefer to learn new skills? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'reading', label: 'Reading detailed instructions', icon: '📖' },
                { id: 'audio', label: 'Listening to guided audio', icon: '🎧' },
                { id: 'visual', label: 'Watching demonstrations', icon: '👀' },
                { id: 'hands_on', label: 'Hands-on practice and experimentation', icon: '✋' },
                { id: 'community', label: 'Learning with others/community', icon: '👥' },
                { id: 'data', label: 'Tracking progress with data', icon: '📊' },
                { id: 'creative', label: 'Creative and visual approaches', icon: '🎨' }
              ].map((style) => (
                <button
                  key={style.id}
                  className={`option-button ${(answer || []).includes(style.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(style.id)
                      ? current.filter((s: string) => s !== style.id)
                      : [...current, style.id];
                    handleAnswer('learning_styles', updated);
                  }}
                >
                  <span className="option-icon">{style.icon}</span>
                  <span className="option-text">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // PHASE 2: LIFESTYLE & DAILY PATTERNS (8-14)
      case 8:
        return (
          <div className="question-container">
            <h2>⚡ Daily Energy Patterns</h2>
            <p>When do you typically feel most energetic during the day?</p>
            <div className="options-grid">
              {[
                { id: 'early_morning', label: 'Early Morning (6-9 AM)', icon: '🌅' },
                { id: 'morning', label: 'Morning (9-12 PM)', icon: '☀️' },
                { id: 'afternoon', label: 'Afternoon (12-5 PM)', icon: '🌤️' },
                { id: 'evening', label: 'Evening (5-8 PM)', icon: '🌆' },
                { id: 'night', label: 'Night (8-11 PM)', icon: '🌙' },
                { id: 'varies', label: 'It varies day to day', icon: '🔄' }
              ].map((time) => (
                <button
                  key={time.id}
                  className={`option-button ${answer === time.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('energy_pattern', time.id)}
                >
                  <span className="option-icon">{time.icon}</span>
                  <span className="option-text">{time.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 9:
        return (
          <div className="question-container">
            <h2>😰 Stress Triggers Assessment</h2>
            <p>Which situations typically increase your stress levels? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'work_pressure', label: 'Work deadlines and pressure', icon: '💼' },
                { id: 'social', label: 'Social interactions and relationships', icon: '👥' },
                { id: 'financial', label: 'Financial concerns', icon: '💰' },
                { id: 'health', label: 'Health and physical issues', icon: '🏥' },
                { id: 'technology', label: 'Technology and information overload', icon: '📱' },
                { id: 'uncertainty', label: 'Uncertainty and change', icon: '❓' },
                { id: 'time_management', label: 'Time management challenges', icon: '⏰' },
                { id: 'family', label: 'Family and personal responsibilities', icon: '👨‍👩‍👧‍👦' }
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

      case 10:
        return (
          <div className="question-container">
            <h2>🛠️ Current Coping Mechanisms</h2>
            <p>When you're stressed or overwhelmed, what do you typically do? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'exercise', label: 'Physical exercise or movement', icon: '🏃‍♂️' },
                { id: 'talk', label: 'Talk to friends or family', icon: '💬' },
                { id: 'music', label: 'Listen to music', icon: '🎵' },
                { id: 'entertainment', label: 'Watch TV or entertainment', icon: '📺' },
                { id: 'social_media', label: 'Use social media', icon: '📱' },
                { id: 'eat_drink', label: 'Eat or drink something', icon: '🍿' },
                { id: 'rest', label: 'Take a break or nap', icon: '😴' },
                { id: 'work_harder', label: 'Work harder to solve the problem', icon: '💪' },
                { id: 'avoid', label: 'Avoid the situation', icon: '🙈' },
                { id: 'breathing', label: 'Use breathing techniques', icon: '🫁' }
              ].map((mechanism) => (
                <button
                  key={mechanism.id}
                  className={`option-button ${(answer || []).includes(mechanism.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(mechanism.id)
                      ? current.filter((m: string) => m !== mechanism.id)
                      : [...current, mechanism.id];
                    handleAnswer('coping_mechanisms', updated);
                  }}
                >
                  <span className="option-icon">{mechanism.icon}</span>
                  <span className="option-text">{mechanism.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="question-container">
            <h2>😴 Sleep and Rest Patterns</h2>
            <p>How would you rate your overall sleep quality?</p>
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
                <div className="slider-label-container">
                  <span className="slider-label">Very poor sleep</span>
                  <span className="slider-label">Below average</span>
                  <span className="slider-label">Average sleep quality</span>
                  <span className="slider-label">Good sleep</span>
                  <span className="slider-label">Excellent sleep quality</span>
                </div>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="question-container">
            <h2>📱 Technology Relationship</h2>
            <p>How would you describe your relationship with technology and digital devices?</p>
            <div className="options-grid">
              {[
                { id: 'minimal', label: 'Minimal usage, prefer offline activities', icon: '📵' },
                { id: 'balanced', label: 'Balanced usage, some digital boundaries', icon: '⚖️' },
                { id: 'heavy', label: 'Heavy usage, often feel overwhelmed', icon: '📱' },
                { id: 'addicted', label: 'Feel addicted, want to reduce usage', icon: '🔗' },
                { id: 'professional', label: 'Mostly professional/work-related usage', icon: '💼' },
                { id: 'social', label: 'Primarily for social connection', icon: '👥' }
              ].map((relationship) => (
                <button
                  key={relationship.id}
                  className={`option-button ${answer === relationship.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('technology_relationship', relationship.id)}
                >
                  <span className="option-icon">{relationship.icon}</span>
                  <span className="option-text">{relationship.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 13:
        return (
          <div className="question-container">
            <h2>🏃‍♀️ Physical Activity and Health</h2>
            <p>How would you describe your current physical activity level?</p>
            <div className="options-grid">
              {[
                { id: 'sedentary', label: 'Sedentary (minimal movement)', icon: '🪑' },
                { id: 'light', label: 'Lightly active (occasional walks)', icon: '🚶‍♂️' },
                { id: 'moderate', label: 'Moderately active (regular exercise)', icon: '🏃‍♂️' },
                { id: 'very_active', label: 'Very active (daily intense activity)', icon: '💪' },
                { id: 'athlete', label: 'Athlete level (competitive/professional)', icon: '🏆' }
              ].map((level) => (
                <button
                  key={level.id}
                  className={`option-button ${answer === level.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('physical_activity', level.id)}
                >
                  <span className="option-icon">{level.icon}</span>
                  <span className="option-text">{level.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 14:
        return (
          <div className="question-container">
            <h2>👥 Social Environment</h2>
            <p>Who in your life would be supportive of your mindfulness journey? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'family', label: 'Family members', icon: '👨‍👩‍👧‍👦' },
                { id: 'friends', label: 'Close friends', icon: '👥' },
                { id: 'colleagues', label: 'Work colleagues', icon: '💼' },
                { id: 'partner', label: 'Romantic partner/spouse', icon: '💑' },
                { id: 'online', label: 'Online communities', icon: '🌐' },
                { id: 'alone', label: 'Prefer to practice alone', icon: '🧘‍♂️' },
                { id: 'none', label: 'Limited support system', icon: '🤷‍♂️' }
              ].map((support) => (
                <button
                  key={support.id}
                  className={`option-button ${(answer || []).includes(support.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(support.id)
                      ? current.filter((s: string) => s !== support.id)
                      : [...current, support.id];
                    handleAnswer('social_environment', updated);
                  }}
                >
                  <span className="option-icon">{support.icon}</span>
                  <span className="option-text">{support.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      // PHASE 3: THINKING PATTERNS & MENTAL HABITS (15-22)
      case 15:
        return (
          <div className="question-container">
            <h2>🎯 Attention and Focus Assessment</h2>
            <p>How would you rate your ability to maintain focus during daily activities?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 5}
                onChange={(e) => handleAnswer('attention_focus', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <div className="slider-label-container">
                  <span className="slider-label">Very easily distracted</span>
                  <span className="slider-label">Below average focus</span>
                  <span className="slider-label">Average attention span</span>
                  <span className="slider-label">Good focus ability</span>
                  <span className="slider-label">Exceptional concentration</span>
                </div>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      case 16:
        return (
          <div className="question-container">
            <h2>🤔 Mind Wandering Patterns</h2>
            <p>When your mind wanders, where does it typically go? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'past_events', label: 'Past events and memories', icon: '⏪' },
                { id: 'future_plans', label: 'Future plans and worries', icon: '⏩' },
                { id: 'current_problems', label: 'Current problems to solve', icon: '🧩' },
                { id: 'creative_ideas', label: 'Creative ideas and imagination', icon: '💡' },
                { id: 'relationships', label: 'Other people and relationships', icon: '💕' },
                { id: 'physical_sensations', label: 'Physical sensations and comfort', icon: '🫂' },
                { id: 'random_thoughts', label: 'Random, disconnected thoughts', icon: '🌀' }
              ].map((pattern) => (
                <button
                  key={pattern.id}
                  className={`option-button ${(answer || []).includes(pattern.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(pattern.id)
                      ? current.filter((p: string) => p !== pattern.id)
                      : [...current, pattern.id];
                    handleAnswer('mind_wandering', updated);
                  }}
                >
                  <span className="option-icon">{pattern.icon}</span>
                  <span className="option-text">{pattern.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 17:
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
                <div className="slider-label-container">
                  <span className="slider-label">Rarely notice emotions</span>
                  <span className="slider-label">Sometimes aware</span>
                  <span className="slider-label">Moderately aware</span>
                  <span className="slider-label">Very emotionally aware</span>
                  <span className="slider-label">Exceptional emotional intelligence</span>
                </div>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      case 18:
        return (
          <div className="question-container">
            <h2>🔄 Rumination and Worry Patterns</h2>
            <p>How often do you find yourself stuck in repetitive thinking or worry?</p>
            <div className="options-grid">
              {[
                { id: 'never', label: 'Never or very rarely', icon: '😌' },
                { id: 'rarely', label: 'Rarely (few times a month)', icon: '🙂' },
                { id: 'sometimes', label: 'Sometimes (few times a week)', icon: '😐' },
                { id: 'often', label: 'Often (daily)', icon: '😟' },
                { id: 'constantly', label: 'Constantly (most of the day)', icon: '😰' }
              ].map((frequency) => (
                <button
                  key={frequency.id}
                  className={`option-button ${answer === frequency.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('rumination_patterns', frequency.id)}
                >
                  <span className="option-icon">{frequency.icon}</span>
                  <span className="option-text">{frequency.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 19:
        return (
          <div className="question-container">
            <h2>🤯 Decision-Making Style</h2>
            <p>How do you typically make important decisions?</p>
            <div className="options-grid">
              {[
                { id: 'analytical', label: 'Analytical (research and logic)', icon: '🔍' },
                { id: 'intuitive', label: 'Intuitive (gut feelings)', icon: '💫' },
                { id: 'collaborative', label: 'Collaborative (seek others\' input)', icon: '👥' },
                { id: 'impulsive', label: 'Impulsive (quick decisions)', icon: '⚡' },
                { id: 'avoidant', label: 'Avoidant (delay or avoid deciding)', icon: '🤷‍♂️' },
                { id: 'mixed', label: 'Mixed approach (depends on situation)', icon: '🔄' }
              ].map((style) => (
                <button
                  key={style.id}
                  className={`option-button ${answer === style.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('decision_making', style.id)}
                >
                  <span className="option-icon">{style.icon}</span>
                  <span className="option-text">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 20:
        return (
          <div className="question-container">
            <h2>🗣️ Self-Talk Patterns</h2>
            <p>What's the typical tone of your inner voice or self-talk?</p>
            <div className="dual-slider-container">
              <div className="slider-item">
                <label>Critical vs. Supportive</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={(answer?.critical_supportive) || 5}
                  onChange={(e) => handleAnswer('self_talk', {
                    ...answer,
                    critical_supportive: parseInt(e.target.value)
                  })}
                  className="range-slider"
                />
                <div className="slider-endpoints">
                  <span>Very Critical</span>
                  <span>Very Supportive</span>
                </div>
              </div>
              <div className="slider-item">
                <label>Anxious vs. Calm</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={(answer?.anxious_calm) || 5}
                  onChange={(e) => handleAnswer('self_talk', {
                    ...answer,
                    anxious_calm: parseInt(e.target.value)
                  })}
                  className="range-slider"
                />
                <div className="slider-endpoints">
                  <span>Very Anxious</span>
                  <span>Very Calm</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 21:
        return (
          <div className="question-container">
            <h2>🎯 Perfectionism and Standards</h2>
            <p>How do you approach goals and standards for yourself?</p>
            <div className="options-grid">
              {[
                { id: 'realistic', label: 'Realistic standards, accept "good enough"', icon: '✅' },
                { id: 'high', label: 'High standards, strive for excellence', icon: '🌟' },
                { id: 'perfectionist', label: 'Perfectionist, hard on myself for mistakes', icon: '🎯' },
                { id: 'flexible', label: 'Flexible, adjust standards based on situation', icon: '🤹‍♂️' },
                { id: 'low', label: 'Low standards, often settle for less', icon: '🤷‍♂️' }
              ].map((approach) => (
                <button
                  key={approach.id}
                  className={`option-button ${answer === approach.id ? 'selected' : ''}`}
                  onClick={() => handleAnswer('perfectionism', approach.id)}
                >
                  <span className="option-icon">{approach.icon}</span>
                  <span className="option-text">{approach.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 22:
        return (
          <div className="question-container">
            <h2>🔓 Openness to New Experiences</h2>
            <p>How comfortable are you with trying new approaches or techniques?</p>
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="10"
                value={answer || 5}
                onChange={(e) => handleAnswer('openness_experience', parseInt(e.target.value))}
                className="range-slider"
              />
              <div className="slider-labels">
                <div className="slider-label-container">
                  <span className="slider-label">Resistant to change</span>
                  <span className="slider-label">Cautious about new things</span>
                  <span className="slider-label">Open but prefer gradual changes</span>
                  <span className="slider-label">Enjoy new experiences</span>
                  <span className="slider-label">Love experimentation</span>
                </div>
              </div>
              <div className="slider-value">Current: {answer || 5}/10</div>
            </div>
          </div>
        );

      // PHASE 4: MINDFULNESS-SPECIFIC ASSESSMENT (23-27)
      case 23:
        return (
          <div className="question-container">
            <h2>🧘 Current Mindfulness Understanding</h2>
            <p>How familiar are you with these mindfulness concepts? Rate each one:</p>
            <div className="concept-rating-grid">
              {[
                { id: 'present_moment', label: 'Present moment awareness', desc: 'Focusing attention on the here and now' },
                { id: 'non_judgmental', label: 'Non-judgmental observation', desc: 'Noticing without evaluating as good or bad' },
                { id: 'acceptance', label: 'Acceptance vs. resistance', desc: 'Allowing experiences without fighting them' },
                { id: 'mindful_breathing', label: 'Mindful breathing', desc: 'Using breath as an anchor for attention' },
                { id: 'body_awareness', label: 'Body awareness', desc: 'Tuning into physical sensations mindfully' }
              ].map((concept) => (
                <div key={concept.id} className="concept-item">
                  <div className="concept-info">
                    <h4>{concept.label}</h4>
                    <p>{concept.desc}</p>
                  </div>
                  <div className="concept-rating">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`rating-button ${(answer?.[concept.id]) === rating ? 'selected' : ''}`}
                        onClick={() => handleAnswer('mindfulness_knowledge', {
                          ...answer,
                          [concept.id]: rating
                        })}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="rating-legend">
              <span>1 = Never heard of it</span>
              <span>3 = Somewhat familiar</span>
              <span>5 = Very familiar</span>
            </div>
          </div>
        );

      case 24:
        return (
          <div className="question-container">
            <h2>🪑 Meditation Posture Preferences</h2>
            <p>Which meditation postures feel most comfortable for you? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'chair', label: 'Chair sitting', desc: 'Sitting upright on a chair', icon: '🪑' },
                { id: 'floor_cushion', label: 'Floor cushion', desc: 'Sitting cross-legged on cushion', icon: '🧘‍♂️' },
                { id: 'lotus', label: 'Lotus/cross-legged', desc: 'Traditional crossed-leg position', icon: '🧘‍♀️' },
                { id: 'lying_down', label: 'Lying down', desc: 'Flat on back with arms at sides', icon: '🛌' },
                { id: 'walking', label: 'Walking meditation', desc: 'Mindful walking practice', icon: '🚶‍♂️' },
                { id: 'standing', label: 'Standing meditation', desc: 'Upright standing position', icon: '🧍‍♂️' }
              ].map((posture) => (
                <button
                  key={posture.id}
                  className={`option-button ${(answer || []).includes(posture.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(posture.id)
                      ? current.filter((p: string) => p !== posture.id)
                      : [...current, posture.id];
                    handleAnswer('posture_preferences', updated);
                  }}
                >
                  <span className="option-icon">{posture.icon}</span>
                  <div className="option-content">
                    <span className="option-label">{posture.label}</span>
                    <span className="option-desc">{posture.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 25:
        return (
          <div className="question-container">
            <h2>🌿 Sensory Preferences</h2>
            <p>What kind of environment helps you feel most calm and focused?</p>
            <div className="environment-builder">
              <div className="env-category">
                <h4>🔊 Sound</h4>
                <div className="env-options">
                  {['Silence', 'Nature sounds', 'Soft music', 'Guided voice', 'White noise'].map((option) => (
                    <button
                      key={option}
                      className={`env-option ${(answer?.sound || []).includes(option) ? 'selected' : ''}`}
                      onClick={() => {
                        const current = answer?.sound || [];
                        const updated = current.includes(option)
                          ? current.filter((s: string) => s !== option)
                          : [...current, option];
                        handleAnswer('sensory_preferences', {
                          ...answer,
                          sound: updated
                        });
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="env-category">
                <h4>💡 Lighting</h4>
                <div className="env-options">
                  {['Bright light', 'Dim lighting', 'Natural light', 'Candles', 'Darkness'].map((option) => (
                    <button
                      key={option}
                      className={`env-option ${(answer?.lighting || []).includes(option) ? 'selected' : ''}`}
                      onClick={() => {
                        const current = answer?.lighting || [];
                        const updated = current.includes(option)
                          ? current.filter((l: string) => l !== option)
                          : [...current, option];
                        handleAnswer('sensory_preferences', {
                          ...answer,
                          lighting: updated
                        });
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="env-category">
                <h4>🌸 Scents</h4>
                <div className="env-options">
                  {['No scents', 'Natural/outdoors', 'Incense', 'Essential oils', 'Candles'].map((option) => (
                    <button
                      key={option}
                      className={`env-option ${(answer?.scents || []).includes(option) ? 'selected' : ''}`}
                      onClick={() => {
                        const current = answer?.scents || [];
                        const updated = current.includes(option)
                          ? current.filter((s: string) => s !== option)
                          : [...current, option];
                        handleAnswer('sensory_preferences', {
                          ...answer,
                          scents: updated
                        });
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 26:
        return (
          <div className="question-container">
            <h2>🚧 Barriers and Challenges</h2>
            <p>What challenges do you anticipate in developing a mindfulness practice? (Select all that apply)</p>
            <div className="options-grid">
              {[
                { id: 'time', label: 'Finding time in busy schedule', icon: '⏰', concern: 'high' },
                { id: 'motivation', label: 'Staying motivated and consistent', icon: '💪', concern: 'medium' },
                { id: 'physical', label: 'Physical discomfort during practice', icon: '🪑', concern: 'low' },
                { id: 'restless_mind', label: 'Mind too busy or restless', icon: '🌀', concern: 'high' },
                { id: 'skepticism', label: 'Skepticism about effectiveness', icon: '🤔', concern: 'medium' },
                { id: 'self_conscious', label: 'Feeling self-conscious or awkward', icon: '😳', concern: 'low' },
                { id: 'not_knowing', label: 'Not knowing if I\'m doing it right', icon: '❓', concern: 'medium' },
                { id: 'falling_asleep', label: 'Falling asleep during practice', icon: '😴', concern: 'low' }
              ].map((barrier) => (
                <button
                  key={barrier.id}
                  className={`option-button barrier-${barrier.concern} ${(answer || []).includes(barrier.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(barrier.id)
                      ? current.filter((b: string) => b !== barrier.id)
                      : [...current, barrier.id];
                    handleAnswer('anticipated_barriers', updated);
                  }}
                >
                  <span className="option-icon">{barrier.icon}</span>
                  <span className="option-text">{barrier.label}</span>
                  <span className="concern-level">{barrier.concern} concern</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 27:
        return (
          <div className="question-container">
            <h2>🎯 Success Metrics</h2>
            <p>How would you know that your mindfulness practice is working? (Select your top priorities)</p>
            <div className="options-grid">
              {[
                { id: 'calmer_stress', label: 'Feeling calmer in stressful situations', icon: '😌' },
                { id: 'better_sleep', label: 'Better sleep quality', icon: '😴' },
                { id: 'improved_focus', label: 'Improved focus and concentration', icon: '🎯' },
                { id: 'emotional_balance', label: 'More emotional balance', icon: '⚖️' },
                { id: 'self_awareness', label: 'Increased self-awareness', icon: '🪞' },
                { id: 'better_relationships', label: 'Better relationships', icon: '💕' },
                { id: 'physical_relaxation', label: 'Physical relaxation and less tension', icon: '🫂' },
                { id: 'inner_peace', label: 'Sense of inner peace', icon: '☮️' },
                { id: 'clarity', label: 'Mental clarity and less brain fog', icon: '💡' },
                { id: 'resilience', label: 'Greater resilience to challenges', icon: '💪' }
              ].map((metric) => (
                <button
                  key={metric.id}
                  className={`option-button ${(answer || []).includes(metric.id) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = answer || [];
                    const updated = current.includes(metric.id)
                      ? current.filter((m: string) => m !== metric.id)
                      : [...current, metric.id];
                    handleAnswer('success_metrics', updated);
                  }}
                >
                  <span className="option-icon">{metric.icon}</span>
                  <span className="option-text">{metric.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Question not found</div>;
    }
  };

  return (
    <div className="questionnaire-container">
      <style>{`
        .questionnaire-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .questionnaire-progress {
          background: white;
          border-radius: 15px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .progress-text {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
        }

        .progress-percentage {
          font-size: 14px;
          color: #667eea;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .phase-indicators {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .phase-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 10px;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .phase-indicator.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: #667eea;
        }

        .phase-indicator.completed {
          background: #48bb78;
          color: white;
          border-color: #48bb78;
        }

        .phase-icon {
          font-size: 20px;
        }

        .phase-name {
          font-size: 12px;
          font-weight: 500;
        }

        .question-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .question-container h2 {
          font-size: 28px;
          color: #2d3748;
          margin-bottom: 15px;
          text-align: center;
        }

        .question-container p {
          font-size: 16px;
          color: #4a5568;
          text-align: center;
          margin-bottom: 30px;
          line-height: 1.6;
        }

        .options-grid {
          display: grid;
          gap: 15px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .option-button {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .option-button:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .option-button.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .option-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .option-text {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }

        .option-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .option-label {
          font-size: 14px;
          font-weight: 600;
        }

        .option-desc {
          font-size: 12px;
          opacity: 0.8;
        }

        .slider-container {
          padding: 30px 20px;
        }

        .range-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 20px;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .range-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .slider-labels {
          margin-bottom: 15px;
        }

        .slider-label-container {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .slider-label {
          font-size: 12px;
          color: #4a5568;
          text-align: center;
          flex: 1;
        }

        .slider-value {
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: #667eea;
        }

        .dropdown-container {
          max-width: 400px;
          margin: 0 auto;
        }

        .country-dropdown {
          width: 100%;
          padding: 15px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          background: white;
          cursor: pointer;
        }

        .country-dropdown:focus {
          outline: none;
          border-color: #667eea;
        }

        .dual-slider-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding: 20px;
        }

        .slider-item {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .slider-item label {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
        }

        .slider-endpoints {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #4a5568;
        }

        .concept-rating-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .concept-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
        }

        .concept-info h4 {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 5px;
        }

        .concept-info p {
          font-size: 12px;
          color: #4a5568;
          margin: 0;
        }

        .concept-rating {
          display: flex;
          gap: 8px;
        }

        .rating-button {
          width: 40px;
          height: 40px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .rating-button:hover {
          border-color: #667eea;
        }

        .rating-button.selected {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .rating-legend {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          font-size: 12px;
          color: #4a5568;
        }

        .environment-builder {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .env-category h4 {
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 15px;
          text-align: center;
        }

        .env-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .env-option {
          padding: 12px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 25px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .env-option:hover {
          border-color: #667eea;
        }

        .env-option.selected {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .barrier-high {
          border-color: #f56565;
        }

        .barrier-medium {
          border-color: #ed8936;
        }

        .barrier-low {
          border-color: #38b2ac;
        }

        .concern-level {
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 600;
          opacity: 0.8;
        }

        .questionnaire-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .back-button, .next-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button {
          background: #e2e8f0;
          color: #4a5568;
        }

        .back-button:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .back-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .next-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .next-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .next-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-center {
          display: flex;
          align-items: center;
        }

        .phase-description {
          text-align: center;
          color: #4a5568;
          font-size: 14px;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .questionnaire-container {
            padding: 15px;
          }

          .question-content {
            padding: 25px 20px;
          }

          .question-container h2 {
            font-size: 22px;
          }

          .options-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .option-button {
            padding: 15px;
            gap: 12px;
          }

          .option-icon {
            font-size: 20px;
          }

          .option-text {
            font-size: 13px;
          }

          .phase-indicators {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .phase-indicator {
            padding: 10px;
          }

          .phase-name {
            font-size: 11px;
          }

          .questionnaire-navigation {
            padding: 15px 20px;
            flex-direction: column;
            gap: 15px;
          }

          .back-button, .next-button {
            width: 100%;
            padding: 15px;
          }

          .nav-center {
            order: -1;
          }

          .concept-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .concept-rating {
            align-self: center;
          }

          .dual-slider-container {
            padding: 15px;
          }

          .slider-label-container {
            flex-direction: column;
            gap: 5px;
          }

          .slider-label {
            font-size: 10px;
          }

          .env-options {
            justify-content: flex-start;
          }

          .env-option {
            padding: 10px 16px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .questionnaire-container {
            padding: 10px;
          }

          .question-content {
            padding: 20px 15px;
          }

          .question-container h2 {
            font-size: 20px;
          }

          .question-container p {
            font-size: 14px;
          }

          .option-button {
            padding: 12px;
          }

          .country-dropdown {
            padding: 12px;
            font-size: 14px;
          }

          .rating-button {
            width: 35px;
            height: 35px;
            font-size: 14px;
          }

          .questionnaire-progress {
            padding: 15px;
          }

          .progress-text {
            font-size: 14px;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Progress bar */}
      <div className="questionnaire-progress">
        <div className="progress-info">
          <span className="progress-text">
            {currentPhaseInfo?.icon} {currentPhaseInfo?.name} - Question {currentQuestion} of 27
          </span>
          <span className="progress-percentage">{Math.round(progress)}% Complete</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="phase-indicators">
          {phases.map((phase) => (
            <div 
              key={phase.id}
              className={`phase-indicator ${phase.id === currentPhase ? 'active' : ''} ${phase.id < currentPhase ? 'completed' : ''}`}
            >
              <span className="phase-icon">{phase.icon}</span>
              <span className="phase-name">{phase.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Question content */}
      <div className="question-content">
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <div className="questionnaire-navigation">
        <button 
          className="back-button" 
          onClick={prevQuestion}
          disabled={currentQuestion === 1}
        >
          ← Back
        </button>

        <button 
          className="next-button" 
          onClick={nextQuestion}
          disabled={!currentAnswer}
        >
          {currentQuestion === 27 ? 'Complete Assessment' : 'Next →'}
        </button>
      </div>

      {/* Phase description */}
      {currentPhaseInfo && (
        <div className="phase-description">
          <p>{currentPhaseInfo.description}</p>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;