/**
 * Smart SMS Batching System
 * MELLOWISE-015: Intelligent message grouping for cost and delivery optimization
 */

import { createServerClient } from '@/lib/supabase/server';
import { addMinutes, differenceInMinutes, format, parseISO } from 'date-fns';
import { NotificationType, NotificationPriority } from '@/types/notifications';

/**
 * Batching types and interfaces
 */
export interface SMSBatch {
  id: string;
  tenantId: string;
  batchType: 'time_window' | 'content_similarity' | 'user_segment' | 'geographic';
  priority: NotificationPriority;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  messages: SMSBatchMessage[];
  scheduledFor: string;
  createdAt: string;
  sentAt?: string;
  metadata: {
    estimatedCost: number; // USD cents
    estimatedSavings: number; // vs individual sends
    deliveryWindow: {
      start: string;
      end: string;
    };
    groupingReason: string;
    segmentInfo?: {
      segment: string;
      userCount: number;
    };
  };
}

export interface SMSBatchMessage {
  id: string;
  userId: string;
  phoneNumber: string;
  messageType: NotificationType;
  originalMessage: string;
  optimizedMessage?: string;
  personalizedData: Record<string, any>;
  estimatedCost: number;
  deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
}

export interface BatchingOptions {
  enableTimeBatching: boolean;
  enableContentBatching: boolean;
  enableSegmentBatching: boolean;
  enableGeographicBatching: boolean;
  timeWindow: {
    minMinutes: number; // Minimum wait time
    maxMinutes: number; // Maximum wait time
    optimalMinutes: number; // Preferred batching window
  };
  batchSize: {
    min: number; // Minimum messages per batch
    max: number; // Maximum messages per batch
    optimal: number; // Preferred batch size
  };
  similarity: {
    contentThreshold: number; // 0-1, minimum similarity for content batching
    templateThreshold: number; // 0-1, minimum similarity for template batching
  };
  costOptimization: {
    minSavingsThreshold: number; // Minimum savings to trigger batching
    maxDelayForSavings: number; // Maximum delay in minutes for cost savings
  };
}

export interface BatchingAnalytics {
  tenantId: string;
  period: string; // YYYY-MM
  metrics: {
    totalBatches: number;
    totalMessages: number;
    avgBatchSize: number;
    totalSavings: number; // USD cents
    avgDelayMinutes: number;
    deliverySuccessRate: number;
  };
  breakdown: {
    byType: Record<string, {
      batches: number;
      messages: number;
      savings: number;
    }>;
    bySegment: Record<string, {
      batches: number;
      messages: number;
      avgDelay: number;
    }>;
    byTimeOfDay: Array<{
      hour: number;
      batches: number;
      avgSize: number;
      savings: number;
    }>;
  };
  optimization: {
    efficiencyScore: number; // 0-100
    recommendations: string[];
  };
}

/**
 * Smart SMS Batching System
 * Groups messages intelligently to reduce costs while maintaining timely delivery
 */
export class SMSBatchingService {
  private supabase;
  private batchingOptions: BatchingOptions;

  constructor() {
    this.supabase = createServerClient();
    this.batchingOptions = this.getDefaultBatchingOptions();
  }

  /**
   * Add message to batching queue
   */
  async queueMessageForBatching(
    tenantId: string,
    message: Omit<SMSBatchMessage, 'id' | 'estimatedCost'>,
    scheduledFor: string,
    priority: NotificationPriority = 'medium'
  ): Promise<{
    batchId?: string;
    estimatedDelay: number; // minutes
    estimatedSavings: number; // USD cents
    shouldBatch: boolean;
  }> {
    // Calculate estimated cost for individual send
    const estimatedCost = this.calculateMessageCost(message.originalMessage, message.phoneNumber);

    const messageWithCost: SMSBatchMessage = {
      ...message,
      id: crypto.randomUUID(),
      estimatedCost,
    };

    // Check if batching is beneficial
    const batchingDecision = await this.decideBatchingStrategy(
      tenantId,
      messageWithCost,
      scheduledFor,
      priority
    );

    if (!batchingDecision.shouldBatch) {
      // Send immediately
      await this.sendImmediately(tenantId, messageWithCost);
      return {
        estimatedDelay: 0,
        estimatedSavings: 0,
        shouldBatch: false,
      };
    }

    // Find or create appropriate batch
    const batch = await this.findOrCreateBatch(
      tenantId,
      messageWithCost,
      scheduledFor,
      priority,
      batchingDecision.strategy
    );

    // Add message to batch
    await this.addMessageToBatch(batch.id, messageWithCost);

    // Check if batch is ready for sending
    await this.checkBatchReadiness(batch.id);

    return {
      batchId: batch.id,
      estimatedDelay: batchingDecision.estimatedDelay,
      estimatedSavings: batchingDecision.estimatedSavings,
      shouldBatch: true,
    };
  }

