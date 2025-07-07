// ============================================================================
// src/components/PublicLandingHero.tsx
// CORRECTED VERSION - Clean, Fast Loading, No Logo Loading Issues
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #7c2d12 50%, #be185d 100%)',
      color: 'white',
      overflow: 'hidden',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Floating Background Elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '40px',
          width: '80px',
          height: '80px',
          backgroundColor: 'white',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'pulse 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '160px',
          right: '80px',
          width: '64px',
          height: '64px',
          backgroundColor: '#fbbf24',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'bounce 2s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '160px',
          left: '25%',
          width: '48px',
          height: '48px',
          backgroundColor: '#f9a8d4',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'pulse 3s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '33%',
          width: '32px',
          height: '32px',
          backgroundColor: '#93c5fd',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'bounce 3s infinite'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 24px 48px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px' }}>
            <Logo />
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

        {/* Mind Visualization Demo - Simple Version */}
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
          alignItems: 'center',
          gap: '48px',
          marginBottom: '64px'
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            {/* Simple Mind Visualization */}
            <div style={{
              width: '300px',
              height: '300px',
              margin: '0 auto',
              position: 'relative',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              {/* Center dot - Present awareness */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '20px',
                height: '20px',
                backgroundColor: '#fbbf24',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}></div>
              
              {/* Outer thoughts */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '12px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                opacity: 0.7
              }}></div>
              <div style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '10px',
                height: '10px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                opacity: 0.6
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                opacity: 0.5
              }}></div>
            </div>
            <div style={{
              marginTop: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                See Your Mind in Action
              </p>
              <p style={{
                fontSize: '14px',
                opacity: 0.9,
                margin: 0
              }}>
                Golden center = present awareness. Red dots = thoughts, worries, distractions. 
                The practice = learning to return naturally.
              </p>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 'bold',
              textAlign: window.innerWidth < 1024 ? 'center' : 'left',
              margin: '0 0 24px 0'
            }}>
              Your Mind's Natural Movement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span style={{ fontSize: '18px' }}>Center = Present moment awareness</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%'
                }}></div>
                <span style={{ fontSize: '18px' }}>Outer cells = Thoughts, worries, distractions</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%'
                }}></div>
                <span style={{ fontSize: '18px' }}>The practice = Learning to return naturally</span>
              </div>
            </div>
          </div>
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
                    backgroundColor: '#ef4444',
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
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
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
                    color: '#10b981'
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
              onClick={handleStartJourney}
              style={{
                width: window.innerWidth < 640 ? '100%' : 'auto',
                padding: '16px 32px',
                background: 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)',
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
                e.currentTarget.style.background = 'linear-gradient(90deg, #059669 0%, #2563eb 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #10b981 0%, #3b82f6 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🚀 Start Your Journey
            </button>
            <button 
              onClick={handleLearnMore}
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
      `}</style>
    </div>
  );
};

export default PublicLandingHero;