// ============================================================================
// src/components/PublicLandingHero.tsx
// 🔧 FIXED: Use React Router navigation instead of window.location.href
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ CRITICAL: Import useNavigate
import Logo from '../Logo';

const PublicLandingHero: React.FC = () => {
  const navigate = useNavigate(); // ✅ CRITICAL: Initialize navigation hook
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

  // ✅ CRITICAL FIX: Use React Router navigation instead of window.location.href
  const handleStartJourney = () => {
    console.log('🚀 Starting journey - navigating to /signin');
    navigate('/signin');
  };
  
  const handleSignIn = () => {
    console.log('🔐 Sign in clicked - navigating to /signin');
    navigate('/signin');
  };
  
  const handleLearnMore = () => {
    console.log('📖 Learn more clicked - navigating to /about');
    navigate('/about');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%)',
      color: 'white',
      overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Top Navigation Bar for Returning Visitors */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}>
        <button 
          onClick={handleSignIn} // ✅ FIXED: Use React Router navigation
          style={{
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '25px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '120px',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Sign In
        </button>
      </div>

      {/* Floating Background Elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '40px',
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '160px',
          right: '80px',
          width: '64px',
          height: '64px',
          backgroundColor: 'rgba(139, 92, 246, 0.4)',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'bounce 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '160px',
          left: '25%',
          width: '48px',
          height: '48px',
          backgroundColor: 'rgba(102, 126, 234, 0.4)',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'pulse 3s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '33%',
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(168, 85, 247, 0.4)',
          borderRadius: '50%',
          opacity: 0.3,
          animation: 'bounce 3s infinite'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '80px 24px 48px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          {/* Logo without white box background */}
          <div style={{ 
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'inline-block'
            }}>
              <Logo />
            </div>
          </div>
          
          {/* Rotating Quote */}
          <div style={{
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            <h1 style={{
              fontSize: 'clamp(28px, 6vw, 60px)',
              fontWeight: 'bold',
              transition: 'all 0.5s ease-in-out',
              margin: 0,
              textAlign: 'center'
            }}>
              "{quotes[currentQuote]}"
            </h1>
          </div>
          
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            marginBottom: '24px',
            opacity: 0.9,
            margin: '0 0 24px 0'
          }}>
            Practices for the Happiness that Stays
          </h2>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6,
            opacity: 0.8
          }}>
            A simple, practical guide to happiness that actually stays
          </p>
        </div>

        {/* Problem Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
          gap: '48px',
          marginBottom: '64px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              margin: '0 0 24px 0'
            }}>
              Sound Familiar?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {problems.map((problem, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%'
                  }}></div>
                  <span style={{ fontSize: '18px' }}>{problem}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <p style={{
                fontSize: '18px',
                opacity: 0.8,
                margin: 0
              }}>
                You're not alone. This is how the mind naturally works.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              margin: '0 0 24px 0'
            }}>
              What If There's a Way Out?
            </h3>
            <div style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(102, 126, 234, 0.3) 100%)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ fontSize: '64px', margin: '0 0 16px 0' }}>🧘</div>
                <h4 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  The Universal Solution
                </h4>
                <p style={{
                  fontSize: '18px',
                  opacity: 0.9,
                  margin: 0
                }}>
                  Unlike your body, your mind <em>is</em> trainable. 
                  Thousands have found lasting peace through this simple practice.
                </p>
                <div style={{ marginTop: '24px' }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#a855f7'
                  }}>
                    6 Stages
                  </div>
                  <div style={{
                    fontSize: '14px',
                    opacity: 0.8
                  }}>
                    From chaos to clarity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Journey */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h3 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>
            Your Journey to Freedom
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', margin: '0 0 4px 0' }}>Stage 1-2</h4>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Physical stillness & thought observation</p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', margin: '0 0 4px 0' }}>Stage 3-4</h4>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Recognizing mental patterns</p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', margin: '0 0 4px 0' }}>Stage 5-6</h4>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Discovering lasting happiness</p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', margin: '0 0 4px 0' }}>No Beliefs</h4>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Just practical experience</p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔄</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', margin: '0 0 4px 0' }}>No Special Skills</h4>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Anyone can do this</p>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎁</div>
              <h4 style={{ fontWeight: '600', marginBottom: '4px', margin: '0 0 4px 0' }}>Happiness That Stays</h4>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Not dependent on circumstances</p>
            </div>
          </div>
        </div>

        {/* Simple Truth */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 64px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '32px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            The Simple Truth
          </h3>
          <p style={{
            fontSize: '20px',
            lineHeight: 1.6,
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Most approaches to happiness involve <strong>adding</strong> something new. 
            This approach is different. It involves <strong>removing</strong> the obstacles 
            to the peace that is already your natural state.
          </p>
          <div style={{
            fontSize: '18px',
            opacity: 0.9,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div>🔍 Notice when attention wanders</div>
            <div>↩️ Gently return to the present</div>
            <div>🔄 Repeat until it becomes natural</div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <h3 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            margin: 0
          }}>
            Ready to Begin?
          </h3>
          <p style={{
            fontSize: '20px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Join thousands who have discovered that lasting happiness isn't something to achieve—
            it's something to recognize.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth < 640 ? 'column' : 'row',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <button 
              onClick={handleStartJourney} // ✅ FIXED: Use React Router navigation
              style={{
                width: window.innerWidth < 640 ? '100%' : 'auto',
                padding: '16px 32px',
                background: 'linear-gradient(90deg, #a855f7 0%, #667eea 100%)',
                color: 'white',
                borderRadius: '50px',
                fontWeight: 'bold',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #9333ea 0%, #5a67d8 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #a855f7 0%, #667eea 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🚀 Start Your Journey
            </button>
            <button 
              onClick={handleLearnMore} // ✅ FIXED: Use React Router navigation
              style={{
                width: window.innerWidth < 640 ? '100%' : 'auto',
                padding: '16px 32px',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '18px',
                backgroundColor: 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              📖 Learn More
            </button>
          </div>

          <div style={{
            marginTop: '32px',
            fontSize: '14px',
            opacity: 0.6
          }}>
            <p style={{ margin: 0 }}>No subscription required • Complete guide included • Start immediately</p>
          </div>
        </div>

        {/* Bottom Quote */}
        <div style={{ marginTop: '80px', textAlign: 'center' }}>
          <blockquote style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontStyle: 'italic',
            opacity: 0.8,
            maxWidth: '800px',
            margin: '0 auto 16px'
          }}>
            "This book offers a practice, not a philosophy. It is about returning—
            bringing attention back to what is already here."
          </blockquote>
          <cite style={{
            display: 'block',
            marginTop: '16px',
            fontSize: '18px'
          }}>
            — A.C. Amarasinghe
          </cite>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Responsive: Hide sign-in button on very small screens */
        @media (max-width: 480px) {
          .top-signin-btn {
            padding: 10px 16px !important;
            font-size: 12px !important;
            min-width: 90px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicLandingHero;