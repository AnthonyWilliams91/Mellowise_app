/**
 * Mobile Enhancement Types
 * MELLOWISE-027: Desktop-Optimized Mobile Enhancement
 */

// Touch and Gesture Types
export interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'drag';
  startPosition: { x: number; y: number };
  endPosition?: { x: number; y: number };
  force?: number;
  duration: number;
}

export interface TouchInteraction {
  target: string;
  gesture: TouchGesture;
  timestamp: number;
  handled: boolean;
  fallbackAction?: string;
}

export interface TouchOptimization {
  minTouchTarget: number; // px
  touchPadding: number; // px
  hapticFeedback: boolean;
  gestureThreshold: number; // px
  longPressDelay: number; // ms
  doubleClickDelay: number; // ms
}

// Responsive Design Types
export interface ScreenSize {
  width: number;
  height: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
}

export interface BreakpointConfig {
  mobile: number; // px
  tablet: number; // px
  desktop: number; // px
  large: number; // px
}

export interface ResponsiveLayout {
  breakpoint: keyof BreakpointConfig;
  columns: number;
  spacing: number;
  gridGap: number;
  containerPadding: number;
}

export interface AdaptiveComponent {
  componentId: string;
  desktopLayout: ResponsiveLayout;
  mobileLayout: ResponsiveLayout;
  adaptationRules: ComponentAdaptation[];
}

export interface ComponentAdaptation {
  condition: 'screen-size' | 'orientation' | 'touch-device' | 'performance';
  threshold: number | string;
  changes: {
    layout?: Partial<ResponsiveLayout>;
    styling?: Record<string, string>;
    behavior?: string;
  };
}

// Offline Mode Types
export interface OfflineCache {
  questions: CachedQuestion[];
  progress: CachedProgress[];
  analytics: CachedAnalytics[];
  lastSync: string; // ISO datetime
  cacheSize: number; // bytes
  maxCacheSize: number; // bytes
}

export interface CachedQuestion {
  id: string;
  type: 'logical-reasoning' | 'reading-comprehension' | 'logic-games';
  content: string;
  answers: string[];
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  cachedAt: string; // ISO datetime
  priority: number; // 1-5
}

export interface CachedProgress {
  userId: string;
  sessionId: string;
  questionId: string;
  answer: string;
  correct: boolean;
  timeSpent: number; // ms
  attempts: number;
  completedAt: string; // ISO datetime
  syncStatus: 'cached' | 'syncing' | 'synced' | 'failed';
}

export interface CachedAnalytics {
  event: string;
  data: Record<string, unknown>;
  timestamp: string; // ISO datetime
  syncStatus: 'cached' | 'syncing' | 'synced' | 'failed';
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null; // ISO datetime
  pendingSync: number;
  syncInProgress: boolean;
  failedSync: number;
  nextSyncAttempt: string | null; // ISO datetime
}

// Progressive Web App Types
export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: PWAIcon[];
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
}

export interface PWAIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

export interface ServiceWorkerConfig {
  cacheName: string;
  version: string;
  cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxAge: number; // hours
  maxEntries: number;
  precacheAssets: string[];
}

export interface InstallPrompt {
  isInstallable: boolean;
  hasBeenPrompted: boolean;
  userChoice: 'accepted' | 'dismissed' | null;
  installEvent: Event | null;
}

// Performance Optimization Types
export interface PerformanceMetrics {
  loadTime: number; // ms
  renderTime: number; // ms
  interactiveTime: number; // ms
  memoryUsage: number; // MB
  batteryLevel?: number; // 0-1
  networkSpeed: 'slow-2g' | '2g' | '3g' | '4g' | 'wifi';
}

export interface AssetOptimization {
  lazyLoading: boolean;
  imageCompression: number; // 0-1
  bundleSplitting: boolean;
  treeShaking: boolean;
  minification: boolean;
  gzipCompression: boolean;
}

export interface BatteryOptimization {
  reducedAnimations: boolean;
  lowerRefreshRate: boolean;
  dimmedColors: boolean;
  reducedNetworkCalls: boolean;
  backgroundSyncDisabled: boolean;
}

