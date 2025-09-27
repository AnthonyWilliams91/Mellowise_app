/**
 * Progressive Web App Service
 * MELLOWISE-027: Desktop-Optimized Mobile Enhancement
 */

import type {
  PWAManifest,
  ServiceWorkerConfig,
  InstallPrompt,
  DEFAULT_SERVICE_WORKER_CONFIG
} from '@/types/mobile-enhancement';

/**
 * PWA Service for Progressive Web App functionality
 * Handles service worker, manifest, and app installation
 */
export class PWAService {
  private config: ServiceWorkerConfig;
  private manifest: PWAManifest;
  private installPrompt: InstallPrompt;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private networkStatus = navigator.onLine;

  constructor(config: ServiceWorkerConfig = DEFAULT_SERVICE_WORKER_CONFIG) {
    this.config = config;
    this.manifest = this.createDefaultManifest();
    this.installPrompt = {
      isInstallable: false,
      hasBeenPrompted: false,
      userChoice: null,
      installEvent: null
    };

    this.initializePWA();
  }

  /**
   * Initialize PWA features
   */
  private async initializePWA(): Promise<void> {
    try {
      // Register service worker
      if (this.isServiceWorkerSupported()) {
        await this.registerServiceWorker();
      }

      // Setup install prompt handling
      this.setupInstallPrompt();

      // Setup network status monitoring
      this.setupNetworkMonitoring();

      // Generate and inject manifest
      await this.injectManifest();

      // Setup update handling
      this.setupUpdateHandling();

      console.log('PWA Service initialized successfully');
    } catch (error) {
      console.error('PWA initialization failed:', error);
      throw new Error(`PWA initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create default PWA manifest
   */
  private createDefaultManifest(): PWAManifest {
    return {
      name: 'Mellowise - AI-Powered LSAT Prep',
      short_name: 'Mellowise',
      description: 'Comprehensive LSAT preparation platform with AI-powered personalization',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#6366f1',
      orientation: 'portrait-primary',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-192x192-maskable.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable'
        },
        {
          src: '/icons/icon-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    };
  }

  /**
   * Check if service worker is supported
   */
  private isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('Service Worker registered:', this.serviceWorkerRegistration.scope);

      // Handle service worker state changes
      if (this.serviceWorkerRegistration.installing) {
        this.handleServiceWorkerState(this.serviceWorkerRegistration.installing);
      }

      if (this.serviceWorkerRegistration.waiting) {
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
      }

      if (this.serviceWorkerRegistration.active) {
        console.log('Service Worker is active and running');
      }

      // Listen for updates
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        const newWorker = this.serviceWorkerRegistration?.installing;
        if (newWorker) {
          this.handleServiceWorkerState(newWorker);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Handle service worker state changes
   */
  private handleServiceWorkerState(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
      console.log('Service Worker state changed:', worker.state);

      switch (worker.state) {
        case 'installed':
          if (navigator.serviceWorker.controller) {
            // New content available
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          } else {
            // Content cached for first time
            this.notifyContentCached();
          }
          break;

        case 'activated':
          console.log('Service Worker activated');
          break;

        case 'redundant':
          console.log('Service Worker became redundant');
          break;
      }
    });
  }

  /**
   * Setup install prompt handling
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default prompt
      e.preventDefault();

      // Store the event for later use
      this.installPrompt.installEvent = e;
      this.installPrompt.isInstallable = true;

      console.log('App install prompt available');

      // Notify that app can be installed
      this.notifyInstallAvailable();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.installPrompt.userChoice = 'accepted';
      this.notifyInstallSuccess();
    });
  }

  /**
   * Setup network status monitoring
   */
  private setupNetworkMonitoring(): void {
    window.addEventListener('online', () => {
      this.networkStatus = true;
      this.notifyNetworkStatusChange(true);
      console.log('App is online');
    });

    window.addEventListener('offline', () => {
      this.networkStatus = false;
      this.notifyNetworkStatusChange(false);
      console.log('App is offline');
    });
  }

  /**
   * Inject manifest into document
   */
  private async injectManifest(): Promise<void> {
    const manifestJson = JSON.stringify(this.manifest, null, 2);
    const manifestBlob = new Blob([manifestJson], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(manifestBlob);

    // Remove existing manifest link
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Create new manifest link
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = manifestUrl;
    document.head.appendChild(manifestLink);

    // Add theme color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.content = this.manifest.theme_color;

    // Add viewport meta tag if not present
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
      document.head.appendChild(viewportMeta);
    }

    // Add apple-specific meta tags for iOS
    this.addAppleMetaTags();

    console.log('PWA manifest injected successfully');
  }

  /**
   * Add Apple-specific meta tags for iOS PWA support
   */
  private addAppleMetaTags(): void {
    const appleTags = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: this.manifest.short_name }
    ];

    appleTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    // Add apple touch icons
    const appleTouchIconSizes = ['57x57', '60x60', '72x72', '76x76', '114x114', '120x120', '144x144', '152x152', '180x180'];

    appleTouchIconSizes.forEach(size => {
      let link = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'apple-touch-icon');
        link.setAttribute('sizes', size);
        link.setAttribute('href', `/icons/apple-touch-icon-${size}.png`);
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Setup update handling
   */
  private setupUpdateHandling(): void {
    if (!this.serviceWorkerRegistration) return;

    // Check for updates periodically
    setInterval(() => {
      this.checkForUpdates();
    }, 60000); // Check every minute

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        this.notifyContentCached();
      }
    });
  }

  /**
   * Show install prompt to user
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt.isInstallable || !this.installPrompt.installEvent) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      const result = await (this.installPrompt.installEvent as any).prompt();
      this.installPrompt.hasBeenPrompted = true;

      // Wait for user choice
      const choiceResult = await (this.installPrompt.installEvent as any).userChoice;
      this.installPrompt.userChoice = choiceResult.outcome;

      console.log('Install prompt result:', choiceResult.outcome);

      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Check if app is installable
   */
  public isInstallable(): boolean {
    return this.installPrompt.isInstallable;
  }

  /**
   * Check if app is installed (running in standalone mode)
   */
  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Check for service worker updates
   */
  public async checkForUpdates(): Promise<void> {
    if (!this.serviceWorkerRegistration) return;

    try {
      await this.serviceWorkerRegistration.update();
      console.log('Checked for service worker updates');
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }

  /**
   * Apply pending service worker update
   */
  public applyUpdate(): void {
    if (!this.updateAvailable || !this.serviceWorkerRegistration?.waiting) {
      console.warn('No update available');
      return;
    }

    // Send skip waiting message to service worker
    this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page to activate new service worker
    window.location.reload();
  }

  /**
   * Get network status
   */
  public isOnline(): boolean {
    return this.networkStatus;
  }

  /**
   * Get service worker registration
   */
  public getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.serviceWorkerRegistration;
  }

  /**
   * Update manifest
   */
  public async updateManifest(newManifest: Partial<PWAManifest>): Promise<void> {
    this.manifest = { ...this.manifest, ...newManifest };
    await this.injectManifest();
    console.log('PWA manifest updated');
  }

  /**
   * Get current manifest
   */
  public getManifest(): PWAManifest {
    return { ...this.manifest };
  }

  /**
   * Add to home screen (for browsers that support it)
   */
  public addToHomeScreen(): void {
    if (this.isInstallable()) {
      this.showInstallPrompt();
    } else {
      // Show instructions for manual installation
      this.showManualInstallInstructions();
    }
  }

  /**
   * Show manual install instructions
   */
  private showManualInstallInstructions(): void {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = 'To install this app on your device:';

    if (isIOS) {
      instructions += '\n1. Tap the Share button (square with arrow)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm';
    } else if (isAndroid) {
      instructions += '\n1. Tap the menu button (⋮)\n2. Tap "Add to Home screen" or "Install app"\n3. Tap "Add" or "Install" to confirm';
    } else {
      instructions += '\n1. Look for the install icon in your browser address bar\n2. Click the icon and follow the prompts\n3. Or use your browser\'s "Add to Home Screen" option';
    }

    // Dispatch custom event with instructions
    window.dispatchEvent(new CustomEvent('mellowise:install-instructions', {
      detail: { instructions }
    }));
  }

  /**
   * Cache important resources
   */
  public async cacheResources(urls: string[]): Promise<void> {
    if (!this.serviceWorkerRegistration?.active) {
      console.warn('Service worker not active, cannot cache resources');
      return;
    }

    try {
      // Send cache request to service worker
      this.serviceWorkerRegistration.active.postMessage({
        type: 'CACHE_RESOURCES',
        urls
      });

      console.log('Cache request sent to service worker');
    } catch (error) {
      console.error('Failed to cache resources:', error);
    }
  }

  /**
   * Clear app cache
   */
  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );

        console.log('App cache cleared');
        this.notifyCacheCleared();
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  }

  /**
   * Get cache size
   */
  public async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  /**
   * Share content using Web Share API
   */
  public async share(shareData: ShareData): Promise<boolean> {
    if (!navigator.share) {
      console.warn('Web Share API not supported');
      return false;
    }

    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Share cancelled by user');
      } else {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  // Notification methods for PWA events
  private notifyUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('mellowise:update-available', {
      detail: { message: 'A new version of the app is available' }
    }));
  }

  private notifyContentCached(): void {
    window.dispatchEvent(new CustomEvent('mellowise:content-cached', {
      detail: { message: 'App content has been cached for offline use' }
    }));
  }

  private notifyInstallAvailable(): void {
    window.dispatchEvent(new CustomEvent('mellowise:install-available', {
      detail: { message: 'App can be installed on your device' }
    }));
  }

  private notifyInstallSuccess(): void {
    window.dispatchEvent(new CustomEvent('mellowise:install-success', {
      detail: { message: 'App has been successfully installed' }
    }));
  }

  private notifyNetworkStatusChange(isOnline: boolean): void {
    window.dispatchEvent(new CustomEvent('mellowise:network-status', {
      detail: { isOnline }
    }));
  }

  private notifyCacheCleared(): void {
    window.dispatchEvent(new CustomEvent('mellowise:cache-cleared', {
      detail: { message: 'App cache has been cleared' }
    }));
  }

  /**
   * Cleanup PWA service
   */
  public destroy(): void {
    // Unregister service worker
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.unregister();
    }

    // Clear event listeners
    window.removeEventListener('beforeinstallprompt', () => {});
    window.removeEventListener('appinstalled', () => {});
    window.removeEventListener('online', () => {});
    window.removeEventListener('offline', () => {});

    console.log('PWA Service destroyed');
  }
}