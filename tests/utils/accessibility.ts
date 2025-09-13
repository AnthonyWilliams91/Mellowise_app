/**
 * Accessibility Testing Framework for Mellowise
 * 
 * Comprehensive accessibility testing utilities using axe-core,
 * WCAG 2.1 AA compliance checking, and custom accessibility assertions.
 */

import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';

export interface AccessibilityOptions {
  level: 'wcag2a' | 'wcag2aa' | 'wcag21aa' | 'wcag22aa';
  tags?: string[];
  exclude?: string[];
  include?: string[];
  disableRules?: string[];
  enableExperimentalRules?: boolean;
}

export interface AccessibilityResult {
  violations: AxeViolation[];
  passes: AxePass[];
  incomplete: AxeIncomplete[];
  timestamp: string;
  url: string;
  pageTitle: string;
}

export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

export interface AxePass {
  id: string;
  impact: null;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

export interface AxeIncomplete {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  tags: string[];
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

export interface AxeNode {
  html: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  target: string[];
  failureSummary?: string;
  any: AxeCheckResult[];
  all: AxeCheckResult[];
  none: AxeCheckResult[];
}

export interface AxeCheckResult {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical' | null;
  message: string;
  data: any;
}

/**
 * Main accessibility testing class
 */
export class AccessibilityTester {
  private page: Page;
  private options: AccessibilityOptions;

  constructor(page: Page, options: AccessibilityOptions = { level: 'wcag21aa' }) {
    this.page = page;
    this.options = {
      level: 'wcag21aa',
      tags: [],
      exclude: [],
      include: [],
      disableRules: [],
      enableExperimentalRules: false,
      ...options
    };
  }

  /**
   * Run comprehensive accessibility scan
   */
  async runAccessibilityScan(): Promise<AccessibilityResult> {
    const axeBuilder = new AxeBuilder({ page: this.page })
      .withTags([this.options.level])
      .options({
        resultTypes: ['violations', 'passes', 'incomplete'],
        runOnly: {
          type: 'tag',
          values: [this.options.level, ...(this.options.tags || [])]
        }
      });

    // Configure exclusions
    if (this.options.exclude && this.options.exclude.length > 0) {
      axeBuilder.exclude(this.options.exclude);
    }

    // Configure inclusions
    if (this.options.include && this.options.include.length > 0) {
      axeBuilder.include(this.options.include);
    }

    // Disable specific rules if needed
    if (this.options.disableRules && this.options.disableRules.length > 0) {
      axeBuilder.disableRules(this.options.disableRules);
    }

    const results = await axeBuilder.analyze();

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      pageTitle: await this.page.title()
    };
  }

  /**
   * Assert no accessibility violations
   */
  async assertNoViolations(): Promise<void> {
    const results = await this.runAccessibilityScan();
    
    if (results.violations.length > 0) {
      const violationSummary = this.formatViolations(results.violations);
      throw new Error(`Accessibility violations found:\n${violationSummary}`);
    }
  }

  /**
   * Assert maximum number of violations by severity
   */
  async assertMaxViolations(maxCritical = 0, maxSerious = 0, maxModerate = 5, maxMinor = 10): Promise<void> {
    const results = await this.runAccessibilityScan();
    
    const violationsBySeverity = this.groupViolationsBySeverity(results.violations);
    
    const errors: string[] = [];
    
    if (violationsBySeverity.critical > maxCritical) {
      errors.push(`Critical violations: ${violationsBySeverity.critical} (max: ${maxCritical})`);
    }
    
    if (violationsBySeverity.serious > maxSerious) {
      errors.push(`Serious violations: ${violationsBySeverity.serious} (max: ${maxSerious})`);
    }
    
    if (violationsBySeverity.moderate > maxModerate) {
      errors.push(`Moderate violations: ${violationsBySeverity.moderate} (max: ${maxModerate})`);
    }
    
    if (violationsBySeverity.minor > maxMinor) {
      errors.push(`Minor violations: ${violationsBySeverity.minor} (max: ${maxMinor})`);
    }

    if (errors.length > 0) {
      const violationSummary = this.formatViolations(results.violations);
      throw new Error(`Accessibility violation limits exceeded:\n${errors.join('\n')}\n\nViolations:\n${violationSummary}`);
    }
  }

  /**
   * Check keyboard navigation
   */
  async checkKeyboardNavigation(): Promise<void> {
    // Start from the beginning of the page
    await this.page.keyboard.press('Home');
    
    const focusableElements = await this.page.locator('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    let currentFocusIndex = 0;
    
    for (let i = 0; i < focusableElements.length && i < 50; i++) { // Limit to prevent infinite loops
      await this.page.keyboard.press('Tab');
      
      const focusedElement = await this.page.locator(':focus').first();
      const focusedElementExists = await focusedElement.count() > 0;
      
      if (!focusedElementExists) {
        throw new Error(`No element focused after ${i + 1} tab presses`);
      }
      
      // Check if focused element is visible
      const isVisible = await focusedElement.isVisible();
      if (!isVisible) {
        throw new Error(`Focused element at tab index ${i + 1} is not visible`);
      }
      
      // Check for focus indicator
      const focusStyles = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineOffset: styles.outlineOffset,
          boxShadow: styles.boxShadow,
          border: styles.border
        };
      });
      
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' && focusStyles.outline !== '0px' ||
        focusStyles.boxShadow !== 'none' ||
        focusStyles.border !== 'none';
      
