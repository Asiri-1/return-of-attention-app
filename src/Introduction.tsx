import React, { useState } from 'react';
import './Introduction.css';
import Logo from './Logo';

interface IntroductionProps {
  onComplete: () => void;
  onSkip: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Welcome to The Return of Attention",
      content: "A simplified practical journey to happiness that stays.",
      image: "🧠"
    },
    {
      title: "Why This Practice Matters",
      content: "You decided to try The Return of Attention because something doesn't feel right or no matter whatever you do, something is missing. Perhaps there's a quiet unease that follows you through your days. This practice offers a path to lasting peace.",
      image: "🌱"
    },
    {
      title: "The Fundamental Blindness",
      content: "Investing in your mind yields far greater returns than focusing solely on the body. While we have limited control over our physical functions, the mind is trainable. We can't control which thoughts arise, but we can control our relationship to those thoughts. Why dedicate so much energy to controlling the physical—something inherently uncontrollable—and so little toward mastering the mental, which is within reach?",
      image: "👁️"
    },
    {
      title: "A Simple Practice",
      content: "This is not about adding more to your life. It's about discovering what's already there. The practice is simple, but its effects are profound.",
      image: "🧘"
    },
    {
      title: "Your Journey Begins",
      content: "We'll start with a self-assessment to record your starting point.",
      image: "🛤️"
    }
  ];
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  return (
    <div className="introduction-container">
      <div className="logo-container">
        <Logo />
      </div>
      
      <div className="introduction-content">
        <div className="slide">
          <div className="slide-image">{slides[currentSlide].image}</div>
          <h1>{slides[currentSlide].title}</h1>
          <p>{slides[currentSlide].content}</p>
        </div>
        
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        
        <div className="navigation-buttons">
          {currentSlide > 0 && (
            <button className="nav-button back" onClick={prevSlide}>
              Back
            </button>
          )}
          
          <button className="nav-button skip" onClick={onSkip}>
            Skip
          </button>
          
          <button className="nav-button next" onClick={nextSlide}>
            {currentSlide === slides.length - 1 ? 'Continue' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
