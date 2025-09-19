# Claude Code Project Guidelines

## Project Context
This workspace contains standardized development rules and templates for consistent project setup.

## Development Rules
1. **Verify with real data** — No assumptions; check API/DB/logs.
2. **Avoid overengineering** — Small, simple PRs only.
3. **Work in small steps** — Test locally after each change.
4. **Clear commits** — Use `feat:`, `fix:`, `chore:`, `docs:` prefixes.
5. **Security first** — No secrets in repo; use `.env`.
6. **Code style** — ESLint + Prettier; TypeScript preferred.
7. **Debug end-to-end** — Follow the flow: API → state → UI.

## Template Files Available
- `AGENTS.md` — Project-specific rules template
- `.gitignore` — Standard Node.js gitignore
- `.editorconfig` — Consistent formatting
- `package.json` — Standard scripts template (if present)

## Quick Start Commands
```bash
# For new projects from this template
npm install
npm run dev

# Standard workflow
git add .
git commit -m "feat: description"
git push
```

## Definition of Done
- Works locally (no console errors)
- Basic tests pass (if present)
- Accessibility basics covered (if UI)
- Updated README and AGENTS.md

---

## Commit Message Templates (Quick Reference)

### 🔑 Prefixes (Conventional Commits)
- **feat:** – Dodanie nowej funkcjonalności  
- **fix:** – Poprawa błędu (bugfix)  
- **docs:** – Zmiany w dokumentacji  
- **chore:** – Maintenance/konfiguracja (np. .gitignore, .editorconfig)  
- **refactor:** – Refaktoryzacja BEZ zmiany zachowania  
- **style:** – Formatowanie/linting (bez logiki)  
- **perf:** – Optymalizacje wydajności  
- **test:** – Dodanie/aktualizacja testów  
- **build:** – Zmiany w build systemie/skryptach  
- **ci:** – Zmiany w konfiguracji CI

### 📋 Najczęstsze Szablony
- `chore: add .editorconfig for consistent formatting`
- `chore: update dependencies (eslint, prettier, vite)`
- `chore: initialize project with template`
- `refactor: simplify component logic in Scanner.tsx`
- `feat: implement barcode scanner UI`
- `fix: resolve SSL error in local dev server`
- `docs: update CLAUDE.md with commit message quick reference`