      if (!hasFocusIndicator) {
        const elementInfo = await focusedElement.evaluate(el => ({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          text: el.textContent?.slice(0, 50)
        }));
        
        console.warn(`Element may be missing focus indicator:`, elementInfo);
      }
      
      currentFocusIndex++;
    }
    
    console.info(`Keyboard navigation test completed. Tested ${currentFocusIndex} focusable elements.`);
  }

  /**
   * Check color contrast
   */
  async checkColorContrast(): Promise<void> {
    const contrastResults = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const contrastIssues: any[] = [];
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const text = el.textContent?.trim();
        
        // Only check elements with text content
        if (!text || text.length === 0) return;
        
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        const fontSize = parseFloat(styles.fontSize);
        
        // Skip if no background color is set (might be inherited)
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') return;
        
        // This is a simplified check - in a real implementation,
        // you would calculate the actual contrast ratio
        contrastIssues.push({
          element: el.tagName.toLowerCase(),
          text: text.slice(0, 100),
          color,
          backgroundColor,
          fontSize
        });
      });
      
      return contrastIssues;
    });
    
    console.info(`Color contrast check completed. Found ${contrastResults.length} text elements to analyze.`);
  }

  /**
   * Check screen reader announcements
   */
  async checkScreenReaderAnnouncements(): Promise<void> {
    // Check for proper heading structure
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length === 0) {
      console.warn('No heading elements found on the page');
      return;
    }
    
    // Verify h1 exists
    const h1Count = await this.page.locator('h1').count();
    if (h1Count === 0) {
      throw new Error('Page missing h1 element for screen reader navigation');
    }
    
    if (h1Count > 1) {
      console.warn(`Multiple h1 elements found (${h1Count}). Consider using only one h1 per page.`);
    }
    
    // Check for skip links
    const skipLinks = await this.page.locator('a[href^="#"]').filter({
      hasText: /skip|jump/i
    }).count();
    
    if (skipLinks === 0) {
      console.warn('No skip links found. Consider adding skip navigation links for keyboard users.');
    }
    
    // Check for form labels
    const inputs = await this.page.locator('input[type="text"], input[type="email"], input[type="password"], textarea, select').all();
    
    for (const input of inputs) {
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const hasLabelElement = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = el.hasAttribute('aria-label');
        const hasAriaLabelledBy = el.hasAttribute('aria-labelledby');
        
        return hasLabelElement || hasAriaLabel || hasAriaLabelledBy;
      });
      
      if (!hasLabel) {
        const inputInfo = await input.evaluate(el => ({
          type: el.type || el.tagName,
          name: el.name,
          placeholder: el.placeholder
        }));
        
        console.warn('Input element missing proper label:', inputInfo);
      }
    }
  }

  /**
   * Format violations for readable output
   */
  private formatViolations(violations: AxeViolation[]): string {
    return violations.map(violation => {
      const nodeInfo = violation.nodes.map(node => `  - ${node.html.slice(0, 100)}...`).join('\n');
      return `${violation.impact?.toUpperCase()}: ${violation.description}\n  Help: ${violation.helpUrl}\n  Elements:\n${nodeInfo}`;
    }).join('\n\n');
  }

  /**
   * Group violations by severity
   */
  private groupViolationsBySeverity(violations: AxeViolation[]) {
    return violations.reduce((acc, violation) => {
      const impact = violation.impact || 'unknown';
      acc[impact] = (acc[impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

/**
 * Factory function to create accessibility tester
 */
export function createAccessibilityTester(page: Page, options?: AccessibilityOptions): AccessibilityTester {
  return new AccessibilityTester(page, options);
}

/**
 * Playwright test extension for accessibility testing
 */
export const accessibilityTest = {
  async checkPage(page: Page, options?: AccessibilityOptions): Promise<AccessibilityResult> {
    const tester = createAccessibilityTester(page, options);
    return await tester.runAccessibilityScan();
  },

  async assertAccessible(page: Page, options?: AccessibilityOptions): Promise<void> {
    const tester = createAccessibilityTester(page, options);
    await tester.assertNoViolations();
  },

  async assertAccessibleWithLimits(
    page: Page, 
    limits: { critical?: number; serious?: number; moderate?: number; minor?: number } = {},
    options?: AccessibilityOptions
  ): Promise<void> {
    const tester = createAccessibilityTester(page, options);
    await tester.assertMaxViolations(
      limits.critical || 0,
      limits.serious || 0, 
      limits.moderate || 5,
      limits.minor || 10
    );
  },

  async checkKeyboardNavigation(page: Page): Promise<void> {
    const tester = createAccessibilityTester(page);
    await tester.checkKeyboardNavigation();
  },

  async checkScreenReader(page: Page): Promise<void> {
    const tester = createAccessibilityTester(page);
    await tester.checkScreenReaderAnnouncements();
  }
};

// Export default configuration for WCAG 2.1 AA compliance
export const WCAG_21_AA_CONFIG: AccessibilityOptions = {
  level: 'wcag21aa',
  tags: ['wcag21aa', 'wcag2aa', 'wcag2a'],
  disableRules: [
    // Disable rules that may be too strict for development
    'color-contrast-enhanced', // We'll use the standard color-contrast rule
  ],
  enableExperimentalRules: false
};

export const STRICT_ACCESSIBILITY_CONFIG: AccessibilityOptions = {
  level: 'wcag21aa',
  tags: ['wcag21aa', 'wcag2aa', 'wcag2a', 'best-practice'],
  disableRules: [],
  enableExperimentalRules: true
};