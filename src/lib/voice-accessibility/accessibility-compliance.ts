/**
 * MELLOWISE-031: WCAG 2.1 AA Accessibility Compliance Service
 *
 * Comprehensive accessibility auditing, compliance checking, and
 * remediation recommendations following WCAG 2.1 AA standards
 *
 * @version 1.0.0
 */

import {
  WCAGLevel,
  WCAGPrinciple,
  AccessibilityCheck,
  AccessibilityAuditResult,
  AccessibilityViolation,
  AccessibilityWarning,
  AccessibilityRecommendation,
  AccessibilityMetrics,
  KeyboardShortcut,
  FocusManagementConfig,
  WCAG_PRINCIPLES,
  ACCESSIBILITY_IMPACT_LEVELS,
  calculateAccessibilityScore,
  isAccessibilityViolation
} from '../../types/voice-accessibility'

/**
 * Audit configuration
 */
interface AuditConfig {
  wcag_level: WCAGLevel
  include_warnings: boolean
  include_best_practices: boolean
  automated_only: boolean
  ignore_hidden_elements: boolean
  color_contrast_threshold: number
  keyboard_navigation_timeout: number
}

/**
 * Element accessibility data
 */
interface ElementAccessibilityData {
  element: Element
  tag_name: string
  id: string
  class_names: string[]
  aria_label?: string
  aria_role?: string
  aria_described_by?: string
  tab_index?: number
  alt_text?: string
  label_text?: string
  is_focusable: boolean
  is_interactive: boolean
  is_visible: boolean
  computed_styles: Record<string, string>
  bounding_rect: DOMRect
}

/**
 * WCAG 2.1 AA Accessibility Compliance Service
 */
export class AccessibilityComplianceService {
  private tenant_id: string
  private config: AuditConfig
  private checks: Map<string, AccessibilityCheck> = new Map()
  private auditHistory: AccessibilityAuditResult[] = []
  private keyboardShortcuts: Map<string, KeyboardShortcut> = new Map()
  private focusConfig: FocusManagementConfig

  constructor(tenant_id: string, config?: Partial<AuditConfig>) {
    this.tenant_id = tenant_id
    this.config = {
      wcag_level: 'AA',
      include_warnings: true,
      include_best_practices: false,
      automated_only: false,
      ignore_hidden_elements: true,
      color_contrast_threshold: 4.5, // WCAG AA standard
      keyboard_navigation_timeout: 3000,
      ...config
    }

    this.focusConfig = this.initializeFocusConfig()
    this.initializeWCAGChecks()
    this.initializeKeyboardShortcuts()
    this.setupFocusManagement()
  }

