// ============================================================================
// src/services/SmartAIOrchestrator.ts
// Intelligent routing between intent detection and deep AI analysis
// ============================================================================

import { useState, useCallback } from 'react';
import { SmartIntentDetection } from './SmartIntentDetection';
import { AdaptiveWisdomEngine } from './AdaptiveWisdomEngine';
import { useEnhancedUserContext } from '../hooks/useEnhancedUserContext';

interface SmartAIResponse {
  response: string;
  type: 'casual' | 'clarification' | 'deep_guidance' | 'supportive';
  confidence: number;
  shouldShowActions: boolean;
  shouldShowWisdom: boolean;
  feedbackId: string; // For tracking user satisfaction
  metadata: {
    intentDetected: string;
    processingMethod: 'intent_only' | 'full_ai' | 'hybrid';
    responseTime: number;
    personalizationUsed: boolean;
  };
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  messageHistory: Array<{
    timestamp: string;
    userInput: string;
    aiResponse: string;
    userFeedback?: 'helpful' | 'irrelevant' | 'too_complex' | 'too_simple';
  }>;
}

export class SmartAIOrchestrator {
  private static conversationSessions: Map<string, ConversationContext> = new Map();

  /**
   * Main orchestration method - intelligently routes user input
   */
  static async getSmartResponse(
    userInput: string,
    userContext: any,
    conversationId: string = 'default'
  ): Promise<SmartAIResponse> {
    const startTime = Date.now();
    const feedbackId = this.generateFeedbackId();
    
    // Get or create conversation context
    const conversation = this.getConversationContext(conversationId, userContext.uid);
    
    // Step 1: Analyze Intent
    const intentAnalysis = SmartIntentDetection.analyzeIntent(
      userInput, 
      userContext, 
      conversation.messageHistory
    );

    console.log('🧠 Intent Analysis:', {
      input: userInput,
      intent: intentAnalysis.primaryIntent,
      confidence: intentAnalysis.confidence,
      shouldAnalyze: intentAnalysis.shouldDeepAnalyze
    });

    let aiResponse: SmartAIResponse;

    // Step 2: Route based on intent and confidence
    if (!intentAnalysis.shouldDeepAnalyze) {
      // Handle with simple intent-based response
      aiResponse = await this.handleSimpleIntent(
        userInput, 
        intentAnalysis, 
        userContext, 
        feedbackId, 
        startTime
      );
    } else {
      // Use full AdaptiveWisdomEngine power
      aiResponse = await this.handleComplexIntent(
        userInput, 
        intentAnalysis, 
        userContext, 
        feedbackId, 
        startTime
      );
    }

    // Step 3: Record conversation
    this.recordConversation(conversation, userInput, aiResponse);
    
    return aiResponse;
  }

  /**
   * Handle simple intents without full AI processing
   */
  private static async handleSimpleIntent(
    userInput: string,
    intentAnalysis: any,
    userContext: any,
    feedbackId: string,
    startTime: number
  ): Promise<SmartAIResponse> {
    
    const smartResponse = SmartIntentDetection.generateSmartResponse(
      userInput, 
      intentAnalysis, 
      userContext
    );

    return {
      response: smartResponse.response,
      type: this.mapToneToType(smartResponse.tone),
      confidence: intentAnalysis.confidence,
      shouldShowActions: smartResponse.includeActions,
      shouldShowWisdom: false, // No wisdom quotes for casual chat
      feedbackId,
      metadata: {
        intentDetected: intentAnalysis.primaryIntent,
        processingMethod: 'intent_only',
        responseTime: Date.now() - startTime,
        personalizationUsed: smartResponse.tone !== 'clarifying'
      }
    };
  }

