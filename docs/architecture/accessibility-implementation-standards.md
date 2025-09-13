# Accessibility Implementation Standards

## WCAG 2.1 AA Compliance Framework
```typescript
// src/lib/accessibility.ts - Accessibility utilities
export const a11yConfig = {
  // Color contrast ratios
  colorContrast: {
    normal: 4.5,      // AA standard for normal text
    large: 3.0,       // AA standard for large text (18pt+ or 14pt+ bold)
    nonText: 3.0      // AA standard for UI components
  },
  
  // Focus management
  focusManagement: {
    skipLinks: true,
    focusTrapping: true,
    focusRestoration: true,
    visibleFocusIndicator: true
  },
  
  // Screen reader support
  screenReader: {
    liveRegions: ['polite', 'assertive'],
    landmarkRoles: ['main', 'navigation', 'complementary', 'contentinfo'],
    headingHierarchy: true,
    altTextRequired: true
  }
}

// Focus trap utility for modals and game states
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()
    
    return () => container.removeEventListener('keydown', handleTabKey)
  }, [isActive])
  
  return containerRef
}

// Screen reader announcements for game events
export function useScreenReaderAnnouncements() {
  const announceRef = useRef<HTMLDivElement>(null)
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority)
      announceRef.current.textContent = message
      
      // Clear after announcement
      setTimeout(() => {
        if (announceRef.current) {
          announceRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])
  
  return { announceRef, announce }
}
```

## Keyboard Navigation Standards
```typescript
// Keyboard interaction patterns for Mellowise components
export const keyboardPatterns = {
  // Game interface navigation
  gameInterface: {
    'Tab': 'Move to next interactive element',
    'Shift+Tab': 'Move to previous interactive element', 
    'Enter': 'Select answer or confirm action',
    'Space': 'Alternative selection method',
    'Escape': 'Exit modal or cancel action',
    'Arrow Keys': 'Navigate between answer options',
    'Home': 'Jump to first answer option',
    'End': 'Jump to last answer option'
  },
  
  // Question review navigation
  questionReview: {
    'j/k': 'Vim-style navigation (optional)',
    'n/p': 'Next/previous question',
    'r': 'Mark for review',
    's': 'Show solution/explanation',
    '1-4': 'Quick select answer A-D'
  }
}

// Implement roving tabindex for option lists
export function useRovingTabIndex<T extends HTMLElement>(
  items: RefObject<T>[],
  orientation: 'horizontal' | 'vertical' = 'vertical'
) {
  const [activeIndex, setActiveIndex] = useState(0)
  
  useEffect(() => {
    items.forEach((item, index) => {
      if (item.current) {
        item.current.tabIndex = index === activeIndex ? 0 : -1
      }
    })
  }, [items, activeIndex])
  
  const handleKeyDown = useCallback((event: KeyboardEvent, index: number) => {
    const isVertical = orientation === 'vertical'
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
    
    switch (event.key) {
      case nextKey:
        event.preventDefault()
        setActiveIndex((prev) => (prev + 1) % items.length)
        break
      case prevKey:
        event.preventDefault()
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(items.length - 1)
        break
    }
  }, [items.length, orientation])
  
  return { activeIndex, handleKeyDown, setActiveIndex }
}
```

## Performance Monitoring and Optimization

```typescript
// src/lib/performance.ts - Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private vitals: Map<string, number> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  // Core Web Vitals tracking
  trackWebVital(name: string, value: number) {
    this.vitals.set(name, value)
    
    // Send to analytics if enabled
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true
      })
    }
    
    // Log performance warnings
    this.checkThresholds(name, value)
  }
  
  private checkThresholds(name: string, value: number) {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
      LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
      FID: { good: 100, poor: 300 },   // First Input Delay
      CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
      TTFB: { good: 800, poor: 1800 }  // Time to First Byte
    }
    
    const threshold = thresholds[name as keyof typeof thresholds]
    if (!threshold) return
    
    if (value > threshold.poor) {
      console.warn(`Performance Warning: ${name} is ${value}ms (threshold: ${threshold.poor}ms)`)
    }
  }
  
  // Mellowise-specific performance tracking
  trackGameAction(action: string, startTime: number) {
    const duration = performance.now() - startTime
    
    const actionThresholds = {
      questionLoad: 500,      // Question should load within 500ms
      answerSubmit: 100,      // Answer submission should be instant
      gameStart: 1000,        // Game initialization
      aiGeneration: 3000      // AI question generation
    }
    
    const threshold = actionThresholds[action as keyof typeof actionThresholds]
    if (threshold && duration > threshold) {
      console.warn(`Game Performance Warning: ${action} took ${duration}ms`)
    }
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry({
        measurement: action,
        value: duration,
        unit: 'millisecond'
      })
    }
  }
  
  private sendToSentry(data: any) {
    // Integration with Sentry performance monitoring
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'performance',
        data,
        level: data.value > 1000 ? 'warning' : 'info'
      })
    }
  }
}

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const renderStartTime = useRef(performance.now())
  const monitor = PerformanceMonitor.getInstance()
  
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current
    monitor.trackGameAction(`${componentName}Render`, renderStartTime.current)
  }, [componentName, monitor])
  
  const trackAction = useCallback((action: string) => {
    const startTime = performance.now()
    return () => monitor.trackGameAction(action, startTime)
  }, [monitor])
  
  return { trackAction }
}
```

This comprehensive enhancement addresses all the **Should-Fix** improvements identified in our architecture validation, providing production-ready coding standards, accessibility compliance, and performance monitoring systems with Context7-verified best practices.