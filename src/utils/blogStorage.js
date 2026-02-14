import seedPosts from '../data/blogs.json';

const STORAGE_KEY = 'blog_posts';

function initFromSeed() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
  }
}

function getPosts() {
  initFromSeed();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

function getPublishedPosts() {
  return getPosts().filter(p => p.status === 'published');
}

function savePost(post) {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index >= 0) {
    posts[index] = post;
  } else {
    post.id = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
    posts.unshift(post);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  return post;
}

function deletePost(id) {
  const posts = getPosts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

export { getPosts, getPublishedPosts, savePost, deletePost, initFromSeed };