  /**
   * Process ready batches for sending
   */
  async processReadyBatches(tenantId?: string): Promise<{
    processed: number;
    sent: number;
    failed: number;
  }> {
    const whereClause = tenantId ? { tenant_id: tenantId } : {};

    // Get batches ready for processing
    const { data: readyBatches, error } = await this.supabase
      .from('sms_batches')
      .select(`
        *,
        sms_batch_messages (*)
      `)
      .match({
        ...whereClause,
        status: 'pending'
      })
      .lte('scheduled_for', new Date().toISOString());

    if (error) {
      console.error('Failed to fetch ready batches:', error);
      return { processed: 0, sent: 0, failed: 0 };
    }

    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const batchData of readyBatches || []) {
      processed++;

      try {
        const batch = this.mapBatchData(batchData);
        const result = await this.processBatch(batch);

        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to process batch ${batchData.id}:`, error);
        failed++;
      }
    }

    return { processed, sent, failed };
  }

  /**
   * Get batching analytics
   */
  async getBatchingAnalytics(
    tenantId: string,
    period?: string
  ): Promise<BatchingAnalytics> {
    const targetPeriod = period || format(new Date(), 'yyyy-MM');
    const startDate = `${targetPeriod}-01T00:00:00Z`;
    const endDate = format(new Date(new Date(`${targetPeriod}-01`).getTime() + 32 * 24 * 60 * 60 * 1000), 'yyyy-MM-01T00:00:00Z');

    // Get batch data
    const { data: batches } = await this.supabase
      .from('sms_batches')
      .select(`
        *,
        sms_batch_messages (*)
      `)
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate)
      .lt('created_at', endDate);

    const batchData = batches || [];
    const totalBatches = batchData.length;
    const totalMessages = batchData.reduce((sum, batch) => sum + (batch.sms_batch_messages?.length || 0), 0);
    const totalSavings = batchData.reduce((sum, batch) => sum + (batch.metadata?.estimatedSavings || 0), 0);

    // Calculate metrics
    const avgBatchSize = totalBatches > 0 ? Math.round(totalMessages / totalBatches) : 0;
    const avgDelayMinutes = this.calculateAverageDelay(batchData);
    const deliverySuccessRate = this.calculateDeliverySuccessRate(batchData);

    // Calculate breakdowns
    const byType = this.calculateTypeBreakdown(batchData);
    const bySegment = this.calculateSegmentBreakdown(batchData);
    const byTimeOfDay = this.calculateTimeBreakdown(batchData);

    // Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore({
      totalSavings,
      avgDelayMinutes,
      deliverySuccessRate,
      avgBatchSize,
    });

    const recommendations = this.generateBatchingRecommendations({
      efficiencyScore,
      avgDelayMinutes,
      avgBatchSize,
      deliverySuccessRate,
    });

    return {
      tenantId,
      period: targetPeriod,
      metrics: {
        totalBatches,
        totalMessages,
        avgBatchSize,
        totalSavings,
        avgDelayMinutes,
        deliverySuccessRate,
      },
      breakdown: {
        byType,
        bySegment,
        byTimeOfDay,
      },
      optimization: {
        efficiencyScore,
        recommendations,
      },
    };
  }

  /**
   * Update batching options for a tenant
   */
  async updateBatchingOptions(
    tenantId: string,
    options: Partial<BatchingOptions>
  ): Promise<void> {
    const currentOptions = await this.getBatchingOptions(tenantId);
    const updatedOptions = { ...currentOptions, ...options };

    const { error } = await this.supabase
      .from('sms_batching_settings')
      .upsert({
        tenant_id: tenantId,
        options: updatedOptions,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id'
      });

    if (error) {
      console.error('Failed to update batching options:', error);
      throw error;
    }

    this.batchingOptions = updatedOptions;
  }

  /**
   * Get current batching options for a tenant
   */
  async getBatchingOptions(tenantId: string): Promise<BatchingOptions> {
    const { data, error } = await this.supabase
      .from('sms_batching_settings')
      .select('options')
      .eq('tenant_id', tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to get batching options:', error);
      throw error;
    }

    return data?.options || this.getDefaultBatchingOptions();
  }

  /**
   * Private helper methods
   */
  private async decideBatchingStrategy(
    tenantId: string,
    message: SMSBatchMessage,
    scheduledFor: string,
    priority: NotificationPriority
  ): Promise<{
    shouldBatch: boolean;
    strategy?: 'time_window' | 'content_similarity' | 'user_segment' | 'geographic';
    estimatedDelay: number;
    estimatedSavings: number;
  }> {
    const options = await this.getBatchingOptions(tenantId);

    // Critical priority messages are never batched
    if (priority === 'critical') {
      return {
        shouldBatch: false,
        estimatedDelay: 0,
        estimatedSavings: 0,
      };
    }

    // Check if immediate send is scheduled (within next 5 minutes)
    const scheduledTime = parseISO(scheduledFor);
    const minutesUntilSend = differenceInMinutes(scheduledTime, new Date());

    if (minutesUntilSend <= 5) {
      return {
        shouldBatch: false,
        estimatedDelay: 0,
        estimatedSavings: 0,
      };
    }

    // Find existing compatible batches
    const compatibleBatch = await this.findCompatibleBatch(tenantId, message, scheduledFor);

    if (compatibleBatch) {
      const estimatedSavings = this.calculateBatchingSavings(
        message.estimatedCost,
        compatibleBatch.messages.length + 1
      );

      return {
        shouldBatch: true,
        strategy: compatibleBatch.batchType,
        estimatedDelay: Math.max(0, differenceInMinutes(parseISO(compatibleBatch.scheduledFor), scheduledTime)),
        estimatedSavings,
      };
    }

    // Determine best batching strategy
    const strategy = this.selectBatchingStrategy(message, options);

    if (!strategy) {
      return {
        shouldBatch: false,
        estimatedDelay: 0,
        estimatedSavings: 0,
      };
    }

    // Estimate potential benefits
    const estimatedDelay = options.timeWindow.optimalMinutes;
    const estimatedSavings = this.calculateBatchingSavings(message.estimatedCost, options.batchSize.optimal);

    // Check if savings justify delay
    if (estimatedSavings < options.costOptimization.minSavingsThreshold ||
        estimatedDelay > options.costOptimization.maxDelayForSavings) {
      return {
        shouldBatch: false,
        estimatedDelay: 0,
        estimatedSavings: 0,
      };
    }

    return {
      shouldBatch: true,
      strategy,
      estimatedDelay,
      estimatedSavings,
    };
  }

  private async findCompatibleBatch(
    tenantId: string,
    message: SMSBatchMessage,
    scheduledFor: string
  ): Promise<SMSBatch | null> {
    const options = await this.getBatchingOptions(tenantId);
    const scheduledTime = parseISO(scheduledFor);

    // Find batches within time window
    const windowStart = addMinutes(scheduledTime, -options.timeWindow.maxMinutes);
    const windowEnd = addMinutes(scheduledTime, options.timeWindow.maxMinutes);

    const { data: candidateBatches } = await this.supabase
      .from('sms_batches')
      .select(`
        *,
        sms_batch_messages (*)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'pending')
      .gte('scheduled_for', windowStart.toISOString())
      .lte('scheduled_for', windowEnd.toISOString())
      .lt('messages_count', options.batchSize.max);

    if (!candidateBatches || candidateBatches.length === 0) {
      return null;
    }

    // Score compatibility for each batch
    let bestBatch: SMSBatch | null = null;
    let bestScore = 0;

    for (const batchData of candidateBatches) {
      const batch = this.mapBatchData(batchData);
      const score = this.calculateCompatibilityScore(message, batch, options);

      if (score > bestScore && score > 0.6) { // Minimum compatibility threshold
        bestScore = score;
        bestBatch = batch;
      }
    }

    return bestBatch;
  }

