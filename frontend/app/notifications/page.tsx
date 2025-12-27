'use client';
import { useEffect, useState } from 'react';
import { API_BASE, apiFetchWithAuth, unwrap } from '../../lib/api';

export default function NotificationsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await apiFetchWithAuth('/api/notifications', { method: 'GET' });
      if (res.ok) {
        const data = await unwrap<any[]>(res);
        setList(data || []);
      }
    } catch (err) {
      console.error('通知読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      await apiFetchWithAuth(`/api/notifications/${id}/read`, { method: 'PATCH' });
      // 既読状態を更新するだけで、通知は削除しない
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    } catch (err) {
      console.error('既読処理エラー:', err);
    }
  }

  async function deleteNotification(id: string) {
    if (!confirm('この通知を削除しますか？')) {
      return;
    }
    try {
      await apiFetchWithAuth(`/api/notifications/${id}`, { method: 'DELETE' });
      // 通知を削除
      setList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('通知削除エラー:', err);
      alert('通知の削除に失敗しました');
    }
  }

  if (loading) {
    return (
      <div className="bg-white border rounded p-4">
        <h1 className="text-xl font-bold mb-2">通知</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold mb-4">通知</h1>
      {list.length === 0 ? (
        <p className="text-gray-500">通知はありません</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((n) => (
            <li
              key={n.id}
              className={`border rounded px-3 py-2 ${n.postId ? 'cursor-pointer hover:bg-gray-50' : ''}`}
              onClick={() => {
                if (n.postId) {
                  window.location.href = `/posts/${n.postId}`;
                }
              }}
            >
              <div className="font-semibold">{n.title}</div>
              <div className="text-sm text-gray-600">{n.type}</div>
              <p className="mt-1">{n.body}</p>
              {n.commentContent && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                  <p className="text-gray-700">{n.commentContent}</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {!n.readAt && (
                  <button
                    className="rounded bg-gray-800 text-white px-3 py-1 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      markRead(n.id);
                    }}
                  >
                    既読にする
                  </button>
                )}
                {n.readAt && (
                  <span className="text-xs text-gray-500">既読</span>
                )}
                <button
                  className="rounded bg-red-600 text-white px-3 py-1 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}