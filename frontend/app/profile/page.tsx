'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/auth/me`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      .then((r) => (r.status === 401 ? null : r.json()))
      .then(setMe as any);
  }, []);

  if (!me) return <div>ログインしてください</div>;
  const user = me.user;

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold">プロフィール</h1>
      <p>名前: {user.name}</p>
      <p>ニックネーム: {user.nickname}</p>
      <p>地域: {user.region?.name ?? '-'}</p>
      <p>支持政党: {user.supportedParty?.name ?? '-'}</p>
    </div>
  );
}