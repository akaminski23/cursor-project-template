# 🚀 Project Template – Cursor + Claude Code Ready

This repository is a **template** for quickly starting new projects with a consistent structure, coding rules, and AI-friendly setup.

---

## 📦 Getting Started

1. **Use this template** on GitHub → Create new repository
2. Clone your new repository:
```bash
git clone https://github.com/yourusername/your-new-repo.git
cd your-new-repo
```
3. Install dependencies:
```bash
npm install
npm run dev
```

---

## 🛠 Standard Workflow

```bash
git add .
git commit -m "feat: short description"
git push
```

- Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, etc.)
- Keep changes small and focused (one feature or fix per commit)

---

## ✅ Definition of Done

- Works locally (no console errors)  
- Basic tests pass (if present)  
- Accessibility basics (if UI)  
- Updated README and AGENTS.md  

---

## 🤖 AI & Development Rules

This project uses **CLAUDE.md** as the single source of truth for:
- ✅ Development rules (how to work in this repo)
- ✅ Commit message templates (following Conventional Commits)
- ✅ Quick self-test prompt for Claude Code to verify context

### 🔗 Quick Access
- [View CLAUDE.md](./CLAUDE.md)

### 🧪 Quick AI Check
Paste this into Claude Code (or any LLM) to verify rules are loaded:

```
Quick check: What are my 3 main dev rules and commit prefixes?
```

If Claude (or GPT-4, Gemini, etc.) lists the 3 rules + prefixes correctly → ✅ you can start coding safely.

---

## 📚 Additional Documentation

- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [EditorConfig Guide](https://editorconfig.org/)
- [Node.js .gitignore template](https://github.com/github/gitignore/blob/main/Node.gitignore)

---

## 🌱 Contributing

When contributing:
- Follow **CLAUDE.md** rules and commit message templates.
- Run `npm run lint` and `npm test` (if available) before pushing.
- Keep pull requests small and focused.

---

## 🏷 License

MIT – feel free to fork and adapt for your own projects.

