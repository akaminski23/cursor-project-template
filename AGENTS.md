# Repository Guidelines

## Project Setup
- Node version: 20.x
- Install deps: `npm install`
- Dev server: `npm run dev`
- Tests: `npm test`
- Build: `npm run build`
- Lint: `npm run lint`

## Tech Stack
- Framework: React (Vite)
- UI: Tailwind (opcjonalnie)
- API: REST (opcjonalnie)
- Infra: Vercel/Render (opcjonalnie)

## Critical Rules
1. Verify with real data (API/DB/logs). No assumptions.
2. Avoid overengineering. Small, simple PRs.
3. Work in small steps. Test locally after each change.
4. Clear commits (`feat: …`, `fix: …`, `chore: …`).
5. Security: no secrets in repo. Use `.env`.
6. Code style: ESLint + Prettier. TypeScript preferowany.
7. Debug flow end-to-end (API → state → UI). Usuń zbędne logi.

## Definition of Done
- [ ] Działa lokalnie (bez błędów w konsoli)
- [ ] Podstawowe testy przechodzą (jeśli są)
- [ ] Dostępność: focus/label (jeśli UI)
- [ ] Zaktualizowane README i AGENTS.md