  /**
   * Initialize focus management configuration
   */
  private initializeFocusConfig(): FocusManagementConfig {
    return {
      focus_visible_style: 'outline',
      focus_indicator_color: '#005fcc',
      focus_indicator_width: 2,
      skip_links_enabled: true,
      tab_trap_enabled: false,
      focus_restoration: 'auto',
      custom_tab_order: false,
      focus_order_rules: {},
      modal_focus_management: 'trap',
      dialog_initial_focus: 'first',
      roving_focus_groups: ['toolbar', 'menu', 'tablist'],
      arrow_key_navigation: true,
      focus_announcements: true,
      focus_change_delay: 100,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Initialize WCAG 2.1 checks
   */
  private initializeWCAGChecks(): void {
    const checks: AccessibilityCheck[] = [
      // Perceivable checks
      {
        id: 'images-have-alt',
        guideline: '1.1.1',
        principle: 'perceivable',
        level: 'A',
        title: 'Images have alternative text',
        description: 'All img elements must have meaningful alternative text',
        how_to_fix: [
          'Add alt attribute to all img elements',
          'Use empty alt="" for decorative images',
          'Provide meaningful descriptions for informative images'
        ],
        selector: 'img',
        test_function: 'checkImageAltText',
        automated: true,
        impact: 'serious',
        confidence: 'high',
        applies_to: ['images', 'graphics'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'color-contrast',
        guideline: '1.4.3',
        principle: 'perceivable',
        level: 'AA',
        title: 'Text has sufficient color contrast',
        description: 'Text must have a contrast ratio of at least 4.5:1 against its background',
        how_to_fix: [
          'Increase contrast between text and background colors',
          'Use darker text on light backgrounds',
          'Use lighter text on dark backgrounds',
          'Test contrast ratios with online tools'
        ],
        test_function: 'checkColorContrast',
        automated: true,
        impact: 'serious',
        confidence: 'high',
        applies_to: ['text', 'buttons', 'links'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },

      // Operable checks
      {
        id: 'keyboard-accessible',
        guideline: '2.1.1',
        principle: 'operable',
        level: 'A',
        title: 'All functionality is keyboard accessible',
        description: 'All interactive elements must be reachable and usable with keyboard only',
        how_to_fix: [
          'Ensure all interactive elements are focusable',
          'Add proper tabindex values where needed',
          'Implement keyboard event handlers',
          'Test with keyboard-only navigation'
        ],
        test_function: 'checkKeyboardAccessibility',
        automated: true,
        impact: 'critical',
        confidence: 'high',
        applies_to: ['buttons', 'links', 'form-controls', 'interactive-elements'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'focus-visible',
        guideline: '2.4.7',
        principle: 'operable',
        level: 'AA',
        title: 'Focus indicator is visible',
        description: 'Keyboard focus must be clearly visible on all focusable elements',
        how_to_fix: [
          'Ensure focus indicators are clearly visible',
          'Use high contrast focus styles',
          'Avoid removing browser default focus indicators without replacement',
          'Test focus visibility in different themes'
        ],
        test_function: 'checkFocusVisibility',
        automated: true,
        impact: 'serious',
        confidence: 'medium',
        applies_to: ['focusable-elements'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },

      // Understandable checks
      {
        id: 'labels-for-inputs',
        guideline: '3.3.2',
        principle: 'understandable',
        level: 'A',
        title: 'Form inputs have labels',
        description: 'All form inputs must have associated labels or accessible names',
        how_to_fix: [
          'Associate labels with form controls using for/id attributes',
          'Use aria-label or aria-labelledby for unlabeled inputs',
          'Provide descriptive placeholder text where appropriate',
          'Group related form controls with fieldset and legend'
        ],
        selector: 'input, textarea, select',
        test_function: 'checkFormLabels',
        automated: true,
        impact: 'serious',
        confidence: 'high',
        applies_to: ['forms', 'inputs'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'page-has-title',
        guideline: '2.4.2',
        principle: 'understandable',
        level: 'A',
        title: 'Page has a meaningful title',
        description: 'Every page must have a descriptive and unique title',
        how_to_fix: [
          'Add a unique, descriptive title to each page',
          'Include key information about page content',
          'Keep titles concise but informative',
          'Update titles dynamically for single-page applications'
        ],
        selector: 'title',
        test_function: 'checkPageTitle',
        automated: true,
        impact: 'moderate',
        confidence: 'high',
        applies_to: ['page'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },

      // Robust checks
      {
        id: 'valid-html',
        guideline: '4.1.1',
        principle: 'robust',
        level: 'A',
        title: 'HTML is valid',
        description: 'HTML must be valid and properly structured',
        how_to_fix: [
          'Validate HTML with W3C validator',
          'Fix HTML syntax errors',
          'Ensure proper nesting of elements',
          'Use semantic HTML elements appropriately'
        ],
        test_function: 'checkHTMLValidity',
        automated: true,
        impact: 'moderate',
        confidence: 'medium',
        applies_to: ['markup'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'aria-valid',
        guideline: '4.1.2',
        principle: 'robust',
        level: 'A',
        title: 'ARIA attributes are valid',
        description: 'ARIA attributes must be used correctly and have valid values',
        how_to_fix: [
          'Use valid ARIA roles, properties, and states',
          'Ensure ARIA attributes have appropriate values',
          'Follow ARIA specification guidelines',
          'Test with screen readers'
        ],
        test_function: 'checkARIAValidity',
        automated: true,
        impact: 'serious',
        confidence: 'high',
        applies_to: ['aria', 'screen-reader'],
        browser_support: { chrome: true, firefox: true, safari: true, edge: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    checks.forEach(check => {
      this.checks.set(check.id, check)
    })
  }

  /**
   * Initialize keyboard shortcuts
   */
  private initializeKeyboardShortcuts(): void {
    const shortcuts: KeyboardShortcut[] = [
      {
        id: 'skip-to-main',
        name: 'Skip to Main Content',
        description: 'Skip navigation and go to main content',
        key_combination: 'Tab',
        key_codes: [9],
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
        action: 'skip_to_main',
        scope: 'global',
        context: ['navigation'],
        accessibility_purpose: 'Allow keyboard users to bypass navigation links',
        screen_reader_announcement: 'Skip to main content',
        visual_indicator: true,
        user_customizable: false,
        default_enabled: true,
        conflicts_with: [],
        overrides: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'toggle-voice',
        name: 'Toggle Voice Recognition',
        description: 'Turn voice recognition on/off',
        key_combination: 'Ctrl+Shift+V',
        key_codes: [86],
        modifiers: { ctrl: true, shift: true, alt: false, meta: false },
        action: 'toggle_voice_recognition',
        scope: 'global',
        context: ['accessibility', 'voice'],
        accessibility_purpose: 'Quick access to voice features',
        screen_reader_announcement: 'Voice recognition toggled',
        visual_indicator: false,
        user_customizable: true,
        default_enabled: true,
        conflicts_with: [],
        overrides: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'read-page',
        name: 'Read Page Content',
        description: 'Read the current page content aloud',
        key_combination: 'Ctrl+Shift+R',
        key_codes: [82],
        modifiers: { ctrl: true, shift: true, alt: false, meta: false },
        action: 'read_page_content',
        scope: 'global',
        context: ['accessibility', 'screen-reader'],
        accessibility_purpose: 'Text-to-speech for current content',
        screen_reader_announcement: 'Reading page content',
        visual_indicator: false,
        user_customizable: true,
        default_enabled: true,
        conflicts_with: [],
        overrides: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    shortcuts.forEach(shortcut => {
      this.keyboardShortcuts.set(shortcut.id, shortcut)
    })
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    if (typeof window === 'undefined') return

    // Add skip link if enabled
    if (this.focusConfig.skip_links_enabled) {
      this.addSkipLinks()
    }

    // Setup focus indicators
    this.setupFocusIndicators()

    // Setup keyboard navigation
    this.setupKeyboardNavigation()

    // Setup focus announcements
    if (this.focusConfig.focus_announcements) {
      this.setupFocusAnnouncements()
    }
  }

  /**
   * Perform accessibility audit
   */
  public async performAudit(options?: {
    target_element?: Element
    checks?: string[]
    include_manual_checks?: boolean
  }): Promise<AccessibilityAuditResult> {
    const startTime = performance.now()

    const auditResult: AccessibilityAuditResult = {
      tenant_id: this.tenant_id,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      page_path: window?.location?.pathname || '/',
      audit_type: options?.include_manual_checks ? 'combined' : 'automated',
      wcag_level: this.config.wcag_level,
      total_checks: 0,
      passed_checks: 0,
      failed_checks: 0,
      warnings: 0,
      compliance_score: 0,
      accessibility_score: 0,
      violations: [],
      warnings_list: [],
      passed_checks_list: [],
      audit_duration: 0,
      performance_impact: 0,
      priority_fixes: [],
      estimated_fix_time: 0,
      audited_at: new Date().toISOString(),
      auditor: 'automated'
    }

    try {
      // Get target elements
      const targetElement = options?.target_element || document.body
      const elementsToCheck = this.getElementsToAudit(targetElement)

      // Run checks
      const checksToRun = options?.checks ?
        Array.from(this.checks.values()).filter(check => options.checks!.includes(check.id)) :
        Array.from(this.checks.values()).filter(check => check.level <= this.config.wcag_level)

      auditResult.total_checks = checksToRun.length

      for (const check of checksToRun) {
        const checkResults = await this.runAccessibilityCheck(check, elementsToCheck)

        if (checkResults.violations.length > 0) {
          auditResult.failed_checks++
          auditResult.violations.push(...checkResults.violations)
        } else {
          auditResult.passed_checks++
          auditResult.passed_checks_list.push(check.id)
        }

        if (checkResults.warnings.length > 0) {
          auditResult.warnings += checkResults.warnings.length
          auditResult.warnings_list.push(...checkResults.warnings)
        }
      }

      // Calculate scores
      auditResult.compliance_score = auditResult.total_checks > 0 ?
        Math.round((auditResult.passed_checks / auditResult.total_checks) * 100) : 0

      auditResult.accessibility_score = calculateAccessibilityScore(auditResult)

      // Generate priority fixes
      auditResult.priority_fixes = this.generatePriorityFixes(auditResult.violations)
      auditResult.estimated_fix_time = this.estimateFixTime(auditResult.priority_fixes)

      // Record performance
      auditResult.audit_duration = performance.now() - startTime
      auditResult.performance_impact = auditResult.audit_duration

      // Store audit result
      this.auditHistory.push(auditResult)

      return auditResult

    } catch (error) {
      console.error('Accessibility audit failed:', error)
      auditResult.audit_duration = performance.now() - startTime
      return auditResult
    }
  }

  /**
   * Run individual accessibility check
   */
  private async runAccessibilityCheck(
    check: AccessibilityCheck,
    elements: ElementAccessibilityData[]
  ): Promise<{ violations: AccessibilityViolation[], warnings: AccessibilityWarning[] }> {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    try {
      switch (check.test_function) {
        case 'checkImageAltText':
          const imageResults = this.checkImageAltText(elements)
          violations.push(...imageResults.violations)
          warnings.push(...imageResults.warnings)
          break

        case 'checkColorContrast':
          const contrastResults = await this.checkColorContrast(elements)
          violations.push(...contrastResults.violations)
          warnings.push(...contrastResults.warnings)
          break

        case 'checkKeyboardAccessibility':
          const keyboardResults = this.checkKeyboardAccessibility(elements)
          violations.push(...keyboardResults.violations)
          warnings.push(...keyboardResults.warnings)
          break

        case 'checkFocusVisibility':
          const focusResults = await this.checkFocusVisibility(elements)
          violations.push(...focusResults.violations)
          warnings.push(...focusResults.warnings)
          break

        case 'checkFormLabels':
          const labelResults = this.checkFormLabels(elements)
          violations.push(...labelResults.violations)
          warnings.push(...labelResults.warnings)
          break

        case 'checkPageTitle':
          const titleResults = this.checkPageTitle()
          violations.push(...titleResults.violations)
          warnings.push(...titleResults.warnings)
          break

        case 'checkHTMLValidity':
          const htmlResults = this.checkHTMLValidity()
          violations.push(...htmlResults.violations)
          warnings.push(...htmlResults.warnings)
          break

        case 'checkARIAValidity':
          const ariaResults = this.checkARIAValidity(elements)
          violations.push(...ariaResults.violations)
          warnings.push(...ariaResults.warnings)
          break

        default:
          console.warn(`Unknown test function: ${check.test_function}`)
      }
    } catch (error) {
      console.error(`Check ${check.id} failed:`, error)
    }

    return { violations, warnings }
  }

  /**
   * Accessibility check implementations
   */
  private checkImageAltText(elements: ElementAccessibilityData[]): {
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  } {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const images = elements.filter(el => el.tag_name.toLowerCase() === 'img')

    images.forEach(imageData => {
      const img = imageData.element as HTMLImageElement

      if (!img.alt && img.alt !== '') {
        violations.push({
          id: `img-alt-${imageData.id || 'unknown'}`,
          guideline: '1.1.1',
          principle: 'perceivable',
          level: 'A',
          description: 'Image missing alternative text',
          impact: 'serious',
          confidence: 'high',
          selector: this.getSelector(img),
          element_html: img.outerHTML,
          element_text: '',
          suggested_fixes: [
            'Add meaningful alt attribute describing the image content',
            'Use empty alt="" for decorative images',
            'Consider if image conveys important information'
          ],
          code_examples: {
            html: `<img src="${img.src}" alt="Descriptive text about the image">`
          },
          page_context: window.location.pathname,
          user_impact: 'Screen reader users cannot understand image content',
          detected_at: new Date().toISOString()
        })
      } else if (img.alt && img.alt.length > 125) {
        warnings.push({
          id: `img-alt-long-${imageData.id || 'unknown'}`,
          guideline: '1.1.1',
          level: 'A',
          description: 'Image alt text is very long (over 125 characters)',
          suggestion: 'Consider using shorter, more concise alt text',
          selector: this.getSelector(img),
          requires_manual_check: true,
          manual_check_instructions: 'Review if alt text can be shortened while maintaining meaning',
          detected_at: new Date().toISOString()
        })
      }
    })

    return { violations, warnings }
  }

  private async checkColorContrast(elements: ElementAccessibilityData[]): Promise<{
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  }> {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const textElements = elements.filter(el =>
      ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'a', 'button', 'label'].includes(el.tag_name.toLowerCase())
    )

    for (const elementData of textElements) {
      if (!elementData.is_visible) continue

      const textColor = elementData.computed_styles.color
      const backgroundColor = elementData.computed_styles.backgroundColor

      if (textColor && backgroundColor) {
        const contrastRatio = await this.calculateContrastRatio(textColor, backgroundColor, elementData.element)

        if (contrastRatio < this.config.color_contrast_threshold) {
          violations.push({
            id: `contrast-${elementData.id || 'unknown'}`,
            guideline: '1.4.3',
            principle: 'perceivable',
            level: 'AA',
            description: `Insufficient color contrast ratio: ${contrastRatio.toFixed(2)}:1 (minimum: ${this.config.color_contrast_threshold}:1)`,
            impact: 'serious',
            confidence: 'high',
            selector: this.getSelector(elementData.element),
            element_html: elementData.element.outerHTML.substring(0, 200) + '...',
            element_text: elementData.element.textContent?.substring(0, 100) || '',
            suggested_fixes: [
              'Increase contrast between text and background colors',
              'Use darker text on light backgrounds',
              'Use lighter text on dark backgrounds'
            ],
            code_examples: {
              css: `color: #000000; /* High contrast dark text */\nbackground-color: #ffffff; /* Light background */`
            },
            page_context: window.location.pathname,
            user_impact: 'Users with visual impairments may not be able to read the text',
            detected_at: new Date().toISOString()
          })
        }
      }
    }

    return { violations, warnings }
  }

  private checkKeyboardAccessibility(elements: ElementAccessibilityData[]): {
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  } {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const interactiveElements = elements.filter(el => el.is_interactive)

    interactiveElements.forEach(elementData => {
      if (!elementData.is_focusable && elementData.tag_name.toLowerCase() !== 'div') {
        violations.push({
          id: `keyboard-${elementData.id || 'unknown'}`,
          guideline: '2.1.1',
          principle: 'operable',
          level: 'A',
          description: 'Interactive element is not keyboard accessible',
          impact: 'critical',
          confidence: 'high',
          selector: this.getSelector(elementData.element),
          element_html: elementData.element.outerHTML.substring(0, 200) + '...',
          element_text: elementData.element.textContent?.substring(0, 100) || '',
          suggested_fixes: [
            'Add tabindex="0" to make element focusable',
            'Implement keyboard event handlers (keydown, keyup)',
            'Consider using semantic HTML elements (button, a, input)',
            'Ensure element can be activated with Enter or Space keys'
          ],
          code_examples: {
            html: `<button type="button" onclick="handleClick()">Accessible Button</button>`,
            javascript: `element.addEventListener('keydown', (e) => {\n  if (e.key === 'Enter' || e.key === ' ') {\n    handleClick();\n  }\n});`
          },
          page_context: window.location.pathname,
          user_impact: 'Keyboard users cannot access this functionality',
          detected_at: new Date().toISOString()
        })
      }
    })

    return { violations, warnings }
  }

  private async checkFocusVisibility(elements: ElementAccessibilityData[]): Promise<{
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  }> {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const focusableElements = elements.filter(el => el.is_focusable)

    for (const elementData of focusableElements) {
      // Temporarily focus the element to check visibility
      const originalActiveElement = document.activeElement

      try {
        (elementData.element as HTMLElement).focus()

        // Check if focus indicator is visible
        const computedStyles = window.getComputedStyle(elementData.element)
        const outlineStyle = computedStyles.outline
        const outlineColor = computedStyles.outlineColor
        const outlineWidth = computedStyles.outlineWidth

        const hasFocusIndicator = outlineStyle !== 'none' &&
                                 outlineColor !== 'transparent' &&
                                 parseInt(outlineWidth) > 0

        if (!hasFocusIndicator) {
          violations.push({
            id: `focus-visible-${elementData.id || 'unknown'}`,
            guideline: '2.4.7',
            principle: 'operable',
            level: 'AA',
            description: 'Focusable element lacks visible focus indicator',
            impact: 'serious',
            confidence: 'medium',
            selector: this.getSelector(elementData.element),
            element_html: elementData.element.outerHTML.substring(0, 200) + '...',
            element_text: elementData.element.textContent?.substring(0, 100) || '',
            suggested_fixes: [
              'Add visible focus styles using :focus CSS selector',
              'Ensure focus indicator has sufficient contrast',
              'Use outline or box-shadow for focus indication',
              'Test focus visibility in different color schemes'
            ],
            code_examples: {
              css: `button:focus {\n  outline: 2px solid #005fcc;\n  outline-offset: 2px;\n}`
            },
            page_context: window.location.pathname,
            user_impact: 'Keyboard users cannot see which element has focus',
            detected_at: new Date().toISOString()
          })
        }
      } catch (error) {
        // Element might not be focusable in current state
      } finally {
        // Restore original focus
        if (originalActiveElement && originalActiveElement instanceof HTMLElement) {
          originalActiveElement.focus()
        } else {
          (elementData.element as HTMLElement).blur()
        }
      }
    }

    return { violations, warnings }
  }

  private checkFormLabels(elements: ElementAccessibilityData[]): {
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  } {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const formElements = elements.filter(el =>
      ['input', 'textarea', 'select'].includes(el.tag_name.toLowerCase())
    )

    formElements.forEach(elementData => {
      const element = elementData.element as HTMLInputElement
      const hasLabel = elementData.label_text ||
                      elementData.aria_label ||
                      elementData.aria_described_by ||
                      element.placeholder

      if (!hasLabel) {
        violations.push({
          id: `form-label-${elementData.id || 'unknown'}`,
          guideline: '3.3.2',
          principle: 'understandable',
          level: 'A',
          description: 'Form input missing accessible label',
          impact: 'serious',
          confidence: 'high',
          selector: this.getSelector(element),
          element_html: element.outerHTML.substring(0, 200) + '...',
          element_text: '',
          suggested_fixes: [
            'Add a label element associated with the input',
            'Use aria-label attribute for accessible name',
            'Use aria-labelledby to reference existing text',
            'Provide meaningful placeholder text'
          ],
          code_examples: {
            html: `<label for="email">Email Address</label>\n<input type="email" id="email" name="email">`
          },
          page_context: window.location.pathname,
          user_impact: 'Screen reader users cannot understand the purpose of this input',
          detected_at: new Date().toISOString()
        })
      }
    })

    return { violations, warnings }
  }

  private checkPageTitle(): {
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  } {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const title = document.title

    if (!title || title.trim().length === 0) {
      violations.push({
        id: 'page-title-missing',
        guideline: '2.4.2',
        principle: 'understandable',
        level: 'A',
        description: 'Page is missing a title',
        impact: 'moderate',
        confidence: 'high',
        selector: 'title',
        element_html: '<title></title>',
        element_text: '',
        suggested_fixes: [
          'Add a descriptive title element to the page head',
          'Include key information about page content',
          'Make title unique for each page'
        ],
        code_examples: {
          html: `<title>Contact Us - Company Name</title>`
        },
        page_context: window.location.pathname,
        user_impact: 'Screen reader users cannot identify page content',
        detected_at: new Date().toISOString()
      })
    } else if (title.length < 10) {
      warnings.push({
        id: 'page-title-short',
        guideline: '2.4.2',
        level: 'A',
        description: 'Page title is very short and may not be descriptive enough',
        suggestion: 'Consider adding more descriptive information to the title',
        requires_manual_check: true,
        manual_check_instructions: 'Review if title adequately describes page content',
        detected_at: new Date().toISOString()
      })
    }

    return { violations, warnings }
  }

  private checkHTMLValidity(): {
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  } {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    // Basic HTML validation - in a real implementation, this would be more comprehensive
    const doctype = document.doctype
    if (!doctype) {
      violations.push({
        id: 'html-doctype-missing',
        guideline: '4.1.1',
        principle: 'robust',
        level: 'A',
        description: 'Document is missing DOCTYPE declaration',
        impact: 'moderate',
        confidence: 'high',
        selector: 'html',
        element_html: '<html>',
        element_text: '',
        suggested_fixes: [
          'Add DOCTYPE declaration at the beginning of the document',
          'Use HTML5 DOCTYPE: <!DOCTYPE html>'
        ],
        code_examples: {
          html: '<!DOCTYPE html>\n<html lang="en">'
        },
        page_context: window.location.pathname,
        user_impact: 'May cause browser compatibility issues',
        detected_at: new Date().toISOString()
      })
    }

    return { violations, warnings }
  }

  private checkARIAValidity(elements: ElementAccessibilityData[]): {
    violations: AccessibilityViolation[]
    warnings: AccessibilityWarning[]
  } {
    const violations: AccessibilityViolation[] = []
    const warnings: AccessibilityWarning[] = []

    const elementsWithARIA = elements.filter(el =>
      el.aria_role || el.aria_label || el.aria_described_by
    )

    elementsWithARIA.forEach(elementData => {
      // Check for invalid ARIA roles
      if (elementData.aria_role) {
        const validRoles = [
          'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
          'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
          'dialog', 'directory', 'document', 'form', 'grid', 'gridcell',
          'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem',
          'log', 'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
          'menuitemcheckbox', 'menuitemradio', 'navigation', 'note', 'option',
          'presentation', 'progressbar', 'radio', 'radiogroup', 'region',
          'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'separator',
          'slider', 'spinbutton', 'status', 'tab', 'tablist', 'tabpanel',
          'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid',
          'treeitem'
        ]

        if (!validRoles.includes(elementData.aria_role)) {
          violations.push({
            id: `aria-role-invalid-${elementData.id || 'unknown'}`,
            guideline: '4.1.2',
            principle: 'robust',
            level: 'A',
            description: `Invalid ARIA role: "${elementData.aria_role}"`,
            impact: 'serious',
            confidence: 'high',
            selector: this.getSelector(elementData.element),
            element_html: elementData.element.outerHTML.substring(0, 200) + '...',
            element_text: elementData.element.textContent?.substring(0, 100) || '',
            suggested_fixes: [
              'Use a valid ARIA role from the ARIA specification',
              'Remove invalid role attribute if not needed',
              'Consider using semantic HTML elements instead'
            ],
            code_examples: {
              html: `<div role="button" tabindex="0">Valid ARIA button</div>`
            },
            page_context: window.location.pathname,
            user_impact: 'Screen readers may not understand element purpose',
            detected_at: new Date().toISOString()
          })
        }
      }
    })

    return { violations, warnings }
  }

  /**
   * Utility methods
   */
  private getElementsToAudit(root: Element): ElementAccessibilityData[] {
    const elements: ElementAccessibilityData[] = []
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const element = node as Element

          // Skip hidden elements if configured
          if (this.config.ignore_hidden_elements && !this.isVisible(element)) {
            return NodeFilter.FILTER_SKIP
          }

          return NodeFilter.FILTER_ACCEPT
        }
      }
    )

    let currentNode = walker.currentNode as Element

    do {
      elements.push(this.getElementAccessibilityData(currentNode))
    } while (currentNode = walker.nextNode() as Element)

    return elements
  }

  private getElementAccessibilityData(element: Element): ElementAccessibilityData {
    const computedStyles = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()

    return {
      element,
      tag_name: element.tagName,
      id: element.id,
      class_names: Array.from(element.classList),
      aria_label: element.getAttribute('aria-label') || undefined,
      aria_role: element.getAttribute('role') || undefined,
      aria_described_by: element.getAttribute('aria-describedby') || undefined,
      tab_index: element.hasAttribute('tabindex') ? parseInt(element.getAttribute('tabindex')!) : undefined,
      alt_text: element.getAttribute('alt') || undefined,
      label_text: this.getAssociatedLabelText(element),
      is_focusable: this.isFocusable(element),
      is_interactive: this.isInteractive(element),
      is_visible: this.isVisible(element),
      computed_styles: {
        color: computedStyles.color,
        backgroundColor: computedStyles.backgroundColor,
        display: computedStyles.display,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
        outline: computedStyles.outline,
        outlineColor: computedStyles.outlineColor,
        outlineWidth: computedStyles.outlineWidth
      },
      bounding_rect: rect
    }
  }

  private getAssociatedLabelText(element: Element): string | undefined {
    // Check for label element
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`)
      if (label?.textContent) {
        return label.textContent.trim()
      }
    }

    // Check for aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby')
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy)
      if (labelElement?.textContent) {
        return labelElement.textContent.trim()
      }
    }

    return undefined
  }

  private isFocusable(element: Element): boolean {
    const focusableElements = [
      'a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])',
      'textarea:not([disabled])', 'button:not([disabled])', 'iframe', 'object',
      'embed', '[contenteditable]', '[tabindex]:not([tabindex="-1"])'
    ]

    return focusableElements.some(selector => element.matches(selector))
  }

  private isInteractive(element: Element): boolean {
    const interactiveElements = [
      'a', 'button', 'input', 'select', 'textarea', 'details', 'summary'
    ]

    const hasClickHandler = element.hasAttribute('onclick') ||
                           element.getAttribute('role') === 'button' ||
                           element.getAttribute('role') === 'link'

    return interactiveElements.includes(element.tagName.toLowerCase()) || hasClickHandler
  }

  private isVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect()
    const computedStyles = window.getComputedStyle(element)

    return rect.width > 0 && rect.height > 0 &&
           computedStyles.visibility !== 'hidden' &&
           computedStyles.display !== 'none' &&
           parseFloat(computedStyles.opacity) > 0
  }

  private getSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`
    }
    if (element.className) {
      return `.${Array.from(element.classList).join('.')}`
    }
    return element.tagName.toLowerCase()
  }

  private async calculateContrastRatio(
    textColor: string,
    backgroundColor: string,
    element: Element
  ): Promise<number> {
    // Simplified contrast ratio calculation
    // In a real implementation, this would handle complex scenarios like
    // gradients, images, transparency, etc.

    const textRGB = this.parseColor(textColor)
    const bgRGB = this.parseColor(backgroundColor)

    if (!textRGB || !bgRGB) return 21 // Assume good contrast if can't calculate

    const textLuminance = this.calculateLuminance(textRGB)
    const bgLuminance = this.calculateLuminance(bgRGB)

    const lighter = Math.max(textLuminance, bgLuminance)
    const darker = Math.min(textLuminance, bgLuminance)

    return (lighter + 0.05) / (darker + 0.05)
  }

  private parseColor(color: string): { r: number; g: number; b: number } | null {
    // Handle rgb() format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      }
    }

    // Handle hex format
    const hexMatch = color.match(/^#([0-9a-f]{6})$/i)
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1].substr(0, 2), 16),
        g: parseInt(hexMatch[1].substr(2, 2), 16),
        b: parseInt(hexMatch[1].substr(4, 2), 16)
      }
    }

    return null
  }

  private calculateLuminance(rgb: { r: number; g: number; b: number }): number {
    const sRGB = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  private generatePriorityFixes(violations: AccessibilityViolation[]): AccessibilityRecommendation[] {
    const recommendations: AccessibilityRecommendation[] = []

    // Group violations by type
    const violationGroups = violations.reduce((groups, violation) => {
      const key = violation.guideline
      if (!groups[key]) groups[key] = []
      groups[key].push(violation)
      return groups
    }, {} as Record<string, AccessibilityViolation[]>)

    // Generate recommendations for each group
    Object.entries(violationGroups).forEach(([guideline, groupViolations]) => {
      const impact = groupViolations[0].impact
      const priority = this.mapImpactToPriority(impact)

      recommendations.push({
        id: `fix-${guideline}-${Date.now()}`,
        priority,
        title: `Fix WCAG ${guideline} violations`,
        description: `${groupViolations.length} violation(s) found for guideline ${guideline}`,
        impact_description: `${impact} impact on user experience`,
        implementation_steps: [
          ...new Set(groupViolations.flatMap(v => v.suggested_fixes))
        ],
        code_examples: groupViolations[0].code_examples || {},
        estimated_effort: 'medium',
        estimated_hours: groupViolations.length * 0.5,
        dependencies: [],
        affects_components: [...new Set(groupViolations.map(v => v.selector))],
        user_groups_helped: this.getUserGroupsForGuideline(guideline),
        compliance_improvement: Math.min(groupViolations.length * 5, 25),
        created_at: new Date().toISOString()
      })
    })

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private mapImpactToPriority(impact: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (impact) {
      case 'critical': return 'critical'
      case 'serious': return 'high'
      case 'moderate': return 'medium'
      case 'minor': return 'low'
      default: return 'medium'
    }
  }

  private getUserGroupsForGuideline(guideline: string): string[] {
    // Map WCAG guidelines to affected user groups
    const guidelineUserGroups: Record<string, string[]> = {
      '1.1.1': ['Screen reader users', 'Users with visual impairments'],
      '1.4.3': ['Users with visual impairments', 'Users with color blindness'],
      '2.1.1': ['Keyboard users', 'Users with motor impairments'],
      '2.4.7': ['Keyboard users', 'Users with visual impairments'],
      '3.3.2': ['Screen reader users', 'Users with cognitive impairments'],
      '2.4.2': ['Screen reader users', 'Search engine users'],
      '4.1.1': ['Screen reader users', 'All users'],
      '4.1.2': ['Screen reader users', 'Users with assistive technology']
    }

    return guidelineUserGroups[guideline] || ['All users']
  }

  private estimateFixTime(recommendations: AccessibilityRecommendation[]): number {
    return recommendations.reduce((total, rec) => total + rec.estimated_hours, 0)
  }

  /**
   * Focus management implementations
   */
  private addSkipLinks(): void {
    // Check if skip link already exists
    if (document.querySelector('.skip-link')) return

    const skipLink = document.createElement('a')
    skipLink.href = '#main'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'skip-link'

    // Style the skip link (initially hidden)
    Object.assign(skipLink.style, {
      position: 'absolute',
      left: '-10000px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
      fontSize: '14px',
      fontWeight: 'bold',
      textDecoration: 'none',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: '8px 16px',
      zIndex: '100000',
      borderRadius: '4px'
    })

    // Show on focus
    skipLink.addEventListener('focus', () => {
      Object.assign(skipLink.style, {
        left: '6px',
        top: '6px',
        width: 'auto',
        height: 'auto',
        overflow: 'visible'
      })
    })

    skipLink.addEventListener('blur', () => {
      Object.assign(skipLink.style, {
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      })
    })

    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  private setupFocusIndicators(): void {
    const style = document.createElement('style')
    style.textContent = `
      .accessibility-focus-indicator {
        outline: ${this.focusConfig.focus_indicator_width}px solid ${this.focusConfig.focus_indicator_color} !important;
        outline-offset: 2px !important;
      }
    `
    document.head.appendChild(style)
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Handle keyboard shortcuts
      this.handleKeyboardShortcut(event)

      // Handle arrow key navigation for roving focus groups
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        this.handleArrowKeyNavigation(event)
      }
    })
  }

  private setupFocusAnnouncements(): void {
    let lastFocusedElement: Element | null = null

    document.addEventListener('focusin', (event) => {
      const target = event.target as Element

      if (target !== lastFocusedElement) {
        lastFocusedElement = target

        // Debounce announcements
        setTimeout(() => {
          this.announceFocusChange(target)
        }, this.focusConfig.focus_change_delay)
      }
    })
  }

  private handleKeyboardShortcut(event: KeyboardEvent): void {
    for (const shortcut of this.keyboardShortcuts.values()) {
      if (this.matchesKeyboardShortcut(event, shortcut)) {
        event.preventDefault()
        this.executeKeyboardShortcut(shortcut)
        break
      }
    }
  }

  private matchesKeyboardShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return event.ctrlKey === shortcut.modifiers.ctrl &&
           event.shiftKey === shortcut.modifiers.shift &&
           event.altKey === shortcut.modifiers.alt &&
           event.metaKey === shortcut.modifiers.meta &&
           shortcut.key_codes.includes(event.keyCode)
  }

  private executeKeyboardShortcut(shortcut: KeyboardShortcut): void {
    // Emit custom event for application handling
    window.dispatchEvent(new CustomEvent('keyboardShortcut', {
      detail: { shortcut: shortcut.action, shortcut_data: shortcut }
    }))

    // Announce to screen readers
    this.announceToScreenReader(shortcut.screen_reader_announcement)
  }

  private handleArrowKeyNavigation(event: KeyboardEvent): void {
    if (!this.focusConfig.arrow_key_navigation) return

    const activeElement = document.activeElement as HTMLElement
    if (!activeElement) return

    // Find roving focus group
    const focusGroup = this.focusConfig.roving_focus_groups.find(group => {
      return activeElement.closest(`[role="${group}"]`) !== null
    })

    if (focusGroup) {
      event.preventDefault()
      this.handleRovingFocus(activeElement, event.key, focusGroup)
    }
  }

  private handleRovingFocus(
    currentElement: HTMLElement,
    key: string,
    groupType: string
  ): void {
    const container = currentElement.closest(`[role="${groupType}"]`)
    if (!container) return

    const focusableElements = container.querySelectorAll('[tabindex]:not([tabindex="-1"])')
    const elementArray = Array.from(focusableElements) as HTMLElement[]
    const currentIndex = elementArray.indexOf(currentElement)

    let nextIndex = currentIndex

    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex > 0 ? currentIndex - 1 : elementArray.length - 1
        break
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < elementArray.length - 1 ? currentIndex + 1 : 0
        break
    }

    if (nextIndex !== currentIndex) {
      elementArray[nextIndex].focus()
    }
  }

  private announceFocusChange(element: Element): void {
    const announcement = this.generateFocusAnnouncement(element)
    if (announcement) {
      this.announceToScreenReader(announcement)
    }
  }

  private generateFocusAnnouncement(element: Element): string {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')
    const label = element.getAttribute('aria-label') ||
                  element.getAttribute('title') ||
                  (element as HTMLElement).textContent?.trim()

    let announcement = ''

    // Add role or element type
    if (role) {
      announcement += `${role} `
    } else {
      switch (tagName) {
        case 'button': announcement += 'button '; break
        case 'a': announcement += 'link '; break
        case 'input': announcement += `${(element as HTMLInputElement).type} input `; break
        case 'select': announcement += 'combobox '; break
        case 'textarea': announcement += 'text area '; break
      }
    }

    // Add label or content
    if (label && label.length < 100) {
      announcement += label
    }

    return announcement.trim()
  }

  private announceToScreenReader(message: string): void {
    // Create or update ARIA live region for announcements
    let liveRegion = document.getElementById('accessibility-announcements')

    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'accessibility-announcements'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      Object.assign(liveRegion.style, {
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      })
      document.body.appendChild(liveRegion)
    }

    // Clear and set new message
    liveRegion.textContent = ''
    setTimeout(() => {
      liveRegion!.textContent = message
    }, 100)
  }

  /**
   * Public API methods
   */
  public async auditPage(options?: {
    wcag_level?: WCAGLevel
    include_warnings?: boolean
  }): Promise<AccessibilityAuditResult> {
    if (options?.wcag_level) {
      this.config.wcag_level = options.wcag_level
    }
    if (options?.include_warnings !== undefined) {
      this.config.include_warnings = options.include_warnings
    }

    return await this.performAudit()
  }

  public getAuditHistory(): AccessibilityAuditResult[] {
    return [...this.auditHistory]
  }

  public getKeyboardShortcuts(): KeyboardShortcut[] {
    return Array.from(this.keyboardShortcuts.values())
  }

  public addKeyboardShortcut(shortcut: KeyboardShortcut): void {
    this.keyboardShortcuts.set(shortcut.id, shortcut)
  }

  public removeKeyboardShortcut(shortcutId: string): void {
    this.keyboardShortcuts.delete(shortcutId)
  }

  public updateFocusConfig(config: Partial<FocusManagementConfig>): void {
    this.focusConfig = { ...this.focusConfig, ...config, updated_at: new Date().toISOString() }
  }

  public getFocusConfig(): FocusManagementConfig {
    return { ...this.focusConfig }
  }

  public announceMessage(message: string): void {
    this.announceToScreenReader(message)
  }

  public getAccessibilityChecks(): AccessibilityCheck[] {
    return Array.from(this.checks.values())
  }

  public destroy(): void {
    this.checks.clear()
    this.keyboardShortcuts.clear()
    this.auditHistory = []

    // Remove added elements
    const skipLink = document.querySelector('.skip-link')
    if (skipLink) skipLink.remove()

    const liveRegion = document.getElementById('accessibility-announcements')
    if (liveRegion) liveRegion.remove()
  }
}

/**
 * Factory function to create accessibility compliance service
 */
export function createAccessibilityComplianceService(
  tenant_id: string,
  config?: Partial<AuditConfig>
): AccessibilityComplianceService {
  return new AccessibilityComplianceService(tenant_id, config)
}

/**
 * Quick accessibility check for current page
 */
export async function quickAccessibilityCheck(): Promise<{
  score: number
  critical_issues: number
  recommendations: string[]
}> {
  const service = createAccessibilityComplianceService('temp')
  const result = await service.auditPage()

  const criticalIssues = result.violations.filter(v => v.impact === 'critical').length
  const recommendations = result.priority_fixes.slice(0, 3).map(fix => fix.title)

  service.destroy()

  return {
    score: result.accessibility_score,
    critical_issues: criticalIssues,
    recommendations
  }
}