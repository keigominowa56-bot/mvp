'use client';
import React, { useState } from 'react';

export default function PoliticianSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regionId, setRegionId] = useState('');
  const [partyId, setPartyId] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/politician/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, regionId, partyId }),
    });
    if (res.ok) {
      alert('議員登録に成功しました。ログインしてください。');
      location.href = '/politician/login';
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`失敗しました: ${err.message ?? res.statusText}`);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">議員 新規登録</h1>
      <form className="mt-4 space-y-2" onSubmit={onSubmit}>
        <input className="border p-2 w-64" placeholder="メール" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-64" type="password" placeholder="パスワード" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="border p-2 w-64" placeholder="氏名" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 w-64" placeholder="地域ID" value={regionId} onChange={(e) => setRegionId(e.target.value)} />
        <input className="border p-2 w-64" placeholder="政党ID" value={partyId} onChange={(e) => setPartyId(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2" type="submit">登録</button>
      </form>
      <p className="mt-2"><a href="/politician/login" className="text-blue-600 underline">ログインはこちら</a></p>
    </div>
  );
}