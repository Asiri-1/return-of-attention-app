import React, { useEffect, useState } from 'react';
import './StageOneProgression.css';

interface StageOneProgressionProps {
  currentLevel: string; // 'T1', 'T2', 'T3', 'T4', or 'T5'
  onLevelClick: (level: string, duration: number) => void;
}

const StageOneProgression: React.FC<StageOneProgressionProps> = ({ 
  currentLevel, 
  onLevelClick 
}) => {
  // State to track completed levels
  const [completedLevels, setCompletedLevels] = useState<{[key: string]: boolean}>({
    t1: false,
    t2: false,
    t3: false,
    t4: false,
    t5: false
  });
  
  // Load completed levels from localStorage on component mount
  useEffect(() => {
    const t1Complete = localStorage.getItem('t1Complete') === 'true';
    const t2Complete = localStorage.getItem('t2Complete') === 'true';
    const t3Complete = localStorage.getItem('t3Complete') === 'true';
    const t4Complete = localStorage.getItem('t4Complete') === 'true';
    const t5Complete = localStorage.getItem('t5Complete') === 'true';
    
    setCompletedLevels({
      t1: t1Complete,
      t2: t2Complete,
      t3: t3Complete,
      t4: t4Complete,
      t5: t5Complete
    });
  }, []);
  
  // Convert level string to number for comparison
  const getLevelNumber = (level: string): number => {
    return parseInt(level.substring(1), 10);
  };
  
  const currentLevelNum = getLevelNumber(currentLevel);
  
  // Define the levels and their descriptions - all Physical Stillness with increasing times
  const levels = [
    { id: 'T1', title: 'Physical Stillness', description: 'Physical Stillness for 10 minutes', duration: 10 },
    { id: 'T2', title: 'Physical Stillness', description: 'Physical Stillness for 15 minutes', duration: 15 },
    { id: 'T3', title: 'Physical Stillness', description: 'Physical Stillness for 20 minutes', duration: 20 },
    { id: 'T4', title: 'Physical Stillness', description: 'Physical Stillness for 25 minutes', duration: 25 },
    { id: 'T5', title: 'Physical Stillness', description: 'Physical Stillness for 30 minutes', duration: 30 }
  ];
  
  // Determine the highest unlocked level
  const getHighestUnlockedLevel = (): number => {
    if (completedLevels.t4) return 5;
    if (completedLevels.t3) return 4;
    if (completedLevels.t2) return 3;
    if (completedLevels.t1) return 2;
    return 1;
  };
  
  const highestUnlockedLevel = getHighestUnlockedLevel();
  
  // Determine the next active level (first uncompleted level)
  const getNextActiveLevel = (): string => {
    if (!completedLevels.t1) return 'T1';
    if (!completedLevels.t2) return 'T2';
    if (!completedLevels.t3) return 'T3';
    if (!completedLevels.t4) return 'T4';
    if (!completedLevels.t5) return 'T5';
    return 'T5'; // If all completed, stay at T5
  };
  
  const nextActiveLevel = getNextActiveLevel();
  
  // Find the active level object
  const activeLevel = levels.find(level => level.id === nextActiveLevel) || levels[0];
  
  // Handle level click with progression logic
  const handleLevelClick = (level: string, duration: number) => {
    const levelNum = getLevelNumber(level);
    
    // Allow clicking only if level is unlocked (completed previous or is first level)
    if (levelNum <= highestUnlockedLevel) {
      onLevelClick(level, duration);
    } else {
      // Optional: Show a message that this level is locked
      console.log(`Level ${level} is locked. Complete previous levels first.`);
      // You could add a visual indicator or toast message here
    }
  };
  
  return (
    <div className="stage-one-progression">
      <h3>Stage One: Seeker</h3>
      <div className="progression-track">
        {levels.map((level, index) => {
          const levelNum = getLevelNumber(level.id);
          const levelKey = `t${levelNum}` as keyof typeof completedLevels;
          const isCompleted = completedLevels[levelKey];
          const isCurrent = level.id === nextActiveLevel;
          const isLocked = levelNum > highestUnlockedLevel;
          
          return (
            <div key={level.id} className="level-container">
              <div 
                className={`level-marker ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => handleLevelClick(level.id, level.duration)}
                style={isLocked ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
              >
                <span className="level-id">{level.id}</span>
                {isLocked && (
                  <span className="lock-icon" style={{ 
                    position: 'absolute', 
                    top: '-5px', 
                    right: '-5px', 
                    fontSize: '12px' 
                  }}>
                    🔒
                  </span>
                )}
              </div>
              
              <div className="level-info">
                <div className="level-title">{level.title}</div>
                <div className="level-description">
                  Physical Stillness for {level.duration} minutes
                </div>
                {isCompleted && (
                  <div className="completion-status" style={{ 
                    color: '#4CAF50', 
                    fontSize: '12px',
                    marginTop: '2px'
                  }}>
                    Completed ✓
                  </div>
                )}
              </div>
              
              {index < levels.length - 1 && (
                <div 
                  className={`level-connector ${isCompleted ? 'completed' : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="progression-actions">
        <button 
          className="begin-practice-button"
          onClick={() => handleLevelClick(nextActiveLevel, activeLevel.duration)}
        >
          Begin {nextActiveLevel} Practice
        </button>
      </div>
    </div>
  );
};

export default StageOneProgression;
