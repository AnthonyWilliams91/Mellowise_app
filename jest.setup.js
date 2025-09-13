/**
 * Jest Setup for React Testing Library and Mellowise
 * 
 * Global test configuration, mocks, and utilities for comprehensive
 * React 18.3.1 testing with accessibility and performance monitoring.
 */

require('@testing-library/jest-dom');
const { configure } = require('@testing-library/react');
const { TextEncoder, TextDecoder } = require('util');

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configure React Testing Library
configure({
  // Automatic cleanup after each test
  asyncUtilTimeout: 5000,
  
  // Better error messages
  getElementError: (message, container) => {
    const error = new Error(
      [
        message,
        `\nIgnored nodes: comments, script, style`,
        `\nCurrent document structure:\n${container.innerHTML}`,
      ].join('\n')
    );
    error.name = 'TestingLibraryElementError';
    return error;
  },
});

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(() => Promise.resolve(true)),
      replace: jest.fn(() => Promise.resolve(true)),
      reload: jest.fn(() => Promise.resolve(true)),
      back: jest.fn(() => Promise.resolve(true)),
      prefetch: jest.fn(() => Promise.resolve()),
      beforePopState: jest.fn(() => Promise.resolve()),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
      isReady: true,
      isPreview: false,
    };
  },
}));

// Mock Next.js head component
jest.mock('next/head', () => {
  return function MockHead({ children }) {
    return children;
  };
});

// Mock Next.js image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }) {
    return React.createElement('img', { src, alt, ...props });
  };
});

// Mock Next.js link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Mock Web APIs that aren't available in jsdom
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock PerformanceObserver for performance monitoring tests
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// Mock performance API
global.performance = {
  ...global.performance,
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  now: jest.fn(() => Date.now()),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Suppress known React warnings in tests
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args) => {
  // Suppress known warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillUpdate'))
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// Test cleanup
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset fetch mock
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
});

// Custom test utilities and helpers
const testUtils = {
  // Create mock user for tests
  mockUser: (overrides = {}) => ({
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }),

  // Create mock API response
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
  }),

  // Wait for async operations
  waitFor: (fn, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkCondition = () => {
        try {
          const result = fn();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(checkCondition, 100);
          }
        } catch (error) {
          if (Date.now() - startTime > timeout) {
            reject(error);
          } else {
            setTimeout(checkCondition, 100);
          }
        }
      };
      checkCondition();
    });
  },
};

// Custom matchers for better assertions
expect.extend({
  // Check if element has accessibility attributes
  toHaveA11yAttributes(received) {
    const hasAriaLabel = received.hasAttribute('aria-label');
    const hasRole = received.hasAttribute('role');
    const hasAltText = received.hasAttribute('alt');
    const isButton = received.tagName === 'BUTTON';
    const isInput = received.tagName === 'INPUT';
    
    const hasRequiredA11yAttrs = hasAriaLabel || hasRole || hasAltText || isButton || isInput;
    
    return {
      message: () => 
        `Expected element to have accessibility attributes (aria-label, role, alt, or be a semantic element)`,
      pass: hasRequiredA11yAttrs,
    };
  },

  // Check performance metrics
  toMeetPerformanceBudget(received, budget) {
    const pass = received <= budget;
    return {
      message: () => 
        pass 
          ? `Expected ${received} not to meet performance budget of ${budget}`
          : `Expected ${received} to meet performance budget of ${budget}`,
      pass,
    };
  },
});

// Setup environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Global test environment setup
beforeEach(() => {
  // Reset performance marks and measures
  if (global.performance && global.performance.clearMarks) {
    global.performance.clearMarks();
    global.performance.clearMeasures();
  }
  
  // Setup default fetch responses
  if (global.fetch && global.fetch.mockImplementation) {
    global.fetch.mockImplementation((url) => {
      console.warn(`Unmocked fetch call to: ${url}`);
      return Promise.reject(new Error(`Unmocked fetch call to: ${url}`));
    });
  }
});

// Error boundary for tests  
const React = require('react');

class TestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', { 'data-testid': 'error-boundary' }, 'Something went wrong.');
    }

    return this.props.children;
  }
}

module.exports = { testUtils, TestErrorBoundary };