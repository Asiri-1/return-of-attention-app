import React, { useState } from 'react';
import './PAHMMatrix.css';

interface PAHMMatrixProps {
  onCountUpdate?: (quadrant: string, count: number) => void;
  isInteractive?: boolean;
  initialCounts?: {
    presentHappy: number;
    presentUnhappy: number;
    notPresentHappy: number;
    notPresentUnhappy: number;
  };
}

const PAHMMatrix: React.FC<PAHMMatrixProps> = ({ 
  onCountUpdate, 
  isInteractive = true,
  initialCounts = { presentHappy: 0, presentUnhappy: 0, notPresentHappy: 0, notPresentUnhappy: 0 }
}) => {
  const [counts, setCounts] = useState({
    presentHappy: initialCounts.presentHappy,
    presentUnhappy: initialCounts.presentUnhappy,
    notPresentHappy: initialCounts.notPresentHappy,
    notPresentUnhappy: initialCounts.notPresentUnhappy
  });
  
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  
  const handleQuadrantClick = (quadrant: string) => {
    if (!isInteractive) return;
    
    const newCounts = { ...counts };
    
    switch (quadrant) {
      case 'presentHappy':
        newCounts.presentHappy += 1;
        break;
      case 'presentUnhappy':
        newCounts.presentUnhappy += 1;
        break;
      case 'notPresentHappy':
        newCounts.notPresentHappy += 1;
        break;
      case 'notPresentUnhappy':
        newCounts.notPresentUnhappy += 1;
        break;
      default:
        break;
    }
    
    setCounts(newCounts);
    setSelectedQuadrant(quadrant);
    
    if (onCountUpdate) {
      onCountUpdate(quadrant, newCounts[quadrant as keyof typeof newCounts]);
    }
  };
  
  const getTotalCount = () => {
    return counts.presentHappy + counts.presentUnhappy + counts.notPresentHappy + counts.notPresentUnhappy;
  };
  
  const getPercentage = (count: number) => {
    const total = getTotalCount();
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };
  
  return (
    <div className="pahm-matrix-container">
      <div className="pahm-matrix">
        <div className="matrix-row">
          <div 
            className={`matrix-quadrant present-happy ${selectedQuadrant === 'presentHappy' ? 'selected' : ''}`}
            onClick={() => handleQuadrantClick('presentHappy')}
          >
            <div className="quadrant-content">
              <div className="quadrant-title">Present & Happy</div>
              {isInteractive && (
                <div className="quadrant-count">
                  <span className="count-number">{counts.presentHappy}</span>
                  <span className="count-percentage">
                    {getPercentage(counts.presentHappy)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div 
            className={`matrix-quadrant present-unhappy ${selectedQuadrant === 'presentUnhappy' ? 'selected' : ''}`}
            onClick={() => handleQuadrantClick('presentUnhappy')}
          >
            <div className="quadrant-content">
              <div className="quadrant-title">Present & Unhappy</div>
              {isInteractive && (
                <div className="quadrant-count">
                  <span className="count-number">{counts.presentUnhappy}</span>
                  <span className="count-percentage">
                    {getPercentage(counts.presentUnhappy)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="matrix-row">
          <div 
            className={`matrix-quadrant not-present-happy ${selectedQuadrant === 'notPresentHappy' ? 'selected' : ''}`}
            onClick={() => handleQuadrantClick('notPresentHappy')}
          >
            <div className="quadrant-content">
              <div className="quadrant-title">Not Present & Happy</div>
              {isInteractive && (
                <div className="quadrant-count">
                  <span className="count-number">{counts.notPresentHappy}</span>
                  <span className="count-percentage">
                    {getPercentage(counts.notPresentHappy)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          <div 
            className={`matrix-quadrant not-present-unhappy ${selectedQuadrant === 'notPresentUnhappy' ? 'selected' : ''}`}
            onClick={() => handleQuadrantClick('notPresentUnhappy')}
          >
            <div className="quadrant-content">
              <div className="quadrant-title">Not Present & Unhappy</div>
              {isInteractive && (
                <div className="quadrant-count">
                  <span className="count-number">{counts.notPresentUnhappy}</span>
                  <span className="count-percentage">
                    {getPercentage(counts.notPresentUnhappy)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isInteractive && (
        <div className="matrix-instructions">
          <p>Tap a quadrant each time you notice your mind in that state</p>
          <div className="total-count">
            Total observations: <span>{getTotalCount()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PAHMMatrix;
