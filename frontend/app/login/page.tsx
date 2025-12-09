'use client';
import { useState } from 'react';
import { login, devLoginAdmin, getMe } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      await getMe();
      alert('ログイン成功');
      location.href = '/';
    } catch (e: any) {
      alert(`ログイン失敗: ${e?.response?.data?.message || e.message}`);
    }
  }

  async function devLogin() {
    try {
      await devLoginAdmin();
      await getMe();
      alert('（開発用）管理者としてログインしました');
      location.href = '/admin/politicians/new';
    } catch (e: any) {
      alert(`開発ログイン失敗: ${e?.response?.data?.message || e.message}`);
    }
  }

  function clearStorage() {
    localStorage.clear();
    alert('ローカルストレージをクリアしました');
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-lg font-semibold">ログイン</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input className="border rounded px-2 py-1 w-full" placeholder="メール" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="パスワード" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border rounded px-3 py-2 w-full">ログイン</button>
      </form>

      <div className="space-y-2">
        <button className="border rounded px-3 py-2 w-full" onClick={clearStorage}>ローカルストレージをクリア</button>
        {process.env.NODE_ENV !== 'production' && (
          <button className="border rounded px-3 py-2 w-full bg-gray-100" onClick={devLogin}>
            （開発用）管理者ワンクリックログイン
          </button>
        )}
      </div>
    </div>
  );
}