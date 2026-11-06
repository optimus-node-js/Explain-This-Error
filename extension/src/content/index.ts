import { parseConsoleError, parseNetworkError } from '../shared/utils';
import { ErrorContext } from '../types';

// Content script for error detection and page context
class ContentScript {
  constructor() {
    this.originalConsole = {
      error: console.error,
      warn: console.warn,
      log: console.log
    };
    
    this.setupConsoleInterception();
    this.setupErrorHandlers();
  }

  setupConsoleInterception() {
    // Intercept console.error
    console.error = (...args) => {
      this.handleConsoleMessage('error', args);
      return this.originalConsole.error.apply(console, args);
    };

    // Intercept console.warn
    console.warn = (...args) => {
      this.handleConsoleMessage('warn', args);
      return this.originalConsole.warn.apply(console, args);
    };

    // Intercept console.log for uncaught errors
    console.log = (...args) => {
      this.handleConsoleMessage('log', args);
      return this.originalConsole.log.apply(console, args);
    };
  }

  setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handlePromiseRejection(event);
    });

    // Network error monitoring (basic)
    this.setupNetworkMonitoring();
  }

  handleConsoleMessage(level, args) {
    // Only process error and warn levels
    if (level !== 'error' && level !== 'warn') return;

    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    // Skip extension-related messages
    if (message.includes('chrome-extension://') || 
        message.includes('moz-extension://')) {
      return;
    }

    const errorContext = parseConsoleError(
      { message, level },
      { url: window.location.href }
    );

    this.sendErrorToBackground(errorContext);
  }

  handleGlobalError(event) {
    const errorContext = parseConsoleError(
      {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      },
      { url: window.location.href }
    );

    this.sendErrorToBackground(errorContext);
  }

  handlePromiseRejection(event) {
    const error = event.reason;
    const message = error?.message || String(error);
    
    const errorContext = parseConsoleError(
      {
        message: `Unhandled Promise Rejection: ${message}`,
        stack: error?.stack
      },
      { url: window.location.href }
    );

    this.sendErrorToBackground(errorContext);
  }

  setupNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for failed requests
        if (!response.ok) {
          const request = args[0];
          const url = typeof request === 'string' ? request : request.url;
          
          const networkError = {
            request: {
              url,
              method: typeof request === 'object' ? request.method || 'GET' : 'GET',
              headers: typeof request === 'object' ? request.headers : {}
            },
            response: {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            }
          };

          const errorContext = parseNetworkError(networkError);
          this.sendErrorToBackground(errorContext);
        }
        
        return response;
      } catch (error) {
        // Network request failed completely
        const request = args[0];
        const url = typeof request === 'string' ? request : request.url;
        
        const networkError = {
          request: {
            url,
            method: typeof request === 'object' ? request.method || 'GET' : 'GET',
            headers: typeof request === 'object' ? request.headers : {}
          },
          response: {
            status: 0,
            statusText: 'Network Error',
            headers: {}
          }
        };

        const errorContext = parseNetworkError(networkError);
        this.sendErrorToBackground(errorContext);
        
        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      this._method = method;
      this._url = url;
      return originalXHROpen.apply(this, [method, url, ...args]);
    };

    XMLHttpRequest.prototype.send = function(...args) {
      this.addEventListener('loadend', () => {
        if (this.status >= 400) {
          const networkError = {
            request: {
              url: this._url,
              method: this._method,
              headers: {}
            },
            response: {
              status: this.status,
              statusText: this.statusText,
              headers: {}
            }
          };

          const errorContext = parseNetworkError(networkError);
          this.sendErrorToBackground(errorContext);
        }
      });

      return originalXHRSend.apply(this, args);
    };
  }

  sendErrorToBackground(errorContext) {
    try {
      chrome.runtime.sendMessage({
        type: 'ERROR_DETECTED',
        payload: errorContext
      });
    } catch (error) {
      // Extension might not be available, ignore
      console.debug('Could not send error to background:', error);
    }
  }
}

// Initialize content script
if (typeof window !== 'undefined') {
  new ContentScript();
}

