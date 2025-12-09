'use client';

import { useState, useEffect } from 'react';
import { followUser, unfollowUser, fetchFollowedUserIds } from '../lib/api.follows-snippet';
import { useAuth } from '../contexts/AuthContext';

export default function FollowButton({ userId }: { userId: string }) {
  const { isLoggedIn, ready } = useAuth();
  const [followed, setFollowed] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isLoggedIn) {
      (async () => {
        try {
          const ids = await fetchFollowedUserIds();
          setFollowed(ids.includes(userId));
        } catch {
          // ignore
        }
      })();
    }
  }, [ready, isLoggedIn, userId]);

  async function toggle() {
    if (!isLoggedIn) {
      alert('ログインしてください');
      return;
    }
    setLoading(true);
    try {
      if (followed) {
        await unfollowUser(userId);
        setFollowed(false);
      } else {
        await followUser(userId);
        setFollowed(true);
      }
    } catch (e: any) {
      alert('操作失敗: ' + (e?.response?.data?.message ?? e?.message ?? 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded border ${
        followed ? 'bg-slate-800 text-white' : 'bg-white'
      } disabled:opacity-50`}
    >
      {loading ? '処理中...' : followed ? 'フォロー解除' : 'フォロー'}
    </button>
  );
}