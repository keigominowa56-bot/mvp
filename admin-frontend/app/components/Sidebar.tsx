'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { fetchCurrentUser, fetchNotificationCount, fetchReports, isAdmin, isPolitician } from '@/lib/api';

export default function Sidebar() {
  const [user, setUser] = useState<{ role?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);
  const userRef = useRef<{ role?: string; name?: string } | null>(null);

  // userRefを最新のuserと同期
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // ユーザー情報取得
      fetchCurrentUser()
        .then(data => {
          console.log('[Sidebar] ユーザー情報取得成功:', data);
          const adminCheck = isAdmin(data?.role);
          console.log(`[Auth Check] Role: ${data?.role}, IsAdmin: ${adminCheck}`);
          setUser(data);
          // ユーザー情報取得後に通報数を読み込む（管理者の場合）
          if (adminCheck) {
            try {
              loadReportCount();
            } catch (err) {
              console.error('[Sidebar] 通報数取得エラー（初期化時）:', err);
              // エラーが発生してもサイドバーは表示を続ける
            }
          }
        })
        .catch(err => {
          console.error('[Sidebar] ユーザー情報取得失敗:', err);
          setUser(null);
        })
        .finally(() => setLoading(false));
      
      // 通知数を取得
      try {
        loadNotificationCount();
      } catch (err) {
        console.error('[Sidebar] 通知数取得エラー（初期化時）:', err);
        // エラーが発生してもサイドバーは表示を続ける
      }
      
      // 定期的に通知数と通報数を更新
      const interval = setInterval(() => {
        try {
          loadNotificationCount();
        } catch (err) {
          console.error('[Sidebar] 通知数取得エラー（定期更新）:', err);
        }
        // userRefを使用して最新のuserを参照
        const currentUser = userRef.current;
        if (currentUser && isAdmin(currentUser.role)) {
          try {
            loadReportCount();
          } catch (err) {
            console.error('[Sidebar] 通報数取得エラー（定期更新）:', err);
          }
        }
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadNotificationCount() {
    try {
      const count = await fetchNotificationCount();
      setNotificationCount(count);
    } catch (err) {
      // エラーは無視
      console.error('[Sidebar] 通知数取得失敗:', err);
    }
  }

  async function loadReportCount() {
    try {
      const reports = await fetchReports({ status: 'pending', limit: 100 });
      setReportCount(reports.length);
    } catch (err) {
      // エラーは無視
      console.error('[Sidebar] 通報数取得失敗:', err);
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
          <p className="font-semibold">{user?.name || user?.role || 'ユーザー'}</p>
          <p className="text-xs text-gray-400">
            {isAdmin(user?.role) ? '運営' : isPolitician(user?.role) ? '議員' : user?.role || '-'}
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
        {(user && (isAdmin(user.role) || (user as any)?.allowedEngagement)) && (
          <Link href="/engagement" className="block hover:bg-gray-700 rounded p-2">投稿分析</Link>
        )}
        {/* 運営(admin)のみが議員登録、全投稿分析、ユーザー管理、通報一覧、通知送信、アンケート回答管理を表示 */}
        {user && isAdmin(user.role) && (
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
            <Link href="/survey-responses" className="block hover:bg-gray-700 rounded p-2">アンケート回答管理</Link>
          </>
        )}
        {/* 議員(politician)のみがプロフィール編集と政治資金管理を表示 */}
        {user && isPolitician(user.role) && (
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
            {(!user || !isPolitician((user as any)?.role)) && (
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
