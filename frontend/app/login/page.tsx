'use client';

import { useState } from 'react';
import { API_BASE } from '../../lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [kycWarning, setKycWarning] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, password }),
    });
    if (!res.ok) {
      alert('ログイン失敗');
      return;
    }
    alert('ログインしました');
    // After login, simple KYC check (replace with robust auth/me)
    try {
      const meRes = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (meRes.ok) {
        const me = await meRes.json();
        const status = me?.user?.kycStatus;
        if (status !== 'verified') {
          setKycWarning('KYC 未検証です。アンケート報酬を受け取れません。');
        }
      }
    } catch { /* ignore */ }
    location.href = '/feed';
  }

  return (
    <div className="bg-white border rounded p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">ログイン</h1>
      {kycWarning && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-2 mb-3">
          {kycWarning}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input className="border rounded px-3 py-2" placeholder="メールまたは電話" value={id} onChange={(e)=>setId(e.target.value)} />
        <input className="border rounded px-3 py-2" type="password" placeholder="パスワード" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="rounded bg-blue-600 text-white px-3 py-2">ログイン</button>
      </form>
      <div className="mt-3 flex items-center gap-2">
        <Link href="/kyc" className="rounded bg-gray-800 text-white px-3 py-2">マイナンバーか免許証をアップロードする</Link>
        <Link href="/register" className="text-blue-700">新規登録へ</Link>
      </div>
    </div>
  );
}