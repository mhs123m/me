# Admin Page + Supabase Auth & Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the password-based admin page with Google OAuth via Supabase and migrate blog post storage from localStorage to Supabase PostgreSQL.

**Architecture:** React frontend talks directly to Supabase (no custom backend). Supabase handles Google OAuth, stores blog posts in a `posts` table, and enforces access via Row Level Security. A `ProtectedRoute` component wraps `/admin` and checks for a valid session + matching admin email.

**Tech Stack:** React 18, TypeScript, Vite, React Router v7 (HashRouter), `@supabase/supabase-js` v2, Supabase (PostgreSQL + Auth), GitHub Pages

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/lib/supabase.ts` | Create | Supabase client singleton |
| `src/context/AuthContext.tsx` | Create | Session state, signIn/signOut, post-OAuth redirect |
| `src/components/ProtectedRoute.tsx` | Create | Route guard: checks session + email |
| `src/utils/blogStorage.ts` | Rewrite | Async CRUD against Supabase `posts` table |
| `src/pages/BlogPage.tsx` | Modify | useEffect/useState for async post fetching |
| `src/pages/BlogPostPage.tsx` | Modify | useEffect/useState for async post fetching |
| `src/pages/AdminPage.tsx` | Create | TypeScript port of stash JSX, uses Supabase CRUD + signOut |
| `src/pages/AdminPage.css` | Create | Restored from git stash |
| `src/App.tsx` | Modify | Add AuthProvider wrapper + ProtectedRoute on /admin |
| `.github/workflows/deploy.yml` | Modify | Pass Supabase env vars as GitHub Secrets during build |
| `scripts/seed.mjs` | Create | One-time script to insert blogs.json posts into Supabase |

---

## Task 1: Supabase Dashboard Setup (Manual)

These steps are done once in the Supabase web UI — no code.

- [ ] **Step 1: Create a Supabase project**

  Go to https://supabase.com, create a new project, and wait for it to provision.

- [ ] **Step 2: Create the `posts` table**

  In the Supabase dashboard, open **SQL Editor** and run:

  ```sql
  create table posts (
    id         bigint generated always as identity primary key,
    title      text        not null,
    excerpt    text        not null default '',
    category   text        not null default 'technical',
    status     text        not null default 'draft',
    date       date        not null,
    content    text        not null default '',
    created_at timestamptz not null default now()
  );
  ```

- [ ] **Step 3: Enable RLS and add policies**

  Still in SQL Editor, run:

  ```sql
  alter table posts enable row level security;

  -- Public: read published posts only
  create policy "Public can read published posts"
    on posts for select
    to anon
    using (status = 'published');

  -- Admin: full access when authenticated
  create policy "Authenticated user can read all posts"
    on posts for select
    to authenticated
    using (true);

  create policy "Authenticated user can insert posts"
    on posts for insert
    to authenticated
    with check (true);

  create policy "Authenticated user can update posts"
    on posts for update
    to authenticated
    using (true);

  create policy "Authenticated user can delete posts"
    on posts for delete
    to authenticated
    using (true);
  ```

- [ ] **Step 4: Enable Google OAuth**

  1. Go to **Authentication → Providers → Google** in the Supabase dashboard
  2. Toggle it on
  3. You need a Google Cloud OAuth Client ID and Secret:
     - Go to https://console.cloud.google.com → APIs & Services → Credentials
     - Create an OAuth 2.0 Client ID (Web application)
     - Add `https://<your-project>.supabase.co/auth/v1/callback` as an Authorized Redirect URI (Supabase shows you this URL in the Google provider settings)
     - Copy the Client ID and Client Secret back into Supabase
  4. Save

- [ ] **Step 5: Configure redirect URLs in Supabase**

  Go to **Authentication → URL Configuration**:
  - **Site URL:** `https://<your-github-pages-domain>` (e.g. `https://mhs123m.github.io`)
  - **Redirect URLs:** Add both:
    - `http://localhost:5173`
    - `https://<your-github-pages-domain>`

- [ ] **Step 6: Copy credentials**

  Go to **Project Settings → API**. Note down:
  - `Project URL` → `VITE_SUPABASE_URL`
  - `anon public` key → `VITE_SUPABASE_ANON_KEY`

---

## Task 2: Install Supabase and Create `.env.local`

**Files:**
- Modify: `package.json` (via npm install)
- Create: `.env.local`

