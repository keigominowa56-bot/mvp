import React from 'react';

// 認証/ユーザー取得のサンプル関数（実装に合わせて差し替えてください）
async function getCurrentUser(): Promise<{
  id: string;
  name?: string | null;
  nickname?: string | null;
  region?: { id: string; name?: string | null } | null;
  supportedParty?: { id: string; name?: string | null } | null;
} | null> {
  // 例: NextAuth or 自前のセッションからユーザーID取得 → API/DBからユーザー情報取得
  // const session = await auth();
  // if (!session?.user?.id) return null;
  // const res = await fetch(`${process.env.API_BASE_URL}/users/${session.user.id}`, { cache: 'no-store' });
  // if (!res.ok) return null;
  // return await res.json();

  // ダミー実装（必ずnull以外を返すわけではないので本番は上記に差し替え）
  return null;
}

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    // 未ログイン or 取得失敗時の安全なUI
    return (
      <div className="bg-white border rounded p-4">
        <h1 className="text-xl font-bold">プロフィール</h1>
        <p className="text-red-600">ユーザー情報が取得できませんでした。ログインしてください。</p>
        <div className="mt-2">
          <a href="/login" className="text-blue-600 underline">
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  const name = user.name ?? '-';
  const nickname = user.nickname ?? '-';
  const regionName = user.region?.name ?? '-';
  const partyName = user.supportedParty?.name ?? '-';

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold">プロフィール</h1>
      <p>名前: {name}</p>
      <p>ニックネーム: {nickname}</p>
      <p>地域: {regionName}</p>
      <p>支持政党: {partyName}</p>
    </div>
  );
}