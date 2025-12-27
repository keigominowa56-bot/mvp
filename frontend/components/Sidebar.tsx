'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import FollowingPanel from './FollowingPanel';
import { apiFetchWithAuth, unwrap } from '../lib/api';

export default function Sidebar() {
  const { isLoggedIn, isAdmin, isPolitician, logout } = useAuth();
  const [q, setQ] = useState('');
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      loadNotificationCount();
      const interval = setInterval(loadNotificationCount, 30000); // 30秒ごとに更新
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  async function loadNotificationCount() {
    try {
      const res = await apiFetchWithAuth('/api/notifications/count', { method: 'GET' });
      if (res.ok) {
        const data = await unwrap<{ count: number }>(res);
        setNotificationCount(data.count || 0);
      }
    } catch (err) {
      // エラーは無視
    }
  }

  return (
    <aside className="space-y-4">
      <nav className="card space-y-2 sticky top-4">
        <div className="text-lg font-semibold">サイト名</div>

        {/* 検索 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const term = q.trim();
            if (!term) return;
            router.push(`/search?q=${encodeURIComponent(term)}`);
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="検索（投稿/ユーザー）"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="text-sm px-3 py-2 border rounded">検索</button>
        </form>

        <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/feed">フィード</a>
        {isPolitician && (
          <>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/dashboard">ダッシュボード</a>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/politician/profile/edit">プロフィール編集</a>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/politician/funds">政治資金管理</a>
          </>
        )}
        <a className="block px-3 py-2 rounded hover:bg-slate-50 relative" href="/notifications">
          通知
          {notificationCount > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </a>
        <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/profile">プロフィール</a>
        {isAdmin && (
          <>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/admin/users/register-politician">議員登録</a>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/admin/posts/analytics">全投稿分析</a>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/admin/users">ユーザー管理</a>
          </>
        )}

        {!isLoggedIn && !isPolitician && (
          <div className="pt-2 border-t">
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/login">ログイン</a>
            <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/register">新規登録</a>
          </div>
        )}

        {isLoggedIn && (
          <button
            className="w-full text-left px-3 py-2 rounded hover:bg-slate-50 border-t"
            onClick={logout}
          >
            ログアウト
          </button>
        )}
      </nav>

      <FollowingPanel />
    </aside>
  );
}