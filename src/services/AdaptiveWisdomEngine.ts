// src/services/AdaptiveWisdomEngine.ts

// 🏗️ COMPREHENSIVE DATA TYPES
interface BookContent {
  bookId: string;
  title: string;
  author: string;
  version: string;
  chapters: {
    chapterId: string;
    chapterNumber: number;
    title: string;
    stage: number;
    content: string;
    practicalExercises: string[];
    keyInsights: string[];
    personalReflections: string[];
  }[];
  wisdomIndex: {
    keywords: string[];
    concepts: string[];
    practicalApplications: string[];
  };
}

export interface ComprehensiveUserContext {
  // Basic Info
  uid: string;
  currentStage: number;
  goals: string[];
  
  // Questionnaire Data
  questionnaireAnswers?: {
    mindfulnessExperience: string;
    sleepQuality: number;
    stressLevel: number;
    physicalActivity: string;
    goals: string[];
    motivations: string[];
    challenges: string[];
    practiceBackground: string;
    lifeStressors: string[];
    spiritualBackground: string;
    timeAvailable: string;
    learningStyle: string;
  };
  
  // Self-Assessment
  selfAssessmentResults?: {
    sixSenses: {
      sight: number;
      sound: number;
      smell: number;
      taste: number;
      touch: number;
      mind: number;
    };
    averageAttachment: number;
    stressLevel: number;
    anxietyLevel: number;
    moodBaseline: number;
    concentrationAbility: number;
  };
  
  // Enhanced Profile
  enhancedProfile?: {
    currentProgress: {
      totalSessions: number;
      currentStreak: number;
      averageQuality: number;
      averagePresentPercentage: number;
    };
    preferences: {
      optimalPracticeTime: string;
      defaultSessionDuration: number;
      favoriteStages: number[];
      notificationSettings: boolean;
    };
  };
  
  // Practice Analytics
  practiceAnalytics?: {
    pahmData: {
      totalObservations: number;
      presentPercentage: number;
      pastPercentage: number;
      futurePercentage: number;
      attachmentPercentage: number;
      neutralPercentage: number;
      aversionPercentage: number;
      presentNeutralMastery: number;
    };
    environmentData: {
      avgRating: number;
      posture: string;
      location: string;
      lighting: string;
      sounds: string;
    };
    mindRecoveryAnalytics: {
      totalSessions: number;
      avgRating: number;
      contextStats: any;
      integrationLevel: string;
    };
    emotionalNotes: Array<{
      date: string;
      emotion: string;
      energyLevel: number;
      neutralityPercentage: number;
    }>;
  };
  
  // Real-time Context
  recentChallenges?: string[];
  currentMood?: number;
  timeOfDay?: string;
  recentSessions?: any[];
}

interface ComprehensiveWisdomResponse {
  response: string;
  confidence: number;
  personalizationScore: number;
  practicalActions: string[];
  bookReferences: {
    chapter: string;
    section: string;
    page?: number;
  }[];
  followUpQuestions: string[];
  ancientWisdom: string;
  adaptiveGuidance: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  styleHints: {
    tone: string;
    approach: string;
    urgency: string;
  };
}

interface QueryAnalysis {
  originalQuery: string;
  normalizedQuery: string;
  intentType: string;
  emotionalTone: string;
  urgencyLevel: string;
  practiceContext: string;
  keyTerms: string[];
  implicitNeeds: string[];
  personalizedKeywords: string[];
}

export class AdaptiveWisdomEngine {
  private static isInitialized = false;
  private static bookContent: BookContent | null = null;
  private static wisdomDatabase: any = {};
  private static userInteractionHistory: any[] = [];

