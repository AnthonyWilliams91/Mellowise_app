/**
 * SMS Message Compression Engine
 * MELLOWISE-015: AI-powered message shortening without losing meaning
 */

/**
 * Message compression types and interfaces
 */
export interface CompressionResult {
  originalMessage: string;
  compressedMessage: string;
  originalLength: number;
  compressedLength: number;
  compressionRatio: number; // 0-1, where 0.7 means 70% of original length
  estimatedCostSavings: number; // in USD cents
  qualityScore: number; // 0-100, semantic preservation score
  segments: {
    original: number;
    compressed: number;
    segmentsSaved: number;
  };
}

export interface CompressionOptions {
  maxLength?: number; // Target maximum length
  preserveEmojis?: boolean;
  preserveLinks?: boolean;
  preserveNumbers?: boolean;
  aggressiveness?: 'conservative' | 'moderate' | 'aggressive';
  contextType?: 'reminder' | 'alert' | 'achievement' | 'deadline' | 'streak';
  userSegment?: 'high_value' | 'medium_value' | 'low_value';
}

export interface CompressionTemplate {
  type: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  priority: number; // Higher numbers are applied first
  preserveContext: boolean;
}

/**
 * SMS Message Compression Engine
 * Uses intelligent algorithms to reduce message length while preserving meaning
 */
export class SMSCompressionEngine {
  private compressionTemplates: CompressionTemplate[];
  private contextPatterns: Map<string, CompressionTemplate[]>;
  private abbreviationMap: Map<string, string>;
  private emojiShortcuts: Map<string, string>;

  constructor() {
    this.compressionTemplates = this.initializeCompressionTemplates();
    this.contextPatterns = this.initializeContextPatterns();
    this.abbreviationMap = this.initializeAbbreviationMap();
    this.emojiShortcuts = this.initializeEmojiShortcuts();
  }

  /**
   * Compress a message using intelligent algorithms
   */
  compressMessage(
    message: string,
    options: CompressionOptions = {}
  ): CompressionResult {
    const originalLength = message.length;
    const originalSegments = this.calculateSMSSegments(message);

    let compressed = message;
    const steps: string[] = [];

    // Step 1: Apply context-specific compression
    if (options.contextType) {
      compressed = this.applyContextSpecificCompression(compressed, options.contextType);
      steps.push('context-specific');
    }

    // Step 2: Apply general compression techniques
    compressed = this.applyGeneralCompression(compressed, options);
    steps.push('general');

    // Step 3: Smart abbreviations
    compressed = this.applySmartAbbreviations(compressed, options);
    steps.push('abbreviations');

    // Step 4: Emoji optimization
    if (options.preserveEmojis !== false) {
      compressed = this.optimizeEmojis(compressed);
      steps.push('emoji-optimization');
    }

    // Step 5: URL shortening simulation
    if (options.preserveLinks !== false) {
      compressed = this.optimizeLinks(compressed);
      steps.push('link-optimization');
    }

    // Step 6: Advanced compression if needed
    if (options.maxLength && compressed.length > options.maxLength) {
      compressed = this.applyAdvancedCompression(compressed, options);
      steps.push('advanced');
    }

    const compressedLength = compressed.length;
    const compressedSegments = this.calculateSMSSegments(compressed);
    const compressionRatio = compressedLength / originalLength;

    // Calculate cost savings (assume ~$0.008 per segment)
    const segmentsSaved = originalSegments - compressedSegments;
    const estimatedCostSavings = Math.round(segmentsSaved * 80); // 8 cents = 800 cents

    // Calculate quality score based on preserved meaning
    const qualityScore = this.calculateQualityScore(message, compressed, options);

    return {
      originalMessage: message,
      compressedMessage: compressed,
      originalLength,
      compressedLength,
      compressionRatio,
      estimatedCostSavings,
      qualityScore,
      segments: {
        original: originalSegments,
        compressed: compressedSegments,
        segmentsSaved,
      },
    };
  }

  /**
   * Batch compress multiple messages with optimization
   */
  batchCompress(
    messages: Array<{ id: string; message: string; options?: CompressionOptions }>
  ): Array<CompressionResult & { id: string }> {
    return messages.map(({ id, message, options = {} }) => ({
      id,
      ...this.compressMessage(message, options),
    }));
  }

