# Explain This Error - Browser Extension

Chrome extension that provides AI-powered error explanations directly in DevTools.

## 🚀 Quick Start

### Development
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun run test
```

### Loading in Chrome
1. Build the extension: `bun run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder
5. Open DevTools (F12) and look for "Explain This Error" tab

## 🏗️ Architecture

### Components
- **Background Script** (`src/background/`) - Service worker for error processing
- **Content Script** (`src/content/`) - Error detection and page monitoring
- **DevTools Panel** (`src/devtools/`) - Main UI for error management
- **Popup** (`src/popup/`) - Quick access and recent errors
- **Shared** (`src/shared/`) - Utilities and common types

### Key Features
- Real-time error monitoring
- AI-powered explanations
- Error history and filtering
- Copy-to-clipboard fixes
- Export capabilities

## 🔧 Configuration

### Environment Variables
Create `.env.local` for development:
```bash
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

### Manifest Configuration
Edit `manifest.json` for:
- Permissions
- Content script matches
- API endpoints

## 📦 Build Output

The build process creates:
- `dist/manifest.json` - Extension manifest
- `dist/background.js` - Service worker
- `dist/content.js` - Content script
- `dist/devtools.html` - DevTools panel
- `dist/popup.html` - Extension popup
- `dist/assets/` - Bundled CSS and JS

## 🧪 Testing

```bash
# Run unit tests
bun run test

# Run tests in watch mode
bun run test:watch

# Type checking
bun run type-check
```

## 🚀 Deployment

### Chrome Web Store
1. Build: `bun run build`
2. Package: `bun run package` (creates ZIP)
3. Upload to Chrome Web Store Developer Dashboard

### Local Testing
1. Build: `bun run build`
2. Load `dist/` folder as unpacked extension
3. Test functionality in DevTools

## 🔍 Debugging

### Development Tools
- Chrome DevTools for extension debugging
- React DevTools for component inspection
- Network tab for API calls
- Console for error logs

### Common Issues
- **Extension not loading:** Check manifest.json syntax
- **API errors:** Verify backend is running
- **DevTools panel not showing:** Check permissions
- **Build errors:** Run `bun run type-check`

## 📝 Development Notes

### TypeScript
- Strict mode enabled
- Chrome extension types included
- React types for UI components

### Styling
- Tailwind CSS for utility-first styling
- Custom CSS for extension-specific styles
- Responsive design for different panel sizes

### Performance
- Lazy loading for AI service
- Debounced error detection
- Efficient state management
- Minimal bundle size

## 🔗 Integration

### Backend API
The extension communicates with the backend API:
- Error explanation requests
- History synchronization
- User preferences

### DevTools Integration
- Console error monitoring
- Network request tracking
- Real-time error updates
- Panel state management