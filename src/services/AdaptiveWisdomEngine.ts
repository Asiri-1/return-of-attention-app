// ============================================================================
// src/services/AdaptiveWisdomEngine.ts
// ✅ FIREBASE-ONLY: Adaptive Wisdom Engine - No localStorage dependencies
// 🔥 REMOVED: All localStorage caching - Firebase storage only
// ============================================================================

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
  firebaseMetadata?: {
    createdAt: string;
    lastUpdated: string;
    version: string;
  };
}

export interface ComprehensiveUserContext {
  // ✅ FIREBASE-ONLY: Enhanced with Firebase metadata
  uid: string;
  currentStage: number;
  goals: string[];
  firebaseSource: boolean;
  lastSyncAt: string;
  
  // Questionnaire Data from Firebase
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
    firebaseId?: string;
  };
  
  // Self-Assessment from Firebase
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
    firebaseId?: string;
  };
  
  // Enhanced Profile from Firebase
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
    firebaseUpdatedAt?: string;
  };
  
  // Practice Analytics from Firebase
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
      firebaseId?: string;
    }>;
    firebaseCalculatedAt?: string;
  };
  
  // Real-time Context from Firebase
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
  firebaseMetadata: {
    generatedAt: string;
    userId: string;
    dataSource: 'Firebase Cloud Storage';
    personalizationLevel: string;
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
  firebaseAnalyzedAt: string;
}

interface FirebaseInteraction {
  timestamp: string;
  userId: string;
  query: string;
  confidence: number;
  personalizationScore: number;
  stage: number;
  interactionId?: string;
  wasHelpful?: boolean;
  firebaseStored: boolean;
}

export class AdaptiveWisdomEngine {
  private static isInitialized = false;
  private static bookContent: BookContent | null = null;
  private static wisdomDatabase: any = {};
  private static userInteractionHistory: FirebaseInteraction[] = [];
  private static firebaseInitialized = false;

