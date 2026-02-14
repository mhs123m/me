import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPublishedPosts } from '../utils/blogStorage';
import './BlogPage.css';

const CATEGORIES = ['all', 'technical', 'lifestyle'];

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = searchParams.get('category') || 'all';
  const posts = getPublishedPosts();

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

      <p className="blog-coming-soon">More posts coming soon.</p>
    </div>
  );
};

export default BlogPage;
