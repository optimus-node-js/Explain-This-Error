import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import aiService from '../services/aiService.js';
import { ExplainErrorRequestSchema, ExplainErrorResponseSchema } from '../types/index.js';
import { ValidationError, AIServiceError } from '../types/index.js';
import logger from '../lib/logger.js';

export default async function explainRoutes(fastify: FastifyInstance) {
  // POST /api/v1/explain-error
  fastify.post('/explain-error', {
    schema: {
      body: ExplainErrorRequestSchema,
    },
  }, async (request, reply) => {
    try {
      const { error, context } = request.body as { error: any; context?: any };
      
      logger.info({
        errorType: error.type,
        errorMessage: error.error.message,
        framework: context?.framework,
      }, 'Explain error request received');

      // Generate AI explanation
      const explanation = await aiService.explainError(error, context);
      
      logger.info({
        errorType: error.type,
        confidence: explanation.confidence,
      }, 'Explanation generated successfully');

      return explanation;
    } catch (error) {
      logger.error({ error }, 'Error in explain-error endpoint');
      
      if (error instanceof ValidationError) {
        reply.code(400);
        return {
          success: false,
          error: error.message,
          field: error.field,
        };
      }
      
      if (error instanceof AIServiceError) {
        reply.code(503);
        return {
          success: false,
          error: 'AI service temporarily unavailable',
          message: error.message,
        };
      }
      
      reply.code(500);
      return {
        success: false,
        error: 'Internal server error',
      };
    }
  });

  // GET /api/v1/health
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  });
}
