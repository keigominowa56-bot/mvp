'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Sidebar() {
  const [user, setUser] = useState<{ role?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, { 
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Failed to fetch user');
        })
        .then(data => {
          console.log('[Sidebar] ユーザー情報取得成功:', data);
          setUser(data);
          // ユーザー情報取得後に通報数を読み込む（管理者の場合）
          if (data?.role === 'admin') {
            loadReportCount(token);
          }
        })
        .catch(err => {
          console.error('[Sidebar] ユーザー情報取得失敗:', err);
          setUser(null);
        })
        .finally(() => setLoading(false));
      
      // 通知数を取得
      loadNotificationCount(token);
      // 通報数を取得（管理者のみ）
      if (user?.role === 'admin') {
        loadReportCount(token);
      }
      const interval = setInterval(() => {
        loadNotificationCount(token);
        if (user?.role === 'admin') {
          loadReportCount(token);
        }
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadNotificationCount(token: string) {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotificationCount(data.count || 0);
      }
    } catch (err) {
      // エラーは無視
    }
  }

  async function loadReportCount(token: string) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports?status=pending&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReportCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      // エラーは無視
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-4 flex flex-col min-h-screen">
      <h2 className="text-xl font-bold mb-2">管理メニュー</h2>
      
      {!loading && user && (
        <div className="bg-gray-700 p-3 rounded mb-2">
          <p className="text-sm text-gray-300">ログイン中</p>
          <p className="font-semibold">{user.name || user.role}</p>
          <p className="text-xs text-gray-400">
            {user.role === 'admin' ? '運営' : user.role === 'politician' ? '議員' : user.role}
          </p>
        </div>
      )}
      
      <nav className="space-y-2 flex-1">
        <Link href="/dashboard" className="block hover:bg-gray-700 rounded p-2">ダッシュボード</Link>
        <Link href="/posts/create" className="block hover:bg-gray-700 rounded p-2">新規投稿</Link>
        <Link href="/comments" className="block hover:bg-gray-700 rounded p-2 relative">
          コメント返信
          {notificationCount > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </Link>
        {/* 投稿分析は管理者または許可された議員が使用可能 */}
        {(user?.role === 'admin' || (user as any)?.allowedEngagement) && (
          <Link href="/engagement" className="block hover:bg-gray-700 rounded p-2">投稿分析</Link>
        )}
        {/* 運営(admin)のみが議員登録、全投稿分析、ユーザー管理、通報一覧、通知送信を表示 */}
        {user?.role === 'admin' && (
          <>
            <Link href="/users/register-politician" className="block hover:bg-gray-700 rounded p-2">議員登録</Link>
            <Link href="/users" className="block hover:bg-gray-700 rounded p-2">ユーザー管理</Link>
            <Link href="/reports" className="block hover:bg-gray-700 rounded p-2 relative">
              通報一覧
              {reportCount > 0 && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {reportCount > 99 ? '99+' : reportCount}
                </span>
              )}
            </Link>
            <Link href="/notifications/send" className="block hover:bg-gray-700 rounded p-2">通知送信</Link>
          </>
        )}
        {/* 議員(politician)のみがプロフィール編集と政治資金管理を表示 */}
        {user?.role === 'politician' && (
          <>
            <Link href="/politician/profile" className="block hover:bg-gray-700 rounded p-2">プロフィール編集</Link>
            <Link href="/politician/funds" className="block hover:bg-gray-700 rounded p-2">政治資金管理</Link>
          </>
        )}
      </nav>
      
      <div className="mt-auto border-t border-gray-700 pt-4">
        {user ? (
          <button 
            onClick={handleLogout}
            className="block w-full text-left hover:bg-gray-700 rounded p-2 text-sm"
          >
            ログアウト
          </button>
        ) : (
          <div className="space-y-2">
            <Link href="/politician/login" className="block hover:bg-gray-700 rounded p-2 text-sm">
              議員ログイン
            </Link>
            {/* politicianログイン時は運営ログインボタンを非表示 */}
            {user?.role !== 'politician' && (
              <Link href="/admin/login" className="block hover:bg-gray-700 rounded p-2 text-sm">
                運営ログイン
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
