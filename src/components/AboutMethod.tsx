// ============================================================================
// src/components/AboutMethod.tsx
// 🎯 FIXED: Proper React Router Navigation + Matching Design
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ADDED: React Router navigation
import Logo from '../Logo'; // ✅ CORRECT IMPORT

const AboutMethod: React.FC = () => {
  const navigate = useNavigate(); // ✅ ADDED: Navigation hook
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  // ✅ FIXED: Proper React Router navigation functions
  const handleBackToHome = () => {
    console.log('🏠 Navigating back to home');
    navigate('/');
  };

  const handleStartJourney = () => {
    console.log('🚀 Starting journey - navigating to /signin');
    navigate('/signin');
  };

  const handleFAQ = () => {
    console.log('❓ Navigating to FAQ');
    navigate('/faq');
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #a855f7 100%)',
      color: 'white',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* ✅ ADDED: Top Navigation Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button 
          onClick={handleBackToHome}
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
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          🏠 Home
        </button>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleFAQ}
            style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ❓ FAQ
          </button>
          
          <button 
            onClick={handleStartJourney}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(90deg, #a855f7 0%, #667eea 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #9333ea 0%, #5a67d8 100%)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #a855f7 0%, #667eea 100%)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🚀 Start Journey
          </button>
        </div>
      </div>

      {/* ✅ ADDED: Floating Background Elements */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        <div style={{
          position: 'absolute',
          top: '140px',
          left: '80px',
          width: '120px',
          height: '120px',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          animation: 'pulse 4s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '220px',
          right: '60px',
          width: '90px',
          height: '90px',
          backgroundColor: 'rgba(168, 85, 247, 0.4)',
          borderRadius: '50%',
          animation: 'bounce 5s infinite'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 24px 48px',
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ 
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Logo />
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            The Return of Attention Method
          </h1>
          <p style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: 1.6,
            opacity: 0.9
          }}>
            A complete 6-stage journey from mental chaos to lasting happiness
          </p>
        </div>

        {/* About the Method */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '32px',
            textAlign: 'center',
            margin: '0 0 32px 0'
          }}>
            Why This Method Works
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
            gap: '32px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#fbbf24',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>🎯 Simple & Practical</h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  opacity: 0.9,
                  margin: 0
                }}>
                  No complex philosophy or mystical beliefs required. Each stage builds naturally on the previous one, 
                  using skills you already possess.
                </p>
              </div>
              
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#34d399',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>🔬 Experience-Based</h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  opacity: 0.9,
                  margin: 0
                }}>
                  Everything is verifiable through your own direct experience. No faith or belief system needed—
                  just practical exploration of how your mind actually works.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#60a5fa',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>⚡ Progressive Training</h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  opacity: 0.9,
                  margin: 0
                }}>
                  Like learning any skill, each stage prepares you for the next. The method works because it follows 
                  the natural learning process of the mind.
                </p>
              </div>
              
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#f472b6',
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>🌟 Lasting Results</h3>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.6,
                  opacity: 0.9,
                  margin: 0
                }}>
                  Once you complete the stages, the understanding becomes permanent. This isn't temporary relief—
                  it's a fundamental shift in how you relate to your own mind.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 6 Stages */}
        <div style={{ marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '32px',
            margin: '0 0 32px 0'
          }}>
            The 6 Stages of Practice
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stages.map((stage) => (
              <div key={stage.number} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => toggleStage(stage.number)}
                  style={{
                    width: '100%',
                    padding: '24px',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: '#000',
                      fontSize: '18px'
                    }}>
                      {stage.number}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: '0 0 4px 0'
                      }}>
                        {stage.title}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        opacity: 0.8,
                        margin: 0
                      }}>
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    fontSize: '24px',
                    transform: expandedStage === stage.number ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    minWidth: '24px'
                  }}>
                    ▼
                  </div>
                </button>
                
                {expandedStage === stage.number && (
                  <div style={{
                    padding: '0 24px 24px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{
                        fontSize: '16px',
                        lineHeight: 1.6,
                        opacity: 0.9,
                        margin: 0
                      }}>
                        {stage.description}
                      </p>
                      <div>
                        <h4 style={{
                          fontWeight: '600',
                          marginBottom: '8px',
                          color: '#fbbf24',
                          margin: '0 0 8px 0'
                        }}>Key Practices:</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {stage.practices.map((practice, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px'
                            }}>
                              <span style={{ color: '#34d399', marginTop: '4px' }}>•</span>
                              <span style={{ opacity: 0.9 }}>{practice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* About A.C. Amarasinghe */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            textAlign: 'center',
            margin: '0 0 24px 0'
          }}>
            About A.C. Amarasinghe
          </h2>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              opacity: 0.9,
              margin: 0
            }}>
              A.C. Amarasinghe is not a traditional teacher, but someone who discovered this method by exploring 
              solutions to his own problems through ancient wisdom. Frustrated with the heavy jargon and complex 
              philosophical systems that made timeless practices inaccessible to ordinary people, he dedicated 
              himself to bridging this gap.
            </p>
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              opacity: 0.9,
              margin: 0
            }}>
              His approach strips away unnecessary complexity while preserving the essence of what actually works. 
              Rather than adding new concepts or beliefs, he found a way to present the direct, practical heart 
              of ancient mindfulness methods in simple, modern language.
            </p>
            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              opacity: 0.9,
              margin: 0
            }}>
              Through years of personal exploration and refinement, he developed this 6-stage method that anyone 
              can follow, regardless of their background or beliefs. His goal was simple: make the profound 
              accessible, and help others discover what he had found—that lasting happiness is not something 
              to achieve, but something to recognize.
            </p>
            
            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <blockquote style={{
                fontSize: '20px',
                fontStyle: 'italic',
                opacity: 0.8,
                margin: '0 0 16px 0',
                lineHeight: 1.6
              }}>
                "I'm just someone who got tired of seeking and discovered what was already here. 
                If this method helps even one person skip the years of unnecessary searching, 
                then it was worth sharing."
              </blockquote>
              <cite style={{
                display: 'block',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>— A.C. Amarasinghe</cite>
            </div>
          </div>
        </div>

        {/* The Journey Timeline */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(10px)',
          marginBottom: '48px'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '48px',
            margin: '0 0 48px 0'
          }}>
            Your Journey Timeline
          </h2>
          <div style={{
            position: 'relative',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* Timeline Line */}
            <div style={{
              position: 'absolute',
              left: '32px',
              top: '32px',
              bottom: '32px',
              width: '4px',
              background: 'linear-gradient(180deg, #3b82f6, #10b981, #8b5cf6)',
              borderRadius: '2px'
            }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative' }}>
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '64px',
                  height: '64px',
                  background: '#3b82f6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  border: '4px solid rgba(255, 255, 255, 0.2)'
                }}>
                  Week<br/>1-2
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>Foundation Building</h3>
                  <p style={{
                    fontSize: '18px',
                    opacity: 0.9,
                    lineHeight: 1.6,
                    margin: 0
                  }}>Learn physical stillness and basic thought observation</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative' }}>
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '64px',
                  height: '64px',
                  background: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  border: '4px solid rgba(255, 255, 255, 0.2)'
                }}>
                  Week<br/>3-6
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>Pattern Recognition</h3>
                  <p style={{
                    fontSize: '18px',
                    opacity: 0.9,
                    lineHeight: 1.6,
                    margin: 0
                  }}>Develop awareness of mental habits and present moment attention</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', position: 'relative' }}>
                <div style={{
                  position: 'relative',
                  zIndex: 10,
                  width: '64px',
                  height: '64px',
                  background: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  textAlign: 'center',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                  border: '4px solid rgba(255, 255, 255, 0.2)'
                }}>
                  Week<br/>7+
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>Natural Integration</h3>
                  <p style={{
                    fontSize: '18px',
                    opacity: 0.9,
                    lineHeight: 1.6,
                    margin: 0
                  }}>Discover effortless being and integrate understanding into daily life</p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{
              fontSize: '18px',
              opacity: 0.8,
              margin: '0 0 8px 0'
            }}>
              <strong>Average completion time:</strong> 2-3 months of consistent practice
            </p>
            <p style={{
              fontSize: '14px',
              opacity: 0.6,
              margin: 0
            }}>
              Everyone's journey is unique. Some complete faster, others take longer. What matters is consistency, not speed.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px 32px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 32px)',
            fontWeight: 'bold',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Ready to Start Your Journey?
          </h2>
          <p style={{
            fontSize: '20px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: 1.6
          }}>
            Join thousands who have discovered that lasting happiness isn't about changing your circumstances—
            it's about changing your relationship with your own mind.
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
                padding: '18px 36px',
                background: 'linear-gradient(90deg, #10b981, #3b82f6)',
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
                e.currentTarget.style.background = 'linear-gradient(90deg, #059669, #2563eb)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(90deg, #10b981, #3b82f6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🚀 Begin Your Practice
            </button>
            <button 
              onClick={handleFAQ}
              style={{
                width: window.innerWidth < 640 ? '100%' : 'auto',
                padding: '18px 36px',
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
              ❓ Common Questions
            </button>
          </div>

          <div style={{
            marginTop: '24px',
            fontSize: '14px',
            opacity: 0.6
          }}>
            <p style={{ margin: 0 }}>No subscription required • Complete guidance included • Start today</p>
          </div>
        </div>

        {/* Bottom Quote */}
        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <blockquote style={{
            fontSize: 'clamp(18px, 3vw, 24px)',
            fontStyle: 'italic',
            opacity: 0.8,
            maxWidth: '800px',
            margin: '0 auto 16px',
            lineHeight: 1.6
          }}>
            "This book offers a practice, not a philosophy. It is about returning—
            bringing attention back to what is already here."
          </blockquote>
          <cite style={{
            display: 'block',
            marginTop: '16px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            — A.C. Amarasinghe
          </cite>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};

export default AboutMethod;