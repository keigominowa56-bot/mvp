'use client';
import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { app } from '../../../lib/firebase';

export default function AdminSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // デバッグ：環境変数を確認
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.polimee.com';
  const apiUrl = `${apiBase}/api`;
  console.log('🔧 Environment check:');
  console.log('  - NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log('  - Resolved API URL:', apiUrl);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    // @keygo.jp ドメインチェック
    if (!email.endsWith('@keygo.jp')) {
      setMsg('管理者アカウントは @keygo.jp ドメインのみ登録できます');
      setLoading(false);
      return;
    }

    try {
      // Firebaseで管理者アカウントを作成
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // メール認証を送信
      await sendEmailVerification(userCredential.user);

      // バックエンドに管理者登録
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.polimee.com';
      const signupUrl = `${apiBase}/api/auth/admin/signup`;
      
      // デバッグ用：実際のリクエストURLをコンソールに出力
      console.log('🚀 ===== SIGNUP REQUEST =====');
      console.log('🚀 Sending request to:', signupUrl);
      console.log('🚀 NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log('🚀 Expected backend:', apiBase);
      console.log('🚀 ============================');
      
      const res = await fetch(signupUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '新規登録失敗');
      }

      setMsg('登録が完了しました。メールアドレスに認証リンクを送信しました。認証後、ログインしてください。');
      
      // 5秒後にログインページへ自動遷移
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 5000);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setMsg('このメールアドレスは既に使用されています');
      } else if (err.code === 'auth/weak-password') {
        setMsg('パスワードは6文字以上にしてください');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setMsg('サーバーに接続できません。バックエンド（4000番ポート）が起動しているか確認してください');
      } else {
        setMsg(err?.message ?? '登録に失敗しました');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-md mx-auto space-y-4 mt-10" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold mb-3">運営 新規登録</h1>
      <p className="text-sm text-gray-600 mb-4">※ @keygo.jp ドメインのメールアドレスのみ登録可能です</p>
      {msg && (
        <div className={`p-3 rounded border ${msg.includes('失敗') || msg.includes('できません') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
          {msg}
        </div>
      )}
      <input 
        className="border w-full p-2 rounded" 
        type="email"
        placeholder="メール (@keygo.jp)" 
        value={email} 
        required
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        className="border w-full p-2 rounded" 
        type="password" 
        placeholder="パスワード（6文字以上）" 
        value={password} 
        required
        minLength={6}
        onChange={e => setPassword(e.target.value)} 
      />
      <button 
        className="bg-blue-700 text-white px-4 py-2 w-full rounded font-bold disabled:opacity-60" 
        type="submit"
        disabled={loading}
      >
        {loading ? '登録中...' : '登録してメール認証へ'}
      </button>
      <div className="pt-2 text-center">
        <a href="/admin/login" className="text-blue-500 underline text-sm">すでにアカウントをお持ちの方はこちら</a>
      </div>
    </form>
  );
}
