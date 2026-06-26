# Issue Finder — Feature & Improvement Plan

## Priority Legend
- **P0**: Critical bug / security
- **P1**: High-value, low-effort quick wins
- **P2**: Medium-impact features
- **P3**: Nice-to-have polish

---

## Phase 1: Quick Wins (P1)

### 1.1 Extract `getRepoFromUrl` to shared utility
**Files:** `issue-card.tsx`, `issue-detail-modal.tsx`, `for-you-feed.tsx`, `trending-feed.tsx`, `page.tsx`
**Do:** Move the inline function to `src/lib/utils.ts`, import everywhere.

### 1.2 Fix local `cn` in trending-feed.tsx
**File:** `src/components/dashboard/trending-feed.tsx:170`
**Do:** Delete the local `cn` function, import from `@/lib/utils`.

### 1.3 Consolidate BASE_URL into env var
**Files:** `sitemap.ts`, `robots.ts`, `layout.tsx`
**Do:** Use `process.env.NEXT_PUBLIC_BASE_URL ?? "https://issue-finder.acharyanischal.com.np"`.

### 1.4 ~~Remove duplicate `X-Github-Token` header~~ *(CANCELLED)*
**Why:** The axios interceptor is on a separate instance (`githubApi`) not used by `searchIssues`/`searchRepositories`. The `X-Github-Token` header is the actual mechanism to pass user PAT to the server proxy. Not redundant.

### 1.5 Consolidate `useHotkey` / `useKeyboardShortcut`
**Files:** `use-hotkey.ts`, `use-keyboard-shortcut.ts`
**Do:** Keep only `useKeyboardShortcut`, remove `useHotkey` wrapper, update imports.

### 1.6 Dynamic page title on search
**File:** `src/app/page.tsx`
**Do:** Update `document.title` when keyword changes (e.g., `"{keyword} — Issue Finder"`).

---

## Phase 2: Bugs & Security (P0/P1)

### 2.1 Proxy `getOrganizationRepos` through API route
**File:** `src/lib/github-api.ts:68-77`
**Do:** Create `src/app/api/search/orgs/[org]/route.ts` that proxies the GitHub call server-side (same pattern as `search/issues`). Update client to call it. Prevents token leak.

### 2.2 Add rate-limiting / security headers via middleware
**New file:** `src/middleware.ts`
**Do:** Add CSP, HSTS, X-Frame-Options headers. Optionally rate-limit API routes.

### 2.3 Add server-side pagination for saved issues/repos
**Files:** `src/app/api/saved-issues/route.ts`, `src/app/api/saved-repos/route.ts`
**Do:** Accept `skip`/`take` query params, pass to Prisma. Update client hooks.

---

## Phase 3: Medium Features (P2)

### 3.1 Redis/Upstash cache (replace in-memory)
**File:** `src/lib/server-cache.ts`
**Do:** Replace `Map` with Upstash Redis (via `@upstash/redis`). Falls back gracefully if unavailable.

### 3.2 API route factory (DRY search proxies)
**Files:** `search/issues/route.ts`, `search/repos/route.ts`
**Do:** Extract `createProxyHandler(endpoint: string)` factory in `src/lib/api-proxy.ts`. Both routes become one-liners.

### 3.3 "System" theme option
**Files:** `settings-dialog.tsx`, `globals.css`, `use-preferences.ts`
**Do:** Add "System" as a third theme option. When selected, read `prefers-color-scheme` media query and react to changes.

### 3.4 Keyboard shortcuts help modal
**New file:** `src/components/shared/keyboard-shortcuts-modal.tsx`
**Do:** Press `?` to show a dialog listing all shortcuts (⌘K, Esc, arrows, etc.).

### 3.5 Bulk actions on search results
**File:** `src/app/page.tsx`
**Do:** Add checkboxes to issue cards. When ≥1 selected, show action bar: "Save All", "Export", "Ignore Repos".

### 3.6 Related issues in detail modal
**File:** `src/components/issues/issue-detail-modal.tsx`
**Do:** Fetch same-repo issues via API and show a "More from this repo" section at the bottom.

---

## Phase 4: Big Features (P2/P3)

### 4.1 AI-powered issue matching
**New files:** `src/lib/ai-matcher.ts`, `src/app/api/match/route.ts`
**Do:** Send issue body + user preferences to an LLM (OpenAI/Claude) to get a richer match score. Cache results. Show score on cards.

### 4.2 Explore / Discover page
**New files:** `src/app/explore/page.tsx`, `src/components/explore/*.tsx`
**Do:** Curated landing with popular orgs, trending languages, recent hot issues, issue stats dashboard.

### 4.3 Digest / notifications
**New files:** `src/app/api/digest/route.ts`, `src/lib/email.ts`
**Do:** Weekly cron that queries user's preferred languages/labels, finds new matching issues, sends email via Resend.

### 4.4 Public user profiles
**New file:** `src/app/user/[login]/page.tsx`
**Do:** Show a user's saved issues (public ones), contribution stats, languages.

### 4.5 Saved searches with alerts
**File:** Already has saved searches in localStorage. **Do:** Persist to DB, allow setting notification threshold (e.g., "alert me when new issues match").

---

## Phase 5: Polish & Testing (P1/P2)

### 5.1 Add test coverage
**Files:** `src/**/__tests__/*.test.{ts,tsx}`
**Do:** Write tests for:
- All hooks (at minimum `use-github-search`, `use-saved-issues`)
- All API routes (integration tests with mocked Prisma)
- `SearchAnalytics` rendering
- `FilterPanel` filter state logic

### 5.2 Type safety improvements
**Files:** multiple
**Do:** Replace `any` in error handlers with `unknown`. Add proper Prisma error type handling.

### 5.3 Accessibility audit
**Do:** Check color contrast on label badges. Add `aria-live` regions for dynamic content. Ensure focus trapping in modals works correctly.

---

## Suggested Implementation Order

```
Week 1: Phase 1 (Quick Wins) + Phase 2 (Bugs)
         → These are safe, low-risk, high-value improvements
Week 2: Phase 3 (Medium Features)
         → Foundation for bigger features
Week 3: Phase 4 (Big Features — pick 1-2)
         → AI matching OR Explore page are highest impact
Week 4: Phase 5 (Testing + Polish)
         → Lock in quality
```

---

## Pre-requisites before starting any phase

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
