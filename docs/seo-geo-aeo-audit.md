# Comprehensive SEO / GEO / AEO Audit Report
## `github-issue-finder` — Next.js 16 (App Router) + TypeScript + Tailwind v4

---

## Phase 1: Technical & Traditional SEO

### ✅ **Strengths**
- Root layout metadata (`src/app/layout.tsx:18-61`) is well-structured: title, description, keywords, OpenGraph, Twitter card, canonical, manifest, icons, viewport with theme colors.
- Robots.txt (`src/app/robots.ts`) — allows all `*` crawlers, includes sitemap URL and host directive.
- Sitemap (`src/app/sitemap.ts`) — generated via Next.js Metadata Route API.
- Alt attributes present on all 3 `<Image>` usages (auth-button, issue-card, issue-detail-modal).
- Next/Image used exclusively — no raw `<img>` tags — automatic lazy loading and responsive sizing.
- Font optimization via `next/font/google` (Inter + JetBrains Mono) eliminates render-blocking font loads.
- PWA support: service worker with network-first strategy, offline fallback page, web manifest.
- Clean URL structure: `/`, `/my-issues`, `/my-repos` — no query parameters for routing.
- Semantic HTML: `<main>` with `id="main-content"`, skip-to-content link, proper `<header>`, `<aside>` usage.

### ❌ **Critical Gaps**

| # | Issue | File(s) | Severity |
|---|-------|---------|----------|
| 1 | **No per-page metadata** — `/my-issues` and `/my-repos` have zero metadata exports; they inherit only the root layout title/description. Both appear in search results with identical metadata. | `src/app/my-issues/page.tsx`, `src/app/my-repos/page.tsx` | **HIGH** |
| 2 | **Client-side `document.title` override** — Home page sets title via `useEffect` (`src/app/page.tsx:217-221`). This is not SSR-friendly; crawlers may not execute JS, so the dynamic keyword-title is invisible to search engines. | `src/app/page.tsx:217-221` | **HIGH** |
| 3 | **Sitemap only includes root URL** — `/my-issues` and `/my-repos` are absent from `sitemap.xml`. These pages are effectively invisible to crawlers for indexing priority. | `src/app/sitemap.ts` | **HIGH** |
| 4 | **No OpenGraph or Twitter images** — `og:image` and `twitter:image` are missing. Social shares render without a preview card, dramatically reducing CTR from LinkedIn, X/Twitter, Discord, Slack. | `src/app/layout.tsx:37-51` | **MEDIUM** |
| 5 | **No `generateMetadata` anywhere** — The `generateMetadata` async function (Next.js 14+ best practice for dynamic page metadata) is not used on any page. | All pages | **MEDIUM** |
| 6 | **Canonical only set on root** — `/my-issues` and `/my-repos` lack canonical tags. Duplicate content risk if they are accessible via multiple paths. | All pages except root | **MEDIUM** |
| 7 | **`next.config.ts` has no headers (CSP, HSTS, etc.)** — No security/SEO headers configured. Missing `X-Robots-Tag`, `Link rel=canonical`, or caching headers for static assets. | `next.config.ts` | **LOW** |

