// Re-generated complete API client (named exports only; explicit export list)

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function apiFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
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
};

export type Comment = {
  id: string;
  postId: string;
  authorUserId: string;
  content: string;
  createdAt: string;
  mediaIds?: string[];
  mentions?: string[];
};

export async function fetchFeed(params?: {
  type?: 'activity' | 'pledge' | 'question' | 'news';
  region?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<Post[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.region) query.set('region', params.region);
  if (params?.q) query.set('q', params.q);
  if (params?.page != null) query.set('page', String(params.page));
  if (params?.limit != null) query.set('limit', String(params.limit));

  const res = await apiFetchWithAuth(`/posts${query.toString() ? `?${query.toString()}` : ''}`, {
    method: 'GET',
  });
  return unwrap<Post[]>(res);
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const res = await apiFetchWithAuth(`/posts/${postId}/comments`, { method: 'GET' });
  return unwrap<Comment[]>(res);
}

export async function createComment(
  postId: string,
  body: { text: string; mediaIds?: string[]; mentions?: string[] },
): Promise<Comment> {
  const payload = {
    content: body.text,
    mediaIds: body.mediaIds ?? [],
    mentions: body.mentions ?? [],
  };
  const res = await apiFetchWithAuth(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return unwrap<Comment>(res);
}

export async function votePost(postId: string, choice: 'agree' | 'disagree') {
  const res = await apiFetchWithAuth(`/posts/${postId}/votes`, {
    method: 'POST',
    body: JSON.stringify({ choice }),
  });
  return unwrap(res);
}

export async function fetchPolitician(id: string) {
  const res = await apiFetchWithAuth(`/politicians/${id}`, { method: 'GET' });
  return unwrap(res);
}

export async function fetchFundingSummary(id: string) {
  const res = await apiFetchWithAuth(`/politicians/${id}/funding/summary`, { method: 'GET' });
  return unwrap(res);
}

export async function follow(targetUserId: string) {
  const res = await apiFetchWithAuth(`/follows/${targetUserId}`, { method: 'POST' });
  return unwrap(res);
}

export async function unfollow(targetUserId: string) {
  const res = await apiFetchWithAuth(`/follows/${targetUserId}`, { method: 'DELETE' });
  return unwrap(res);
}

export async function fetchSurveysAvailable() {
  const res = await apiFetchWithAuth(`/surveys/available`, { method: 'GET' });
  return unwrap(res);
}

export async function answerSurvey(id: string, answers: any) {
  const res = await apiFetchWithAuth(`/surveys/${id}/responses`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
  return unwrap(res);
}

export async function fetchWalletTransactions() {
  const res = await apiFetchWithAuth(`/wallet/transactions`, { method: 'GET' });
  return unwrap(res);
}

export async function fetchNotifications() {
  const res = await apiFetchWithAuth(`/notifications`, { method: 'GET' });
  return unwrap(res);
}

export async function markNotificationRead(id: string) {
  const res = await apiFetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' });
  return unwrap(res);
}

export async function fetchDashboardPosts() {
  const res = await apiFetchWithAuth(`/analytics/my/posts`, { method: 'GET' });
  return unwrap(res);
}

export async function fetchDashboardFollowers() {
  const res = await apiFetchWithAuth(`/analytics/my/followers/demographics`, { method: 'GET' });
  return unwrap(res);
}

export function downloadDashboardCsv(): string {
  return `${API_BASE}/analytics/my/export.csv`;
}

export {
  API_BASE,
  apiFetchWithAuth,
  unwrap,
  fetchFeed,
  fetchComments,
  createComment,
  votePost,
  fetchPolitician,
  fetchFundingSummary,
  follow,
  unfollow,
  fetchSurveysAvailable,
  answerSurvey,
  fetchWalletTransactions,
  fetchNotifications,
  markNotificationRead,
  fetchDashboardPosts,
  fetchDashboardFollowers,
  downloadDashboardCsv,
  Post,
  Comment,
}