# 🚀 GitHub Issue Finder — Build Plan

## Tech Stack
| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16 (App Router)** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** |
| UI Library | **shadcn/ui** (Radix primitives) |
| Icons | **Lucide React** |
| HTTP | **Axios** |
| Server State | **TanStack Query** |
| Date Utils | **date-fns** |

---

## 1. Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx              ← Dashboard (main view)
│   ├── layout.tsx                ← Root layout (Navbar + Sidebar)
│   ├── globals.css               ← Tailwind + shadcn styles
│   └── page.tsx                  ← Landing / redirect
├── components/
│   ├── ui/                       ← shadcn primitives (button, input, card, etc.)
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── sidebar.tsx
│   ├── issues/
│   │   ├── issue-card.tsx        ← Single issue card
│   │   ├── issue-list.tsx        ← Grid / list of cards
│   │   └── issue-detail-modal.tsx
│   ├── search/
│   │   ├── search-bar.tsx        ← Keyword + entity type
│   │   └── filter-panel.tsx      ← All filter controls
│   ├── dashboard/
│   │   ├── stats-cards.tsx
│   │   └── recent-searches.tsx
│   └── shared/
│       ├── pagination.tsx
│       ├── theme-toggle.tsx
│       └── loading-skeleton.tsx
├── lib/
│   ├── utils.ts                  ← cn() helper
│   ├── github-api.ts             ← Axios instance + API functions
│   ├── constants.ts              ← Filter options, sort options
│   └── types.ts                  ← TypeScript interfaces
└── hooks/
    ├── use-github-search.ts      ← TanStack Query hook for issues
    ├── use-debounce.ts
    └── use-local-storage.ts
```

---

## 2. Features & Implementation

### 2.1 Dashboard
- Stats overview (total issues found, repos scanned, etc.)
- Recent searches (stored in localStorage)
- Quick action buttons (top languages, popular orgs)

### 2.2 GitHub Integration
- **Axios instance** with base URL `https://api.github.com`
- Endpoints:
  - `GET /search/issues` — main search
  - `GET /search/repositories` — repo lookup
  - `GET /orgs/{org}/repos` — org repos
- Auth: optional GitHub token via env `NEXT_PUBLIC_GITHUB_TOKEN` (increases rate limit)

### 2.3 Search Features
- **Keyword search** — free text against issues
- **Repository search** — search within a specific `owner/repo`
- **Organization search** — search across all repos in an org
- **Entity type toggle**: Issues / Repositories / Organizations

### 2.4 Filters
| Filter | Implementation |
|--------|---------------|
| Language | `language:` qualifier + dropdown |
| Labels | Comma-separated `label:` qualifier + multi-select |
| Issue state | `state:open` / `state:closed` — toggle |
| Created year | `created:>=YYYY-01-01` + `created:<=YYYY-12-31` |
| Updated year | `updated:>=YYYY-01-01` + `updated:<=YYYY-12-31` |
| Min stars | `stars:>=N` for repos |
| Max stars | `stars:<=N` for repos |
| Beginner friendly | `label:beginner` |
| Good first issue | `label:"good first issue"` |
| Help wanted | `label:"help wanted"` |

### 2.5 Sorting
| Sort | API param |
|------|-----------|
| Most recent | `sort:created` + `order:desc` |
| Most commented | `sort:comments` + `order:desc` |
| Most reactions | `sort:reactions-+1` + `order:desc` |
| Repository stars | `sort:stars` + `order:desc` (for repo search) |
| Least competition | `sort:created` + `order:asc` (oldest first) |

### 2.6 Issue Cards
Each card displays:
- Issue title (link to GitHub)
- Repository name (with link)
- Language badge
- Labels as colored badges
- Star count
- Open date (formatted with date-fns)
- Comment count
- Author avatar + name
- Direct GitHub link button

---

## 3. Data Flow

```
User Input (SearchBar + FilterPanel)
        │
        ▼
useGithubSearch Hook (TanStack Query)
        │
        ▼
lib/github-api.ts (Axios → GitHub REST API)
        │
        ▼
Response → Typed via TypeScript interfaces
        │
        ▼
IssueList → IssueCard components
        │
        ▼
Pagination component
```

---

## 4. Component Tree

```
RootLayout
├── Navbar
│   ├── Logo
│   ├── SearchBar
│   └── ThemeToggle
├── Sidebar
│   ├── FilterPanel
│   └── RecentSearches
└── Main Content
    ├── Dashboard (stats-cards)
    └── IssueList
        ├── SortDropdown
        └── IssueCard (×N)
            ├── Title + Link
            ├── Repo Badge
            ├── Language Badge
            ├── Labels
            ├── Meta (stars, date, comments, author)
            └── GitHub Button
```

---

## 5. Route Design

| Route | Page |
|-------|------|
| `/` | Landing / redirect to dashboard |
| `/dashboard` | Dashboard with stats + search |
| `/issues` | Full search results page |

---

## 6. Implementation Phases

### Phase 1 — Project Setup
- [x] Next.js + TypeScript + Tailwind installed
- [ ] Install shadcn components (button, card, input, badge, select, dialog, skeleton)
- [ ] Add `NEXT_PUBLIC_GITHUB_TOKEN` to `.env.local`
- [ ] Create `lib/types.ts` with all interfaces
- [ ] Create `lib/constants.ts` with filter/sort options
- [ ] Create `lib/github-api.ts` with Axios instance + API functions

### Phase 2 — Core Infrastructure
- [ ] Implement `use-github-search.ts` hook
- [ ] Implement `use-debounce.ts` hook
- [ ] Implement `use-local-storage.ts` hook
- [ ] Create `IssueCard` component
- [ ] Create `IssueList` component

### Phase 3 — Search & Filters
- [ ] Build `SearchBar` with entity toggle
- [ ] Build `FilterPanel` with all filters
- [ ] Build `SortDropdown`
- [ ] Wire filters to API query params
- [ ] Add `Pagination` component

### Phase 4 — Dashboard & Layout
- [ ] Build `Navbar`
- [ ] Build `Sidebar`
- [ ] Build `Dashboard` with stats cards
- [ ] Build `RecentSearches`
- [ ] Responsive layout

### Phase 5 — Polish & DX
- [ ] Loading skeletons
- [ ] Error states
- [ ] Empty states
- [ ] Dark mode toggle
- [ ] Responsive design
- [ ] GitHub link buttons on cards
- [ ] Performance: memoization, pagination caching
