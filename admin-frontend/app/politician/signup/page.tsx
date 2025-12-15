'use client';
import React, { useState } from 'react';

export default function PoliticianSignupPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', regionId: '', partyId: '' });
  const [msg, setMsg] = useState('');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('http://localhost:4000/api/auth/politician/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if(res.ok) {
      setMsg('新規登録成功！ログインしてください。');
      setForm({ email: '', password: '', name: '', regionId: '', partyId: '' });
    } else {
      const err = await res.json().catch(()=> ({}));
      setMsg(err.message || '新規登録失敗');
    }
  }
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">議員 新規登録</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="メール" value={form.email}
          onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} required />
        <input className="border p-2 w-full" type="password" placeholder="パスワード" value={form.password}
          onChange={e=>setForm(f=>({ ...f, password: e.target.value }))} required />
        <input className="border p-2 w-full" placeholder="氏名" value={form.name}
          onChange={e=>setForm(f=>({ ...f, name: e.target.value }))} required />
        <input className="border p-2 w-full" placeholder="地域ID" value={form.regionId}
          onChange={e=>setForm(f=>({ ...f, regionId: e.target.value }))} />
        <input className="border p-2 w-full" placeholder="政党ID" value={form.partyId}
          onChange={e=>setForm(f=>({ ...f, partyId: e.target.value }))} />
        <button className="bg-blue-700 text-white px-4 py-2 w-full" type="submit">登録</button>
        <div className="text-green-700 p-2">{msg}</div>
        <div className="text-right pt-2"><a href="/politician/login" className="text-blue-500 underline text-sm">ログインはこちら</a></div>
      </form>
    </div>
  );
}