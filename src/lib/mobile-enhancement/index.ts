/**
 * Mobile Enhancement Module
 * MELLOWISE-027: Desktop-Optimized Mobile Enhancement
 */

// Core services
export { MobileEnhancementService } from './mobile-service';
export { ResponsiveService } from './responsive-service';
export { PWAService } from './pwa-service';

// Types and interfaces
export type {
  // Touch and Gesture Types
  TouchGesture,
  TouchInteraction,
  TouchOptimization,

  // Responsive Design Types
  ScreenSize,
  BreakpointConfig,
  ResponsiveLayout,
  AdaptiveComponent,
  ComponentAdaptation,

  // Offline Mode Types
  OfflineCache,
  CachedQuestion,
  CachedProgress,
  CachedAnalytics,
  SyncStatus,

  // Progressive Web App Types
  PWAManifest,
  PWAIcon,
  ServiceWorkerConfig,
  InstallPrompt,

  // Performance Optimization Types
  PerformanceMetrics,
  AssetOptimization,
  BatteryOptimization,

  // Orientation and Layout Types
  OrientationConfig,
  OrientationLayout,

  // Mobile Theme and Styling Types
  MobileTheme,
  DarkModeConfig,

  // Mobile Navigation Types
  MobileNavigation,
  MobileNavItem,

  // Mobile Input Types
  MobileInputConfig,

  // Mobile Analytics Types
  MobileUsageAnalytics,

  // Configuration Types
  MobileEnhancementConfig,

  // Default Configurations
  DEFAULT_TOUCH_OPTIMIZATION,
  DEFAULT_BREAKPOINTS,
  DEFAULT_SERVICE_WORKER_CONFIG,
  DEFAULT_MOBILE_THEME
} from '@/types/mobile-enhancement';

// Type guards
export {
  isTouchDevice,
  isMobileDevice,
  isInstallableApp,
  supportsOfflineMode
} from '@/types/mobile-enhancement';

/**
 * Initialize mobile enhancement for the application
 */
export function initializeMobileEnhancement(config?: Partial<import('@/types/mobile-enhancement').MobileEnhancementConfig>) {
  return new MobileEnhancementService(config);
}

/**
 * Initialize responsive design service
 */
export function initializeResponsiveService(breakpoints?: import('@/types/mobile-enhancement').BreakpointConfig) {
  return new ResponsiveService(breakpoints);
}

/**
 * Initialize PWA service
 */
export function initializePWAService(config?: import('@/types/mobile-enhancement').ServiceWorkerConfig) {
  return new PWAService(config);
}

/**
 * Mobile Enhancement Utilities
 */
export const MobileUtils = {
  /**
   * Detect if device is mobile
   */
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  /**
   * Detect if device supports touch
   */
  isTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get device pixel ratio
   */
  getPixelRatio(): number {
    return window.devicePixelRatio || 1;
  },

  /**
   * Get viewport dimensions
   */
  getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  },

  /**
   * Get screen orientation
   */
  getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },

  /**
   * Check if running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },

  /**
   * Get safe area insets (iOS)
   */
  getSafeAreaInsets(): {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } {
    const computedStyle = getComputedStyle(document.documentElement);

    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
    };
  },

  /**
   * Debounce function for resize events
   */
  debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    }) as T;
  },

  /**
   * Throttle function for scroll/touch events
   */
  throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  /**
   * Add touch-friendly click handler
   */
  addTouchHandler(element: HTMLElement, handler: (event: Event) => void): () => void {
    let touchStartTime: number;
    let touchStartPos: { x: number; y: number };

    const touchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
      touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    };

    const touchEnd = (e: TouchEvent) => {
      if (!touchStartTime || !touchStartPos) return;

      const touchEndTime = Date.now();
      const touchEndPos = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const duration = touchEndTime - touchStartTime;
      const distance = Math.sqrt(
        Math.pow(touchEndPos.x - touchStartPos.x, 2) +
        Math.pow(touchEndPos.y - touchStartPos.y, 2)
      );

      // Consider it a tap if duration < 200ms and distance < 10px
      if (duration < 200 && distance < 10) {
        handler(e);
      }
    };

    const click = (e: MouseEvent) => {
      // Only handle if not a touch device
      if (!this.isTouch()) {
        handler(e);
      }
    };

    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchend', touchEnd, { passive: true });
    element.addEventListener('click', click);

    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchend', touchEnd);
      element.removeEventListener('click', click);
    };
  },

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Generate responsive image srcset
   */
  generateSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes
      .map(size => `${baseUrl}?w=${size}&q=80 ${size}w`)
      .join(', ');
  },

  /**
   * Generate responsive image sizes attribute
   */
  generateSizes(breakpoints: import('@/types/mobile-enhancement').BreakpointConfig): string {
    return [
      `(max-width: ${breakpoints.mobile}px) 100vw`,
      `(max-width: ${breakpoints.tablet}px) 50vw`,
      `(max-width: ${breakpoints.desktop}px) 33vw`,
      '25vw'
    ].join(', ');
  }
};

