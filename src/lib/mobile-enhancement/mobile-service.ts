/**
 * Mobile Enhancement Service
 * MELLOWISE-027: Desktop-Optimized Mobile Enhancement
 */

import type {
  MobileEnhancementConfig,
  TouchGesture,
  TouchInteraction,
  OfflineCache,
  CachedQuestion,
  CachedProgress,
  SyncStatus,
  PWAManifest,
  InstallPrompt,
  PerformanceMetrics,
  MobileUsageAnalytics,
  OrientationConfig,
  MobileTheme,
  DEFAULT_TOUCH_OPTIMIZATION,
  DEFAULT_BREAKPOINTS,
  DEFAULT_SERVICE_WORKER_CONFIG,
  DEFAULT_MOBILE_THEME
} from '@/types/mobile-enhancement';

/**
 * Core Mobile Enhancement Service
 * Provides desktop-optimized mobile experience with offline capabilities
 */
export class MobileEnhancementService {
  private config: MobileEnhancementConfig;
  private offlineCache: OfflineCache;
  private syncStatus: SyncStatus;
  private installPrompt: InstallPrompt;
  private performanceMetrics: PerformanceMetrics;
  private usageAnalytics: MobileUsageAnalytics[];
  private orientationConfig: OrientationConfig;
  private currentTheme: MobileTheme;
  private serviceWorker: ServiceWorkerRegistration | null = null;

  constructor(config?: Partial<MobileEnhancementConfig>) {
    this.config = this.initializeConfig(config);
    this.offlineCache = this.initializeOfflineCache();
    this.syncStatus = this.initializeSyncStatus();
    this.installPrompt = this.initializeInstallPrompt();
    this.performanceMetrics = this.initializePerformanceMetrics();
    this.usageAnalytics = [];
    this.orientationConfig = this.initializeOrientationConfig();
    this.currentTheme = config?.theme?.customTheme
      ? { ...DEFAULT_MOBILE_THEME, ...config.theme.customTheme }
      : DEFAULT_MOBILE_THEME;

    this.initializeService();
  }

