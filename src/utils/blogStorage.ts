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