/**
 * React hooks for mobile enhancement (if using React)
 */
export const MobileHooks = {
  /**
   * Hook for responsive breakpoint detection
   */
  useBreakpoint: (breakpoints: import('@/types/mobile-enhancement').BreakpointConfig) => {
    // This would be implemented as a React hook in a React environment
    // For now, return a function that can be used to check breakpoints
    return {
      isMobile: () => window.innerWidth <= breakpoints.mobile,
      isTablet: () => window.innerWidth > breakpoints.mobile && window.innerWidth <= breakpoints.tablet,
      isDesktop: () => window.innerWidth > breakpoints.tablet
    };
  },

  /**
   * Hook for orientation detection
   */
  useOrientation: () => {
    return {
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isPortrait: window.innerHeight > window.innerWidth,
      isLandscape: window.innerWidth >= window.innerHeight
    };
  },

  /**
   * Hook for network status
   */
  useNetworkStatus: () => {
    return {
      isOnline: navigator.onLine,
      isOffline: !navigator.onLine
    };
  }
};

/**
 * CSS-in-JS utilities for mobile enhancement
 */
export const MobileStyles = {
  /**
   * Generate responsive CSS for breakpoints
   */
  responsive: (breakpoints: import('@/types/mobile-enhancement').BreakpointConfig, styles: {
    mobile?: Record<string, string>;
    tablet?: Record<string, string>;
    desktop?: Record<string, string>;
    large?: Record<string, string>;
  }) => {
    const css: string[] = [];

    if (styles.mobile) {
      css.push(`@media (max-width: ${breakpoints.mobile}px) { ${Object.entries(styles.mobile).map(([k, v]) => `${k}: ${v}`).join('; ')} }`);
    }

    if (styles.tablet) {
      css.push(`@media (min-width: ${breakpoints.mobile + 1}px) and (max-width: ${breakpoints.tablet}px) { ${Object.entries(styles.tablet).map(([k, v]) => `${k}: ${v}`).join('; ')} }`);
    }

    if (styles.desktop) {
      css.push(`@media (min-width: ${breakpoints.tablet + 1}px) and (max-width: ${breakpoints.desktop}px) { ${Object.entries(styles.desktop).map(([k, v]) => `${k}: ${v}`).join('; ')} }`);
    }

    if (styles.large) {
      css.push(`@media (min-width: ${breakpoints.desktop + 1}px) { ${Object.entries(styles.large).map(([k, v]) => `${k}: ${v}`).join('; ')} }`);
    }

    return css.join(' ');
  },

  /**
   * Touch-friendly button styles
   */
  touchButton: {
    minHeight: '44px',
    minWidth: '44px',
    padding: '12px 16px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation'
  },

  /**
   * Safe area padding for iOS
   */
  safeArea: {
    paddingTop: 'env(safe-area-inset-top)',
    paddingRight: 'env(safe-area-inset-right)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)'
  },

  /**
   * Hide scrollbars while maintaining scroll functionality
   */
  hideScrollbars: {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitScrollbar: {
      display: 'none'
    }
  }
};