  /**
   * Initialize the mobile enhancement service
   */
  private async initializeService(): Promise<void> {
    try {
      // Register service worker for offline functionality
      if (this.config.pwa.enabled && this.supportsServiceWorker()) {
        await this.registerServiceWorker();
      }

      // Set up offline mode if enabled
      if (this.config.offlineMode.enabled) {
        await this.initializeOfflineMode();
      }

      // Configure touch optimizations
      this.setupTouchOptimizations();

      // Set up orientation handling
      this.setupOrientationHandling();

      // Initialize PWA features
      if (this.config.pwa.enabled) {
        await this.initializePWAFeatures();
      }

      // Start performance monitoring
      this.startPerformanceMonitoring();

      // Set up battery optimization
      this.setupBatteryOptimization();

      console.log('Mobile Enhancement Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Mobile Enhancement Service:', error);
      throw new Error(`Mobile service initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initialize configuration with defaults
   */
  private initializeConfig(config?: Partial<MobileEnhancementConfig>): MobileEnhancementConfig {
    return {
      touchOptimization: { ...DEFAULT_TOUCH_OPTIMIZATION, ...config?.touchOptimization },
      breakpoints: { ...DEFAULT_BREAKPOINTS, ...config?.breakpoints },
      offlineMode: {
        enabled: true,
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        syncInterval: 5, // minutes
        retryAttempts: 3,
        ...config?.offlineMode
      },
      pwa: {
        enabled: true,
        installPrompt: true,
        backgroundSync: true,
        ...config?.pwa
      },
      performance: {
        lazyLoading: true,
        imageOptimization: true,
        bundleSplitting: true,
        ...config?.performance
      },
      battery: {
        reducedAnimations: false,
        lowerRefreshRate: false,
        dimmedColors: false,
        reducedNetworkCalls: false,
        backgroundSyncDisabled: false,
        ...config?.battery
      },
      theme: {
        darkMode: {
          enabled: true,
          automatic: true,
          ...config?.theme?.darkMode
        },
        customTheme: config?.theme?.customTheme
      },
      navigation: {
        type: 'bottom-tabs',
        items: [
          { id: 'home', label: 'Home', icon: 'home', route: '/' },
          { id: 'practice', label: 'Practice', icon: 'book', route: '/practice' },
          { id: 'analytics', label: 'Analytics', icon: 'chart', route: '/analytics' },
          { id: 'profile', label: 'Profile', icon: 'user', route: '/profile' }
        ],
        customization: {
          showLabels: true,
          badgeSupport: true,
          hapticFeedback: true
        },
        ...config?.navigation
      },
      input: {
        keyboards: {
          numeric: true,
          email: true,
          url: true,
          search: true,
          tel: true
        },
        autocomplete: true,
        spellcheck: true,
        autofocus: false,
        hapticFeedback: true,
        voiceInput: true,
        ...config?.input
      }
    };
  }

  /**
   * Initialize offline cache
   */
  private initializeOfflineCache(): OfflineCache {
    const cached = localStorage.getItem('mellowise_offline_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        console.warn('Failed to parse cached offline data, initializing fresh cache');
      }
    }

    return {
      questions: [],
      progress: [],
      analytics: [],
      lastSync: new Date().toISOString(),
      cacheSize: 0,
      maxCacheSize: this.config.offlineMode.maxCacheSize
    };
  }

  /**
   * Initialize sync status
   */
  private initializeSyncStatus(): SyncStatus {
    return {
      isOnline: navigator.onLine,
      lastSync: null,
      pendingSync: 0,
      syncInProgress: false,
      failedSync: 0,
      nextSyncAttempt: null
    };
  }

  /**
   * Initialize install prompt
   */
  private initializeInstallPrompt(): InstallPrompt {
    return {
      isInstallable: false,
      hasBeenPrompted: false,
      userChoice: null,
      installEvent: null
    };
  }

  /**
   * Initialize performance metrics
   */
  private initializePerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      renderTime: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      interactiveTime: navigation ? navigation.domInteractive - navigation.fetchStart : 0,
      memoryUsage: this.getMemoryUsage(),
      batteryLevel: undefined,
      networkSpeed: this.getNetworkSpeed()
    };
  }

  /**
   * Initialize orientation configuration
   */
  private initializeOrientationConfig(): OrientationConfig {
    return {
      supportedOrientations: ['portrait', 'landscape'],
      autoRotate: true,
      orientationChangeDelay: 300
    };
  }

  /**
   * Register service worker for PWA functionality
   */
  private async registerServiceWorker(): Promise<void> {
    if (!this.supportsServiceWorker()) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.serviceWorker = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Handle service worker updates
      this.serviceWorker.addEventListener('updatefound', () => {
        const newWorker = this.serviceWorker?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              this.notifyUpdate();
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Initialize offline mode functionality
   */
  private async initializeOfflineMode(): Promise<void> {
    // Set up network status monitoring
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.syncCachedData();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });

    // Set up periodic sync
    setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.syncInProgress) {
        this.syncCachedData();
      }
    }, this.config.offlineMode.syncInterval * 60 * 1000);

    // Load cached data
    await this.loadCachedData();
  }

  /**
   * Set up touch optimizations
   */
  private setupTouchOptimizations(): void {
    if (!this.isTouchDevice()) return;

    // Add touch-friendly CSS classes
    document.documentElement.classList.add('touch-device');

    // Set up gesture detection
    this.setupGestureDetection();

    // Add haptic feedback support
    if (this.config.touchOptimization.hapticFeedback && this.supportsHapticFeedback()) {
      this.enableHapticFeedback();
    }
  }

  /**
   * Set up gesture detection
   */
  private setupGestureDetection(): void {
    let touchStartTime: number;
    let touchStartPos: { x: number; y: number };

    document.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartPos = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!touchStartTime || !touchStartPos) return;

      const touchEndTime = Date.now();
      const touchEndPos = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };

      const gesture = this.detectGesture(
        touchStartPos,
        touchEndPos,
        touchEndTime - touchStartTime
      );

      if (gesture) {
        this.handleGesture(gesture, e.target as Element);
      }
    }, { passive: true });
  }

  /**
   * Detect gesture type based on touch data
   */
  private detectGesture(
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    duration: number
  ): TouchGesture | null {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Long press
    if (duration > this.config.touchOptimization.longPressDelay && distance < this.config.touchOptimization.gestureThreshold) {
      return {
        type: 'long-press',
        startPosition: startPos,
        endPosition: endPos,
        duration
      };
    }

    // Swipe
    if (distance > this.config.touchOptimization.gestureThreshold) {
      return {
        type: 'swipe',
        startPosition: startPos,
        endPosition: endPos,
        duration
      };
    }

    // Tap
    if (duration < 200 && distance < this.config.touchOptimization.gestureThreshold) {
      return {
        type: 'tap',
        startPosition: startPos,
        duration
      };
    }

    return null;
  }

  /**
   * Handle detected gestures
   */
  private handleGesture(gesture: TouchGesture, target: Element): void {
    const interaction: TouchInteraction = {
      target: this.getElementSelector(target),
      gesture,
      timestamp: Date.now(),
      handled: false
    };

    // Custom gesture handling logic here
    switch (gesture.type) {
      case 'long-press':
        this.handleLongPress(target);
        interaction.handled = true;
        break;
      case 'swipe':
        this.handleSwipe(gesture, target);
        interaction.handled = true;
        break;
      case 'tap':
        this.handleTap(target);
        interaction.handled = true;
        break;
    }

    this.trackTouchInteraction(interaction);
  }

  /**
   * Set up orientation handling
   */
  private setupOrientationHandling(): void {
    const handleOrientationChange = () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, this.orientationConfig.orientationChangeDelay);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }

  /**
   * Handle orientation changes
   */
  private handleOrientationChange(): void {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    // Update CSS classes
    document.documentElement.classList.remove('portrait', 'landscape');
    document.documentElement.classList.add(orientation);

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('mellowise:orientation-change', {
      detail: { orientation }
    }));

    // Update analytics
    this.trackOrientationChange(orientation);
  }

  /**
   * Initialize PWA features
   */
  private async initializePWAFeatures(): Promise<void> {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt.installEvent = e;
      this.installPrompt.isInstallable = true;

      if (this.config.pwa.installPrompt && !this.installPrompt.hasBeenPrompted) {
        this.showInstallPrompt();
      }
    });

    // Handle app installed
    window.addEventListener('appinstalled', () => {
      this.installPrompt.userChoice = 'accepted';
      this.trackPWAInstall();
    });

    // Generate manifest
    await this.generateManifest();
  }

  /**
   * Generate PWA manifest
   */
  private async generateManifest(): Promise<void> {
    const manifest: PWAManifest = {
      name: 'Mellowise - LSAT Prep',
      short_name: 'Mellowise',
      description: 'AI-powered LSAT preparation platform',
      start_url: '/',
      display: 'standalone',
      background_color: this.currentTheme.colors.background,
      theme_color: this.currentTheme.colors.primary,
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      orientation: 'portrait-primary',
      scope: '/'
    };

    // Create manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }

    // Create blob URL for manifest
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    manifestLink.href = URL.createObjectURL(manifestBlob);
  }

  /**
   * Show install prompt
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt.isInstallable || !this.installPrompt.installEvent) {
      return false;
    }

    try {
      const result = await (this.installPrompt.installEvent as any).prompt();
      this.installPrompt.hasBeenPrompted = true;
      this.installPrompt.userChoice = result.outcome;

      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    // Monitor FPS
    this.monitorFrameRate();

    // Monitor memory usage
    setInterval(() => {
      this.performanceMetrics.memoryUsage = this.getMemoryUsage();
    }, 30000);

    // Monitor battery
    this.monitorBattery();

    // Monitor network speed
    setInterval(() => {
      this.performanceMetrics.networkSpeed = this.getNetworkSpeed();
    }, 60000);
  }

  /**
   * Monitor frame rate
   */
  private monitorFrameRate(): void {
    let lastTime = performance.now();
    let frameCount = 0;

    const measureFPS = (currentTime: number) => {
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));

        // If FPS is low and battery optimization is enabled
        if (fps < 30 && this.shouldOptimizeForBattery()) {
          this.enableBatteryOptimizations();
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor battery status
   */
  private async monitorBattery(): Promise<void> {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();

        this.performanceMetrics.batteryLevel = battery.level;

        battery.addEventListener('levelchange', () => {
          this.performanceMetrics.batteryLevel = battery.level;

          if (battery.level < 0.2) {
            this.enableBatteryOptimizations();
          }
        });

        battery.addEventListener('chargingchange', () => {
          if (!battery.charging && battery.level < 0.3) {
            this.enableBatteryOptimizations();
          } else if (battery.charging && battery.level > 0.5) {
            this.disableBatteryOptimizations();
          }
        });
      } catch (error) {
        console.warn('Battery monitoring not supported');
      }
    }
  }

  /**
   * Set up battery optimization
   */
  private setupBatteryOptimization(): void {
    // Apply initial battery settings
    if (this.shouldOptimizeForBattery()) {
      this.enableBatteryOptimizations();
    }
  }

  /**
   * Enable battery optimizations
   */
  private enableBatteryOptimizations(): void {
    document.documentElement.classList.add('battery-saver');

    if (this.config.battery.reducedAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }

    if (this.config.battery.dimmedColors) {
      document.documentElement.style.setProperty('--brightness', '0.8');
    }

    console.log('Battery optimizations enabled');
  }

  /**
   * Disable battery optimizations
   */
  private disableBatteryOptimizations(): void {
    document.documentElement.classList.remove('battery-saver');
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.style.removeProperty('--brightness');

    console.log('Battery optimizations disabled');
  }

  /**
   * Cache question for offline use
   */
  public async cacheQuestion(question: CachedQuestion): Promise<void> {
    if (!this.config.offlineMode.enabled) return;

    // Check cache size limits
    if (this.offlineCache.cacheSize >= this.offlineCache.maxCacheSize) {
      await this.cleanupCache();
    }

    // Add to cache
    const existingIndex = this.offlineCache.questions.findIndex(q => q.id === question.id);
    if (existingIndex >= 0) {
      this.offlineCache.questions[existingIndex] = question;
    } else {
      this.offlineCache.questions.push(question);
    }

    // Update cache size
    this.updateCacheSize();

    // Persist to localStorage
    await this.persistCache();
  }

  /**
   * Cache progress data
   */
  public async cacheProgress(progress: CachedProgress): Promise<void> {
    if (!this.config.offlineMode.enabled) return;

    this.offlineCache.progress.push(progress);
    await this.persistCache();
  }

  /**
   * Sync cached data with server
   */
  public async syncCachedData(): Promise<void> {
    if (!this.syncStatus.isOnline || this.syncStatus.syncInProgress) return;

    this.syncStatus.syncInProgress = true;

    try {
      // Sync progress data
      const pendingProgress = this.offlineCache.progress.filter(p => p.syncStatus === 'cached');
      for (const progress of pendingProgress) {
        await this.syncProgressItem(progress);
      }

      // Sync analytics data
      const pendingAnalytics = this.offlineCache.analytics.filter(a => a.syncStatus === 'cached');
      for (const analytics of pendingAnalytics) {
        await this.syncAnalyticsItem(analytics);
      }

      this.syncStatus.lastSync = new Date().toISOString();
      this.syncStatus.pendingSync = 0;
      this.syncStatus.failedSync = 0;

      console.log('Offline data sync completed successfully');
    } catch (error) {
      this.syncStatus.failedSync++;
      this.syncStatus.nextSyncAttempt = new Date(Date.now() + 60000 * this.syncStatus.failedSync).toISOString();

      console.error('Sync failed:', error);
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  /**
   * Get cached questions for offline use
   */
  public getCachedQuestions(type?: 'logical-reasoning' | 'reading-comprehension' | 'logic-games'): CachedQuestion[] {
    const questions = this.offlineCache.questions;
    return type ? questions.filter(q => q.type === type) : questions;
  }

  /**
   * Check if app is in offline mode
   */
  public isOffline(): boolean {
    return !this.syncStatus.isOnline;
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Update mobile theme
   */
  public updateTheme(theme: Partial<MobileTheme>): void {
    this.currentTheme = { ...this.currentTheme, ...theme };
    this.applyTheme();
  }

  /**
   * Toggle dark mode
   */
  public toggleDarkMode(): void {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    this.config.theme.darkMode.enabled = isDark;

    // Update theme colors for dark mode
    if (isDark) {
      this.applyDarkTheme();
    } else {
      this.applyLightTheme();
    }
  }

  // Helper methods
  private supportsServiceWorker(): boolean {
    return 'serviceWorker' in navigator;
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private supportsHapticFeedback(): boolean {
    return 'vibrate' in navigator;
  }

  private enableHapticFeedback(): void {
    document.addEventListener('click', (e) => {
      if ((e.target as Element)?.closest('button, [role="button"], a')) {
        navigator.vibrate?.(10);
      }
    });
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  private getNetworkSpeed(): 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.effectiveType || '4g';
    }
    return '4g';
  }

  private shouldOptimizeForBattery(): boolean {
    if (this.performanceMetrics.batteryLevel !== undefined) {
      return this.performanceMetrics.batteryLevel < 0.2;
    }
    return false;
  }

  private getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private async cleanupCache(): Promise<void> {
    // Remove oldest cached questions
    this.offlineCache.questions.sort((a, b) =>
      new Date(a.cachedAt).getTime() - new Date(b.cachedAt).getTime()
    );

    const toRemove = Math.floor(this.offlineCache.questions.length * 0.2);
    this.offlineCache.questions.splice(0, toRemove);

    this.updateCacheSize();
    await this.persistCache();
  }

  private updateCacheSize(): void {
    const dataSize = JSON.stringify(this.offlineCache).length;
    this.offlineCache.cacheSize = dataSize;
  }

  private async persistCache(): Promise<void> {
    try {
      localStorage.setItem('mellowise_offline_cache', JSON.stringify(this.offlineCache));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  private async loadCachedData(): Promise<void> {
    const cached = localStorage.getItem('mellowise_offline_cache');
    if (cached) {
      try {
        this.offlineCache = JSON.parse(cached);
      } catch (error) {
        console.warn('Failed to load cached data:', error);
      }
    }
  }

  private async syncProgressItem(progress: CachedProgress): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      progress.syncStatus = 'synced';
    } catch (error) {
      progress.syncStatus = 'failed';
      throw error;
    }
  }

  private async syncAnalyticsItem(analytics: CachedAnalytics): Promise<void> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 50));
      analytics.syncStatus = 'synced';
    } catch (error) {
      analytics.syncStatus = 'failed';
      throw error;
    }
  }

  private handleLongPress(target: Element): void {
    // Custom long press handling
    target.classList.add('long-pressed');
    setTimeout(() => target.classList.remove('long-pressed'), 200);
  }

  private handleSwipe(gesture: TouchGesture, target: Element): void {
    if (!gesture.endPosition) return;

    const deltaX = gesture.endPosition.x - gesture.startPosition.x;
    const deltaY = gesture.endPosition.y - gesture.startPosition.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const direction = deltaX > 0 ? 'right' : 'left';
      this.handleHorizontalSwipe(direction, target);
    } else {
      const direction = deltaY > 0 ? 'down' : 'up';
      this.handleVerticalSwipe(direction, target);
    }
  }

  private handleTap(target: Element): void {
    // Enhanced tap handling for mobile
    target.classList.add('tapped');
    setTimeout(() => target.classList.remove('tapped'), 150);
  }

  private handleHorizontalSwipe(direction: 'left' | 'right', target: Element): void {
    window.dispatchEvent(new CustomEvent('mellowise:swipe', {
      detail: { direction, target }
    }));
  }

  private handleVerticalSwipe(direction: 'up' | 'down', target: Element): void {
    window.dispatchEvent(new CustomEvent('mellowise:swipe', {
      detail: { direction, target }
    }));
  }

  private trackTouchInteraction(interaction: TouchInteraction): void {
    // Add to analytics
    this.offlineCache.analytics.push({
      event: 'touch_interaction',
      data: interaction,
      timestamp: new Date().toISOString(),
      syncStatus: 'cached'
    });
  }

  private trackOrientationChange(orientation: 'portrait' | 'landscape'): void {
    this.offlineCache.analytics.push({
      event: 'orientation_change',
      data: { orientation },
      timestamp: new Date().toISOString(),
      syncStatus: 'cached'
    });
  }

  private trackPWAInstall(): void {
    this.offlineCache.analytics.push({
      event: 'pwa_install',
      data: { timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
      syncStatus: 'cached'
    });
  }

  private applyTheme(): void {
    const root = document.documentElement;

    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    root.style.setProperty('--font-size-base', `${this.currentTheme.typography.baseFontSize}px`);
    root.style.setProperty('--line-height', `${this.currentTheme.typography.lineHeight}`);
    root.style.setProperty('--border-radius', `${this.currentTheme.borderRadius}px`);

    Object.entries(this.currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, `${value}px`);
    });
  }

  private applyDarkTheme(): void {
    const darkColors = {
      ...this.currentTheme.colors,
      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      border: '#404040'
    };

    Object.entries(darkColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }

  private applyLightTheme(): void {
    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }

  private notifyUpdate(): void {
    window.dispatchEvent(new CustomEvent('mellowise:update-available', {
      detail: { message: 'New app version available' }
    }));
  }
}