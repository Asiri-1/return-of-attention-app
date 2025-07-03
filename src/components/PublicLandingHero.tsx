// ============================================================================
// src/components/PublicLandingHero.tsx
// FINAL BEAUTIFUL VERSION - Tailwind CSS Working!
// ============================================================================

import React, { useState, useEffect } from 'react';
import Logo from '../Logo';

const PublicLandingHero: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    "You are not your thoughts",
    "The mind is trainable",
    "Present attention itself is happiness",
    "Peace is not found - it is recognized"
  ];

  const problems = [
    "Mind won't quiet down",
    "Constant worry and stress", 
    "Feeling trapped in thoughts",
    "Nothing feels quite right",
    "Always seeking, never satisfied"
  ];

  const handleStartJourney = () => {
    window.location.href = '/signin';
  };
  
  const handleLearnMore = () => {
    window.location.href = '/about';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-pink-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-blue-300 rounded-full opacity-10 animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Rotating Quote */}
          <div className="h-20 flex items-center justify-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold transition-all duration-500 ease-in-out">
              "{quotes[currentQuote]}"
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl mb-6 opacity-90">
            The Return of Attention
          </h2>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed opacity-80">
            A simple, practical guide to happiness that actually stays
          </p>
        </div>

        {/* Logo Demo Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2 text-center">
            <Logo />
            <div className="mt-6 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-lg font-semibold mb-2">See Your Mind in Action</p>
              <p className="text-sm opacity-90">
                Watch the golden dot move from center (present awareness) to outer thoughts, 
                then return to center. This is exactly what your mind will learn to do.
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-6">
            <h3 className="text-3xl font-bold text-center lg:text-left">
              Your Mind's Natural Movement
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-lg">Center = Present moment awareness</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-lg">Outer cells = Thoughts, worries, distractions</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-lg">The practice = Learning to return naturally</span>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Sound Familiar?
            </h3>
            <div className="space-y-4">
              {problems.map((problem, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/10 rounded-lg p-4">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-lg">{problem}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <p className="text-lg opacity-80">
                You're not alone. This is how the mind naturally works.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 text-center">
              What If There's a Way Out?
            </h3>
            <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">🧘</div>
                <h4 className="text-xl font-semibold">The Universal Solution</h4>
                <p className="text-lg opacity-90">
                  Unlike your body, your mind <em>is</em> trainable. 
                  Thousands have found lasting peace through this simple practice.
                </p>
                <div className="mt-6">
                  <div className="text-4xl font-bold text-green-400">6 Stages</div>
                  <div className="text-sm opacity-80">From chaos to clarity</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Journey */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-8">Your Journey to Freedom</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-1">Stage 1-2</h4>
              <p className="text-sm opacity-80">Physical stillness & thought observation</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-semibold mb-1">Stage 3-4</h4>
              <p className="text-sm opacity-80">Recognizing mental patterns</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">✨</div>
              <h4 className="font-semibold mb-1">Stage 5-6</h4>
              <p className="text-sm opacity-80">Discovering lasting happiness</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-1">No Beliefs</h4>
              <p className="text-sm opacity-80">Just practical experience</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-semibold mb-1">No Special Skills</h4>
              <p className="text-sm opacity-80">Anyone can do this</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="font-semibold mb-1">Happiness That Stays</h4>
              <p className="text-sm opacity-80">Not dependent on circumstances</p>
            </div>
          </div>
        </div>

        {/* Simple Truth */}
        <div className="max-w-3xl mx-auto text-center mb-16 bg-white/5 rounded-xl p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">The Simple Truth</h3>
          <p className="text-xl leading-relaxed mb-6">
            Most approaches to happiness involve <strong>adding</strong> something new. 
            This approach is different. It involves <strong>removing</strong> the obstacles 
            to the peace that is already your natural state.
          </p>
          <div className="text-lg opacity-90">
            <div className="mb-2">🔍 Notice when attention wanders</div>
            <div className="mb-2">↩️ Gently return to the present</div>
            <div>🔄 Repeat until it becomes natural</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold">Ready to Begin?</h3>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands who have discovered that lasting happiness isn't something to achieve—
            it's something to recognize.
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
            <p>No subscription required • Complete guide included • Start immediately</p>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="mt-20 text-center">
          <blockquote className="text-2xl italic opacity-80 max-w-3xl mx-auto">
            "This book offers a practice, not a philosophy. It is about returning—
            bringing attention back to what is already here."
          </blockquote>
          <cite className="block mt-4 text-lg">— A.C. Amarasinghe</cite>
        </div>
      </div>
    </div>
  );
};

export default PublicLandingHero;