import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { getPublishedPosts } from '../utils/blogStorage';
import './BlogPostPage.css';

const BlogPostPage = () => {
  const { id } = useParams();
  const posts = getPublishedPosts();
  const post = posts.find(p => p.id === Number(id));

  const html = useMemo(() => {
    if (!post?.content) return '';
    return marked(post.content) as string;
  }, [post]);

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
