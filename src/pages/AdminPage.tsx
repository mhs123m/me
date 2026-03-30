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
