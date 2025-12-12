export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': options.body ? 'application/json' : undefined,
      ...(options.headers || {}),
    } as any,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetchWithAuth<T>(path: string, options: RequestInit = {}) {
  const tokenMatch = typeof document !== 'undefined' ? document.cookie.match(/token=([^;]+)/) : null;
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': options.body ? 'application/json' : undefined,
      Authorization: token ? `Bearer ${token}` : undefined,
      ...(options.headers || {}),
    } as any,
    credentials: 'include',
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Turbopack が参照する unwrap（必要なら既存のユーティリティで置き換え）
export function unwrap<T>(p: Promise<T>): Promise<T> {
  return p;
}

// コメント用の暫定型（OpenAPI 生成型があるなら差し替え）
export type Comment = {
  id: string;
  authorUserId: string;
  content: string;
  createdAt: string;
  mediaIds?: string[];
  mentions?: string[];
};

export async function fetchComments(postId: string) {
  return apiFetch<Comment[]>(`/posts/${postId}/comments`);
}

export async function createComment(
  postId: string,
  body: { text: string; mediaIds?: string[]; mentions?: string[] },
) {
  return apiFetchWithAuth<Comment>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content: body.text,
      mediaIds: body.mediaIds ?? [],
      mentions: body.mentions ?? [],
    }),
  });
}

// Turbopack の静的解析に有利な明示的エクスポート列挙
export {
  API_BASE,
  apiFetch,
  apiFetchWithAuth,
  unwrap,
  fetchComments,
  createComment,
  Comment,
}