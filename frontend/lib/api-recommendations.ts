import api, { unwrap } from './api';

export type PublicRecommendationUser = {
  id: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export async function fetchPublicRecommendations(limit = 8): Promise<PublicRecommendationUser[]> {
  try {
    const res = await api.get('/recommendations', { params: { limit } });
    return unwrap<PublicRecommendationUser[]>(res);
  } catch (e: any) {
    // 404 等は空配列で握りつぶし
    if (e?.response?.status === 404) {
      return [];
    }
    throw e;
  }
}