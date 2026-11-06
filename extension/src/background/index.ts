import { generateErrorId, sanitizeError } from '../shared/utils';
import { ErrorContext, ExtensionMessage, ExplainErrorResponse } from '../types';

// Service worker for background processing
class BackgroundService {
  errors;
  apiUrl;

  constructor() {
    this.errors = new Map();
    this.apiUrl = 'https://api.explainthiserror.com';
    this.setupMessageHandlers();
    this.setupAlarms();
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  async handleMessage(
    message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?) => void
  ) {
    try {
      switch (message.type) {
        case 'ERROR_DETECTED':
          await this.handleErrorDetected(message.payload);
          sendResponse({ success: true });
          break;

        case 'EXPLAIN_ERROR':
          const explanation = await this.explainError(message.payload.error);
          sendResponse({ success: true, explanation });
          break;

        case 'GET_HISTORY':
          const history = await this.getErrorHistory();
          sendResponse({ success: true, history });
          break;

        case 'RESOLVE_ERROR':
          await this.resolveError(message.payload.errorId);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background service error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sendResponse({ success: false, error: errorMessage });
    }
  }

  async handleErrorDetected(error) {
    const sanitizedError = sanitizeError(error);
    const errorId = generateErrorId(sanitizedError);
    
    // Check if we already have this error
    const existingError = this.errors.get(errorId);
    if (existingError) {
      existingError.metadata.frequency++;
      existingError.metadata.lastSeen = Date.now();
    } else {
      this.errors.set(errorId, {
        ...sanitizedError,
        id: errorId,
        metadata: {
          ...sanitizedError.metadata,
          firstSeen: Date.now(),
          lastSeen: Date.now()
        }
      });
    }

    // Store in local storage
    await this.saveErrors();
    
    // Notify DevTools panel if open
    this.notifyDevTools('ERROR_ADDED', { errorId, error: this.errors.get(errorId) });
  }

  async explainError(error) {
    try {
      // Check cache first
      const cached = await this.getCachedExplanation(error);
      if (cached) {
        return cached;
      }

      // Call AI service
      const response = await fetch(`${this.apiUrl}/api/v1/explain-error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: sanitizeError(error),
          context: {
            framework: error.context.framework,
            environment: 'browser'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const explanation = await response.json();
      
      // Cache the explanation
      await this.cacheExplanation(error, explanation);
      
      return explanation;
    } catch (err) {
      console.error('Error explanation failed:', err);
      // Return fallback explanation
      return this.getFallbackExplanation(error);
    }
  }

  async getCachedExplanation(error) {
    try {
      const cacheKey = `explanation_${generateErrorId(error)}`;
      const cached = await chrome.storage.local.get(cacheKey);
      return cached[cacheKey] || null;
    } catch {
      return null;
    }
  }

  async cacheExplanation(error, explanation) {
    try {
      const cacheKey = `explanation_${generateErrorId(error)}`;
      await chrome.storage.local.set({
        [cacheKey]: explanation,
        [`${cacheKey}_timestamp`]: Date.now()
      });
    } catch (error) {
      console.error('Failed to cache explanation:', error);
    }
  }

  getFallbackExplanation(error) {
    const message = error.error.message.toLowerCase();
    
    if (message.includes('cannot read property')) {
      return {
        explanation: "You're trying to access a property on an undefined or null value.",
        rootCause: "The object you're accessing doesn't exist or hasn't been initialized yet.",
        fixSnippet: "// Check if the object exists before accessing properties\nif (object && object.property) {\n  // Safe to access object.property\n}",
        references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_property"],
        confidence: 0.8
      };
    }
    
    if (message.includes('is not a function')) {
      return {
        explanation: "You're trying to call something that isn't a function.",
        rootCause: "The variable you're calling as a function is undefined, null, or not a function type.",
        fixSnippet: "// Check if it's a function before calling\nif (typeof myFunction === 'function') {\n  myFunction();\n}",
        references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_function"],
        confidence: 0.8
      };
    }

    // Generic fallback
    return {
      explanation: "This is a JavaScript error that needs investigation.",
      rootCause: "The error occurred due to a runtime issue in your code.",
      fixSnippet: "// Check the browser console for more details\nconsole.log('Debug info:', error);",
      references: ["https://developer.mozilla.org/en-US/docs/Web/API/Console"],
      confidence: 0.3
    };
  }

  async getErrorHistory() {
    return Array.from(this.errors.values()).sort(
      (a, b) => (b.metadata.lastSeen || 0) - (a.metadata.lastSeen || 0)
    );
  }

  async resolveError(errorId) {
    const error = this.errors.get(errorId);
    if (error) {
      error.metadata.resolved = true;
      await this.saveErrors();
      this.notifyDevTools('ERROR_RESOLVED', { errorId });
    }
  }

  async saveErrors() {
    try {
      const errorsArray = Array.from(this.errors.values());
      await chrome.storage.local.set({ errors: errorsArray });
    } catch (error) {
      console.error('Failed to save errors:', error);
    }
  }

  async loadErrors() {
    try {
      const result = await chrome.storage.local.get('errors');
      if (result.errors) {
        result.errors.forEach((error) => {
          if (error.id) {
            this.errors.set(error.id, error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load errors:', error);
    }
  }

  notifyDevTools(type, payload) {
    // Send message to DevTools panel if it's open
    chrome.runtime.sendMessage({
      type: 'DEVTOOLS_MESSAGE',
      payload: { type, ...payload }
    }).catch(() => {
      // DevTools panel might not be open, ignore error
    });
  }

  setupAlarms() {
    // Clean up old errors every hour
    chrome.alarms.create('cleanup', { periodInMinutes: 60 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'cleanup') {
        this.cleanupOldErrors();
      }
    });
  }

  async cleanupOldErrors() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const errorsToDelete = [];

    for (const [id, error] of this.errors) {
      if ((error.metadata.lastSeen || 0) < oneWeekAgo && error.metadata.resolved) {
        errorsToDelete.push(id);
      }
    }

    errorsToDelete.forEach(id => this.errors.delete(id));
    await this.saveErrors();
  }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Load existing errors on startup
backgroundService['loadErrors']();