  /**
   * Get compression suggestions without applying them
   */
  getCompressionSuggestions(message: string, options: CompressionOptions = {}): {
    suggestions: Array<{
      type: string;
      description: string;
      example: string;
      potentialSavings: number; // characters
    }>;
    totalPotentialSavings: number;
  } {
    const suggestions: any[] = [];
    let totalSavings = 0;

    // Check for common patterns that can be compressed
    const patterns = [
      {
        pattern: /\b(You have|You've got)\b/gi,
        replacement: "You've",
        type: 'contraction',
        description: 'Use contractions to save characters',
      },
      {
        pattern: /\b(questions to practice)\b/gi,
        replacement: 'questions',
        type: 'redundancy',
        description: 'Remove redundant words',
      },
      {
        pattern: /\b(study session)\b/gi,
        replacement: 'session',
        type: 'context',
        description: 'Remove context-implied words',
      },
      {
        pattern: /\b(your streak is waiting)\b/gi,
        replacement: 'streak waiting',
        type: 'simplification',
        description: 'Simplify phrasing',
      },
    ];

    for (const { pattern, replacement, type, description } of patterns) {
      const matches = message.match(pattern);
      if (matches) {
        const savings = matches.reduce((sum, match) => sum + (match.length - replacement.length), 0);
        if (savings > 0) {
          suggestions.push({
            type,
            description,
            example: `"${matches[0]}" → "${replacement}"`,
            potentialSavings: savings,
          });
          totalSavings += savings;
        }
      }
    }

    return { suggestions, totalPotentialSavings: totalSavings };
  }

  /**
   * Validate compression quality
   */
  validateCompressionQuality(
    original: string,
    compressed: string,
    minQualityScore: number = 80
  ): {
    isValid: boolean;
    qualityScore: number;
    issues: string[];
    recommendations: string[];
  } {
    const qualityScore = this.calculateQualityScore(original, compressed);
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check for critical information loss
    const originalWords = original.toLowerCase().split(/\s+/);
    const compressedWords = compressed.toLowerCase().split(/\s+/);

    // Check for lost numbers
    const originalNumbers = original.match(/\d+/g) || [];
    const compressedNumbers = compressed.match(/\d+/g) || [];
    if (originalNumbers.length !== compressedNumbers.length) {
      issues.push('Important numbers may have been removed');
      recommendations.push('Preserve all numeric values');
    }

    // Check for lost action words
    const actionWords = ['reply', 'click', 'visit', 'open', 'start', 'continue'];
    const lostActions = actionWords.filter(word =>
      originalWords.includes(word) && !compressedWords.includes(word)
    );
    if (lostActions.length > 0) {
      issues.push(`Lost action words: ${lostActions.join(', ')}`);
      recommendations.push('Preserve call-to-action words');
    }

    // Check compression ratio
    const ratio = compressed.length / original.length;
    if (ratio < 0.5) {
      issues.push('Compression may be too aggressive');
      recommendations.push('Use more conservative compression settings');
    }

    return {
      isValid: qualityScore >= minQualityScore && issues.length === 0,
      qualityScore,
      issues,
      recommendations,
    };
  }

  /**
   * Private helper methods
   */
  private applyContextSpecificCompression(message: string, contextType: string): string {
    const patterns = this.contextPatterns.get(contextType) || [];
    let compressed = message;

    for (const template of patterns.sort((a, b) => b.priority - a.priority)) {
      if (typeof template.replacement === 'string') {
        compressed = compressed.replace(template.pattern, template.replacement);
      } else {
        compressed = compressed.replace(template.pattern, template.replacement);
      }
    }

    return compressed;
  }

  private applyGeneralCompression(message: string, options: CompressionOptions): string {
    let compressed = message;

    // Apply general templates based on aggressiveness
    const aggressiveness = options.aggressiveness || 'moderate';
    const maxPriority = aggressiveness === 'conservative' ? 5 :
                       aggressiveness === 'moderate' ? 7 : 10;

    const applicableTemplates = this.compressionTemplates.filter(t => t.priority <= maxPriority);

    for (const template of applicableTemplates.sort((a, b) => b.priority - a.priority)) {
      if (typeof template.replacement === 'string') {
        compressed = compressed.replace(template.pattern, template.replacement);
      } else {
        compressed = compressed.replace(template.pattern, template.replacement);
      }
    }

    return compressed;
  }

  private applySmartAbbreviations(message: string, options: CompressionOptions): string {
    let compressed = message;

    // Apply abbreviations based on user segment
    const userSegment = options.userSegment || 'medium_value';
    const useAggressive = userSegment === 'low_value' || options.aggressiveness === 'aggressive';

    for (const [phrase, abbreviation] of this.abbreviationMap) {
      // Conservative abbreviations for high-value users
      if (!useAggressive && phrase.length - abbreviation.length < 3) {
        continue;
      }

      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      compressed = compressed.replace(regex, abbreviation);
    }

    return compressed;
  }

  private optimizeEmojis(message: string): string {
    let optimized = message;

    // Replace emoji phrases with actual emojis
    for (const [phrase, emoji] of this.emojiShortcuts) {
      const regex = new RegExp(phrase, 'gi');
      if (optimized.match(regex)) {
        optimized = optimized.replace(regex, emoji);
      }
    }

    // Remove duplicate emojis
    optimized = optimized.replace(/([^\w\s])\1+/g, '$1');

    return optimized;
  }

  private optimizeLinks(message: string): string {
    // Simulate URL shortening (in real implementation, integrate with URL shortener)
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return message.replace(urlPattern, (url) => {
      // Simulate shortening long URLs
      if (url.length > 30) {
        return url.substring(0, 25) + '...'; // Simulate shortened URL
      }
      return url;
    });
  }

  private applyAdvancedCompression(message: string, options: CompressionOptions): string {
    let compressed = message;
    const maxLength = options.maxLength!;

    if (compressed.length <= maxLength) {
      return compressed;
    }

    // Advanced techniques for extreme compression
    // 1. Remove articles
    compressed = compressed.replace(/\b(a|an|the)\s+/gi, '');

    // 2. Remove filler words
    const fillers = ['very', 'really', 'quite', 'just', 'actually', 'basically'];
    for (const filler of fillers) {
      const regex = new RegExp(`\\b${filler}\\s+`, 'gi');
      compressed = compressed.replace(regex, '');
    }

    // 3. Aggressive abbreviations
    compressed = compressed
      .replace(/\byou\b/gi, 'u')
      .replace(/\byour\b/gi, 'ur')
      .replace(/\band\b/gi, '&')
      .replace(/\bwith\b/gi, 'w/')
      .replace(/\bfor\b/gi, '4')
      .replace(/\bto\b/gi, '2');

    // 4. If still too long, truncate with ellipsis
    if (compressed.length > maxLength) {
      compressed = compressed.substring(0, maxLength - 3) + '...';
    }

    return compressed;
  }

  private calculateSMSSegments(message: string): number {
    // SMS segment calculation
    // GSM 7-bit: 160 characters per segment
    // UCS-2 (Unicode): 70 characters per segment
    const hasUnicode = /[^\x00-\x7F]/.test(message);
    const maxLength = hasUnicode ? 70 : 160;
    return Math.ceil(message.length / maxLength);
  }

  private calculateQualityScore(
    original: string,
    compressed: string,
    options: CompressionOptions = {}
  ): number {
    let score = 100;

    // Deduct points for significant length reduction
    const lengthRatio = compressed.length / original.length;
    if (lengthRatio < 0.5) {
      score -= 20; // Heavy compression penalty
    } else if (lengthRatio < 0.7) {
      score -= 10; // Moderate compression penalty
    }

    // Check for preserved key elements
    const originalWords = original.toLowerCase().split(/\s+/);
    const compressedWords = compressed.toLowerCase().split(/\s+/);

    // Important words that should be preserved
    const importantWords = ['study', 'streak', 'goal', 'deadline', 'practice', 'question'];
    const preservedImportant = importantWords.filter(word =>
      originalWords.includes(word) && compressedWords.includes(word)
    );
    const importantPreservationRatio = preservedImportant.length / importantWords.filter(w => originalWords.includes(w)).length;
    score *= importantPreservationRatio;

    // Check for preserved numbers
    const originalNumbers = original.match(/\d+/g) || [];
    const compressedNumbers = compressed.match(/\d+/g) || [];
    if (originalNumbers.length > 0) {
      const numberPreservationRatio = compressedNumbers.length / originalNumbers.length;
      score *= numberPreservationRatio;
    }

    // Bonus for maintaining readability
    if (compressed.split(/\s+/).length >= 3) {
      score += 5; // Bonus for maintaining sentence structure
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private initializeCompressionTemplates(): CompressionTemplate[] {
    return [
      // Priority 10 (Aggressive)
      {
        type: 'contraction_aggressive',
        pattern: /\b(you are)\b/gi,
        replacement: "you're",
        priority: 10,
        preserveContext: false,
      },
      {
        type: 'contraction_aggressive',
        pattern: /\b(it is)\b/gi,
        replacement: "it's",
        priority: 10,
        preserveContext: false,
      },
      {
        type: 'contraction_aggressive',
        pattern: /\b(we are)\b/gi,
        replacement: "we're",
        priority: 10,
        preserveContext: false,
      },

      // Priority 8 (Moderate)
      {
        type: 'redundancy_removal',
        pattern: /\b(questions to practice)\b/gi,
        replacement: 'questions',
        priority: 8,
        preserveContext: true,
      },
      {
        type: 'simplification',
        pattern: /\b(time to study)\b/gi,
        replacement: 'study time',
        priority: 8,
        preserveContext: true,
      },
      {
        type: 'simplification',
        pattern: /\b(your study session)\b/gi,
        replacement: 'your session',
        priority: 8,
        preserveContext: true,
      },

      // Priority 6 (Conservative)
      {
        type: 'article_removal',
        pattern: /\b(a quick)\b/gi,
        replacement: 'quick',
        priority: 6,
        preserveContext: true,
      },
      {
        type: 'filler_removal',
        pattern: /\b(just)\s+/gi,
        replacement: '',
        priority: 6,
        preserveContext: false,
      },

      // Priority 4 (Very Conservative)
      {
        type: 'polite_removal',
        pattern: /\b(please)\s+/gi,
        replacement: '',
        priority: 4,
        preserveContext: false,
      },
    ];
  }

  private initializeContextPatterns(): Map<string, CompressionTemplate[]> {
    const patterns = new Map<string, CompressionTemplate[]>();

    // Study reminder patterns
    patterns.set('reminder', [
      {
        type: 'reminder_specific',
        pattern: /Time to study!/gi,
        replacement: 'Study time!',
        priority: 9,
        preserveContext: true,
      },
      {
        type: 'reminder_specific',
        pattern: /Ready for your (.+)-minute study session/gi,
        replacement: 'Ready for $1min session',
        priority: 8,
        preserveContext: true,
      },
    ]);

    // Streak patterns
    patterns.set('streak', [
      {
        type: 'streak_specific',
        pattern: /Your (.+)-day streak is waiting/gi,
        replacement: '$1-day streak waiting',
        priority: 8,
        preserveContext: true,
      },
      {
        type: 'streak_specific',
        pattern: /streak ends in (.+)h/gi,
        replacement: 'streak ends in $1h',
        priority: 9,
        preserveContext: true,
      },
    ]);

    // Goal deadline patterns
    patterns.set('deadline', [
      {
        type: 'deadline_specific',
        pattern: /(.+) days left for your goal/gi,
        replacement: '$1 days left',
        priority: 8,
        preserveContext: true,
      },
      {
        type: 'deadline_specific',
        pattern: /You're at (.+)% progress/gi,
        replacement: '$1% done',
        priority: 8,
        preserveContext: true,
      },
    ]);

    // Achievement patterns
    patterns.set('achievement', [
      {
        type: 'achievement_specific',
        pattern: /Congratulations!/gi,
        replacement: 'Congrats!',
        priority: 7,
        preserveContext: true,
      },
      {
        type: 'achievement_specific',
        pattern: /You have unlocked/gi,
        replacement: 'Unlocked',
        priority: 8,
        preserveContext: true,
      },
    ]);

    return patterns;
  }

  private initializeAbbreviationMap(): Map<string, string> {
    return new Map([
      // Conservative abbreviations
      ['information', 'info'],
      ['application', 'app'],
      ['questions', 'qs'],
      ['minutes', 'min'],
      ['seconds', 'sec'],
      ['percentage', '%'],
      ['approximately', '~'],

      // Moderate abbreviations
      ['tomorrow', 'tmrw'],
      ['tonight', 'tnght'],
      ['because', 'bc'],
      ['without', 'w/o'],
      ['between', 'btw'],

      // Aggressive abbreviations
      ['before', 'b4'],
      ['great', 'gr8'],
      ['later', 'l8r'],
      ['today', '2day'],
      ['through', 'thru'],
    ]);
  }

  private initializeEmojiShortcuts(): Map<string, string> {
    return new Map([
      ['fire', '🔥'],
      ['star', '⭐'],
      ['trophy', '🏆'],
      ['target', '🎯'],
      ['brain', '🧠'],
      ['book', '📚'],
      ['chart', '📊'],
      ['warning', '⚠️'],
      ['time', '⏰'],
      ['good luck', '🍀'],
      ['celebration', '🎉'],
      ['thumbs up', '👍'],
      ['check mark', '✅'],
      ['lightning', '⚡'],
      ['rocket', '🚀'],
    ]);
  }
}

export default SMSCompressionEngine;