  /**
   * Handle complex intents with full AI processing
   */
  private static async handleComplexIntent(
    userInput: string,
    intentAnalysis: any,
    userContext: any,
    feedbackId: string,
    startTime: number
  ): Promise<SmartAIResponse> {
    
    try {
      // Use your existing sophisticated AI
      const fullAIResponse = await AdaptiveWisdomEngine.getAdaptiveResponse(
        userInput,
        userContext
      );

      // Handle the ComprehensiveWisdomResponse format safely
      const responseText = fullAIResponse?.response || 'I\'m here to help with your practice.';
      const confidence = fullAIResponse?.confidence || 0.8;

      return {
        response: responseText,
        type: 'deep_guidance',
        confidence: confidence,
        shouldShowActions: true,
        shouldShowWisdom: true,
        feedbackId,
        metadata: {
          intentDetected: intentAnalysis.primaryIntent,
          processingMethod: 'full_ai',
          responseTime: Date.now() - startTime,
          personalizationUsed: true
        }
      };

    } catch (error) {
      console.error('Full AI processing failed:', error);
      
      // Fallback to intent-based response
      const fallbackResponse = SmartIntentDetection.generateSmartResponse(
        userInput, 
        intentAnalysis, 
        userContext
      );

      return {
        response: fallbackResponse.response,
        type: 'supportive',
        confidence: 0.5,
        shouldShowActions: false,
        shouldShowWisdom: false,
        feedbackId,
        metadata: {
          intentDetected: intentAnalysis.primaryIntent,
          processingMethod: 'hybrid',
          responseTime: Date.now() - startTime,
          personalizationUsed: false
        }
      };
    }
  }

