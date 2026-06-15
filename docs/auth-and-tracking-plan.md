# 🔐 Plan — GitHub Login + Save / Mark-as-Done Issues

> Feature goal: let users **sign in with GitHub**, **save (bookmark)** issues, and
> **mark issues as "done"** (resolved/worked on). Data persists **across devices**
> via a database. Login is **optional** — search stays public; saving/marking
> requires sign-in.

---

## 1. Decisions (confirmed)

| Decision | Choice |
|----------|--------|
| Storage | **Database** (cross-device, server-side per user) |
| DB provider | **Neon / Supabase Postgres** (serverless, free tier, Vercel-friendly) |
| ORM | **Prisma** (great DX, typed, migrations) |
| Auth | **Auth.js (NextAuth v5 / `next-auth@beta`)** — GitHub OAuth provider |
| Access | **Optional** — search public; save/mark needs login |
| Session | HTTP-only cookie (JWT strategy, no DB session table needed) |

> Why JWT session strategy: avoids a DB round-trip per request and keeps the
> existing fast client-side search untouched. We still store the **user** + their
> **saved/done issues** in the DB.

---

## 2. New dependencies

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install -D prisma   # CLI (already pulls @prisma/client at runtime)
```

---

## 3. Environment variables

Add to `.env.local` (and Vercel project settings):

```env
# --- GitHub OAuth App (create at https://github.com/settings/developers) ---
# Homepage URL:           http://localhost:3000        (prod: your domain)
# Authorization callback: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID=xxxxxxxx
AUTH_GITHUB_SECRET=xxxxxxxx

# --- Auth.js ---
AUTH_SECRET=<run: npx auth secret>     # random 32-byte string
AUTH_URL=http://localhost:3000         # prod: https://issue-finder.acharyanischal.com.np

# --- Database (Neon/Supabase pooled connection string) ---
DATABASE_URL="postgresql://USER:PASS@HOST/db?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@HOST/db?sslmode=require"   # for migrations
```

> ⚠️ The existing `NEXT_PUBLIC_GITHUB_TOKEN` stays as-is for public search.
> OAuth secrets are **server-only** — never prefixed with `NEXT_PUBLIC_`.
> Note: `.env*` is currently git-ignored — keep secrets out of commits.

---

## 4. Database schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// --- Auth.js models (User / Account) ---
model User {
  id            String         @id @default(cuid())
  name          String?
  email         String?        @unique
  image         String?
  githubLogin   String?        @unique          // GitHub username
  accounts      Account[]
  savedIssues   SavedIssue[]
  createdAt     DateTime       @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  access_token      String? @db.Text
  token_type        String?
  scope             String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

// --- Feature model: one row per (user, issue) ---
model SavedIssue {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // GitHub issue snapshot (so we can render without re-fetching)
  issueId     Int                          // GitHub issue id (stable)
  number      Int
  title       String
  htmlUrl     String
  repoFullName String
  state       String                       // open | closed (at save time)
  labels      Json?                        // [{name,color}] snapshot

  // Feature flags
  saved       Boolean  @default(true)      // bookmarked
  done        Boolean  @default(false)     // user marked "I've done this"
  doneAt      DateTime?
  note        String?                      // optional personal note

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, issueId])              // one record per user+issue
  @@index([userId, done])
  @@index([userId, saved])
}
```

Migration:
```bash
npx prisma migrate dev --name init_auth_saved_issues
npx prisma generate
```

---

## 5. File-by-file changes

### New files
```
prisma/
  schema.prisma                         ← models above
src/
  auth.ts                               ← NextAuth() config (providers, callbacks)
  lib/
    prisma.ts                           ← singleton PrismaClient (avoid hot-reload leaks)
  app/
    api/
      auth/[...nextauth]/route.ts       ← Auth.js handlers (GET/POST)
      saved-issues/
        route.ts                        ← GET list, POST upsert (save/done toggle)
        [issueId]/route.ts              ← DELETE remove, PATCH update note/done
  components/
    auth/
      auth-button.tsx                   ← "Sign in with GitHub" / avatar+menu
      user-menu.tsx                     ← dropdown: profile, my issues, sign out
    issues/
      save-issue-button.tsx             ← bookmark toggle (per card/modal)
      done-issue-button.tsx             ← mark-done toggle
  hooks/
    use-session.ts                      ← thin wrapper / re-export
    use-saved-issues.ts                 ← TanStack Query: list + mutations
  app/
    my-issues/page.tsx                  ← "My Issues" dashboard (saved + done tabs)
```

