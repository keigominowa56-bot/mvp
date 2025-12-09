'use client';

import React, { useState } from 'react';
import { usePosts } from '../lib/hooks/usePosts';

export default function PostComposerSWR() {
  const { addPost } = usePosts();
  const [body, setBody] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setDone(false);
    setLoading(true);
    try {
      const images = imagesText.split(',').map(v => v.trim()).filter(Boolean);
      await addPost(body, images);
      setBody('');
      setImagesText('');
      setDone(true);
    } catch (e: any) {
      setErr(e?.message || '投稿失敗');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="tw-card p-4 space-y-3 fade-in">
      <h3 className="text-sm font-semibold">新規投稿（自動反映）</h3>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        required
        placeholder="投稿本文を入力"
        className="w-full border rounded p-2 text-sm resize-y min-h-[80px]"
      />
      <input
        value={imagesText}
        onChange={e => setImagesText(e.target.value)}
        placeholder="画像名 (例: img1.png,img2.png) 空でも可"
        className="w-full border rounded p-2 text-sm"
      />
      {err && <div className="text-xs text-red-600">{err}</div>}
      {done && <div className="text-xs text-green-600">投稿反映しました</div>}
      <button
        disabled={loading || !body}
        className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? '送信中...' : '投稿する'}
      </button>
    </form>
  );
}