/**
 * Jest Configuration for Mellowise
 * 
 * Comprehensive testing setup for React 19.1.0, Next.js 15.5.2, and TypeScript
 * with performance monitoring, accessibility testing, and coverage reporting.
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
const customJestConfig = {
  preset: 'ts-jest',
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    
    // CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Static assets
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(woff|woff2|eot|ttf|otf)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },

  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/__tests__/**/*.(ts|tsx|js|jsx)',
  ],

  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }],
  },

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json-summary',
    'cobertura'
  ],

  // Coverage thresholds (based on Sarah's requirements)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Stricter thresholds for critical modules
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/constants/': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  // Files to collect coverage from
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    'pages/api/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
    '!src/**/*.config.{ts,js}',
    '!src/**/types.{ts,tsx}',
    '!**/node_modules/**',
  ],

  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Test timeout (30 seconds)
  testTimeout: 30000,

  // Maximum number of concurrent tests
  maxConcurrency: 4,

  // Verbose output in CI
  verbose: process.env.CI === 'true',

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,
  
  // Watch mode configuration - disabled for now
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname',
  // ],

  // Custom reporters for CI/CD - simplified for now
  reporters: ['default'],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],


  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },

  // Extensions to try when resolving modules
  resolver: undefined,

  // Custom test environment for API tests - simplified for now
  // projects: [
  //   // Default configuration for most tests
  //   {
  //     displayName: 'client',
  //     testEnvironment: 'jsdom',
  //     testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  //     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  //   },
  //   
  //   // Node environment for API route tests
  //   {
  //     displayName: 'server',
  //     testEnvironment: 'node',
  //     testMatch: ['<rootDir>/pages/api/**/*.test.{ts,js}'],
  //     setupFilesAfterEnv: ['<rootDir>/jest.setup.server.js'],
  //   },
  //   
  //   // Integration tests
  //   {
  //     displayName: 'integration',
  //     testEnvironment: 'jsdom',
  //     testMatch: ['<rootDir>/tests/integration/**/*.test.{ts,tsx}'],
  //     setupFilesAfterEnv: ['<rootDir>/jest.setup.integration.js'],
  //     testTimeout: 60000, // Longer timeout for integration tests
  //   }
  // ],

  // Global setup and teardown - disabled for now
  // globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  // globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',

  // Snapshot configuration
  snapshotFormat: {
    printBasicPrototype: false
  },

  // Handle dynamic imports
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Custom matchers and utilities
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
};

// Export the Jest configuration
module.exports = customJestConfig;