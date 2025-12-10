'use client';

import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // 既存の /auth/login が無い場合はスタブを作るか、dev-login を使う
      const res = await axios.post('/auth/login', { email, password });
      const token = res.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      location.href = '/';
    } catch (err: any) {
      console.error('[api error]', err.response?.status, err.config?.url, err.response?.data);
      alert('ログインに失敗しました');
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-lg font-bold mb-4">ログイン</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input type="email" placeholder="メールアドレス" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" placeholder="パスワード" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button type="submit">ログインする</button>
      </form>
    </div>
  );
}