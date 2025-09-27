/**
 * Performance Optimization Types
 * MELLOWISE-032: Complete performance monitoring and optimization system
 */

// ============================================================================
// CORE WEB VITALS MONITORING
// ============================================================================

export interface WebVitalsMetrics {
  // Core Web Vitals
  LCP: number; // Largest Contentful Paint (ms)
  FID: number; // First Input Delay (ms)
  CLS: number; // Cumulative Layout Shift (score)

  // Additional Performance Metrics
  TTFB: number; // Time to First Byte (ms)
  FCP: number;  // First Contentful Paint (ms)
  TTI: number;  // Time to Interactive (ms)
  TBT: number;  // Total Blocking Time (ms)

  // Custom Metrics
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  cacheHitRate: number;

  timestamp: Date;
  url: string;
  userAgent: string;
  connectionType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
}

export interface PerformanceBudget {
  LCP: number;      // Target: <2500ms
  FID: number;      // Target: <100ms
  CLS: number;      // Target: <0.1
  TTFB: number;     // Target: <200ms
  pageSize: number; // Target: <1MB
  requests: number; // Target: <50
}

export interface PerformanceThresholds {
  good: PerformanceBudget;
  needsImprovement: PerformanceBudget;
  poor: PerformanceBudget;
}

// ============================================================================
// CACHING SYSTEM
// ============================================================================

export type CacheStrategy = 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'redis';

export interface CacheConfig {
  strategy: CacheStrategy;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache size
  compression: boolean;
  encryption: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  accessCount: number;
  lastAccessed: Date;
  size: number; // Bytes
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  totalSize: number;
  entryCount: number;
  avgResponseTime: number;
}

// ============================================================================
// LAZY LOADING SYSTEM
// ============================================================================

export interface LazyLoadConfig {
  rootMargin: string;
  threshold: number | number[];
  triggerOnce: boolean;
  fallbackDelay: number; // Fallback for browsers without Intersection Observer
}

export interface LazyLoadableResource {
  id: string;
  type: 'image' | 'component' | 'script' | 'style' | 'data';
  src: string;
  priority: 'high' | 'medium' | 'low';
  preload: boolean;
  fallback?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface LazyLoadMetrics {
  totalResources: number;
  loadedResources: number;
  failedResources: number;
  avgLoadTime: number;
  bandwidthSaved: number; // Bytes
}

// ============================================================================
// ERROR RECOVERY SYSTEM
// ============================================================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
  fallbackComponent?: React.ComponentType;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  retryCondition: (error: Error) => boolean;
}

export interface NetworkError extends Error {
  status?: number;
  code?: string;
  retryAfter?: number;
  isRetryable: boolean;
}

export interface ErrorRecoveryOptions {
  autoRetry: boolean;
  showFallback: boolean;
  preserveState: boolean;
  notifyUser: boolean;
  logError: boolean;
}

// ============================================================================
// SESSION RECOVERY
// ============================================================================

export interface SessionState {
  id: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  progress: {
    currentQuestion: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    section: string;
  };
  preferences: UserPreferences;
  temporaryData: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSave: boolean;
  saveInterval: number; // seconds
}

export interface RecoveryResult {
  success: boolean;
  recoveredData: SessionState | null;
  dataLoss: boolean;
  recoveredAt: Date;
  message: string;
}

// ============================================================================
// A/B TESTING FRAMEWORK
// ============================================================================

export interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  trafficAllocation: number; // 0-100%
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  targetAudience?: AudienceFilter;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficWeight: number; // 0-100%
  config: Record<string, any>;
  isControl: boolean;
}

export interface ABTestMetric {
  name: string;
  type: 'conversion' | 'engagement' | 'performance' | 'revenue';
  goal: 'increase' | 'decrease' | 'maintain';
  baseline: number;
  target: number;
  significance: number; // Statistical significance level
}