### 🟡 **Observations**
- Image files in `/public/img/` (dashboard.png, example.png) are referenced only in `README.md` — not served on any page. Not an SEO issue but worth noting.
- The `site.webmanifest` has inconsistent `theme_color` (#10b981) vs layout's viewport themeColor (#3B82F6/#0D1117). This causes a flash of wrong color on PWA launch.

---

## Phase 2: Generative Engine Optimization (GEO)

### ❌ **Critical Gaps**

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Zero structured data / Schema.org markup** — No `WebApplication`, `SearchAction`, `FAQPage`, `Article`, `BreadcrumbList`, or any other schema. LLMs cannot extract structured entity data. AI systems (ChatGPT, Perplexity, Google AI Overviews) are 30-40% more likely to cite pages with schema markup. | **HIGH** |
| 2 | **No statistics or data-driven claims** — The site makes no authoritative claims backed by numbers. Princeton GEO research shows statistics boost AI citation by +37-40%. Example: *"Indexing 200M+ GitHub issues"* or *"Used by 5K+ open-source contributors"*. | **HIGH** |
| 3 | **No expert quotes or author attribution on any content** — +30% citation boost for expert-attributed content. No author bios, titles, or "According to..." framing. | **HIGH** |
| 4 | **No `llms.txt` file** — Missing the standard context file that AI systems (Claude, ChatGPT, Perplexity) use to understand what the site does. This is a simple, high-impact addition. | **MEDIUM** |
| 5 | **No unique/original data to cite** — The site is a search interface over GitHub's public API. It generates no original research, benchmarks, or proprietary data that LLMs would want to cite. | **MEDIUM** |
| 6 | **No freshness dates visible** — No "Last updated" or "Published on" dates. AI systems weight recency heavily; undated content is less likely to be cited. | **MEDIUM** |
| 7 | **No FAQ section on any page** — FAQPage schema is one of the most extracted content types by AI. Missing entirely. | **MEDIUM** |
| 8 | **Single-page-per-keyword not applicable** — As a search tool, the app has fixed routes. However, search result pages (which contain the richest content) are client-rendered and not indexed. | **LOW** |

### Opportunity for GEO
The tool's core value — finding `good-first-issues` and open-source opportunities — is highly citable. If the app had a landing page with:
- A definition block (*"Issue Finder helps open-source contributors discover..."*)
- A stat block (*"Search across millions of GitHub issues..."*)
- FAQPage schema (*"What is a good first issue?", "How do I find beginner-friendly issues?"*)
- WebApplication schema with SearchAction

...AI engines would cite it as a tool recommendation for queries like *"how to find open source issues to contribute to"*.

---

## Phase 3: Answer Engine Optimization (AEO)

### ❌ **Critical Gaps**

| # | Issue | Severity |
|---|-------|----------|
| 1 | **No extractable answer blocks** — Content is dynamically rendered client-side. There are no standalone 40-60 word answer passages that AEO systems (Siri, Google Assistant, Alexa) can extract for voice/answer results. | **HIGH** |
| 2 | **No FAQPage schema** — The most important schema for voice search and featured snippets. Google Assistant and Siri preferentially pull answers from FAQPage markup. | **HIGH** |
| 3 | **No HowTo schema** — If the tool's goal is to help people contribute to open source, a `HowTo` schema for *"How to find your first open-source issue"* would be extremely valuable for AEO. | **MEDIUM** |
| 4 | **No `QAPage` schema** — For question-based queries like *"What is the best way to find GitHub issues?"*, QAPage schema would make the site a prime voice search candidate. | **MEDIUM** |
| 5 | **Sub-pages not optimized for voice search** — `/my-issues` has h1 "My Issues" and a subtitle, but the page is gated behind authentication (its best content is invisible to crawlers). | **MEDIUM** |
| 6 | **No `speakable` structured data** — Google's `speakable` specification for text-to-speech/voice search is not implemented. | **LOW** |

### AEO Opportunity
The query *"find good first issues GitHub"* and similar long-tail voice queries are prime targets. A static landing page (or the home page, if rendered server-side) with:
- A concise answer block (40-60 words) at the top
- FAQPage schema with 5-7 common questions
- Clear heading hierarchy matching voice query patterns

...would make the site a strong candidate for voice answers.

---

## Phase 4: AI Bot Access & Recommender System Audit

### ✅ **Strengths**
- Robots.txt allows all crawlers — `User-agent: *` with `Allow: /`. No AI crawlers are blocked. GPTBot, PerplexityBot, ClaudeBot, Google-Extended, and Bingbot can all access the site.
- Service worker doesn't intercept API routes — `sw.js:72` explicitly skips cross-origin requests (GitHub API). Search bots see live data.
- No login walls on the primary search functionality — `/` is fully accessible without authentication.
- No `noindex` or `nofollow` directives accidentally applied.

### ❌ **Critical Gaps**

| # | Issue | Severity |
|---|-------|----------|
| 1 | **No `llms.txt` file** — Missing at `https://issue-finder.acharyanischal.com.np/llms.txt`. This is the standard file AI systems check for site context. Without it, AI tools have no structured way to understand what this site offers. See [llmstxt.org](https://llmstxt.org). | **MEDIUM** |
| 2 | **`my-issues` and `my-repos` are behind auth** — Their content is gated behind GitHub OAuth sign-in. AI crawlers cannot access or cite the content on these pages. Not a bug, but limits the AI-accessible surface area. | **MEDIUM** |
| 3 | **Main content is client-rendered (SPA pattern)** — The search results — which are the primary content — are fetched client-side via TanStack Query and rendered after JS execution. AI crawlers that don't execute JS see only the shell layout, not the actual data. | **MEDIUM** |
| 4 | **No `AGENTS.md`** — For AI-agent-specific instructions (how to interact with the API, rate limits, intended use cases). | **LOW** |
| 5 | **No `/pricing.md`** — As a free tool, this is less critical, but it's worth documenting the freemium model (if any) for AI agent parsing. | **LOW** |
| 6 | **Crawler-specific allow/disallow not explicit** — While `Allow: /` covers everything, it's best practice to add explicit `Allow` directives for known AI crawlers (GPTBot, ClaudeBot, PerplexityBot) to signal they are welcome. | **LOW** |

---

## 🔴 Prioritized Remediation Roadmap

### P0 — Immediate (next sprint)

| # | Action | File(s) | Expected Impact |
|---|--------|---------|----------------|
| 1 | **Add `generateMetadata` to `/my-issues` and `/my-repos`** — unique `title`, `description`, `canonical`, OG tags per page. | `src/app/my-issues/page.tsx`, `src/app/my-repos/page.tsx` | Pages become indexable with unique search snippets |
| 2 | **Add `/my-issues` and `/my-repos` to sitemap** | `src/app/sitemap.ts` | Both pages enter the crawl/index pipeline |
| 3 | **Add `<WebApplication>` + `<SearchAction>` schema** (JSON-LD) in root layout | `src/app/layout.tsx` | AI engines understand it's a search tool; enables action-rich snippets |
| 4 | **Replace client-side `document.title` with server-side `generateMetadata` on home page** | `src/app/page.tsx` | SSR-friendly title; search bots see keyword-specific titles |

### P1 — This quarter

| # | Action | Expected Impact |
|---|--------|----------------|
| 5 | **Add `og:image` and `twitter:image`** — generate a branded OG preview image (1200x630) and serve from `/public/og-image.png` | Social shares show preview cards; +40-60% CTR from social |
| 6 | **Add `FAQPage` schema on home page** — 5-7 Q&A pairs (e.g., "What is a good first issue?", "How do I filter by language?") | Featured snippets, voice search extraction, AI citation +30% |
| 7 | **Create `llms.txt`** at `/public/llms.txt` | AI systems get structured site overview; direct citation path |
| 8 | **Add freshness dates** — show "Last indexed: [date]" via a footer or metadata | Recency signal for AI ranking |

### P2 — This half

| # | Action | Expected Impact |
|---|--------|----------------|
| 9 | **Add `<HowTo>` schema** — "How to find open-source issues to contribute to" | Voice search extraction, Google Assistant support |
| 10 | **Add author attribution and statistics** — e.g., *"By Nischal Acharya — indexing 200M+ GitHub issues"* in layout or hero | +25-40% AI citation boost (Princeton GEO data) |
| 11 | **Explicit AI crawler directives in robots.txt** — add `Allow: /` for GPTBot, ClaudeBot, PerplexityBot individually | Signal to AI platforms they are welcome |
| 12 | **Align PWA manifest theme_color with viewport themeColor** | Consistent PWA launch experience |

### P3 — Future

| # | Action |
|---|--------|
| 13 | Add `speakable` structured data for voice search |
| 14 | Create `AGENTS.md` for autonomous AI agent interaction guidelines |
| 15 | Add `BreadcrumbList` schema for navigation structure |
| 16 | Implement SSR/ISR for search result pages to make them crawler-friendly |
| 17 | Add `X-Robots-Tag` headers via `next.config.ts` for non-indexable pages |

---

## 📊 Key Metrics to Track

| Metric | Current | Target | Tool |
|--------|---------|--------|------|
| Pages indexed (Google) | ~1 (root only) | 3+ (root + my-issues + my-repos) | Google Search Console |
| AI Overview presence | Unknown / likely 0 | Present for 3+ key queries | Otterly / Peec AI |
| Page speed (LCP) | Unknown (no data) | <2.5s | Lighthouse / CrUX |
| Social share preview | Missing | OG image renders on all shares | Twitter Card Validator / LinkedIn Post Inspector |
| Sitemap coverage | 1 URL | 3+ URLs | Google Search Console |
| Schema markup | 0 types | 3+ types (WebApp, FAQ, SearchAction) | Schema.org Validator |

---

**Bottom line:** This is a well-built Next.js app with mostly correct fundamentals (robots, metadata base, images, semantic HTML). The critical gaps are: **(1)** sub-pages invisible to search engines (no metadata, missing from sitemap), **(2)** zero structured data (no schema at all = invisible to AI systems), **(3)** no GEO-optimized content (stats, quotes, FAQs, freshness), and **(4)** the client-rendered search content is opaque to crawlers. Fixing the P0/P1 items would move the site from "SEO-unaware" to "strongly optimized for both traditional and AI search."
