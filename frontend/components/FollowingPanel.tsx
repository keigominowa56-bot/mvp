'use client';
import { useEffect, useState } from 'react';
import { fetchMyFollows, unfollowPolitician, FollowRecord } from '../lib/api-follows';
import { useAuth } from '../contexts/AuthContext';

export default function FollowingPanel() {
  const { isLoggedIn, ready } = useAuth();
  const [items, setItems] = useState<FollowRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchMyFollows();
      setItems(data);
      setErr(null);
    } catch (e: any) {
      // 401の場合は未ログイン扱いで静かに表示
      if (e?.response?.status === 401) {
        setItems([]);
        setErr(null);
      } else {
        setErr(e?.response?.data?.message || e.message || '取得に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready && isLoggedIn) load();
  }, [ready, isLoggedIn]);

  if (!ready) {
    return <div className="card text-xs text-slate-500">読み込み中...</div>;
  }
  if (!isLoggedIn) {
    return <div className="card text-xs text-slate-500">ログインするとフォローが表示されます。</div>;
  }

  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">応援している議員</h3>
        <button onClick={load} className="text-xs px-2 py-1 border rounded">更新</button>
      </div>
      {loading && <div className="text-xs text-slate-500">読み込み中...</div>}
      {err && <div className="text-xs text-red-600">{err}</div>}
      {!loading && items.length === 0 && (
        <div className="text-xs text-slate-500">まだフォローがありません。</div>
      )}
      <ul className="space-y-1">
        {items.map(i => (
          <li key={i.followId} className="flex items-center justify-between text-xs">
            <span>{i.name || i.email || i.politicianId}</span>
            <button
              className="px-2 py-1 border rounded"
              onClick={async () => {
                await unfollowPolitician(i.politicianId);
                load();
              }}
            >
              解除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}