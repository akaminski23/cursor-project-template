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

## 🧪 Self-Test Prompt for Claude Code

### Quick Check (Fast)
```
Quick check: What are my 3 main dev rules and commit prefixes?
```

### Full Self-Test (Deep)
```
Read CLAUDE.md and summarize:
1. The key development rules you will follow for this repository
2. The commit message prefixes you should use
3. The Definition of Done checklist
```

Expected result:
- Claude lists all rules (Verify, Simplicity, Small Steps, Security, Code Style, Debugging)
- Claude lists commit prefixes (`feat`, `fix`, `docs`, `chore`, etc.)
- Claude repeats Definition of Done exactly

If all three parts are present → ✅ context successfully loaded.

---

## 📋 Commit Message Templates (Quick Reference)

### 🔑 Prefixes (EN / PL)
- **feat:** – New feature / Nowa funkcjonalność  
- **fix:** – Bug fix / Poprawa błędu  
- **docs:** – Documentation / Dokumentacja  
- **chore:** – Maintenance, config / Utrzymanie, konfiguracja  
- **refactor:** – Refactoring without behavior change / Refaktoryzacja bez zmiany logiki  
- **style:** – Formatting, lint / Formatowanie, linting  
- **perf:** – Performance improvement / Optymalizacja wydajności  
- **test:** – Adding/updating tests / Testy  
- **build:** – Build system changes / Zmiany w build  
- **ci:** – CI config changes / Zmiany w CI  

### ✅ Sample Commit Messages
- `chore: add .editorconfig for consistent formatting`
- `chore: update dependencies (eslint, prettier, vite)`
- `chore: initialize project with template`
- `refactor: simplify component logic in Scanner.tsx`
- `feat: implement barcode scanner UI`
- `fix: resolve SSL error in local dev server`
- `docs: update CLAUDE.md with commit message quick reference`

### 📚 Reference
- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)  
- **Tip:** Write commit messages in imperative form (e.g. `add`, `update`, `fix`) – AI and Git tools parse them better.


