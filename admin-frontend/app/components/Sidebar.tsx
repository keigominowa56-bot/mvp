'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const [user, setUser] = useState<{ role?: string } | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/me', { credentials:'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-4 flex flex-col">
      <h2 className="text-xl font-bold mb-2">管理メニュー</h2>
      <nav className="space-y-2 flex-1">
        <Link href="/dashboard" className="block hover:bg-gray-700 rounded p-2">ダッシュボード</Link>
        <Link href="/post/new" className="block hover:bg-gray-700 rounded p-2">新規投稿</Link>
        <Link href="/comments" className="block hover:bg-gray-700 rounded p-2">コメント返信</Link>
        <Link href="/engagement" className="block hover:bg-gray-700 rounded p-2">投稿分析</Link>
        {/* 運営(admin)のみがユーザー管理を表示 */}
        {user?.role === 'admin' && (
          <Link href="/users" className="block hover:bg-gray-700 rounded p-2">ユーザー管理</Link>
        )}
      </nav>
      <div className="mt-auto">
        <Link href="/politician/login" className="underline text-sm mr-2">議員ログイン</Link>
        <Link href="/admin/login" className="underline text-sm">運営ログイン</Link>
      </div>
    </aside>
  );
}