import seedPosts from '../data/blogs.json';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  status: 'published' | 'draft';
  date: string;
  content: string;
}

const STORAGE_KEY = 'blog_posts';

function initFromSeed(): void {
  if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
  }
}

function getPosts(): BlogPost[] {
  initFromSeed();
  if (typeof window === 'undefined') return [];

  const postsJson = localStorage.getItem(STORAGE_KEY);
  return postsJson ? JSON.parse(postsJson) : [];
}

function getPublishedPosts(): BlogPost[] {
  return getPosts().filter((p) => p.status === 'published');
}

function savePost(post: BlogPost): BlogPost {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.id === post.id);

  if (index >= 0) {
    posts[index] = post;
  } else {
    post.id = posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
    posts.unshift(post);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return post;
}

function deletePost(id: number): void {
  const posts = getPosts().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export { getPosts, getPublishedPosts, savePost, deletePost, initFromSeed };
