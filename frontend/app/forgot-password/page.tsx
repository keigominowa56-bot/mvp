'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { app } from '../../lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      const auth = getAuth(app);
      await sendPasswordResetEmail(auth, email);
      setMsg('パスワード再設定メールを送信しました。メールをご確認ください。');
    } catch (err: any) {
      setMsg('再設定メール送信に失敗しました。メールアドレスをご確認ください。');
    }
  }

  return (
    <div className="bg-white border rounded p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">パスワード再設定</h1>
      {msg && (
        <div className="bg-green-50 border border-green-300 text-green-800 rounded p-2 mb-3">
          {msg}
        </div>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input
          className="border rounded px-3 py-2"
          type="email"
          placeholder="登録メールアドレス"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button className="rounded bg-blue-600 text-white px-3 py-2">送信</button>
      </form>
      <div className="mt-3 flex items-center gap-2">
        <Link href="/login" className="text-blue-700">ログインへ</Link>
      </div>
    </div>
  );
}