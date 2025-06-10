import React from 'react';
import './Logo.css';

const Logo: React.FC = () => {
  // Matrix positions with their colors and arrows
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

  return (
    <div className="logo-container">
      <div className="logo-matrix">
        {matrixPositions.map((position) => (
          <div
            key={position.id}
            className={`logo-cell ${position.isCenter ? 'center-cell' : ''}`}
            style={{ backgroundColor: position.color }}
          >
            {position.isCenter && (
              <div className="logo-center-content">
                <div className="logo-text-top">Return of</div>
                {/* Using the center-dot class for consistency */}
                <div className="center-dot"></div>
                <div className="logo-text-bottom">Attention</div>
              </div>
            )}
            
            {position.hasArrow && (
              <div 
                className={`cell-arrow arrow-${position.arrowPosition}`}
                style={{ color: position.arrowColor }}
              >
                <svg 
                  className={`arrow-svg arrow-${position.arrowDirection}-svg`} 
                  width="12" 
                  height="12" 
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
    </div>
  );
};

export default Logo;


