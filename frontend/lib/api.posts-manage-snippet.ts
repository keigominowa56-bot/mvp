import api, { unwrap } from './api';
import type { Post } from './api';

export async function softDeletePost(id: string): Promise<Post> {
  const res = await api.patch(`/posts/${id}/delete`, {});
  return unwrap<Post>(res);
}

export async function restorePost(id: string): Promise<Post> {
  const res = await api.patch(`/posts/${id}/restore`, {});
  return unwrap<Post>(res);
}