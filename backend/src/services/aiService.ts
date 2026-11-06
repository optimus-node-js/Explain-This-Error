import OpenAI from 'openai';
import { config } from '../lib/config.js';
import logger from '../lib/logger.js';
import type { ErrorContext, AIServiceConfig, ExplainErrorResponse } from '../types/index.js';
import { AIServiceError } from '../types/index.js';

class AIService {
  private openai: OpenAI | null = null;
  private config: AIServiceConfig;

  constructor() {
    this.config = {
      provider: 'openai',
      model: config.AI_DEFAULT_MODEL,
      maxTokens: config.AI_MAX_TOKENS,
      temperature: config.AI_TEMPERATURE,
      timeout: config.AI_TIMEOUT,
    };

    if (config.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: config.OPENAI_API_KEY,
        timeout: this.config.timeout,
      });
    }
  }

  async explainError(error: ErrorContext, context?: { framework?: string; environment?: string }): Promise<ExplainErrorResponse> {
    if (!this.openai) {
      throw new AIServiceError('OpenAI API key not configured');
    }

    try {
      const prompt = this.buildPrompt(error, context);
      
      logger.debug({ 
        errorType: error.type,
        errorMessage: error.error.message,
        framework: context?.framework 
      }, 'Generating AI explanation');

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: prompt.systemPrompt,
          },
          {
            role: 'user',
            content: prompt.contextPrompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceError('No response from AI service');
      }

      const explanation = JSON.parse(content) as ExplainErrorResponse;
      
      // Validate response structure
      this.validateExplanation(explanation);

      logger.info({
        errorType: error.type,
        confidence: explanation.confidence,
        model: this.config.model,
      }, 'AI explanation generated');

      return explanation;
    } catch (error) {
      logger.error({ error }, 'AI service error');
      
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      throw new AIServiceError(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildPrompt(error: ErrorContext, context?: { framework?: string; environment?: string }) {
    const systemPrompt = `You are an expert software engineer and debugging specialist. Your task is to analyze JavaScript/TypeScript errors and provide clear, actionable explanations.

Guidelines:
1. Provide explanations in plain English that any developer can understand
2. Identify the root cause of the error
3. Suggest specific, working code fixes
4. Include relevant documentation links
5. Rate your confidence in the explanation (0.0 to 1.0)
6. Be concise but comprehensive

Always respond with valid JSON in this exact format:
{
  "explanation": "Clear explanation of what went wrong",
  "rootCause": "The underlying reason for the error",
  "fixSnippet": "Working code example to fix the issue",
  "references": ["url1", "url2"],
  "confidence": 0.85
}`;

    const contextPrompt = `Please analyze this error:

Error Type: ${error.type}
Error Message: ${error.error.message}
${error.error.stack ? `Stack Trace:\n${error.error.stack}` : ''}
${error.error.filename ? `File: ${error.error.filename}` : ''}
${error.error.line ? `Line: ${error.error.line}` : ''}
${error.error.column ? `Column: ${error.error.column}` : ''}
URL: ${error.context.url}
${error.context.framework ? `Framework: ${error.context.framework}` : ''}
${context?.framework ? `Detected Framework: ${context.framework}` : ''}
${context?.environment ? `Environment: ${context.environment}` : ''}
${error.context.networkInfo ? `Network Info: ${JSON.stringify(error.context.networkInfo, null, 2)}` : ''}

Please provide a detailed explanation and solution.`;

    return { systemPrompt, contextPrompt };
  }

  private validateExplanation(explanation: any): asserts explanation is ExplainErrorResponse {
    if (!explanation.explanation || typeof explanation.explanation !== 'string') {
      throw new AIServiceError('Invalid explanation format: missing or invalid explanation');
    }
    
    if (!explanation.rootCause || typeof explanation.rootCause !== 'string') {
      throw new AIServiceError('Invalid explanation format: missing or invalid rootCause');
    }
    
    if (!explanation.fixSnippet || typeof explanation.fixSnippet !== 'string') {
      throw new AIServiceError('Invalid explanation format: missing or invalid fixSnippet');
    }
    
    if (!Array.isArray(explanation.references)) {
      throw new AIServiceError('Invalid explanation format: references must be an array');
    }
    
    if (typeof explanation.confidence !== 'number' || explanation.confidence < 0 || explanation.confidence > 1) {
      throw new AIServiceError('Invalid explanation format: confidence must be a number between 0 and 1');
    }
  }

  // Fallback explanation for common errors
  getFallbackExplanation(error: ErrorContext): ExplainErrorResponse {
    const message = error.error.message.toLowerCase();
    
    if (message.includes('cannot read property') || message.includes('cannot read properties')) {
      return {
        explanation: "You're trying to access a property on an undefined or null value. This is one of the most common JavaScript errors.",
        rootCause: "The object you're accessing doesn't exist or hasn't been initialized yet. This often happens with API responses, DOM elements, or object properties that haven't been set.",
        fixSnippet: `// Check if the object exists before accessing properties
if (object && object.property) {
  // Safe to access object.property
  console.log(object.property);
} else {
  console.log('Object or property not available');
}

// Or use optional chaining (ES2020)
console.log(object?.property);`,
        references: [
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_property",
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining"
        ],
        confidence: 0.9
      };
    }
    
    if (message.includes('is not a function')) {
      return {
        explanation: "You're trying to call something that isn't a function. This usually means the variable is undefined, null, or not a function type.",
        rootCause: "The variable you're calling as a function is undefined, null, or not a function type. This often happens with imported modules, event handlers, or method calls on objects.",
        fixSnippet: `// Check if it's a function before calling
if (typeof myFunction === 'function') {
  myFunction();
} else {
  console.log('myFunction is not a function');
}

// For object methods
if (object && typeof object.method === 'function') {
  object.method();
}`,
        references: [
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Not_a_function",
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof"
        ],
        confidence: 0.9
      };
    }

    if (message.includes('unexpected token')) {
      return {
        explanation: "There's a syntax error in your JavaScript code. The parser encountered a character or token it wasn't expecting.",
        rootCause: "This is usually caused by missing brackets, parentheses, or semicolons, or by using invalid JavaScript syntax.",
        fixSnippet: `// Check for common syntax issues:
// 1. Missing brackets
if (condition) {
  // code
} // <- Make sure this closing bracket exists

// 2. Missing parentheses
function myFunction() {
  // code
} // <- Make sure this closing parenthesis exists

// 3. Missing semicolons (in some cases)
const variable = 'value'; // <- Semicolon here

// 4. Invalid characters
// Make sure you're not using smart quotes or other special characters`,
        references: [
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token",
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types"
        ],
        confidence: 0.8
      };
    }

    // Generic fallback
    return {
      explanation: "This is a JavaScript error that needs investigation. The error message provides clues about what went wrong.",
      rootCause: "The error occurred due to a runtime issue in your code. Common causes include undefined variables, type mismatches, or logic errors.",
      fixSnippet: `// Debug the error step by step
console.log('Error occurred:', error);
console.log('Check the browser console for more details');

// Add error handling
try {
  // Your code here
} catch (error) {
  console.error('Caught error:', error);
  // Handle the error appropriately
}`,
      references: [
        "https://developer.mozilla.org/en-US/docs/Web/API/Console",
        "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch"
      ],
      confidence: 0.3
    };
  }
}

export default new AIService();
