// src/components/Chatwithguru/SuggestionChips.tsx
import React from 'react';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
  suggestions?: string[];
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ 
  onSuggestionClick, 
  suggestions 
}) => {
  const defaultSuggestions = [
    "How can I improve my practice?",
    "What should I focus on at my current stage?",
    "How do I use the PAHM matrix?",
    "When should I advance to the next level?"
  ];

  const displaySuggestions = suggestions || defaultSuggestions;

  return (
    <div className="chat-suggestions">
      {displaySuggestions.map((suggestion, index) => (
        <button 
          key={index}
          className="suggestion-chip"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SuggestionChips;