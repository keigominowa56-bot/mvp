import { api } from './api';

export interface PostsSummary {
  total: number;
  policy: number;
  activity: number;
}
export interface PostsTimeseriesPoint {
  date: string;
  total: number;
  policy: number;
  activity: number;
}

export async function fetchPostsSummary(): Promise<PostsSummary> {
  const res = await api.get('/analytics/posts/summary');
  return res.data as PostsSummary;
}

export async function fetchPostsTimeseries(days = 30): Promise<PostsTimeseriesPoint[]> {
  const res = await api.get(`/analytics/posts/timeseries?days=${days}`);
  return res.data as PostsTimeseriesPoint[];
}