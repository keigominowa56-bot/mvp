'use client';

import { useState } from 'react';
import { sendNotification } from '../../../../lib/api.notifications-snippet';

export default function AdminSendNotificationPage() {
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('info');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [email, setEmail] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await sendNotification({ userId, type, title, text: text || undefined, linkUrl: linkUrl || undefined, email: email || undefined });
      alert('通知を送信しました（メール指定時は開発用jsonTransportで送信内容をログします）');
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || '送信に失敗しました');
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-xl">
      <h1 className="text-lg font-semibold">通知送信（管理）</h1>
      <form onSubmit={submit} className="space-y-2 border rounded p-3">
        <input className="border px-2 py-1 w-full" placeholder="ユーザーID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <div className="flex gap-2">
          <select className="border px-2 py-1" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="info">info</option>
            <option value="alert">alert</option>
          </select>
          <input className="border px-2 py-1 flex-1" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <textarea className="border px-2 py-1 w-full" rows={5} placeholder="本文（任意）" value={text} onChange={(e) => setText(e.target.value)} />
        <input className="border px-2 py-1 w-full" placeholder="リンクURL（任意）" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        <input className="border px-2 py-1 w-full" placeholder="メール（任意・開発用送信）" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="border px-3 py-2 rounded">送信</button>
      </form>
    </div>
  );
}