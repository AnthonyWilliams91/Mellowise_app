/**
 * Smart Notification and Reminder System Types
 * MELLOWISE-015: Intelligent reminders that adapt to schedule and progress
 */

export type NotificationChannel = 'email' | 'push' | 'in_app' | 'sms';

/**
 * Push notification specific types
 */
export interface PushSubscriptionInfo {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  ttl?: number;
}

export interface PushDeliveryResult {
  success: boolean;
  subscriptionId: string;
  endpoint: string;
  statusCode?: number;
  error?: string;
  retryAfter?: number;
  subscriptionExpired?: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  types: {
    studyReminders: boolean;
    goalDeadlines: boolean;
    streakMaintenance: boolean;
    achievements: boolean;
    breakReminders: boolean;
    performanceAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  devices: Array<{
    endpoint: string;
    userAgent: string;
    lastUsed: string;
    isActive: boolean;
  }>;
}
export type NotificationType =
  | 'study_reminder'
  | 'goal_deadline'
  | 'streak_maintenance'
  | 'achievement'
  | 'break_reminder'
  | 'performance_alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'adaptive';

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  id: string;
  userId: string;
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;
  };
  types: {
    studyReminders: boolean;
    goalDeadlines: boolean;
    streakMaintenance: boolean;
    achievements: boolean;
    breakReminders: boolean;
    performanceAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };
  frequency: {
    studyReminders: NotificationFrequency;
    goalDeadlines: NotificationFrequency;
    maxDailyNotifications: number;
  };
  smartDefaults: {
    useOptimalTiming: boolean;
    adaptToPerformance: boolean;
    spacedRepetition: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Base notification structure
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: NotificationChannel[];
  scheduledFor: string;
  sentAt?: string;
  readAt?: string;
  clickedAt?: string;
  metadata: {
    goalId?: string;
    sessionId?: string;
    streakCount?: number;
    performanceMetric?: number;
    topicId?: string;
  };
  createdAt: string;
}

/**
 * Smart scheduling algorithm data
 */
export interface SmartSchedulingData {
  userId: string;
  optimalStudyTimes: {
    dayOfWeek: number; // 0-6
    hourOfDay: number; // 0-23
    performanceScore: number; // 0-100
    sampleSize: number;
  }[];
  recentPerformance: {
    date: string;
    score: number;
    duration: number;
    topicId: string;
  }[];
  currentStreak: number;
  goalDeadlines: {
    goalId: string;
    deadline: string;
    progress: number;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }[];
  lastStudySession?: string;
  averageSessionGap: number; // hours
  learningVelocity: number; // questions per day
}

/**
 * Reminder scheduling rules
 */
