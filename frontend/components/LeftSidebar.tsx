'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetchWithAuth, unwrap, getMe } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type PoliticianSummary = {
  id: string;
  name?: string;
  party?: string;
  district?: string;
};

type FollowersAgg = {
  total: number;
};

export function LeftSidebar() {
  const { user, isPolitician: authIsPolitician } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const [profile, setProfile] = useState<PoliticianSummary | null>(null);
  const [followers, setFollowers] = useState<FollowersAgg | null>(null);

  useEffect(() => {
    // ユーザー情報を取得（AuthContextから）
    if (user && authIsPolitician) {
      // 政治家の場合は拡張プロフィール情報を取得
      (async () => {
        try {
          const res = await apiFetchWithAuth('/api/politician/profile', { method: 'GET' });
          if (res.ok) {
            const data = await unwrap<any>(res);
            setProfile({
              id: user.id,
              name: data.name || user.name,
              party: data.party,
              district: data.district,
            });
          } else if (res.status === 404) {
            // プロフィールがまだ作成されていない場合は、ユーザー情報のみを使用
            setProfile({
              id: user.id,
              name: user.name,
              party: undefined,
              district: undefined,
            });
          }
        } catch (err) {
          console.error('[LeftSidebar] プロフィール取得エラー:', err);
          // エラー時はユーザー情報のみを使用
          setProfile({
            id: user.id,
            name: user.name,
            party: undefined,
            district: undefined,
          });
        }
      })();
      
      // フォロワー数を取得（オプション）
      (async () => {
        try {
          const res = await apiFetchWithAuth(`/api/follows/${user.id}/count`, { method: 'GET' });
          if (res.ok) {
            const data = await unwrap<{ count: number }>(res);
            setFollowers({ total: data.count || 0 });
          }
        } catch {
          // エラーは無視
        }
      })();
    } else if (user) {
      // 一般ユーザーの場合は、ユーザー情報のみを使用
      setProfile({
        id: user.id,
        name: user.name,
        party: undefined,
        district: undefined,
      });
    }
  }, [user, authIsPolitician]);

  return (
    <aside className={`bg-white border rounded p-3 ${navOpen ? '' : 'hidden md:block'}`} aria-label="メインナビ">
      <button
        aria-label="ナビを開閉"
        className="md:hidden rounded border px-2 py-1 mb-2"
        onClick={() => setNavOpen((v) => !v)}
      >
        メニュー
      </button>

      {profile && (
        <div className="mb-3">
          <div className="font-semibold">{profile.name || 'ユーザー'}</div>
          {authIsPolitician && (
            <>
              <div className="text-sm text-gray-600">{profile.party || '無所属'}</div>
              {profile.district && (
                <div className="text-xs text-gray-500">{profile.district}</div>
              )}
              <div className="text-xs text-gray-500">フォロワー: {followers?.total ?? 0}</div>
            </>
          )}
        </div>
      )}

      <nav className="flex flex-col gap-2">
        <Link href="/feed" className="rounded px-3 py-2 hover:bg-gray-100">タイムライン</Link>
        <Link href="/notifications" className="rounded px-3 py-2 hover:bg-gray-100">通知</Link>
        <Link href="/profile" className="rounded px-3 py-2 hover:bg-gray-100">プロフィール</Link>
        <Link href="/kyc" className="rounded px-3 py-2 hover:bg-gray-100">KYC</Link>
        <Link href="/login" className="rounded px-3 py-2 hover:bg-gray-100">ログイン</Link>
        <Link href="/register" className="rounded px-3 py-2 hover:bg-gray-100">新規登録</Link>
      </nav>
    </aside>
  );
}

export { LeftSidebar }