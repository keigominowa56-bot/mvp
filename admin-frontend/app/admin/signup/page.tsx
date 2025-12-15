'use client';
import React, { useState } from 'react';

export default function AdminSignupPage() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [msg, setMsg] = useState('');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('http://localhost:4000/api/auth/admin/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setMsg(res.ok ? '新規登録成功！ログインしてください。' : (await res.json().catch(()=>({}))).message || '新規登録失敗');
  }
  return (
    <form className="max-w-md mx-auto space-y-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold mb-3">運営 新規登録</h1>
      <input className="border w-full p-2" placeholder="メール" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border w-full p-2" type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="bg-blue-700 text-white px-4 py-2 w-full" type="submit">登録</button>
      <div className="p-2 text-green-700">{msg}</div>
      <div className="pt-2"><a href="/admin/login" className="text-blue-500 underline text-sm">管理者ログインはこちら</a></div>
    </form>
  );
}