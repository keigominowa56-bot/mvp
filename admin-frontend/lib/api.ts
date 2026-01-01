// Admin Frontend API Client

// APIベースURL（固定値、末尾のスラッシュなし、/apiは含めない）
const API_BASE = 'https://api.polimee.com';

/**
 * APIパスを正規化（/api を一度だけ含むように）
 * @param path APIパス（例: '/api/auth/me' または '/auth/me'）
 * @returns 正規化されたパス（例: '/api/auth/me'）
 */
function normalizeApiPath(path: string): string {
  // 既に /api/ で始まっている場合はそのまま
  if (path.startsWith('/api/')) {
    return path;
  }
  // / で始まっている場合は /api を前に追加
  if (path.startsWith('/')) {
    return `/api${path}`;
  }
  // それ以外は /api/ を前に追加
  return `/api/${path}`;
}

/**
 * 認証付きAPIリクエストを送信
 * @param path APIパス（/api を含めても含めなくても正規化される）
 * @param init リクエストオプション
 * @returns Responseオブジェクト
 */
export async function apiFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers();
  
  // init.headers をマージ（Headers オブジェクトまたは Record の両方に対応）
  if (init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else {
      Object.entries(init.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        }
      });
    }
  }
  
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // LocalStorageからトークンを取得
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // パスを正規化（/api を一度だけ含む）
  const normalizedPath = normalizeApiPath(path);
  // 絶対URLを構築（API_BASEとパスの間にスラッシュを1つだけ）
  const fullUrl = `${API_BASE}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  
  // 絶対URLであることを検証
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    console.error('[apiFetchWithAuth] Invalid URL generated:', fullUrl);
    throw new Error(`Invalid API URL: ${fullUrl}`);
  }
  
  const res = await fetch(fullUrl, {
    ...init,
    headers,
  });
  return res;
}

/**
 * 認証なしAPIリクエストを送信（ログイン時など）
 * @param path APIパス（/api を含めても含めなくても正規化される）
 * @param init リクエストオプション
 * @returns Responseオブジェクト
 */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers();
  
  // init.headers をマージ（Headers オブジェクトまたは Record の両方に対応）
  if (init.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    } else {
      Object.entries(init.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers.set(key, value);
        }
      });
    }
  }
  
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // パスを正規化（/api を一度だけ含む）
  const normalizedPath = normalizeApiPath(path);
  // 絶対URLを構築（API_BASEとパスの間にスラッシュを1つだけ）
  const fullUrl = `${API_BASE}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  
  // 絶対URLであることを検証
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    console.error('[apiFetch] Invalid URL generated:', fullUrl);
    throw new Error(`Invalid API URL: ${fullUrl}`);
  }
  
  console.log('[apiFetch] Request URL:', fullUrl);
  console.log('[apiFetch] API_BASE:', API_BASE);
  console.log('[apiFetch] Normalized path:', normalizedPath);
  
  const res = await fetch(fullUrl, {
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
  isPaidMember?: boolean;
  allowedEngagement?: boolean;
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

// 管理者ログイン（Firebase IDトークンを使用）
export async function adminLogin(idToken: string) {
  console.log('[adminLogin] Calling API with token length:', idToken?.length || 0);
  console.log('[adminLogin] Token preview:', idToken ? `${idToken.substring(0, 20)}...` : 'undefined');
  
  if (!idToken) {
    throw new Error('Firebase IDトークンが取得できませんでした');
  }
  
  // Bearer プレフィックスが既に含まれているか確認
  const authHeader = idToken.startsWith('Bearer ') ? idToken : `Bearer ${idToken}`;
  console.log('[adminLogin] Authorization header:', `${authHeader.substring(0, 30)}...`);
  
  // フルパスで絶対URLを構築（相対パスを避けるため）
  const fullUrl = `${API_BASE}/api/auth/admin/login`;
  
  // 絶対URLであることを検証
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    console.error('[adminLogin] Invalid URL generated:', fullUrl);
    throw new Error(`Invalid API URL: ${fullUrl}. API_BASE must be an absolute URL.`);
  }
  
  console.log('[adminLogin] Request URL:', fullUrl);
  console.log('[adminLogin] API_BASE:', API_BASE);
  
  // 直接fetchを使用（フルパスで絶対URLを指定、相対パスによる衝突を回避）
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
  
  console.log('[adminLogin] Response status:', res.status);
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

// 通知数取得
export async function fetchNotificationCount(): Promise<number> {
  const res = await apiFetchWithAuth('/api/notifications/count', {
    method: 'GET',
  });
  const data = await unwrap<{ count: number }>(res);
  return data.count || 0;
}

// 通報一覧取得（管理者専用）
export async function fetchReports(params?: {
  status?: string;
  limit?: number;
}): Promise<any[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', String(params.limit));
  
  const res = await apiFetchWithAuth(`/api/admin/reports${query.toString() ? `?${query.toString()}` : ''}`, {
    method: 'GET',
  });
  const data = await unwrap<any[]>(res);
  return Array.isArray(data) ? data : [];
}

// ユーザー一覧取得（管理者専用）
export async function fetchUsers(): Promise<any[]> {
  const res = await apiFetchWithAuth('/api/admin/users', {
    method: 'GET',
  });
  return unwrap<any[]>(res);
}

// ユーザー承認（管理者専用）
export async function approveUser(userId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/admin/users/${userId}/approve`, {
    method: 'POST',
  });
  await unwrap(res);
}

// ユーザー却下（管理者専用）
export async function rejectUser(userId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/admin/users/${userId}/reject`, {
    method: 'POST',
  });
  await unwrap(res);
}

// 投稿分析許可（管理者専用）
export async function allowEngagement(userId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/admin/users/${userId}/allow-engagement`, {
    method: 'POST',
  });
  await unwrap(res);
}

// 投稿分析解除（管理者専用）
export async function revokeEngagement(userId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/admin/users/${userId}/revoke-engagement`, {
    method: 'POST',
  });
  await unwrap(res);
}

