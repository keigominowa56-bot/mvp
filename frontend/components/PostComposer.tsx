'use client';
import { useState } from 'react';
import { createPost } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function PostComposer({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isPolitician, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="card">
        <p className="text-sm">投稿作成は <a className="text-brand-600 hover:underline" href="/login">ログイン</a> が必要です。</p>
      </div>
    );
  }

  if (!isPolitician) {
    return (
      <div className="card">
        <p className="text-sm">投稿できるのは政治家アカウントのみです。</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createPost({
        title: title.trim(),
        body: body.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setTitle('');
      setBody('');
      setTags('');
      onCreated?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white border rounded-md p-4 shadow-sm">
      <h3 className="font-semibold text-slate-800 text-sm">新規投稿（政治家のみ）</h3>
      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="タイトル（任意）" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2 text-sm" rows={4} placeholder="本文" value={body} onChange={(e) => setBody(e.target.value)} />
      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="タグ (カンマ区切り/任意)" value={tags} onChange={(e) => setTags(e.target.value)} />
      {error && <p className="text-red-600 text-xs">{error}</p>}
      <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium rounded bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">
        {loading ? '送信中...' : '投稿'}
      </button>
    </form>
  );
}