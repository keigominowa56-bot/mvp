// Re-generated complete API client (named exports only; explicit export list)

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export async function apiFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // LocalStorageからトークンを取得
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
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
  author?: {
    id: string;
    name?: string;
    username?: string;
    profileImageUrl?: string;
  };
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

export type Comment = {
  id: string;
  postId: string;
  authorUserId: string;
  author?: {
    id: string;
    name?: string;
    username?: string;
    profileImageUrl?: string;
    email?: string;
  };
  content: string;
  createdAt: string;
  mediaIds?: string[];
  mentions?: string[];
  parentId?: string | null;
  children?: Comment[];
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
  query.set('_t', Date.now().toString()); // キャッシュバスター

  const res = await apiFetchWithAuth(`/api/posts${query.toString() ? `?${query.toString()}` : ''}`, {
    cache: 'no-store',
    method: 'GET',
  });
  return unwrap<Post[]>(res);
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const res = await apiFetchWithAuth(`/api/posts/${postId}/comments`, { method: 'GET' });
  return unwrap<Comment[]>(res);
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'コメント削除に失敗しました');
  }
}

export async function createComment(
  postId: string,
  body: { text: string; mediaIds?: string[]; mentions?: string[]; parentId?: string | null },
): Promise<Comment> {
  console.log('[API] createComment開始 - postId:', postId);
  console.log('[API] createComment URL:', `/api/posts/${postId}/comments`);
  const payload = {
    content: body.text,
    mediaIds: body.mediaIds ?? [],
    mentions: body.mentions ?? [],
    parentId: body.parentId ?? null,
  };
  console.log('[API] createComment payload:', payload);
  const res = await apiFetchWithAuth(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  console.log('[API] createCommentレスポンス - status:', res.status, 'ok:', res.ok, 'statusText:', res.statusText);
  if (!res.ok) {
    // レスポンステキストを取得
    const responseText = await res.text().catch(() => 'レスポンスの読み取りに失敗しました');
    console.error('[API] createCommentエラー - ステータス:', res.status, 'ステータステキスト:', res.statusText);
    console.error('[API] createCommentエラー - レスポンス本文:', responseText);
    
    // JSONパースを試みる
    let errorData: any = {};
    try {
      errorData = JSON.parse(responseText);
      console.error('[API] createCommentエラー - パース済みデータ:', errorData);
    } catch (e) {
      console.error('[API] createCommentエラー - JSONパース失敗、テキストをそのまま使用');
      errorData = { message: responseText || `コメント送信に失敗しました (${res.status})` };
    }
    
    throw new Error(errorData.message || errorData.error || `コメント送信に失敗しました (${res.status}: ${res.statusText})`);
  }
  return unwrap<Comment>(res);
}

export async function votePost(postId: string, choice: 'agree' | 'disagree') {
  console.log('[API] votePost開始 - postId:', postId, 'choice:', choice);
  console.log('[API] votePost URL:', `/api/posts/${postId}/votes`);
  const res = await apiFetchWithAuth(`/api/posts/${postId}/votes`, {
    method: 'POST',
    body: JSON.stringify({ choice }),
  });
  console.log('[API] votePostレスポンス - status:', res.status, 'ok:', res.ok, 'statusText:', res.statusText);
  if (!res.ok) {
    // レスポンステキストを取得
    const responseText = await res.text().catch(() => 'レスポンスの読み取りに失敗しました');
    console.error('[API] votePostエラー - ステータス:', res.status, 'ステータステキスト:', res.statusText);
    console.error('[API] votePostエラー - レスポンス本文:', responseText);
    
    // JSONパースを試みる
    let errorData: any = {};
    try {
      errorData = JSON.parse(responseText);
      console.error('[API] votePostエラー - パース済みデータ:', errorData);
    } catch (e) {
      console.error('[API] votePostエラー - JSONパース失敗、テキストをそのまま使用');
      errorData = { message: responseText || `投票に失敗しました (${res.status})` };
    }
    
    throw new Error(errorData.message || errorData.error || `投票に失敗しました (${res.status}: ${res.statusText})`);
  }
  return unwrap(res);
}

// VoteButtons.tsx用の型と関数
export type VoteType = 'support' | 'oppose';
export type VoteStats = {
  support: number;
  oppose: number;
  total: number;
};
export type UserVote = {
  id: string;
  postId: string;
  userId: string;
  type: VoteType;
  createdAt: string;
};

export async function fetchVoteStats(postId: string): Promise<VoteStats> {
  console.log('[API] fetchVoteStats開始 - postId:', postId);
  const res = await apiFetchWithAuth(`/api/posts/${postId}/votes/summary`, { method: 'GET' });
  const data = await unwrap<any>(res);
  console.log('[API] fetchVoteStatsレスポンス:', data);
  
  // バックエンドのレスポンス形式に応じて変換
  // バックエンドは { postId, summary: { agree: number, disagree: number }, total: number } を返す
  const stats: VoteStats = {
    support: data.summary?.agree || 0,
    oppose: data.summary?.disagree || 0,
    total: data.total || 0,
  };
  console.log('[API] fetchVoteStats変換後:', stats);
  return stats;
}

export async function getUserVote(postId: string): Promise<UserVote | null> {
  console.log('[API] getUserVote開始 - postId:', postId);
  // バックエンドにvotes/meエンドポイントが存在しない可能性があるため、
  // 一旦nullを返す（後で実装が必要な場合は追加）
  console.log('[API] getUserVote - エンドポイント未実装のためnullを返す');
  return null;
}

export async function castVote(postId: string, type: VoteType): Promise<UserVote> {
  // VoteTypeをVoteChoiceに変換
  const choice = type === 'support' ? 'agree' : 'disagree';
  console.log('[API] castVote開始 - postId:', postId, 'type:', type, 'choice:', choice);
  console.log('[API] castVote URL:', `/api/posts/${postId}/votes`);
  const res = await apiFetchWithAuth(`/api/posts/${postId}/votes`, {
    method: 'POST',
    body: JSON.stringify({ choice }),
  });
  console.log('[API] castVoteレスポンス - status:', res.status, 'ok:', res.ok, 'statusText:', res.statusText);
  if (!res.ok) {
    // レスポンステキストを取得
    const responseText = await res.text().catch(() => 'レスポンスの読み取りに失敗しました');
    console.error('[API] castVoteエラー - ステータス:', res.status, 'ステータステキスト:', res.statusText);
    console.error('[API] castVoteエラー - レスポンス本文:', responseText);
    
    // JSONパースを試みる
    let errorData: any = {};
    try {
      errorData = JSON.parse(responseText);
      console.error('[API] castVoteエラー - パース済みデータ:', errorData);
    } catch (e) {
      console.error('[API] castVoteエラー - JSONパース失敗、テキストをそのまま使用');
      errorData = { message: responseText || `投票に失敗しました (${res.status})` };
    }
    
    throw new Error(errorData.message || errorData.error || `投票に失敗しました (${res.status}: ${res.statusText})`);
  }
  return unwrap<UserVote>(res);
}

export async function updateVote(postId: string, type: VoteType): Promise<UserVote> {
  // VoteTypeをVoteChoiceに変換
  const choice = type === 'support' ? 'agree' : 'disagree';
  console.log('[API] updateVote開始 - postId:', postId, 'type:', type, 'choice:', choice);
  console.log('[API] updateVote URL:', `/api/posts/${postId}/votes`);
  // バックエンドにPUTエンドポイントがないため、POSTで上書きを試みる
  // バックエンドが409 Conflictを返す場合は既に投票済みなので、エラーをそのまま返す
  const res = await apiFetchWithAuth(`/api/posts/${postId}/votes`, {
    method: 'POST',
    body: JSON.stringify({ choice }),
  });
  console.log('[API] updateVoteレスポンス - status:', res.status, 'ok:', res.ok, 'statusText:', res.statusText);
  if (!res.ok) {
    // レスポンステキストを取得
    const responseText = await res.text().catch(() => 'レスポンスの読み取りに失敗しました');
    console.error('[API] updateVoteエラー - ステータス:', res.status, 'ステータステキスト:', res.statusText);
    console.error('[API] updateVoteエラー - レスポンス本文:', responseText);
    
    // JSONパースを試みる
    let errorData: any = {};
    try {
      errorData = JSON.parse(responseText);
      console.error('[API] updateVoteエラー - パース済みデータ:', errorData);
    } catch (e) {
      console.error('[API] updateVoteエラー - JSONパース失敗、テキストをそのまま使用');
      errorData = { message: responseText || `投票更新に失敗しました (${res.status})` };
    }
    
    throw new Error(errorData.message || errorData.error || `投票更新に失敗しました (${res.status}: ${res.statusText})`);
  }
  return unwrap<UserVote>(res);
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

// fetchNotifications は下で定義されているため、ここでは削除

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

export type Me = {
  id: string;
  email: string;
  role: 'user' | 'politician' | 'admin' | 'citizen';
  name?: string;
  username?: string;
  profileImageUrl?: string;
  supportedPartyId?: string;
};

export async function getMe(): Promise<Me> {
  const res = await apiFetchWithAuth(`/api/auth/me`, { method: 'GET' });
  return unwrap<Me>(res);
}

export async function updateUserProfile(dto: {
  name?: string;
  username?: string;
  profileImageUrl?: string;
  supportedPartyId?: string;
}): Promise<any> {
  console.log('[updateUserProfile] リクエスト開始:', dto);
  const res = await apiFetchWithAuth('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  console.log('[updateUserProfile] レスポンス status:', res.status, 'ok:', res.ok);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[updateUserProfile] エラーレスポンス:', errorText);
    let errorData: any = {};
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || `HTTP ${res.status}` };
    }
    throw new Error(errorData.message || `プロフィール更新に失敗しました (${res.status})`);
  }
  return unwrap(res);
}

