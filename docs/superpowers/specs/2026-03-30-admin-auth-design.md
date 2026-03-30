# Admin Page + Supabase Auth & Storage Design

**Date:** 2026-03-30
**Status:** Approved

## Overview

Replace the existing password-based admin page (stored in git stash) with a proper authentication system using Supabase Google OAuth. Simultaneously migrate blog post storage from localStorage to a Supabase PostgreSQL database. The public blog continues to work without auth; only the admin CRUD operations require login.

---

## Architecture

No dedicated backend server is needed. Supabase acts as the backend, providing:
- Google OAuth authentication
- PostgreSQL database with auto-generated REST API
- Row Level Security (RLS) enforcing access rules at the DB level

**Stack stays:** React + TypeScript + Vite + Supabase JS client

### New files

| File | Purpose |
|---|---|
| `src/lib/supabase.ts` | Supabase client instance (initialized from env vars) |
| `src/context/AuthContext.tsx` | Session state, `signIn`/`signOut`, exposes `user` |
| `src/components/ProtectedRoute.tsx` | Route guard for `/admin` |
| `src/pages/AdminPage.tsx` | Migrated from JSX stash, TS, uses Supabase for CRUD |
| `src/pages/AdminPage.css` | Restored from stash |

### Modified files

| File | Change |
|---|---|
| `src/App.tsx` | Wrap app in `AuthProvider`, add `/admin` protected route |
| `src/utils/blogStorage.ts` | Replace localStorage logic with Supabase queries |

---

## Environment Variables

Stored in `.env.local` (never committed):

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
VITE_ADMIN_EMAIL=your@gmail.com
```

The anon key is intentionally public — it is designed to be exposed in the browser. RLS policies at the DB level control what it can actually do.

---

## Supabase: `posts` Table

```sql
create table posts (
  id          bigint generated always as identity primary key,
  title       text        not null,
  excerpt     text        not null default '',
  category    text        not null default 'technical',
  status      text        not null default 'draft',
  date        date        not null,
  content     text        not null default '',
  created_at  timestamptz not null default now()
);
```

### Row Level Security Policies

RLS is enabled on the `posts` table.

| Role | Operation | Condition |
|---|---|---|
| `anon` | SELECT | `status = 'published'` |
| `authenticated` | SELECT | all rows |
| `authenticated` | INSERT | always |
| `authenticated` | UPDATE | always |
| `authenticated` | DELETE | always |

This means:
- Public visitors can only read published posts — even with the anon key in hand
- Only a signed-in user (the Google OAuth admin) can write

---

## Auth Flow

```
User visits /admin
  ↓
ProtectedRoute checks Supabase session
  ├── No session              → render login UI (Sign in with Google button)
  ├── Session, wrong email    → render "Access denied"
  └── Session, email matches  → render AdminPage
```

**Sign-in:** `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/admin' } })`

**Email check:** `user.email === import.meta.env.VITE_ADMIN_EMAIL`

This is a two-layer check:
1. **Frontend gate** — wrong email sees "Access denied" UI
2. **DB gate** — RLS only allows `authenticated` role to write; even if the frontend check were bypassed, the DB would reject unauthorized writes

---

## Blog Storage Migration

`blogStorage.ts` is refactored to replace all localStorage operations with Supabase calls:

| Old | New |
|---|---|
| `localStorage.getItem(...)` | `supabase.from('posts').select(...)` |
| `localStorage.setItem(...)` | `supabase.from('posts').insert/update(...)` |
| `filter(p => p.status === 'published')` | `.eq('status', 'published')` (handled by RLS for anon) |

All functions become `async`. The `BlogPage` and `AdminPage` await these calls and handle loading/error states.

The existing `blogs.json` seed data is manually inserted into Supabase once during setup (via the Supabase dashboard table editor or SQL).

---

## Supabase Dashboard Setup Steps (Manual, One-Time)

1. Create a new Supabase project
2. Run the `posts` table SQL above in the SQL editor
3. Enable RLS and add the four policies above
4. Go to **Authentication → Providers → Google** and enable it (requires a Google Cloud OAuth client ID + secret)
5. Add `http://localhost:5173` and your production domain to **Authentication → URL Configuration → Redirect URLs**
6. Copy `Project URL` and `anon public` key into `.env.local`
7. Insert seed posts from `blogs.json` into the table

---

## What Is Not Changing

- The Navbar, Footer, and all other pages are untouched
- Routing structure is unchanged except `/admin` is now protected
- The `AdminPage` UI (form, list, markdown preview) is preserved from the stash — only the auth gate and storage layer change
