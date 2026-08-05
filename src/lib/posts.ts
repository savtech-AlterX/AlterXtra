import { File } from 'expo-file-system';
import { POSTS_BUCKET, supabase } from './supabase';
import { Comment, Post, PostCategory, Profile } from '../store/types';

type PostRow = {
  id: string;
  author_id: string;
  category: PostCategory;
  caption: string | null;
  location_name: string | null;
  before_photo_url: string;
  after_photo_url: string;
  created_at: string;
  author: Profile | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

const POST_SELECT = `
  id, author_id, category, caption, location_name, before_photo_url, after_photo_url, created_at,
  author:profiles!posts_author_id_fkey(*),
  likes(count),
  comments(count)
`;

async function attachLikedByMe(rows: PostRow[], userId: string | null): Promise<Post[]> {
  let likedIds = new Set<string>();
  if (userId && rows.length > 0) {
    const { data } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', rows.map((r) => r.id));
    likedIds = new Set((data ?? []).map((r) => r.post_id as string));
  }
  return rows.map((row) => ({
    id: row.id,
    author_id: row.author_id,
    category: row.category,
    caption: row.caption,
    location_name: row.location_name,
    before_photo_url: row.before_photo_url,
    after_photo_url: row.after_photo_url,
    created_at: row.created_at,
    author: row.author,
    like_count: row.likes?.[0]?.count ?? 0,
    comment_count: row.comments?.[0]?.count ?? 0,
    liked_by_me: likedIds.has(row.id),
  }));
}

export async function fetchFeed(params: { userId: string | null; before?: string; limit?: number }): Promise<Post[]> {
  const { userId, before, limit = 20 } = params;
  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) throw error;
  return attachLikedByMe((data ?? []) as unknown as PostRow[], userId);
}

export async function fetchPostsByAuthor(authorId: string, userId: string | null): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return attachLikedByMe((data ?? []) as unknown as PostRow[], userId);
}

export async function fetchPost(postId: string, userId: string | null): Promise<Post | null> {
  const { data, error } = await supabase.from('posts').select(POST_SELECT).eq('id', postId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [post] = await attachLikedByMe([data as unknown as PostRow], userId);
  return post;
}

export async function setLiked(postId: string, userId: string, liked: boolean) {
  if (liked) {
    const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
    if (error) throw error;
  }
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, author_id, body, created_at, author:profiles!comments_author_id_fkey(*)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Comment[];
}

export async function addComment(postId: string, authorId: string, body: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, body })
    .select('id, post_id, author_id, body, created_at, author:profiles!comments_author_id_fkey(*)')
    .single();
  if (error) throw error;
  return data as unknown as Comment;
}

async function uploadImage(bucket: string, path: string, localUri: string): Promise<string> {
  const buffer = await new File(localUri).arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPostPhoto(userId: string, localUri: string, slot: 'before' | 'after'): Promise<string> {
  const path = `${userId}/${Date.now()}-${slot}.jpg`;
  return uploadImage(POSTS_BUCKET, path, localUri);
}

export async function createPost(params: {
  authorId: string;
  category: PostCategory;
  caption: string;
  locationName: string;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: params.authorId,
      category: params.category,
      caption: params.caption || null,
      location_name: params.locationName || null,
      before_photo_url: params.beforePhotoUrl,
      after_photo_url: params.afterPhotoUrl,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
}

export { uploadImage };
