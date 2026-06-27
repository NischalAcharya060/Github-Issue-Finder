# AGENTS.md — GitHub Issue Finder

## Project Overview
A Next.js 16 (App Router) SaaS-style tool to search and filter GitHub issues with powerful filters, sorting, and a clean dashboard UI. Built with TypeScript, Tailwind CSS v4, shadcn/ui, and TanStack Query.

## Key Commands
- `npm run dev` — Start development server
- `npm run build` — Prisma generate + production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm test` — Jest

## Architecture
- **Routing**: Next.js App Router (`src/app/`) — layout, pages, API routes
- **Pages**: `/` (search), `/my-issues`, `/my-repos`
- **API Routes**: Under `src/app/api/` — search issues/repos, saved issues/repos, preferences, ignored repos
- **Auth**: NextAuth.js v5 with GitHub OAuth + PrismaAdapter
- **Database**: PostgreSQL via Prisma ORM (`prisma/schema.prisma`)
- **Caching**: Upstash Redis for server-side API caching
- **Data Fetching**: TanStack React Query (client-side) + Axios for GitHub API calls

## Component Structure
- `src/components/ui/` — shadcn/ui primitives (button, badge, card, dialog, etc.)
- `src/components/search/` — SearchBar, FilterPanel, SortDropdown
- `src/components/issues/` — IssueCard, IssueList, IssueDetailModal, SavedIssueCard
- `src/components/repos/` — RepoList, RepoIssuesModal
- `src/components/dashboard/` — ForYouFeed, TrendingFeed, SearchAnalytics, StatsCards
- `src/components/layout/` — Navbar, Sidebar, SettingsDialog
- `src/components/shared/` — Pagination, ThemeToggle, Welcome, ConfirmDialog, ExportButton, etc.
- `src/components/providers/` — TanStack Query Provider, ServiceWorkerRegister
- `src/components/motion/` — Framer Motion primitives (FadeInUp, Stagger, etc.)

## SEO / Structured Data
- All structured data is injected via `JsonLd` component in root layout
- Schema types implemented: WebApplication, SearchAction, FAQPage, HowTo, BreadcrumbList, QAPage, SpeakableSpecification
- Sitemap: `src/app/sitemap.ts` — auto-generated
- Robots: `src/app/robots.ts` — explicit AI crawler allowances
- OG image: `src/app/opengraph-image.tsx` — auto-generated via `next/og`

## Conventions
- **Client/Server**: Pages with interactivity use `"use client"`; data-only logic stays server-side
- **Styling**: Tailwind CSS v4 with shadcn/ui theming via CSS variables
- **Imports**: Use `@/` alias for src directory
- **Icons**: Lucide React preferred
- **Types**: Defined in `src/lib/types.ts`
- **API calls**: Via `src/lib/github-api.ts` (Axios instance)
- **No comments** in production code unless necessary
