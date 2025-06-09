import React, { createContext, useContext, useState, useEffect } from 'react';

interface TimerContextType {
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  time: number;
  setTime: (value: number) => void;
  resetTimer: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  setDuration: (value: number) => void;
  timeRemaining: number;
  duration: number;
}

const defaultContext: TimerContextType = {
  isRunning: false,
  setIsRunning: () => {},
  time: 0,
  setTime: () => {},
  resetTimer: () => {},
  startTimer: () => {},
  pauseTimer: () => {},
  setDuration: () => {},
  timeRemaining: 0,
  duration: 0
};

const TimerContext = createContext<TimerContextType>(defaultContext);

export const useTimer = () => useContext(TimerContext);

export const TimerProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes default
  
  const timeRemaining = duration - time;
  
  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time < duration) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (time >= duration) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, time, duration]);
  
  return (
    <TimerContext.Provider 
      value={{ 
        isRunning, 
        setIsRunning, 
        time, 
        setTime, 
        resetTimer,
        startTimer,
        pauseTimer,
        setDuration,
        timeRemaining,
        duration
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext;
