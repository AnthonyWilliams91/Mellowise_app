/**
 * MELLOWISE-032: Performance Optimization Library
 *
 * Comprehensive performance monitoring, optimization, and recovery system
 *
 * @version 1.0.0
 */

// Core Services
export * from './web-vitals-monitor'
export * from './caching-service'
export * from './error-recovery'
export * from './ab-testing'

// Re-export types
export * from '../../types/performance-optimization'

// Factory functions for easy initialization
export {
  createWebVitalsMonitor,
  setupGlobalWebVitalsMonitoring
} from './web-vitals-monitor'

export {
  createCachingService,
  getGlobalCachingService
} from './caching-service'

export {
  createErrorRecoveryService,
  getGlobalErrorRecoveryService
} from './error-recovery'

export {
  createABTestingService,
  getGlobalABTestingService
} from './ab-testing'

/**
 * Initialize complete performance optimization system
 */
export async function initializePerformanceOptimization(
  tenant_id: string,
  session_id: string,
  user_id?: string
) {
  const webVitalsMonitor = await setupGlobalWebVitalsMonitoring(tenant_id, session_id, user_id)
  const cachingService = getGlobalCachingService(tenant_id)
  const errorRecoveryService = getGlobalErrorRecoveryService(tenant_id)
  const abTestingService = getGlobalABTestingService(tenant_id)

  return {
    webVitalsMonitor,
    cachingService,
    errorRecoveryService,
    abTestingService
  }
}

/**
 * Performance optimization configuration
 */
export interface PerformanceOptimizationConfig {
  webVitals: {
    enabled: boolean
    reportingInterval: number
    enableAlerts: boolean
  }
  caching: {
    enabled: boolean
    maxMemorySize: number
    compressionEnabled: boolean
  }
  errorRecovery: {
    enabled: boolean
    escalationThreshold: number
    autoRecovery: boolean
  }
  abTesting: {
    enabled: boolean
    defaultTrafficAllocation: number
  }
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceOptimizationConfig = {
  webVitals: {
    enabled: true,
    reportingInterval: 30,
    enableAlerts: true
  },
  caching: {
    enabled: true,
    maxMemorySize: 50 * 1024 * 1024, // 50MB
    compressionEnabled: true
  },
  errorRecovery: {
    enabled: true,
    escalationThreshold: 5,
    autoRecovery: true
  },
  abTesting: {
    enabled: true,
    defaultTrafficAllocation: 50
  }
}