// Enhanced ChatInterface.tsx with beautiful modern styling
import React, { useState, useRef, useEffect } from 'react';
import { EnhancedLocalStorageManager } from '../../services/EnhancedLocalStorageManager';
import './ChatInterface.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'guru';
  timestamp: Date;
  confidence?: number;
  bookWisdom?: string[];
  practicalGuidance?: string[];
}

interface ChatInterfaceProps {
  knowledgeBaseReady?: boolean;
  currentUser?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  knowledgeBaseReady = true,
  currentUser
}) => {
  // Derive user data from currentUser or use defaults
  const userStage = currentUser?.currentStage || 1;
  const practiceHours = currentUser?.totalPracticeHours || 25;
  const userChallenges = currentUser?.recentChallenges || ['restlessness', 'doubt'];
  const userMood = currentUser?.lastMoodRating || 6;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${currentUser?.displayName || 'practitioner'}! I'm your PAHM Guru, now enhanced with deep knowledge from 'Return of the Attention'. I can provide personalized guidance based on your practice stage and challenges. How can I assist you with your attention practice today?`,
      sender: 'guru',
      timestamp: new Date(),
      confidence: 1.0
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateGuruResponse = (userMessage: string): Message => {
    if (!knowledgeBaseReady) {
      return {
        id: Date.now().toString(),
        text: "I'm sorry, but my knowledge base is still loading. Please try again in a moment.",
        sender: 'guru',
        timestamp: new Date(),
        confidence: 0.5
      };
    }

    const enhancedResponse = EnhancedLocalStorageManager.getEnhancedPAHMResponse(
      userMessage,
      {
        currentStage: userStage,
        recentChallenges: userChallenges,
        moodLevel: userMood,
        practiceHours: practiceHours
      }
    );

    return {
      id: Date.now().toString(),
      text: enhancedResponse.response,
      sender: 'guru',
      timestamp: new Date(),
      confidence: enhancedResponse.confidence,
      bookWisdom: enhancedResponse.bookWisdom,
      practicalGuidance: enhancedResponse.practicalGuidance
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const guruResponse = generateGuruResponse(inputText);
      setMessages(prev => [...prev, guruResponse]);
      setIsLoading(false);

      EnhancedLocalStorageManager.saveKnowledgeInteraction(
        guruResponse.id,
        inputText,
        guruResponse.text,
        userStage,
        true
      );
    }, 800);
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

  const renderMessage = (message: Message) => {
    const isGuru = message.sender === 'guru';
    
    return (
      <div
        key={message.id}
        className={`flex ${isGuru ? 'justify-start' : 'justify-end'} mb-6 animate-fadeIn`}
      >
        {/* Guru Avatar */}
        {isGuru && (
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              🧘
            </div>
          </div>
        )}
        
        <div
          className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
            isGuru
              ? 'bg-gradient-to-br from-white to-blue-50 text-gray-800 border border-blue-100'
              : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white ml-12'
          } transition-all duration-300 hover:shadow-xl`}
        >
          <p className="text-sm leading-relaxed">{message.text}</p>
          
          {/* Enhanced Confidence Indicator */}
          {isGuru && message.confidence !== undefined && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-700">AI Confidence</span>
                <span className="font-bold text-blue-800">{Math.round(message.confidence * 100)}%</span>
              </div>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${message.confidence * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Enhanced Book Wisdom Section */}
          {isGuru && message.bookWisdom && message.bookWisdom.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-l-4 border-amber-400 shadow-sm">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">💡</span>
                <span className="text-sm font-bold text-amber-800">Key Insights from the Book</span>
              </div>
              {message.bookWisdom.slice(0, 2).map((wisdom, index) => (
                <div key={index} className="text-xs text-amber-700 mb-2 pl-4 border-l-2 border-amber-300">
                  {wisdom}
                </div>
              ))}
            </div>
          )}
          
          {/* Enhanced Practical Guidance Section */}
          {isGuru && message.practicalGuidance && message.practicalGuidance.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-l-4 border-emerald-400 shadow-sm">
              <div className="flex items-center mb-3">
                <span className="text-lg mr-2">🎯</span>
                <span className="text-sm font-bold text-emerald-800">Practical Steps</span>
              </div>
              {message.practicalGuidance.slice(0, 3).map((guidance, index) => (
                <div key={index} className="flex items-start text-xs text-emerald-700 mb-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-800 font-bold mr-2 text-xs">
                    {index + 1}
                  </span>
                  <span>{guidance}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <p className="text-xs mt-3 opacity-60 text-right">
            {message.timestamp.toLocaleTimeString()}
          </p>
        </div>

        {/* User Avatar */}
        {!isGuru && (
          <div className="flex-shrink-0 ml-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                PAHM Guru
              </h2>
              <div className="text-sm opacity-90 flex items-center mt-1">
                <div className={`w-3 h-3 rounded-full mr-2 ${knowledgeBaseReady ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                {knowledgeBaseReady ? 'Enhanced with Return of Attention Knowledge' : 'Loading knowledge base...'}
              </div>
            </div>
            
            {/* User Stats */}
            <div className="text-right">
              <div className="text-xs opacity-75 space-y-1">
                <div className="flex items-center justify-end">
                  <span className="mr-2">Stage:</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full font-semibold">{userStage}</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="mr-2">Practice Hours:</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full font-semibold">{practiceHours}</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className="mr-2">Mood:</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full font-semibold">{userMood}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map(renderMessage)}
          
          {/* Enhanced Loading Indicator */}
          {isLoading && (
            <div 
              className="flex justify-start mb-6 animate-fadeIn"
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  🧘
                </div>
              </div>
              <div className="bg-gradient-to-br from-white to-blue-50 px-6 py-4 rounded-2xl shadow-lg border border-blue-100 max-w-xs">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
                  <span className="text-sm text-gray-700">PAHM Guru is thinking...</span>
                </div>
                <div className="flex space-x-1 mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Section */}
      <div className="bg-white border-t border-gray-200 p-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          {/* Input Box */}
          <div className="flex space-x-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about PAHM practice, stages, or specific challenges..."
                className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
                disabled={isLoading || !knowledgeBaseReady}
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim() || !knowledgeBaseReady}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
          
          {/* Enhanced Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {[
              'What is the PAHM matrix?',
              'How to handle poisonous thoughts?',
              `Stage ${userStage} guidance`,
              'Practice tips for beginners'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-chip"
                disabled={isLoading || !knowledgeBaseReady}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Knowledge Base Status */}
          {!knowledgeBaseReady && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center">
              <div className="animate-pulse w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-sm text-yellow-700">Knowledge base is initializing... Please wait.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;