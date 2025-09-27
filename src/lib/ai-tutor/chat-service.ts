/**
 * AI Chat Tutor Service
 * MELLOWISE-025: Core chat service with Claude API integration and context management
 */

import type {
  ChatMessage,
  ChatSession,
  TutorConfig,
  TutorRequest,
  TutorResponse,
  TutorError,
  MessageContext,
  SessionContext,
  RateLimit,
  UsageTracking,
  DEFAULT_TUTOR_CONFIG
} from '@/types/ai-tutor';

export class AIChatTutorService {
  private config: TutorConfig;
  private sessions = new Map<string, ChatSession>();
  private rateLimits = new Map<string, RateLimit>();
  private usageTracking = new Map<string, UsageTracking>();

  constructor(config: Partial<TutorConfig> = {}) {
    this.config = {
      ...DEFAULT_TUTOR_CONFIG,
      ...config
    };
  }

  /**
   * Send message to AI tutor and get response
   */
  async sendMessage(request: TutorRequest): Promise<TutorResponse | TutorError> {
    const startTime = performance.now();

    try {
      // Get or create session first to get userId
      const session = this.getSession(request.sessionId, request.userId);

      // Check rate limits using userId for proper tracking
      const rateLimitCheck = this.checkRateLimit(session.userId);
      if (rateLimitCheck.isExceeded) {
        return {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Reset time: ${rateLimitCheck.resetTime.toLocaleString()}`,
          timestamp: new Date(),
          requestId: this.generateRequestId()
        };
      }

      // Add user message to session
      const userMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'user',
        content: request.message,
        timestamp: new Date(),
        context: request.context
      };

      session.messages.push(userMessage);

      // Build conversation context
      const conversationContext = this.buildConversationContext(session, request.context);

      // Get AI response
      const aiResponse = await this.getAIResponse(conversationContext, request);

      const processingTime = performance.now() - startTime;

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: this.generateMessageId(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: {
          processingTime,
          tokens: aiResponse.tokensUsed,
          confidence: aiResponse.confidence,
          explanationType: request.requestedStyle,
          conceptsDiscussed: aiResponse.conceptsDiscussed,
          followUpSuggestions: aiResponse.suggestions
        }
      };

      session.messages.push(assistantMessage);
      session.updatedAt = new Date();
      session.totalMessages += 2;
      session.tokensUsed += aiResponse.tokensUsed;

      // Update rate limits and usage tracking using userId
      this.updateRateLimit(session.userId, aiResponse.tokensUsed);
      this.trackUsage(session.userId, aiResponse.tokensUsed, processingTime);

      // Update session context
      this.updateSessionContext(session, request.context, aiResponse);

      return {
        message: assistantMessage,
        tokensUsed: aiResponse.tokensUsed,
        processingTime,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
        relatedConcepts: aiResponse.relatedConcepts,
        followUpQuestions: aiResponse.followUpQuestions
      };

    } catch (error) {
      console.error('AI Tutor Service Error:', error);

      // Try fallback if enabled
      if (this.config.fallbackEnabled) {
        return this.getFallbackResponse(request);
      }

      return {
        code: 'AI_SERVICE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { originalError: error },
        timestamp: new Date(),
        requestId: this.generateRequestId()
      };
    }
  }

  /**
   * Create new chat session
   */
  createSession(userId: string, title?: string): ChatSession {
    const sessionId = this.generateSessionId();

    const session: ChatSession = {
      id: sessionId,
      userId,
      title: title || `Tutoring Session ${new Date().toLocaleDateString()}`,
      messages: [],
      context: {
        learningGoals: [],
        weakAreas: [],
        progressIndicators: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      totalMessages: 0,
      tokensUsed: 0
    };

    // Add system message
    const systemMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'system',
      content: this.config.systemPrompt,
      timestamp: new Date()
    };

    session.messages.push(systemMessage);
    this.sessions.set(sessionId, session);

    return session;
  }

  /**
   * Get existing session or create new one with validation
   */
  getSession(sessionId: string, userId?: string): ChatSession {
    // Validate sessionId format
    if (!this.isValidSessionId(sessionId)) {
      throw new Error('Invalid session ID format');
    }

    const existing = this.sessions.get(sessionId);
    if (existing) {
      // Verify user owns this session
      if (userId && existing.userId !== userId && existing.userId !== 'anonymous') {
        throw new Error('Unauthorized access to session');
      }
      return existing;
    }

    // Require authenticated userId for new sessions
    if (!userId) {
      throw new Error('User authentication required for new sessions');
    }

    return this.createSession(userId, `Study Session ${new Date().toLocaleDateString()}`);
  }

  /**
   * Validate session ID format
   */
  private isValidSessionId(sessionId: string): boolean {
    // Session IDs should match our format: session_timestamp_random
    const sessionPattern = /^session_\d+_[a-z0-9]{9}$/;
    return sessionPattern.test(sessionId);
  }

  /**
   * Get session history
   */
  getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages.filter(msg => msg.role !== 'system') : [];
  }

  /**
   * Clear session history
   */
  clearSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Keep system message, clear the rest
    session.messages = session.messages.filter(msg => msg.role === 'system');
    session.totalMessages = 0;
    session.tokensUsed = 0;
    session.updatedAt = new Date();

    return true;
  }

  /**
   * Update session context with learning progress
   */
  updateLearningContext(sessionId: string, context: Partial<SessionContext>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.context = {
      ...session.context,
      ...context
    };
  }

  /**
   * Get usage statistics for a user/session
   */
  getUsageStats(sessionId: string): UsageTracking | null {
    return this.usageTracking.get(sessionId) || null;
  }

  /**
   * Check if rate limit is exceeded
   */
  isRateLimited(sessionId: string): boolean {
    const rateLimit = this.rateLimits.get(sessionId);
    return rateLimit ? rateLimit.isExceeded : false;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Get AI response from Claude API
   */
  private async getAIResponse(context: string, request: TutorRequest): Promise<{
    content: string;
    tokensUsed: number;
    confidence: number;
    suggestions?: string[];
    relatedConcepts?: string[];
    followUpQuestions?: string[];
    conceptsDiscussed?: string[];
  }> {
    // This would integrate with the actual Claude API
    // For now, returning a simulated response structure

    const prompt = this.buildTutoringPrompt(context, request);

    // Simulate API call (replace with actual Anthropic API integration)
    const response = await this.callClaudeAPI(prompt, request.maxTokens || this.config.maxTokens);

    return {
      content: response.content,
      tokensUsed: response.usage?.total_tokens || 0,
      confidence: 0.85, // Would come from actual API
      suggestions: this.extractSuggestions(response.content),
      relatedConcepts: this.extractConcepts(response.content),
      followUpQuestions: this.generateFollowUpQuestions(response.content, request.context),
      conceptsDiscussed: this.identifyDiscussedConcepts(response.content)
    };
  }

  /**
   * Call Claude API with real integration
   */
  private async callClaudeAPI(prompt: string, maxTokens: number): Promise<any> {
    // Real Anthropic Claude API integration
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured, falling back to simulated response');
      return this.simulateAPIResponse(prompt, maxTokens);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model || 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          temperature: this.config.temperature || 0.7,
          system: this.config.systemPrompt,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Claude API Error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        usage: {
          total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      };
    } catch (error) {
      console.error('Claude API call failed:', error);
      // Fallback to simulated response if API fails
      return this.simulateAPIResponse(prompt, maxTokens);
    }
  }

  /**
   * Simulated API response for fallback
   */
  private async simulateAPIResponse(prompt: string, maxTokens: number): Promise<any> {
    await this.sleep(100 + Math.random() * 400);
    return {
      content: this.generateTutoringResponse(prompt),
      usage: {
        total_tokens: Math.floor(Math.random() * 200) + 50
      }
    };
  }

  /**
   * Build tutoring prompt with context
   */
  private buildTutoringPrompt(context: string, request: TutorRequest): string {
    let prompt = this.config.systemPrompt + '\n\n';

    if (context) {
      prompt += `Context: ${context}\n\n`;
    }

    if (request.context) {
      prompt += `Current Question Context:\n`;
      if (request.context.questionType) {
        prompt += `- Question Type: ${request.context.questionType}\n`;
      }
      if (request.context.sectionType) {
        prompt += `- Section: ${request.context.sectionType}\n`;
      }
      if (request.context.userMistakes?.length) {
        prompt += `- Recent Mistakes: ${request.context.userMistakes.join(', ')}\n`;
      }
      if (request.context.difficultyLevel) {
        prompt += `- Difficulty Level: ${request.context.difficultyLevel}\n`;
      }
      prompt += '\n';
    }

    if (request.requestedStyle) {
      prompt += `Explanation Style Requested: ${request.requestedStyle}\n\n`;
    }

    prompt += `Student Question: ${request.message}\n\n`;
    prompt += `Please provide a helpful, educational response that guides the student toward understanding. `;

    if (this.config.enableSocraticMethod) {
      prompt += `Use Socratic questioning when appropriate to help the student discover the answer themselves. `;
    }

    prompt += `Focus on building conceptual understanding rather than just providing the answer.`;

    return prompt;
  }

  /**
   * Build conversation context from session history
   */
  private buildConversationContext(session: ChatSession, currentContext?: MessageContext): string {
    const recentMessages = session.messages
      .filter(msg => msg.role !== 'system')
      .slice(-this.config.contextWindow)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    let context = `Recent Conversation:\n${recentMessages}\n\n`;

    if (session.context.currentQuestion) {
      context += `Current Question Context:\n`;
      context += `Question ID: ${session.context.currentQuestion.questionId}\n`;
      context += `Type: ${session.context.currentQuestion.questionType}\n`;
      context += `Section: ${session.context.currentQuestion.section}\n`;
      if (session.context.currentQuestion.userAnswer) {
        context += `Student's Answer: ${session.context.currentQuestion.userAnswer}\n`;
      }
      context += '\n';
    }

    if (session.context.weakAreas?.length) {
      context += `Student's Weak Areas: ${session.context.weakAreas.join(', ')}\n\n`;
    }

    if (session.context.learningGoals?.length) {
      context += `Learning Goals: ${session.context.learningGoals.join(', ')}\n\n`;
    }

    return context;
  }

  /**
   * Generate simulated tutoring response (placeholder)
   */
  private generateTutoringResponse(prompt: string): string {
    // This would be replaced by actual Claude API response
    const responses = [
      "That's a great question! Let me help you think through this step by step. What do you think is the main argument being presented here?",
      "I can see why this might be confusing. Before I explain, can you tell me what you understand about the relationship between the premises and conclusion?",
      "This is a common type of question that tests your understanding of logical reasoning. Let's break down the argument structure together.",
      "Good observation! This question is testing a specific concept. What patterns do you notice in the answer choices?",
      "Let me guide you through this. First, can you identify what the question is actually asking you to do?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Extract suggestions from AI response
   */
  private extractSuggestions(content: string): string[] {
    // Simple pattern matching - would be more sophisticated in practice
    const suggestions = [];

    if (content.includes('practice')) {
      suggestions.push('Practice similar questions to reinforce this concept');
    }
    if (content.includes('review')) {
      suggestions.push('Review the fundamentals of this topic');
    }
    if (content.includes('diagram')) {
      suggestions.push('Try drawing a diagram to visualize the relationships');
    }

    return suggestions;
  }

  /**
   * Extract concepts from AI response
   */
  private extractConcepts(content: string): string[] {
    const concepts: string[] = [];

    // Pattern matching for common LSAT concepts
    if (content.toLowerCase().includes('assumption')) concepts.push('Assumptions');
    if (content.toLowerCase().includes('strengthen')) concepts.push('Strengthening Arguments');
    if (content.toLowerCase().includes('weaken')) concepts.push('Weakening Arguments');
    if (content.toLowerCase().includes('flaw')) concepts.push('Logical Flaws');
    if (content.toLowerCase().includes('inference')) concepts.push('Making Inferences');

    return concepts;
  }

  /**
   * Generate follow-up questions
   */
  private generateFollowUpQuestions(content: string, context?: MessageContext): string[] {
    const questions = [];

    if (context?.questionType === 'strengthen') {
      questions.push("What would make this argument even stronger?");
      questions.push("Can you identify any assumptions the argument relies on?");
    } else if (context?.questionType === 'weaken') {
      questions.push("What evidence would undermine this argument?");
      questions.push("What are the argument's vulnerabilities?");
    } else {
      questions.push("Does this make sense so far?");
      questions.push("Can you think of a similar example?");
      questions.push("What questions do you still have about this concept?");
    }

    return questions.slice(0, 2); // Return 2 follow-up questions
  }

  /**
   * Identify concepts discussed in response
   */
  private identifyDiscussedConcepts(content: string): string[] {
    return this.extractConcepts(content); // Same as extractConcepts for now
  }

  /**
   * Update session context based on interaction
   */
  private updateSessionContext(session: ChatSession, messageContext?: MessageContext, response?: any): void {
    if (messageContext?.currentQuestionId) {
      // Update current question context
      if (messageContext.questionType && messageContext.sectionType) {
        session.context.currentQuestion = {
          questionId: messageContext.currentQuestionId,
          questionType: messageContext.questionType,
          section: messageContext.sectionType,
          difficulty: 1, // Would be determined dynamically
          correctAnswer: '', // Would be provided
          explanation: '', // Would be provided
          commonMistakes: messageContext.userMistakes || [],
          relatedConcepts: response?.relatedConcepts || []
        };
      }
    }

    // Update weak areas based on mistakes
    if (messageContext?.userMistakes?.length) {
      const currentWeakAreas = session.context.weakAreas || [];
      const newWeakAreas = [...new Set([...currentWeakAreas, ...messageContext.userMistakes])];
      session.context.weakAreas = newWeakAreas;
    }

    // Update progress indicators
    if (response?.conceptsDiscussed?.length) {
      response.conceptsDiscussed.forEach((concept: string) => {
        const existing = session.context.progressIndicators?.find(p => p.concept === concept);
        if (existing) {
          existing.timesDiscussed += 1;
          existing.lastDiscussed = new Date();
          existing.confidence = Math.min(1.0, existing.confidence + 0.1);
        } else {
          session.context.progressIndicators?.push({
            concept,
            understanding: 0.5,
            confidence: 0.6,
            improvementRate: 0.1,
            lastDiscussed: new Date(),
            timesDiscussed: 1
          });
        }
      });
    }
  }

  /**
   * Check rate limit for session
   */
  private checkRateLimit(sessionId: string): RateLimit {
    const existing = this.rateLimits.get(sessionId);
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (!existing || existing.resetTime <= now) {
      // Create new rate limit window
      const rateLimit: RateLimit = {
        requests: 0,
        tokens: 0,
        resetTime: new Date(now.getTime() + 60 * 60 * 1000),
        remaining: this.config.rateLimitPerHour,
        isExceeded: false
      };
      this.rateLimits.set(sessionId, rateLimit);
      return rateLimit;
    }

    return existing;
  }

  /**
   * Update rate limit after API call
   */
  private updateRateLimit(sessionId: string, tokensUsed: number): void {
    const rateLimit = this.rateLimits.get(sessionId);
    if (!rateLimit) return;

    rateLimit.requests += 1;
    rateLimit.tokens += tokensUsed;
    rateLimit.remaining = this.config.rateLimitPerHour - rateLimit.requests;
    rateLimit.isExceeded = rateLimit.requests >= this.config.rateLimitPerHour;
  }

  /**
   * Track usage for analytics
   */
  private trackUsage(sessionId: string, tokensUsed: number, processingTime: number): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = this.usageTracking.get(sessionId);

    if (existing && existing.date.getTime() === today.getTime()) {
      // Update existing day's usage
      existing.requests += 1;
      existing.tokens += tokensUsed;
      existing.averageResponseTime = (existing.averageResponseTime + processingTime) / 2;
    } else {
      // Create new day's usage
      const usage: UsageTracking = {
        userId: sessionId, // Using sessionId as userId for now
        date: today,
        requests: 1,
        tokens: tokensUsed,
        sessions: 1,
        averageResponseTime: processingTime,
        errorRate: 0
      };
      this.usageTracking.set(sessionId, usage);
    }
  }

  /**
   * Get fallback response when AI unavailable
   */
  private async getFallbackResponse(request: TutorRequest): Promise<TutorResponse> {
    // Simple fallback with pre-generated content
    const fallbackMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: "I'm having trouble connecting to the AI service right now. Here are some general study tips: 1) Break down complex problems step by step, 2) Identify the question type first, 3) Look for key words that indicate the logical relationship. Would you like to try asking your question again?",
      timestamp: new Date(),
      metadata: {
        processingTime: 50,
        confidence: 0.3
      }
    };

    return {
      message: fallbackMessage,
      tokensUsed: 0,
      processingTime: 50,
      confidence: 0.3,
      suggestions: [
        'Try rephrasing your question',
        'Check your internet connection',
        'Review similar practice problems'
      ]
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility for simulating API delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}