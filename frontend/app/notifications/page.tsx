'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { listNotifications, markNotificationRead, type Notification } from '../../lib/api.notifications-snippet';

export default function NotificationsPage() {
  const { ready, isLoggedIn } = useAuth();

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !isLoggedIn) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await listNotifications();
        setItems(list);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || '通知の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, isLoggedIn]);

  async function markRead(id: string) {
    try {
      const updated = await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || '既読化に失敗しました');
    }
  }

  if (!ready) return <div className="p-4 text-sm">読み込み中...</div>;
  if (!isLoggedIn) return <div className="p-4 text-sm">ログインしてください</div>;

  if (loading) return <div className="p-4 text-sm">通知読み込み中...</div>;
  if (err) return <div className="p-4 text-sm text-red-600">{err}</div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">通知</h1>
      {items.length === 0 ? (
        <div className="text-sm text-slate-600">通知はありません</div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="border rounded p-2">
              <div className="text-sm font-medium">{n.title}</div>
              {n.body && <div className="text-xs text-slate-700">{n.body}</div>}
              <div className="text-[11px] text-slate-500">作成: {new Date(n.createdAt).toLocaleString()}</div>
              <div className="flex gap-2 mt-1">
                {!n.readAt ? (
                  <button className="border px-2 py-1 text-xs rounded" onClick={() => markRead(n.id)}>
                    既読にする
                  </button>
                ) : (
                  <span className="text-[11px] text-green-700">既読済み</span>
                )}
                {n.linkUrl && (
                  <a className="text-[11px] text-blue-700 underline" href={n.linkUrl} target="_blank" rel="noreferrer">
                    リンクを開く
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}