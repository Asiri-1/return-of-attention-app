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
    { id: 'likes', color: '#E8FFF2', row: 0, col: 1 },
    { id: 'anticipation', color: '#C9E5FF', row: 0, col: 2 },
    { id: 'past', color: '#FFF5C0', row: 1, col: 0 },
    { id: 'present', color: '#FFFFFF', row: 1, col: 1, isCenter: true },
    { id: 'future', color: '#E5F0FF', row: 1, col: 2 },
    { id: 'regret', color: '#FFD5D5', row: 2, col: 0 },
    { id: 'dislikes', color: '#FFE0E0', row: 2, col: 1 },
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
        </div>
      ))}
    </div>
  );
};

export default PAHMMatrix;