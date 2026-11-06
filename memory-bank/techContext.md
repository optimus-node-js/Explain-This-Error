# Technical Context: Explain This Error

## Technology Stack

### Frontend/Extension Stack

#### Core Technologies
```typescript
{
  "runtime": "Chrome Extension Manifest V3",
  "language": "TypeScript 5.0+",
  "framework": "React 18",
  "styling": "Tailwind CSS 3.3",
  "bundler": "Vite 4.0",
  "devtools": "Chrome DevTools API"
}
```

#### Extension-Specific Libraries
- **@types/chrome:** TypeScript definitions for Chrome APIs
- **webextension-polyfill:** Cross-browser compatibility
- **chrome-extension-async:** Promise-based Chrome API wrapper

#### UI Libraries
- **@headlessui/react:** Accessible UI components
- **@heroicons/react:** Icon library
- **react-hot-toast:** Notifications
- **framer-motion:** Animations (if needed)

#### Development Tools
```json
{
  "linting": "ESLint + Prettier",
  "testing": "Vitest + React Testing Library",
  "bundling": "Vite with extension plugin",
  "manifest": "Custom Vite plugin for Manifest V3"
}
```

### Backend Stack

#### Core Backend
```typescript
{
  "runtime": "Node.js 18+",
  "language": "TypeScript",
  "framework": "Fastify 4.0",
  "validation": "Zod",
  "logging": "Pino",
  "monitoring": "Sentry"
}
```

#### Database & Caching
```typescript
{
  "primary_db": "PostgreSQL 15",
  "orm": "Prisma 5.0",
  "cache": "Redis 7.0",
  "search": "PostgreSQL Full-Text Search"
}
```

#### AI Integration
```typescript
{
  "primary_ai": "OpenAI GPT-4",
  "fallback_ai": "Anthropic Claude 3",
  "client": "openai npm package",
  "prompting": "Custom prompt engineering"
}
```

## Development Setup

### Extension Development Environment

#### Project Structure
```
extension/
├── src/
│   ├── content/          # Content scripts
│   ├── background/       # Service worker
│   ├── devtools/        # DevTools panel
│   ├── popup/           # Extension popup
│   ├── shared/          # Shared utilities
│   └── types/           # TypeScript definitions
├── public/              # Static assets
├── manifest.json        # Extension manifest
└── vite.config.ts       # Build configuration
```

#### Development Commands
```bash
# Development mode with hot reload
bun run dev

# Build for production
bun run build

# Package for Chrome Web Store
bun run package

# Test the extension
bun run test
```

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest: './manifest.json'
    })
  ],
  build: {
    rollupOptions: {
      input: {
        background: 'src/background/index.ts',
        content: 'src/content/index.ts',
        devtools: 'src/devtools/index.html',
        popup: 'src/popup/index.html'
      }
    }
  }
});
```

### Backend Development Environment

#### Project Structure
```
backend/
├── src/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── lib/            # Utilities
│   ├── types/          # TypeScript definitions
│   └── db/             # Database utilities
├── prisma/             # Database schema
├── tests/              # Test files
└── docker/             # Docker configuration
```

#### Environment Variables
```bash
# .env.example
DATABASE_URL="postgresql://user:***REDACTED***@localhost:5432/explainerror"
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="***REDACTED***"
CLAUDE_API_KEY="***REDACTED***"
JWT_SECRET="your-secret-key"
NODE_ENV="development"
PORT="3000"
```

#### Development Commands
```bash
# Start development server
bun run dev

# Database operations
bun run db:migrate
bun run db:seed
bun run db:studio

# Testing
bun run test
bun run test:watch
bun run test:coverage

# Production build
bun run build
bun start
```

## Technical Constraints

### Browser Extension Limitations

#### Manifest V3 Restrictions
- **Service Workers:** Limited persistent background scripts
- **Content Security Policy:** Strict CSP requirements
- **Dynamic Imports:** Limited dynamic code execution
- **Network Requests:** Must declare host permissions

#### DevTools API Constraints
```typescript
// Limited to when DevTools is open
chrome.devtools.network.onRequestFinished.addListener(callback);

// Cannot access page context directly
// Must use content script injection
```

#### Cross-Origin Limitations
```typescript
// Must declare in manifest
"host_permissions": [
  "https://api.explainthiserror.com/*"
]