  private selectBatchingStrategy(
    message: SMSBatchMessage,
    options: BatchingOptions
  ): 'time_window' | 'content_similarity' | 'user_segment' | 'geographic' | null {
    // Priority order based on effectiveness
    if (options.enableContentBatching && this.hasTemplatePattern(message.originalMessage)) {
      return 'content_similarity';
    }

    if (options.enableSegmentBatching) {
      return 'user_segment';
    }

    if (options.enableTimeBatching) {
      return 'time_window';
    }

    if (options.enableGeographicBatching) {
      return 'geographic';
    }

    return null;
  }

  private calculateCompatibilityScore(
    message: SMSBatchMessage,
    batch: SMSBatch,
    options: BatchingOptions
  ): number {
    let score = 0;

    // Time compatibility (0-0.3)
    const timeScore = this.calculateTimeCompatibility(message, batch, options);
    score += timeScore * 0.3;

    // Content compatibility (0-0.4)
    const contentScore = this.calculateContentCompatibility(message, batch, options);
    score += contentScore * 0.4;

    // User segment compatibility (0-0.2)
    const segmentScore = this.calculateSegmentCompatibility(message, batch);
    score += segmentScore * 0.2;

    // Priority compatibility (0-0.1)
    const priorityScore = batch.priority === 'low' || message.messageType === batch.messages[0]?.messageType ? 1 : 0.5;
    score += priorityScore * 0.1;

    return score;
  }