- [ ] **Step 1: Install the Supabase client**

  ```bash
  npm install @supabase/supabase-js
  ```

  Expected: `@supabase/supabase-js` appears in `package.json` dependencies.

- [ ] **Step 2: Create `.env.local`**

  Create the file at the project root. It is already git-ignored by Vite's default `.gitignore`:

  ```
  VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
  VITE_SUPABASE_ANON_KEY=<your-anon-key>
  VITE_ADMIN_EMAIL=<your-gmail-address>
  ```

  Replace the placeholders with the values from Task 1 Step 6.

- [ ] **Step 3: Verify the dev server still starts**

  ```bash
  npm run dev
  ```

  Expected: No errors, app loads at `http://localhost:5173`.

- [ ] **Step 4: Commit**

  ```bash
  git add package.json package-lock.json
  git commit -m "feat: install @supabase/supabase-js"
  ```

---

## Task 3: Create Supabase Client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Create the client file**

  ```typescript
  // src/lib/supabase.ts
  import { createClient } from '@supabase/supabase-js';

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: No errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/lib/supabase.ts
  git commit -m "feat: add Supabase client"
  ```

---

## Task 4: Create AuthContext

**Files:**
- Create: `src/context/AuthContext.tsx`

> Note: This app uses `HashRouter`. Google OAuth redirects back to the site root (`window.location.origin`) without a hash path. `AuthContext` stores the intended destination in `sessionStorage` before the redirect and navigates there after the `SIGNED_IN` event fires.

- [ ] **Step 1: Create the file**

  ```typescript
  // src/context/AuthContext.tsx
  import React, { createContext, useContext, useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { User } from '@supabase/supabase-js';
  import { supabase } from '../lib/supabase';

  interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
  }

  const AuthContext = createContext<AuthContextType | null>(null);

  export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          const redirect = sessionStorage.getItem('auth_redirect');
          if (redirect) {
            sessionStorage.removeItem('auth_redirect');
            navigate(redirect);
          }
        }
      });

      return () => subscription.unsubscribe();
    }, []);

    const signIn = async () => {
      sessionStorage.setItem('auth_redirect', '/admin');
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    };

    const signOut = async () => {
      await supabase.auth.signOut();
    };

    return (
      <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: No errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/context/AuthContext.tsx
  git commit -m "feat: add AuthContext with Google OAuth + post-redirect logic"
  ```

---

## Task 5: Create ProtectedRoute

**Files:**
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Create the file**

  ```typescript
  // src/components/ProtectedRoute.tsx
  import React from 'react';
  import { useAuth } from '../context/AuthContext';

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

  export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading, signIn } = useAuth();

    if (loading) {
      return <div className="admin-page"><p>Loading...</p></div>;
    }

    if (!user) {
      return (
        <div className="admin-page">
          <h1>Admin</h1>
          <button className="btn-primary" onClick={signIn}>
            Sign in with Google
          </button>
        </div>
      );
    }

    if (user.email !== ADMIN_EMAIL) {
      return (
        <div className="admin-page">
          <h1>Access Denied</h1>
          <p>You are not authorized to view this page.</p>
        </div>
      );
    }

    return <>{children}</>;
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: No errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/ProtectedRoute.tsx
  git commit -m "feat: add ProtectedRoute component"
  ```

---

## Task 6: Rewrite blogStorage.ts for Supabase

**Files:**
- Rewrite: `src/utils/blogStorage.ts`

> All functions become async. The `initFromSeed` function is removed — seeding is now a one-time manual step (Task 12). Callers (`BlogPage`, `BlogPostPage`, `AdminPage`) will be updated in subsequent tasks.

