/**
 * Responsive Design Service
 * MELLOWISE-027: Desktop-Optimized Mobile Enhancement
 */

import type {
  BreakpointConfig,
  ScreenSize,
  ResponsiveLayout,
  AdaptiveComponent,
  ComponentAdaptation,
  OrientationLayout,
  DEFAULT_BREAKPOINTS
} from '@/types/mobile-enhancement';

/**
 * Responsive Design Service
 * Handles responsive layouts and adaptive components for desktop-first mobile optimization
 */
export class ResponsiveService {
  private breakpoints: BreakpointConfig;
  private currentScreenSize: ScreenSize;
  private adaptiveComponents: Map<string, AdaptiveComponent>;
  private orientationLayouts: Map<string, OrientationLayout>;
  private resizeObserver: ResizeObserver | null = null;
  private mediaQueries: Map<string, MediaQueryList>;

  constructor(breakpoints: BreakpointConfig = DEFAULT_BREAKPOINTS) {
    this.breakpoints = breakpoints;
    this.currentScreenSize = this.getCurrentScreenSize();
    this.adaptiveComponents = new Map();
    this.orientationLayouts = new Map();
    this.mediaQueries = new Map();

    this.initializeService();
  }

  /**
   * Initialize responsive service
   */
  private initializeService(): void {
    this.setupMediaQueries();
    this.setupResizeObserver();
    this.applyInitialLayout();
    this.setupOrientationLayouts();

    console.log('Responsive Service initialized');
  }

