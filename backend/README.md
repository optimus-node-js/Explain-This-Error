# Explain This Error - Backend API

Fast, secure API server for AI-powered error explanations.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- PostgreSQL database
- Redis server
- OpenAI API key

### Setup
```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
bun run db:migrate
bun run db:generate

# Start development server
bun run dev
```

The API will be available at `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack
- **Fastify** - Fast, low overhead web framework
- **TypeScript** - Type-safe development
- **Prisma** - Modern database ORM
- **PostgreSQL** - Reliable database
- **Redis** - High-performance caching
- **OpenAI GPT-4** - AI error explanations
- **Zod** - Runtime type validation

### Project Structure
```
src/
├── routes/          # API endpoints
├── services/        # Business logic
├── lib/            # Utilities and configuration
├── types/          # TypeScript type definitions
└── index.ts        # Application entry point
```

## 🔌 API Endpoints

### POST /api/v1/explain-error
Generate AI-powered error explanation.

**Request:**
```json
{
  "error": {
    "type": "console",
    "timestamp": 1699123456789,
    "error": {
      "message": "Cannot read property 'map' of undefined",
      "stack": "TypeError: Cannot read property...",
      "line": 42,
      "column": 15,
      "filename": "app.js"
    },
    "context": {
      "url": "https://example.com",
      "userAgent": "Mozilla/5.0...",
      "framework": "React"
    },
    "metadata": {
      "severity": "error",
      "frequency": 1,
      "resolved": false
    }
  },
  "context": {
    "framework": "React",
    "environment": "browser"
  }
}
```

**Response:**
```json
{
  "explanation": "You're trying to use .map() on a variable that is undefined...",
  "rootCause": "The array you're trying to map over hasn't been initialized...",
  "fixSnippet": "if (array && array.length) {\n  array.map(item => ...)\n}",
  "references": [
    "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cant_access_property"
  ],
  "confidence": 0.9
}
```

### GET /api/v1/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-11-04T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🔧 Development

### Commands
```bash
# Development server with hot reload
bun run dev

# Build TypeScript
bun run build

# Start production server
bun start

# Run tests
bun run test

# Database operations
bun run db:migrate    # Run migrations
bun run db:generate   # Generate Prisma client
bun run db:studio     # Open Prisma Studio
bun run db:seed       # Seed database
```

### Environment Variables
```bash
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL="postgresql://user:***REDACTED***@localhost:5432/explainerror"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Services
OPENAI_API_KEY="sk-your-openai-key-here"
CLAUDE_API_KEY="sk-ant-***REDACTED***"

# Security
JWT_SECRET="your-super-secret-jwt-key"

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000
```

## 🗄️ Database

### Schema
- **Error** - Error records with metadata
- **Explanation** - AI-generated explanations
- **User** - User accounts (future)
- **UserSession** - User sessions (future)
- **Feedback** - User feedback on explanations

### Migrations
```bash
# Create new migration
bunx prisma migrate dev --name migration_name

# Apply migrations
bun run db:migrate

# Reset database
bunx prisma migrate reset
```

## 🚀 Deployment

### Railway (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "start"]
```

### Environment Setup
- **Production:** Set `NODE_ENV=production`
- **Database:** Use managed PostgreSQL (Railway, Supabase, etc.)
- **Redis:** Use managed Redis (Railway, Redis Cloud, etc.)
- **Monitoring:** Add logging and error tracking

## 🔒 Security

### Rate Limiting
- 100 requests per minute per IP
- Configurable limits per endpoint
- Graceful error responses

### Input Validation
- Zod schema validation
- Sanitized error data
- Type-safe request/response

### Error Handling
- Structured error responses
- No sensitive data exposure
- Comprehensive logging

## 📊 Monitoring

### Logging
- Structured JSON logs with Pino
- Request/response logging
- Error tracking and alerting

### Health Checks
- Database connectivity
- Redis connectivity
- AI service availability

### Metrics
- Request count and latency
- Error rate and types
- AI service usage

## 🧪 Testing

### Unit Tests
```bash
bun run test
```

### Integration Tests
```bash
bun run test:integration
```

### API Testing
Use tools like:
- **Postman** - API testing and documentation
- **Insomnia** - REST client
- **curl** - Command line testing

## 🔍 Debugging

### Development
- Hot reload with tsx
- Source maps for debugging
- Detailed error messages

### Production
- Structured logging
- Error tracking (Sentry)
- Performance monitoring

## 📈 Performance

### Optimization
- Redis caching for common errors
- Database query optimization
- Response compression
- Connection pooling

### Scaling
- Horizontal scaling with load balancer
- Database read replicas
- Redis clustering
- CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details