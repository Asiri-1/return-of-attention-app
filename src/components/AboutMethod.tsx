// ============================================================================
// src/components/AboutMethod.tsx
// Updated with accurate A.C. Amarasinghe description
// ============================================================================

import React, { useState } from 'react';
import Logo from '../Logo'; // ✅ CORRECT IMPORT

const AboutMethod: React.FC = () => {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const stages = [
    {
      number: 1,
      title: "Physical Stillness",
      subtitle: "Learning to Sit",
      description: "Begin with simple physical stillness. No special postures or complicated techniques - just learning to sit comfortably without constant movement. This creates the foundation for everything that follows.",
      practices: [
        "Find a comfortable sitting position",
        "Practice staying physically still for increasing periods",
        "Notice the urge to move and choose to stay still",
        "Build up gradually from 5 to 20 minutes"
      ]
    },
    {
      number: 2,
      title: "Thought Observation", 
      subtitle: "Watching the Mind",
      description: "Learn to observe thoughts without getting caught up in them. This stage teaches the fundamental skill of being aware of mental activity rather than being lost in it.",
      practices: [
        "Notice when thoughts arise",
        "Observe thoughts without judgment",
        "Practice the skill of 'stepping back' mentally", 
        "Recognize the difference between thinking and observing thinking"
      ]
    },
    {
      number: 3,
      title: "Pattern Recognition",
      subtitle: "Seeing Mental Habits",
      description: "Begin to recognize recurring mental patterns - the same worries, the same mental loops, the same emotional reactions. This awareness is the beginning of freedom from unconscious mental habits.",
      practices: [
        "Notice repetitive thought patterns",
        "Observe emotional reactions without being swept away",
        "Recognize mental habits as they occur",
        "Practice gentle awareness without trying to change anything"
      ]
    },
    {
      number: 4,
      title: "Present Moment Awareness",
      subtitle: "Here and Now",
      description: "Develop stable attention in the present moment. This isn't about forcing concentration, but about gently returning attention to what is happening right now.",
      practices: [
        "Practice returning attention to the present",
        "Use simple anchors like breath or body sensations",
        "Notice when mind wanders into past or future",
        "Develop the habit of 'coming back'"
      ]
    },
    {
      number: 5,
      title: "Effortless Being",
      subtitle: "Natural Awareness",
      description: "Discover that awareness itself requires no effort. This stage reveals that the peace you've been seeking has been present all along - you just needed to stop covering it up with mental activity.",
      practices: [
        "Practice 'doing nothing' meditation",
        "Allow thoughts to come and go naturally",
        "Rest in simple awareness",
        "Discover the effortless nature of being present"
      ]
    },
    {
      number: 6,
      title: "Lasting Happiness",
      subtitle: "Integrated Living",
      description: "Integrate this understanding into daily life. Happiness is no longer dependent on circumstances because you've discovered the source of contentment that is always available - present moment awareness.",
      practices: [
        "Apply awareness in daily activities",
        "Maintain perspective during challenges",
        "Help others discover this natural state",
        "Live from understanding rather than seeking"
      ]
    }
  ];

  const toggleStage = (stageNumber: number) => {
    setExpandedStage(expandedStage === stageNumber ? null : stageNumber);
  };

  const handleStartJourney = () => {
    window.location.href = '/signin';
  };

  const handleFAQ = () => {
    window.location.href = '/faq';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            The Return of Attention Method
          </h1>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed opacity-90">
            A complete 6-stage journey from mental chaos to lasting happiness
          </p>
        </div>

        {/* About the Method */}
        <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Why This Method Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-yellow-300">🎯 Simple & Practical</h3>
              <p className="text-lg opacity-90">
                No complex philosophy or mystical beliefs required. Each stage builds naturally on the previous one, 
                using skills you already possess.
              </p>
              
              <h3 className="text-xl font-semibold text-green-300">🔬 Experience-Based</h3>
              <p className="text-lg opacity-90">
                Everything is verifiable through your own direct experience. No faith or belief system needed—
                just practical exploration of how your mind actually works.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-300">⚡ Progressive Training</h3>
              <p className="text-lg opacity-90">
                Like learning any skill, each stage prepares you for the next. The method works because it follows 
                the natural learning process of the mind.
              </p>
              
              <h3 className="text-xl font-semibold text-pink-300">🌟 Lasting Results</h3>
              <p className="text-lg opacity-90">
                Once you complete the stages, the understanding becomes permanent. This isn't temporary relief—
                it's a fundamental shift in how you relate to your own mind.
              </p>
            </div>
          </div>
        </div>

        {/* The 6 Stages */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">The 6 Stages of Practice</h2>
          <div className="space-y-4">
            {stages.map((stage) => (
              <div key={stage.number} className="bg-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
                <button
                  onClick={() => toggleStage(stage.number)}
                  className="w-full p-6 text-left hover:bg-white/5 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-black">
                      {stage.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{stage.title}</h3>
                      <p className="text-lg opacity-80">{stage.subtitle}</p>
                    </div>
                  </div>
                  <div className={`text-2xl transition-transform ${expandedStage === stage.number ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </button>
                
                {expandedStage === stage.number && (
                  <div className="px-6 pb-6 border-t border-white/20">
                    <div className="pt-6 space-y-4">
                      <p className="text-lg leading-relaxed opacity-90">
                        {stage.description}
                      </p>
                      <div>
                        <h4 className="font-semibold mb-2 text-yellow-300">Key Practices:</h4>
                        <ul className="space-y-2">
                          {stage.practices.map((practice, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-400 mt-1">•</span>
                              <span className="opacity-90">{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* About A.C. Amarasinghe - UPDATED DESCRIPTION */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-8 backdrop-blur-sm mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">About A.C. Amarasinghe</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg leading-relaxed mb-6 opacity-90">
              A.C. Amarasinghe is not a traditional teacher, but someone who discovered this method by exploring 
              solutions to his own problems through ancient wisdom. Frustrated with the heavy jargon and complex 
              philosophical systems that made timeless practices inaccessible to ordinary people, he dedicated 
              himself to bridging this gap.
            </p>
            <p className="text-lg leading-relaxed mb-6 opacity-90">
              His approach strips away unnecessary complexity while preserving the essence of what actually works. 
              Rather than adding new concepts or beliefs, he found a way to present the direct, practical heart 
              of ancient mindfulness methods in simple, modern language.
            </p>
            <p className="text-lg leading-relaxed opacity-90">
              Through years of personal exploration and refinement, he developed this 6-stage method that anyone 
              can follow, regardless of their background or beliefs. His goal was simple: make the profound 
              accessible, and help others discover what he had found—that lasting happiness is not something 
              to achieve, but something to recognize.
            </p>
            
            <div className="mt-8 text-center">
              <blockquote className="text-xl italic opacity-80">
                "I'm just someone who got tired of seeking and discovered what was already here. 
                If this method helps even one person skip the years of unnecessary searching, 
                then it was worth sharing."
              </blockquote>
              <cite className="block mt-4 text-lg">— A.C. Amarasinghe</cite>
            </div>
          </div>
        </div>

        {/* The Journey Timeline */}
        <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm mb-12">
          <h2 className="text-3xl font-bold text-center mb-12">Your Journey Timeline</h2>
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-8 top-8 bottom-8 w-1 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-12">
              <div className="flex items-start space-x-6 relative">
                <div className="relative z-10 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center font-bold text-sm text-center shadow-lg border-4 border-white/20">
                  Week<br/>1-2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-2">Foundation Building</h3>
                  <p className="text-lg opacity-90 leading-relaxed">Learn physical stillness and basic thought observation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 relative">
                <div className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center font-bold text-sm text-center shadow-lg border-4 border-white/20">
                  Week<br/>3-6
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-2">Pattern Recognition</h3>
                  <p className="text-lg opacity-90 leading-relaxed">Develop awareness of mental habits and present moment attention</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 relative">
                <div className="relative z-10 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center font-bold text-sm text-center shadow-lg border-4 border-white/20">
                  Week<br/>7+
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-2">Natural Integration</h3>
                  <p className="text-lg opacity-90 leading-relaxed">Discover effortless being and integrate understanding into daily life</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-lg opacity-80">
              <strong>Average completion time:</strong> 2-3 months of consistent practice
            </p>
            <p className="text-sm opacity-60 mt-2">
              Everyone's journey is unique. Some complete faster, others take longer. What matters is consistency, not speed.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Join thousands who have discovered that lasting happiness isn't about changing your circumstances—
            it's about changing your relationship with your own mind.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <button 
              onClick={handleStartJourney}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-xl"
            >
              🚀 Begin Your Practice
            </button>
            <button 
              onClick={handleFAQ}
              className="w-full sm:w-auto px-8 py-4 border-2 border-white/40 rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              ❓ Common Questions
            </button>
          </div>

          <div className="mt-8 text-sm opacity-60">
            <p>No subscription required • Complete guidance included • Start today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMethod;