// Smart ChatInterface.tsx - Updated with SmartAI Integration
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useLocalDataCompat } from '../../hooks/useLocalDataCompat';
import { EnhancedLocalStorageManager } from '../../services/AdaptiveWisdomEngine';
import { useSmartAI } from '../../services/SmartAIOrchestrator'; // 🚀 NEW IMPORT
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
  // 🚀 NEW: Smart AI metadata
  smartAIMetadata?: {
    type: 'casual' | 'clarification' | 'deep_guidance' | 'supportive';
    processingMethod: 'intent_only' | 'full_ai' | 'hybrid';
    responseTime: number;
    feedbackId: string;
  };
}

const ChatInterface: React.FC = () => {
  // ✅ FIXED: Use both contexts properly - Auth for user info, LocalData for practice data
  const { currentUser, userProfile } = useAuth();
  const { getPAHMData, getEnvironmentData, getDailyEmotionalNotes } = useLocalDataCompat();
  
  // 🚀 NEW: Smart AI integration
  const { sendMessage: sendSmartMessage, provideFeedback, isLoading: smartAILoading } = useSmartAI('main-chat');
  
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus] = useState<'ready'>('ready');
  const [initialized, setInitialized] = useState(false);
  const [showFeedback, setShowFeedback] = useState<string | null>(null); // 🚀 NEW
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

  // ✅ FIXED: Memoize user context with proper fallbacks
  const userContext = useCallback(() => {
    // Get current stage from multiple sources with fallbacks
    const currentStage = userProfile?.currentStage || 
                        currentUser?.currentStage || 
                        localStorage.getItem('currentStage') || 
                        '1';
    
    // Get goals from multiple sources with fallbacks  
    const goals = userProfile?.goals || 
                  currentUser?.goals || 
                  JSON.parse(localStorage.getItem('userGoals') || '[]');

    return {
      uid: currentUser?.uid || '',
      currentStage: Number(currentStage),
      goals: Array.isArray(goals) ? goals : [],
      practiceAnalytics: {
        pahmData: getPAHMData?.() || undefined,
        environmentData: getEnvironmentData?.() || undefined,
        emotionalNotes: getDailyEmotionalNotes?.() || []
      },
      recentChallenges: ['restlessness'],
      currentMood: 6,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
    };
  }, [currentUser?.uid, currentUser?.currentStage, currentUser?.goals, userProfile?.currentStage, userProfile?.goals, getPAHMData, getEnvironmentData, getDailyEmotionalNotes]);

  // Initialize once only
  useEffect(() => {
    if (initialized) return;
    
    const initialize = async () => {
      try {
        setSessionId(`session-${Date.now()}`);
        await EnhancedLocalStorageManager.initializeAdaptiveKnowledge();
        console.log('✅ Local engine initialized');
        
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

  // 🚀 NEW: Enhanced response generation with SmartAI
  const generateResponse = async (userMessage: string): Promise<Message> => {
    const messageId = Date.now().toString();
    
    try {
      // Step 1: Try SmartAI first (this handles intent detection + your existing AI)
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
        // Map SmartAI response to your existing format
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
      console.log('SmartAI failed, falling back to your original system:', smartAIError);
      
      // Step 2: Fallback to your original Firebase + Local system
      const userLC = userMessage.toLowerCase().trim();
      
      // Handle simple greetings with simple responses (your original logic)
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

      // Try Firebase with timeout (your original logic)
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
          console.log('✅ Firebase fallback response received');
          
          return {
            id: messageId,
            text: data.response,
            sender: 'guru',
            timestamp: new Date(),
            confidence: data.confidence,
            bookWisdom: [data.ancientWisdom],
            practicalGuidance: data.practicalActions,
            source: 'firebase-fallback',
            isSubstantive: isSubstantiveResponse(userMessage, data.response)
          };
        }
      } catch (firebaseError) {
        console.log('Firebase fallback failed, using local fallback:', firebaseError);
      }
      
      // Local fallback (your original logic)
      try {
        // ✅ FIXED: Get current stage with proper fallback
        const currentStage = userProfile?.currentStage || 
                            currentUser?.currentStage || 
                            localStorage.getItem('currentStage') || 
                            '1';

        const localResponse = EnhancedLocalStorageManager.getEnhancedPAHMResponse(
          userMessage,
          {
            currentStage: Number(currentStage),
            recentChallenges: ['restlessness'],
            moodLevel: 6,
            practiceHours: 25
          }
        );

        return {
          id: messageId,
          text: localResponse.response,
          sender: 'guru',
          timestamp: new Date(),
          confidence: localResponse.confidence,
          bookWisdom: localResponse.bookWisdom,
          practicalGuidance: localResponse.practicalGuidance,
          source: 'local-fallback',
          isSubstantive: isSubstantiveResponse(userMessage, localResponse.response)
        };
      } catch (localError) {
        console.error('All systems failed:', localError);
        
        return {
          id: messageId,
          text: `I'm having some technical difficulties, but I'm here to help with your mindfulness practice. What specific aspect would you like to explore?`,
          sender: 'guru',
          timestamp: new Date(),
          source: 'final-fallback',
          isSubstantive: false
        };
      }
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

  // 🚀 NEW: Feedback handling
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

  // ✅ FIXED: Get current stage with proper fallbacks for display
  const getCurrentStage = () => {
    return userProfile?.currentStage || 
           currentUser?.currentStage || 
           localStorage.getItem('currentStage') || 
           '1';
  };

  if (!initialized) {
    return (
      <div className="chat-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center animate-fadeIn">
            <div className="loading-spinner animate-glow" style={{ width: '48px', height: '48px', margin: '0 auto 24px' }}></div>
            <h2 style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem', fontWeight: '700' }}>
              Initializing Smart PAHM Guru...
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Preparing your intelligent mindfulness experience</p>
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
              <h2>Smart PAHM Guru</h2>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '8px' }}>
                🚀 Enhanced with intelligent intent detection
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat-pill">
                <span>Stage: {Number(getCurrentStage())}</span>
              </div>
              <div className="stat-pill">
                <span>Hours: 25</span>
              </div>
              <div className="stat-pill">
                <span>Mood: 6/10</span>
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
                
                {/* 🚀 NEW: Smart AI Processing Indicator */}
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
                
                {/* Your existing conditional display logic */}
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

                {/* 🚀 NEW: Feedback buttons for SmartAI responses */}
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

                {/* 🚀 NEW: Feedback options */}
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
                      {message.source === 'firebase-fallback' && '☁️'}
                      {message.source === 'local-fallback' && '💾'}
                      {message.source === 'conversational' && '💬'}
                      {message.source === 'ready' && '✅'}
                      {message.source === 'final-fallback' && '⚠️'}
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
                  <span className="loading-text">Smart PAHM Guru is thinking...</span>
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
              {connectionStatus === 'ready' && '🚀 Smart PAHM Guru active with intelligent routing, Firebase Functions, and local intelligence backup'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;