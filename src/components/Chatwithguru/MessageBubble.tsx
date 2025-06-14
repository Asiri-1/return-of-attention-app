// MessageBubble.tsx
import React from 'react';

interface MessageProps {
  message: {
    role: string;
    content: string;
    timestamp: Date;
    isError?: boolean;
  };
}

const MessageBubble: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={`message ${isUser ? 'user-message' : 'guru-message'} ${message.isError ? 'error-message' : ''}`}
    >
      <div className="message-content">{message.content}</div>
      <div className="message-timestamp">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default MessageBubble;
