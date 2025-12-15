'use client';
import React, { useState } from 'react';

export default function PoliticianLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/politician/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      location.href = '/politician/dashboard';
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`ログイン失敗: ${err.message ?? res.statusText}`);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">議員 ログイン</h1>
      <form className="mt-4 space-y-2" onSubmit={onSubmit}>
        <input className="border p-2 w-64" placeholder="メール" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-64" type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2" type="submit">ログイン</button>
      </form>
    </div>
  );
}