  // 🚀 INITIALIZATION
  static async initializeAdaptiveKnowledge(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadBookContent();
      await this.buildAdaptiveIndex();
      this.isInitialized = true;
      console.log('✅ Adaptive Wisdom Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Adaptive Wisdom Engine:', error);
    }
  }

  private static async loadBookContent(): Promise<void> {
    // Try to load from localStorage first
    const cached = localStorage.getItem('mindfulness_book_content');
    if (cached) {
      this.bookContent = JSON.parse(cached);
      return;
    }

    // Default book content structure
    this.bookContent = {
      bookId: 'adaptive_mindfulness_guide',
      title: 'The Adaptive Mindfulness Guide',
      author: 'Ancient Wisdom Institute',
      version: '1.0.0',
      chapters: [
        {
          chapterId: 'ch1',
          chapterNumber: 1,
          title: 'Understanding Attention Patterns',
          stage: 1,
          content: 'The mind naturally wanders through three temporal dimensions: past experiences, present awareness, and future projections. This wandering is not a problem to solve but a pattern to understand.',
          practicalExercises: [
            'Notice when your mind moves to past memories',
            'Observe future planning thoughts without judgment',
            'Practice returning to present-moment awareness'
          ],
          keyInsights: [
            'Present-moment awareness is your natural state',
            'Mental wandering is normal human functioning',
            'Awareness of wandering is already mindfulness'
          ],
          personalReflections: [
            'What time period does your mind visit most often?',
            'How does it feel to notice these patterns?'
          ]
        },
        {
          chapterId: 'ch7',
          chapterNumber: 7,
          title: 'The PAHM Matrix Framework',
          stage: 2,
          content: 'The Present-Attention-Helper-Matrix (PAHM) reveals nine possible mental positions. When we observe our thoughts, we can categorize them as relating to Past, Present, or Future, combined with emotional qualities of Attachment, Neutral observation, or Aversion.',
          practicalExercises: [
            'Identify Present + Neutral mental positions during meditation',
            'Notice Attachment patterns in daily activities',
            'Practice observing Aversion without resistance'
          ],
          keyInsights: [
            'Only Present + Neutral positions involve direct reality contact',
            'Attachment and Aversion are mental constructions',
            'Awareness of any position is valuable practice'
          ],
          personalReflections: [
            'Which PAHM positions do you recognize most easily?',
            'How does categorizing thoughts affect your relationship with them?'
          ]
        },
        {
          chapterId: 'ch15',
          chapterNumber: 15,
          title: 'Advanced Practice - Recognizing Mental Patterns',
          stage: 3,
          content: 'Advanced practitioners learn to recognize subtle mental formations. What ancient psychology calls "mental constructions" appear as layers of interpretation over direct experience. The goal is not to eliminate these patterns but to see them clearly.',
          practicalExercises: [
            'Observe the difference between direct sensation and mental commentary',
            'Practice maintaining awareness during emotional reactions',
            'Notice how mental constructions affect perception'
          ],
          keyInsights: [
            'Mental constructions are not problems to solve',
            'Clear seeing naturally reduces unnecessary suffering',
            'Advanced practice involves subtler discriminations'
          ],
          personalReflections: [
            'How has your understanding of mental patterns evolved?',
            'What insights arise from sustained practice?'
          ]
        }
      ],
      wisdomIndex: {
        keywords: ['attention', 'awareness', 'present', 'mindfulness', 'meditation', 'thoughts', 'emotions'],
        concepts: ['PAHM Matrix', 'Present + Neutral', 'mental constructions', 'temporal awareness'],
        practicalApplications: ['daily mindfulness', 'emotional regulation', 'stress reduction', 'mental clarity']
      }
    };

    // Cache the content
    localStorage.setItem('mindfulness_book_content', JSON.stringify(this.bookContent));
  }

  private static async buildAdaptiveIndex(): Promise<void> {
    if (!this.bookContent) return;

    this.wisdomDatabase = {
      stageGuidance: {
        1: {
          focus: 'Basic attention training',
          challenges: ['mind wandering', 'restlessness', 'doubt'],
          techniques: ['return to breath', 'noting practice', 'gentle persistence'],
          wisdom: 'Every moment of noticing is a moment of awakening'
        },
        2: {
          focus: 'PAHM Matrix understanding',
          challenges: ['categorizing thoughts', 'emotional reactivity', 'consistency'],
          techniques: ['PAHM observation', 'neutral positioning', 'pattern recognition'],
          wisdom: 'Present + Neutral is the only non-constructed mental position'
        },
        3: {
          focus: 'Advanced pattern recognition',
          challenges: ['subtle mental formations', 'spiritual materialism', 'integration'],
          techniques: ['subtle awareness', 'choiceless observation', 'daily life practice'],
          wisdom: 'Understanding and suffering cannot coexist in the same moment'
        }
      },
      wisdomQuotes: [
        'You are not your thoughts - you are the awareness in which thoughts arise',
        'Present + Neutral awareness contacts reality directly',
        'Every recognition is a return to your natural state',
        'Mental constructions are like clouds - temporary and insubstantial',
        'The observer and the observed are one seamless awareness'
      ],
      practicalPatterns: {
        anxiety: {
          pahmCategory: 'Future + Aversion',
          technique: 'Present + Neutral refuge',
          guidance: 'Anxiety creates future scenarios with aversion. Return to Present + Neutral awareness.'
        },
        depression: {
          pahmCategory: 'Past + Aversion',
          technique: 'Gentle present-moment return',
          guidance: 'Depression often involves past experiences with aversion. Present-moment awareness offers relief.'
        },
        restlessness: {
          pahmCategory: 'Future + Attachment',
          technique: 'Noting and settling',
          guidance: 'Restlessness seeks future satisfaction. Note this pattern and settle into present awareness.'
        }
      }
    };
  }

  // 🎯 MAIN RESPONSE GENERATION
  static async getAdaptiveResponse(
    userQuery: string,
    userContext: ComprehensiveUserContext
  ): Promise<ComprehensiveWisdomResponse> {
    if (!this.isInitialized) {
      await this.initializeAdaptiveKnowledge();
    }

    try {
      // Comprehensive analysis
      const queryAnalysis = this.analyzeQueryWithContext(userQuery, userContext);
      const personalizedMatches = this.findPersonalizedMatches(queryAnalysis, this.bookContent!, userContext);
      
      // Generate adaptive response
      const baseResponse = this.generateContextualResponse(queryAnalysis, personalizedMatches, userContext);
      const personalizationEnhancements = this.generatePersonalizationEnhancements(userContext, queryAnalysis);
      
      // Compile comprehensive response
      const comprehensiveResponse: ComprehensiveWisdomResponse = {
        response: this.combineResponseElements(baseResponse, personalizationEnhancements, userContext),
        confidence: this.calculateConfidence(queryAnalysis, personalizedMatches, userContext),
        personalizationScore: this.calculatePersonalizationScore(userContext),
        practicalActions: this.generatePracticalActions(userContext, queryAnalysis),
        bookReferences: this.generateBookReferences(personalizedMatches),
        followUpQuestions: this.generateEnhancedFollowUpQuestions(userContext, queryAnalysis),
        ancientWisdom: this.selectContextualWisdom(queryAnalysis, userContext),
        adaptiveGuidance: this.generateAdaptiveGuidance(userContext, queryAnalysis),
        styleHints: {
          tone: this.determineResponseStyle(userContext, queryAnalysis),
          approach: queryAnalysis.practiceContext,
          urgency: queryAnalysis.urgencyLevel
        }
      };

      // Save interaction for learning
      this.saveInteraction(userQuery, comprehensiveResponse, userContext);
      
      return comprehensiveResponse;

    } catch (error) {
      console.error('Error generating adaptive response:', error);
      return this.getAdaptiveFallback(userQuery, userContext);
    }
  }

  // 🧠 QUERY ANALYSIS
  private static analyzeQueryWithContext(userQuery: string, userContext: ComprehensiveUserContext): QueryAnalysis {
    const normalizedQuery = userQuery.toLowerCase().trim();
    
    return {
      originalQuery: userQuery,
      normalizedQuery,
      intentType: this.detectIntent(normalizedQuery),
      emotionalTone: this.detectEmotionalTone(normalizedQuery),
      urgencyLevel: this.detectUrgency(normalizedQuery),
      practiceContext: this.detectPracticeContext(normalizedQuery, userContext),
      keyTerms: this.extractKeyTerms(normalizedQuery),
      implicitNeeds: this.identifyImplicitNeeds(normalizedQuery, userContext),
      personalizedKeywords: this.generatePersonalizedKeywords(normalizedQuery, userContext)
    };
  }

  private static detectIntent(query: string): string {
    const intentPatterns = {
      guidance: ['how to', 'help me', 'what should', 'how can', 'guide me'],
      understanding: ['what is', 'explain', 'understand', 'mean', 'definition'],
      troubleshooting: ['problem', 'issue', 'trouble', 'difficult', 'struggling', 'stuck'],
      progress: ['progress', 'improvement', 'better', 'advancing', 'developing'],
      technique: ['technique', 'method', 'practice', 'exercise', 'approach']
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => query.includes(pattern))) {
        return intent;
      }
    }
    return 'general';
  }

  private static detectEmotionalTone(query: string): string {
    const emotionalPatterns = {
      frustrated: ['frustrated', 'annoyed', 'angry', 'mad', 'irritated'],
      anxious: ['anxious', 'worried', 'nervous', 'stressed', 'panic'],
      sad: ['sad', 'depressed', 'down', 'low', 'blue'],
      curious: ['curious', 'interested', 'wonder', 'explore'],
      hopeful: ['hope', 'optimistic', 'positive', 'encouraged']
    };

    for (const [emotion, patterns] of Object.entries(emotionalPatterns)) {
      if (patterns.some(pattern => query.includes(pattern))) {
        return emotion;
      }
    }
    return 'neutral';
  }

  private static detectUrgency(query: string): string {
    const urgentPatterns = ['urgent', 'immediate', 'emergency', 'crisis', 'help', 'asap'];
    const highPatterns = ['really need', 'important', 'serious', 'major'];
    
    if (urgentPatterns.some(pattern => query.includes(pattern))) return 'urgent';
    if (highPatterns.some(pattern => query.includes(pattern))) return 'high';
    return 'normal';
  }

  private static detectPracticeContext(query: string, userContext: ComprehensiveUserContext): string {
    const contextPatterns = {
      meditation: ['meditation', 'sitting', 'cushion', 'breath'],
      daily_life: ['work', 'daily', 'life', 'routine', 'relationship'],
      emotional: ['emotion', 'feeling', 'mood', 'heart', 'pain'],
      mental: ['thoughts', 'thinking', 'mind', 'mental', 'cognitive']
    };

    for (const [context, patterns] of Object.entries(contextPatterns)) {
      if (patterns.some(pattern => query.includes(pattern))) {
        return context;
      }
    }
    return 'general';
  }

  private static extractKeyTerms(query: string): string[] {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for'];
    return query.split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  private static identifyImplicitNeeds(query: string, userContext: ComprehensiveUserContext): string[] {
    const needs: string[] = [];
    
    // Based on stage
    if (userContext.currentStage <= 1) {
      needs.push('basic_instruction', 'encouragement', 'simplicity');
    } else if (userContext.currentStage >= 3) {
      needs.push('advanced_concepts', 'integration_guidance', 'subtle_understanding');
    }
    
    // Based on recent challenges
    if (userContext.recentChallenges?.includes('restlessness')) {
      needs.push('calming_guidance', 'patience_cultivation');
    }
    
    return needs;
  }

  private static generatePersonalizedKeywords(query: string, userContext: ComprehensiveUserContext): string[] {
    const keywords: string[] = [];
    
    // Add stage-specific keywords
    const stageKeywords = this.wisdomDatabase.stageGuidance[userContext.currentStage]?.techniques || [];
    keywords.push(...stageKeywords);
    
    // Add goal-specific keywords
    if (userContext.goals) {
      keywords.push(...userContext.goals);
    }
    
    return keywords;
  }

  // 📚 CONTENT MATCHING
  private static findPersonalizedMatches(queryAnalysis: QueryAnalysis, bookContent: BookContent, userContext: ComprehensiveUserContext): any {
    const matches = {
      directMatches: [] as Array<{ chapter: any; score: number }>,
      stageRelevant: [] as Array<{ chapter: any; score: number }>,
      conceptualMatches: [] as Array<{ chapter: any; score: number }>,
      practicalRelevant: [] as Array<{ chapter: any; score: number }>
    };

    // Find relevant chapters based on stage and content
    for (const chapter of bookContent.chapters) {
      const relevanceScore = this.calculateChapterRelevance(chapter, queryAnalysis, userContext);
      
      if (relevanceScore > 0.7) {
        matches.directMatches.push({ chapter, score: relevanceScore });
      } else if (chapter.stage === userContext.currentStage) {
        matches.stageRelevant.push({ chapter, score: relevanceScore });
      }
    }

    return matches;
  }

  private static calculateChapterRelevance(chapter: any, queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): number {
    let score = 0;
    
    // Check title relevance
    const titleWords = chapter.title.toLowerCase().split(' ');
    const queryWords = queryAnalysis.normalizedQuery.split(' ');
    const titleMatches = titleWords.filter((word: string) => queryWords.includes(word)).length;
    score += titleMatches * 0.3;
    
    // Check content relevance
    const contentWords = chapter.content.toLowerCase().split(' ');
    const contentMatches = queryWords.filter((word: string) => contentWords.includes(word)).length;
    score += contentMatches * 0.2;
    
    // Stage alignment bonus
    if (chapter.stage === userContext.currentStage) {
      score += 0.5;
    }
    
    return Math.min(score, 1.0);
  }

  // 💬 RESPONSE GENERATION
  private static generateContextualResponse(queryAnalysis: QueryAnalysis, matches: any, userContext: ComprehensiveUserContext): string {
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    let response = '';

    // Opening acknowledgment
    response += this.generatePersonalizedOpening(queryAnalysis, userContext);

    // Core guidance based on matches
    if (matches.directMatches.length > 0) {
      const bestMatch = matches.directMatches[0];
      response += ` ${bestMatch.chapter.keyInsights[0]} `;
    } else if (stageGuidance) {
      response += ` Based on your current practice level, ${stageGuidance.focus.toLowerCase()} is your foundation. `;
    }

    // Practical guidance
    response += this.generatePracticalGuidance(queryAnalysis, userContext);

    return response.trim();
  }

  private static generatePersonalizedOpening(queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): string {
    const practiceData = userContext.practiceAnalytics?.pahmData;
    const sessionCount = userContext.enhancedProfile?.currentProgress?.totalSessions || 0;
    
    if (practiceData && practiceData.presentNeutralMastery > 70) {
      return `With your exceptional ${practiceData.presentNeutralMastery}% Present + Neutral mastery from ${practiceData.totalObservations} observations, you're demonstrating advanced understanding.`;
    } else if (sessionCount > 50) {
      return `Your ${sessionCount} practice sessions show dedicated commitment to this path.`;
    } else {
      return `I understand you're exploring this aspect of practice.`;
    }
  }

  private static generatePracticalGuidance(queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): string {
    const practicalPattern = this.wisdomDatabase.practicalPatterns[queryAnalysis.emotionalTone];
    
    if (practicalPattern) {
      return `This appears to involve ${practicalPattern.pahmCategory} mental positions. ${practicalPattern.guidance}`;
    }
    
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    if (stageGuidance && stageGuidance.techniques.length > 0) {
      return `Try working with ${stageGuidance.techniques[0]} as your foundation practice.`;
    }
    
    return 'Remember that awareness itself is the path - every moment of recognition is valuable.';
  }

  private static generatePersonalizationEnhancements(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): any {
    return {
      environmentalContext: this.getEnvironmentalContext(userContext),
      progressContext: this.getProgressContext(userContext),
      goalAlignment: this.getGoalAlignment(userContext, queryAnalysis),
      stageSpecificGuidance: this.getStageSpecificGuidance(userContext)
    };
  }

  private static getEnvironmentalContext(userContext: ComprehensiveUserContext): string {
    const envData = userContext.practiceAnalytics?.environmentData;
    if (!envData) return '';
    
    return `Your optimized ${envData.posture} posture in the ${envData.location} with ${envData.lighting} lighting supports deeper practice.`;
  }

  private static getProgressContext(userContext: ComprehensiveUserContext): string {
    const progress = userContext.enhancedProfile?.currentProgress;
    if (!progress) return '';
    
    const streak = progress.currentStreak;
    const quality = progress.averageQuality;
    
    return `Your ${streak}-day practice streak with ${quality}% session quality demonstrates authentic commitment.`;
  }

  private static getGoalAlignment(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string {
    if (!userContext.goals || userContext.goals.length === 0) return '';
    
    const primaryGoal = userContext.goals[0];
    return `This aligns with your goal of ${primaryGoal}.`;
  }

  private static getStageSpecificGuidance(userContext: ComprehensiveUserContext): string {
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    if (!stageGuidance) return '';
    
    return `At Stage ${userContext.currentStage}, focus on ${stageGuidance.focus.toLowerCase()}.`;
  }

  private static combineResponseElements(baseResponse: string, enhancements: any, userContext: ComprehensiveUserContext): string {
    let combined = baseResponse;
    
    // Add environmental context if available
    if (enhancements.environmentalContext) {
      combined += ` ${enhancements.environmentalContext}`;
    }
    
    // Add progress context if available
    if (enhancements.progressContext) {
      combined += ` ${enhancements.progressContext}`;
    }
    
    // Add goal alignment if available
    if (enhancements.goalAlignment) {
      combined += ` ${enhancements.goalAlignment}`;
    }
    
    return combined.trim();
  }

  // 📊 SCORING AND METRICS
  private static calculateConfidence(queryAnalysis: QueryAnalysis, matches: any, userContext: ComprehensiveUserContext): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on matches
    if (matches.directMatches.length > 0) {
      confidence += 0.3;
    }
    
    // Boost confidence based on user data richness
    if (userContext.practiceAnalytics?.pahmData && 
        userContext.practiceAnalytics.pahmData.totalObservations && 
        userContext.practiceAnalytics.pahmData.totalObservations > 100) {
      confidence += 0.2;
    }
    
    // Boost confidence based on stage alignment
    if (matches.stageRelevant.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.95);
  }

  private static calculatePersonalizationScore(userContext: ComprehensiveUserContext): number {
    let score = 0;
    
    // Data richness scoring
    if (userContext.questionnaireAnswers) score += 20;
    if (userContext.selfAssessmentResults) score += 20;
    if (userContext.enhancedProfile) score += 20;
    if (userContext.practiceAnalytics?.pahmData) score += 25;
    if (userContext.practiceAnalytics?.environmentData) score += 15;
    
    return Math.min(score, 100);
  }

  // 🎯 PRACTICAL ACTIONS
  private static generatePracticalActions(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string[] {
    const actions: string[] = [];
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    
    // Stage-specific actions
    if (stageGuidance) {
      actions.push(`Practice ${stageGuidance.techniques[0]} for 5-10 minutes daily`);
    }
    
    // Goal-specific actions
    if (userContext.goals && userContext.goals.includes('stress_reduction')) {
      actions.push('Use Present + Neutral awareness when stress arises');
    }
    
    // Environmental optimization
    const envData = userContext.practiceAnalytics?.environmentData;
    if (envData && envData.avgRating < 8) {
      actions.push('Optimize your practice environment for better consistency');
    }
    
    // Default fallback actions
    if (actions.length === 0) {
      actions.push('Notice when awareness recognizes mental patterns');
      actions.push('Practice returning to present-moment attention');
    }
    
    return actions;
  }

  // 📚 BOOK REFERENCES
  private static generateBookReferences(matches: any): Array<{ chapter: string; section: string; page?: number }> {
    const references: Array<{ chapter: string; section: string; page?: number }> = [];
    
    if (matches.directMatches && matches.directMatches.length > 0) {
      const match = matches.directMatches[0];
      references.push({
        chapter: match.chapter.title,
        section: 'Core Concepts',
        page: match.chapter.chapterNumber
      });
    }
    
    if (matches.stageRelevant && matches.stageRelevant.length > 0) {
      const match = matches.stageRelevant[0];
      references.push({
        chapter: match.chapter.title,
        section: 'Practical Exercises',
        page: match.chapter.chapterNumber
      });
    }
    
    return references;
  }

  // 🔮 WISDOM SELECTION
  private static selectContextualWisdom(queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): string {
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    
    if (stageGuidance && stageGuidance.wisdom) {
      return stageGuidance.wisdom;
    }
    
    // Fallback to general wisdom
    const wisdomQuotes = this.wisdomDatabase.wisdomQuotes;
    return wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
  }

  // 🎪 ADAPTIVE GUIDANCE
  private static generateAdaptiveGuidance(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    return {
      immediate: [
        'Take three conscious breaths',
        'Notice this moment of awareness'
      ],
      shortTerm: [
        'Practice Present + Neutral observation daily',
        'Integrate awareness into routine activities'
      ],
      longTerm: [
        'Develop consistent daily practice',
        'Explore advanced pattern recognition'
      ]
    };
  }

  // 🎨 STYLE DETERMINATION
  private static determineResponseStyle(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string {
    if (queryAnalysis.urgencyLevel === 'high') return 'compassionate';
    if (queryAnalysis.emotionalTone === 'frustrated') return 'calming';
    if (userContext.currentStage >= 3) return 'advanced';
    return 'wise';
  }

  // ❓ FOLLOW-UP QUESTIONS
  private static generateEnhancedFollowUpQuestions(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string[] {
    const questions = [
      'How does this understanding feel for you?',
      'What specific aspect would you like to explore further?',
      'Have you noticed this pattern in your daily experience?'
    ];
    
    // Add stage-specific questions
    if (userContext.currentStage >= 2) {
      questions.push('How does this relate to the PAHM Matrix framework?');
    }
    
    return questions;
  }

  // 🆘 FALLBACK RESPONSE
  private static getAdaptiveFallback(userQuery: string, userContext: ComprehensiveUserContext): ComprehensiveWisdomResponse {
    return {
      response: `I understand you're asking about "${userQuery}". Based on your Stage ${userContext.currentStage} practice, remember that you are not your thoughts - you are the awareness in which thoughts arise. Every moment of recognition is a moment of awakening.`,
      confidence: 0.6,
      personalizationScore: 30,
      practicalActions: [
        'Return to present-moment awareness',
        'Notice the awareness that recognizes thoughts'
      ],
      bookReferences: [
        { chapter: 'Understanding Attention Patterns', section: 'Basic Principles' }
      ],
      followUpQuestions: [
        'What would be most helpful to explore right now?'
      ],
      ancientWisdom: 'Every moment of awareness is a return to your true nature',
      adaptiveGuidance: {
        immediate: ['Take a conscious breath'],
        shortTerm: ['Practice daily awareness'],
        longTerm: ['Develop consistent mindfulness']
      },
      styleHints: {
        tone: 'supportive',
        approach: 'gentle',
        urgency: 'normal'
      }
    };
  }

  // 💾 INTERACTION HISTORY
  private static saveInteraction(query: string, response: ComprehensiveWisdomResponse, userContext: ComprehensiveUserContext): void {
    const interaction = {
      timestamp: new Date().toISOString(),
      userId: userContext.uid,
      query,
      confidence: response.confidence,
      personalizationScore: response.personalizationScore,
      stage: userContext.currentStage
    };
    
    this.userInteractionHistory.push(interaction);
    
    // Keep only last 100 interactions in memory
    if (this.userInteractionHistory.length > 100) {
      this.userInteractionHistory = this.userInteractionHistory.slice(-100);
    }
    
    // Save to localStorage
    localStorage.setItem('mindfulness_interactions', JSON.stringify(this.userInteractionHistory));
  }

  // 🛠️ UTILITY METHODS
  static getInteractionHistory(): any[] {
    return this.userInteractionHistory;
  }

  static clearInteractionHistory(): void {
    this.userInteractionHistory = [];
    localStorage.removeItem('mindfulness_interactions');
  }

  static isReady(): boolean {
    return this.isInitialized && this.bookContent !== null;
  }

  // 🔄 BACKWARD COMPATIBILITY METHODS
  static initializeBookContent(): boolean {
    try {
      this.initializeAdaptiveKnowledge();
      return true;
    } catch (error) {
      console.error('Failed to initialize book content:', error);
      return false;
    }
  }

  static getEnhancedPAHMResponse(
    userMessage: string,
    context: {
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
  } {
    // For backward compatibility, provide a synchronous response
    // using the existing wisdom database
    
    const stageGuidance = this.wisdomDatabase.stageGuidance?.[context.currentStage];
    const wisdomQuotes = this.wisdomDatabase.wisdomQuotes || [];
    
    // Simple pattern matching for common queries
    const normalizedQuery = userMessage.toLowerCase();
    let response = '';
    let confidence = 0.7;
    let practicalGuidance: string[] = [];
    
    // Handle common patterns
    if (normalizedQuery.includes('pahm') || normalizedQuery.includes('matrix')) {
      response = 'The PAHM Matrix helps you categorize thoughts as Past/Present/Future combined with Attachment/Neutral/Aversion. Present + Neutral positions involve direct reality contact, while other combinations involve mental constructions.';
      practicalGuidance = [
        'Practice identifying Present + Neutral mental positions',
        'Notice when thoughts involve past memories or future planning',
        'Observe attachment and aversion patterns without judgment'
      ];
      confidence = 0.9;
    } else if (normalizedQuery.includes('stress') || normalizedQuery.includes('anxiety')) {
      response = 'Stress and anxiety often involve Future + Aversion mental positions. Use Present + Neutral awareness as refuge when these patterns arise. Remember, you are not your thoughts - you are the awareness in which thoughts appear.';
      practicalGuidance = [
        'Return to present-moment breath awareness',
        'Notice anxiety as Future + Aversion mental position',
        'Practice Present + Neutral observation'
      ];
      confidence = 0.8;
    } else if (normalizedQuery.includes('meditation') || normalizedQuery.includes('practice')) {
      if (stageGuidance) {
        response = `At Stage ${context.currentStage}, focus on ${stageGuidance.focus.toLowerCase()}. ${stageGuidance.wisdom}`;
        practicalGuidance = stageGuidance.techniques.map((tech: string) => `Practice ${tech}`);
        confidence = 0.85;
      } else {
        response = 'Consistent daily practice is key. Start with observing your natural breathing rhythm and notice when awareness recognizes the wandering mind.';
        practicalGuidance = [
          'Sit comfortably with eyes gently closed',
          'Follow the natural rhythm of your breath',
          'When mind wanders, gently return attention to breath'
        ];
        confidence = 0.7;
      }
    } else if (context.recentChallenges.includes('restlessness')) {
      response = 'Restlessness often involves Future + Attachment mental positions - the mind seeking future satisfaction. Note this pattern gently and return to Present + Neutral awareness.';
      practicalGuidance = [
        'Acknowledge restlessness without fighting it',
        'Return attention to present-moment sensations',
        'Practice shorter sessions if needed'
      ];
      confidence = 0.8;
    } else {
      // General guidance based on stage
      if (stageGuidance) {
        response = `Based on your Stage ${context.currentStage} practice, ${stageGuidance.wisdom} Focus on ${stageGuidance.focus.toLowerCase()}.`;
        practicalGuidance = stageGuidance.techniques.slice(0, 3) || [];
        confidence = 0.7;
      } else {
        response = 'Every moment of awareness is valuable. Remember that you are not your thoughts - you are the awareness in which thoughts arise and pass away.';
        practicalGuidance = [
          'Notice this moment of awareness',
          'Observe thoughts without getting caught in them',
          'Return to present-moment attention'
        ];
        confidence = 0.6;
      }
    }
    
    // Select appropriate wisdom
    const bookWisdom = stageGuidance?.wisdom || 
      wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)] || 
      'Every moment of recognition is a moment of awakening';

    return {
      response,
      confidence,
      bookWisdom: [bookWisdom],
      practicalGuidance
    };
  }

  static saveKnowledgeInteraction(
    interactionId: string,
    userQuery: string,
    aiResponse: string,
    userStage: number,
    wasHelpful: boolean
  ): void {
    const interaction = {
      timestamp: new Date().toISOString(),
      interactionId,
      userQuery,
      aiResponse,
      userStage,
      wasHelpful,
      confidence: 0.8 // Default confidence for legacy interactions
    };
    
    this.userInteractionHistory.push(interaction);
    
    // Keep only last 100 interactions in memory
    if (this.userInteractionHistory.length > 100) {
      this.userInteractionHistory = this.userInteractionHistory.slice(-100);
    }
    
    // Save to localStorage
    localStorage.setItem('mindfulness_interactions', JSON.stringify(this.userInteractionHistory));
  }
}

// Initialize the adaptive system
AdaptiveWisdomEngine.initializeAdaptiveKnowledge();

// Backward compatibility export
export const EnhancedLocalStorageManager = AdaptiveWisdomEngine;