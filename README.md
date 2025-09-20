# AI Tudor – AI Code Tutor

A **solo-user** AI-powered code tutoring application with voice support, mock API, and interactive playground. Built as a Next.js monorepo with TypeScript.

## 🚀 Features

### Core Functionality
- **Chat Interface** (`/`) - Ask questions, get structured AI responses with steps and Socratic questions
- **Playground** (`/learn/playground`) - Write code, run it, or get explanations with AI assistance
- **Mock AI API** - Fully functional without external LLM dependencies
- **Solo User** - No authentication required, everything works locally

### Voice Support (Web APIs)
- **Speech Recognition** - Voice input for both chat and code (Web Speech API)
- **Text-to-Speech** - AI responses read aloud (Speech Synthesis API)
- **Settings** - Language (EN/PL), rate, pitch controls (stored in localStorage)
- **Graceful Fallback** - Works without voice support, shows appropriate UI states

### Technical Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Language:** TypeScript everywhere
- **Styling:** Tailwind CSS with dark theme
- **State:** Zustand for voice settings persistence
- **Testing:** Vitest + React Testing Library
- **Voice:** Web Speech API + Speech Synthesis API

## 📁 Project Structure
```
apps/web/                   # Main Next.js application
├── app/
│   ├── (app)/page.tsx     # Chat homepage
│   ├── learn/playground/   # Code playground
│   └── api/
│       ├── health/        # Health check endpoint
│       └── tutor/         # Main AI tutor API
├── src/
│   ├── lib/tutor/         # API types & validation
│   ├── store/             # Zustand stores (voice settings)
│   ├── hooks/             # React hooks (useTutorChat)
│   └── __tests__/         # Test suites
packages/
├── core/                  # Shared logic & Prisma
│   ├── src/hooks/         # Speech recognition & synthesis
│   └── src/utils/         # Prisma client (noop fallback)
└── ui/                    # Reusable components
    └── src/components/    # ChatComposer, ChatMessageList
```

## 🛠 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation & Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
open http://localhost:3000
```

### Environment Setup (Optional)
```bash
cp .env.example .env
# Edit .env with your preferred settings
```

**Note:** App works fully with mock data - no API keys required!

## 🔧 Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start development server (http://localhost:3000) |
| `pnpm build` | Build all packages and apps for production |
| `pnpm lint` | Run ESLint across all workspaces |
| `pnpm test` | Run Vitest test suites |
| `pnpm format` | Format code with Prettier |

## 🎤 Voice Features

### Browser Support
- **Chrome/Edge** - Full Web Speech API support
- **Safari** - Speech Synthesis only (no recognition)
- **Firefox** - Limited support
- **Mobile** - Varies by platform

### Voice Controls
- **🎤 Mic Button** - Start/stop voice input (turns red when recording)
- **🔊 Speaker Button** - Enable/disable voice output
- **Settings** - Language, rate, and pitch stored in localStorage

### Keyboard Shortcuts
- Chat: Type normally, voice transcription appends to input
- Playground: Voice input adds to code editor

## 🧪 Testing & CI

- **Unit Tests** - API validation, component rendering
- **Integration Tests** - Mock API endpoints, voice API mocking
- **CI Pipeline** - GitHub Actions: lint → test → build

## 🚀 Production Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ai-tudor&env=NEXT_PUBLIC_APP_URL&envDescription=Set%20your%20app%20URL%20for%20production&demo-title=AI%20Tudor%20Demo&demo-description=Solo-user%20AI%20code%20tutor%20with%20voice%20support)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/ai-tudor)

### Manual Deployment

```bash
# Install deployment dependencies
pnpm install

# Build for production
pnpm build

# Deploy to Vercel
pnpm deploy:vercel

# Deploy to Netlify
pnpm deploy:netlify

# Local production preview
pnpm preview
```

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Set production variables:**
   ```bash
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   # Optional: Add analytics, monitoring keys
   ```

3. **Deploy and configure domain** (Vercel/Netlify dashboard)

### 📱 PWA Installation

After deployment, users can install AI Tudor as a native-like app:

**On Mobile:**
1. Open app in browser (Chrome/Safari)
2. Tap "Add to Home Screen" prompt
3. App installs with icon on home screen

**On Desktop:**
1. Look for install icon in address bar
2. Click "Install AI Tudor"
3. App opens in standalone window

### 📊 Performance Monitoring

```bash
# Run Lighthouse analysis
pnpm lighthouse

# Bundle size analysis
pnpm analyze

# Performance metrics
open analyze/client.html
```

**Production optimizations included:**
- ✅ Security headers
- ✅ Image optimization (WebP/AVIF)
- ✅ Bundle splitting
- ✅ Static optimization
- ✅ Lighthouse CI ready

## 🔮 Future Enhancements

### Planned Features
1. **Real LLM Integration** - Replace mocks with OpenAI/Anthropic APIs
2. **Code Execution** - Safe sandboxed code running
3. **User Progress** - Learning path tracking with Prisma
4. **Mobile App** - React Native companion
5. **Advanced Voice** - Whisper integration for better STT

### Architecture Notes
- **Solo-user first** - No complex auth/multi-tenancy
- **Progressive enhancement** - Works without voice, better with it
- **API-ready** - Easy to swap mock with real LLM endpoints

## 📜 License

MIT - Feel free to use for learning and projects!
