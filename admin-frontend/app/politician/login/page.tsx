'use client';
import React, { useState } from 'react';

export default function PoliticianLoginPage() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [msg, setMsg] = useState('');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('http://localhost:4000/api/auth/politician/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }), credentials: 'include'
    });
    if(res.ok) window.location.href = '/dashboard';
    else { const err = await res.json().catch(()=>({})); setMsg(err.message || 'ログインできません'); }
  }
  return (
    <form className="max-w-md mx-auto space-y-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold mb-3">議員ログイン</h1>
      <input className="border w-full p-2" placeholder="メール" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border w-full p-2" type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="bg-blue-700 text-white px-4 py-2 w-full" type="submit">ログイン</button>
      {msg && <div className="text-red-600">{msg}</div>}
      <div className="pt-2"><a href="/politician/signup" className="text-blue-500 underline text-sm">新規登録はこちら</a></div>
    </form>
  );
}