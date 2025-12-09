import api, { unwrap } from './api';

export async function followUser(targetUserId: string) {
  const res = await api.post('/follows/follow', { targetUserId });
  return unwrap(res);
}

export async function unfollowUser(targetUserId: string) {
  const res = await api.post('/follows/unfollow', { targetUserId });
  return unwrap(res);
}

export async function fetchFollowedUserIds(): Promise<string[]> {
  const res = await api.get('/follows/followed');
  return unwrap<{ ids: string[] }>(res).ids;
}