  private calculateTimeCompatibility(
    message: SMSBatchMessage,
    batch: SMSBatch,
    options: BatchingOptions
  ): number {
    // Already checked in findCompatibleBatch, so this is always compatible
    return 1;
  }

  private calculateContentCompatibility(
    message: SMSBatchMessage,
    batch: SMSBatch,
    options: BatchingOptions
  ): number {
    if (batch.messages.length === 0) return 1;

    const batchMessage = batch.messages[0];

    // Type compatibility
    if (message.messageType === batchMessage.messageType) {
      return 1;
    }

    // Template similarity
    const similarity = this.calculateMessageSimilarity(
      message.originalMessage,
      batchMessage.originalMessage
    );

    return similarity >= options.similarity.contentThreshold ? similarity : 0;
  }

  private calculateSegmentCompatibility(
    message: SMSBatchMessage,
    batch: SMSBatch
  ): number {
    // For now, assume all messages in same batch are compatible
    // In real implementation, check user segments
    return 0.8;
  }

  private calculateMessageSimilarity(message1: string, message2: string): number {
    // Simple similarity calculation based on common words
    const words1 = new Set(message1.toLowerCase().split(/\s+/));
    const words2 = new Set(message2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private hasTemplatePattern(message: string): boolean {
    // Check if message contains template variables or common patterns
    const templatePatterns = [
      /\{[\w_]+\}/, // Template variables like {userName}
      /\b\d+\b.*\b(questions?|minutes?|days?|hours?)\b/, // Numbers with units
      /\b(streak|goal|deadline|session)\b/i, // Common notification terms
    ];

    return templatePatterns.some(pattern => pattern.test(message));
  }

  private async findOrCreateBatch(
    tenantId: string,
    message: SMSBatchMessage,
    scheduledFor: string,
    priority: NotificationPriority,
    strategy: string
  ): Promise<SMSBatch> {
    // Try to find compatible batch first
    const existingBatch = await this.findCompatibleBatch(tenantId, message, scheduledFor);

    if (existingBatch) {
      return existingBatch;
    }

    // Create new batch
    const options = await this.getBatchingOptions(tenantId);
    const scheduledTime = parseISO(scheduledFor);
    const batchScheduledTime = addMinutes(scheduledTime, options.timeWindow.optimalMinutes);

    const batch: SMSBatch = {
      id: crypto.randomUUID(),
      tenantId,
      batchType: strategy as any,
      priority,
      status: 'pending',
      messages: [],
      scheduledFor: batchScheduledTime.toISOString(),
      createdAt: new Date().toISOString(),
      metadata: {
        estimatedCost: 0,
        estimatedSavings: 0,
        deliveryWindow: {
          start: scheduledTime.toISOString(),
          end: addMinutes(batchScheduledTime, 30).toISOString(),
        },
        groupingReason: this.getGroupingReason(strategy),
      },
    };

    // Save to database
    await this.saveBatch(batch);

    return batch;
  }

  private async addMessageToBatch(batchId: string, message: SMSBatchMessage): Promise<void> {
    const { error } = await this.supabase
      .from('sms_batch_messages')
      .insert({
        id: message.id,
        batch_id: batchId,
        user_id: message.userId,
        phone_number: message.phoneNumber,
        message_type: message.messageType,
        original_message: message.originalMessage,
        optimized_message: message.optimizedMessage,
        personalized_data: message.personalizedData,
        estimated_cost: message.estimatedCost,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to add message to batch:', error);
      throw error;
    }

    // Update batch metadata
    await this.updateBatchMetadata(batchId);
  }

  private async updateBatchMetadata(batchId: string): Promise<void> {
    const { data: batch } = await this.supabase
      .from('sms_batches')
      .select(`
        *,
        sms_batch_messages (*)
      `)
      .eq('id', batchId)
      .single();

    if (!batch) return;

    const messages = batch.sms_batch_messages || [];
    const totalCost = messages.reduce((sum: number, msg: any) => sum + (msg.estimated_cost || 0), 0);
    const estimatedSavings = this.calculateBatchingSavings(totalCost, messages.length);

    await this.supabase
      .from('sms_batches')
      .update({
        messages_count: messages.length,
        metadata: {
          ...batch.metadata,
          estimatedCost: totalCost,
          estimatedSavings,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', batchId);
  }

  private async checkBatchReadiness(batchId: string): Promise<void> {
    const { data: batch } = await this.supabase
      .from('sms_batches')
      .select(`
        *,
        sms_batch_messages (*)
      `)
      .eq('id', batchId)
      .single();

    if (!batch) return;

    const options = await this.getBatchingOptions(batch.tenant_id);
    const messageCount = batch.sms_batch_messages?.length || 0;
    const createdAt = parseISO(batch.created_at);
    const minutesSinceCreation = differenceInMinutes(new Date(), createdAt);

    // Check if batch should be sent
    const shouldSend =
      messageCount >= options.batchSize.optimal ||
      messageCount >= options.batchSize.max ||
      minutesSinceCreation >= options.timeWindow.maxMinutes;

    if (shouldSend) {
      // Update scheduled time to now for immediate processing
      await this.supabase
        .from('sms_batches')
        .update({
          scheduled_for: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', batchId);
    }
  }

  private async processBatch(batch: SMSBatch): Promise<{ success: boolean; error?: string }> {
    try {
      // Mark batch as processing
      await this.supabase
        .from('sms_batches')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', batch.id);

      // Send messages (this would integrate with TwilioSMSService)
      const results = await this.sendBatchMessages(batch.messages);

      const successCount = results.filter(r => r.success).length;
      const status = successCount === batch.messages.length ? 'sent' :
                    successCount > 0 ? 'sent' : 'failed';

      // Update batch status
      await this.supabase
        .from('sms_batches')
        .update({
          status,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', batch.id);

      return { success: status === 'sent' };
    } catch (error) {
      console.error(`Failed to process batch ${batch.id}:`, error);

      await this.supabase
        .from('sms_batches')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', batch.id);

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async sendBatchMessages(messages: SMSBatchMessage[]): Promise<Array<{ success: boolean; messageId: string }>> {
    // This would integrate with TwilioSMSService for actual sending
    // For now, simulate sending
    const results: Array<{ success: boolean; messageId: string }> = [];

    for (const message of messages) {
      // Simulate 95% success rate
      const success = Math.random() > 0.05;

      results.push({
        success,
        messageId: message.id,
      });

      // Update message status
      await this.supabase
        .from('sms_batch_messages')
        .update({
          delivery_status: success ? 'sent' : 'failed',
          sent_at: success ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', message.id);
    }

    return results;
  }

  private async sendImmediately(tenantId: string, message: SMSBatchMessage): Promise<void> {
    // This would integrate with TwilioSMSService for immediate sending
    // For now, just log
    console.log(`Sending message immediately for tenant ${tenantId}:`, message.id);
  }

  private calculateMessageCost(message: string, phoneNumber: string): number {
    // Simulate cost calculation (in cents)
    const segments = Math.ceil(message.length / 160); // SMS segments
    const baseCostPerSegment = 75; // 0.75 cents per segment

    // Adjust for country (simplified)
    const countryMultiplier = phoneNumber.startsWith('+1') ? 1 : 1.5;

    return Math.round(segments * baseCostPerSegment * countryMultiplier);
  }

  private calculateBatchingSavings(totalCost: number, batchSize: number): number {
    // Estimate savings from batching
    // Typical savings: 5-15% depending on batch size
    const savingsPercentage = Math.min(15, 5 + (batchSize - 1) * 0.5);
    return Math.round(totalCost * (savingsPercentage / 100));
  }

  private getGroupingReason(strategy: string): string {
    const reasons = {
      time_window: 'Messages grouped within optimal time window',
      content_similarity: 'Messages with similar content batched together',
      user_segment: 'Messages grouped by user engagement segment',
      geographic: 'Messages grouped by geographic region',
    };
    return reasons[strategy as keyof typeof reasons] || 'Optimized grouping';
  }

  private async saveBatch(batch: SMSBatch): Promise<void> {
    const { error } = await this.supabase
      .from('sms_batches')
      .insert({
        id: batch.id,
        tenant_id: batch.tenantId,
        batch_type: batch.batchType,
        priority: batch.priority,
        status: batch.status,
        scheduled_for: batch.scheduledFor,
        messages_count: 0,
        metadata: batch.metadata,
        created_at: batch.createdAt,
      });

    if (error) {
      console.error('Failed to save batch:', error);
      throw error;
    }
  }

  private mapBatchData(batchData: any): SMSBatch {
    return {
      id: batchData.id,
      tenantId: batchData.tenant_id,
      batchType: batchData.batch_type,
      priority: batchData.priority,
      status: batchData.status,
      messages: (batchData.sms_batch_messages || []).map((msg: any) => ({
        id: msg.id,
        userId: msg.user_id,
        phoneNumber: msg.phone_number,
        messageType: msg.message_type,
        originalMessage: msg.original_message,
        optimizedMessage: msg.optimized_message,
        personalizedData: msg.personalized_data || {},
        estimatedCost: msg.estimated_cost || 0,
        deliveryStatus: msg.delivery_status,
        sentAt: msg.sent_at,
        deliveredAt: msg.delivered_at,
      })),
      scheduledFor: batchData.scheduled_for,
      createdAt: batchData.created_at,
      sentAt: batchData.sent_at,
      metadata: batchData.metadata || {},
    };
  }

  private calculateAverageDelay(batches: any[]): number {
    if (batches.length === 0) return 0;

    let totalDelay = 0;
    let count = 0;

    for (const batch of batches) {
      if (batch.sent_at && batch.created_at) {
        const delay = differenceInMinutes(parseISO(batch.sent_at), parseISO(batch.created_at));
        totalDelay += delay;
        count++;
      }
    }

    return count > 0 ? Math.round(totalDelay / count) : 0;
  }

  private calculateDeliverySuccessRate(batches: any[]): number {
    if (batches.length === 0) return 100;

    const successfulBatches = batches.filter(b => b.status === 'sent').length;
    return Math.round((successfulBatches / batches.length) * 100);
  }

  private calculateTypeBreakdown(batches: any[]): Record<string, { batches: number; messages: number; savings: number }> {
    const breakdown: Record<string, { batches: number; messages: number; savings: number }> = {};

    for (const batch of batches) {
      const type = batch.batch_type || 'unknown';
      if (!breakdown[type]) {
        breakdown[type] = { batches: 0, messages: 0, savings: 0 };
      }
      breakdown[type].batches++;
      breakdown[type].messages += batch.messages_count || 0;
      breakdown[type].savings += batch.metadata?.estimatedSavings || 0;
    }

    return breakdown;
  }

  private calculateSegmentBreakdown(batches: any[]): Record<string, { batches: number; messages: number; avgDelay: number }> {
    // Simplified implementation
    return {
      high_value: { batches: 0, messages: 0, avgDelay: 0 },
      medium_value: { batches: 0, messages: 0, avgDelay: 0 },
      low_value: { batches: 0, messages: 0, avgDelay: 0 },
    };
  }

  private calculateTimeBreakdown(batches: any[]): Array<{ hour: number; batches: number; avgSize: number; savings: number }> {
    const breakdown = new Map<number, { batches: number; totalMessages: number; savings: number }>();

    for (const batch of batches) {
      const hour = new Date(batch.created_at).getHours();
      if (!breakdown.has(hour)) {
        breakdown.set(hour, { batches: 0, totalMessages: 0, savings: 0 });
      }
      const data = breakdown.get(hour)!;
      data.batches++;
      data.totalMessages += batch.messages_count || 0;
      data.savings += batch.metadata?.estimatedSavings || 0;
    }

    return Array.from(breakdown.entries())
      .map(([hour, data]) => ({
        hour,
        batches: data.batches,
        avgSize: data.batches > 0 ? Math.round(data.totalMessages / data.batches) : 0,
        savings: data.savings,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  private calculateEfficiencyScore(metrics: {
    totalSavings: number;
    avgDelayMinutes: number;
    deliverySuccessRate: number;
    avgBatchSize: number;
  }): number {
    let score = 0;

    // Savings component (0-40 points)
    score += Math.min(40, metrics.totalSavings / 100); // 1 point per $1 saved

    // Delivery success component (0-30 points)
    score += (metrics.deliverySuccessRate / 100) * 30;

    // Efficiency component (0-20 points)
    const idealBatchSize = 5;
    const sizeEfficiency = Math.max(0, 1 - Math.abs(metrics.avgBatchSize - idealBatchSize) / idealBatchSize);
    score += sizeEfficiency * 20;

    // Delay penalty (0-10 points)
    const delayPenalty = Math.min(10, metrics.avgDelayMinutes / 6); // 1 point penalty per 6 minutes
    score = Math.max(0, score - delayPenalty);

    return Math.round(score);
  }

  private generateBatchingRecommendations(metrics: {
    efficiencyScore: number;
    avgDelayMinutes: number;
    avgBatchSize: number;
    deliverySuccessRate: number;
  }): string[] {
    const recommendations: string[] = [];

    if (metrics.efficiencyScore < 70) {
      recommendations.push('Consider adjusting batching parameters to improve efficiency');
    }

    if (metrics.avgDelayMinutes > 30) {
      recommendations.push('Reduce maximum batching window to improve delivery times');
    }

    if (metrics.avgBatchSize < 3) {
      recommendations.push('Increase minimum batch size for better cost savings');
    }

    if (metrics.deliverySuccessRate < 95) {
      recommendations.push('Investigate delivery failures and optimize message content');
    }

    return recommendations;
  }

  private getDefaultBatchingOptions(): BatchingOptions {
    return {
      enableTimeBatching: true,
      enableContentBatching: true,
      enableSegmentBatching: true,
      enableGeographicBatching: false,
      timeWindow: {
        minMinutes: 5,
        maxMinutes: 30,
        optimalMinutes: 15,
      },
      batchSize: {
        min: 2,
        max: 20,
        optimal: 5,
      },
      similarity: {
        contentThreshold: 0.7,
        templateThreshold: 0.8,
      },
      costOptimization: {
        minSavingsThreshold: 50, // 50 cents
        maxDelayForSavings: 45, // 45 minutes
      },
    };
  }
}

export default SMSBatchingService;