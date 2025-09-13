/**
 * Mellowise Error Messages and Handling Framework
 * 
 * Comprehensive error taxonomy with TypeScript type safety, user-friendly messages,
 * and consistent error handling across the application.
 * 
 * Based on Sarah's PO validation and UX error message specifications.
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'authentication' | 'ai_service' | 'payment' | 'game' | 'system' | 'validation';

export interface ErrorDefinition {
  code: string;
  title: string;
  message: string;
  action: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  supportLink?: string;
  retryable?: boolean;
}

export interface ErrorDisplay {
  title: string;
  message: string;
  primaryAction: string;
  secondaryAction?: string;
  supportLink?: string;
  icon?: string;
}

// Authentication Error Messages
export const AuthErrors = {
  INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    title: 'Login Failed',
    message: 'Email or password is incorrect. Please double-check your credentials and try again.',
    action: 'Verify your email and password, then retry',
    severity: 'medium' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    retryable: true
  },
  
  EMAIL_NOT_VERIFIED: {
    code: 'AUTH_002',
    title: 'Email Verification Required',
    message: 'Please verify your email address to continue using Mellowise.',
    action: 'Check your inbox and click the verification link',
    severity: 'low' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    supportLink: '/help/email-verification'
  },
  
  ACCOUNT_LOCKED: {
    code: 'AUTH_003',
    title: 'Account Temporarily Locked',
    message: 'Your account has been temporarily locked for security reasons.',
    action: 'Wait 15 minutes or contact support for immediate assistance',
    severity: 'high' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    supportLink: '/support/account-locked'
  },
  
  SESSION_EXPIRED: {
    code: 'AUTH_004',
    title: 'Session Expired',
    message: 'Your session has expired for security. Please log in again.',
    action: 'Click here to log in again',
    severity: 'low' as ErrorSeverity,
    category: 'authentication' as ErrorCategory,
    retryable: true
  },
  
  WEAK_PASSWORD: {
    code: 'AUTH_005',
    title: 'Password Too Weak',
    message: 'Your password must be at least 8 characters with letters, numbers, and symbols.',
    action: 'Create a stronger password and try again',
    severity: 'low' as ErrorSeverity,
    category: 'validation' as ErrorCategory,
    retryable: true
  }
} as const;

// AI Service Error Messages
export const AIErrors = {
  GENERATION_FAILED: {
    code: 'AI_001',
    title: 'Question Generation Unavailable',
    message: 'Unable to generate new questions right now. Using our pre-made question library instead.',
    action: 'Continue with existing questions or try again in a few moments',
    severity: 'medium' as ErrorSeverity,
    category: 'ai_service' as ErrorCategory,
    retryable: true
  },
  
  RATE_LIMIT_EXCEEDED: {
    code: 'AI_002',
    title: 'Daily AI Chat Limit Reached',
    message: 'You\'ve reached your daily AI tutor limit. Upgrade to Premium for unlimited AI assistance.',
    action: 'Upgrade to Premium or wait until tomorrow',
    severity: 'low' as ErrorSeverity,
    category: 'ai_service' as ErrorCategory,
    supportLink: '/pricing'
  },
  
  TUTOR_UNAVAILABLE: {
    code: 'AI_003',
    title: 'AI Tutor Temporarily Unavailable',
    message: 'Our AI tutor is currently experiencing high demand and is temporarily unavailable.',
    action: 'Try basic explanations or contact support',
    severity: 'high' as ErrorSeverity,
    category: 'ai_service' as ErrorCategory,
    retryable: true,
    supportLink: '/help/ai-tutor'
  },
  
  CONTEXT_TOO_LONG: {
    code: 'AI_004',
    title: 'Question Too Complex',
    message: 'This question is too complex for our AI to process right now.',
    action: 'Try breaking it into smaller parts or use pre-written explanations',
    severity: 'medium' as ErrorSeverity,
    category: 'ai_service' as ErrorCategory,
    retryable: false
  },
  
  INAPPROPRIATE_CONTENT: {
    code: 'AI_005',
    title: 'Content Policy Violation',
    message: 'Your request contains content that violates our usage policy.',
    action: 'Please rephrase your question focusing on LSAT preparation',
    severity: 'low' as ErrorSeverity,
    category: 'validation' as ErrorCategory,
    retryable: true
  }
} as const;

// Payment Error Messages
export const PaymentErrors = {
  CARD_DECLINED: {
    code: 'PAY_001',
    title: 'Payment Method Declined',
    message: 'Your payment method was declined by your bank or card issuer.',
    action: 'Try a different payment method or contact your bank',
    severity: 'high' as ErrorSeverity,
    category: 'payment' as ErrorCategory,
    retryable: true
  },
  
  SUBSCRIPTION_FAILED: {
    code: 'PAY_002',
    title: 'Subscription Processing Issue',
    message: 'We couldn\'t process your subscription, but your access continues uninterrupted.',
    action: 'Update your payment method in Account Settings',
    severity: 'medium' as ErrorSeverity,
    category: 'payment' as ErrorCategory,
    supportLink: '/account/billing'
  },
  
  BILLING_ADDRESS_INVALID: {
    code: 'PAY_003',
    title: 'Billing Address Mismatch',
    message: 'Your billing address doesn\'t match what your bank has on file.',
    action: 'Verify your billing address matches your bank records',
    severity: 'medium' as ErrorSeverity,
    category: 'payment' as ErrorCategory,
    retryable: true
  },
  
  INSUFFICIENT_FUNDS: {
    code: 'PAY_004',
    title: 'Insufficient Funds',
    message: 'Your account doesn\'t have sufficient funds for this transaction.',
    action: 'Add funds to your account or use a different payment method',
    severity: 'medium' as ErrorSeverity,
    category: 'payment' as ErrorCategory,
    retryable: true
  },
  
  SUBSCRIPTION_CANCELLED: {
    code: 'PAY_005',
    title: 'Subscription Cancelled',
    message: 'Your subscription has been cancelled. You can continue using Premium features until your current period ends.',
    action: 'Reactivate your subscription to continue Premium access',
    severity: 'low' as ErrorSeverity,
    category: 'payment' as ErrorCategory,
    supportLink: '/account/subscription'
  }
} as const;

// Game/Study Session Error Messages  
export const GameErrors = {
  SESSION_LOST: {
    code: 'GAME_001',
    title: 'Connection Lost',
    message: 'Your internet connection was interrupted, but we\'ve saved your progress.',
    action: 'Check your connection and restart when ready',
    severity: 'low' as ErrorSeverity,
    category: 'game' as ErrorCategory,
    retryable: true
  },
  
  QUESTION_LOAD_FAILED: {
    code: 'GAME_002',
    title: 'Question Loading Failed',
    message: 'We couldn\'t load the next question. This might be a temporary connection issue.',
    action: 'Check your internet connection and try again',
    severity: 'high' as ErrorSeverity,
    category: 'game' as ErrorCategory,
    retryable: true
  },
  
  SAVE_PROGRESS_FAILED: {
    code: 'GAME_003',
    title: 'Progress Not Saved',
    message: 'We couldn\'t save your latest progress. Your previous progress is still safe.',
    action: 'Continue playing or restart to ensure progress is saved',
    severity: 'medium' as ErrorSeverity,
    category: 'game' as ErrorCategory,
    retryable: true
  },
  
  GAME_EXPIRED: {
    code: 'GAME_004',
    title: 'Session Expired',
    message: 'Your game session has expired due to inactivity.',
    action: 'Start a new session to continue studying',
    severity: 'low' as ErrorSeverity,
    category: 'game' as ErrorCategory,
    retryable: true
  },
  
  INVALID_ANSWER: {
    code: 'GAME_005',
    title: 'Invalid Answer Format',
    message: 'The answer format you provided isn\'t recognized for this question type.',
    action: 'Please select from the available answer choices',
    severity: 'low' as ErrorSeverity,
    category: 'validation' as ErrorCategory,
    retryable: true
  }
} as const;

// System Error Messages
export const SystemErrors = {
  SERVER_ERROR: {
    code: 'SYS_001',
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified and is working on a fix.',
    action: 'Try again in a few minutes or contact support if the issue persists',
    severity: 'high' as ErrorSeverity,
    category: 'system' as ErrorCategory,
    retryable: true,
    supportLink: '/support'
  },
  
  MAINTENANCE_MODE: {
    code: 'SYS_002',
    title: 'Scheduled Maintenance',
    message: 'Mellowise is currently undergoing scheduled maintenance to improve your experience.',
    action: 'Please check back in a few minutes',
    severity: 'medium' as ErrorSeverity,
    category: 'system' as ErrorCategory,
    retryable: true
  },
  
  RATE_LIMITED: {
    code: 'SYS_003',
    title: 'Too Many Requests',
    message: 'You\'re making requests too quickly. Please wait a moment before trying again.',
    action: 'Wait 30 seconds and try again',
    severity: 'low' as ErrorSeverity,
    category: 'system' as ErrorCategory,
    retryable: true
  },
  
  DATABASE_ERROR: {
    code: 'SYS_004',
    title: 'Data Access Error',
    message: 'We\'re having trouble accessing your data right now. This is usually temporary.',
    action: 'Try refreshing the page or check back in a few minutes',
    severity: 'high' as ErrorSeverity,
    category: 'system' as ErrorCategory,
    retryable: true
  },
  
  FEATURE_UNAVAILABLE: {
    code: 'SYS_005',
    title: 'Feature Temporarily Unavailable',
    message: 'This feature is temporarily unavailable while we make improvements.',
    action: 'Try other features or check back later',
    severity: 'medium' as ErrorSeverity,
    category: 'system' as ErrorCategory,
    retryable: false
  }
} as const;

// All errors combined for lookup
export const AllErrors = {
  ...AuthErrors,
  ...AIErrors,
  ...PaymentErrors,
  ...GameErrors,
  ...SystemErrors
} as const;

// Error lookup by code
export const getErrorByCode = (code: string): ErrorDefinition | null => {
  const error = Object.values(AllErrors).find(err => err.code === code);
  return error || null;
};

// Convert error to display format
export const formatErrorForDisplay = (error: ErrorDefinition): ErrorDisplay => {
  return {
    title: error.title,
    message: error.message,
    primaryAction: error.action,
    secondaryAction: error.supportLink ? 'Get Help' : undefined,
    supportLink: error.supportLink,
    icon: getErrorIcon(error.severity)
  };
};

// Get appropriate icon for error severity
export const getErrorIcon = (severity: ErrorSeverity): string => {
  const icons = {
    low: '💡',
    medium: '⚠️', 
    high: '🚨',
    critical: '🔥'
  };
  return icons[severity];
};

// Error categories for filtering and analytics
export const ErrorCategories = {
  AUTHENTICATION: 'authentication',
  AI_SERVICE: 'ai_service', 
  PAYMENT: 'payment',
  GAME: 'game',
  SYSTEM: 'system',
  VALIDATION: 'validation'
} as const;

// Error severity levels
export const ErrorSeverityLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high', 
  CRITICAL: 'critical'
} as const;

// Default error for unknown cases
export const DEFAULT_ERROR: ErrorDefinition = {
  code: 'UNKNOWN_001',
  title: 'Unexpected Error',
  message: 'Something unexpected happened. Our team has been notified.',
  action: 'Try refreshing the page or contact support',
  severity: 'medium',
  category: 'system',
  retryable: true,
  supportLink: '/support'
};

// Export error types for TypeScript usage
export type AuthErrorCode = keyof typeof AuthErrors;
export type AIErrorCode = keyof typeof AIErrors;
export type PaymentErrorCode = keyof typeof PaymentErrors;
export type GameErrorCode = keyof typeof GameErrors;
export type SystemErrorCode = keyof typeof SystemErrors;
export type AllErrorCode = keyof typeof AllErrors;