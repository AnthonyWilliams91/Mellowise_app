/**
 * Mellowise Monitoring Configuration
 * 
 * Central configuration for health checks, performance monitoring,
 * and system observability across the application.
 */

export interface MonitoringEndpoints {
  health: string;
  ready: string;
  metrics: string;
  analytics: string;
}

export interface HealthCheckConfig {
  intervals: {
    database: number;
    ai_service: number;
    payment: number;
    storage: number;
  };
  timeouts: {
    database: number;
    ai_service: number;
    payment: number;
    storage: number;
  };
  retries: {
    max_attempts: number;
    backoff_ms: number;
  };
}

export interface AlertThresholds {
  response_time: {
    warning: number;
    critical: number;
  };
  error_rate: {
    warning: number;
    critical: number;
  };
  memory_usage: {
    warning: number;
    critical: number;
  };
  connection_count: {
    warning: number;
    critical: number;
  };
}

export interface ServiceStatus {
  name: string;
  healthy: boolean;
  response_time?: number;
  error?: string;
  last_check: string;
}

export interface MonitoringMetrics {
  timestamp: string;
  services: Record<string, ServiceStatus>;
  performance: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  };
  system: {
    memory_usage: number;
    cpu_usage: number;
    active_connections: number;
  };
}

// Monitoring endpoints configuration
export const MONITORING_ENDPOINTS: MonitoringEndpoints = {
  health: '/api/health/status',
  ready: '/api/health/ready',
  metrics: '/api/metrics',
  analytics: '/api/analytics/performance'
};

// Health check configuration
export const HEALTH_CHECK_CONFIG: HealthCheckConfig = {
  intervals: {
    database: 30000,    // 30 seconds
    ai_service: 60000,  // 1 minute
    payment: 45000,     // 45 seconds
    storage: 60000      // 1 minute
  },
  timeouts: {
    database: 5000,     // 5 seconds
    ai_service: 10000,  // 10 seconds
    payment: 8000,      // 8 seconds
    storage: 7000       // 7 seconds
  },
  retries: {
    max_attempts: 3,
    backoff_ms: 1000
  }
};

// Alert thresholds based on performance budgets
export const ALERT_THRESHOLDS: AlertThresholds = {
  response_time: {
    warning: 200,      // 200ms
    critical: 1000     // 1 second
  },
  error_rate: {
    warning: 0.02,     // 2%
    critical: 0.05     // 5%
  },
  memory_usage: {
    warning: 80,       // 80%
    critical: 90       // 90%
  },
  connection_count: {
    warning: 80,       // 80 connections
    critical: 100      // 100 connections
  }
};

// Environment-specific monitoring configuration
export const getMonitoringConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    enabled: env !== 'test',
    verbose: env === 'development',
    endpoints: MONITORING_ENDPOINTS,
    healthChecks: HEALTH_CHECK_CONFIG,
    alerts: ALERT_THRESHOLDS,
    sampling: {
      performance: env === 'production' ? 0.1 : 1.0,  // 10% in prod, 100% in dev
      errors: 1.0,  // Always capture errors
      traces: env === 'production' ? 0.01 : 0.1       // 1% in prod, 10% in dev
    }
  };
};

// Service names for consistent identification
export const SERVICE_NAMES = {
  DATABASE: 'database',
  AI_SERVICE: 'ai_service',
  PAYMENT: 'payment',
  STORAGE: 'storage',
  APPLICATION: 'application'
} as const;

export type ServiceName = typeof SERVICE_NAMES[keyof typeof SERVICE_NAMES];

// Health check status levels
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded', 
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown'
} as const;

export type HealthStatus = typeof HEALTH_STATUS[keyof typeof HEALTH_STATUS];

// Core Web Vitals thresholds (from performance-monitor.ts)
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }       // Time to First Byte
} as const;

// Performance budget targets (stricter than thresholds)
export const PERFORMANCE_BUDGETS = {
  LCP: 1200,   // 1.2 seconds
  FID: 30,     // 30 milliseconds  
  CLS: 0.03,   // 0.03 score
  TTFB: 200,   // 200 milliseconds
  API: 200,    // 200ms for API calls
  ROUTE_CHANGE: 100  // 100ms for route changes
} as const;

// Monitoring event types for analytics
export const MONITORING_EVENTS = {
  HEALTH_CHECK: 'health_check',
  PERFORMANCE_ALERT: 'performance_alert',
  ERROR_OCCURRED: 'error_occurred',
  SERVICE_DOWN: 'service_down',
  SERVICE_RECOVERED: 'service_recovered',
  BUDGET_EXCEEDED: 'budget_exceeded'
} as const;

export type MonitoringEventType = typeof MONITORING_EVENTS[keyof typeof MONITORING_EVENTS];

// Required environment variables for services
export const REQUIRED_ENV_VARS = {
  SUPABASE: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  CLAUDE: ['CLAUDE_API_KEY'],
  OPENAI: ['OPENAI_API_KEY'], 
  STRIPE: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'],
  CLOUDINARY: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
} as const;

// Monitoring utilities
export const createServiceStatus = (
  name: string, 
  healthy: boolean, 
  response_time?: number, 
  error?: string
): ServiceStatus => ({
  name,
  healthy,
  response_time,
  error,
  last_check: new Date().toISOString()
});

export const isHealthy = (status: ServiceStatus): boolean => status.healthy;

export const getOverallHealth = (services: ServiceStatus[]): HealthStatus => {
  if (services.length === 0) return HEALTH_STATUS.UNKNOWN;
  
  const healthyServices = services.filter(isHealthy);
  const healthyPercentage = healthyServices.length / services.length;
  
  if (healthyPercentage === 1) return HEALTH_STATUS.HEALTHY;
  if (healthyPercentage >= 0.7) return HEALTH_STATUS.DEGRADED;
  return HEALTH_STATUS.UNHEALTHY;
};