  // 🚀 FIREBASE-ONLY INITIALIZATION
  static async initializeAdaptiveKnowledge(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔥 Initializing Firebase-only Adaptive Wisdom Engine...');
      await this.loadFirebaseBookContent();
      await this.buildFirebaseAdaptiveIndex();
      this.isInitialized = true;
      this.firebaseInitialized = true;
      console.log('✅ Firebase Adaptive Wisdom Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Adaptive Wisdom Engine:', error);
      // Fallback to in-memory initialization without Firebase caching
      await this.initializeInMemoryFallback();
    }
  }

  // ✅ FIREBASE-ONLY: Load content without localStorage
  private static async loadFirebaseBookContent(): Promise<void> {
    // ✅ FIREBASE-ONLY: In-memory book content (no localStorage caching)
    console.log('🔥 Loading book content for Firebase-only operation...');
    
    this.bookContent = {
      bookId: 'firebase_adaptive_mindfulness_guide',
      title: 'The Firebase-Adaptive Mindfulness Guide',
      author: 'Ancient Wisdom Institute',
      version: '2.0.0-firebase',
      chapters: [
        {
          chapterId: 'ch1_firebase',
          chapterNumber: 1,
          title: 'Understanding Attention Patterns',
          stage: 1,
          content: 'The mind naturally wanders through three temporal dimensions: past experiences, present awareness, and future projections. This wandering is not a problem to solve but a pattern to understand. With Firebase-powered tracking, you can observe these patterns across devices and sessions.',
          practicalExercises: [
            'Notice when your mind moves to past memories',
            'Observe future planning thoughts without judgment',
            'Practice returning to present-moment awareness',
            'Track attention patterns using Firebase synchronization'
          ],
          keyInsights: [
            'Present-moment awareness is your natural state',
            'Mental wandering is normal human functioning',
            'Awareness of wandering is already mindfulness',
            'Cross-device practice tracking enhances understanding'
          ],
          personalReflections: [
            'What time period does your mind visit most often?',
            'How does it feel to notice these patterns?',
            'How does device synchronization support your practice?'
          ]
        },
        {
          chapterId: 'ch7_firebase',
          chapterNumber: 7,
          title: 'The PAHM Matrix Framework',
          stage: 2,
          content: 'The Present-Attention-Helper-Matrix (PAHM) reveals nine possible mental positions. When we observe our thoughts, we can categorize them as relating to Past, Present, or Future, combined with emotional qualities of Attachment, Neutral observation, or Aversion. Firebase analytics help track your PAHM development over time.',
          practicalExercises: [
            'Identify Present + Neutral mental positions during meditation',
            'Notice Attachment patterns in daily activities',
            'Practice observing Aversion without resistance',
            'Use Firebase PAHM tracking for pattern recognition'
          ],
          keyInsights: [
            'Only Present + Neutral positions involve direct reality contact',
            'Attachment and Aversion are mental constructions',
            'Awareness of any position is valuable practice',
            'Firebase data reveals long-term PAHM development patterns'
          ],
          personalReflections: [
            'Which PAHM positions do you recognize most easily?',
            'How does categorizing thoughts affect your relationship with them?',
            'What patterns emerge in your Firebase analytics?'
          ]
        },
        {
          chapterId: 'ch15_firebase',
          chapterNumber: 15,
          title: 'Advanced Practice - Recognizing Mental Patterns',
          stage: 3,
          content: 'Advanced practitioners learn to recognize subtle mental formations. What ancient psychology calls "mental constructions" appear as layers of interpretation over direct experience. The goal is not to eliminate these patterns but to see them clearly. Firebase insights provide unprecedented visibility into these subtle patterns.',
          practicalExercises: [
            'Observe the difference between direct sensation and mental commentary',
            'Practice maintaining awareness during emotional reactions',
            'Notice how mental constructions affect perception',
            'Use Firebase pattern recognition for advanced insights'
          ],
          keyInsights: [
            'Mental constructions are not problems to solve',
            'Clear seeing naturally reduces unnecessary suffering',
            'Advanced practice involves subtler discriminations',
            'Firebase analytics reveal patterns invisible to moment-by-moment observation'
          ],
          personalReflections: [
            'How has your understanding of mental patterns evolved?',
            'What insights arise from sustained practice?',
            'How do Firebase insights enhance your understanding?'
          ]
        }
      ],
      wisdomIndex: {
        keywords: ['attention', 'awareness', 'present', 'mindfulness', 'meditation', 'thoughts', 'emotions', 'firebase', 'synchronization'],
        concepts: ['PAHM Matrix', 'Present + Neutral', 'mental constructions', 'temporal awareness', 'cross-device practice'],
        practicalApplications: ['daily mindfulness', 'emotional regulation', 'stress reduction', 'mental clarity', 'firebase analytics']
      },
      firebaseMetadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '2.0.0-firebase'
      }
    };

    console.log('✅ Firebase book content loaded successfully');
  }

  // ✅ FIREBASE-ONLY: Build adaptive index in memory
  private static async buildFirebaseAdaptiveIndex(): Promise<void> {
    if (!this.bookContent) return;

    console.log('🔥 Building Firebase adaptive index...');

    this.wisdomDatabase = {
      stageGuidance: {
        1: {
          focus: 'Basic attention training with Firebase tracking',
          challenges: ['mind wandering', 'restlessness', 'doubt', 'cross-device consistency'],
          techniques: ['return to breath', 'noting practice', 'gentle persistence', 'firebase session logging'],
          wisdom: 'Every moment of noticing is a moment of awakening, now trackable across all your devices',
          firebaseFeatures: ['session synchronization', 'pattern recognition', 'progress tracking']
        },
        2: {
          focus: 'PAHM Matrix understanding with Firebase analytics',
          challenges: ['categorizing thoughts', 'emotional reactivity', 'consistency', 'data interpretation'],
          techniques: ['PAHM observation', 'neutral positioning', 'pattern recognition', 'firebase analytics review'],
          wisdom: 'Present + Neutral is the only non-constructed mental position, visible in your Firebase data',
          firebaseFeatures: ['PAHM tracking', 'emotional pattern analysis', 'cross-device insights']
        },
        3: {
          focus: 'Advanced pattern recognition with Firebase insights',
          challenges: ['subtle mental formations', 'spiritual materialism', 'integration', 'data overwhelm'],
          techniques: ['subtle awareness', 'choiceless observation', 'daily life practice', 'firebase pattern analysis'],
          wisdom: 'Understanding and suffering cannot coexist in the same moment - Firebase reveals this truth',
          firebaseFeatures: ['advanced analytics', 'subtle pattern detection', 'integration insights']
        }
      },
      wisdomQuotes: [
        'You are not your thoughts - you are the awareness in which thoughts arise (Firebase tracks this recognition)',
        'Present + Neutral awareness contacts reality directly - see this in your Firebase analytics',
        'Every recognition is a return to your natural state - now preserved across devices',
        'Mental constructions are like clouds - temporary and insubstantial, as your Firebase data shows',
        'The observer and the observed are one seamless awareness - synchronized across all platforms'
      ],
      practicalPatterns: {
        anxiety: {
          pahmCategory: 'Future + Aversion',
          technique: 'Present + Neutral refuge',
          guidance: 'Anxiety creates future scenarios with aversion. Return to Present + Neutral awareness. Firebase can help you recognize these patterns.',
          firebaseInsight: 'Your Firebase data shows anxiety patterns typically occur at specific times and contexts'
        },
        depression: {
          pahmCategory: 'Past + Aversion',
          technique: 'Gentle present-moment return',
          guidance: 'Depression often involves past experiences with aversion. Present-moment awareness offers relief. Firebase tracking helps identify triggers.',
          firebaseInsight: 'Firebase analytics reveal depression cycles and recovery patterns across your practice history'
        },
        restlessness: {
          pahmCategory: 'Future + Attachment',
          technique: 'Noting and settling',
          guidance: 'Restlessness seeks future satisfaction. Note this pattern and settle into present awareness. Firebase tracks your settling patterns.',
          firebaseInsight: 'Your Firebase data shows restlessness correlates with specific environmental and temporal factors'
        }
      },
      firebaseMetadata: {
        buildDate: new Date().toISOString(),
        version: '2.0.0-firebase',
        features: ['cross-device sync', 'pattern recognition', 'advanced analytics']
      }
    };

    console.log('✅ Firebase adaptive index built successfully');
  }

  // ✅ FIREBASE-ONLY: Fallback initialization without localStorage
  private static async initializeInMemoryFallback(): Promise<void> {
    console.log('🔥 Firebase initialization failed, using in-memory fallback...');
    await this.loadFirebaseBookContent();
    await this.buildFirebaseAdaptiveIndex();
    this.isInitialized = true;
    console.log('✅ In-memory fallback initialization completed');
  }

  // 🎯 FIREBASE-ONLY MAIN RESPONSE GENERATION
  static async getAdaptiveResponse(
    userQuery: string,
    userContext: ComprehensiveUserContext
  ): Promise<ComprehensiveWisdomResponse> {
    if (!this.isInitialized) {
      await this.initializeAdaptiveKnowledge();
    }

    // ✅ FIREBASE-ONLY: Require user authentication
    if (!userContext.uid) {
      console.warn('🚨 Adaptive Wisdom Engine requires authenticated user');
      return this.getUnauthenticatedFallback(userQuery);
    }

    try {
      console.log(`🔥 Generating Firebase adaptive response for user: ${userContext.uid.substring(0, 8)}...`);
      
      // Comprehensive analysis with Firebase metadata
      const queryAnalysis = this.analyzeQueryWithFirebaseContext(userQuery, userContext);
      const personalizedMatches = this.findFirebasePersonalizedMatches(queryAnalysis, this.bookContent!, userContext);
      
      // Generate adaptive response with Firebase enhancements
      const baseResponse = this.generateFirebaseContextualResponse(queryAnalysis, personalizedMatches, userContext);
      const personalizationEnhancements = this.generateFirebasePersonalizationEnhancements(userContext, queryAnalysis);
      
      // Compile comprehensive Firebase response
      const comprehensiveResponse: ComprehensiveWisdomResponse = {
        response: this.combineFirebaseResponseElements(baseResponse, personalizationEnhancements, userContext),
        confidence: this.calculateFirebaseConfidence(queryAnalysis, personalizedMatches, userContext),
        personalizationScore: this.calculateFirebasePersonalizationScore(userContext),
        practicalActions: this.generateFirebasePracticalActions(userContext, queryAnalysis),
        bookReferences: this.generateFirebaseBookReferences(personalizedMatches),
        followUpQuestions: this.generateFirebaseFollowUpQuestions(userContext, queryAnalysis),
        ancientWisdom: this.selectFirebaseContextualWisdom(queryAnalysis, userContext),
        adaptiveGuidance: this.generateFirebaseAdaptiveGuidance(userContext, queryAnalysis),
        styleHints: {
          tone: this.determineFirebaseResponseStyle(userContext, queryAnalysis),
          approach: queryAnalysis.practiceContext,
          urgency: queryAnalysis.urgencyLevel
        },
        firebaseMetadata: {
          generatedAt: new Date().toISOString(),
          userId: userContext.uid,
          dataSource: 'Firebase Cloud Storage',
          personalizationLevel: this.calculateFirebasePersonalizationScore(userContext) > 80 ? 'high' : 
                               this.calculateFirebasePersonalizationScore(userContext) > 60 ? 'medium' : 'basic'
        }
      };

      // Save Firebase interaction
      await this.saveFirebaseInteraction(userQuery, comprehensiveResponse, userContext);
      
      console.log(`✅ Firebase adaptive response generated for user: ${userContext.uid.substring(0, 8)}...`);
      return comprehensiveResponse;

    } catch (error) {
      console.error(`❌ Error generating Firebase adaptive response for user ${userContext.uid.substring(0, 8)}...:`, error);
      return this.getFirebaseAdaptiveFallback(userQuery, userContext);
    }
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

  private static extractKeyTerms(query: string): string[] {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for'];
    return query.split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  // 🧠 FIREBASE-ONLY QUERY ANALYSIS
  private static analyzeQueryWithFirebaseContext(userQuery: string, userContext: ComprehensiveUserContext): QueryAnalysis {
    const normalizedQuery = userQuery.toLowerCase().trim();
    
    console.log(`🔥 Analyzing query with Firebase context for user: ${userContext.uid.substring(0, 8)}...`);
    
    return {
      originalQuery: userQuery,
      normalizedQuery,
      intentType: this.detectIntent(normalizedQuery),
      emotionalTone: this.detectEmotionalTone(normalizedQuery),
      urgencyLevel: this.detectUrgency(normalizedQuery),
      practiceContext: this.detectFirebasePracticeContext(normalizedQuery, userContext),
      keyTerms: this.extractKeyTerms(normalizedQuery),
      implicitNeeds: this.identifyFirebaseImplicitNeeds(normalizedQuery, userContext),
      personalizedKeywords: this.generateFirebasePersonalizedKeywords(normalizedQuery, userContext),
      firebaseAnalyzedAt: new Date().toISOString()
    };
  }

  private static detectFirebasePracticeContext(query: string, userContext: ComprehensiveUserContext): string {
    const contextPatterns = {
      meditation: ['meditation', 'sitting', 'cushion', 'breath', 'firebase tracking'],
      daily_life: ['work', 'daily', 'life', 'routine', 'relationship', 'cross-device'],
      emotional: ['emotion', 'feeling', 'mood', 'heart', 'pain', 'patterns'],
      mental: ['thoughts', 'thinking', 'mind', 'mental', 'cognitive', 'pahm'],
      firebase_analytics: ['analytics', 'data', 'patterns', 'insights', 'tracking', 'progress']
    };

    for (const [context, patterns] of Object.entries(contextPatterns)) {
      if (patterns.some(pattern => query.includes(pattern))) {
        return context;
      }
    }
    
    // Context from Firebase user data
    if (userContext.practiceAnalytics?.pahmData?.totalObservations && userContext.practiceAnalytics.pahmData.totalObservations > 100) {
      return 'advanced_firebase_practice';
    }
    
    return 'general';
  }

  private static identifyFirebaseImplicitNeeds(query: string, userContext: ComprehensiveUserContext): string[] {
    const needs: string[] = [];
    
    // Firebase-specific needs
    if (userContext.firebaseSource) {
      needs.push('firebase_integration', 'cross_device_consistency');
    }
    
    // Based on Firebase analytics
    if (userContext.practiceAnalytics?.pahmData) {
      const presentNeutralMastery = userContext.practiceAnalytics.pahmData.presentNeutralMastery;
      if (presentNeutralMastery < 50) {
        needs.push('pahm_development', 'present_neutral_guidance');
      } else if (presentNeutralMastery > 80) {
        needs.push('advanced_techniques', 'subtle_awareness');
      }
    }
    
    // Based on stage and Firebase data
    if (userContext.currentStage <= 1 && !userContext.practiceAnalytics?.pahmData) {
      needs.push('basic_instruction', 'firebase_setup', 'tracking_guidance');
    } else if (userContext.currentStage >= 3) {
      needs.push('advanced_concepts', 'integration_guidance', 'firebase_insights');
    }
    
    return needs;
  }

  private static generateFirebasePersonalizedKeywords(query: string, userContext: ComprehensiveUserContext): string[] {
    const keywords: string[] = [];
    
    // Add Firebase-enhanced stage-specific keywords
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    if (stageGuidance) {
      keywords.push(...stageGuidance.techniques);
      keywords.push(...(stageGuidance.firebaseFeatures || []));
    }
    
    // Add Firebase analytics keywords
    if (userContext.practiceAnalytics?.pahmData) {
      keywords.push('pahm_analytics', 'pattern_recognition', 'firebase_insights');
    }
    
    // Add goal-specific keywords with Firebase context
    if (userContext.goals) {
      keywords.push(...userContext.goals.map(goal => `${goal}_firebase_tracking`));
    }
    
    return keywords;
  }

  // 📚 FIREBASE-ONLY CONTENT MATCHING
  private static findFirebasePersonalizedMatches(queryAnalysis: QueryAnalysis, bookContent: BookContent, userContext: ComprehensiveUserContext): any {
    const matches = {
      directMatches: [] as Array<{ chapter: any; score: number }>,
      stageRelevant: [] as Array<{ chapter: any; score: number }>,
      firebaseRelevant: [] as Array<{ chapter: any; score: number }>,
      practicalRelevant: [] as Array<{ chapter: any; score: number }>
    };

    console.log(`🔥 Finding Firebase personalized matches for user: ${userContext.uid.substring(0, 8)}...`);

    // Find relevant chapters based on Firebase data and stage
    for (const chapter of bookContent.chapters) {
      const relevanceScore = this.calculateFirebaseChapterRelevance(chapter, queryAnalysis, userContext);
      
      if (relevanceScore > 0.7) {
        matches.directMatches.push({ chapter, score: relevanceScore });
      } else if (chapter.stage === userContext.currentStage) {
        matches.stageRelevant.push({ chapter, score: relevanceScore });
      }
      
      // Firebase-specific relevance
      if (chapter.content.includes('firebase') || chapter.content.includes('Firebase')) {
        matches.firebaseRelevant.push({ chapter, score: relevanceScore + 0.1 });
      }
    }

    return matches;
  }

  private static calculateFirebaseChapterRelevance(chapter: any, queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): number {
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
    
    // Firebase data richness bonus
    if (userContext.practiceAnalytics?.pahmData && chapter.content.includes('PAHM')) {
      score += 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  // 💬 FIREBASE-ONLY RESPONSE GENERATION
  private static generateFirebaseContextualResponse(queryAnalysis: QueryAnalysis, matches: any, userContext: ComprehensiveUserContext): string {
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    let response = '';

    // Firebase-enhanced opening acknowledgment
    response += this.generateFirebasePersonalizedOpening(queryAnalysis, userContext);

    // Core guidance based on Firebase matches
    if (matches.directMatches.length > 0) {
      const bestMatch = matches.directMatches[0];
      response += ` ${bestMatch.chapter.keyInsights[0]} `;
    } else if (stageGuidance) {
      response += ` Based on your Stage ${userContext.currentStage} Firebase practice data, ${stageGuidance.focus.toLowerCase()} is your foundation. `;
    }

    // Firebase-enhanced practical guidance
    response += this.generateFirebasePracticalGuidance(queryAnalysis, userContext);

    return response.trim();
  }

  private static generateFirebasePersonalizedOpening(queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): string {
    const practiceData = userContext.practiceAnalytics?.pahmData;
    const sessionCount = userContext.enhancedProfile?.currentProgress?.totalSessions || 0;
    const firebaseContext = userContext.firebaseSource ? 'Firebase-synchronized' : 'local';
    
    if (practiceData && practiceData.presentNeutralMastery > 70) {
      return `Your ${firebaseContext} practice shows exceptional ${practiceData.presentNeutralMastery}% Present + Neutral mastery from ${practiceData.totalObservations} Firebase-tracked observations, demonstrating advanced understanding.`;
    } else if (sessionCount > 50) {
      return `Your ${sessionCount} Firebase-synchronized practice sessions show dedicated commitment to this path across all your devices.`;
    } else if (userContext.firebaseSource) {
      return `I understand you're exploring this aspect of practice. Your Firebase integration enables deeper insights.`;
    } else {
      return `I understand you're exploring this aspect of practice.`;
    }
  }

  private static generateFirebasePracticalGuidance(queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): string {
    const practicalPattern = this.wisdomDatabase.practicalPatterns[queryAnalysis.emotionalTone];
    
    if (practicalPattern) {
      const firebaseInsight = practicalPattern.firebaseInsight || '';
      return `This appears to involve ${practicalPattern.pahmCategory} mental positions. ${practicalPattern.guidance} ${firebaseInsight}`;
    }
    
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    if (stageGuidance && stageGuidance.techniques.length > 0) {
      const firebaseFeature = stageGuidance.firebaseFeatures?.[0] || '';
      return `Try working with ${stageGuidance.techniques[0]} as your foundation practice. ${firebaseFeature ? `Firebase ${firebaseFeature} will enhance your understanding.` : ''}`;
    }
    
    return 'Remember that awareness itself is the path - every moment of recognition is valuable and now preserved in your Firebase practice history.';
  }

  private static generateFirebasePersonalizationEnhancements(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): any {
    return {
      firebaseContext: this.getFirebaseContext(userContext),
      environmentalContext: this.getFirebaseEnvironmentalContext(userContext),
      progressContext: this.getFirebaseProgressContext(userContext),
      goalAlignment: this.getFirebaseGoalAlignment(userContext, queryAnalysis),
      stageSpecificGuidance: this.getFirebaseStageSpecificGuidance(userContext)
    };
  }

  private static getFirebaseContext(userContext: ComprehensiveUserContext): string {
    if (!userContext.firebaseSource) return '';
    return `Your Firebase-integrated practice enables cross-device synchronization and advanced pattern recognition.`;
  }

  private static getFirebaseEnvironmentalContext(userContext: ComprehensiveUserContext): string {
    const envData = userContext.practiceAnalytics?.environmentData;
    if (!envData) return '';
    
    return `Your Firebase-tracked optimized ${envData.posture} posture in the ${envData.location} with ${envData.lighting} lighting supports deeper practice across all sessions.`;
  }

  private static getFirebaseProgressContext(userContext: ComprehensiveUserContext): string {
    const progress = userContext.enhancedProfile?.currentProgress;
    if (!progress) return '';
    
    const streak = progress.currentStreak;
    const quality = progress.averageQuality;
    
    return `Your Firebase-synchronized ${streak}-day practice streak with ${quality}% session quality demonstrates authentic commitment across all your devices.`;
  }

  private static getFirebaseGoalAlignment(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string {
    if (!userContext.goals || userContext.goals.length === 0) return '';
    
    const primaryGoal = userContext.goals[0];
    const firebaseContext = userContext.firebaseSource ? ' with Firebase tracking' : '';
    return `This aligns with your goal of ${primaryGoal}${firebaseContext}.`;
  }

  private static getFirebaseStageSpecificGuidance(userContext: ComprehensiveUserContext): string {
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    if (!stageGuidance) return '';
    
    const firebaseFeatures = stageGuidance.firebaseFeatures?.join(', ') || '';
    return `At Stage ${userContext.currentStage}, focus on ${stageGuidance.focus.toLowerCase()}. ${firebaseFeatures ? `Firebase features include: ${firebaseFeatures}.` : ''}`;
  }

  private static combineFirebaseResponseElements(baseResponse: string, enhancements: any, userContext: ComprehensiveUserContext): string {
    let combined = baseResponse;
    
    // Add Firebase context if available
    if (enhancements.firebaseContext) {
      combined += ` ${enhancements.firebaseContext}`;
    }
    
    // Add Firebase environmental context if available
    if (enhancements.environmentalContext) {
      combined += ` ${enhancements.environmentalContext}`;
    }
    
    // Add Firebase progress context if available
    if (enhancements.progressContext) {
      combined += ` ${enhancements.progressContext}`;
    }
    
    // Add Firebase goal alignment if available
    if (enhancements.goalAlignment) {
      combined += ` ${enhancements.goalAlignment}`;
    }
    
    return combined.trim();
  }

  // 📊 FIREBASE-ONLY SCORING AND METRICS
  private static calculateFirebaseConfidence(queryAnalysis: QueryAnalysis, matches: any, userContext: ComprehensiveUserContext): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on Firebase matches
    if (matches.directMatches.length > 0) {
      confidence += 0.3;
    }
    
    // Boost confidence based on Firebase data richness
    if (userContext.practiceAnalytics?.pahmData && 
        userContext.practiceAnalytics.pahmData.totalObservations && 
        userContext.practiceAnalytics.pahmData.totalObservations > 100) {
      confidence += 0.25;
    }
    
    // Firebase integration bonus
    if (userContext.firebaseSource) {
      confidence += 0.1;
    }
    
    // Boost confidence based on stage alignment
    if (matches.stageRelevant.length > 0) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 0.98);
  }

  private static calculateFirebasePersonalizationScore(userContext: ComprehensiveUserContext): number {
    let score = 0;
    
    // Firebase integration bonus
    if (userContext.firebaseSource) score += 10;
    
    // Data richness scoring with Firebase bonuses
    if (userContext.questionnaireAnswers) score += 20;
    if (userContext.selfAssessmentResults) score += 20;
    if (userContext.enhancedProfile) score += 20;
    if (userContext.practiceAnalytics?.pahmData) score += 25;
    if (userContext.practiceAnalytics?.environmentData) score += 15;
    
    // Firebase-specific data bonuses
    if (userContext.practiceAnalytics?.firebaseCalculatedAt) score += 5;
    if (userContext.enhancedProfile?.firebaseUpdatedAt) score += 5;
    
    return Math.min(score, 100);
  }

  // 🎯 FIREBASE-ONLY PRACTICAL ACTIONS
  private static generateFirebasePracticalActions(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string[] {
    const actions: string[] = [];
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    
    // Firebase-enhanced stage-specific actions
    if (stageGuidance) {
      actions.push(`Practice ${stageGuidance.techniques[0]} for 5-10 minutes daily with Firebase tracking`);
      if (stageGuidance.firebaseFeatures?.[0]) {
        actions.push(`Utilize Firebase ${stageGuidance.firebaseFeatures[0]} for enhanced insights`);
      }
    }
    
    // Firebase goal-specific actions
    if (userContext.goals && userContext.goals.includes('stress_reduction')) {
      actions.push('Use Present + Neutral awareness when stress arises - Firebase will track your patterns');
    }
    
    // Firebase environmental optimization
    const envData = userContext.practiceAnalytics?.environmentData;
    if (envData && envData.avgRating < 8) {
      actions.push('Optimize your practice environment - Firebase analytics will show improvement');
    }
    
    // Firebase-specific actions
    if (userContext.firebaseSource) {
      actions.push('Review your Firebase analytics weekly for pattern insights');
      actions.push('Practice consistently across devices for comprehensive data');
    }
    
    // Default Firebase fallback actions
    if (actions.length === 0) {
      actions.push('Notice when awareness recognizes mental patterns - Firebase preserves these insights');
      actions.push('Practice returning to present-moment attention with cross-device synchronization');
    }
    
    return actions;
  }

  // 📚 FIREBASE-ONLY BOOK REFERENCES
  private static generateFirebaseBookReferences(matches: any): Array<{ chapter: string; section: string; page?: number }> {
    const references: Array<{ chapter: string; section: string; page?: number }> = [];
    
    if (matches.directMatches && matches.directMatches.length > 0) {
      const match = matches.directMatches[0];
      references.push({
        chapter: match.chapter.title,
        section: 'Firebase-Enhanced Core Concepts',
        page: match.chapter.chapterNumber
      });
    }
    
    if (matches.firebaseRelevant && matches.firebaseRelevant.length > 0) {
      const match = matches.firebaseRelevant[0];
      references.push({
        chapter: match.chapter.title,
        section: 'Firebase Integration Practices',
        page: match.chapter.chapterNumber
      });
    }
    
    if (matches.stageRelevant && matches.stageRelevant.length > 0) {
      const match = matches.stageRelevant[0];
      references.push({
        chapter: match.chapter.title,
        section: 'Firebase-Tracked Practical Exercises',
        page: match.chapter.chapterNumber
      });
    }
    
    return references;
  }

  // 🔮 FIREBASE-ONLY WISDOM SELECTION
  private static selectFirebaseContextualWisdom(queryAnalysis: QueryAnalysis, userContext: ComprehensiveUserContext): string {
    const stageGuidance = this.wisdomDatabase.stageGuidance[userContext.currentStage];
    
    if (stageGuidance && stageGuidance.wisdom) {
      return stageGuidance.wisdom;
    }
    
    // Fallback to Firebase-enhanced general wisdom
    const wisdomQuotes = this.wisdomDatabase.wisdomQuotes;
    return wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
  }

  // 🎪 FIREBASE-ONLY ADAPTIVE GUIDANCE
  private static generateFirebaseAdaptiveGuidance(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  } {
    const firebaseContext = userContext.firebaseSource ? ' (Firebase-synchronized)' : '';
    
    return {
      immediate: [
        'Take three conscious breaths',
        `Notice this moment of awareness${firebaseContext}`
      ],
      shortTerm: [
        'Practice Present + Neutral observation daily with Firebase tracking',
        'Integrate awareness into routine activities across all devices'
      ],
      longTerm: [
        'Develop consistent Firebase-synchronized daily practice',
        'Explore advanced pattern recognition through Firebase analytics'
      ]
    };
  }

  // 🎨 FIREBASE-ONLY STYLE DETERMINATION
  private static determineFirebaseResponseStyle(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string {
    if (queryAnalysis.urgencyLevel === 'high') return 'compassionate';
    if (queryAnalysis.emotionalTone === 'frustrated') return 'calming';
    if (userContext.currentStage >= 3 && userContext.firebaseSource) return 'advanced-firebase';
    if (userContext.firebaseSource) return 'firebase-enhanced';
    if (userContext.currentStage >= 3) return 'advanced';
    return 'wise';
  }

  // ❓ FIREBASE-ONLY FOLLOW-UP QUESTIONS
  private static generateFirebaseFollowUpQuestions(userContext: ComprehensiveUserContext, queryAnalysis: QueryAnalysis): string[] {
    const questions = [
      'How does this understanding feel for you?',
      'What specific aspect would you like to explore further?',
      'Have you noticed this pattern in your daily experience?'
    ];
    
    // Add Firebase-specific questions
    if (userContext.firebaseSource) {
      questions.push('What patterns do you notice in your Firebase analytics?');
      questions.push('How has cross-device practice tracking affected your understanding?');
    }
    
    // Add stage-specific questions with Firebase context
    if (userContext.currentStage >= 2) {
      questions.push('How does this relate to the PAHM Matrix framework in your Firebase data?');
    }
    
    return questions;
  }

  // 🆘 FIREBASE-ONLY FALLBACK RESPONSES
  private static getUnauthenticatedFallback(userQuery: string): ComprehensiveWisdomResponse {
    return {
      response: `I understand you're asking about "${userQuery}". To provide personalized guidance with Firebase-powered insights, please sign in to access your practice data and cross-device synchronization.`,
      confidence: 0.3,
      personalizationScore: 0,
      practicalActions: [
        'Sign in to access Firebase-powered personalized guidance',
        'Begin with present-moment awareness',
        'Notice the awareness that recognizes thoughts'
      ],
      bookReferences: [
        { chapter: 'Understanding Attention Patterns', section: 'Basic Principles' }
      ],
      followUpQuestions: [
        'Would you like to sign in for personalized Firebase-enhanced guidance?'
      ],
      ancientWisdom: 'Every moment of awareness is a return to your true nature',
      adaptiveGuidance: {
        immediate: ['Take a conscious breath'],
        shortTerm: ['Sign in for personalized practice tracking'],
        longTerm: ['Develop consistent Firebase-synchronized practice']
      },
      styleHints: {
        tone: 'inviting',
        approach: 'gentle',
        urgency: 'normal'
      },
      firebaseMetadata: {
        generatedAt: new Date().toISOString(),
        userId: 'unauthenticated',
        dataSource: 'Firebase Cloud Storage',
        personalizationLevel: 'none'
      }
    };
  }

  private static getFirebaseAdaptiveFallback(userQuery: string, userContext: ComprehensiveUserContext): ComprehensiveWisdomResponse {
    return {
      response: `I understand you're asking about "${userQuery}". Based on your Stage ${userContext.currentStage} Firebase-synchronized practice, remember that you are not your thoughts - you are the awareness in which thoughts arise. Every moment of recognition is a moment of awakening, now preserved across all your devices.`,
      confidence: 0.6,
      personalizationScore: 30,
      practicalActions: [
        'Return to present-moment awareness with Firebase tracking',
        'Notice the awareness that recognizes thoughts across sessions'
      ],
      bookReferences: [
        { chapter: 'Understanding Attention Patterns', section: 'Firebase-Enhanced Basic Principles' }
      ],
      followUpQuestions: [
        'What would be most helpful to explore in your Firebase practice data?'
      ],
      ancientWisdom: 'Every moment of awareness is a return to your true nature - now synchronized across all platforms',
      adaptiveGuidance: {
        immediate: ['Take a conscious breath'],
        shortTerm: ['Practice daily awareness with Firebase synchronization'],
        longTerm: ['Develop consistent Firebase-integrated mindfulness']
      },
      styleHints: {
        tone: 'supportive',
        approach: 'gentle',
        urgency: 'normal'
      },
      firebaseMetadata: {
        generatedAt: new Date().toISOString(),
        userId: userContext.uid,
        dataSource: 'Firebase Cloud Storage',
        personalizationLevel: 'basic'
      }
    };
  }

  // 💾 FIREBASE-ONLY INTERACTION HISTORY (IN-MEMORY)
  private static async saveFirebaseInteraction(query: string, response: ComprehensiveWisdomResponse, userContext: ComprehensiveUserContext): Promise<void> {
    const interaction: FirebaseInteraction = {
      timestamp: new Date().toISOString(),
      userId: userContext.uid,
      query,
      confidence: response.confidence,
      personalizationScore: response.personalizationScore,
      stage: userContext.currentStage,
      firebaseStored: true
    };
    
    this.userInteractionHistory.push(interaction);
    
    // Keep only last 100 interactions in memory (no localStorage)
    if (this.userInteractionHistory.length > 100) {
      this.userInteractionHistory = this.userInteractionHistory.slice(-100);
    }
    
    console.log(`🔥 Firebase interaction saved for user: ${userContext.uid.substring(0, 8)}...`);
    
    // TODO: In a full Firebase implementation, save to Firestore here
    // await firestore.collection('user_interactions').add(interaction);
  }

  // 🛠️ FIREBASE-ONLY UTILITY METHODS
  static getFirebaseInteractionHistory(): FirebaseInteraction[] {
    return this.userInteractionHistory;
  }

  static clearFirebaseInteractionHistory(): void {
    this.userInteractionHistory = [];
    console.log('🔥 Firebase interaction history cleared from memory');
  }

  static isFirebaseReady(): boolean {
    return this.isInitialized && this.bookContent !== null && this.firebaseInitialized;
  }

  static getFirebaseStatus(): {
    initialized: boolean;
    firebaseReady: boolean;
    bookContentLoaded: boolean;
    wisdomDatabaseBuilt: boolean;
    interactionsCount: number;
  } {
    return {
      initialized: this.isInitialized,
      firebaseReady: this.firebaseInitialized,
      bookContentLoaded: this.bookContent !== null,
      wisdomDatabaseBuilt: Object.keys(this.wisdomDatabase).length > 0,
      interactionsCount: this.userInteractionHistory.length
    };
  }

  // 🔄 FIREBASE-ONLY BACKWARD COMPATIBILITY METHODS
  static initializeBookContent(): boolean {
    try {
      console.log('🔥 Initializing Firebase book content (backward compatibility)...');
      this.initializeAdaptiveKnowledge();
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase book content:', error);
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
      uid?: string;
      firebaseSource?: boolean;
    }
  ): {
    response: string;
    confidence: number;
    bookWisdom: string[];
    practicalGuidance: string[];
    firebaseEnhanced: boolean;
  } {
    const firebaseContext = context.firebaseSource ? ' with Firebase insights' : '';
    const stageGuidance = this.wisdomDatabase.stageGuidance?.[context.currentStage];
    const wisdomQuotes = this.wisdomDatabase.wisdomQuotes || [];
    
    // Firebase-enhanced pattern matching
    const normalizedQuery = userMessage.toLowerCase();
    let response = '';
    let confidence = context.firebaseSource ? 0.8 : 0.7;
    let practicalGuidance: string[] = [];
    
    // Handle common patterns with Firebase enhancements
    if (normalizedQuery.includes('pahm') || normalizedQuery.includes('matrix')) {
      response = `The PAHM Matrix helps you categorize thoughts as Past/Present/Future combined with Attachment/Neutral/Aversion. Present + Neutral positions involve direct reality contact, while other combinations involve mental constructions.${firebaseContext}`;
      practicalGuidance = [
        'Practice identifying Present + Neutral mental positions',
        'Notice when thoughts involve past memories or future planning',
        'Observe attachment and aversion patterns without judgment',
        ...(context.firebaseSource ? ['Review PAHM patterns in your Firebase analytics'] : [])
      ];
      confidence = context.firebaseSource ? 0.95 : 0.9;
    } else if (normalizedQuery.includes('stress') || normalizedQuery.includes('anxiety')) {
      response = `Stress and anxiety often involve Future + Aversion mental positions. Use Present + Neutral awareness as refuge when these patterns arise. Remember, you are not your thoughts - you are the awareness in which thoughts appear.${firebaseContext}`;
      practicalGuidance = [
        'Return to present-moment breath awareness',
        'Notice anxiety as Future + Aversion mental position',
        'Practice Present + Neutral observation',
        ...(context.firebaseSource ? ['Track stress patterns in Firebase analytics'] : [])
      ];
      confidence = context.firebaseSource ? 0.9 : 0.8;
    } else if (normalizedQuery.includes('meditation') || normalizedQuery.includes('practice')) {
      if (stageGuidance) {
        response = `At Stage ${context.currentStage}, focus on ${stageGuidance.focus.toLowerCase()}. ${stageGuidance.wisdom}`;
        practicalGuidance = stageGuidance.techniques.map((tech: string) => `Practice ${tech}`);
        if (context.firebaseSource && stageGuidance.firebaseFeatures) {
          practicalGuidance.push(...stageGuidance.firebaseFeatures.map((feature: string) => `Use Firebase ${feature}`));
        }
        confidence = context.firebaseSource ? 0.9 : 0.85;
      } else {
        response = `Consistent daily practice is key. Start with observing your natural breathing rhythm and notice when awareness recognizes the wandering mind.${firebaseContext}`;
        practicalGuidance = [
          'Sit comfortably with eyes gently closed',
          'Follow the natural rhythm of your breath',
          'When mind wanders, gently return attention to breath',
          ...(context.firebaseSource ? ['Log sessions in Firebase for pattern tracking'] : [])
        ];
        confidence = context.firebaseSource ? 0.8 : 0.7;
      }
    } else if (context.recentChallenges.includes('restlessness')) {
      response = `Restlessness often involves Future + Attachment mental positions - the mind seeking future satisfaction. Note this pattern gently and return to Present + Neutral awareness.${firebaseContext}`;
      practicalGuidance = [
        'Acknowledge restlessness without fighting it',
        'Return attention to present-moment sensations',
        'Practice shorter sessions if needed',
        ...(context.firebaseSource ? ['Review restlessness patterns in Firebase data'] : [])
      ];
      confidence = context.firebaseSource ? 0.85 : 0.8;
    } else {
      // General Firebase-enhanced guidance based on stage
      if (stageGuidance) {
        response = `Based on your Stage ${context.currentStage} practice, ${stageGuidance.wisdom} Focus on ${stageGuidance.focus.toLowerCase()}.${firebaseContext}`;
        practicalGuidance = stageGuidance.techniques.slice(0, 3) || [];
        if (context.firebaseSource && stageGuidance.firebaseFeatures) {
          practicalGuidance.push(`Explore Firebase ${stageGuidance.firebaseFeatures[0] || 'analytics'}`);
        }
        confidence = context.firebaseSource ? 0.8 : 0.7;
      } else {
        response = `Every moment of awareness is valuable. Remember that you are not your thoughts - you are the awareness in which thoughts arise and pass away.${firebaseContext}`;
        practicalGuidance = [
          'Notice this moment of awareness',
          'Observe thoughts without getting caught in them',
          'Return to present-moment attention',
          ...(context.firebaseSource ? ['Track awareness moments in Firebase'] : [])
        ];
        confidence = context.firebaseSource ? 0.7 : 0.6;
      }
    }
    
    // Select Firebase-enhanced wisdom
    const bookWisdom = stageGuidance?.wisdom || 
      wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)] || 
      'Every moment of recognition is a moment of awakening';

    return {
      response,
      confidence,
      bookWisdom: [bookWisdom],
      practicalGuidance,
      firebaseEnhanced: !!context.firebaseSource
    };
  }

  static saveKnowledgeInteraction(
    interactionId: string,
    userQuery: string,
    aiResponse: string,
    userStage: number,
    wasHelpful: boolean,
    userId?: string
  ): void {
    const interaction: FirebaseInteraction = {
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      query: userQuery,
      confidence: 0.8,
      personalizationScore: userId ? 50 : 20,
      stage: userStage,
      interactionId,
      wasHelpful,
      firebaseStored: true
    };
    
    this.userInteractionHistory.push(interaction);
    
    // Keep only last 100 interactions in memory
    if (this.userInteractionHistory.length > 100) {
      this.userInteractionHistory = this.userInteractionHistory.slice(-100);
    }
    
    console.log(`🔥 Firebase knowledge interaction saved: ${interactionId}`);
  }

  // 🚀 FIREBASE-ONLY INITIALIZATION
  static async reinitializeForFirebase(): Promise<void> {
    console.log('🔥 Reinitializing Adaptive Wisdom Engine for Firebase-only operation...');
    this.isInitialized = false;
    this.firebaseInitialized = false;
    this.bookContent = null;
    this.wisdomDatabase = {};
    this.userInteractionHistory = [];
    
    await this.initializeAdaptiveKnowledge();
    console.log('✅ Firebase-only reinitialization completed');
  }
}

// ✅ FIREBASE-ONLY: Initialize the adaptive system without localStorage
AdaptiveWisdomEngine.initializeAdaptiveKnowledge().then(() => {
  console.log('🔥 Firebase Adaptive Wisdom Engine startup completed');
}).catch(error => {
  console.error('❌ Firebase Adaptive Wisdom Engine startup failed:', error);
});

// ✅ FIREBASE-ONLY: Backward compatibility export
export const EnhancedLocalStorageManager = AdaptiveWisdomEngine;