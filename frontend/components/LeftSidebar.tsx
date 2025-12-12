'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api';

type PoliticianSummary = {
  id: string;
  user?: { name?: string };
  party?: { name?: string };
};

type FollowersAgg = {
  total: number;
};

export function LeftSidebar() {
  const [navOpen, setNavOpen] = useState(false);
  const [isPolitician, setIsPolitician] = useState(false);
  const [profile, setProfile] = useState<PoliticianSummary | null>(null);
  const [followers, setFollowers] = useState<FollowersAgg | null>(null);

  useEffect(() => {
    // Minimal check (replace with auth/me in real)
    // Fetch politician self profile if available
    (async () => {
      try {
        // Placeholder: assume current user has politician profile at /politicians/me
        const res = await fetch(`${API_BASE}/politicians/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setIsPolitician(true);
          const aggRes = await fetch(`${API_BASE}/analytics/my/followers/demographics`, { credentials: 'include' });
          if (aggRes.ok) setFollowers(await aggRes.json());
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <aside className={`bg-white border rounded p-3 ${navOpen ? '' : 'hidden md:block'}`} aria-label="メインナビ">
      <button
        aria-label="ナビを開閉"
        className="md:hidden rounded border px-2 py-1 mb-2"
        onClick={() => setNavOpen((v) => !v)}
      >
        メニュー
      </button>

      {isPolitician && profile && (
        <div className="mb-3">
          <div className="font-semibold">{profile.user?.name ?? '議員'}</div>
          <div className="text-sm text-gray-600">{profile.party?.name ?? '無所属'}</div>
          <div className="text-xs text-gray-500">フォロワー: {followers?.total ?? 0}</div>
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