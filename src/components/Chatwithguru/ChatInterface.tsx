// ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../AuthContext';
import './ChatInterface.css';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';

const ChatInterface: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Initialize chat session when component mounts
    const initChat = async () => {
      try {
        setIsLoading(true);
        const result = await apiService.createChatSession();
        setSessionId(result.data.sessionId);
        
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `Hello ${currentUser?.displayName || 'Practitioner'}! I'm your Wisdom Guide, here to help with your attention practice. How can I assist you today?`,
          timestamp: new Date()
        }]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsLoading(false);
      }
    };

    initChat();
  }, [currentUser]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    // Add user message to UI immediately
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to backend
      const result = await apiService.sendChatMessage(sessionId, inputMessage);
      
      // Add guru response to UI
      const guruMessage = {
        role: 'assistant',
        content: result.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, guruMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        isError: true
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = async (rating: number) => {
    if (!sessionId) return;
    
    try {
      await apiService.submitChatFeedback(sessionId, rating);
      setFeedbackGiven(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const renderFeedback = () => {
    if (feedbackGiven) {
      return (
        <div className="feedback-container">
          <p>Thank you for your feedback!</p>
        </div>
      );
    }

    return (
      <div className="feedback-container">
        <p>How helpful was this conversation?</p>
        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map(rating => (
            <button 
              key={rating} 
              className="rating-button"
              onClick={() => handleFeedback(rating)}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Wisdom Guide</h2>
        <p>Your journey guide and mentor</p>
      </div>
      
      <div className="messages-container">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={index}
            message={msg}
          />
        ))}
        {isLoading && (
          <div className="message guru-message loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {messages.length <= 1 && (
        <SuggestionChips onSuggestionClick={handleSuggestionClick} />
      )}
      
      {messages.length > 2 && !isLoading && renderFeedback()}
      
      <div className="chat-input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading || !sessionId}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputMessage.trim() || !sessionId}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
