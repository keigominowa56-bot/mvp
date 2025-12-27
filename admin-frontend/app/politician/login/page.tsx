'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { politicianLogin } from '@/lib/api';

export default function PoliticianLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await politicianLogin(email, password);
      
      // LocalStorageにトークンを保存
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        router.push('/dashboard');
      } else {
        setError('ログインに失敗しました：トークンが取得できませんでした');
      }
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="max-w-md w-full mx-auto space-y-4 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-3 text-center">議員ログイン</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-600 rounded p-3">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input
            className="border w-full p-2 rounded"
            type="email"
            placeholder="your@email.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
          <input
            className="border w-full p-2 rounded"
            type="password"
            placeholder="パスワード"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button
          className="bg-green-600 text-white px-4 py-2 w-full rounded font-bold disabled:opacity-60 hover:bg-green-700"
          type="submit"
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
        
        <div className="pt-2 text-center">
          <a href="/admin/login" className="text-blue-500 underline text-sm">
            管理者ログイン
          </a>
        </div>
        
        <div className="pt-2 text-xs text-gray-500 text-center">
          ※ 議員アカウントは運営が登録します
        </div>
      </form>
    </div>
  );
}