export interface ReminderRule {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  triggerType: 'time_based' | 'performance_based' | 'goal_based' | 'streak_based';
  conditions: {
    // Time-based conditions
    timeOfDay?: string;
    daysOfWeek?: number[];
    hoursSinceLastSession?: number;

    // Performance-based conditions
    performanceBelow?: number;
    strugglingTopics?: string[];
    consecutiveIncorrect?: number;

    // Goal-based conditions
    daysUntilDeadline?: number;
    progressBehindSchedule?: boolean;
    goalCompletionRisk?: 'low' | 'medium' | 'high';

    // Streak-based conditions
    streakAtRisk?: boolean;
    streakMilestone?: number;
  };
  action: {
    type: NotificationType;
    template: string;
    priority: NotificationPriority;
    channels: NotificationChannel[];
  };
  frequency: {
    maxPerDay: number;
    minHoursBetween: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Spaced repetition scheduling
 */
export interface SpacedRepetitionSchedule {
  userId: string;
  topicId: string;
  lastReview: string;
  nextReview: string;
  interval: number; // days
  easeFactor: number; // 1.3 - 2.5
  repetitions: number;
  lapses: number;
}

/**
 * Notification template
 */
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  name: string;
  subject?: string; // For email
  titleTemplate: string;
  messageTemplate: string;
  variables: string[]; // Available template variables
  cta?: {
    text: string;
    action: string;
    url?: string;
  };
  tone: 'encouraging' | 'urgent' | 'celebratory' | 'informative' | 'gentle';
  includeStats: boolean;
  includeMotivation: boolean;
}

/**
 * Notification analytics
 */
export interface NotificationAnalytics {
  userId: string;
  period: string; // YYYY-MM
  metrics: {
    sent: number;
    opened: number;
    clicked: number;
    dismissed: number;
    optOut: number;
  };
  engagement: {
    byType: Record<NotificationType, {
      sent: number;
      openRate: number;
      clickRate: number;
    }>;
    byChannel: Record<NotificationChannel, {
      sent: number;
      openRate: number;
      clickRate: number;
    }>;
    byTime: {
      hour: number;
      sent: number;
      openRate: number;
    }[];
  };
  effectiveness: {
    studySessionsTriggered: number;
    goalsCompleted: number;
    streaksMaintained: number;
    averageResponseTime: number; // minutes
  };
}

/**
 * Burnout prevention tracking
 */
export interface BurnoutPrevention {
  userId: string;
  indicators: {
    consecutiveStudyDays: number;
    averageDailyHours: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
    frustrationScore: number; // 0-100 based on incorrect answers and time
    lastBreak: string;
    stressLevel: 'low' | 'moderate' | 'high';
  };
  recommendations: {
    suggestBreak: boolean;
    reduceIntensity: boolean;
    switchTopic: boolean;
    celebrateProgress: boolean;
  };
  interventions: {
    date: string;
    type: 'break_reminder' | 'encouragement' | 'topic_switch' | 'celebration';
    accepted: boolean;
  }[];
}

/**
 * Notification queue item
 */
export interface NotificationQueueItem {
  id: string;
  notification: Notification;
  retries: number;
  maxRetries: number;
  nextRetry?: string;
  error?: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
}

/**
 * API request/response types
 */
export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  scheduledFor?: string;
  channels?: NotificationChannel[];
  metadata?: Record<string, any>;
}

export interface UpdatePreferencesRequest {
  channels?: Partial<NotificationPreferences['channels']>;
  types?: Partial<NotificationPreferences['types']>;
  quietHours?: Partial<NotificationPreferences['quietHours']>;
  frequency?: Partial<NotificationPreferences['frequency']>;
  smartDefaults?: Partial<NotificationPreferences['smartDefaults']>;
}

export interface ScheduleOptimizationRequest {
  userId: string;
  lookAheadDays?: number;
  includeBreakReminders?: boolean;
  adaptToPerformance?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  notification?: Notification;
  error?: string;
}

// ===================================
// ERROR RECOVERY SYSTEM TYPES
// ===================================

/**
 * Error Recovery Configuration
 */
export interface ErrorRecoveryConfig {
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeout: number;
    halfOpenMaxCalls: number;
    monitoringWindow: number;
  };
  retry: {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    jitterEnabled: boolean;
  };
  healthCheck: {
    interval: number;
    timeout: number;
  };
  alerting: {
    webhookUrl?: string;
    slackChannel?: string;
    emailRecipients: string[];
  };
}

export type ErrorType = 'network' | 'authentication' | 'rate_limit' | 'resource_exhaustion' | 'database' | 'third_party' | 'unknown';
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'critical';
  latency: number;
  errorRate: number;
  lastCheck: string;
  details: Record<string, any>;
}

export interface RecoveryStrategy {
  type: 'retry' | 'fallback' | 'refresh_credentials' | 'backoff_and_retry' | 'resource_optimization' | 'database_recovery';
  retryCount: number;
  backoffMultiplier: number;
  maxBackoffTime: number;
  fallbackChannels: NotificationChannel[];
  escalationRules: Array<{
    condition: string;
    action: string;
  }>;
}

export interface ErrorClassification {
  type: ErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  transient: boolean;
  retryable: boolean;
  estimatedRecoveryTime: number;
}

