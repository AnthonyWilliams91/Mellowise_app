/**
 * Playwright End-to-End Testing Configuration
 * 
 * Comprehensive E2E testing setup with accessibility testing, performance monitoring,
 * and cross-browser compatibility for Mellowise application.
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Environment configuration
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const isCI = !!process.env.CI;
const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false';

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',

  // Test configuration
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Retry configuration
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  // Reporter configuration
  reporter: [
    // Default list reporter for development
    ['list'],
    
    // HTML reporter for detailed test results
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    
    // JUnit reporter for CI/CD
    ['junit', { 
      outputFile: 'test-results/playwright-junit.xml'
    }],
    
    // JSON reporter for custom processing
    ['json', { 
      outputFile: 'test-results/playwright-results.json'
    }],

    // Custom accessibility reporter
    ['./tests/e2e/reporters/accessibility-reporter.ts'],
    
    // Performance monitoring reporter
    ['./tests/e2e/reporters/performance-reporter.ts'],
  ],

  // Global test configuration
  use: {
    // Base URL for all tests
    baseURL,
    
    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Test timeout and navigation
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // User agent
    userAgent: 'Playwright/Mellowise-E2E-Tests',
    
    // Color scheme
    colorScheme: 'light',
    
    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Storage state for authenticated tests
    storageState: './tests/e2e/auth/user-storage.json',
  },

  // Output directory
  outputDir: 'test-results/playwright',

  // Test projects for different browsers and scenarios
  projects: [
    // Authentication setup project
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Desktop Chrome tests
    {
      name: 'desktop-chrome',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        // Enable Chrome DevTools Protocol for performance monitoring
        launchOptions: {
          args: ['--enable-chrome-browser-cloud-management']
        }
      },
      testIgnore: ['**/mobile-only/**'],
    },

    // Desktop Firefox tests
    {
      name: 'desktop-firefox',
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'] },
      testIgnore: ['**/mobile-only/**', '**/chrome-only/**'],
    },

    // Desktop Safari tests (if on macOS)
    ...(process.platform === 'darwin' ? [{
      name: 'desktop-safari',
      dependencies: ['setup'],
      use: { ...devices['Desktop Safari'] },
      testIgnore: ['**/mobile-only/**', '**/chrome-only/**'],
    }] : []),

    // Mobile Chrome tests
    {
      name: 'mobile-chrome',
      dependencies: ['setup'],
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/mobile/**', '**/responsive/**'],
    },

    // Mobile Safari tests
    {
      name: 'mobile-safari',
      dependencies: ['setup'],
      use: { ...devices['iPhone 12'] },
      testMatch: ['**/mobile/**', '**/responsive/**'],
    },

    // Tablet tests
    {
      name: 'tablet-ipad',
      dependencies: ['setup'],
      use: { ...devices['iPad Pro'] },
      testMatch: ['**/tablet/**', '**/responsive/**'],
    },

    // Accessibility testing project
    {
      name: 'accessibility',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        // Enable accessibility tree in Chrome
        launchOptions: {
          args: ['--enable-experimental-accessibility-features']
        }
      },
      testMatch: ['**/a11y/**', '**/*.a11y.spec.ts'],
    },

    // Performance testing project
    {
      name: 'performance',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        // Enable performance monitoring
        launchOptions: {
          args: ['--enable-chrome-tracing']
        }
      },
      testMatch: ['**/performance/**', '**/*.perf.spec.ts'],
    },

    // Visual regression testing
    {
      name: 'visual',
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        // Consistent screenshot settings
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      },
      testMatch: ['**/visual/**', '**/*.visual.spec.ts'],
    },

    // API testing (headless)
    {
      name: 'api',
      use: {
        baseURL,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      },
      testMatch: ['**/api/**', '**/*.api.spec.ts'],
    },
  ],

  // Web server configuration for local testing
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !isCI,
    timeout: 120000, // 2 minutes to start server
    env: {
      NODE_ENV: 'test',
    }
  },

  // Metadata for test results
  metadata: {
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    baseURL,
    timestamp: new Date().toISOString(),
  },

  // Test filtering
  grep: process.env.PLAYWRIGHT_GREP,
  grepInvert: process.env.PLAYWRIGHT_GREP_INVERT,

  // Forbid test.only in CI
  forbidOnly: isCI,

  // Maximum failures before stopping
  maxFailures: isCI ? 10 : undefined,

  // Update snapshots
  updateSnapshots: process.env.PLAYWRIGHT_UPDATE_SNAPSHOTS === 'true' ? 'all' : 'missing',

  // Test file patterns
  testMatch: [
    '**/*.spec.ts',
    '**/*.spec.js',
    '**/*.test.ts',
    '**/*.test.js',
    '**/*.e2e.ts',
    '**/*.e2e.js',
  ],

  // Ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/coverage/**',
  ],

  // Shared test hooks and utilities
  globalTimeout: 600000, // 10 minutes total timeout

  // Custom test options
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{testFileName}-{projectName}-{arg}{ext}',
  
  // Fullyparallel mode
  fullyParallel: true,
});