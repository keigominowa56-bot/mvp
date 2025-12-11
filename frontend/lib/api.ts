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
  if (res.status === 401) {
    if (typeof window !== 'undefined') location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetchWithAuth<T>(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': options.body ? 'application/json' : undefined,
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    } as any,
    credentials: 'include',
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}