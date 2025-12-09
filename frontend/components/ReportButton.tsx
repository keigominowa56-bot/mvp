'use client';
import { useState } from 'react';
import { createReport } from '../lib/api-extended';
import { useAuth } from '../contexts/AuthContext';

export default function ReportButton({ targetId, targetType }: { targetId: string; targetType: 'post' | 'comment' | 'user' }) {
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [reasonCategory, setReasonCategory] = useState<'abuse' | 'spam' | 'misinfo' | 'other'>('abuse');
  const [reasonText, setReasonText] = useState('');
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      await createReport({ targetId, targetType, reasonCategory, reasonText: reasonText || undefined });
      setMsg('通報しました。確認までお待ちください。');
      setReasonText('');
      setOpen(false);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  if (!isLoggedIn) return null;
  return (
    <div className="inline-block relative">
      <button className="text-xs px-2 py-1 border rounded" onClick={() => setOpen(o => !o)}>通報</button>
      {open && (
        <form onSubmit={submit} className="absolute z-10 bg-white border rounded p-2 space-y-2 text-xs w-52">
          <select className="border rounded w-full px-1 py-1" value={reasonCategory} onChange={(e) => setReasonCategory(e.target.value as any)}>
            <option value="abuse">誹謗中傷</option>
            <option value="spam">スパム</option>
            <option value="misinfo">誤情報</option>
            <option value="other">その他</option>
          </select>
          <textarea
            className="border rounded w-full px-1 py-1 min-h-[60px]"
            placeholder="詳細 (任意)"
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
          />
          {msg && <div className="text-green-600">{msg}</div>}
            {err && <div className="text-red-600">{err}</div>}
          <div className="flex gap-2">
            <button type="submit" className="border rounded px-2 py-1 flex-1">送信</button>
            <button type="button" className="border rounded px-2 py-1" onClick={() => setOpen(false)}>閉じる</button>
          </div>
        </form>
      )}
    </div>
  );
}