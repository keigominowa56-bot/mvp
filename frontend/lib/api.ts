import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

// トークンキーは token に統一
const TOKEN_KEY = 'token';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.error('[api error]', status, url, error.response?.data);
    return Promise.reject(error);
  },
);

export default api;

export function unwrap<T = any>(res: any): T {
  return res?.data as T;
}

// ===== 認証 =====
export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  const data = unwrap<{ accessToken: string }>(res);
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return unwrap(res);
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

// 新規登録（/auth/register）
export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
  role?: string; // 'user' | 'politician' | 'admin' など運用に応じて
  addressPref?: string;
  addressCity?: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  // バックエンド実装に合わせて追加
};

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await api.post('/auth/register', input);
  return unwrap<RegisterResponse>(res);
}

// 開発用（存在する場合のみ）
export async function devLoginAdmin() {
  const res = await api.post('/dev/login/admin', {});
  const data = unwrap<{ accessToken: string }>(res);
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  return data;
}

// ===== 投稿 =====
export type Post = {
  id: string;
  authorId?: string;
  title?: string;
  body: string;
  postCategory: 'policy' | 'activity';
  hidden: boolean;
  regionPref?: string;
  regionCity?: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchFeed(params?: {
  mode?: 'followed_first';
  pref?: string;
  city?: string;
  category?: 'policy' | 'activity';
  limit?: number;
}): Promise<Post[]> {
  // バックエンドの /feed に合わせています（あなたの環境の仕様に依存）
  const res = await api.get('/feed', { params });
  return unwrap<Post[]>(res);
}

export async function createPost(input: {
  title?: string;
  body: string;
  postCategory?: 'policy' | 'activity';
  hidden?: boolean;                 // 互換: 直接指定も可
  visibility?: 'public' | 'hidden'; // 互換: backend側でhiddenに変換
  regionPref?: string;
  regionCity?: string;
}) {
  const res = await api.post('/posts', input);
  return unwrap<Post>(res);
}

export async function updatePost(id: string, input: Partial<{
  title: string;
  body: string;
  postCategory: 'policy' | 'activity';
  hidden: boolean;
  visibility: 'public' | 'hidden';
  regionPref: string;
  regionCity: string;
}>) {
  const res = await api.patch(`/posts/${id}`, input);
  return unwrap<Post>(res);
}

// ===== コメント =====
export type Comment = {
  id: string;
  targetId: string;
  body: string;
  authorId: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  likesCount?: number;
};

export async function fetchComments(targetId: string): Promise<Comment[]> {
  const res = await api.get('/comments', { params: { targetId } });
  return unwrap<Comment[]>(res);
}

export async function createComment(input: { targetId: string; body: string; parentId?: string }) {
  const res = await api.post('/comments', input);
  return unwrap<Comment>(res);
}

// ===== 管理（Users）=====
export type AdminUserSummary = {
  id: string;
  email: string;
  name?: string;
  role: string;   // 'admin' | 'politician' | 'user' など
  status: string; // 'active' | 'suspended' など
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersResponse = {
  items: AdminUserSummary[];
  total: number;
  page: number;
  perPage: number;
};

export async function adminFetchUsers(params?: {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  perPage?: number;
}): Promise<AdminUsersResponse> {
  const res = await api.get('/admin/users', { params });
  return unwrap<AdminUsersResponse>(res);
}

export async function adminUpdateUser(id: string, patch: Partial<{
  name: string;
  role: string;
  status: string;
}>): Promise<AdminUserSummary> {
  const res = await api.patch(`/admin/users/${id}`, patch);
  return unwrap<AdminUserSummary>(res);
}

// ===== 管理: 通知送信 =====
export async function adminSendNotification(input: {
  userId: string;
  type: string;
  title: string;
  text?: string;
  linkUrl?: string;
}) {
  const res = await api.post('/notifications/send', input);
  return unwrap(res);
}

export async function adminBulkSendNotifications(input: {
  userIds: string[];
  type: string;
  title: string;
  text?: string;
  linkUrl?: string;
}) {
  const res = await api.post('/notifications/bulk', input);
  return unwrap(res);
}