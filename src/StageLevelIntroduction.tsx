import React, { useEffect } from 'react';
import './StageLevelIntroduction.css';

interface StageLevelIntroductionProps {
  stageNumber: number;
  onComplete: () => void;
  onBack: () => void;
}

const StageLevelIntroduction: React.FC<StageLevelIntroductionProps> = ({
  stageNumber,
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  // Check if this stage's introduction has been completed before
  useEffect(() => {
    // Only apply auto-skip for stages other than Stage Two (2)
    if (stageNumber !== 2) {
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      if (completedIntros.includes(stageNumber)) {
        // If this introduction was already completed, skip directly to practice
        onComplete();
      }
    }
    // Stage Two introduction will always be shown, never auto-skipped
  }, [stageNumber, onComplete]);
  
  // Mark this stage's introduction as completed
  const markIntroCompleted = () => {
    const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
    if (!completedIntros.includes(stageNumber)) {
      completedIntros.push(stageNumber);
      localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
    }
  };
  
  // Handle skip button click
  const handleSkip = () => {
    markIntroCompleted();
    onComplete();
  };
  
  const getStageTitle = () => {
    switch (stageNumber) {
      case 1: return "Seeker: Physical Readiness";
      case 2: return "PAHM Trainer: Understanding Thought Patterns";
      case 3: return "PAHM Beginner: Dot Tracking Practice";
      case 4: return "PAHM Practitioner: Tool-Free Practice";
      case 5: return "PAHM Master: Sustained Presence";
      case 6: return "PAHM Illuminator: Integration & Teaching";
      default: return "Unknown Stage";
    }
  };
  
  const getStageSlides = () => {
    switch (stageNumber) {
      case 1:
        return [
          {
            title: "Welcome to Stage One",
            content: "As a Seeker, you're beginning the journey of developing physical readiness for meditation practice. This stage focuses on building the capacity to remain physically still for extended periods."
          },
          {
            title: "The Physical Foundation",
            content: "Physical stillness creates the container for all mental work that follows. By training your body to remain still, you develop the first essential skill for deeper practice."
          },
          {
            title: "T1-T5 Progression",
            content: "Stage One is divided into 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ minutes of stillness. Each level builds upon the previous one."
          },
          {
            title: "Your First Goal",
            content: "Begin with T1: three 10-minute sessions of physical stillness. Once you can maintain stillness comfortably for this duration, you'll progress to longer periods."
          }
        ];
      case 2:
        return [
          {
            title: "Welcome to Stage Two",
            content: "As a PAHM Trainer, you'll learn to witness your thought patterns without becoming entangled in them. This stage builds on the physical foundation you established in Stage One."
          },
          {
            title: "The PAHM Matrix",
            content: "Stage Two introduces the Present Attention and Happiness Matrix (PAHM), a powerful tool for understanding the relationship between your attention and emotional state."
          },
          {
            title: "Nine Positions of Experience",
            content: "The PAHM Matrix divides experience into nine positions including Present, Past, Future, Attachment, Aversion, and more. You'll learn to recognize which position you're in at any moment."
          },
          {
            title: "Your PAHM Trainer Practice",
            content: "In this stage, you'll practice noticing your thoughts without judgment, identifying patterns, and using the PAHM Matrix to understand your mental habits."
          }
        ];
      case 3:
        return [
          {
            title: "Welcome to Stage Three",
            content: "As a PAHM Beginner, you'll learn the dot tracking technique, a powerful method for developing sustained attention and recognizing when your mind has wandered."
          },
          {
            title: "Poison Thoughts",
            content: "Stage Three introduces the concept of 'poison thoughts' - recurring thought patterns that pull you away from presence and into suffering. You'll learn to identify your personal poison thoughts."
          },
          {
            title: "The Dot Tracking Method",
            content: "This technique involves visualizing a small dot and maintaining your attention on it. When your mind wanders, you'll practice gently returning to the dot."
          },
          {
            title: "Building Attention Muscle",
            content: "Just as Stage One built your physical stillness capacity, Stage Three builds your attention muscle, allowing you to remain present for longer periods."
          }
        ];
      case 4:
        return [
          {
            title: "Welcome to Stage Four",
            content: "As a PAHM Practitioner, you'll learn to practice without external tools or supports, relying solely on your developed capacity for attention."
          },
          {
            title: "Beyond Techniques",
            content: "Having mastered the dot tracking method, you now move beyond specific techniques to a more natural and integrated form of practice."
          },
          {
            title: "Presence Without Objects",
            content: "In this stage, you'll develop the ability to maintain presence without focusing on any particular object of attention."
          },
          {
            title: "Deepening Your Practice",
            content: "Stage Four represents a significant deepening of your practice, where the skills you've developed become more effortless and integrated."
          }
        ];
      case 5:
        return [
          {
            title: "Welcome to Stage Five",
            content: "As a PAHM Master, you'll focus on maintaining presence throughout daily activities, not just during formal practice sessions."
          },
          {
            title: "Living Presence",
            content: "Stage Five is about bringing your practice off the cushion and into everyday life, maintaining awareness during routine activities."
          },
          {
            title: "Continuous Awareness",
            content: "You'll learn to maintain a thread of awareness throughout your day, gradually extending the periods of continuous presence."
          },
          {
            title: "Integration Practice",
            content: "This stage includes specific exercises for integrating presence into conversations, work, eating, and other daily activities."
          }
        ];
      case 6:
        return [
          {
            title: "Welcome to Stage Six",
            content: "As a PAHM Illuminator, you'll fully integrate the practice into your life and potentially share it with others."
          },
          {
            title: "Teaching Through Being",
            content: "At this stage, your presence itself becomes a teaching for others, demonstrating the benefits of the practice through your way of being."
          },
          {
            title: "Sharing the Practice",
            content: "You may feel called to formally share these practices with others, helping them develop their own capacity for presence."
          },
          {
            title: "Continuing the Journey",
            content: "Even at Stage Six, the journey continues. There is always deeper presence to discover and new ways to embody and share this practice."
          }
        ];
      default:
        return [
          {
            title: "Stage Introduction",
            content: "Welcome to this stage of your journey."
          }
        ];
    }
  };
  
  const slides = getStageSlides();
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark this introduction as completed
      markIntroCompleted();
      
      // For PAHM Trainer stage, navigate to PAHM explanation
      if (stageNumber === 2) {
        // Navigate to PAHM explanation
        onComplete(); // This should be updated to navigate to PAHMExplanation
      } else {
        onComplete();
      }
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  };
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{getStageTitle()}</h1>
        <button className="skip-button" onClick={handleSkip}>Skip</button>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          <div className="slide-progress">
            {slides.map((_, index) => (
              <div 
                key={index} 
                className={`progress-dot ${index === currentSlide ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <div className="navigation-buttons">
          {currentSlide > 0 && (
            <button className="nav-button back" onClick={prevSlide}>
              Back
            </button>
          )}
          
          <button className="nav-button next" onClick={nextSlide}>
            {currentSlide === slides.length - 1 ? (stageNumber === 2 ? 'Learn about PAHM' : 'Begin Practice') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageLevelIntroduction;
