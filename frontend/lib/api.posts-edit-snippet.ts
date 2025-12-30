import { api } from './api';
import type { Post } from './api';

export async function fetchPostById(id: string): Promise<Post> {
  const res = await api.get(`/posts/${id}`);
  return res.data as Post;
}