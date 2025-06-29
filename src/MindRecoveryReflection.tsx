import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface MindRecoveryReflectionProps {
  practiceType: string;
  posture: string;
  pahmCounts: any;
  onComplete: () => void;
  onBack: () => void;
}

const MindRecoveryReflection: React.FC<MindRecoveryReflectionProps> = ({
  practiceType,
  posture,
  pahmCounts,
  onComplete,
  onBack
}) => {
  const [reflectionText, setReflectionText] = useState<string>('');
  const [mentalState, setMentalState] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { currentUser } = useAuth();

  const mentalStateOptions = [
    { value: 'much-better', label: 'Much Better', emoji: '😊', color: '#4caf50' },
    { value: 'better', label: 'Better', emoji: '🙂', color: '#8bc34a' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: '#ffc107' },
    { value: 'same', label: 'Same', emoji: '😕', color: '#ff9800' },
    { value: 'worse', label: 'Worse', emoji: '😞', color: '#f44336' }
  ];

  const handleSubmit = async () => {
    if (!mentalState) {
      alert('Please select how you feel after the practice.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing Mind Recovery history
      const existingHistory = JSON.parse(localStorage.getItem('mindRecoveryHistory') || '[]');
      
      // Find the most recent session and add reflection data
      if (existingHistory.length > 0) {
        const lastSession = existingHistory[existingHistory.length - 1];
        lastSession.reflection = {
          text: reflectionText,
          mentalState,
          submittedAt: new Date().toISOString()
        };
        
        // Ensure pahmCounts are saved
        if (pahmCounts) {
          lastSession.pahmCounts = pahmCounts;
        }
        
        // Save updated history
        localStorage.setItem('mindRecoveryHistory', JSON.stringify(existingHistory));
      }

      // Brief delay for user feedback
      setTimeout(() => {
        setIsSubmitting(false);
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Error saving reflection:', error);
      setIsSubmitting(false);
      alert('Error saving reflection. Please try again.');
    }
  };

  const getPracticeTitle = (): string => {
    switch (practiceType) {
      case 'morning-recharge':
        return 'Morning Recharge';
      case 'emotional-reset':
        return 'Emotional Reset';
      case 'work-home-transition':
        return 'Work-Home Transition';
      case 'evening-wind-down':
        return 'Evening Wind-Down';
      case 'mid-day-reset':
        return 'Mid-Day Reset';
      default:
        return 'Mind Recovery Practice';
    }
  };

  const getPostureDisplayName = (): string => {
    switch (posture) {
      case 'seated':
        return 'Seated';
      case 'standing':
        return 'Standing';
      case 'lying':
        return 'Lying Down';
      default:
        return posture;
    }
  };

  // Calculate PAHM stats for display
  const calculatePAHMStats = (): { total: number; presentPercentage: number; breakdown: { present: number; past: number; future: number; } } | null => {
    if (!pahmCounts) return null;
    
    const totalCounts = (Object.values(pahmCounts) as number[]).reduce((sum: number, count: number) => sum + count, 0);
    if (totalCounts === 0) return { total: 0, presentPercentage: 100, breakdown: { present: 0, past: 0, future: 0 } };
    
    const presentMomentCounts = pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes;
    const presentPercentage = Math.round((presentMomentCounts / totalCounts) * 100);
    
    return {
      total: totalCounts,
      presentPercentage,
      breakdown: {
        present: presentMomentCounts,
        past: pahmCounts.past + pahmCounts.nostalgia + pahmCounts.regret,
        future: pahmCounts.future + pahmCounts.anticipation + pahmCounts.worry
      }
    };
  };

  const pahmStats = calculatePAHMStats();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: '2px solid white',
          borderRadius: '25px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          marginBottom: '10px', 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Practice Complete! 🎉
        </h1>
        
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '16px',
          opacity: 0.9
        }}>
          <span>{getPracticeTitle()}</span> • <span>{getPostureDisplayName()}</span> • <span>5 minutes</span>
        </div>

        {/* PAHM Stats Display */}
        {pahmStats && pahmStats.total > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Session Insights</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '15px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pahmStats.total}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Observations</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{pahmStats.presentPercentage}%</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Present Moment</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Present: {pahmStats.breakdown.present} | Past: {pahmStats.breakdown.past} | Future: {pahmStats.breakdown.future}
            </div>
          </div>
        )}

        {/* Mental State Selection */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            marginBottom: '20px', 
            textAlign: 'center' 
          }}>
            How do you feel after this practice?
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '10px'
          }}>
            {mentalStateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMentalState(option.value)}
                style={{
                  background: mentalState === option.value 
                    ? `linear-gradient(135deg, ${option.color} 0%, ${option.color}dd 100%)`
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: mentalState === option.value ? `2px solid ${option.color}` : '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '15px',
                  padding: '15px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  transform: mentalState === option.value ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: mentalState === option.value ? `0 4px 15px ${option.color}40` : 'none'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>{option.emoji}</div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Text */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            marginBottom: '15px', 
            textAlign: 'center' 
          }}>
            Any thoughts or insights? (Optional)
          </h3>
          
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Share any thoughts, insights, or observations from your practice..."
            style={{
              width: '100%',
              height: '100px',
              padding: '15px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !mentalState}
          style={{
            width: '100%',
            background: !mentalState 
              ? 'rgba(255, 255, 255, 0.3)' 
              : isSubmitting 
              ? 'rgba(76, 175, 80, 0.7)'
              : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: !mentalState ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: !mentalState ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)'
          }}
        >
          {isSubmitting ? 'Saving...' : 'Complete Reflection'}
        </button>
      </div>
    </div>
  );
};

export default MindRecoveryReflection;