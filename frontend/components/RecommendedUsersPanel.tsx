'use client';

import { useEffect, useState } from 'react';
import { fetchPublicRecommendations, PublicRecommendationUser } from '../lib/api-recommendations';
import FollowButton from './FollowButton';
import { useAuth } from '../contexts/AuthContext';

export default function RecommendedUsersPanel() {
  const [items, setItems] = useState<PublicRecommendationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPublicRecommendations(8);
        if (mounted) setItems(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="border rounded p-3 space-y-2 text-sm">
      <div className="font-medium">おすすめユーザー</div>
      {loading && <div className="text-xs text-slate-500">読み込み中...</div>}
      {!loading && items.length === 0 && (
        <div className="text-xs text-slate-500">今は表示できる推薦がありません</div>
      )}
      <ul className="space-y-1">
        {items.map((u) => (
          <li key={u.id} className="flex justify-between items-center">
            <div className="truncate">
              <span>{u.email}</span>
              {u.role && <span className="ml-1 text-xs text-slate-500">({u.role})</span>}
            </div>
            {isLoggedIn && <FollowButton userId={u.id} />}
          </li>
        ))}
      </ul>
    </div>
  );
}