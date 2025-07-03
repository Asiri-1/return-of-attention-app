// ============================================================================
// src/components/JourneyHero.tsx
// Hero section highlighting the complete Journey to Lasting Happiness platform
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';

const JourneyHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white overflow-hidden min-h-screen flex items-center">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='3'/%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} 
        />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce">🧘</div>
      <div className="absolute top-40 right-20 text-3xl opacity-20 animate-bounce">✨</div>
      <div className="absolute bottom-40 left-20 text-3xl opacity-20 animate-bounce">🌟</div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 text-center z-10">
        {/* Founder Attribution */}
        <div className="mb-8">
          <span className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm border border-white/30">
            <span className="mr-2">🇱🇰</span>
            Founded by A.C. Amarasinghe, Sri Lanka
          </span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
          Your Journey to
          <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
            Lasting Happiness
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-3xl mb-12 max-w-5xl mx-auto leading-relaxed opacity-90">
          Complete transformation through <strong>Pure Awareness Healing Methods (PAHM)</strong>
          <br />
          <span className="text-lg md:text-xl mt-2 block opacity-80">
            Practice tracking • Mind recovery • AI wisdom guidance • Ancient teachings
          </span>
        </p>
        
        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-16">
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => navigate('/analytics')}
          >
            <div className="text-3xl md:text-4xl mb-3">📊</div>
            <h3 className="font-bold text-sm md:text-base mb-1">Practice Analytics</h3>
            <p className="text-xs md:text-sm opacity-80">Track your mindfulness progress with detailed insights</p>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => navigate('/mind-recovery')}
          >
            <div className="text-3xl md:text-4xl mb-3">🧠</div>
            <h3 className="font-bold text-sm md:text-base mb-1">Mind Recovery</h3>
            <p className="text-xs md:text-sm opacity-80">Restore mental clarity and emotional balance</p>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => navigate('/chatwithguru')}
          >
            <div className="text-3xl md:text-4xl mb-3">🤖</div>
            <h3 className="font-bold text-sm md:text-base mb-1">AI Wisdom Guide</h3>
            <p className="text-xs md:text-sm opacity-80">Smart PAHM Guru with instant guidance</p>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => navigate('/notes')}
          >
            <div className="text-3xl md:text-4xl mb-3">📝</div>
            <h3 className="font-bold text-sm md:text-base mb-1">Daily Practice</h3>
            <p className="text-xs md:text-sm opacity-80">Mindful journaling and reflection tools</p>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => navigate('/learn')}
          >
            <div className="text-3xl md:text-4xl mb-3">📚</div>
            <h3 className="font-bold text-sm md:text-base mb-1">PAHM Learning</h3>
            <p className="text-xs md:text-sm opacity-80">Ancient wisdom and modern science</p>
          </div>
          
          <div 
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 cursor-pointer hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => navigate('/home')}
          >
            <div className="text-3xl md:text-4xl mb-3">🌟</div>
            <h3 className="font-bold text-sm md:text-base mb-1">Your Dashboard</h3>
            <p className="text-xs md:text-sm opacity-80">Personal journey overview and insights</p>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/home')}
            className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            🌟 Continue Your Journey
          </button>
          <button 
            onClick={() => navigate('/learn')}
            className="px-8 py-4 border-2 border-white/40 rounded-full font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            📚 Learn About PAHM
          </button>
        </div>
        
        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold">6</div>
            <div className="text-xs md:text-sm opacity-80">Core Features</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold">∞</div>
            <div className="text-xs md:text-sm opacity-80">Growth Potential</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold">🇱🇰</div>
            <div className="text-xs md:text-sm opacity-80">Sri Lankan Wisdom</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneyHero;