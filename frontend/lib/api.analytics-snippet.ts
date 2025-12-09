import api, { unwrap } from './api';

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
  return unwrap<PostsSummary>(res);
}

export async function fetchPostsTimeseries(days = 30): Promise<PostsTimeseriesPoint[]> {
  const res = await api.get(`/analytics/posts/timeseries`, { params: { days } });
  return unwrap<PostsTimeseriesPoint[]>(res);
}