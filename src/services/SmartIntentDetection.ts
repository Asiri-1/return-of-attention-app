// ============================================================================
// src/services/SmartIntentDetection.ts
// Intelligent intent classification to prevent AI over-interpretation
// ============================================================================

interface IntentPattern {
    intent: string;
    patterns: string[];
    confidence: number;
    requiresDeepAnalysis: boolean;
    contextual: boolean;
  }
  
  interface IntentAnalysis {
    primaryIntent: string;
    confidence: number;
    shouldDeepAnalyze: boolean;
    patterns: string[];
    contextFactors: {
      isFollowUp: boolean;
      isEmotional: boolean;
      isSpecific: boolean;
      complexity: 'low' | 'medium' | 'high';
    };
  }
  
  interface SmartResponseData {
    response: string;
    tone: 'casual' | 'clarifying' | 'wise' | 'supportive';
    includeActions: boolean;
    confidence: number;
  }
  
  interface FeedbackData {
    userInput: string;
    aiResponse: string;
    userEngagement: 'helpful' | 'irrelevant' | 'too_complex' | 'too_simple';
    actualIntent: string;
    timestamp: string;
  }
  
  export class SmartIntentDetection {
    private static intentPatterns: IntentPattern[] = [
      // ===== SIMPLE INTENTS (No deep AI needed) =====
      {
        intent: 'greeting',
        patterns: ['hi', 'hello', 'hey', 'good morning', 'good evening', 'greetings'],
        confidence: 0.9,
        requiresDeepAnalysis: false,
        contextual: false
      },
      {
        intent: 'gratitude',
        patterns: ['thank', 'thanks', 'appreciate', 'grateful'],
        confidence: 0.85,
        requiresDeepAnalysis: false,
        contextual: false
      },
      {
        intent: 'basic_info',
        patterns: ['what is pahm', 'what is meditation', 'how does this work', 'tell me about'],
        confidence: 0.8,
        requiresDeepAnalysis: false,
        contextual: false
      },
      {
        intent: 'casual_chat',
        patterns: ['how are you', 'whats up', 'nice to meet', 'im good', 'cool', 'awesome'],
        confidence: 0.75,
        requiresDeepAnalysis: false,
        contextual: false
      },
      
      // ===== COMPLEX INTENTS (Require AI analysis) =====
      {
        intent: 'emotional_distress',
        patterns: ['anxious', 'worried', 'stressed', 'overwhelmed', 'panic', 'afraid', 'scared'],
        confidence: 0.9,
        requiresDeepAnalysis: true,
        contextual: true
      },
      {
        intent: 'meditation_guidance',
        patterns: ['how to meditate', 'struggling with', 'cant focus', 'mind wanders', 'practice help'],
        confidence: 0.85,
        requiresDeepAnalysis: true,
        contextual: true
      },
      {
        intent: 'spiritual_inquiry',
        patterns: ['enlightenment', 'awakening', 'consciousness', 'awareness', 'spiritual', 'deeper understanding'],
        confidence: 0.8,
        requiresDeepAnalysis: true,
        contextual: true
      },
      {
        intent: 'life_challenge',
        patterns: ['relationship', 'work stress', 'life purpose', 'feeling lost', 'major decision'],
        confidence: 0.75,
        requiresDeepAnalysis: true,
        contextual: true
      }
    ];
  
    private static feedbackHistory: FeedbackData[] = [];
    private static intentAccuracyMap: Map<string, { correct: number; total: number }> = new Map();
  
    /**
     * Main intent analysis method
     */
    static analyzeIntent(
      userInput: string, 
      userContext: any, 
      messageHistory: any[]
    ): IntentAnalysis {
      const normalizedInput = userInput.toLowerCase().trim();
      
      // Step 1: Pattern Matching
      const patternMatches = this.findPatternMatches(normalizedInput);
      
      // Step 2: Context Analysis
      const contextFactors = this.analyzeContext(normalizedInput, userContext, messageHistory);
      
      // Step 3: Determine primary intent
      const primaryIntent = this.determinePrimaryIntent(patternMatches, contextFactors);
      
      // Step 4: Calculate confidence
      const confidence = this.calculateConfidence(patternMatches, contextFactors, primaryIntent);
      
      // Step 5: Decide if deep analysis needed
      const shouldDeepAnalyze = this.shouldRequireDeepAnalysis(
        primaryIntent, 
        confidence, 
        contextFactors,
        normalizedInput
      );
  
      const analysis: IntentAnalysis = {
        primaryIntent: primaryIntent.intent,
        confidence,
        shouldDeepAnalyze,
        patterns: primaryIntent.patterns,
        contextFactors
      };
  
      console.log('🔍 Intent Analysis:', {
        input: userInput.substring(0, 50) + (userInput.length > 50 ? '...' : ''),
        intent: analysis.primaryIntent,
        confidence: Math.round(confidence * 100) + '%',
        deepAnalysis: shouldDeepAnalyze,
        context: contextFactors
      });
  
      return analysis;
    }
  
    /**
     * Generate smart response for simple intents
     */
    static generateSmartResponse(
      userInput: string,
      intentAnalysis: IntentAnalysis,
      userContext: any
    ): SmartResponseData {
      const { primaryIntent } = intentAnalysis;
      const userName = userContext?.name || 'friend';
      
      let response: string;
      let tone: 'casual' | 'clarifying' | 'wise' | 'supportive';
      let includeActions = false;
  
      switch (primaryIntent) {
        case 'greeting':
          response = this.generateGreetingResponse(userInput, userContext);
          tone = 'casual';
          break;
  
        case 'gratitude':
          response = this.generateGratitudeResponse(userContext);
          tone = 'casual';
          break;
  
        case 'basic_info':
          response = this.generateInfoResponse(userInput);
          tone = 'clarifying';
          includeActions = true;
          break;
  
        case 'casual_chat':
          response = this.generateCasualResponse(userInput, userContext);
          tone = 'casual';
          break;
  
        default:
          // Fallback for unmatched patterns
          response = `I hear you, ${userName}. Let me think about the best way to help with that.`;
          tone = 'supportive';
          break;
      }
  
      return {
        response,
        tone,
        includeActions,
        confidence: intentAnalysis.confidence
      };
    }
  
    /**
     * Record feedback for continuous learning
     */
    static recordFeedback(feedback: FeedbackData): void {
      this.feedbackHistory.push(feedback);
      
      // Update accuracy tracking
      const intent = feedback.actualIntent;
      if (!this.intentAccuracyMap.has(intent)) {
        this.intentAccuracyMap.set(intent, { correct: 0, total: 0 });
      }
      
      const accuracy = this.intentAccuracyMap.get(intent)!;
      accuracy.total++;
      
      if (feedback.userEngagement === 'helpful') {
        accuracy.correct++;
      }
  
      // Auto-adjust patterns based on feedback
      this.adjustPatternsFromFeedback(feedback);
      
      // Keep only last 1000 feedback entries
      if (this.feedbackHistory.length > 1000) {
        this.feedbackHistory = this.feedbackHistory.slice(-1000);
      }
    }
  
    /**
     * Get analytics for system improvement
     */
    static getAnalytics(): {
      accuracyRate: number;
      totalFeedback: number;
      intentDistribution: Array<{intent: string; count: number; accuracy: number}>;
      improvementSuggestions: string[];
      recentTrends: {
        increasingPatterns: string[];
        decreasingAccuracy: string[];
      };
    } {
      const totalCorrect = Array.from(this.intentAccuracyMap.values())
        .reduce((sum, acc) => sum + acc.correct, 0);
      const totalFeedback = Array.from(this.intentAccuracyMap.values())
        .reduce((sum, acc) => sum + acc.total, 0);
  
      const intentDistribution = Array.from(this.intentAccuracyMap.entries())
        .map(([intent, data]) => ({
          intent,
          count: data.total,
          accuracy: data.total > 0 ? data.correct / data.total : 0
        }))
        .sort((a, b) => b.count - a.count);
  
      const improvementSuggestions = this.generateImprovementSuggestions(intentDistribution);
      const recentTrends = this.analyzeRecentTrends();
  
      return {
        accuracyRate: totalFeedback > 0 ? totalCorrect / totalFeedback : 0,
        totalFeedback,
        intentDistribution,
        improvementSuggestions,
        recentTrends
      };
    }
  
    // ===== PRIVATE HELPER METHODS =====
  
    private static findPatternMatches(input: string): Array<{intent: string; patterns: string[]; score: number}> {
      const matches: Array<{intent: string; patterns: string[]; score: number}> = [];
      
      for (const pattern of this.intentPatterns) {
        let score = 0;
        const matchedPatterns: string[] = [];
        
        for (const phrase of pattern.patterns) {
          if (input.includes(phrase)) {
            score += phrase.length / input.length; // Weight by phrase significance
            matchedPatterns.push(phrase);
          }
        }
        
        if (score > 0) {
          matches.push({
            intent: pattern.intent,
            patterns: matchedPatterns,
            score: score * pattern.confidence
          });
        }
      }
      
      return matches.sort((a, b) => b.score - a.score);
    }
  
    private static analyzeContext(
      input: string, 
      userContext: any, 
      messageHistory: any[]
    ): IntentAnalysis['contextFactors'] {
      const isFollowUp = messageHistory.length > 0 && 
        messageHistory[messageHistory.length - 1]?.timestamp && 
        (Date.now() - new Date(messageHistory[messageHistory.length - 1].timestamp).getTime()) < 300000; // 5 min
  
      const emotionalWords = ['feel', 'emotion', 'heart', 'soul', 'hurt', 'joy', 'sad', 'happy'];
      const isEmotional = emotionalWords.some(word => input.includes(word));
  
      const specificWords = ['how', 'when', 'where', 'why', 'what', 'which', 'specific', 'exactly'];
      const isSpecific = specificWords.some(word => input.includes(word));
  
      const complexity = this.determineComplexity(input);
  
      return {
        isFollowUp,
        isEmotional,
        isSpecific,
        complexity
      };
    }
  
    private static determineComplexity(input: string): 'low' | 'medium' | 'high' {
      const words = input.split(' ').length;
      const sentences = input.split(/[.!?]+/).length;
      
      if (words < 5 && sentences <= 1) return 'low';
      if (words < 15 && sentences <= 2) return 'medium';
      return 'high';
    }
  
    private static determinePrimaryIntent(
      matches: Array<{intent: string; patterns: string[]; score: number}>,
      contextFactors: IntentAnalysis['contextFactors']
    ): {intent: string; patterns: string[]} {
      if (matches.length === 0) {
        return { intent: 'unknown', patterns: [] };
      }
  
      // Apply context weighting
      const weightedMatches = matches.map(match => {
        let weight = match.score;
        
        if (contextFactors.isEmotional && ['emotional_distress', 'life_challenge'].includes(match.intent)) {
          weight *= 1.3;
        }
        
        if (contextFactors.isSpecific && ['meditation_guidance', 'spiritual_inquiry'].includes(match.intent)) {
          weight *= 1.2;
        }
        
        return { ...match, score: weight };
      });
  
      const topMatch = weightedMatches.sort((a, b) => b.score - a.score)[0];
      return { intent: topMatch.intent, patterns: topMatch.patterns };
    }
  
    private static calculateConfidence(
      matches: Array<{intent: string; patterns: string[]; score: number}>,
      contextFactors: IntentAnalysis['contextFactors'],
      primaryIntent: {intent: string; patterns: string[]}
    ): number {
      if (matches.length === 0) return 0.1;
      
      const topMatch = matches.find(m => m.intent === primaryIntent.intent);
      if (!topMatch) return 0.1;
      
      let baseConfidence = topMatch.score;
      
      // Boost confidence for clear patterns
      if (primaryIntent.patterns.length > 1) {
        baseConfidence *= 1.2;
      }
      
      // Reduce confidence for complex/ambiguous inputs
      if (contextFactors.complexity === 'high') {
        baseConfidence *= 0.8;
      }
      
      return Math.min(0.95, Math.max(0.1, baseConfidence));
    }
  
    private static shouldRequireDeepAnalysis(
      primaryIntent: {intent: string},
      confidence: number,
      contextFactors: IntentAnalysis['contextFactors'],
      input: string
    ): boolean {
      // Always analyze if intent pattern requires it
      const intentPattern = this.intentPatterns.find(p => p.intent === primaryIntent.intent);
      if (intentPattern?.requiresDeepAnalysis) {
        return true;
      }
      
      // Analyze if confidence is low
      if (confidence < 0.6) {
        return true;
      }
      
      // Analyze emotional or complex content
      if (contextFactors.isEmotional || contextFactors.complexity === 'high') {
        return true;
      }
      
      // Analyze longer inputs (likely more nuanced)
      if (input.length > 100) {
        return true;
      }
      
      return false;
    }
  
    // ===== RESPONSE GENERATORS =====
  
    private static generateGreetingResponse(input: string, userContext: any): string {
      const name = userContext?.name || 'friend';
      const timeOfDay = this.getTimeOfDay();
      
      const responses = [
        `Good ${timeOfDay}, ${name}! How can I support your mindfulness journey today?`,
        `Hello ${name}! I'm here to help with your meditation practice. What's on your mind?`,
        `Hi there! Ready to explore some mindfulness together?`,
        `Welcome back! How has your practice been going?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
  
    private static generateGratitudeResponse(userContext: any): string {
      const responses = [
        "You're very welcome! It's my pleasure to support your practice.",
        "I'm grateful to be part of your mindfulness journey.",
        "Thank you for being open to growth and learning.",
        "Your appreciation means a lot. Keep nurturing that grateful heart!"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }
  
    private static generateInfoResponse(input: string): string {
      if (input.includes('pahm')) {
        return "PAHM (Pure Awareness Healing Methods) is a mindfulness approach that emphasizes recognizing the aware space in which all experience arises. Would you like to learn about specific techniques or practices?";
      }
      
      if (input.includes('meditation')) {
        return "Meditation is the practice of training awareness and attention. In PAHM, we focus on recognizing the awareness that's already present rather than trying to create a special state. What aspect interests you most?";
      }
      
      return "I'm here to help with mindfulness, meditation guidance, and the PAHM approach. What would you like to explore?";
    }
  
    private static generateCasualResponse(input: string, userContext: any): string {
      const name = userContext?.name || 'friend';
      
      if (input.includes('how are you')) {
        return `I'm here and present, ready to help however I can, ${name}. How are you feeling today?`;
      }
      
      if (input.includes('good') || input.includes('great')) {
        return "That's wonderful to hear! It's beautiful when we can appreciate the good moments.";
      }
      
      return "I'm glad we can connect. Feel free to share whatever's on your mind or ask about mindfulness practices.";
    }
  
    private static getTimeOfDay(): string {
      const hour = new Date().getHours();
      if (hour < 12) return 'morning';
      if (hour < 17) return 'afternoon';
      return 'evening';
    }
  
    // ===== LEARNING & IMPROVEMENT =====
  
    private static adjustPatternsFromFeedback(feedback: FeedbackData): void {
      // This is where you'd implement pattern learning
      // For now, we'll log insights for manual review
      console.log('📚 Learning opportunity:', {
        userSaid: feedback.userInput,
        weResponded: feedback.aiResponse,
        userFelt: feedback.userEngagement,
        actualIntent: feedback.actualIntent
      });
    }
  
    private static generateImprovementSuggestions(
      intentDistribution: Array<{intent: string; count: number; accuracy: number}>
    ): string[] {
      const suggestions: string[] = [];
      
      const lowAccuracyIntents = intentDistribution.filter(item => item.accuracy < 0.7 && item.count > 5);
      if (lowAccuracyIntents.length > 0) {
        suggestions.push(`Improve pattern matching for: ${lowAccuracyIntents.map(i => i.intent).join(', ')}`);
      }
      
      const highVolumeIntents = intentDistribution.filter(item => item.count > 50);
      if (highVolumeIntents.length > 0) {
        suggestions.push(`Consider expanding response variety for: ${highVolumeIntents.map(i => i.intent).join(', ')}`);
      }
      
      return suggestions;
    }
  
    private static analyzeRecentTrends(): {
      increasingPatterns: string[];
      decreasingAccuracy: string[];
    } {
      // Analyze last 100 feedback entries for trends
     // const recentFeedback = this.feedbackHistory.slice(-100);
      
      // This would implement trend analysis
      // For now, return empty arrays
      return {
        increasingPatterns: [],
        decreasingAccuracy: []
      };
    }
  
    /**
     * Export patterns for manual review/adjustment
     */
    static exportLearningData(): {
      patterns: IntentPattern[];
      feedbackHistory: FeedbackData[];
      analytics: ReturnType<typeof SmartIntentDetection.getAnalytics>;
    } {
      return {
        patterns: this.intentPatterns,
        feedbackHistory: this.feedbackHistory,
        analytics: this.getAnalytics()
      };
    }
  
    /**
     * Manual pattern adjustment (for admin use)
     */
    static updateIntentPattern(
      intent: string, 
      newPatterns: string[], 
      confidence?: number, 
      requiresDeepAnalysis?: boolean
    ): void {
      const patternIndex = this.intentPatterns.findIndex(p => p.intent === intent);
      
      if (patternIndex >= 0) {
        this.intentPatterns[patternIndex] = {
          ...this.intentPatterns[patternIndex],
          patterns: newPatterns,
          confidence: confidence || this.intentPatterns[patternIndex].confidence,
          requiresDeepAnalysis: requiresDeepAnalysis ?? this.intentPatterns[patternIndex].requiresDeepAnalysis
        };
        
        console.log(`✅ Updated patterns for intent: ${intent}`);
      }
    }
  }