export async function followUser(targetUserId: string): Promise<void> {
  const res = await apiFetchWithAuth('/api/follows/follow', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'フォローに失敗しました');
  }
}

export async function unfollowUser(targetUserId: string): Promise<void> {
  const res = await apiFetchWithAuth('/api/follows/unfollow', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'フォロー解除に失敗しました');
  }
}

export async function fetchFollowedUserIds(): Promise<string[]> {
  const res = await apiFetchWithAuth('/api/follows/followed', { method: 'GET' });
  if (!res.ok) {
    return [];
  }
  const data = await unwrap<{ ids: string[] }>(res);
  return data.ids || [];
}

export async function getFollowerCount(userId: string): Promise<number> {
  const res = await apiFetchWithAuth(`/api/follows/${userId}/count`, { method: 'GET' });
  if (!res.ok) {
    return 0;
  }
  const data = await unwrap<{ count: number }>(res);
  return data.count || 0;
}

export async function getNotificationCount(): Promise<number> {
  const res = await apiFetchWithAuth('/api/notifications/count', { method: 'GET' });
  if (!res.ok) {
    return 0;
  }
  const data = await unwrap<{ count: number }>(res);
  return data.count || 0;
}

export async function fetchNotifications(): Promise<any[]> {
  const res = await apiFetchWithAuth('/api/notifications', { method: 'GET' });
  return unwrap<any[]>(res);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const res = await apiFetchWithAuth(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || '既読処理に失敗しました');
  }
}
