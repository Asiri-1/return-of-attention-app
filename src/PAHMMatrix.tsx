import React, { useState, useEffect } from 'react';
import './PAHMMatrix.css';
import { PAHMCounts } from './types/PAHMTypes';

interface PAHMMatrixProps {
  isInteractive?: boolean;
  onCountUpdate?: (position: string, count: number) => void;
  initialCounts?: PAHMCounts;
}

const PAHMMatrix: React.FC<PAHMMatrixProps> = ({ 
  isInteractive = true,
  onCountUpdate,
  initialCounts
}) => {
  // Initialize counts for each position
  const [counts, setCounts] = useState<PAHMCounts>({
    nostalgia: 0,
    likes: 0,
    anticipation: 0,
    past: 0,
    present: 0,
    future: 0,
    regret: 0,
    dislikes: 0,
    worry: 0
  });

  // Matrix positions with their colors and arrows - matching Logo.tsx exactly
  const matrixPositions = [
    { id: 'nostalgia', color: '#FFF0B0', row: 0, col: 0 },
    { id: 'likes', color: '#E8FFF2', arrowColor: '#4AE38B', row: 0, col: 1, hasArrow: true, arrowDirection: 'down', arrowPosition: 'bottom' },
    { id: 'anticipation', color: '#E0F0FF', row: 0, col: 2 },
    { id: 'past', color: '#FFF5C0', arrowColor: '#FFD54F', row: 1, col: 0, hasArrow: true, arrowDirection: 'right', arrowPosition: 'right' },
    { id: 'present', color: '#FFFFFF', row: 1, col: 1, isCenter: true },
    { id: 'future', color: '#E5F0FF', arrowColor: '#64B5F6', row: 1, col: 2, hasArrow: true, arrowDirection: 'left', arrowPosition: 'left' },
    { id: 'regret', color: '#FFD5D5', row: 2, col: 0 },
    { id: 'dislikes', color: '#FFE0E0', arrowColor: '#FF8A80', row: 2, col: 1, hasArrow: true, arrowDirection: 'up', arrowPosition: 'top' },
    { id: 'worry', color: '#E5E0FF', row: 2, col: 2 },
  ];

  // Update counts when initialCounts prop changes
  useEffect(() => {
    if (initialCounts) {
      setCounts(initialCounts);
    }
  }, [initialCounts]);

  // Handle click on a position
  const handlePositionClick = (position: string) => {
    if (!isInteractive) return;
    
    const newCounts = {
      ...counts,
      [position]: counts[position as keyof typeof counts] + 1
    };
    
    setCounts(newCounts);
    
    if (onCountUpdate) {
      onCountUpdate(position, newCounts[position as keyof typeof counts]);
    }
  };

  return (
    <div className="pahm-matrix">
      {matrixPositions.map((position) => (
        <div
          key={position.id}
          className={`matrix-position ${position.id} ${position.isCenter ? 'center-position' : ''}`}
          style={{ backgroundColor: position.color }}
          onClick={() => handlePositionClick(position.id)}
        >
          <div className="position-content">
            <div className="position-name">{position.id.toUpperCase()}</div>
          </div>
          
          {position.hasArrow && (
            <div 
              className={`position-arrow arrow-${position.arrowPosition}`}
              style={{ color: position.arrowColor }}
            >
              <svg 
                className={`arrow-svg arrow-${position.arrowDirection}-svg`} 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {position.arrowDirection === 'up' && (
                  <path d="M12 4L4 16H20L12 4Z" fill={position.arrowColor} />
                )}
                {position.arrowDirection === 'down' && (
                  <path d="M12 20L4 8H20L12 20Z" fill={position.arrowColor} />
                )}
                {position.arrowDirection === 'left' && (
                  <path d="M4 12L16 4V20L4 12Z" fill={position.arrowColor} />
                )}
                {position.arrowDirection === 'right' && (
                  <path d="M20 12L8 4V20L20 12Z" fill={position.arrowColor} />
                )}
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PAHMMatrix;
