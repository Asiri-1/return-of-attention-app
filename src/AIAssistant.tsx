import React, { useState, useEffect } from 'react';
import './AIAssistant.css';

// Define proper interfaces
interface AIAssistantProps {
  userData?: {
    name?: string;
    experienceLevel: string;
    goals: string[];
    practiceTime: number;
    frequency: string;
  };
  onComplete?: (recommendations: any) => void;
  onBack?: () => void;
}

interface Recommendation {
  suggestedDuration: number;
  focusAreas: string[]; // Explicitly typed as string array
  message: string;
  practiceFrequency: string;
  bookChapter: number;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  userData, 
  onComplete, 
  onBack 
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  
  // Processing steps for visual feedback
  const processingSteps = [
    "Analyzing your mindfulness goals...",
    "Evaluating your experience level...",
    "Determining optimal practice duration...",
    "Creating personalized recommendations..."
  ];
  
  useEffect(() => {
    // Simulate AI processing with delays between steps
    const processData = async () => {
      // Default data if userData is not provided
      const defaultUserData = {
        experienceLevel: 'beginner',
        goals: ['stress', 'focus'],
        practiceTime: 10,
        frequency: 'daily'
      };
      
      const dataToProcess = userData || defaultUserData;
      
      // Step 1: Analyze goals
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessingStep(1);
      
      // Step 2: Evaluate experience
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProcessingStep(2);
      
      // Step 3: Determine duration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingStep(3);
      
      // Step 4: Create recommendations
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Generate personalized recommendations based on user data
      const personalizedRecommendations = generateRecommendations(dataToProcess);
      setRecommendations(personalizedRecommendations);
      setIsProcessing(false);
    };
    
    processData();
  }, [userData]);
  
  // Generate personalized recommendations based on user data
  const generateRecommendations = (userData: any): Recommendation => {
    // Default recommendations with proper typing
    const recommendations: Recommendation = {
      suggestedDuration: 10,
      focusAreas: [], // Initialize as empty string array
      message: "",
      practiceFrequency: "daily",
      bookChapter: 1
    };
    
    // Adjust duration based on experience level and available time
    if (userData.experienceLevel === 'beginner') {
      recommendations.suggestedDuration = Math.min(10, userData.practiceTime);
      recommendations.message = "Start with shorter sessions to build the habit.";
    } else if (userData.experienceLevel === 'intermediate') {
      recommendations.suggestedDuration = Math.min(15, userData.practiceTime);
      recommendations.message = "You're making good progress. Let's deepen your practice.";
    } else {
      recommendations.suggestedDuration = Math.min(20, userData.practiceTime);
      recommendations.message = "Your experience will help you maintain longer sessions.";
    }
    
    // Determine focus areas based on goals
    if (userData.goals.includes('stress')) {
      recommendations.focusAreas.push('present moment awareness');
    }
    if (userData.goals.includes('focus')) {
      recommendations.focusAreas.push('attention training');
    }
    if (userData.goals.includes('awareness')) {
      recommendations.focusAreas.push('self-observation');
    }
    if (userData.goals.includes('emotional')) {
      recommendations.focusAreas.push('emotional regulation');
    }
    if (userData.goals.includes('sleep')) {
      recommendations.focusAreas.push('relaxation techniques');
    }
    
    // Adjust practice frequency
    recommendations.practiceFrequency = userData.frequency;
    
    // Determine starting book chapter based on experience
    if (userData.experienceLevel === 'beginner') {
      recommendations.bookChapter = 1; // Introduction chapter
    } else if (userData.experienceLevel === 'intermediate') {
      recommendations.bookChapter = 3; // Intermediate practices
    } else {
      recommendations.bookChapter = 5; // Advanced techniques
    }
    
    return recommendations;
  };
  
  // Handle continue button click
  const handleContinue = () => {
    if (onComplete && recommendations) {
      onComplete(recommendations);
    }
  };
  
  return (
    <div className="ai-assistant-container">
      {/* Add back button if onBack prop is provided */}
      {onBack && (
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
      )}
      
      {isProcessing ? (
        <div className="processing-screen">
          <div className="processing-animation">
            <div className="spinner"></div>
          </div>
          <h2 className="processing-title">Personalizing Your Experience</h2>
          <p className="processing-step">{processingSteps[processingStep]}</p>
          <div className="processing-progress">
            {processingSteps.map((_, index) => (
              <div 
                key={index} 
                className={`progress-bar ${index <= processingStep ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="recommendations-screen">
          <div className="recommendation-header">
            <div className="recommendation-icon">✨</div>
            <h2>Your Personalized Plan</h2>
          </div>
          
          {recommendations && (
            <>
              <div className="recommendation-card">
                <h3>Suggested Practice Duration</h3>
                <div className="recommendation-value">{recommendations.suggestedDuration} minutes</div>
                <p>Based on your experience level and available time</p>
              </div>
              
              <div className="recommendation-card">
                <h3>Focus Areas</h3>
                <ul className="focus-areas-list">
                  {recommendations.focusAreas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
              
              <div className="recommendation-message">
                <p>{recommendations.message}</p>
                <p>We'll guide you through the Return of the Attention methodology, starting with the concepts that match your experience level.</p>
              </div>
            </>
          )}
          
          <button className="primary-button" onClick={handleContinue}>
            Begin Your Journey
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
