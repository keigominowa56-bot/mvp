// Admin Frontend API Client

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function apiFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // LocalStorageからトークンを取得
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  return res;
}

export async function unwrap<T = any>(res: Response): Promise<T> {
  let data: any = null;
  try {
    data = await res.json();
  } catch (_) {}
  if (res.ok) return data as T;
  const status = res.status;
  const message =
    data?.error?.message ||
    data?.message ||
    `HTTP ${status}`;
  const errors = data?.errors || data?.error || null;

  const err = new Error(message) as any;
  err.status = status;
  err.errors = errors;
  throw err;
}

export type Post = {
  id: string;
  authorUserId: string;
  type: 'activity' | 'pledge' | 'question' | 'news';
  title: string;
  content: string;
  createdAt: string;
  mediaIds?: string[];
  regionId?: string;
  agreeCount?: number;
  disagreeCount?: number;
  commentCount?: number;
  imageUrl?: string;
  videoUrl?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'politician' | 'admin';
  createdAt: string;
};

// 投稿一覧取得
export async function fetchPosts(params?: {
  type?: string;
  limit?: number;
}): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await apiFetchWithAuth(`/api/posts${query.toString() ? `?${query.toString()}` : ''}`, {
    method: 'GET',
  });
  return unwrap<Post[]>(res);
}

// 投稿作成
export async function createPost(data: {
  title: string;
  content: string;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
}): Promise<Post> {
  const res = await apiFetchWithAuth('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrap<Post>(res);
}

// 現在のユーザー情報取得
export async function fetchCurrentUser(): Promise<User> {
  const res = await apiFetchWithAuth('/api/auth/me', {
    method: 'GET',
  });
  return unwrap<User>(res);
}

// 管理者ログイン
export async function adminLogin(email: string, password: string) {
  const res = await apiFetchWithAuth('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return unwrap(res);
}

// 議員ログイン
export async function politicianLogin(email: string, password: string) {
  const res = await apiFetchWithAuth('/api/auth/politician/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return unwrap(res);
}

// 投稿削除（論理削除）
export async function deletePost(postId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/posts/${postId}`, {
    method: 'DELETE',
  });
  return unwrap<void>(res);
}

// 議員登録（管理者専用）
export async function registerPolitician(data: {
  email: string;
  password: string;
  name: string;
}): Promise<User> {
  const res = await apiFetchWithAuth('/api/auth/register/politician', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrap<User>(res);
}
