import api from './api';

export type FollowRecord = {
  followId: string;
  politicianId: string;
  name?: string;
  email?: string;
  createdAt: string;
};

export async function fetchMyFollows(): Promise<FollowRecord[]> {
  const res = await api.get('/follows/my');
  return res.data;
}

export async function followPolitician(politicianId: string) {
  const res = await api.post('/follows', { politicianId });
  return res.data;
}

export async function unfollowPolitician(politicianId: string) {
  const res = await api.delete('/follows', { data: { politicianId } });
  return res.data;
}

export type Recommendation = {
  id: string;
  name?: string;
  email?: string;
  addressPref?: string;
  addressCity?: string;
};

export async function fetchRecommendations(params?: { limit?: number; q?: string }): Promise<Recommendation[]> {
  const q = new URLSearchParams();
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.q) q.set('q', params.q);
  const res = await api.get(`/follows/recommendations${q.toString() ? `?${q}` : ''}`);
  return res.data;
}