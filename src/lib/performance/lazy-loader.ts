/**
 * Lazy Loading System
 * MELLOWISE-032: Intelligent lazy loading for images, components, and data
 */

import React from 'react';
import type {
  LazyLoadConfig,
  LazyLoadableResource,
  LazyLoadMetrics,
  DEFAULT_PERFORMANCE_CONFIG
} from '@/types/performance';

export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private loadedResources = new Set<string>();
  private loadingResources = new Map<string, Promise<any>>();
  private failedResources = new Set<string>();
  private metrics: LazyLoadMetrics = {
    totalResources: 0,
    loadedResources: 0,
    failedResources: 0,
    avgLoadTime: 0,
    bandwidthSaved: 0
  };
  private loadTimes: number[] = [];
  private config: LazyLoadConfig;

  constructor(config?: Partial<LazyLoadConfig>) {
    this.config = {
      ...DEFAULT_PERFORMANCE_CONFIG.lazyLoading,
      ...config
    };

    this.initialize();
  }

  /**
   * Register element for lazy loading
   */
  observe(element: HTMLElement, resource: LazyLoadableResource): void {
    if (!element || this.loadedResources.has(resource.id)) return;

    element.dataset.lazyId = resource.id;
    element.dataset.lazySrc = resource.src;
    element.dataset.lazyType = resource.type;

    if (this.observer) {
      this.observer.observe(element);
    } else {
      // Fallback for browsers without Intersection Observer
      this.fallbackLoad(element, resource);
    }

    this.metrics.totalResources++;
  }

  /**
   * Unregister element from lazy loading
   */
  unobserve(element: HTMLElement): void {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  /**
   * Preload critical resources
   */
  async preload(resources: LazyLoadableResource[]): Promise<void> {
    const highPriorityResources = resources.filter(r => r.priority === 'high');

    const promises = highPriorityResources.map(resource =>
      this.loadResource(resource)
    );

    try {
      await Promise.all(promises);
      console.log(`🚀 Preloaded ${highPriorityResources.length} critical resources`);
    } catch (error) {
      console.warn('Some preload resources failed:', error);
    }
  }

  /**
   * Force load a specific resource
   */
  async forceLoad(resourceId: string): Promise<any> {
    if (this.loadedResources.has(resourceId)) {
      return; // Already loaded
    }

    const element = document.querySelector(`[data-lazy-id="${resourceId}"]`) as HTMLElement;
    if (!element) {
      console.warn(`Element with lazy ID ${resourceId} not found`);
      return;
    }

    const resource: LazyLoadableResource = {
      id: resourceId,
      type: element.dataset.lazyType as LazyLoadableResource['type'],
      src: element.dataset.lazySrc || '',
      priority: 'high',
      preload: false
    };

    return this.loadResource(resource, element);
  }

  /**
   * Get loading metrics
   */
  getMetrics(): LazyLoadMetrics {
    return { ...this.metrics };
  }

  /**
   * Get loading status for a resource
   */
  getStatus(resourceId: string): 'not-loaded' | 'loading' | 'loaded' | 'failed' {
    if (this.failedResources.has(resourceId)) return 'failed';
    if (this.loadedResources.has(resourceId)) return 'loaded';
    if (this.loadingResources.has(resourceId)) return 'loading';
    return 'not-loaded';
  }

  /**
   * Clean up and disconnect observer
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.loadingResources.clear();
    console.log('🧹 Lazy loader destroyed');
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize the lazy loader
   */
  private initialize(): void {
    if ('IntersectionObserver' in window) {
      this.createIntersectionObserver();
    } else {
      console.warn('IntersectionObserver not supported, using fallback');
    }
  }

  /**
   * Create intersection observer
   */
  private createIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.handleIntersection(entry.target as HTMLElement);
          }
        });
      },
      {
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      }
    );
  }

  /**
   * Handle element intersection
   */
  private async handleIntersection(element: HTMLElement): Promise<void> {
    const resourceId = element.dataset.lazyId;
    if (!resourceId || this.loadedResources.has(resourceId)) return;

    const resource: LazyLoadableResource = {
      id: resourceId,
      type: element.dataset.lazyType as LazyLoadableResource['type'],
      src: element.dataset.lazySrc || '',
      priority: 'medium',
      preload: false,
      fallback: element.dataset.lazyFallback
    };

    // Stop observing this element
    if (this.observer && this.config.triggerOnce) {
      this.observer.unobserve(element);
    }

    await this.loadResource(resource, element);
  }

  /**
   * Load a resource based on its type
   */
  private async loadResource(
    resource: LazyLoadableResource,
    element?: HTMLElement
  ): Promise<any> {
    if (this.loadingResources.has(resource.id)) {
      return this.loadingResources.get(resource.id);
    }

    const startTime = performance.now();
    const loadPromise = this.performLoad(resource, element);

    this.loadingResources.set(resource.id, loadPromise);

    try {
      const result = await loadPromise;

      // Success
      this.loadedResources.add(resource.id);
      this.loadingResources.delete(resource.id);

      const loadTime = performance.now() - startTime;
      this.updateMetrics('success', loadTime);

      if (resource.onLoad) {
        resource.onLoad();
      }

      return result;
    } catch (error) {
      // Failure
      this.failedResources.add(resource.id);
      this.loadingResources.delete(resource.id);

      const loadTime = performance.now() - startTime;
      this.updateMetrics('failure', loadTime);

      if (resource.onError) {
        resource.onError(error as Error);
      }

      // Try fallback if available
      if (resource.fallback) {
        return this.loadFallback(resource, element);
      }

      throw error;
    }
  }

  /**
   * Perform the actual loading based on resource type
   */
  private async performLoad(
    resource: LazyLoadableResource,
    element?: HTMLElement
  ): Promise<any> {
    switch (resource.type) {
      case 'image':
        return this.loadImage(resource, element as HTMLImageElement);

      case 'component':
        return this.loadComponent(resource);

      case 'script':
        return this.loadScript(resource);

      case 'style':
        return this.loadStyle(resource);

      case 'data':
        return this.loadData(resource);

      default:
        throw new Error(`Unsupported resource type: ${resource.type}`);
    }
  }

  /**
   * Load image
   */
  private loadImage(
    resource: LazyLoadableResource,
    imgElement?: HTMLImageElement
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = imgElement || new Image();

      img.onload = () => {
        // Calculate bandwidth saved
        const originalSrc = img.dataset.originalSrc;
        if (originalSrc && originalSrc !== resource.src) {
          this.metrics.bandwidthSaved += this.estimateImageSize(originalSrc);
        }

        resolve(img);
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${resource.src}`));

      // Set src to trigger load
      img.src = resource.src;

      // Update element if provided
      if (imgElement) {
        imgElement.classList.add('lazy-loaded');
        imgElement.classList.remove('lazy-loading');
      }
    });
  }

  /**
   * Load React component dynamically
   */
  private async loadComponent(resource: LazyLoadableResource): Promise<any> {
    try {
      // Dynamic import for code splitting
      const module = await import(/* webpackChunkName: "lazy-[request]" */ resource.src);
      return module.default || module;
    } catch (error) {
      throw new Error(`Failed to load component: ${resource.src}`);
    }
  }

  /**
   * Load script dynamically
   */
  private loadScript(resource: LazyLoadableResource): Promise<HTMLScriptElement> {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${resource.src}"]`);
      if (existingScript) {
        resolve(existingScript as HTMLScriptElement);
        return;
      }

      const script = document.createElement('script');
      script.src = resource.src;
      script.async = true;

      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error(`Failed to load script: ${resource.src}`));

      document.head.appendChild(script);
    });
  }

  /**
   * Load stylesheet dynamically
   */
  private loadStyle(resource: LazyLoadableResource): Promise<HTMLLinkElement> {
    return new Promise((resolve, reject) => {
      // Check if stylesheet already exists
      const existingLink = document.querySelector(`link[href="${resource.src}"]`);
      if (existingLink) {
        resolve(existingLink as HTMLLinkElement);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = resource.src;

      link.onload = () => resolve(link);
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${resource.src}`));

      document.head.appendChild(link);
    });
  }

  /**
   * Load data via fetch
   */
  private async loadData(resource: LazyLoadableResource): Promise<any> {
    try {
      const response = await fetch(resource.src);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        return response.json();
      } else if (contentType?.includes('text/')) {
        return response.text();
      } else {
        return response.blob();
      }
    } catch (error) {
      throw new Error(`Failed to load data: ${resource.src}`);
    }
  }

  /**
   * Load fallback resource
   */
  private async loadFallback(
    resource: LazyLoadableResource,
    element?: HTMLElement
  ): Promise<any> {
    if (!resource.fallback) return null;

    const fallbackResource: LazyLoadableResource = {
      ...resource,
      id: `${resource.id}_fallback`,
      src: resource.fallback
    };

    return this.performLoad(fallbackResource, element);
  }

  /**
   * Fallback loading for browsers without Intersection Observer
   */
  private fallbackLoad(element: HTMLElement, resource: LazyLoadableResource): void {
    setTimeout(async () => {
      // Simple viewport check
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        await this.loadResource(resource, element);
      } else {
        // Check again later
        this.fallbackLoad(element, resource);
      }
    }, this.config.fallbackDelay);
  }

  /**
   * Update loading metrics
   */
  private updateMetrics(type: 'success' | 'failure', loadTime: number): void {
    this.loadTimes.push(loadTime);

    // Keep only recent load times
    if (this.loadTimes.length > 100) {
      this.loadTimes = this.loadTimes.slice(-50);
    }

    // Update average load time
    this.metrics.avgLoadTime = this.loadTimes.reduce((a, b) => a + b, 0) / this.loadTimes.length;

    if (type === 'success') {
      this.metrics.loadedResources++;
    } else {
      this.metrics.failedResources++;
    }
  }

  /**
   * Estimate image size for bandwidth calculation
   */
  private estimateImageSize(src: string): number {
    // Very rough estimation based on URL patterns
    if (src.includes('thumbnail') || src.includes('small')) return 50 * 1024; // 50KB
    if (src.includes('medium')) return 200 * 1024; // 200KB
    if (src.includes('large') || src.includes('full')) return 800 * 1024; // 800KB

    return 300 * 1024; // Default 300KB estimate
  }
}

/**
 * React Hook for lazy loading
 */
export function useLazyLoad(config?: Partial<LazyLoadConfig>) {
  const [loader] = React.useState(() => new LazyLoader(config));

  React.useEffect(() => {
    return () => loader.destroy();
  }, [loader]);

  const observe = React.useCallback((element: HTMLElement, resource: LazyLoadableResource) => {
    loader.observe(element, resource);
  }, [loader]);

  const unobserve = React.useCallback((element: HTMLElement) => {
    loader.unobserve(element);
  }, [loader]);

  const forceLoad = React.useCallback((resourceId: string) => {
    return loader.forceLoad(resourceId);
  }, [loader]);

  const getStatus = React.useCallback((resourceId: string) => {
    return loader.getStatus(resourceId);
  }, [loader]);

  return {
    observe,
    unobserve,
    forceLoad,
    getStatus,
    metrics: loader.getMetrics()
  };
}

/**
 * Lazy Image Component
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  priority?: LazyLoadableResource['priority'];
  onLazyLoad?: () => void;
  onLazyError?: (error: Error) => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallback,
  priority = 'medium',
  onLazyLoad,
  onLazyError,
  className = '',
  ...props
}) => {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const { observe, getStatus } = useLazyLoad();

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const resource: LazyLoadableResource = {
      id: `img_${src}`,
      type: 'image',
      src,
      priority,
      preload: priority === 'high',
      fallback,
      onLoad: () => {
        setIsLoaded(true);
        onLazyLoad?.();
      },
      onError: (error) => {
        setHasError(true);
        onLazyError?.(error);
      }
    };

    observe(img, resource);
  }, [src, observe, priority, fallback, onLazyLoad, onLazyError]);

  const status = getStatus(`img_${src}`);
  const isLoading = status === 'loading';

  return (
    <img
      ref={imgRef}
      className={`lazy-image ${className} ${isLoading ? 'lazy-loading' : ''} ${isLoaded ? 'lazy-loaded' : ''}`}
      alt=""
      {...props}
      style={{
        opacity: isLoaded ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        ...props.style
      }}
    />
  );
};

// Export singleton instance
export const lazyLoader = new LazyLoader();