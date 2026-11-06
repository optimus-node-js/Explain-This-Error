import { z } from 'zod';

// Request/Response schemas
export const ErrorContextSchema = z.object({
  type: z.enum(['console', 'network', 'manual']),
  timestamp: z.number(),
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    line: z.number().optional(),
    column: z.number().optional(),
    filename: z.string().optional(),
  }),
  context: z.object({
    url: z.string(),
    userAgent: z.string(),
    framework: z.string().optional(),
    networkInfo: z.object({
      url: z.string(),
      method: z.string(),
      status: z.number(),
      statusText: z.string(),
      response: z.string().optional(),
      requestHeaders: z.record(z.string(), z.string()).optional(),
      responseHeaders: z.record(z.string(), z.string()).optional(),
    }).optional(),
  }),
  metadata: z.object({
    severity: z.enum(['error', 'warning', 'info']),
    frequency: z.number(),
    resolved: z.boolean(),
  }),
});

export const ExplainErrorRequestSchema = z.object({
  error: ErrorContextSchema,
  context: z.object({
    framework: z.string().optional(),
    environment: z.string().optional(),
  }).optional(),
});

export const ExplainErrorResponseSchema = z.object({
  explanation: z.string(),
  rootCause: z.string(),
  fixSnippet: z.string(),
  references: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export const FeedbackRequestSchema = z.object({
  explanationId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Type exports
export type ErrorContext = z.infer<typeof ErrorContextSchema>;
export type ExplainErrorRequest = z.infer<typeof ExplainErrorRequestSchema>;
export type ExplainErrorResponse = z.infer<typeof ExplainErrorResponseSchema>;
export type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI Service types
export interface AIServiceConfig {
  provider: 'openai' | 'claude';
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface AIPrompt {
  systemPrompt: string;
  contextPrompt: string;
  outputFormat: string;
}

// Cache types
export interface CacheConfig {
  ttl: number;
  key: string;
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, public provider?: string) {
    super(message, 503, 'AI_SERVICE_ERROR');
    this.name = 'AIServiceError';
  }
}