- [ ] **Step 1: Replace the file contents**

  ```typescript
  // src/utils/blogStorage.ts
  import { supabase } from '../lib/supabase';

  export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    status: 'published' | 'draft';
    date: string;
    content: string;
  }

  export async function getPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as BlogPost[];
  }

  export async function getPublishedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as BlogPost[];
  }

  export async function savePost(post: Omit<BlogPost, 'id'> | BlogPost): Promise<BlogPost> {
    if ('id' in post && post.id) {
      const { id, ...fields } = post;
      const { data, error } = await supabase
        .from('posts')
        .update(fields)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPost;
    } else {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPost;
    }
  }

  export async function deletePost(id: number): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: Errors about `BlogPage` and `BlogPostPage` calling the old synchronous API — that is expected and will be fixed in Tasks 7 and 8.

- [ ] **Step 3: Commit**

  ```bash
  git add src/utils/blogStorage.ts
  git commit -m "feat: migrate blogStorage to Supabase async API"
  ```

---

## Task 7: Update BlogPage for Async Data

**Files:**
- Modify: `src/pages/BlogPage.tsx`

- [ ] **Step 1: Replace the file contents**

  ```typescript
  // src/pages/BlogPage.tsx
  import React, { useEffect, useState } from 'react';
  import { useSearchParams, Link } from 'react-router-dom';
  import { getPublishedPosts, BlogPost } from '../utils/blogStorage';
  import './BlogPage.css';

  const CATEGORIES = ['all', 'technical', 'lifestyle'];

  const BlogPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const active = searchParams.get('category') || 'all';
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      getPublishedPosts()
        .then(setPosts)
        .finally(() => setLoading(false));
    }, []);

    const filtered = active === 'all'
      ? posts
      : posts.filter(p => p.category === active);

    return (
      <div className="blog-page">
        <h1>Blog</h1>
        <p className="blog-subtitle">Thoughts on backend engineering and beyond.</p>

        <div className="blog-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`blog-filter ${active === cat ? 'active' : ''}`}
              onClick={() => setSearchParams(cat === 'all' ? {} : { category: cat })}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="blog-list">
            {filtered.map(post => (
              <Link key={post.id} to={`/blog/${post.id}`} className="blog-card-link">
                <article className="blog-card">
                  <span className="blog-meta">
                    <span className="blog-date">{post.date}</span>
                    <span className="blog-tag">{post.category}</span>
                  </span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </article>
              </Link>
            ))}
          </div>
        )}

        <p className="blog-coming-soon">More posts coming soon.</p>
      </div>
    );
  };

  export default BlogPage;
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: One remaining error about `BlogPostPage` — fix in Task 8.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/BlogPage.tsx
  git commit -m "feat: update BlogPage to fetch posts asynchronously from Supabase"
  ```

---

## Task 8: Update BlogPostPage for Async Data

**Files:**
- Modify: `src/pages/BlogPostPage.tsx`

- [ ] **Step 1: Replace the file contents**

  ```typescript
  // src/pages/BlogPostPage.tsx
  import React, { useMemo, useEffect, useState } from 'react';
  import { useParams, Link } from 'react-router-dom';
  import { marked } from 'marked';
  import { getPublishedPosts, BlogPost } from '../utils/blogStorage';
  import './BlogPostPage.css';

  const BlogPostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      getPublishedPosts()
        .then(posts => setPost(posts.find(p => p.id === Number(id)) ?? null))
        .finally(() => setLoading(false));
    }, [id]);

    const html = useMemo(() => {
      if (!post?.content) return '';
      return marked(post.content) as string;
    }, [post]);

    if (loading) {
      return (
        <div className="blog-post-page">
          <Link to="/blog" className="back-link">&larr; Back to Blog</Link>
          <p>Loading...</p>
        </div>
      );
    }

    if (!post) {
      return (
        <div className="blog-post-page">
          <Link to="/blog" className="back-link">&larr; Back to Blog</Link>
          <p>Post not found.</p>
        </div>
      );
    }

    return (
      <div className="blog-post-page">
        <Link to="/blog" className="back-link">&larr; Back to Blog</Link>
        <article className="blog-post">
          <header className="blog-post-header">
            <span className="blog-meta">
              <span className="blog-date">{post.date}</span>
              <span className="blog-tag">{post.category}</span>
            </span>
            <h1>{post.title}</h1>
          </header>
          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </div>
    );
  };

  export default BlogPostPage;
  ```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

  ```bash
  npx tsc --noEmit
  ```

  Expected: No errors (BlogPage and BlogPostPage are now fixed).

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/BlogPostPage.tsx
  git commit -m "feat: update BlogPostPage to fetch post asynchronously from Supabase"
  ```

---

## Task 9: Create AdminPage.css

**Files:**
- Create: `src/pages/AdminPage.css`

> This is restored verbatim from the git stash. Retrieve it with the command below.

- [ ] **Step 1: Extract the CSS from the stash**

  ```bash
  git show stash@{1}:src/pages/AdminPage.css > src/pages/AdminPage.css
  ```

