'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { adminLogin } from '@/lib/api';

export default function AdminLoginPage() {
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
      // Firebase Authenticationでログイン
      const auth = getAuth(app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // メール認証チェック
      if (!userCredential.user.emailVerified) {
        setError('メール認証が完了していません。メールに届いたリンクをクリックしてください。');
        setLoading(false);
        return;
      }
      
      // Firebase IDトークンを取得
      const idToken = await userCredential.user.getIdToken();
      
      // バックエンドにFirebaseトークンを送信してJWTトークンを取得
      const result = await adminLogin(idToken);
      
      // LocalStorageにトークンを保存
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        router.push('/dashboard');
      } else {
        setError('ログインに失敗しました：トークンが取得できませんでした');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('メールアドレスかパスワードが違います');
      } else if (err.code === 'auth/too-many-requests') {
        setError('何度も失敗したため一時的にブロックされました。時間を置いて再度お試しください');
      } else if (err.code === 'auth/invalid-email') {
        setError('メールアドレスの形式が正しくありません');
      } else if (err.code === 'auth/user-disabled') {
        setError('このアカウントは無効化されています');
      } else {
        setError(err.message || 'ログインに失敗しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="max-w-md w-full mx-auto space-y-4 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-3 text-center">管理者ログイン</h1>
        
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
            placeholder="admin@keygo.jp"
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
          className="bg-blue-700 text-white px-4 py-2 w-full rounded font-bold disabled:opacity-60 hover:bg-blue-800"
          type="submit"
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
        
        <div className="pt-2 text-center">
          <a href="/politician/login" className="text-blue-500 underline text-sm">
            議員ログイン
          </a>
        </div>
      </form>
    </div>
  );
}
