// Core error types
export interface ErrorContext {
  id?: string;
  type: 'console' | 'network' | 'manual';
  timestamp: number;
  error: {
    message: string;
    stack?: string;
    line?: number;
    column?: number;
    filename?: string;
  };
  context: {
    url: string;
    userAgent: string;
    framework?: string;
    networkInfo?: NetworkError;
  };
  metadata: {
    severity: 'error' | 'warning' | 'info';
    frequency: number;
    resolved: boolean;
    firstSeen?: number;
    lastSeen?: number;
  };
}

export interface NetworkError {
  url: string;
  method: string;
  status: number;
  statusText: string;
  response?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

// AI explanation types
export interface Explanation {
  id: string;
  errorId: string;
  explanation: string;
  rootCause: string;
  fixSnippet: string;
  references: string[];
  confidence: number;
  aiModel: string;
  createdAt: number;
}

// UI state types
export interface FilterState {
  type: 'all' | 'console' | 'network';
  severity: 'all' | 'error' | 'warning' | 'info';
  resolved: 'all' | 'resolved' | 'unresolved';
  search: string;
}

export interface AppState {
  errors: ErrorContext[];
  explanations: Map<string, Explanation>;
  filters: FilterState;
  selectedError: string | null;
  isLoading: boolean;
}

// API types
export interface ExplainErrorRequest {
  error: ErrorContext;
  context?: {
    framework?: string;
    environment?: string;
  };
}

export interface ExplainErrorResponse {
  explanation: string;
  rootCause: string;
  fixSnippet: string;
  references: string[];
  confidence: number;
}

// Extension message types
export interface ExtensionMessage {
  type: 'ERROR_DETECTED' | 'EXPLAIN_ERROR' | 'GET_HISTORY' | 'RESOLVE_ERROR';
  payload?: any;
}

export interface ErrorDetectedMessage extends ExtensionMessage {
  type: 'ERROR_DETECTED';
  payload: ErrorContext;
}

export interface ExplainErrorMessage extends ExtensionMessage {
  type: 'EXPLAIN_ERROR';
  payload: {
    errorId: string;
    error: ErrorContext;
  };
}
