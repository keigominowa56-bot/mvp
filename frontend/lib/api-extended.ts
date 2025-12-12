import { apiFetchWithAuth, unwrap } from './api';

export async function createReport(
  targetId: string,
  targetType: 'post' | 'comment' | 'user',
  reason?: string,
) {
  const res = await apiFetchWithAuth('/reports', {
    method: 'POST',
    body: JSON.stringify({ targetId, targetType, reason: reason ?? '' }),
  });
  return unwrap(res);
}

export async function verifyEmail(token: string) {
  const res = await apiFetchWithAuth('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return unwrap(res);
}

export async function verifyPhone(code: string) {
  const res = await apiFetchWithAuth('/auth/verify-phone', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  return unwrap(res);
}

export { createReport, verifyEmail, verifyPhone }