### Modified files
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Wrap app in `<SessionProvider>` (via Providers) |
| `src/components/providers/providers.tsx` | Add Auth.js `SessionProvider` alongside QueryClient |
| `src/components/layout/navbar.tsx` | Add `<AuthButton />` + "My Issues" link |
| `src/components/issues/issue-card.tsx` | Add Save + Done toggle buttons |
| `src/components/issues/issue-detail-modal.tsx` | Add Save + Done actions |
| `src/lib/types.ts` | Add `SavedIssue`, session types |
| `middleware.ts` (new, optional) | Only if we later gate routes |

---

## 6. Auth.js config (`src/auth.ts`)

```ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) token.githubLogin = (profile as any).login
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub!
      ;(session.user as any).githubLogin = token.githubLogin
      return session
    },
  },
})
```

`src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

---

## 7. API routes (server-side, owns DB writes)

All routes call `const session = await auth()` and **401 if not signed in**.

| Method | Route | Purpose |
|--------|-------|---------|
| `GET`  | `/api/saved-issues?filter=saved\|done` | List current user's issues |
| `POST` | `/api/saved-issues` | Upsert: save and/or mark done (body = issue snapshot + flags) |
| `PATCH`| `/api/saved-issues/[issueId]` | Toggle `done`, edit `note` |
| `DELETE`| `/api/saved-issues/[issueId]` | Remove a saved issue |

Upsert keyed on `@@unique([userId, issueId])` so save + done share one row.

---

## 8. Client data layer (`use-saved-issues.ts`)

TanStack Query hook (matches existing pattern):
- `useSavedIssues(filter)` → query `/api/saved-issues`
- `useToggleSave(issue)` → optimistic mutation
- `useToggleDone(issue)` → optimistic mutation, sets `doneAt`
- Invalidates `["saved-issues"]` on success
- If **not signed in**, buttons trigger `signIn("github")` instead of mutating.

---

## 9. UI behavior

- **Issue card / modal**: two small icon buttons
  - 🔖 Bookmark → save/unsave
  - ✅ Check → mark done / undo (done cards get a subtle "done" treatment: dimmed + check badge)
- **Navbar**: when logged out → "Sign in with GitHub"; logged in → avatar dropdown (My Issues, Sign out).
- **/my-issues page**: tabs "Saved" / "Done", reuse `IssueList` styling, empty states.
- Logged-out users clicking save/done → prompt to sign in (toast or redirect to `signIn`).

---

## 10. Migration of existing localStorage data (optional, low priority)

The current `saved-searches` / `recent-searches` localStorage stays as-is
(those are *searches*, not *issues* — different feature). No conflict. We may
later offer a one-time "import local bookmarks" but it's out of scope here.

---

## 11. Implementation phases

### Phase 1 — Foundations
- [ ] Install deps; create GitHub OAuth App; fill `.env.local`
- [ ] Add `prisma/schema.prisma`; run first migration on Neon/Supabase
- [ ] Add `src/lib/prisma.ts` singleton

### Phase 2 — Auth
- [ ] `src/auth.ts` + `/api/auth/[...nextauth]/route.ts`
- [ ] Add `SessionProvider` to `providers.tsx`
- [ ] `AuthButton` + `UserMenu` in navbar
- [ ] Verify sign in / sign out works end-to-end

### Phase 3 — Saved / Done backend
- [ ] `/api/saved-issues` GET + POST (auth-guarded)
- [ ] `/api/saved-issues/[issueId]` PATCH + DELETE
- [ ] Manual test with a logged-in session

### Phase 4 — Saved / Done frontend
- [ ] `use-saved-issues.ts` hook (queries + optimistic mutations)
- [ ] `SaveIssueButton` + `DoneIssueButton`
- [ ] Wire into `issue-card.tsx` and `issue-detail-modal.tsx`
- [ ] Logged-out → trigger `signIn`

### Phase 5 — My Issues page + polish
- [ ] `/my-issues` page with Saved / Done tabs
- [ ] Done visual state (dim + badge), empty states, toasts
- [ ] Loading skeletons, error handling
- [ ] Update README with new env vars + feature

---

## 12. Security & edge cases
- All DB writes are **server-side** behind `auth()` — never trust client for `userId`.
- Validate issue payload (zod) before upsert; cap `note` length.
- Rate isn't a concern (per-user, low volume), but add basic input validation.
- `onDelete: Cascade` removes a user's issues if account deleted.
- Don't expose `access_token` to the client; session only carries id + login + image.

---

## 13. Acceptance criteria
1. A visitor can search **without** logging in (unchanged).
2. "Sign in with GitHub" logs in and shows avatar in navbar.
3. Logged-in user can **save** an issue → appears under **My Issues → Saved**.
4. Logged-in user can **mark done** → appears under **Done**, card shows done state.
5. Toggles persist after refresh **and** on a different device/browser after login.
6. Sign out clears session; save/done buttons prompt sign-in again.
