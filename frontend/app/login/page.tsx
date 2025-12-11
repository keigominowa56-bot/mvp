'use client';
import { useState } from 'react';
import { API_BASE } from '../../lib/api';
import { setToken } from '../../lib/auth';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
    });
    if (!res.ok) {
      alert('ログイン失敗');
      return;
    }
    const data = await res.json();
    setToken(data.accessToken);
    location.href = '/timeline';
  }

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold mb-3">ログイン</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input className="border rounded px-3 py-2" placeholder="メールまたは電話" value={id} onChange={(e)=>setId(e.target.value)} />
        <input className="border rounded px-3 py-2" type="password" placeholder="パスワード" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="rounded bg-blue-600 text-white px-3 py-2">ログイン</button>
      </form>
    </div>
  );
}