// Cannot make arbitrary external requests
```

### Performance Requirements

#### Response Time Targets
- **Error Detection:** <100ms
- **UI Update:** <200ms  
- **AI Explanation:** <3000ms
- **Cache Hit:** <50ms

#### Memory Constraints
- **Extension:** <50MB total memory
- **Background Script:** <10MB persistent
- **Content Script:** <5MB per tab

#### Network Optimization
```typescript
// Batch requests when possible
interface BatchExplanationRequest {
  errors: ErrorContext[];
  maxBatchSize: 5;
}

// Compress payloads
headers: {
  'Content-Encoding': 'gzip',
  'Accept-Encoding': 'gzip, deflate'
}
```

### Security Requirements

#### Data Privacy
```typescript
// Sanitize sensitive data before sending
interface SanitizedError {
  type: string;
  message: string;
  stack?: string; // Remove file paths, tokens
  // Never include: cookies, localStorage, sessionStorage
}
```

#### API Security
```typescript
// Rate limiting
app.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute'
});

// Input validation
const errorSchema = z.object({
  type: z.enum(['console', 'network']),
  message: z.string().max(5000),
  stack: z.string().max(10000).optional()
});
```

## Dependencies & Versions

### Extension Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/chrome": "^0.0.246",
    "webextension-polyfill": "^0.10.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "@crxjs/vite-plugin": "^2.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "vitest": "^0.34.0"
  }
}
```

**Package Manager:** Bun (fast, lightweight alternative to npm)

### Backend Dependencies
```json
{
  "dependencies": {
    "fastify": "^4.21.0",
    "@fastify/cors": "^8.3.0",
    "@fastify/rate-limit": "^8.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "redis": "^4.6.0",
    "openai": "^4.0.0",
    "zod": "^3.22.0",
    "pino": "^8.15.0"
  },
  "devDependencies": {
    "@types/node": "^20.5.0",
    "tsx": "^3.12.0",
    "vitest": "^0.34.0",
    "prisma": "^5.0.0"
  }
}
```

**Package Manager:** Bun (fast, lightweight alternative to npm)

## Deployment Architecture

### Extension Distribution
```mermaid
graph LR
    DEV[Development] --> BUILD[Vite Build]
    BUILD --> PACKAGE[ZIP Package]
    PACKAGE --> CWS[Chrome Web Store]
    PACKAGE --> EDGE[Edge Add-ons]
```

### Backend Deployment
```mermaid
graph TB
    CODE[Source Code] --> DOCKER[Docker Image]
    DOCKER --> REGISTRY[Container Registry]
    REGISTRY --> DEPLOY[Railway/Render]
    
    subgraph "Production"
        LB[Load Balancer]
        APP1[App Instance 1]
        APP2[App Instance 2]
        DB[(PostgreSQL)]
        CACHE[(Redis)]
    end
    
    DEPLOY --> LB
    LB --> APP1
    LB --> APP2
    APP1 --> DB
    APP2 --> DB
    APP1 --> CACHE
    APP2 --> CACHE
```

### Environment Configuration
```typescript
// Different configs per environment
interface Config {
  development: {
    apiUrl: 'http://localhost:3000';
    aiModel: 'gpt-3.5-turbo'; // Cheaper for dev
    logLevel: 'debug';
  };
  production: {
    apiUrl: 'https://api.explainthiserror.com';
    aiModel: 'gpt-4';
    logLevel: 'info';
  };
}
```

## Integration Specifications

### AI Service Integration
```typescript
interface AIServiceConfig {
  provider: 'openai' | 'claude';
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

const openaiConfig: AIServiceConfig = {
  provider: 'openai',
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.1,
  timeout: 10000
};
```

### Database Schema
```prisma
// schema.prisma
model Error {
  id          String   @id @default(cuid())
  hash        String   @unique // For deduplication
  type        String
  message     String
  stack       String?
  frequency   Int      @default(1)
  firstSeen   DateTime @default(now())
  lastSeen    DateTime @updatedAt
  
  explanations Explanation[]
  
  @@map("errors")
}

model Explanation {
  id          String   @id @default(cuid())
  errorId     String
  content     Json
  aiModel     String
  createdAt   DateTime @default(now())
  
  error Error @relation(fields: [errorId], references: [id])
  
  @@map("explanations")
}
```

### Redis Caching Strategy
```typescript
interface CacheStrategy {
  // Common errors - cache for 24 hours
  commonErrors: {
    ttl: 86400;
    pattern: 'common:*';
  };
  
  // Recent explanations - cache for 1 hour
  recentExplanations: {
    ttl: 3600;
    pattern: 'explain:*';
  };
  
  // User sessions - cache for 30 minutes
  userSessions: {
    ttl: 1800;
    pattern: 'session:*';
  };
}
```
