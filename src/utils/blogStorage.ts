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

export async function incrementView(postId: number, ipAddress: string, userAgent: string): Promise<void> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: existingView } = await supabase
    .from('views')
    .select('id')
    .eq('post_id', postId)
    .eq('ip_address', ipAddress)
    .gte('created_at', oneHourAgo)
    .limit(1);

  if (existingView && existingView.length > 0) {
    return;
  }

  const { error } = await supabase
    .from('views')
    .insert({
      post_id: postId,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  if (error) throw error;
}

export async function getViewCount(postId: number): Promise<number> {
  const { count, error } = await supabase
    .from('views')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);
  if (error) throw error;
  return count || 0;
}