- [ ] **Step 2: Verify the file exists and is non-empty**

  ```bash
  wc -l src/pages/AdminPage.css
  ```

  Expected: ~180 lines.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/AdminPage.css
  git commit -m "feat: restore AdminPage.css from stash"
  ```

---

## Task 10: Create AdminPage.tsx

**Files:**
- Create: `src/pages/AdminPage.tsx`

> This is a TypeScript port of the JSX in `stash@{1}`. The password auth logic is removed. Storage calls are async. A "Sign Out" button is added.

- [ ] **Step 1: Create the file**

  ```typescript
  // src/pages/AdminPage.tsx
  import React, { useState, useEffect, useMemo } from 'react';
  import { marked } from 'marked';
  import { getPosts, savePost, deletePost, BlogPost } from '../utils/blogStorage';
  import { useAuth } from '../context/AuthContext';
  import './AdminPage.css';

  const CATEGORIES = ['technical', 'lifestyle'];

  type PostForm = Omit<BlogPost, 'id'>;

  const emptyForm: PostForm = {
    title: '',
    excerpt: '',
    category: 'technical',
    status: 'draft',
    date: '',
    content: '',
  };

  const AdminPage = () => {
    const { signOut } = useAuth();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const [form, setForm] = useState<PostForm>(emptyForm);

    useEffect(() => {
      getPosts().then(setPosts);
    }, []);

    const previewHtml = useMemo(() => {
      if (!form.content) return '';
      return marked(form.content) as string;
    }, [form.content]);

    const refresh = () => getPosts().then(setPosts);

    const handleNew = () => {
      setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
      setEditing('new');
    };

    const handleEdit = (post: BlogPost) => {
      const { id, ...rest } = post;
      setForm(rest);
      setEditing(id);
    };

    const handleDelete = async (id: number) => {
      if (!window.confirm('Delete this post?')) return;
      await deletePost(id);
      refresh();
    };

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.title.trim() || !form.content.trim()) return;
      const post = editing === 'new'
        ? { ...form }
        : { ...form, id: editing as number };
      await savePost(post);
      setEditing(null);
      setForm(emptyForm);
      refresh();
    };

    const handleCancel = () => {
      setEditing(null);
      setForm(emptyForm);
    };

    const handleChange = <K extends keyof PostForm>(field: K, value: PostForm[K]) => {
      setForm(prev => ({ ...prev, [field]: value }));
    };

    if (editing !== null) {
      return (
        <div className="admin-page">
          <h1>{editing === 'new' ? 'New Post' : 'Edit Post'}</h1>
          <form onSubmit={handleSave} className="admin-form">
            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                required
              />
            </label>
            <label>
              Excerpt
              <input
                type="text"
                value={form.excerpt}
                onChange={e => handleChange('excerpt', e.target.value)}
              />
            </label>
            <div className="admin-row">
              <label>
                Category
                <select
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={e => handleChange('status', e.target.value as 'published' | 'draft')}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={e => handleChange('date', e.target.value)}
                />
              </label>
            </div>
            <label>
              Content (Markdown)
              <textarea
                value={form.content}
                onChange={e => handleChange('content', e.target.value)}
                rows={14}
                required
              />
            </label>
            {form.content && (
              <div className="admin-preview">
                <h3>Preview</h3>
                <div
                  className="blog-post-content"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
            <div className="admin-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1>Admin</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleNew}>New Post</button>
            <button className="btn-secondary" onClick={signOut}>Sign Out</button>
          </div>
        </div>
        <div className="admin-list">
          {posts.map(post => (
            <div key={post.id} className="admin-item">
              <div className="admin-item-info">
                <strong>{post.title}</strong>
                <span className="admin-item-meta">
                  {post.date} &middot; {post.category} &middot;{' '}
                  <span className={`admin-status admin-status--${post.status || 'draft'}`}>
                    {post.status || 'draft'}
                  </span>
                </span>
              </div>
              <div className="admin-item-actions">
                <button className="btn-secondary" onClick={() => handleEdit(post)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(post.id)}>Delete</button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p>No posts yet.</p>}
        </div>
      </div>
    );
  };

  export default AdminPage;
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: No errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/pages/AdminPage.tsx
  git commit -m "feat: add AdminPage (TypeScript, Supabase storage, Google OAuth)"
  ```

---

## Task 11: Update App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the file contents**

  ```typescript
  // src/App.tsx
  import React from 'react';
  import { Routes, Route } from 'react-router-dom';
  import Navbar from './components/Navbar';
  import Footer from './components/Footer';
  import HomePage from './pages/HomePage';
  import ResumePage from './pages/ResumePage';
  import BlogPage from './pages/BlogPage';
  import BlogPostPage from './pages/BlogPostPage';
  import ContactPage from './pages/ContactPage';
  import AdminPage from './pages/AdminPage';
  import { AuthProvider } from './context/AuthContext';
  import ProtectedRoute from './components/ProtectedRoute';

  function App() {
    return (
      <AuthProvider>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<HomePage />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    );
  }

  export default App;
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: No errors.

- [ ] **Step 3: Verify the dev build works**

  ```bash
  npm run dev
  ```

  Open `http://localhost:5173/#/admin` — you should see "Sign in with Google" button.

- [ ] **Step 4: Commit**

  ```bash
  git add src/App.tsx
  git commit -m "feat: wrap app with AuthProvider, protect /admin route"
  ```

---

## Task 12: Update GitHub Actions Deploy Workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

> The Vite build needs the env vars to be present at build time. Add them from GitHub Secrets.

- [ ] **Step 1: Edit the build step in `deploy.yml`**

  Find the `- run: npm run build` step and replace it with:

  ```yaml
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_ADMIN_EMAIL: ${{ secrets.VITE_ADMIN_EMAIL }}
  ```

- [ ] **Step 2: Add the secrets to GitHub**

  Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret** and add:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_ADMIN_EMAIL`

- [ ] **Step 3: Commit**

  ```bash
  git add .github/workflows/deploy.yml
  git commit -m "ci: pass Supabase env vars during GitHub Pages build"
  ```

---

## Task 13: Seed Existing Posts into Supabase

**Files:**
- Create: `scripts/seed.mjs` (run once, then can be deleted)

> This migrates the 5 posts from `src/data/blogs.json` into Supabase. Run it once from your local machine with a valid `.env.local`.

- [ ] **Step 1: Create the seed script**

  ```javascript
  // scripts/seed.mjs
  import { createClient } from '@supabase/supabase-js';
  import { readFileSync } from 'fs';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path';

  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Load env vars from .env.local manually (dotenv not installed)
  const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8');
  const env = Object.fromEntries(
    envFile.split('\n')
      .filter(line => line.includes('='))
      .map(line => line.split('=').map(s => s.trim()))
  );

  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

  const posts = JSON.parse(
    readFileSync(join(__dirname, '../src/data/blogs.json'), 'utf8')
  );

  // Strip the id field — Supabase generates its own
  const rows = posts.map(({ id, ...rest }) => rest);

  const { data, error } = await supabase.from('posts').insert(rows).select();
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Seeded ${data.length} posts successfully.`);
  ```

- [ ] **Step 2: Run the seed script**

  ```bash
  node scripts/seed.mjs
  ```

  Expected output:
  ```
  Seeded 5 posts successfully.
  ```

  If you see `new row violates row-level security policy`: The anon key cannot insert directly (RLS blocks it). In Supabase dashboard → SQL Editor, temporarily run the insert using the service role, or disable the insert RLS policy temporarily, seed, then re-enable.

- [ ] **Step 3: Verify in Supabase dashboard**

  Go to **Table Editor → posts** and confirm 5 rows appear.

- [ ] **Step 4: Commit the seed script (optional)**

  ```bash
  git add scripts/seed.mjs
  git commit -m "chore: add one-time seed script for migrating blogs.json to Supabase"
  ```

---

## Task 14: End-to-End Verification

- [ ] **Step 1: Test the public blog**

  ```bash
  npm run dev
  ```

  Navigate to `http://localhost:5173/#/blog`. Confirm published posts load from Supabase (not from localStorage).

- [ ] **Step 2: Test the admin login**

  Navigate to `http://localhost:5173/#/admin`. Confirm you see "Sign in with Google". Click it, complete the OAuth flow, and verify you land back on `/admin` with the post list visible.

- [ ] **Step 3: Test CRUD**

  - Create a new post with status `draft`. Verify it appears in admin list but NOT on `/blog`.
  - Edit the post title. Verify the change persists after refresh.
  - Change status to `published`. Verify it now appears on `/blog`.
  - Delete the post. Verify it's gone from both admin and blog.

- [ ] **Step 4: Test access denial**

  Sign out. Try signing in with a different Google account (not your `VITE_ADMIN_EMAIL`). Verify you see "Access Denied".

- [ ] **Step 5: Verify production build**

  ```bash
  npm run build
  ```

  Expected: No TypeScript or build errors.

- [ ] **Step 6: Push to deploy**

  ```bash
  git push origin master
  ```

  Monitor the GitHub Actions workflow. Confirm the build passes and the live site works.
