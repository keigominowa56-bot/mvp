'use client';
import useSWR from 'swr';
import { schedulePost, listScheduledPosts, cancelScheduledPost, adminFetchUsers } from '../../../lib/api-extended';
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';

export default function AdminScheduledPostsPage() {
  const { isAdmin } = useAuth();
  const { data: scheduled, mutate } = useSWR(isAdmin ? ['scheduledPosts'] : null, () => listScheduledPosts());
  const { data: politicians } = useSWR(isAdmin ? ['adminPoliticiansForSchedule'] : null, () => adminFetchUsers({ role: 'politician', page: 1, pageSize: 300 }) as any);
  const [form, setForm] = useState({ authorId: '', title: '', body: '', tags: '', scheduledAt: '' });
  const [err, setErr] = useState<string|null>(null);
  const [msg, setMsg] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみ</div>;

  async function onSchedule(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null);
    try {
      await schedulePost({
        authorId: form.authorId || undefined,
        title: form.title || undefined,
        body: form.body,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        scheduledAt: form.scheduledAt,
      });
      setForm({ authorId: '', title: '', body: '', tags: '', scheduledAt: '' });
      setMsg('予約しました');
      mutate();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">投稿予約</h1>
      <div className="card">
        <form onSubmit={onSchedule} className="space-y-2 text-sm">
          <select className="border rounded px-2 py-1 w-full" value={form.authorId} onChange={(e) => setForm(f => ({ ...f, authorId: e.target.value }))}>
            <option value="">運営名義</option>
            {politicians?.items?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name || p.email}</option>
            ))}
          </select>
            <input className="border rounded px-2 py-1 w-full" placeholder="タイトル（任意）" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea className="border rounded px-2 py-1 w-full min-h-[120px]" placeholder="本文" value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} />
          <input className="border rounded px-2 py-1 w-full" placeholder="タグ（カンマ区切り 任意）" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} />
          <input className="border rounded px-2 py-1 w-full" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
          {msg && <div className="text-xs text-green-600">{msg}</div>}
          {err && <div className="text-xs text-red-600">{err}</div>}
          <button className="px-3 py-2 border rounded text-sm">予約</button>
        </form>
      </div>
      <div className="card space-y-2 text-xs">
        <h2 className="font-medium text-sm">予約一覧</h2>
        {!scheduled && <div>読み込み中...</div>}
        {scheduled?.map((sp: any) => (
          <div key={sp.id} className="border rounded p-2 flex flex-col gap-1">
            <div>ID: {sp.id}</div>
            <div>authorId: {sp.authorId}</div>
            <div>status: {sp.status}</div>
            <div>scheduledAt: {sp.scheduledAt}</div>
            {sp.failureReason && <div className="text-red-600">失敗: {sp.failureReason}</div>}
            {sp.status === 'scheduled' && (
              <button className="border rounded px-2 py-1 w-fit" onClick={async () => {
                await cancelScheduledPost(sp.id);
                mutate();
              }}>キャンセル</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}