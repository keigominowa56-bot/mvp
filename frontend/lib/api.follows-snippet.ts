import { api } from './api';

export async function followUser(targetUserId: string) {
  const res = await api.post('/follows/follow', { targetUserId });
  return res.data;
}

export async function unfollowUser(targetUserId: string) {
  const res = await api.post('/follows/unfollow', { targetUserId });
  return res.data;
}

export async function fetchFollowedUserIds(): Promise<string[]> {
  const res = await api.get('/follows/followed');
  return (res.data as { ids: string[] }).ids;
}