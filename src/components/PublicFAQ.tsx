// ============================================================================
// src/components/PublicFAQ.tsx
// Public FAQ page without Sri Lanka flag
// ============================================================================

import React, { useState } from 'react';
import Logo from '../Logo';

const PublicFAQ: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need any previous meditation experience?",
      answer: "No experience is needed. This method is designed for complete beginners. In fact, having no preconceptions about meditation can actually be helpful, as you won't need to unlearn complicated techniques."
    },
    {
      question: "How long does each practice session take?",
      answer: "You start with just 5-10 minutes per day and gradually build up. By Stage 6, you might practice for 20-30 minutes, but the understanding integrates into daily life, so formal practice time becomes less important."
    },
    {
      question: "What if I can't stop my thoughts?",
      answer: "Perfect! You're not supposed to stop thoughts. The method teaches you to observe thoughts without getting caught up in them. Trying to stop thinking is like trying to stop the ocean waves - impossible and unnecessary."
    },
    {
      question: "Is this religious or does it conflict with my beliefs?",
      answer: "This is a practical method, not a religion or belief system. It doesn't ask you to believe anything or change your existing beliefs. It's simply a training method for your attention, like going to the gym for your mind."
    },
    {
      question: "How is this different from other meditation apps?",
      answer: "Most apps focus on temporary relaxation or stress relief. This method aims for a permanent shift in how you relate to your mind. It's a complete training system with clear stages, not just guided meditations."
    },
    {
      question: "What if I miss days of practice?",
      answer: "Consistency matters more than perfection. If you miss a day, just start again the next day. The method is forgiving and designed to work with real life, not against it."
    },
    {
      question: "How do I know if it's working?",
      answer: "You'll notice increased awareness of your thought patterns, less reactive behavior, improved emotional stability, and a growing sense of inner peace that doesn't depend on circumstances."
    },
    {
      question: "What makes the author qualified to teach this?",
      answer: "A.C. Amarasinghe isn't a traditional teacher but someone who solved his own mental suffering using this method. He spent years refining the approach to make ancient wisdom accessible without heavy jargon or complex philosophy."
    },
    {
      question: "Is there ongoing support or community?",
      answer: "The method is designed to be self-sufficient once you understand it. However, the platform includes guidance, progress tracking, and AI-powered assistance to help you along the way."
    },
    {
      question: "What if this doesn't work for me?",
      answer: "The method works because it's based on how the mind naturally functions. However, it does require consistent practice and patience. If you're dealing with serious mental health issues, we recommend consulting with a healthcare professional alongside any practice."
    },
    {
      question: "How much does this cost?",
      answer: "The complete method and platform access are provided at no cost. The goal is to make this accessible to anyone who needs it, regardless of their financial situation."
    },
    {
      question: "Can children or teenagers use this method?",
      answer: "Yes, this method is developed for anyone. At its core, it's simply about identifying thoughts - something everyone naturally does. If you can notice when you're thinking, you can use this method. Age doesn't matter when it comes to the basic human ability to observe your own mind.he basic principles can be adapted for younger people, but the method is primarily designed for adults who can engage with self-reflection and sustained practice."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleStartJourney = () => {
    window.location.href = '/signin';
  };

  const handleLearnMore = () => {
    window.location.href = '/about';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Logo />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Questions & Answers
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-90">
            Common questions about The Return of Attention Method
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/10 rounded-lg backdrop-blur-sm overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left hover:bg-white/5 transition-all flex items-center justify-between"
              >
                <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                <div className={`text-2xl transition-transform flex-shrink-0 ${expandedFAQ === index ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {expandedFAQ === index && (
                <div className="px-6 pb-6 border-t border-white/20">
                  <div className="pt-6">
                    <p className="text-lg leading-relaxed opacity-90">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-6 bg-white/5 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold">Still Have Questions?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            The best way to understand this method is to experience it yourself. 
            Start your journey today and discover what thousands have already found.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <button 
              onClick={handleStartJourney}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-xl"
            >
              🚀 Start Your Journey
            </button>
            <button 
              onClick={handleLearnMore}
              className="w-full sm:w-auto px-8 py-4 border-2 border-white/40 rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              📖 Learn More
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

export default PublicFAQ;