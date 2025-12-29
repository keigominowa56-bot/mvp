// frontend/components/auth/LoginForm.tsx
'use client'; 

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../../lib/api';
import toast from 'react-hot-toast'; // トースト表示用にインポート

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithToken } = useAuth(); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ログインAPIを呼び出してトークンを取得
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'ログインに失敗しました');
      }
      
      const data = await res.json();
      const token = data.token || data.accessToken;
      
      if (!token) {
        throw new Error('トークンが取得できませんでした');
      }
      
      // トークンを使ってログイン
      await loginWithToken(token);
      toast.success('ログインしました');
      router.push('/');
      
    } catch (error: any) {
      // 💡 エラーメッセージを表示
      toast.error(error.message || 'ログインに失敗しました');
      console.error("Login attempt failed:", error); 
    }
  };

  // 💡 ここからが正しい return ステートメントです
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">ログイン</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="email">
            メールアドレス
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="email"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="password">
            パスワード
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
            type="submit"
          >
            ログイン
          </button>
        </div>
      </form>
    </div>
  );
}