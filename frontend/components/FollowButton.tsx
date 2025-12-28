'use client';

import { useState, useEffect } from 'react';
import { followUser, unfollowUser, fetchFollowedUserIds } from '../lib/api';
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
    
    // 応援解除の場合は確認ダイアログを表示
    if (followed) {
      if (!confirm('応援を解除しますか？')) {
        return;
      }
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
      alert('操作失敗: ' + (e?.message ?? 'unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold ${
        followed ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50`}
    >
      {loading ? '処理中...' : followed ? '応援中' : '応援する'}
    </button>
  );
}