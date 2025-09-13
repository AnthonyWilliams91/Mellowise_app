/**
 * Mellowise Analytics Event Schema
 * 
 * Comprehensive event tracking schema for user behavior, performance,
 * and business metrics across the Mellowise application.
 */

// Base event interface
export interface BaseAnalyticsEvent {
  event_id: string;
  timestamp: number;
  user_id?: string;
  session_id: string;
  page_path: string;
  user_agent: string;
  viewport: {
    width: number;
    height: number;
  };
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// User journey events
export interface UserJourneyEvent extends BaseAnalyticsEvent {
  category: 'user_journey';
  action: 
    | 'page_view'
    | 'session_start'
    | 'session_end'
    | 'user_signup'
    | 'user_login'
    | 'user_logout'
    | 'subscription_start'
    | 'subscription_cancel'
    | 'subscription_renew';
  properties: {
    page_title?: string;
    section?: string;
    signup_method?: 'email' | 'google' | 'apple';
    login_method?: 'email' | 'google' | 'apple';
    subscription_plan?: 'free' | 'premium' | 'pro';
    session_duration?: number;
  };
}

// Study session events
export interface StudySessionEvent extends BaseAnalyticsEvent {
  category: 'study_session';
  action: 
    | 'session_start'
    | 'session_pause'
    | 'session_resume'
    | 'session_complete'
    | 'question_answered'
    | 'question_skipped'
    | 'explanation_viewed'
    | 'ai_tutor_used'
    | 'hint_requested';
  properties: {
    session_type: 'practice' | 'timed' | 'adaptive' | 'review';
    question_id?: string;
    question_category?: string;
    question_difficulty?: 'easy' | 'medium' | 'hard';
    answer_correct?: boolean;
    time_spent?: number;
    hints_used?: number;
    explanation_helpful?: boolean;
    ai_interaction_type?: 'question' | 'clarification' | 'explanation';
    performance_score?: number;
    questions_completed?: number;
    session_duration?: number;
  };
}

// AI interaction events
export interface AIInteractionEvent extends BaseAnalyticsEvent {
  category: 'ai_interaction';
  action: 
    | 'chat_started'
    | 'message_sent' 
    | 'response_received'
    | 'feedback_given'
    | 'conversation_ended'
    | 'feature_used'
    | 'rate_limit_hit'
    | 'error_occurred';
  properties: {
    interaction_id: string;
    message_count?: number;
    conversation_length?: number;
    ai_model?: 'claude' | 'gpt-4' | 'gpt-3.5-turbo';
    response_time?: number;
    user_satisfaction?: 1 | 2 | 3 | 4 | 5;
    feature_type?: 'explanation' | 'hint' | 'question_generation' | 'feedback';
    error_code?: string;
    rate_limit_remaining?: number;
  };
}

// Performance events
export interface PerformanceEvent extends BaseAnalyticsEvent {
  category: 'performance';
  action: 
    | 'page_load'
    | 'web_vital_measured'
    | 'api_call'
    | 'error_occurred'
    | 'slow_operation';
  properties: {
    metric_name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
    metric_value: number;
    metric_rating: 'good' | 'needs-improvement' | 'poor';
    load_time?: number;
    api_endpoint?: string;
    api_method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    api_response_time?: number;
    api_success?: boolean;
    error_type?: string;
    error_message?: string;
    slow_operation_type?: string;
    slow_operation_duration?: number;
  };
}

// Business events
export interface BusinessEvent extends BaseAnalyticsEvent {
  category: 'business';
  action: 
    | 'trial_started'
    | 'trial_converted'
    | 'trial_expired'
    | 'payment_initiated'
    | 'payment_completed'
    | 'payment_failed'
    | 'refund_requested'
    | 'support_contacted'
    | 'feature_requested';
  properties: {
    trial_duration?: number;
    conversion_rate?: number;
    payment_amount?: number;
    payment_currency?: string;
    payment_method?: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
    subscription_tier?: 'free' | 'premium' | 'pro';
    discount_applied?: boolean;
    discount_code?: string;
    support_channel?: 'email' | 'chat' | 'phone' | 'ticket';
    feature_category?: string;
    revenue_value?: number;
  };
}

// Engagement events
export interface EngagementEvent extends BaseAnalyticsEvent {
  category: 'engagement';
  action: 
    | 'content_interaction'
    | 'social_share'
    | 'bookmark_added'
    | 'download_initiated'
    | 'video_played'
    | 'video_completed'
    | 'search_performed'
    | 'filter_applied'
    | 'goal_achieved';
  properties: {
    content_type?: 'question' | 'explanation' | 'video' | 'article';
    content_id?: string;
    interaction_type?: 'click' | 'view' | 'scroll' | 'hover';
    share_platform?: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy_link';
    search_query?: string;
    search_results_count?: number;
    filter_type?: string;
    filter_value?: string;
    goal_type?: 'study_streak' | 'score_target' | 'time_goal' | 'completion_goal';
    goal_value?: number;
    video_duration?: number;
    video_position?: number;
    download_type?: 'pdf' | 'csv' | 'audio' | 'image';
  };
}

// Error and debugging events
export interface ErrorEvent extends BaseAnalyticsEvent {
  category: 'error';
  action: 
    | 'javascript_error'
    | 'api_error'
    | 'network_error'
    | 'validation_error'
    | 'auth_error'
    | 'payment_error'
    | 'feature_error';
  properties: {
    error_code: string;
    error_message: string;
    error_stack?: string;
    error_severity: 'low' | 'medium' | 'high' | 'critical';
    error_category: 'client' | 'server' | 'network' | 'third_party';
    component_name?: string;
    api_endpoint?: string;
    retry_attempted?: boolean;
    recovery_successful?: boolean;
    user_impact: 'none' | 'minor' | 'major' | 'blocking';
  };
}

// Security events
export interface SecurityEvent extends BaseAnalyticsEvent {
  category: 'security';
  action: 
    | 'login_attempt'
    | 'login_failed'
    | 'password_reset'
    | 'account_locked'
    | 'suspicious_activity'
    | 'csrf_detected'
    | 'rate_limit_exceeded';
  properties: {
    attempt_count?: number;
    ip_address?: string;
    location?: string;
    device_fingerprint?: string;
    threat_level?: 'low' | 'medium' | 'high' | 'critical';
    blocked_action?: string;
    security_rule_triggered?: string;
  };
}

// Union type for all event types
export type AnalyticsEvent = 
  | UserJourneyEvent
  | StudySessionEvent
  | AIInteractionEvent
  | PerformanceEvent
  | BusinessEvent
  | EngagementEvent
  | ErrorEvent
  | SecurityEvent;

// Event categories enum
export const EventCategories = {
  USER_JOURNEY: 'user_journey',
  STUDY_SESSION: 'study_session',
  AI_INTERACTION: 'ai_interaction',
  PERFORMANCE: 'performance',
  BUSINESS: 'business',
  ENGAGEMENT: 'engagement',
  ERROR: 'error',
  SECURITY: 'security'
} as const;

// Event priority levels
export const EventPriority = {
  CRITICAL: 'critical',    // Must be sent immediately
  HIGH: 'high',           // Send within 5 seconds
  MEDIUM: 'medium',       // Send within 30 seconds
  LOW: 'low'              // Can be batched
} as const;

export type EventPriorityLevel = typeof EventPriority[keyof typeof EventPriority];

// Event configuration mapping
export const EVENT_CONFIG: Record<string, { 
  priority: EventPriorityLevel; 
  retention_days: number; 
  pii_fields: string[] 
}> = {
  // User Journey Events
  'user_journey.page_view': { priority: EventPriority.LOW, retention_days: 90, pii_fields: [] },
  'user_journey.session_start': { priority: EventPriority.MEDIUM, retention_days: 365, pii_fields: [] },
  'user_journey.user_signup': { priority: EventPriority.HIGH, retention_days: 2555, pii_fields: ['user_id'] },
  'user_journey.user_login': { priority: EventPriority.MEDIUM, retention_days: 365, pii_fields: ['user_id'] },
  'user_journey.subscription_start': { priority: EventPriority.CRITICAL, retention_days: 2555, pii_fields: ['user_id'] },
  
  // Study Session Events
  'study_session.session_start': { priority: EventPriority.MEDIUM, retention_days: 730, pii_fields: ['user_id'] },
  'study_session.question_answered': { priority: EventPriority.LOW, retention_days: 365, pii_fields: ['user_id'] },
  'study_session.session_complete': { priority: EventPriority.HIGH, retention_days: 730, pii_fields: ['user_id'] },
  'study_session.ai_tutor_used': { priority: EventPriority.MEDIUM, retention_days: 365, pii_fields: ['user_id'] },
  
  // AI Interaction Events
  'ai_interaction.chat_started': { priority: EventPriority.MEDIUM, retention_days: 365, pii_fields: ['user_id'] },
  'ai_interaction.rate_limit_hit': { priority: EventPriority.HIGH, retention_days: 90, pii_fields: ['user_id'] },
  'ai_interaction.error_occurred': { priority: EventPriority.CRITICAL, retention_days: 180, pii_fields: ['user_id'] },
  
  // Performance Events
  'performance.web_vital_measured': { priority: EventPriority.LOW, retention_days: 30, pii_fields: [] },
  'performance.api_call': { priority: EventPriority.LOW, retention_days: 30, pii_fields: [] },
  'performance.error_occurred': { priority: EventPriority.HIGH, retention_days: 180, pii_fields: [] },
  
  // Business Events
  'business.payment_completed': { priority: EventPriority.CRITICAL, retention_days: 2555, pii_fields: ['user_id'] },
  'business.payment_failed': { priority: EventPriority.CRITICAL, retention_days: 730, pii_fields: ['user_id'] },
  'business.trial_converted': { priority: EventPriority.CRITICAL, retention_days: 2555, pii_fields: ['user_id'] },
  
  // Error Events
  'error.javascript_error': { priority: EventPriority.HIGH, retention_days: 90, pii_fields: [] },
  'error.api_error': { priority: EventPriority.HIGH, retention_days: 180, pii_fields: [] },
  'error.payment_error': { priority: EventPriority.CRITICAL, retention_days: 365, pii_fields: ['user_id'] },
  
  // Security Events
  'security.login_failed': { priority: EventPriority.HIGH, retention_days: 365, pii_fields: ['ip_address'] },
  'security.suspicious_activity': { priority: EventPriority.CRITICAL, retention_days: 730, pii_fields: ['ip_address', 'user_id'] },
  'security.rate_limit_exceeded': { priority: EventPriority.HIGH, retention_days: 90, pii_fields: ['ip_address'] }
};

// Utility functions for event creation
export const createEventId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getEventKey = (category: string, action: string): string => {
  return `${category}.${action}`;
};

export const getEventPriority = (category: string, action: string): EventPriorityLevel => {
  const key = getEventKey(category, action);
  return EVENT_CONFIG[key]?.priority || EventPriority.LOW;
};

export const shouldIncludePII = (category: string, action: string, field: string): boolean => {
  const key = getEventKey(category, action);
  return EVENT_CONFIG[key]?.pii_fields.includes(field) || false;
};

// Event validation schemas (for runtime validation)
export const EventSchemas = {
  base: {
    required: ['event_id', 'timestamp', 'session_id', 'page_path', 'user_agent', 'viewport'],
    optional: ['user_id', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  },
  user_journey: {
    required: ['category', 'action', 'properties'],
    actions: ['page_view', 'session_start', 'session_end', 'user_signup', 'user_login', 'user_logout', 'subscription_start', 'subscription_cancel', 'subscription_renew']
  },
  study_session: {
    required: ['category', 'action', 'properties'],
    actions: ['session_start', 'session_pause', 'session_resume', 'session_complete', 'question_answered', 'question_skipped', 'explanation_viewed', 'ai_tutor_used', 'hint_requested']
  }
};

// Export all event types for easy access
export * from './analytics-events';
export type { 
  BaseAnalyticsEvent,
  UserJourneyEvent,
  StudySessionEvent, 
  AIInteractionEvent,
  PerformanceEvent,
  BusinessEvent,
  EngagementEvent,
  ErrorEvent,
  SecurityEvent,
  AnalyticsEvent,
  EventPriorityLevel
};