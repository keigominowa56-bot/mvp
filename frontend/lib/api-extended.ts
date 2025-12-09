import api, { unwrap } from './api';

// Email & phone verification
export async function verifyEmail(token: string) {
  const res = await api.post('/auth/verify-email', { token });
  return unwrap(res);
}
export async function sendPhoneCode(email: string) {
  const res = await api.post('/auth/send-phone-code', { email });
  return unwrap(res);
}
export async function verifyPhone(email: string, code: string) {
  const res = await api.post('/auth/verify-phone', { email, code });
  return unwrap(res);
}

// Reports (missing export added)
export async function createReport(data: { targetType: 'post' | 'comment' | 'user'; targetId: string; reasonCategory: 'abuse' | 'spam' | 'misinfo' | 'other'; reasonText?: string }) {
  const res = await api.post('/reports', data);
  return unwrap(res);
}
export async function adminListReports(filters?: { status?: string; targetType?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (filters?.status) q.set('status', filters.status);
  if (filters?.targetType) q.set('targetType', filters.targetType);
  if (filters?.limit) q.set('limit', String(filters.limit));
  const res = await api.get(`/admin/reports${q.toString() ? `?${q}` : ''}`);
  return unwrap(res);
}
export async function adminUpdateReportStatus(id: string, status: string, adminNote?: string) {
  const res = await api.patch(`/admin/reports/${id}/status`, { status, adminNote });
  return unwrap(res);
}
export async function adminActionReport(id: string, action: 'ban-user' | 'hide-post' | 'hide-comment', adminNote?: string) {
  const res = await api.patch(`/admin/reports/${id}/action`, { action, adminNote });
  return unwrap(res);
}

// Comment Likes
export async function likeComment(commentId: string) {
  const res = await api.post(`/comments/${commentId}/like`);
  return unwrap(res);
}
export async function unlikeComment(commentId: string) {
  const res = await api.delete(`/comments/${commentId}/like`);
  return unwrap(res);
}
export async function getCommentLikesCount(commentId: string): Promise<{ count: number }> {
  const res = await api.get(`/comments/${commentId}/likes-count`);
  return unwrap(res);
}
export async function isCommentLiked(commentId: string): Promise<{ liked: boolean }> {
  const res = await api.get(`/comments/${commentId}/is-liked`);
  return unwrap(res);
}

// Politician profile
export async function fetchPoliticianProfile(id: string) {
  const res = await api.get(`/politicians/${id}/profile`);
  return unwrap(res);
}

// Policies
export async function fetchPolicies(politicianId: string) {
  const res = await api.get(`/policies/politician/${politicianId}`);
  return unwrap(res);
}
export async function createPolicy(politicianId: string, data: { title: string; description?: string; category?: string; status?: string }) {
  const res = await api.post(`/policies/politician/${politicianId}`, data);
  return unwrap(res);
}
export async function updatePolicy(id: string, patch: any) {
  const res = await api.patch(`/policies/${id}`, patch);
  return unwrap(res);
}

// Funding
export async function fetchFundingRecords(politicianId: string, params?: { from?: string; to?: string }) {
  const q = new URLSearchParams();
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  const res = await api.get(`/funding/politicians/${politicianId}/records${q.toString() ? `?${q}` : ''}`);
  return unwrap(res);
}
export async function fetchFundingSummary(politicianId: string, params?: { from?: string; to?: string }) {
  const q = new URLSearchParams();
  if (params?.from) q.set('from', params.from);
  if (params?.to) q.set('to', params.to);
  const res = await api.get(`/funding/politicians/${politicianId}/summary${q.toString() ? `?${q}` : ''}`);
  return unwrap(res);
}
export async function createFundingRecord(politicianId: string, data: { amount: number; category?: string; description?: string; date?: string }) {
  const res = await api.post(`/funding/politicians/${politicianId}/records`, data);
  return unwrap(res);
}

// NG words admin
export async function listNgWords() {
  const res = await api.get('/admin/ng-words');
  return unwrap(res);
}
export async function addNgWord(word: string) {
  const res = await api.post('/admin/ng-words', { word });
  return unwrap(res);
}
export async function removeNgWord(id: string) {
  const res = await api.delete(`/admin/ng-words/${id}`);
  return unwrap(res);
}

// Scheduled Posts
export async function schedulePost(data: { authorId?: string; title?: string; body: string; tags?: string[]; scheduledAt: string }) {
  const res = await api.post('/admin/scheduled-posts', data);
  return unwrap(res);
}
export async function listScheduledPosts() {
  const res = await api.get('/admin/scheduled-posts');
  return unwrap(res);
}
export async function cancelScheduledPost(id: string) {
  const res = await api.patch(`/admin/scheduled-posts/${id}/cancel`, {});
  return unwrap(res);
}

// Bulk Posts
export async function bulkPostsJSON(items: Array<{ title?: string; body: string; tags?: string[]; authorId?: string }>) {
  const res = await api.post('/admin/bulk-posts/json', { items });
  return unwrap(res);
}
export async function bulkPostsCSV(csvText: string) {
  const res = await api.post('/admin/bulk-posts/csv', csvText, { headers: { 'Content-Type': 'text/csv' } });
  return unwrap(res);
}