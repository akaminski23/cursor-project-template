# AI 2DoR – AI Code Tutor

A production-ready monorepo scaffold for AI 2DoR, an AI-assisted code tutoring progressive web app with voice support and progress tracking.

## Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Language:** TypeScript everywhere
- **Styling:** Tailwind CSS
- **State:** Zustand stores in `@ai-2dor/core`
- **Data:** Prisma (Postgres default, works with modern managed databases)
- **AI:** OpenAI GPT-5 client with mock fallback
- **Voice:** Web Speech API hooks with Whisper fallback
- **Testing:** Vitest + ESLint + Prettier

## Monorepo Layout
```
apps/
  web/        # Next.js PWA shell
packages/
  core/       # Shared logic, Prisma service, speech hooks
  ui/         # Reusable UI primitives (chat list, composer)
docs/
  AI_TUTOR_PROMPT.md
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
- `DATABASE_URL` – Prisma connection string (Postgres recommended locally)

### Database
Generate the Prisma client and apply the migrations:
```bash
pnpm --filter @ai-2dor/core exec prisma generate
pnpm --filter @ai-2dor/core exec prisma migrate deploy
pnpm --filter @ai-2dor/core db:seed
```

### Concept checkpoint feature
- Start the Next.js app: `pnpm -C apps/web dev`
- Visit `http://localhost:3000/learn/checkpoint` to use the checkpoint page.
- The page calls the REST API at `/api/checkpoint` for saving and listing notes.

## Scripts
| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint across workspaces |
| `pnpm test` | Execute Vitest suites |
| `pnpm format` | Format sources via Prettier |

## Testing & CI
- Vitest is configured for shared logic under `packages/`
- GitHub Actions workflow runs lint → test → build on pull requests

## Next Steps
1. Expand voice UX (visualizers, error surfacing)
2. Launch interactive code playground with execution sandboxes
3. Scaffold React Native companion shell for mobile apps

## License
MIT
