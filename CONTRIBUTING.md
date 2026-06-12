# Contributing to GitHub Issue Finder

Thank you for considering contributing! This guide will help you get started.

## Code of Conduct

By participating, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/NischalAcharya060/Github-Issue-Finder.git
cd Github-Issue-Finder
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use a clear prefix:

| Prefix | Purpose |
|--------|---------|
| `feature/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code refactoring |
| `docs/` | Documentation changes |
| `ui/` | UI/UX improvements |

### 3. Set Up Locally

```bash
npm install
npm run dev
```

### 4. Make Changes

- Follow the existing code style and conventions
- Keep changes focused — one feature/fix per PR
- Update `docs/plan.md` if your change affects architecture
- Add comments only where necessary to explain complex logic

### 5. Run Checks

```bash
npm run lint
npm run build
```

Both must pass with zero errors before submitting.

### 6. Commit & Push

```bash
git add .
git commit -m "Brief description of your changes"
git push origin feature/your-feature-name
```

### 7. Open a Pull Request

- Target the `main` branch
- Use a clear title and description
- Reference any related issues

## Project Structure

```
src/
├── app/               # Pages and layout
├── components/        # React components
│   ├── ui/           # shadcn primitives
│   ├── layout/       # Navbar, Sidebar
│   ├── issues/       # IssueCard, IssueList
│   ├── search/       # SearchBar, FilterPanel
│   ├── dashboard/    # Stats, recent searches
│   └── shared/       # Pagination, ThemeToggle
├── hooks/            # Custom React hooks
└── lib/              # Utilities, types, API
```

## Reporting Issues

Open a GitHub issue with:
- A clear title and description
- Steps to reproduce (if bug)
- Screenshots (if UI-related)
- Environment details (browser, OS)

## Feature Requests

Open a GitHub issue with the `enhancement` label. Describe the feature, why it's useful, and any implementation ideas you have.
