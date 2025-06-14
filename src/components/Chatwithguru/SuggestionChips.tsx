// SuggestionChips.tsx
import React from 'react';

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    "How can I improve my practice?",
    "What should I focus on at my current stage?",
    "How do I use the PAHM matrix?",
    "When should I advance to the next level?"
  ];

  return (
    <div className="chat-suggestions">
      {suggestions.map((suggestion, index) => (
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
