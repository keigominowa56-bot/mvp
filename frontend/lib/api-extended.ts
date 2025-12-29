import { apiFetchWithAuth, unwrap } from './api';

export async function createReport(
  targetId: string,
  targetType: 'post' | 'comment' | 'user',
  reason?: string,
) {
  const res = await apiFetchWithAuth('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ targetId, targetType, reason: reason ?? '' }),
  });
  return unwrap(res);
}

export async function verifyEmail(token: string) {
  const res = await apiFetchWithAuth('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return unwrap(res);
}

export async function sendPhoneCode(email: string) {
  const res = await apiFetchWithAuth('/api/auth/send-phone-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return unwrap(res);
}

export async function verifyPhone(email: string, code: string) {
  const res = await apiFetchWithAuth('/api/auth/verify-phone', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  return unwrap(res);
}

export { createReport, verifyEmail, sendPhoneCode, verifyPhone }