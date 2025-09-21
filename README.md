# Daily Food Tracker - Multi-Platform App

A comprehensive food tracking application designed for men 30+ with joint pain (@kaminskiperformance). Features inflammation scoring, macro tracking, fitness integration, and coach dashboard across iOS, Android, and Web platforms.

## Stack
- **Backend:** Next.js 14 API Routes + Prisma ORM
- **Web:** Next.js 14 + React 18 + TypeScript
- **iOS:** Swift Package with SwiftUI
- **Android:** Jetpack Compose + Kotlin
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Validation:** Zod schemas for type safety
- **Charts:** Recharts (Web) / Charts (iOS) / MPAndroidChart
- **Testing:** Vitest + Playwright + Swift Test

## Monorepo Layout
```
apps/
  web/        # Next.js web app (coach dashboard + API)
  ios/        # SwiftUI iOS app with native food logging
  android/    # Jetpack Compose Android app
packages/
  core/       # Shared types, Prisma models, validation schemas
  ui/         # Shared UI components (future)
docs/
  API_ENDPOINTS.md
```

## Getting Started
```bash
pnpm install
pnpm dev      # Runs apps/web dev server
```

### Environment
Copy `.env.example` to `.env` and add your keys:
```bash
cp .env.example .env
```
Variables:
- `OPENAI_API_KEY` – optional for live GPT calls
- `OPENAI_MODEL` – override default `gpt-5-turbo`
- `DATABASE_URL` – Prisma connection string (defaults to SQLite file)
- `DATABASE_PROVIDER` – `sqlite` (dev) or `postgresql`

### Database
Generate the Prisma client and set up the food tracking database:
```bash
cd packages/core
pnpm prisma generate
pnpm prisma migrate dev --name add_food_tracking
pnpm prisma db seed  # Adds sample food entries
```

## Scripts
| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm dev:web` | Alias for `pnpm dev` - Start the web dev server |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint across workspaces |
| `pnpm test` | Execute Vitest suites |
| `pnpm format` | Format sources via Prettier |
| `pnpm smoke` | Run smoke test against dev server health endpoint |

## Smoke Test & CI

### Health Check Endpoint
The app exposes `/api/health` endpoint that returns `{ ok: true }` with status 200 when the server is running properly.

### Smoke Test
The smoke test verifies that the dev server starts successfully and responds to health checks:
```bash
pnpm smoke  # Starts server on port 3001, waits for health check, then stops
```

This uses `start-server-and-test` to avoid ELIFECYCLE errors and ensures clean process termination.

### CI Pipeline
- **GitHub Actions workflow:** lint → test → build → smoke test
- **Smoke test in CI:** Verifies dev server starts without crashes
- **Database setup:** SQLite for CI, automatic migrations
- **Zero ELIFECYCLE:** All scripts exit cleanly with proper codes
- Vitest is configured for shared logic under `packages/`

## Next Steps
1. Expand voice UX (visualizers, error surfacing)
2. Launch interactive code playground with execution sandboxes
3. Scaffold React Native companion shell for mobile apps

## License
MIT
