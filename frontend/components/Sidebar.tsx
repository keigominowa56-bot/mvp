'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import FollowingPanel from './FollowingPanel';

export default function Sidebar() {
  const { isLoggedIn, isAdmin, isPolitician, logout } = useAuth();
  const [q, setQ] = useState('');
  const router = useRouter();

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
          <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/dashboard">ダッシュボード</a>
        )}
        <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/notifications">通知</a>
        <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/profile">プロフィール</a>
        {isAdmin && (
          <a className="block px-3 py-2 rounded hover:bg-slate-50" href="/admin/users">管理</a>
        )}

        {!isLoggedIn && (
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