  /**
   * Record user feedback for continuous learning
   */
  static recordUserFeedback(
    feedbackId: string,
    userInput: string,
    aiResponse: string,
    feedback: 'helpful' | 'irrelevant' | 'too_complex' | 'too_simple',
    actualIntent?: string
  ): void {
    
    SmartIntentDetection.recordFeedback({
      userInput,
      aiResponse,
      userEngagement: feedback,
      actualIntent: actualIntent || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Update conversation history with feedback
    this.updateConversationFeedback(feedbackId, feedback);
    
    console.log('📊 Feedback recorded:', {
      feedbackId,
      feedback,
      actualIntent
    });
  }

  /**
   * Get learning analytics
   */
  static getLearningAnalytics(): {
    intentAccuracy: number;
    avgResponseTime: number;
    userSatisfaction: number;
    improvementAreas: string[];
    conversationStats: {
      totalConversations: number;
      avgLength: number;
      mostCommonIntents: Array<{intent: string; count: number}>;
    };
  } {
    const intentAnalytics = SmartIntentDetection.getAnalytics();
    const conversationStats = this.getConversationStats();
    
    return {
      intentAccuracy: intentAnalytics.accuracyRate,
      avgResponseTime: this.calculateAvgResponseTime(),
      userSatisfaction: this.calculateUserSatisfaction(),
      improvementAreas: intentAnalytics.improvementSuggestions,
      conversationStats
    };
  }

  // ===== HELPER METHODS =====

  private static mapToneToType(tone: string): 'casual' | 'clarification' | 'deep_guidance' | 'supportive' {
    switch (tone) {
      case 'casual': return 'casual';
      case 'clarifying': return 'clarification';
      case 'wise': return 'deep_guidance';
      case 'supportive': return 'supportive';
      default: return 'clarification';
    }
  }

  private static generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getConversationContext(conversationId: string, userId: string): ConversationContext {
    if (!this.conversationSessions.has(conversationId)) {
      this.conversationSessions.set(conversationId, {
        userId,
        sessionId: conversationId,
        messageHistory: []
      });
    }
    return this.conversationSessions.get(conversationId)!;
  }

  private static recordConversation(
    conversation: ConversationContext, 
    userInput: string, 
    aiResponse: SmartAIResponse
  ): void {
    conversation.messageHistory.push({
      timestamp: new Date().toISOString(),
      userInput,
      aiResponse: aiResponse.response
    });

    // Keep only last 20 messages per conversation
    if (conversation.messageHistory.length > 20) {
      conversation.messageHistory = conversation.messageHistory.slice(-20);
    }
  }

  private static updateConversationFeedback(feedbackId: string, feedback: string): void {
    // Find and update the conversation entry with feedback
    for (const conversation of this.conversationSessions.values()) {
      const lastMessage = conversation.messageHistory[conversation.messageHistory.length - 1];
      if (lastMessage) {
        lastMessage.userFeedback = feedback as any;
        break;
      }
    }
  }

  private static calculateAvgResponseTime(): number {
    // This would track response times from metadata
    return 150; // Placeholder - implement based on stored metadata
  }

  private static calculateUserSatisfaction(): number {
    let totalFeedback = 0;
    let positiveFeedback = 0;

    for (const conversation of this.conversationSessions.values()) {
      for (const message of conversation.messageHistory) {
        if (message.userFeedback) {
          totalFeedback++;
          if (message.userFeedback === 'helpful') {
            positiveFeedback++;
          }
        }
      }
    }

    return totalFeedback > 0 ? positiveFeedback / totalFeedback : 0;
  }

  private static getConversationStats(): {
    totalConversations: number;
    avgLength: number;
    mostCommonIntents: Array<{intent: string; count: number}>;
  } {
    const conversations = Array.from(this.conversationSessions.values());
    const totalLength = conversations.reduce((sum, conv) => sum + conv.messageHistory.length, 0);
    
    return {
      totalConversations: conversations.length,
      avgLength: conversations.length > 0 ? totalLength / conversations.length : 0,
      mostCommonIntents: [] // Would implement intent tracking here
    };
  }

  /**
   * Clear conversation history (for privacy/testing)
   */
  static clearConversations(): void {
    this.conversationSessions.clear();
  }

  /**
   * Export conversation data for analysis
   */
  static exportConversationData(): any {
    return {
      conversations: Array.from(this.conversationSessions.entries()),
      analytics: this.getLearningAnalytics(),
      exportTimestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// React Hook for Easy Integration
// ============================================================================

export const useSmartAI = (conversationId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<SmartAIResponse | null>(null);
  const userContext = useEnhancedUserContext();

  const sendMessage = useCallback(async (userInput: string): Promise<SmartAIResponse> => {
    setIsLoading(true);
    
    try {
      const response = await SmartAIOrchestrator.getSmartResponse(
        userInput,
        userContext,
        conversationId
      );
      
      setLastResponse(response);
      return response;
      
    } catch (error) {
      console.error('Smart AI error:', error);
      
      // Fallback response
      const fallbackResponse: SmartAIResponse = {
        response: "I'm having trouble processing that right now. Could you try rephrasing your question?",
        type: 'clarification',
        confidence: 0.1,
        shouldShowActions: false,
        shouldShowWisdom: false,
        feedbackId: SmartAIOrchestrator['generateFeedbackId'](),
        metadata: {
          intentDetected: 'error',
          processingMethod: 'hybrid',
          responseTime: 0,
          personalizationUsed: false
        }
      };
      
      setLastResponse(fallbackResponse);
      return fallbackResponse;
      
    } finally {
      setIsLoading(false);
    }
  }, [userContext, conversationId]);

  const provideFeedback = useCallback((
    feedback: 'helpful' | 'irrelevant' | 'too_complex' | 'too_simple',
    actualIntent?: string
  ) => {
    if (lastResponse) {
      SmartAIOrchestrator.recordUserFeedback(
        lastResponse.feedbackId,
        '', // Would need to store original input
        lastResponse.response,
        feedback,
        actualIntent
      );
    }
  }, [lastResponse]);

  const getAnalytics = useCallback(() => {
    return SmartAIOrchestrator.getLearningAnalytics();
  }, []);

  return {
    sendMessage,
    provideFeedback,
    getAnalytics,
    isLoading,
    lastResponse
  };
};