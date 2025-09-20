# AI 2DoR – AI Code Tutor

A production-ready monorepo scaffold for AI 2DoR, an AI-assisted code tutoring progressive web app with voice support and progress tracking.

## Stack
- **Framework:** Next.js 14 (App Router) + React 18
- **Language:** TypeScript everywhere
- **Styling:** Tailwind CSS
- **State:** Zustand stores in `@ai-2dor/core`
- **Data:** Prisma (SQLite dev, Postgres-ready)
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
pnpm i
pnpm -C apps/web dev      # open http://localhost:3000
# test:
pnpm test
```

### Environment
Copy `.env.example` to `.env` and add your keys:
```bash
cp .env.example .env
```
Variables:
- `OPENAI_API_KEY` – optional for live GPT calls
- `AI_TUDOR_MODEL` – defaults to `gpt-5-tutor`
- `DATABASE_URL` – Prisma connection string (defaults to SQLite file)
- `DATABASE_PROVIDER` – `sqlite` (dev) or `postgresql`

### Database
Generate the Prisma client and migrate when ready:
```bash
pnpm --filter @ai-2dor/core prisma generate
pnpm --filter @ai-2dor/core prisma migrate dev --name init
```

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
