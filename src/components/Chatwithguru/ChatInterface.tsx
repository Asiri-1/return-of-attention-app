// Smart ChatInterface.tsx - Conditional Display of UI Elements
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { useLocalData } from '../../contexts/LocalDataContext';
import { EnhancedLocalStorageManager } from '../../services/AdaptiveWisdomEngine';
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
  isSubstantive?: boolean; // New field to determine if this deserves enhanced UI
}

const ChatInterface: React.FC = () => {
  const { currentUser } = useAuth();
  const { getPAHMData, getEnvironmentData, getDailyEmotionalNotes } = useLocalData();
  
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'ready'>('ready');
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to determine if a message should show enhanced UI elements
  const isSubstantiveResponse = (userMessage: string, responseText: string): boolean => {
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

    // If user input matches simple patterns, it's not substantive
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

    // If user input or response contains substantive content, show enhanced UI
    const hasSubstantiveContent = substantivePatterns.some(pattern => 
      pattern.test(userLC) || pattern.test(responseLC)
    );

    // Also check response length - longer responses are usually more substantive
    const isLongResponse = responseText.length > 100;

    return hasSubstantiveContent || isLongResponse;
  };

  // Memoize user context to prevent recreating on every render
  const userContext = useCallback(() => ({
    uid: currentUser?.uid || '',
    currentStage: Number(currentUser?.currentStage) || 1,
    goals: currentUser?.goals || [],
    practiceAnalytics: {
      pahmData: getPAHMData?.() || undefined,
      environmentData: getEnvironmentData?.() || undefined,
      emotionalNotes: getDailyEmotionalNotes?.() || []
    },
    recentChallenges: ['restlessness'],
    currentMood: 6,
    timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon'
  }), [currentUser?.uid, currentUser?.currentStage, currentUser?.goals, getPAHMData, getEnvironmentData, getDailyEmotionalNotes]);

  // Initialize once only
  useEffect(() => {
    if (initialized) return;
    
    const initialize = async () => {
      try {
        // Set session ID
        setSessionId(`session-${Date.now()}`);
        
        // Initialize local engine
        await EnhancedLocalStorageManager.initializeAdaptiveKnowledge();
        console.log('✅ Local engine initialized');
        
        // Simple welcome message - no enhanced UI
        setMessages([{
          id: '1',
          text: `Hello ${currentUser?.displayName || 'practitioner'}! I'm your PAHM Guru, ready to help with your mindfulness practice. How can I assist you today?`,
          sender: 'guru',
          timestamp: new Date(),
          source: 'ready',
          isSubstantive: false // Simple welcome doesn't need enhanced UI
        }]);
        
        setInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
        setInitialized(true);
      }
    };
    
    initialize();
  }, [initialized, currentUser?.displayName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<Message> => {
    const messageId = Date.now().toString();
    const userLC = userMessage.toLowerCase().trim();
    
    // Handle simple greetings with simple responses
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

    // Check for exact greeting matches
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

    // Try Firebase with timeout for substantive questions
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
        console.log('✅ Firebase response received');
        
        return {
          id: messageId,
          text: data.response,
          sender: 'guru',
          timestamp: new Date(),
          confidence: data.confidence,
          bookWisdom: [data.ancientWisdom],
          practicalGuidance: data.practicalActions,
          source: 'firebase',
          isSubstantive: isSubstantiveResponse(userMessage, data.response)
        };
      }
    } catch (error) {
      console.log('Firebase failed, using local fallback:', error);
    }
    
    // Local fallback
    try {
      const localResponse = EnhancedLocalStorageManager.getEnhancedPAHMResponse(
        userMessage,
        {
          currentStage: Number(currentUser?.currentStage) || 1,
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
        source: 'local',
        isSubstantive: isSubstantiveResponse(userMessage, localResponse.response)
      };
    } catch (error) {
      console.error('Local engine also failed:', error);
      
      // Basic fallback
      return {
        id: messageId,
        text: `I'm having some technical difficulties, but I'm here to help with your mindfulness practice. What specific aspect would you like to explore?`,
        sender: 'guru',
        timestamp: new Date(),
        source: 'fallback',
        isSubstantive: false
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      setInputText(suggestion);
    }
  };

  if (!initialized) {
    return (
      <div className="chat-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center animate-fadeIn">
            <div className="loading-spinner animate-glow" style={{ width: '48px', height: '48px', margin: '0 auto 24px' }}></div>
            <h2 style={{ background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem', fontWeight: '700' }}>
              Initializing PAHM Guru...
            </h2>
            <p style={{ color: '#6b7280', marginTop: '8px' }}>Preparing your personalized mindfulness experience</p>
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
              <h2>PAHM Guru</h2>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '8px' }}>
                ✅ Ready to guide your mindfulness journey
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat-pill">
                <span>Stage: {Number(currentUser?.currentStage) || 1}</span>
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
                
                {/* SMART CONDITIONAL DISPLAY - Only show for substantive responses */}
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
                
                {/* Timestamp with Source */}
                <p className="message-timestamp">
                  {message.timestamp.toLocaleTimeString()}
                  {message.source && (
                    <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                      {message.source === 'firebase' && '☁️'}
                      {message.source === 'local' && '🧠'}
                      {message.source === 'ready' && '✅'}
                      {message.source === 'conversational' && '💬'}
                      {message.source === 'fallback' && '⚠️'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="loading-wrapper">
              <div className="avatar guru">🧘</div>
              <div className="loading-bubble">
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  <span className="loading-text">PAHM Guru is thinking...</span>
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
                disabled={isLoading}
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
              disabled={isLoading || !inputText.trim()}
              className="send-button"
            >
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
          
          {/* Enhanced Suggestion Chips */}
          <div className="suggestions-container">
            {[
              'What is the PAHM matrix?',
              'How to handle racing thoughts?',
              'Stage 1 guidance',
              'Practice tips for my level',
              'Dealing with meditation resistance',
              'Understanding mental formations'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-chip"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Knowledge Status */}
          <div className={`knowledge-status ${connectionStatus === 'ready' ? 'ready' : 'loading'}`}>
            <div className={`status-indicator ${connectionStatus === 'ready' ? 'ready' : 'loading'}`}></div>
            <span>
              {connectionStatus === 'ready' && 'Enhanced PAHM Guru active with Firebase Functions and local intelligence backup'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;