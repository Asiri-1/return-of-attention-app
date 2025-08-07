// ✅ FIREBASE-ONLY ChatInterface.tsx - Updated with SmartAI Integration
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useUser } from '../../contexts/user/UserContext';
import { usePractice } from '../../contexts/practice/PracticeContext';
import { useWellness } from '../../contexts/wellness/WellnessContext';
import { useSmartAI } from '../../services/SmartAIOrchestrator';
import './ChatInterface.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'guru';
  timestamp: Date;
  confidence?: number;
  bookWisdom?: string[];
  practicalGuidance?: string[];
  source?: string;
  isSubstantive?: boolean;
  // 🚀 Smart AI metadata
  smartAIMetadata?: {
    type: 'casual' | 'clarification' | 'deep_guidance' | 'supportive';
    processingMethod: 'intent_only' | 'full_ai' | 'hybrid';
    responseTime: number;
    feedbackId: string;
  };
}

const ChatInterface: React.FC = () => {
  // ✅ FIREBASE-ONLY: Use Firebase contexts only
  const { currentUser } = useAuth();
  const { userProfile } = useUser();
  const { sessions, stats } = usePractice();
  const { emotionalNotes } = useWellness();
  
  // 🚀 Smart AI integration
  const { sendMessage: sendSmartMessage, provideFeedback, isLoading: smartAILoading } = useSmartAI('main-chat');
  
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus] = useState<'ready'>('ready');
  const [initialized, setInitialized] = useState(false);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced function to determine substantive responses
  const isSubstantiveResponse = (userMessage: string, responseText: string, smartAIType?: string): boolean => {
    // If SmartAI classified it as deep_guidance, it's definitely substantive
    if (smartAIType === 'deep_guidance') return true;
    
    // If SmartAI classified it as casual, it's probably not substantive
    if (smartAIType === 'casual') return false;

    const userLC = userMessage.toLowerCase().trim();
    const responseLC = responseText.toLowerCase();

    // Simple greetings and conversational responses - DON'T show enhanced UI
    const simplePatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)$/,
      /^(thanks?|thank you|ok|okay|yes|no|sure)$/,
      /^(how are you|what's up|what's happening)$/,
      /^(bye|goodbye|see you|talk later)$/,
      /^(cool|nice|great|awesome|interesting)$/
    ];

    if (simplePatterns.some(pattern => pattern.test(userLC))) {
      return false;
    }

    // Substantive meditation/mindfulness topics - DO show enhanced UI
    const substantivePatterns = [
      /pahm|matrix/i,
      /meditat|mindful/i,
      /anxious|anxiety|stress|worry/i,
      /breath|breathing/i,
      /stage|level|practice/i,
      /thoughts|thinking|mind/i,
      /aware|awareness/i,
      /focus|concentration/i,
      /guidance|help|teach|learn/i,
      /challenge|difficult|problem/i
    ];

    const hasSubstantiveContent = substantivePatterns.some(pattern => 
      pattern.test(userLC) || pattern.test(responseLC)
    );

    const isLongResponse = responseText.length > 100;
    return hasSubstantiveContent || isLongResponse;
  };

  // ✅ FIREBASE-ONLY: User context from Firebase data only
  const userContext = useCallback(() => {
    // Get current stage from Firebase userProfile
    const currentStage = userProfile?.stageProgress?.currentStage || 1;
    
    // Get goals from Firebase userProfile (using safe defaults since structure is unclear)
    const goals: string[] = []; // Default empty array since goals structure is not defined in UserProfile type

    // Get practice analytics from Firebase contexts
    const pahmData = {
      totalSessions: stats.totalSessions,
      averageQuality: stats.averageQuality,
      presentPercentage: stats.averagePresentPercentage || 0
    };

    const environmentData = {
      favoritePosture: 'seated', // Default since favoritePosture doesn't exist in preferences
      optimalTime: userProfile?.preferences?.optimalPracticeTime || 'morning'
    };

    return {
      uid: currentUser?.uid || '',
      currentStage,
      goals: Array.isArray(goals) ? goals : [],
      practiceAnalytics: {
        pahmData,
        environmentData,
        emotionalNotes: emotionalNotes.slice(0, 5) // Recent emotional notes
      },
      recentChallenges: ['restlessness'], // Default since challengeAreas doesn't exist
      currentMood: 6, // Could be derived from recent emotional notes
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon',
      totalSessions: stats.totalSessions,
      totalHours: Math.round(stats.totalMinutes / 60)
    };
  }, [currentUser?.uid, userProfile, stats, emotionalNotes]);

  // ✅ FIREBASE-ONLY: Initialize without localStorage
  useEffect(() => {
    if (initialized) return;
    
    const initialize = async () => {
      try {
        setSessionId(`session-${Date.now()}`);
        
        // No localStorage initialization needed for Firebase-only
        console.log('✅ Firebase-only chat initialized');
        
        setMessages([{
          id: '1',
          text: `Hello ${currentUser?.displayName || 'practitioner'}! I'm your PAHM Guru, ready to help with your mindfulness practice. How can I assist you today?`,
          sender: 'guru',
          timestamp: new Date(),
          source: 'ready',
          isSubstantive: false
        }]);
        
        setInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        setInitialized(true);
      }
    };
    
    initialize();
  }, [initialized, currentUser?.displayName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ FIREBASE-ONLY: Fallback response generator without localStorage
  const generateFirebaseFallbackResponse = (userMessage: string): Message => {
    const messageId = Date.now().toString();
    const userLC = userMessage.toLowerCase().trim();
    
    // Simple greetings with simple responses
    const greetingResponses: { [key: string]: string } = {
      'hello': 'Hello! How can I help you with your mindfulness practice today?',
      'hi': 'Hi there! What would you like to explore about meditation or mindfulness?',
      'hey': 'Hey! Ready to dive into some mindfulness practice?',
      'good morning': 'Good morning! A great time to start your mindfulness practice.',
      'good afternoon': 'Good afternoon! How has your practice been today?',
      'good evening': 'Good evening! Perfect time for some calming meditation.',
      'how are you': 'I\'m here and ready to help with your mindfulness journey! How are you feeling?',
      'thanks': 'You\'re welcome! Feel free to ask me anything about meditation or mindfulness.',
      'thank you': 'My pleasure! I\'m here whenever you need guidance on your practice.',
      'ok': 'Great! What would you like to explore next?',
      'cool': 'Glad you find it interesting! Any other questions about mindfulness?'
    };

    if (greetingResponses[userLC]) {
      return {
        id: messageId,
        text: greetingResponses[userLC],
        sender: 'guru',
        timestamp: new Date(),
        source: 'conversational',
        isSubstantive: false
      };
    }

    // Context-aware responses based on Firebase data
    const context = userContext();
    const currentStage = context.currentStage;
    
    // Stage-specific guidance
    const stageGuidance: { [key: number]: string } = {
      1: "As you're in Stage 1, focus on building consistency with daily practice. Even 5-10 minutes of stillness meditation can create a strong foundation.",
      2: "In Stage 2 (PAHM Trainee), you're learning to observe the 9-category matrix. Notice thoughts about past, present, and future with attachment, neutral, or aversion qualities.",
      3: "Stage 3 (PAHM Apprentice) involves deeper awareness of mental patterns. You're developing the ability to see thoughts without being caught by them.",
      4: "As a Stage 4 PAHM Practitioner, you're cultivating stable present-moment awareness. Your practice is becoming more refined and consistent.",
      5: "Stage 5 (PAHM Adept) represents advanced practice. You're likely experiencing longer periods of clear awareness and fewer mental distractions.",
      6: "Stage 6 (PAHM Master) is the culmination of the practice. You're integrating profound awareness into daily life with natural ease."
    };

    // PAHM-related responses
    if (userMessage.toLowerCase().includes('pahm') || userMessage.toLowerCase().includes('matrix')) {
      return {
        id: messageId,
        text: `The PAHM Matrix is a 9-category awareness practice. ${stageGuidance[currentStage] || stageGuidance[1]} Would you like me to explain any specific category?`,
        sender: 'guru',
        timestamp: new Date(),
        source: 'firebase-fallback',
        isSubstantive: true,
        bookWisdom: ['Awareness of mental formations is the first step to freedom'],
        practicalGuidance: [
          'Observe thoughts without judgment',
          'Notice the quality: attachment, neutral, or aversion',
          'Return attention to present moment when mind wanders'
        ]
      };
    }

    // Anxiety/stress responses
    if (/anxious|anxiety|stress|worry/.test(userLC)) {
      return {
        id: messageId,
        text: `I understand you're experiencing some anxiety or stress. ${stageGuidance[currentStage] || stageGuidance[1]} Mindful breathing can be especially helpful right now.`,
        sender: 'guru',
        timestamp: new Date(),
        source: 'firebase-fallback',
        isSubstantive: true,
        bookWisdom: ['This too shall pass - all mental states are impermanent'],
        practicalGuidance: [
          'Take three deep conscious breaths',
          'Notice the anxiety without fighting it',
          'Return attention to your breath anchor',
          'Remember: you are the awareness observing the anxiety'
        ]
      };
    }

    // Meditation guidance
    if (/meditat|practice|breath/.test(userLC)) {
      return {
        id: messageId,
        text: `Great question about meditation practice! ${stageGuidance[currentStage] || stageGuidance[1]} Your current practice statistics show ${context.totalSessions} sessions and ${context.totalHours} hours - excellent consistency!`,
        sender: 'guru',
        timestamp: new Date(),
        source: 'firebase-fallback',
        isSubstantive: true,
        bookWisdom: ['The path of meditation is walked step by step, breath by breath'],
        practicalGuidance: [
          'Maintain regular daily practice',
          'Focus on quality over quantity',
          'Use PAHM awareness during sessions',
          'Notice progress over weeks, not days'
        ]
      };
    }

    // Default response
    return {
      id: messageId,
      text: `I'm here to help with your mindfulness practice. ${stageGuidance[currentStage] || stageGuidance[1]} What specific aspect would you like to explore - breathing techniques, PAHM awareness, dealing with distractions, or something else?`,
      sender: 'guru',
      timestamp: new Date(),
      source: 'firebase-fallback',
      isSubstantive: true,
      practicalGuidance: [
        'Ask about specific meditation challenges',
        'Explore PAHM matrix categories',
        'Discuss daily practice integration',
        'Learn about your current stage techniques'
      ]
    };
  };

  // 🚀 FIREBASE-ONLY: Enhanced response generation with SmartAI
  const generateResponse = async (userMessage: string): Promise<Message> => {
    const messageId = Date.now().toString();
    
    try {
      // Step 1: Try SmartAI first
      console.log('🚀 Using SmartAI for:', userMessage);
      const smartResponse = await sendSmartMessage(userMessage);
      
      console.log('✅ SmartAI Response:', {
        type: smartResponse.type,
        method: smartResponse.metadata.processingMethod,
        time: smartResponse.metadata.responseTime
      });

      return {
        id: messageId,
        text: smartResponse.response,
        sender: 'guru',
        timestamp: new Date(),
        confidence: smartResponse.confidence,
        source: smartResponse.metadata.processingMethod === 'intent_only' ? 'smart-intent' : 
                smartResponse.metadata.processingMethod === 'full_ai' ? 'smart-full' : 'smart-hybrid',
        isSubstantive: isSubstantiveResponse(userMessage, smartResponse.response, smartResponse.type),
        // Map SmartAI response to existing format
        bookWisdom: smartResponse.shouldShowWisdom ? ['Every moment of recognition is a moment of awakening'] : undefined,
        practicalGuidance: smartResponse.shouldShowActions ? [
          'Return to present-moment awareness',
          'Notice the awareness that recognizes thoughts'
        ] : undefined,
        smartAIMetadata: {
          type: smartResponse.type,
          processingMethod: smartResponse.metadata.processingMethod,
          responseTime: smartResponse.metadata.responseTime,
          feedbackId: smartResponse.feedbackId
        }
      };

    } catch (smartAIError) {
      console.log('SmartAI failed, using Firebase fallback:', smartAIError);
      
      // Step 2: Try Firebase Functions
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://us-central1-return-of-attention-app.cloudfunctions.net/pahmGuruChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: userMessage,
            userContext: userContext(),
            sessionId: sessionId
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Firebase Functions response received');
          
          return {
            id: messageId,
            text: data.response,
            sender: 'guru',
            timestamp: new Date(),
            confidence: data.confidence,
            bookWisdom: [data.ancientWisdom],
            practicalGuidance: data.practicalActions,
            source: 'firebase-functions',
            isSubstantive: isSubstantiveResponse(userMessage, data.response)
          };
        }
      } catch (firebaseError) {
        console.log('Firebase Functions failed, using local fallback:', firebaseError);
      }
      
      // Step 3: Firebase-only local fallback (no localStorage)
      return generateFirebaseFallbackResponse(userMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || smartAILoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const guruResponse = await generateResponse(currentInput);
      setMessages(prev => [...prev, guruResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'guru',
        timestamp: new Date(),
        source: 'error',
        isSubstantive: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Feedback handling
  const handleFeedback = (
    feedbackId: string, 
    feedback: 'helpful' | 'irrelevant' | 'too_complex' | 'too_simple'
  ) => {
    provideFeedback(feedback);
    setShowFeedback(null);
    console.log('📊 Feedback sent:', feedback);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading && !smartAILoading) {
      setInputText(suggestion);
    }
  };

  // ✅ FIREBASE-ONLY: Get current stage from Firebase only
  const getCurrentStage = () => {
    return userProfile?.stageProgress?.currentStage || 1;
  };

  // ✅ FIREBASE-ONLY: Get practice hours from Firebase only
  const getPracticeHours = () => {
    return Math.round((stats.totalMinutes || 0) / 60);
  };

  // ✅ FIREBASE-ONLY: Get mood from recent emotional notes
  const getCurrentMood = () => {
    const recentNote = emotionalNotes[0];
    // Use actual EmotionalNoteData properties
    return recentNote?.emotion === 'joy' ? 8 :
           recentNote?.emotion === 'peaceful' ? 7 :
           recentNote?.emotion === 'neutral' ? 6 :
           recentNote?.emotion === 'sadness' ? 4 :
           recentNote?.emotion === 'anger' ? 3 :
           6; // Default mood
  };

  if (!initialized) {
    return (
      <div className="chat-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center animate-fadeIn">
            <div className="loading-spinner animate-glow" style={{ width: '48px', height: '48px', margin: '0 auto 24px' }}></div>
            <h2 style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem', fontWeight: '700' }}>
              Initializing Firebase PAHM Guru...
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Preparing your Firebase-powered mindfulness experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Enhanced Header */}
      <div className="chat-header">
        <div className="max-w-4xl mx-auto">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="animate-fadeIn">
              <h2>Firebase PAHM Guru</h2>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '8px' }}>
                🔥 Firebase-only with intelligent intent detection
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat-pill">
                <span>Stage: {getCurrentStage()}</span>
              </div>
              <div className="stat-pill">
                <span>Hours: {getPracticeHours()}</span>
              </div>
              <div className="stat-pill">
                <span>Mood: {getCurrentMood()}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={`message-wrapper ${message.sender}`}>
              {/* Avatar */}
              <div className={`avatar ${message.sender}`}>
                {message.sender === 'guru' ? '🧘' : (currentUser?.displayName?.[0]?.toUpperCase() || 'U')}
              </div>
              
              {/* Message Bubble */}
              <div className={`message-bubble ${message.sender}`}>
                <p className="message-text">{message.text}</p>
                
                {/* 🚀 Smart AI Processing Indicator */}
                {message.sender === 'guru' && message.smartAIMetadata && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    marginTop: '8px', 
                    padding: '4px 8px', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {message.smartAIMetadata.processingMethod === 'intent_only' && (
                      <>
                        <span>⚡</span>
                        <span>Fast Intent ({message.smartAIMetadata.responseTime}ms)</span>
                      </>
                    )}
                    {message.smartAIMetadata.processingMethod === 'full_ai' && (
                      <>
                        <span>🧠</span>
                        <span>Deep AI ({message.smartAIMetadata.responseTime}ms)</span>
                      </>
                    )}
                    {message.smartAIMetadata.processingMethod === 'hybrid' && (
                      <>
                        <span>🔄</span>
                        <span>Hybrid ({message.smartAIMetadata.responseTime}ms)</span>
                      </>
                    )}
                  </div>
                )}
                
                {/* Existing conditional display logic */}
                {message.sender === 'guru' && message.isSubstantive && (
                  <>
                    {/* Confidence Indicator */}
                    {message.confidence !== undefined && (
                      <div className="confidence-indicator">
                        <div className="confidence-header">
                          <span className="confidence-label">AI Confidence</span>
                          <span className="confidence-value">{Math.round(message.confidence * 100)}%</span>
                        </div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${message.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Book Wisdom */}
                    {message.bookWisdom && message.bookWisdom.length > 0 && message.bookWisdom[0] && (
                      <div className="book-wisdom">
                        <div className="wisdom-header">
                          <span className="wisdom-icon">💡</span>
                          <span className="wisdom-title">Ancient Wisdom</span>
                        </div>
                        {message.bookWisdom.slice(0, 2).map((wisdom, index) => (
                          <div key={index} className="wisdom-item">
                            {wisdom}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Practical Guidance */}
                    {message.practicalGuidance && message.practicalGuidance.length > 0 && (
                      <div className="practical-guidance">
                        <div className="guidance-header">
                          <span className="guidance-icon">🎯</span>
                          <span className="guidance-title">Practical Steps</span>
                        </div>
                        {message.practicalGuidance.slice(0, 4).map((guidance, index) => (
                          <div key={index} className="practical-step">
                            <span className="step-number">{index + 1}</span>
                            <span className="step-text">{guidance}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 🚀 Feedback buttons for SmartAI responses */}
                {message.sender === 'guru' && message.smartAIMetadata && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => setShowFeedback(showFeedback === message.id ? null : message.id)}
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        background: 'none',
                        border: 'none',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      Was this helpful?
                    </button>
                  </div>
                )}

                {/* 🚀 Feedback options */}
                {showFeedback === message.id && message.smartAIMetadata && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {[
                      { label: '👍 Helpful', value: 'helpful' as const },
                      { label: '👎 Not relevant', value: 'irrelevant' as const },
                      { label: '🤯 Too complex', value: 'too_complex' as const },
                      { label: '😴 Too simple', value: 'too_simple' as const }
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => handleFeedback(message.smartAIMetadata!.feedbackId, value)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          border: '1px solid #d1d5db',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          color: '#374151'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Timestamp with Source */}
                <p className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                  {message.source && (
                    <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                      {message.source === 'smart-intent' && '⚡'}
                      {message.source === 'smart-full' && '🧠'}
                      {message.source === 'smart-hybrid' && '🔄'}
                      {message.source === 'firebase-functions' && '☁️'}
                      {message.source === 'firebase-fallback' && '🔥'}
                      {message.source === 'conversational' && '💬'}
                      {message.source === 'ready' && '✅'}
                      {message.source === 'error' && '⚠️'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {(isLoading || smartAILoading) && (
            <div className="loading-wrapper">
              <div className="avatar guru">🧘</div>
              <div className="loading-bubble">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">Firebase PAHM Guru is thinking...</span>
                </div>
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Section */}
      <div className="chat-input-container">
        <div className="max-w-4xl mx-auto">
          <div className="input-wrapper">
            <div className="input-field-wrapper">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about PAHM practice, meditation stages, or specific challenges..."
                className="input-field"
                disabled={isLoading || smartAILoading}
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="clear-button"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || smartAILoading || !inputText.trim()}
              className="send-button"
            >
              {(isLoading || smartAILoading) ? (
                <div className="loading-spinner"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
          
          {/* Enhanced Suggestion Chips */}
          <div className="suggestions-container">
            {[
              'Hi there!', // Will use fast intent detection
              'What is the PAHM matrix?', // Will use full AI
              'I feel anxious', // Will use full AI  
              'Thanks!', // Will use fast intent detection
              'How to meditate properly?', // Will use full AI
              'Understanding mental formations' // Will use full AI
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-chip"
                disabled={isLoading || smartAILoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Knowledge Status */}
          <div className={`knowledge-status ${connectionStatus === 'ready' ? 'ready' : 'loading'}`}>
            <div className={`status-indicator ${connectionStatus === 'ready' ? 'ready' : 'loading'}`}></div>
            <span>
              {connectionStatus === 'ready' && '🔥 Firebase PAHM Guru active with SmartAI routing, Firebase Functions, and Firebase-only intelligence'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;