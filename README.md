# Explain This Error

**Tagline:** Highlight any error → instantly understand it + get fix suggestions.

A browser extension that integrates with Chrome DevTools to provide AI-powered error explanations and fix suggestions, helping developers understand and resolve errors faster.

## 🚀 Features

- **Real-time Error Detection** - Monitors console and network errors automatically
- **AI-Powered Explanations** - Uses OpenAI GPT-4 to explain errors in plain English
- **Smart Fix Suggestions** - Provides working code snippets and solutions
- **Error History** - Track and manage resolved errors
- **Filtering & Search** - Find specific errors quickly
- **Export Capabilities** - Generate reports for team debugging

## 🏗️ Architecture

### Extension (Frontend)
- **Chrome Extension Manifest V3** with React + TypeScript
- **DevTools Integration** for seamless error monitoring
- **Real-time UI** with Tailwind CSS for modern design
- **Local Storage** for error history and preferences

### Backend (API)
- **Fastify** server with TypeScript
- **OpenAI GPT-4** integration for error explanations
- **PostgreSQL** database with Prisma ORM
- **Redis** caching for performance
- **Rate Limiting** and security features

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- PostgreSQL database
- Redis server
- OpenAI API key

### Backend Setup

1. **Clone and setup backend:**
```bash
cd backend
bun install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

3. **Setup database:**
```bash
bun run db:migrate
bun run db:generate
```

4. **Start backend:**
```bash
bun run dev
```

The API will be available at `http://localhost:3000`

### Extension Setup

1. **Build extension:**
```bash
cd extension
bun install
bun run build
```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/dist` folder

3. **Open DevTools:**
   - Press F12 on any webpage
   - Look for "Explain This Error" tab in DevTools

## 🔧 Development

### Extension Development
```bash
cd extension
bun run dev    # Development with hot reload
bun run build  # Production build
bun run test   # Run tests
```

### Backend Development
```bash
cd backend
bun run dev           # Development server
bun run build         # Build TypeScript
bun run test          # Run tests
bun run db:migrate    # Database migrations
bun run db:studio     # Prisma Studio
```

## 📁 Project Structure

```
explain-this-error/
├── extension/                 # Chrome Extension
│   ├── src/
│   │   ├── background/       # Service worker
│   │   ├── content/          # Content scripts
│   │   ├── devtools/         # DevTools panel
│   │   ├── popup/            # Extension popup
│   │   ├── shared/           # Shared utilities
│   │   └── types/            # TypeScript types
│   ├── manifest.json         # Extension manifest
│   └── vite.config.ts        # Build configuration
├── backend/                  # API Server
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── lib/              # Utilities
│   │   └── types/            # TypeScript types
│   ├── prisma/               # Database schema
│   └── package.json
├── memory-bank/              # Project documentation
└── README.md
```

## 🔌 API Endpoints

### POST /api/v1/explain-error
Explain a JavaScript error using AI.

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

## 🎯 Usage

1. **Install the extension** in Chrome
2. **Open DevTools** (F12) on any webpage
3. **Navigate to "Explain This Error"** tab
4. **Errors are automatically detected** and listed
5. **Click "Explain"** on any error for AI-powered analysis
6. **Copy fix snippets** and apply them to your code
7. **Mark errors as resolved** when fixed

## 🔒 Privacy & Security

- **Minimal Data Collection** - Only error messages and stack traces
- **Data Sanitization** - Personal information is removed before processing
- **Local Storage** - Error history stored locally in browser
- **No Tracking** - No user behavior tracking or analytics
- **Open Source** - Full source code available for review

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting service:
- **Railway** (recommended)
- **Render**
- **Vercel**
- **AWS/GCP/Azure**

### Extension Distribution
1. **Build for production:**
```bash
cd extension
bun run build
```

2. **Package for Chrome Web Store:**
```bash
bun run package
```

3. **Submit to Chrome Web Store** following their guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues:** GitHub Issues
- **Documentation:** Check the memory-bank/ folder
- **Discussions:** GitHub Discussions

## 🗺️ Roadmap

- [ ] VS Code extension
- [ ] Firefox support
- [ ] Team collaboration features
- [ ] CI/CD integration
- [ ] Multi-language support (Python, Java, etc.)
- [ ] Enterprise features

---

**Made with ❤️ for developers who want to spend less time debugging and more time building.**

---

## 👤 Author

**Rahul Vishwakarma** — Senior Full Stack Developer · Ahmedabad, India

[![Portfolio](https://img.shields.io/badge/Portfolio-rahul--vishwakarma--portfolio.vercel.app-0A66C2?style=flat-square&logo=vercel&logoColor=white)](https://rahul-vishwakarma-portfolio.vercel.app/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rahul%20Vishwakarma-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/rahul-vishwakarma-101346192)
[![Email](https://img.shields.io/badge/Email-karmarahul67%40gmail.com-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:karmarahul67@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-optimus--node--js-181717?style=flat-square&logo=github)](https://github.com/optimus-node-js)

If you find this project useful, consider giving it a ⭐.