// 投稿分析データ取得
export async function fetchPostAnalytics(): Promise<any[]> {
  const res = await apiFetchWithAuth('/api/admin/posts/analytics', {
    method: 'GET',
  });
  const data = await unwrap<any[]>(res);
  return Array.isArray(data) ? data : [];
}

// コメント一覧取得（管理者専用）
export async function fetchComments(): Promise<any[]> {
  const res = await apiFetchWithAuth('/api/admin/comments', {
    method: 'GET',
  });
  return unwrap<any[]>(res);
}

// 投稿のコメント取得
export async function fetchPostComments(postId: string): Promise<any[]> {
  const res = await apiFetchWithAuth(`/api/posts/${postId}/comments`, {
    method: 'GET',
  });
  return unwrap<any[]>(res);
}

// 通知送信（管理者専用）
export async function sendNotification(data: {
  title: string;
  body: string;
  targetUserId?: string;
  filters?: Record<string, string>;
}): Promise<void> {
  const res = await apiFetchWithAuth('/api/admin/notifications/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await unwrap(res);
}

// 議員プロフィール取得
export async function fetchPoliticianProfile(): Promise<any> {
  const res = await apiFetchWithAuth('/api/politician/profile', {
    method: 'GET',
  });
  return unwrap<any>(res);
}

// 議員プロフィール更新
export async function updatePoliticianProfile(data: any): Promise<any> {
  const res = await apiFetchWithAuth('/api/politician/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return unwrap<any>(res);
}

// メディアアップロード
export async function uploadMedia(file: File): Promise<{ url: string; path?: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('auth_token');
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // 絶対URLを構築
  const normalizedPath = normalizeApiPath('/api/media/upload');
  const fullUrl = `${API_BASE}${normalizedPath}`;
  
  // 絶対URLであることを検証
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    console.error('[uploadMedia] Invalid URL generated:', fullUrl);
    throw new Error(`Invalid API URL: ${fullUrl}`);
  }
  
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers,
    body: formData,
  });
  return unwrap<{ url: string; path?: string }>(res);
}

// 政治資金一覧取得
export async function fetchPoliticalFunds(): Promise<any[]> {
  const res = await apiFetchWithAuth('/api/politician/funds', {
    method: 'GET',
  });
  return unwrap<any[]>(res);
}

// 政治資金作成
export async function createPoliticalFund(data: any): Promise<any> {
  const res = await apiFetchWithAuth('/api/politician/funds', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return unwrap<any>(res);
}

// 政治資金更新
export async function updatePoliticalFund(id: string, data: any): Promise<any> {
  const res = await apiFetchWithAuth(`/api/politician/funds/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return unwrap<any>(res);
}

// 政治資金削除
export async function deletePoliticalFund(id: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/politician/funds/${id}`, {
    method: 'DELETE',
  });
  await unwrap<void>(res);
}