  /**
   * Get current screen size information
   */
  private getCurrentScreenSize(): ScreenSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
    };
  }

  /**
   * Setup media queries for different breakpoints
   */
  private setupMediaQueries(): void {
    const queries = {
      mobile: `(max-width: ${this.breakpoints.mobile}px)`,
      tablet: `(min-width: ${this.breakpoints.mobile + 1}px) and (max-width: ${this.breakpoints.tablet}px)`,
      desktop: `(min-width: ${this.breakpoints.tablet + 1}px) and (max-width: ${this.breakpoints.desktop}px)`,
      large: `(min-width: ${this.breakpoints.desktop + 1}px)`,
      portrait: '(orientation: portrait)',
      landscape: '(orientation: landscape)',
      touch: '(pointer: coarse)',
      retina: '(min-resolution: 2dppx)'
    };

    Object.entries(queries).forEach(([name, query]) => {
      const mediaQuery = window.matchMedia(query);
      this.mediaQueries.set(name, mediaQuery);

      mediaQuery.addEventListener('change', (e) => {
        this.handleMediaQueryChange(name, e.matches);
      });
    });
  }

  /**
   * Setup resize observer for responsive adjustments
   */
  private setupResizeObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.body) {
            this.handleResize();
          }
        }
      });

      this.resizeObserver.observe(document.body);
    } else {
      // Fallback to resize event
      window.addEventListener('resize', this.handleResize.bind(this));
    }
  }

  /**
   * Handle window resize events
   */
  private handleResize(): void {
    const newScreenSize = this.getCurrentScreenSize();
    const breakpointChanged = this.getCurrentBreakpoint() !== this.getBreakpoint(this.currentScreenSize.width);

    this.currentScreenSize = newScreenSize;

    if (breakpointChanged) {
      this.applyResponsiveLayout();
    }

    this.updateAdaptiveComponents();
    this.updateCSSVariables();
  }

  /**
   * Handle media query changes
   */
  private handleMediaQueryChange(queryName: string, matches: boolean): void {
    document.documentElement.classList.toggle(`mq-${queryName}`, matches);

    // Trigger custom events for specific breakpoints
    if (matches) {
      window.dispatchEvent(new CustomEvent('mellowise:breakpoint-enter', {
        detail: { breakpoint: queryName }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('mellowise:breakpoint-exit', {
        detail: { breakpoint: queryName }
      }));
    }
  }

  /**
   * Apply initial responsive layout
   */
  private applyInitialLayout(): void {
    this.applyResponsiveLayout();
    this.updateCSSVariables();
  }

  /**
   * Apply responsive layout based on current screen size
   */
  private applyResponsiveLayout(): void {
    const currentBreakpoint = this.getCurrentBreakpoint();

    // Remove all breakpoint classes
    Object.keys(this.breakpoints).forEach(bp => {
      document.documentElement.classList.remove(`bp-${bp}`);
    });

    // Add current breakpoint class
    document.documentElement.classList.add(`bp-${currentBreakpoint}`);

    // Apply layout-specific styles
    this.applyBreakpointStyles(currentBreakpoint);

    // Update adaptive components
    this.updateAdaptiveComponents();
  }

  /**
   * Get current breakpoint based on screen width
   */
  public getCurrentBreakpoint(): keyof BreakpointConfig {
    return this.getBreakpoint(this.currentScreenSize.width);
  }

  /**
   * Get breakpoint for specific width
   */
  private getBreakpoint(width: number): keyof BreakpointConfig {
    if (width <= this.breakpoints.mobile) return 'mobile';
    if (width <= this.breakpoints.tablet) return 'tablet';
    if (width <= this.breakpoints.desktop) return 'desktop';
    return 'large';
  }

  /**
   * Apply breakpoint-specific styles
   */
  private applyBreakpointStyles(breakpoint: keyof BreakpointConfig): void {
    const layouts = this.getBreakpointLayout(breakpoint);

    // Apply container styles
    document.documentElement.style.setProperty('--container-padding', `${layouts.containerPadding}px`);
    document.documentElement.style.setProperty('--grid-gap', `${layouts.gridGap}px`);
    document.documentElement.style.setProperty('--grid-columns', layouts.columns.toString());

    // Apply mobile-specific optimizations
    if (breakpoint === 'mobile') {
      this.applyMobileOptimizations();
    } else {
      this.removeMobileOptimizations();
    }
  }

  /**
   * Get layout configuration for breakpoint
   */
  private getBreakpointLayout(breakpoint: keyof BreakpointConfig): ResponsiveLayout {
    const baseLayouts: Record<keyof BreakpointConfig, ResponsiveLayout> = {
      mobile: {
        breakpoint: 'mobile',
        columns: 1,
        spacing: 16,
        gridGap: 16,
        containerPadding: 16
      },
      tablet: {
        breakpoint: 'tablet',
        columns: 2,
        spacing: 20,
        gridGap: 20,
        containerPadding: 24
      },
      desktop: {
        breakpoint: 'desktop',
        columns: 3,
        spacing: 24,
        gridGap: 24,
        containerPadding: 32
      },
      large: {
        breakpoint: 'large',
        columns: 4,
        spacing: 32,
        gridGap: 32,
        containerPadding: 40
      }
    };

    return baseLayouts[breakpoint];
  }

  /**
   * Apply mobile-specific optimizations
   */
  private applyMobileOptimizations(): void {
    document.documentElement.classList.add('mobile-optimized');

    // Touch-friendly sizes
    document.documentElement.style.setProperty('--touch-target-size', '44px');
    document.documentElement.style.setProperty('--touch-padding', '8px');

    // Mobile typography
    document.documentElement.style.setProperty('--font-size-mobile', '16px');
    document.documentElement.style.setProperty('--line-height-mobile', '1.5');

    // Mobile spacing
    document.documentElement.style.setProperty('--mobile-spacing-xs', '8px');
    document.documentElement.style.setProperty('--mobile-spacing-sm', '12px');
    document.documentElement.style.setProperty('--mobile-spacing-md', '16px');
    document.documentElement.style.setProperty('--mobile-spacing-lg', '24px');
  }

  /**
   * Remove mobile-specific optimizations
   */
  private removeMobileOptimizations(): void {
    document.documentElement.classList.remove('mobile-optimized');

    // Reset to desktop values
    document.documentElement.style.removeProperty('--touch-target-size');
    document.documentElement.style.removeProperty('--touch-padding');
    document.documentElement.style.removeProperty('--font-size-mobile');
    document.documentElement.style.removeProperty('--line-height-mobile');
  }

  /**
   * Setup orientation-specific layouts
   */
  private setupOrientationLayouts(): void {
    const portraitLayout: OrientationLayout = {
      orientation: 'portrait',
      layout: {
        header: { height: 60, position: 'fixed' },
        sidebar: { width: 0, position: 'hidden' },
        content: { padding: 16, maxWidth: undefined },
        footer: { height: 80, position: 'fixed' }
      }
    };

    const landscapeLayout: OrientationLayout = {
      orientation: 'landscape',
      layout: {
        header: { height: 50, position: 'fixed' },
        sidebar: { width: 240, position: 'left' },
        content: { padding: 20, maxWidth: undefined },
        footer: { height: 60, position: 'static' }
      }
    };

    this.orientationLayouts.set('portrait', portraitLayout);
    this.orientationLayouts.set('landscape', landscapeLayout);

    // Apply current orientation layout
    this.applyOrientationLayout();
  }

  /**
   * Apply orientation-specific layout
   */
  private applyOrientationLayout(): void {
    const currentOrientation = this.currentScreenSize.orientation;
    const layout = this.orientationLayouts.get(currentOrientation);

    if (!layout) return;

    const { header, sidebar, content, footer } = layout.layout;

    // Apply header styles
    document.documentElement.style.setProperty('--header-height', `${header.height}px`);

    // Apply sidebar styles
    document.documentElement.style.setProperty('--sidebar-width', `${sidebar.width}px`);
    document.documentElement.classList.toggle('sidebar-hidden', sidebar.position === 'hidden');

    // Apply content styles
    document.documentElement.style.setProperty('--content-padding', `${content.padding}px`);
    if (content.maxWidth) {
      document.documentElement.style.setProperty('--content-max-width', `${content.maxWidth}px`);
    }

    // Apply footer styles
    document.documentElement.style.setProperty('--footer-height', `${footer.height}px`);
    document.documentElement.classList.toggle('footer-fixed', footer.position === 'fixed');
  }

  /**
   * Register adaptive component
   */
  public registerAdaptiveComponent(component: AdaptiveComponent): void {
    this.adaptiveComponents.set(component.componentId, component);
    this.applyComponentAdaptation(component);
  }

  /**
   * Update all adaptive components
   */
  private updateAdaptiveComponents(): void {
    this.adaptiveComponents.forEach(component => {
      this.applyComponentAdaptation(component);
    });
  }

  /**
   * Apply adaptation rules to component
   */
  private applyComponentAdaptation(component: AdaptiveComponent): void {
    const currentBreakpoint = this.getCurrentBreakpoint();
    const isTouch = this.isTouchDevice();
    const isMobile = currentBreakpoint === 'mobile';

    // Get base layout
    const baseLayout = isMobile ? component.mobileLayout : component.desktopLayout;

    // Apply adaptation rules
    const adaptedLayout = { ...baseLayout };

    component.adaptationRules.forEach(rule => {
      if (this.shouldApplyAdaptation(rule, currentBreakpoint, isTouch)) {
        if (rule.changes.layout) {
          Object.assign(adaptedLayout, rule.changes.layout);
        }

        // Apply styling changes
        if (rule.changes.styling) {
          this.applyComponentStyling(component.componentId, rule.changes.styling);
        }
      }
    });

    // Apply the adapted layout
    this.applyComponentLayout(component.componentId, adaptedLayout);
  }

  /**
   * Check if adaptation rule should be applied
   */
  private shouldApplyAdaptation(
    rule: ComponentAdaptation,
    currentBreakpoint: keyof BreakpointConfig,
    isTouch: boolean
  ): boolean {
    switch (rule.condition) {
      case 'screen-size':
        const width = this.currentScreenSize.width;
        return width <= (rule.threshold as number);

      case 'orientation':
        return this.currentScreenSize.orientation === rule.threshold;

      case 'touch-device':
        return isTouch;

      case 'performance':
        return this.isLowPerformanceDevice();

      default:
        return false;
    }
  }

  /**
   * Apply component-specific styling
   */
  private applyComponentStyling(componentId: string, styles: Record<string, string>): void {
    const element = document.querySelector(`[data-component="${componentId}"]`) as HTMLElement;
    if (!element) return;

    Object.entries(styles).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }

  /**
   * Apply component-specific layout
   */
  private applyComponentLayout(componentId: string, layout: ResponsiveLayout): void {
    const element = document.querySelector(`[data-component="${componentId}"]`) as HTMLElement;
    if (!element) return;

    // Apply layout CSS custom properties
    element.style.setProperty('--component-columns', layout.columns.toString());
    element.style.setProperty('--component-spacing', `${layout.spacing}px`);
    element.style.setProperty('--component-gap', `${layout.gridGap}px`);
    element.style.setProperty('--component-padding', `${layout.containerPadding}px`);
  }

  /**
   * Update CSS custom properties for responsive design
   */
  private updateCSSVariables(): void {
    const { width, height, pixelRatio, orientation } = this.currentScreenSize;

    // Screen size variables
    document.documentElement.style.setProperty('--screen-width', `${width}px`);
    document.documentElement.style.setProperty('--screen-height', `${height}px`);
    document.documentElement.style.setProperty('--pixel-ratio', pixelRatio.toString());

    // Orientation variables
    document.documentElement.style.setProperty('--orientation', orientation);

    // Viewport units (for better mobile support)
    document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    document.documentElement.style.setProperty('--vw', `${width * 0.01}px`);

    // Safe area insets (for iOS)
    if (this.supportsSafeArea()) {
      document.documentElement.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
      document.documentElement.style.setProperty('--safe-area-left', 'env(safe-area-inset-left)');
      document.documentElement.style.setProperty('--safe-area-right', 'env(safe-area-inset-right)');
    }
  }

  /**
   * Check if touch device
   */
  private isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Check if low performance device
   */
  private isLowPerformanceDevice(): boolean {
    // Basic heuristics for low performance detection
    const cores = navigator.hardwareConcurrency || 1;
    const memory = (navigator as any).deviceMemory || 1;

    return cores < 4 || memory < 2;
  }

  /**
   * Check if safe area is supported
   */
  private supportsSafeArea(): boolean {
    return CSS.supports('padding-top: env(safe-area-inset-top)');
  }

  /**
   * Get responsive image sizes
   */
  public getResponsiveImageSizes(): string {
    const breakpoints = this.breakpoints;
    return [
      `(max-width: ${breakpoints.mobile}px) 100vw`,
      `(max-width: ${breakpoints.tablet}px) 50vw`,
      `(max-width: ${breakpoints.desktop}px) 33vw`,
      '25vw'
    ].join(', ');
  }

  /**
   * Get responsive image srcset
   */
  public getResponsiveImageSrcSet(baseUrl: string, sizes: number[]): string {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  }

  /**
   * Check if specific breakpoint is active
   */
  public isBreakpointActive(breakpoint: keyof BreakpointConfig): boolean {
    const mediaQuery = this.mediaQueries.get(breakpoint);
    return mediaQuery?.matches || false;
  }

  /**
   * Check if mobile breakpoint is active
   */
  public isMobile(): boolean {
    return this.isBreakpointActive('mobile');
  }

  /**
   * Check if tablet breakpoint is active
   */
  public isTablet(): boolean {
    return this.isBreakpointActive('tablet');
  }

  /**
   * Check if desktop breakpoint is active
   */
  public isDesktop(): boolean {
    return this.isBreakpointActive('desktop') || this.isBreakpointActive('large');
  }

  /**
   * Get current screen size
   */
  public getScreenSize(): ScreenSize {
    return { ...this.currentScreenSize };
  }

  /**
   * Get breakpoint configuration
   */
  public getBreakpoints(): BreakpointConfig {
    return { ...this.breakpoints };
  }

  /**
   * Update breakpoint configuration
   */
  public updateBreakpoints(newBreakpoints: Partial<BreakpointConfig>): void {
    this.breakpoints = { ...this.breakpoints, ...newBreakpoints };
    this.setupMediaQueries();
    this.applyResponsiveLayout();
  }

  /**
   * Add CSS class based on breakpoint
   */
  public addBreakpointClass(element: HTMLElement, className: string, breakpoint: keyof BreakpointConfig): void {
    const mediaQuery = this.mediaQueries.get(breakpoint);
    if (!mediaQuery) return;

    const updateClass = () => {
      element.classList.toggle(className, mediaQuery.matches);
    };

    updateClass();
    mediaQuery.addEventListener('change', updateClass);
  }

  /**
   * Create responsive container
   */
  public createResponsiveContainer(element: HTMLElement, options: {
    maxWidth?: Record<keyof BreakpointConfig, number>;
    padding?: Record<keyof BreakpointConfig, number>;
    margin?: Record<keyof BreakpointConfig, number>;
  }): void {
    const { maxWidth, padding, margin } = options;

    // Apply max-width for each breakpoint
    if (maxWidth) {
      Object.entries(maxWidth).forEach(([bp, width]) => {
        element.style.setProperty(`--max-width-${bp}`, `${width}px`);
      });
    }

    // Apply padding for each breakpoint
    if (padding) {
      Object.entries(padding).forEach(([bp, pad]) => {
        element.style.setProperty(`--padding-${bp}`, `${pad}px`);
      });
    }

    // Apply margin for each breakpoint
    if (margin) {
      Object.entries(margin).forEach(([bp, mar]) => {
        element.style.setProperty(`--margin-${bp}`, `${mar}px`);
      });
    }

    element.classList.add('responsive-container');
  }

  /**
   * Cleanup service
   */
  public destroy(): void {
    this.resizeObserver?.disconnect();
    this.mediaQueries.forEach(mq => {
      mq.removeEventListener('change', this.handleMediaQueryChange);
    });
    this.adaptiveComponents.clear();
    this.orientationLayouts.clear();
    this.mediaQueries.clear();
  }
}