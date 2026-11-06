import { ErrorContext, NetworkError } from '../types';

// Generate unique ID for errors
export function generateErrorId(error {
  const content = `${error.type}-${error.error.message}-${error.context.url}`;
  return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// Sanitize error data for privacy
export function sanitizeError(error {
  return {
    ...error,
    error: {
      ...error.error,
      stack: error.error.stack?.replace(/file:\/\/.*?\//g, 'file:///.../'),
      filename: error.error.filename?.replace(/.*\//, '.../')
    },
    context: {
      ...error.context,
      url: error.context.url.replace(/\/[^\/]*$/, '/...') // Hide specific page paths
    }
  };
}

// Parse console error from DevTools
export function parseConsoleError(error: any, context {
  return {
    type: 'console',
    timestamp: Date.now(),
    error: {
      message: error.message || String(error),
      stack: error.stack,
      line: error.line,
      column: error.column,
      filename: error.filename
    },
    context: {
      url: context.url || window.location.href,
      userAgent: navigator.userAgent,
      framework: detectFramework()
    },
    metadata: {
      severity: error.level === 'error' ? 'error' : 'warning',
      frequency: 1,
      resolved: false
    }
  };
}

// Parse network error from DevTools
export function parseNetworkError(request {
  const networkError = {
    url: request.request.url,
    method: request.request.method,
    status: request.response.status,
    statusText: request.response.statusText,
    response: request.response.content?.text,
    requestHeaders: request.request.headers,
    responseHeaders: request.response.headers
  };

  return {
    type: 'network',
    timestamp: Date.now(),
    error: {
      message: `HTTP ${request.response.status}: ${request.response.statusText}`,
      stack: undefined,
      line: undefined,
      column: undefined,
      filename: request.request.url
    },
    context: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      framework: detectFramework(),
      networkInfo: networkError
    },
    metadata: {
      severity: request.response.status >= 500 ? 'error' : 'warning',
      frequency: 1,
      resolved: false
    }
  };
}

// Detect JavaScript framework
function detectFramework(): string | undefined {
  if (typeof window !== 'undefined') {
    if (window.React) return 'React';
    if (window.Vue) return 'Vue';
    if (window.angular) return 'Angular';
    if (window.jQuery) return 'jQuery';
    if (window.ember) return 'Ember';
  }
  return undefined;
}

// Format error message for display
export function formatErrorMessage(error {
  const { message, filename, line } = error.error;
  let formatted = message;
  
  if (filename) {
    const file = filename.split('/').pop();
    formatted += ` (${file}`;
    if (line) formatted += `:${line}`;
    formatted += ')';
  }
  
  return formatted;
}

// Check if error is common/known
export function isCommonError(error {
  const commonPatterns = [
    'Cannot read property',
    'Cannot read properties',
    'is not a function',
    'is not defined',
    'Unexpected token',
    'SyntaxError',
    'ReferenceError',
    'TypeError',
    'Network request failed',
    'Failed to fetch',
    'CORS policy',
    '404 Not Found',
    '500 Internal Server Error'
  ];
  
  return commonPatterns.some(pattern => 
    error.error.message.toLowerCase().includes(pattern.toLowerCase())
  );
}

// Debounce function for performance
export function debounce(
  func,
  wait
) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  async get(key) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] || null;
    } catch {
      return null;
    }
  },
  
  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  
  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
};

