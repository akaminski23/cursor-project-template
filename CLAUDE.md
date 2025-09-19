# Claude Code Project Guidelines

## Project Context
This workspace contains standardized development rules and templates for
consistent project setup.

## Development Rules
1. **Verify with real data** - No assumptions, check API/DB/logs
2. **Avoid overengineering** - Small, simple PRs only
3. **Work in small steps** - Test locally after each change
4. **Clear commits** - Use `feat:`, `fix:`, `chore:` prefixes
5. **Security first** - No secrets in repo, use `.env`
6. **Code style** - ESLint + Prettier, TypeScript preferred
7. **Debug end-to-end** - API → state → UI flow

## Template Files Available
- `AGENTS.md` - Project-specific rules template
- `.gitignore` - Standard Node.js gitignore
- `.editorconfig` - Consistent formatting
- `package.json` - Standard scripts template

## Quick Start Commands
```bash
# For new projects from template
npm install
npm run dev

# Standard workflow
git add .
git commit -m "feat: description"
git push