export interface AudienceFilter {
  countries?: string[];
  devices?: ('desktop' | 'mobile' | 'tablet')[];
  userTypes?: ('new' | 'returning' | 'premium')[];
  minSessions?: number;
  customFilters?: Record<string, any>;
}

export interface ABTestAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
  exposedAt?: Date;
  converted: boolean;
  conversionValue?: number;
}

export interface ABTestResults {
  testId: string;
  variant: ABTestVariant;
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  statisticalSignificance: boolean;
  uplift: number; // Percentage improvement over control
}

// ============================================================================
// PERFORMANCE MONITORING SERVICE
// ============================================================================

export interface PerformanceMonitor {
  startMonitoring(): void;
  stopMonitoring(): void;
  recordMetric(metric: Partial<WebVitalsMetrics>): void;
  getMetrics(timeframe?: DateRange): WebVitalsMetrics[];
  getBudgetStatus(): BudgetStatus;
  generateReport(): PerformanceReport;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BudgetStatus {
  overall: 'good' | 'needs-improvement' | 'poor';
  metrics: {
    [K in keyof WebVitalsMetrics]?: 'good' | 'needs-improvement' | 'poor';
  };
  recommendations: string[];
}

export interface PerformanceReport {
  period: DateRange;
  summary: WebVitalsMetrics;
  trends: PerformanceTrend[];
  budgetCompliance: BudgetStatus;
  recommendations: PerformanceRecommendation[];
  technicalDetails: TechnicalMetrics;
}

export interface PerformanceTrend {
  metric: keyof WebVitalsMetrics;
  direction: 'improving' | 'declining' | 'stable';
  change: number; // Percentage change
  significance: 'high' | 'medium' | 'low';
}

export interface PerformanceRecommendation {
  type: 'critical' | 'important' | 'suggestion';
  category: 'loading' | 'interactivity' | 'visual-stability' | 'caching' | 'network';
  issue: string;
  solution: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface TechnicalMetrics {
  bundleSize: number;
  chunkCount: number;
  cacheEfficiency: number;
  errorRate: number;
  uptimePercentage: number;
  avgResponseTime: number;
}

// ============================================================================
// ANIMATION OPTIMIZATION
// ============================================================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  fps: number;
  reducedMotion: boolean;
  hardwareAcceleration: boolean;
}

export interface AnimationMetrics {
  frameRate: number;
  droppedFrames: number;
  animationDuration: number;
  cpuUsage: number;
  memoryUsage: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const DEFAULT_PERFORMANCE_CONFIG = {
  monitoring: {
    enabled: true,
    sampleRate: 0.1, // Monitor 10% of sessions
    reportInterval: 30000, // 30 seconds
  },
  caching: {
    strategy: 'memory' as CacheStrategy,
    ttl: 3600, // 1 hour
    maxSize: 50 * 1024 * 1024, // 50MB
    compression: true,
    encryption: false,
  },
  lazyLoading: {
    rootMargin: '50px',
    threshold: 0.1,
    triggerOnce: true,
    fallbackDelay: 300,
  },
  errorRecovery: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    autoRetry: true,
    showFallback: true,
    preserveState: true,
    notifyUser: false,
    logError: true,
  },
  sessionRecovery: {
    saveInterval: 30, // seconds
    maxRecoveryAge: 24 * 60 * 60, // 24 hours
  },
  budget: {
    good: {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      TTFB: 200,
      pageSize: 1024 * 1024, // 1MB
      requests: 50,
    },
    needsImprovement: {
      LCP: 4000,
      FID: 300,
      CLS: 0.25,
      TTFB: 500,
      pageSize: 2 * 1024 * 1024, // 2MB
      requests: 75,
    },
    poor: {
      LCP: Infinity,
      FID: Infinity,
      CLS: Infinity,
      TTFB: Infinity,
      pageSize: Infinity,
      requests: Infinity,
    },
  },
} as const;