export interface ErrorRecoveryMetrics {
  totalErrors: number;
  autoRecovered: number;
  manualInterventions: number;
  recoveryRate: number;
  errorsByType: Record<string, number>;
  meanTimeToRecovery: number;
  systemAvailability: number;
  circuitBreakerTrips: Record<string, { state: string; failures: number }>;
  fallbackUsage: Record<string, number>;
}

export interface SystemAlert {
  type: string;
  serviceId: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Retry Engine Types
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterType: JitterType;
  retryOnUnknownErrors: boolean;
  budget: RetryBudget;
}

export type BackoffStrategy = 'fixed' | 'linear' | 'exponential' | 'polynomial';
export type JitterType = 'none' | 'full' | 'equal' | 'decorrelated';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RetryPolicy {
  serviceId: string;
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffStrategy: BackoffStrategy;
  backoffMultiplier: number;
  jitterType: JitterType;
  priority: PriorityLevel;
  retryOnUnknownErrors: boolean;
  retryConfig?: {
    maxAttempts: number;
    backoffStrategy: BackoffStrategy;
  };
}

export interface RetryAttempt {
  attemptNumber: number;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface RetryBudget {
  windowMs: number;
  perPriority: Record<PriorityLevel, { maxAttempts: number }>;
  attempts: Array<{ timestamp: number; priority: PriorityLevel }>;
}

export interface RetryQueue {
  operationId: string;
  operation: () => Promise<any>;
  policy: RetryPolicy;
  nextAttemptTime: number;
  queuedAt: number;
}

export interface RetryMetrics {
  totalOperations: number;
  successfulRetries: number;
  failedRetries: number;
  successRate: number;
  averageAttemptsPerOperation: number;
  attemptsByService: Record<string, { total: number; successful: number; failed: number }>;
  budgetUtilization: Record<string, { consumed: number; remaining: number }>;
  currentQueueSize: Record<PriorityLevel, number>;
  timeWindow: number;
}

export interface RetryResult {
  success: boolean;
  attempts: number;
  totalDuration: number;
  error?: string;
}

/**
 * Dead Letter Queue Types
 */
export type FailureReason =
  | 'rate_limit_exceeded'
  | 'temporary_service_unavailable'
  | 'network_timeout'
  | 'authentication_failed'
  | 'invalid_recipient'
  | 'content_rejected'
  | 'quota_exceeded'
  | 'service_configuration_error'
  | 'unknown_error';

export type RecoveryAction =
  | 'retry_original'
  | 'retry_alternative_channel'
  | 'modify_and_retry'
  | 'mark_resolved'
  | 'permanent_failure'
  | 'escalate';

export type ManualReviewStatus = 'pending_review' | 'in_review' | 'resolved' | 'manual_review_failed' | 'scheduled_retry';
export type ExportFormat = 'json' | 'csv' | 'xlsx';

export interface DeadLetterRecord {
  id: string;
  notificationId: string;
  userId: string;
  tenantId: string;
  channel: NotificationChannel;
  priority: PriorityLevel;
  failureReason: FailureReason;
  attempts: number;
  lastError: string;
  metadata: Record<string, any>;
  status: ManualReviewStatus;
  createdAt: string;
  updatedAt: string;
  forensicAnalysis?: ForensicAnalysis;
  reviewAction?: RecoveryAction;
  reviewerNotes?: string;
  reviewedAt?: string;
}

export interface ForensicAnalysis {
  rootCause: string;
  contributingFactors: string[];
  userImpact: string;
  systemImpact: string;
  recommendations: string[];
  relatedIncidents: string[];
  timeline: any[];
  confidence: number;
}

export interface DeadLetterConfig {
  maxRetentionDays: number;
  autoCleanupEnabled: boolean;
  alertCriticalFailures: boolean;
  enableForensicAnalysis: boolean;
  bulkOperationMaxItems: number;
}

export interface DeadLetterFilter {
  status?: ManualReviewStatus;
  channel?: NotificationChannel;
  priority?: PriorityLevel;
  failureReason?: FailureReason;
  tenantId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface BulkRecoveryOptions {
  action: RecoveryAction;
  maxItems?: number;
  notes?: string;
  recoveryOptions?: any;
}

export interface DeadLetterMetrics {
  totalItems: number;
  pendingReview: number;
  resolved: number;
  resolutionRate: number;
  averageTimeToResolution: number;
  byStatus: Record<string, number>;
  byChannel: Record<string, number>;
  byFailureReason: Record<string, number>;
  byPriority: Record<string, number>;
  timeWindow: number;
}

/**
 * Channel Fallback Types
 */
export interface ChannelFallbackConfig {
  enableIntelligentFallback: boolean;
  preserveUserPreferences: boolean;
  maxFallbackAttempts: number;
  fallbackTimeoutMs: number;
  healthCheckIntervalMs: number;
}

export interface FallbackStrategy {
  type: 'immediate_alternative' | 'delayed_retry' | 'degraded_delivery' | 'user_notification' | 'admin_escalation';
  delay?: number;
}

export interface ChannelHealth {
  channel: NotificationChannel;
  healthScore: number;
  availability: number;
  latency: number;
  errorRate: number;
  throughput: number;
  lastCheck: string;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface ChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
  priority: number;
}

export interface FallbackEvent {
  originalChannel: NotificationChannel;
  fallbackChannel?: NotificationChannel;
  reason: string;
  success: boolean;
  timestamp: string;
}

export interface FallbackMetrics {
  totalFallbacks: number;
  successfulFallbacks: number;
  fallbackSuccessRate: number;
  averageFallbackTime: number;
  fallbacksByChannel: Record<string, number>;
  fallbackStrategies: Record<string, number>;
  channelHealthScores: Record<string, number>;
  userSatisfactionAverage: number;
  timeWindow: number;
}

export interface ChannelCapability {
  richContent: boolean;
  attachments: boolean;
  urgency: string;
  cost: string;
}

export type DeliveryPriority = 'low' | 'medium' | 'high' | 'critical';

export interface FallbackRule {
  id: string;
  condition: {
    channels?: NotificationChannel[];
    priority?: DeliveryPriority;
    failureReasons?: string[];
  };
  strategy: FallbackStrategy;
}

export interface ChannelRanking {
  channel: NotificationChannel;
  score: number;
  reasoning: string;
  health: string;
  estimatedLatency: number;
}

export interface NotificationContext {
  userId: string;
  tenantId?: string;
  priority: DeliveryPriority;
  urgency: string;
  requiresRichContent?: boolean;
  hasAttachments?: boolean;
}

export interface ChannelAvailability {
  isAvailable: boolean;
  healthScore: number;
  estimatedLatency: number;
  errorRate: number;
  lastCheck: string;
}

/**
 * Health Monitoring Types
 */
export interface HealthCheckConfig {
  timeout: number;
  retries: number;
  interval: number;
  database: {
    maxQueryTime: number;
    maxConnections: number;
  };
  alerts: {
    webhookUrl?: string;
    emailRecipients: string[];
  };
}

export interface DependencyStatus {
  name: string;
  status: string;
  latency: number;
  lastCheck: string;
  version: string;
  critical: boolean;
}

export interface HealthMetrics {
  uptime: number;
  averageResponseTime: number;
  totalIncidents: number;
  statusDistribution: Record<string, number>;
  timeWindow: number;
  totalChecks: number;
  lastCheck: string | null;
}

export interface AlertThreshold {
  responseTime?: { warning: number; critical: number };
  errorRate?: { warning: number; critical: number };
  availability?: { warning: number; critical: number };
}

export interface HealthAlert {
  id: string;
  serviceId: string;
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface MonitoringComponent {
  id: string;
  name: string;
  type: 'database' | 'external_api' | 'notification_channel' | 'internal_service';
  priority: 'critical' | 'important' | 'standard';
  interval: MonitoringInterval;
  config: Record<string, any>;
}

export type MonitoringInterval = 'critical' | 'important' | 'standard';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining' | 'increasing';
}

export interface SystemHealthDashboard {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  componentHealth: Record<string, ServiceHealth>;
  activeAlerts: HealthAlert[];
  performanceMetrics: PerformanceMetric[];
  slaMetrics: SLAMetrics;
  lastUpdated: string;
}

export interface SLAMetrics {
  availability: { current: number; target: number; trend: string };
  responseTime: { current: number; target: number; trend: string };
  errorRate: { current: number; target: number; trend: string };
}

export interface HealthCheckResult {
  serviceId: string;
  status: 'healthy' | 'degraded' | 'critical';
  healthy: boolean;
  latency: number;
  timestamp: string;
  error?: string;
  metrics: Record<string, any>;
  dependencies: string[];
  checks?: Array<{
    name: string;
    passed: boolean;
    details: string;
  }>;
}

export interface ServiceEndpoint {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  rateLimitHeaders?: string[];
}

/**
 * Recovery Orchestrator Types
 */
export interface RecoveryWorkflow {
  id: string;
  templateId: string;
  context: RecoveryContext;
  steps: RecoveryStep[];
  state: WorkflowStatus;
  progress: RecoveryProgress;
  checkpoints: RecoveryCheckpoint[];
  rollbackPlan?: RollbackPlan;
  startedAt: string;
  endedAt?: string;
  metadata: Record<string, any>;
}

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface RecoveryStep {
  id: string;
  name: string;
  type: 'service_restart' | 'failover' | 'data_recovery' | 'configuration_update' | 'cache_invalidation' | 'connection_reset' | 'health_check' | 'notification_resend' | 'user_notification';
  config: Record<string, any>;
  dependencies?: RecoveryDependency[];
  critical: boolean;
  continueOnFailure?: boolean;
  delay?: number;
  retryConfig?: {
    maxAttempts: number;
    backoffStrategy: BackoffStrategy;
  };
}

export interface RecoveryState {
  workflowId: string;
  currentStep: number;
  stepStates: Record<string, 'pending' | 'running' | 'completed' | 'failed'>;
  data: Record<string, any>;
}

export interface RecoveryPlan {
  id: string;
  name: string;
  description: string;
  steps: RecoveryStep[];
  dependencies: RecoveryDependency[];
  estimatedDuration: number;
  rollbackSupported: boolean;
}

export interface RecoveryContext {
  workflowId: string;
  tenantId: string;
  userId?: string;
  serviceId: string;
  incidentId?: string;
  priority: PriorityLevel;
  metadata: Record<string, any>;
}

export interface RecoveryProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  percentage: number;
}

export interface RecoveryResult {
  workflowId: string;
  success: boolean;
  error?: string;
  steps: Array<{
    stepId: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  executionTime: number;
  checkpoints: RecoveryCheckpoint[];
}

export interface RecoveryMetrics {
  totalWorkflows: number;
  successfulWorkflows: number;
  failedWorkflows: number;
  successRate: number;
  averageExecutionTime: number;
  stepSuccessRate: number;
  workflowsByTemplate: Record<string, number>;
  stepsByType: Record<string, number>;
  timeWindow: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: RecoveryStep[];
  rollbackPlan?: RollbackPlan;
  metadata?: Record<string, any>;
}

export interface RecoveryDependency {
  type: 'service_healthy' | 'data_available' | 'external_service';
  serviceId: string;
  dataId?: string;
}

export interface RollbackPlan {
  enabled: boolean;
  stepRollbacks: Record<string, RecoveryStep>;
  autoRollbackConditions: string[];
}

export interface RecoveryCheckpoint {
  id: string;
  workflowId: string;
  stepIndex: number;
  timestamp: string;
  state: any;
  metadata: Record<string, any>;
}

export interface OrchestrationConfig {
  maxConcurrentWorkflows: number;
  defaultTimeout: number;
  checkpointInterval: number;
  enableRollback: boolean;
  persistState: boolean;
}