// src/services/EnhancedLocalStorageManager.ts

// Your book content types
interface BookContent {
    bookId: string;
    title: string;
    author: string;
    version: string;
    
    chapters: {
      chapterId: string;
      chapterNumber: number;
      title: string;
      stage: 1 | 2 | 3 | 4 | 5 | 6;
      content: string;
      keyPoints: string[];
      practiceInstructions: string[];
      commonChallenges: string[];
      progressMarkers: string[];
      estimatedHours: number;
    }[];
    
    pahmConcepts: {
      conceptId: string;
      name: string;
      definition: string;
      matrixPosition: {
        timeAxis: 'past' | 'present' | 'future';
        emotionalAxis: 'likes' | 'neutral' | 'dislikes';
        isPoisonous: boolean;
      };
      practicalGuidance: string[];
      stageRelevance: number[];
      commonMisunderstandings: string[];
    }[];
    
    wisdomQuotes: {
      quoteId: string;
      text: string;
      context: string;
      chapterId: string;
      useCase: 'motivation' | 'guidance' | 'insight' | 'encouragement';
      userLevel: 'beginner' | 'intermediate' | 'advanced';
    }[];
  }
  
  export class EnhancedLocalStorageManager {
    private static readonly KNOWLEDGE_KEYS = {
      BOOK_CONTENT: 'roa_book_content',
      KNOWLEDGE_INDEX: 'roa_knowledge_index',
      AI_RESPONSES: 'roa_ai_responses'
    };
  
    // Initialize your book content
    static initializeBookContent(): boolean {
      const bookContent: BookContent = {
        bookId: 'return_of_attention_v1',
        title: 'Return of the Attention',
        author: 'A.C. Amarasinghe',
        version: '1.0.0',
        
        chapters: [
          {
            chapterId: 'ch1',
            chapterNumber: 1,
            title: 'The Return of Attention',
            stage: 1,
            content: `The universal need - You are reading this book because something doesn't feel right or no matter whatever you do, something is missing. Perhaps there's a quiet unease that follows you through your days.`,
            keyPoints: [
              'You are not your thoughts',
              'The mind is trainable unlike the body',
              'Most struggle comes from thoughts about life, not life itself',
              'The practice involves returning attention to the present moment'
            ],
            practiceInstructions: [
              'Notice when your attention has wandered into thought',
              'Gently return to present attention',
              'Repeat this process thousands of times'
            ],
            commonChallenges: [
              'Mental restlessness',
              'Doubt about the practice',
              'Wanting to skip ahead'
            ],
            progressMarkers: [
              'Increased awareness of thought patterns',
              'Ability to notice when mind wanders',
              'Growing sense of peace in present moments'
            ],
            estimatedHours: 10
          },
          {
            chapterId: 'ch7',
            chapterNumber: 7,
            title: 'Introducing the PAHM Matrix',
            stage: 2,
            content: `The Present Attention and Happiness Matrix (PAHM) is a simple but powerful tool for observing where your attention goes. It consists of nine positions arranged in a 3×3 grid.`,
            keyPoints: [
              'PAHM Matrix maps thoughts by time and emotional quality',
              'Only Present + Neutral represents direct contact with reality',
              'Other 8 positions involve mental construction about reality',
              'The matrix helps develop awareness of attention patterns'
            ],
            practiceInstructions: [
              'Categorize thoughts by Past/Present/Future',
              'Identify emotional quality: Likes/Neutral/Dislikes',
              'Track patterns using dot method',
              'Notice how different positions affect your experience'
            ],
            commonChallenges: [
              'Difficulty categorizing thoughts quickly',
              'Getting lost in thoughts while tracking',
              'Judging yourself based on patterns'
            ],
            progressMarkers: [
              'Quick recognition of thought positions',
              'Clear seeing of habitual patterns',
              'Growing space between thoughts and identification'
            ],
            estimatedHours: 15
          },
          {
            chapterId: 'ch15',
            chapterNumber: 15,
            title: 'Advanced Practice - Recognizing Poisonous Thoughts',
            stage: 3,
            content: `In Stage Three, we introduce the concept of "poison." Just as physical poisons damage the body, mental poisons damage our peace of mind.`,
            keyPoints: [
              'Thoughts outside Present + Neutral are poisonous to peace',
              'Recognition must be immediate to prevent identification',
              'All minds produce poisonous thoughts - this is normal',
              'The key is not consuming these thoughts'
            ],
            practiceInstructions: [
              'Quickly identify thought position in matrix',
              'Recognize: "This thought is poisonous"',
              'Let it go and return to present attention',
              'Repeat without judgment or force'
            ],
            commonChallenges: [
              'Feeling aversion toward thoughts themselves',
              'Forgetting to recognize poisonous nature',
              'Overwhelm at frequency of poisonous thoughts'
            ],
            progressMarkers: [
              'Immediate recognition of thought positions',
              'Natural release of poisonous thoughts',
              'Growing stability in present attention'
            ],
            estimatedHours: 20
          },
          {
            chapterId: 'ch23',
            chapterNumber: 23,
            title: 'Realizing Present is Happiness',
            stage: 5,
            content: `Stage Five represents a profound shift from seeing practice as means to happiness to recognizing that present attention itself is happiness.`,
            keyPoints: [
              'Present attention itself IS happiness',
              'True happiness doesn\'t depend on conditions',
              'This recognition ends the endless search for fulfillment',
              'Freedom comes from recognizing what\'s already here'
            ],
            practiceInstructions: [
              'Recognize the inherent peaceful nature of present attention',
              'When thoughts arise, see their poisonous nature',
              'Return to the happiness of present attention',
              'Rest in this recognition throughout daily life'
            ],
            commonChallenges: [
              'Doubting whether present attention really is happiness',
              'Seeking special experiences or states',
              'Fluctuating between recognition and forgetting'
            ],
            progressMarkers: [
              'Direct knowing rather than intellectual understanding',
              'Natural joy in simple presence',
              'Decreased compulsive seeking of pleasures'
            ],
            estimatedHours: 30
          }
        ],
        
        pahmConcepts: [
          {
            conceptId: 'present_neutral',
            name: 'Present + Neutral',
            definition: 'Direct attention to reality without mental commentary or emotional reactivity. The only non-poisonous position on the matrix.',
            matrixPosition: {
              timeAxis: 'present',
              emotionalAxis: 'neutral',
              isPoisonous: false
            },
            practicalGuidance: [
              'Simply notice what is happening now without judgment',
              'Feel sensations directly without labeling them good or bad',
              'Observe thoughts arising without getting caught in their content',
              'Rest in the space of awareness itself'
            ],
            stageRelevance: [2, 3, 4, 5, 6],
            commonMisunderstandings: [
              'Thinking you need to force yourself to stay here',
              'Believing this should feel special or exciting',
              'Trying to eliminate all other thoughts permanently'
            ]
          },
          {
            conceptId: 'poisonous_thoughts',
            name: 'Poisonous Thoughts',
            definition: 'Any thoughts outside the Present + Neutral position that disturb peace of mind by pulling attention away from direct reality.',
            matrixPosition: {
              timeAxis: 'past',
              emotionalAxis: 'likes',
              isPoisonous: true
            },
            practicalGuidance: [
              'Recognize immediately: "This thought is poisonous"',
              'Don\'t fight or suppress - simply let go',
              'Return attention to present moment',
              'Understand this is normal and part of the practice'
            ],
            stageRelevance: [3, 4, 5, 6],
            commonMisunderstandings: [
              'Thinking the thoughts themselves are bad',
              'Believing you should never have poisonous thoughts',
              'Using force to eliminate thoughts'
            ]
          }
        ],
        
        wisdomQuotes: [
          {
            quoteId: 'q1',
            text: 'You are not your thoughts. Your thoughts arise within your attention like clouds in the sky, but you are the sky, not the clouds.',
            context: 'Fundamental insight about identity and thoughts',
            chapterId: 'ch1',
            useCase: 'insight',
            userLevel: 'beginner'
          },
          {
            quoteId: 'q2',
            text: 'The mind is a magnificent tool. But like any powerful tool, when misused or left running unattended, it creates problems of its own.',
            context: 'Understanding the nature of mind',
            chapterId: 'ch1',
            useCase: 'guidance',
            userLevel: 'beginner'
          },
          {
            quoteId: 'q3',
            text: 'Present attention itself is happiness. This recognition turns conventional understanding on its head.',
            context: 'The fundamental discovery of Stage 5',
            chapterId: 'ch23',
            useCase: 'insight',
            userLevel: 'advanced'
          }
        ]
      };
  
      try {
        localStorage.setItem(this.KNOWLEDGE_KEYS.BOOK_CONTENT, JSON.stringify(bookContent));
        this.createKnowledgeIndex(bookContent);
        return true;
      } catch (error) {
        console.error('Error initializing book content:', error);
        return false;
      }
    }
  
    // Create searchable index of your content
    private static createKnowledgeIndex(bookContent: BookContent): void {
      const index: { [key: string]: { type: string; id: string; relevance: number }[] } = {};
      
      // Index chapters
      bookContent.chapters.forEach(chapter => {
        const keywords = [
          chapter.title,
          ...chapter.keyPoints,
          ...chapter.practiceInstructions,
          ...chapter.commonChallenges
        ].join(' ').toLowerCase().split(' ');
        
        keywords.forEach(word => {
          if (word.length > 3) { // Skip short words
            if (!index[word]) index[word] = [];
            index[word].push({
              type: 'chapter',
              id: chapter.chapterId,
              relevance: 1.0
            });
          }
        });
      });
      
      // Index PAHM concepts
      bookContent.pahmConcepts.forEach(concept => {
        const keywords = [
          concept.name,
          concept.definition,
          ...concept.practicalGuidance
        ].join(' ').toLowerCase().split(' ');
        
        keywords.forEach(word => {
          if (word.length > 3) {
            if (!index[word]) index[word] = [];
            index[word].push({
              type: 'concept',
              id: concept.conceptId,
              relevance: 0.9
            });
          }
        });
      });
      
      localStorage.setItem(this.KNOWLEDGE_KEYS.KNOWLEDGE_INDEX, JSON.stringify(index));
    }
  
    // Get personalized guidance based on user's current state
    static getPersonalizedGuidance(
      userStage: number,
      userChallenges: string[],
      userMood: number,
      practiceHours: number,
      specificQuestion?: string
    ): {
      guidance: string;
      bookReferences: string[];
      practicalSteps: string[];
      encouragingQuote: string;
      nextMilestone: string;
    } | null {
      try {
        const bookContent: BookContent = JSON.parse(
          localStorage.getItem(this.KNOWLEDGE_KEYS.BOOK_CONTENT) || '{}'
        );
        
        if (!bookContent.chapters) return null;
        
        // Find relevant chapter for user's stage
        const currentChapter = bookContent.chapters.find(ch => ch.stage === userStage);
        const nextChapter = bookContent.chapters.find(ch => ch.stage === userStage + 1);
        
        if (!currentChapter) return null;
        
        // Find relevant PAHM concepts
        const relevantConcepts = bookContent.pahmConcepts.filter(concept =>
          concept.stageRelevance.includes(userStage)
        );
        
        // Find appropriate quote
        const quotes = bookContent.wisdomQuotes.filter(quote => {
          const level = practiceHours < 20 ? 'beginner' : 
                       practiceHours < 50 ? 'intermediate' : 'advanced';
          return quote.userLevel === level;
        });
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        // Generate personalized guidance
        let guidance = '';
        
        if (userMood < 5) {
          guidance = `I understand you're going through a challenging time. This is completely normal in Stage ${userStage} practice. `;
        } else {
          guidance = `You're making good progress in Stage ${userStage}. `;
        }
        
        // Add challenge-specific guidance
        if (userChallenges.includes('restlessness')) {
          guidance += `The restlessness you're experiencing is the mind's resistance to stillness. This is actually a sign that the practice is working. `;
        }
        
        if (userChallenges.includes('doubt')) {
          guidance += `Doubt is one of the most common challenges at this stage. Remember: your own experience is the best teacher. `;
        }
        
        // Add stage-specific wisdom
        guidance += `At this stage, focus on: ${currentChapter.keyPoints[0]}. `;
        
        return {
          guidance,
          bookReferences: [
            `Chapter ${currentChapter.chapterNumber}: ${currentChapter.title}`,
            ...(nextChapter ? [`Next: Chapter ${nextChapter.chapterNumber}: ${nextChapter.title}`] : [])
          ],
          practicalSteps: currentChapter.practiceInstructions.slice(0, 3),
          encouragingQuote: randomQuote?.text || 'Trust the process and your own experience.',
          nextMilestone: nextChapter?.title || 'Continue deepening your current practice'
        };
        
      } catch (error) {
        console.error('Error getting personalized guidance:', error);
        return null;
      }
    }
  
    // Enhanced PAHM Guru responses
    static getEnhancedPAHMResponse(
      userQuery: string,
      userContext: {
        currentStage: number;
        recentChallenges: string[];
        moodLevel: number;
        practiceHours: number;
      }
    ): {
      response: string;
      confidence: number;
      bookWisdom: string[];
      practicalGuidance: string[];
      followUpQuestions: string[];
    } {
      try {
        const bookContent: BookContent = JSON.parse(
          localStorage.getItem(this.KNOWLEDGE_KEYS.BOOK_CONTENT) || '{}'
        );
        
        // Simple keyword matching (you can enhance this later)
        const queryLower = userQuery.toLowerCase();
        let response = '';
        let confidence = 0.5;
        const bookWisdom: string[] = [];
        const practicalGuidance: string[] = [];
        
        // Check for PAHM-specific questions
        if (queryLower.includes('matrix') || queryLower.includes('pahm')) {
          const pahmConcept = bookContent.pahmConcepts.find(c => c.name.includes('Present + Neutral'));
          if (pahmConcept) {
            response = `The PAHM Matrix is your tool for understanding where attention goes. ${pahmConcept.definition}`;
            practicalGuidance.push(...pahmConcept.practicalGuidance);
            confidence = 0.9;
          }
        }
        
        // Check for stage-specific questions
        if (queryLower.includes('stage') || queryLower.includes('practice')) {
          const currentChapter = bookContent.chapters.find(ch => ch.stage === userContext.currentStage);
          if (currentChapter) {
            response += ` At Stage ${userContext.currentStage}, focus on: ${currentChapter.keyPoints[0]}`;
            practicalGuidance.push(...currentChapter.practiceInstructions);
            confidence = 0.85;
          }
        }
        
        // Check for poison-related questions
        if (queryLower.includes('poison') || queryLower.includes('thought')) {
          const poisonConcept = bookContent.pahmConcepts.find(c => c.name.includes('Poisonous'));
          if (poisonConcept) {
            response += ` Remember: ${poisonConcept.definition}`;
            bookWisdom.push(...poisonConcept.practicalGuidance);
            confidence = 0.9;
          }
        }
        
        // Default response if no specific match
        if (!response) {
          response = `I understand your question about "${userQuery}". Based on your current stage (${userContext.currentStage}), let me guide you...`;
          const personalizedGuidance = this.getPersonalizedGuidance(
            userContext.currentStage,
            userContext.recentChallenges,
            userContext.moodLevel,
            userContext.practiceHours
          );
          
          if (personalizedGuidance) {
            response = personalizedGuidance.guidance;
            practicalGuidance.push(...personalizedGuidance.practicalSteps);
            bookWisdom.push(personalizedGuidance.encouragingQuote);
            confidence = 0.7;
          }
        }
        
        return {
          response,
          confidence,
          bookWisdom,
          practicalGuidance,
          followUpQuestions: [
            'Would you like me to explain this concept in more detail?',
            'How has your practice been going with this?',
            'What specific challenges are you facing?'
          ]
        };
        
      } catch (error) {
        console.error('Error generating enhanced PAHM response:', error);
        return {
          response: 'I apologize, but I encountered an error. Please try asking your question again.',
          confidence: 0,
          bookWisdom: [],
          practicalGuidance: [],
          followUpQuestions: []
        };
      }
    }
  
    // Save user interactions with the knowledge system
    static saveKnowledgeInteraction(
      questionId: string,
      question: string,
      response: string,
      userStage: number,
      wasHelpful: boolean
    ): boolean {
      try {
        const interactions = JSON.parse(
          localStorage.getItem('knowledge_interactions') || '[]'
        );
        
        interactions.push({
          questionId,
          timestamp: new Date().toISOString(),
          question,
          userStage,
          aiResponse: response,
          wasHelpful,
          followUpQuestions: []
        });
  
        localStorage.setItem('knowledge_interactions', JSON.stringify(interactions));
        return true;
      } catch (error) {
        console.error('Error saving knowledge interaction:', error);
        return false;
      }
    }
  }