import api, { unwrap, Post } from './api';

export async function fetchPostById(id: string): Promise<Post> {
  const res = await api.get(`/posts/${id}`);
  return unwrap<Post>(res);
}