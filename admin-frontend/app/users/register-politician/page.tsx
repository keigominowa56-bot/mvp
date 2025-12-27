'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerPolitician, fetchCurrentUser } from '@/lib/api';

export default function RegisterPoliticianPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // 管理者権限チェック
    const checkAuth = async () => {
      try {
        const user = await fetchCurrentUser();
        if (user.role !== 'admin') {
          setError('この機能は管理者のみ利用できます');
          setTimeout(() => router.push('/dashboard'), 2000);
        }
      } catch (err: any) {
        setError('認証エラー: ログインしてください');
        setTimeout(() => router.push('/admin/login'), 2000);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await registerPolitician({ name, email, password });
      setSuccess('議員アカウントを作成しました');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || '議員登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>認証確認中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">議員アカウント登録</h1>
      
      <div className="max-w-md bg-white shadow rounded-lg p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前
            </label>
            <input
              type="text"
              className="border w-full p-2 rounded"
              placeholder="田中太郎"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              className="border w-full p-2 rounded"
              placeholder="politician@example.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              初期パスワード
            </label>
            <input
              type="password"
              className="border w-full p-2 rounded"
              placeholder="8文字以上のパスワード"
              value={password}
              required
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              ※ 議員に初回ログイン時にパスワード変更を依頼してください
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50"
          >
            {loading ? '登録中...' : '議員アカウントを作成'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <a href="/dashboard" className="text-blue-500 hover:underline text-sm">
            ダッシュボードに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
