'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../../lib/firebase';
import { API_BASE } from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kycWarning, setKycWarning] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    try {
      const auth = getAuth(app);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred.user.emailVerified) {
        setMsg('メール認証が完了していません。メールに届いたリンクをクリックしてください。');
        return;
      }
      const idToken = await userCred.user.getIdToken();

      const loginUrl = `${API_BASE}/api/auth/login-firebase`;
      console.log('🚀 ===== LOGIN REQUEST =====');
      console.log('🚀 Accessing API at:', loginUrl);
      console.log('🚀 API_BASE:', API_BASE);
      console.log('🚀 Expected backend:', 'http://localhost:4000');
      console.log('🚀 ===========================');

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        credentials: 'include',
        body: JSON.stringify({ }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setMsg(errorData.message || 'サーバーログイン情報の連携に失敗しました');
        return;
      }

      // 【重要】バックエンドから返ってきたJWTトークンを取得してLocalStorageに保存
      const loginData = await res.json();
      console.log('🔑 Login response:', loginData);
      
      if (loginData.token) {
        localStorage.setItem('auth_token', loginData.token);
        console.log('✅ Token saved to localStorage');
      } else {
        console.error('❌ No token in login response');
        setMsg('認証トークンが取得できませんでした');
        return;
      }

      // LocalStorageに保存したトークンを使用してユーザー情報を取得
      console.log('🔍 ユーザー情報取得開始 - token:', loginData.token ? 'あり' : 'なし');
      const meRes = await fetch(`${API_BASE}/api/auth/me`, { 
        headers: { 'Authorization': `Bearer ${loginData.token}` },
        credentials: 'include' 
      });
      console.log('🔍 ユーザー情報取得レスポンス - status:', meRes.status, 'ok:', meRes.ok);
      if (meRes.ok) {
        const me = await meRes.json();
        console.log('👤 User info取得成功:', me);
        const status = me?.kycStatus || me?.user?.kycStatus;
        if (status !== 'verified') {
          setKycWarning('KYC 未検証です。アンケート報酬受け取り不可。');
        }
      } else {
        const errorData = await meRes.json().catch(() => ({}));
        console.error('❌ Failed to fetch user info - status:', meRes.status, 'error:', errorData);
      }
      
      location.href = '/feed';

    } catch (err: any) {
      console.error('❌ Login error:', err);
      // Firebaseエラーコードを日本語化
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setMsg('メールアドレスかパスワードが違います');
      } else if (err.code === 'auth/too-many-requests') {
        setMsg('何度も失敗したため一時的にブロックされました。時間を置いて再度お試しください');
      } else if (err.code === 'auth/invalid-email') {
        setMsg('メールアドレスの形式が正しくありません');
      } else if (err.code === 'auth/user-disabled') {
        setMsg('このアカウントは無効化されています');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setMsg('サーバーに接続できません。バックエンド（4000番ポート）が起動しているか確認してください');
      } else {
        setMsg(err?.message ?? 'ログインに失敗しました');
      }
    }
  }

  return (
    <div className="bg-white border rounded p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">ログイン</h1>
      {msg && (
        <div className="bg-red-100 border border-red-300 text-red-600 rounded p-2 mb-3">
          {msg}
        </div>
      )}
      {kycWarning && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded p-2 mb-3">
          {kycWarning}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input className="border rounded px-3 py-2" type="email" placeholder="メール" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2" type="password" placeholder="パスワード" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="rounded bg-blue-600 text-white px-3 py-2">ログイン</button>
      </form>
      <div className="mt-3 flex items-center gap-2">
        <Link href="/register" className="text-blue-700">新規登録へ</Link>
        <Link href="/forgot-password" className="text-blue-700">パスワードを忘れた</Link>
      </div>
    </div>
  );
}
