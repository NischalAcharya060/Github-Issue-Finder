# GitHub Issue Finder
![Dashboard](public/img/dashboard.png)
A modern SaaS-style tool to search and filter GitHub issues with powerful filters, sorting, and a clean dashboard UI.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **TanStack Query**.

![Example Search](public/img/example.png)

## Features

- **Search** — Search issues by keyword, repository, or organization
- **Filters** — Language, labels, issue state, created/updated year, star range, beginner-friendly, good first issue, help wanted
- **Sorting** — Most recent, most commented, most reactions, repository stars, least competition
- **Dashboard** — Stats overview with per-metric accent colors
- **Issue Cards** — Title, repo, language, labels, stars, date, comments, author, direct GitHub link
- **Dark Mode** — System-aware with manual toggle
- **Responsive** — Mobile sidebar via sheet, desktop sidebar, adaptive grid

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Library | shadcn/ui (Radix primitives) |
| Icons | Lucide React |
| HTTP | Axios |
| Server State | TanStack Query |
| Fonts | Inter + JetBrains Mono |

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm / bun

### Installation

```bash
git clone https://github.com/<your-username>/github-issue-finder.git
cd github-issue-finder
npm install
```

### Environment Variables (Optional)

Create a `.env.local` file in the project root:

```env
# GitHub personal access token — increases API rate limit from 60 to 5,000 req/hr
# Generate at: https://github.com/settings/tokens (no scopes needed for public data)
NEXT_PUBLIC_GITHUB_TOKEN=
```

Without a token, the app works but is limited to 60 requests per hour.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run lint
```

### Production

```bash
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, theme script)
│   ├── page.tsx                # Main dashboard
│   └── globals.css             # Tailwind + shadcn + theme variables
├── components/
│   ├── ui/                     # shadcn primitives
│   ├── layout/                 # Navbar, Sidebar
│   ├── issues/                 # IssueCard, IssueList
│   ├── search/                 # SearchBar, FilterPanel, SortDropdown
│   ├── dashboard/              # StatsCards, RecentSearches
│   ├── shared/                 # Pagination, ThemeToggle, Welcome
│   └── providers/              # TanStack Query provider
├── hooks/
│   ├── use-github-search.ts    # TanStack Query hook for GitHub API
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── use-theme.ts
└── lib/
    ├── github-api.ts           # Axios instance + API functions
    ├── types.ts                # TypeScript interfaces
    ├── constants.ts            # Languages, sort options, years
    └── utils.ts                # cn() helper
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create a branch** — `git checkout -b feature/my-feature`
3. **Commit your changes** — `git commit -m "Add my feature"`
4. **Push** — `git push origin feature/my-feature`
5. **Open a Pull Request**

### Guidelines

- Run `npm run lint` and `npm run build` before submitting
- Keep PRs focused — one feature or fix per PR
- Match existing code style and conventions
- Update `docs/plan.md` if your change affects architecture

