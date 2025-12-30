import { api } from './api';
import type { Post } from './api';

export async function softDeletePost(id: string): Promise<Post> {
  const res = await api.patch(`/posts/${id}/delete`, {});
  return res.data as Post;
}

export async function restorePost(id: string): Promise<Post> {
  const res = await api.patch(`/posts/${id}/restore`, {});
  return res.data as Post;
}