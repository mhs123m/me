// src/pages/BlogPostPage.tsx
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { getPublishedPosts, BlogPost, incrementView, getViewCount } from '../utils/blogStorage';
import './BlogPostPage.css';

const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    getPublishedPosts()
      .then(posts => {
        const foundPost = posts.find(p => p.id === Number(id)) ?? null;
        setPost(foundPost);
        if (foundPost) {
          getViewCount(foundPost.id).then(setViewCount);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (post && !tracked) {
      const trackView = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          const data = await response.json();
          const ipAddress = data.ip;
          const userAgent = navigator.userAgent;

          await incrementView(post.id, ipAddress, userAgent);
          setTracked(true);
          setViewCount(prev => prev + 1);
        } catch (error) {
          console.error('Failed to track view:', error);
        }
      };

      trackView();
    }
  }, [post, tracked]);

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
            <span className="blog-views">{viewCount} views</span>
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
