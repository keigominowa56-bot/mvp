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

export async function likeComment(commentId: string) {
  const res = await apiFetchWithAuth(`/api/comments/${commentId}/like`, {
    method: 'POST',
  });
  return unwrap(res);
}

export async function unlikeComment(commentId: string) {
  const res = await apiFetchWithAuth(`/api/comments/${commentId}/like`, {
    method: 'DELETE',
  });
  return unwrap(res);
}

export async function isCommentLiked(commentId: string): Promise<{ liked: boolean }> {
  const res = await apiFetchWithAuth(`/api/comments/${commentId}/is-liked`, {
    method: 'GET',
  });
  return unwrap<{ liked: boolean }>(res);
}

export async function getCommentLikesCount(commentId: string): Promise<{ count: number }> {
  const res = await apiFetchWithAuth(`/api/comments/${commentId}/likes-count`, {
    method: 'GET',
  });
  return unwrap<{ count: number }>(res);
}

export { createReport, verifyEmail, sendPhoneCode, verifyPhone, likeComment, unlikeComment, isCommentLiked, getCommentLikesCount }