// Orientation and Layout Types
export interface OrientationConfig {
  supportedOrientations: ('portrait' | 'landscape')[];
  autoRotate: boolean;
  lockOrientation?: 'portrait' | 'landscape';
  orientationChangeDelay: number; // ms
}

export interface OrientationLayout {
  orientation: 'portrait' | 'landscape';
  layout: {
    header: { height: number; position: 'fixed' | 'static' };
    sidebar: { width: number; position: 'left' | 'right' | 'hidden' };
    content: { padding: number; maxWidth?: number };
    footer: { height: number; position: 'fixed' | 'static' };
  };
}

// Mobile Theme and Styling Types
export interface MobileTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  typography: {
    baseFontSize: number; // px
    lineHeight: number;
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: number; // px
    sm: number; // px
    md: number; // px
    lg: number; // px
    xl: number; // px
  };
  borderRadius: number; // px
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface DarkModeConfig {
  enabled: boolean;
  automatic: boolean; // Based on system preference
  scheduledTime?: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  batteryThreshold?: number; // 0-1, auto-enable when battery low
}

// Mobile Navigation Types
export interface MobileNavigation {
  type: 'bottom-tabs' | 'hamburger' | 'floating' | 'gesture';
  items: MobileNavItem[];
  customization: {
    showLabels: boolean;
    badgeSupport: boolean;
    hapticFeedback: boolean;
  };
}

export interface MobileNavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  disabled?: boolean;
}

// Mobile Input Types
export interface MobileInputConfig {
  keyboards: {
    numeric: boolean;
    email: boolean;
    url: boolean;
    search: boolean;
    tel: boolean;
  };
  autocomplete: boolean;
  spellcheck: boolean;
  autofocus: boolean;
  hapticFeedback: boolean;
  voiceInput: boolean;
}

// Mobile Analytics Types
export interface MobileUsageAnalytics {
  sessionDuration: number; // ms
  screenOrientation: 'portrait' | 'landscape';
  deviceType: 'phone' | 'tablet' | 'desktop';
  networkType: string;
  batteryLevel?: number; // 0-1
  memoryUsage: number; // MB
  touchInteractions: TouchInteraction[];
  performanceMetrics: PerformanceMetrics;
}

// Configuration and Settings Types
export interface MobileEnhancementConfig {
  touchOptimization: TouchOptimization;
  breakpoints: BreakpointConfig;
  offlineMode: {
    enabled: boolean;
    maxCacheSize: number; // bytes
    syncInterval: number; // minutes
    retryAttempts: number;
  };
  pwa: {
    enabled: boolean;
    installPrompt: boolean;
    backgroundSync: boolean;
  };
  performance: {
    lazyLoading: boolean;
    imageOptimization: boolean;
    bundleSplitting: boolean;
  };
  battery: BatteryOptimization;
  theme: {
    darkMode: DarkModeConfig;
    customTheme?: Partial<MobileTheme>;
  };
  navigation: MobileNavigation;
  input: MobileInputConfig;
}

// Default Configurations
export const DEFAULT_TOUCH_OPTIMIZATION: TouchOptimization = {
  minTouchTarget: 44, // iOS HIG recommendation
  touchPadding: 8,
  hapticFeedback: true,
  gestureThreshold: 10,
  longPressDelay: 500,
  doubleClickDelay: 300
};

export const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200
};

export const DEFAULT_SERVICE_WORKER_CONFIG: ServiceWorkerConfig = {
  cacheName: 'mellowise-mobile-v1',
  version: '1.0.0',
  cacheStrategy: 'stale-while-revalidate',
  maxAge: 24, // 24 hours
  maxEntries: 100,
  precacheAssets: [
    '/',
    '/manifest.json',
    '/offline.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
  ]
};

export const DEFAULT_MOBILE_THEME: MobileTheme = {
  name: 'Default Mobile',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  typography: {
    baseFontSize: 16,
    lineHeight: 1.5,
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: 8,
  shadows: {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }
};

// Type Guards
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isInstallableApp(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export function supportsOfflineMode(): boolean {
  return 'serviceWorker' in navigator && 'caches' in window;
}