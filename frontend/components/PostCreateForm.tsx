'use client';
import { useState } from 'react';
import { createPost } from '../lib/api';

export default function PostCreateForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postCategory, setPostCategory] = useState<'policy' | 'activity'>('activity');
  const [visibility, setVisibility] = useState<'public' | 'hidden'>('public');
  const [regionPref, setRegionPref] = useState('');
  const [regionCity, setRegionCity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await createPost({
        title: title || undefined,
        body,
        postCategory,
        visibility,
        regionPref: regionPref || undefined,
        regionCity: regionCity || undefined,
      });
      alert('投稿しました');
      setTitle('');
      setBody('');
      setPostCategory('activity');
      setVisibility('public');
      setRegionPref('');
      setRegionCity('');
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || '投稿に失敗しました';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border rounded p-3">
      <div className="flex gap-2">
        <select
          className="border px-2 py-1"
          value={postCategory}
          onChange={(e) => setPostCategory(e.target.value as any)}
        >
          <option value="activity">活動報告</option>
          <option value="policy">政策</option>
        </select>
        <select
          className="border px-2 py-1"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as any)}
        >
          <option value="public">公開</option>
          <option value="hidden">非公開</option>
        </select>
      </div>

      {error && (
        <div className="text-xs text-red-600 whitespace-pre-line border border-red-300 p-2 rounded">
          {error}
        </div>
      )}

      <input
        className="border px-2 py-1 w-full"
        placeholder="タイトル（任意）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border px-2 py-1 w-full"
        placeholder="本文"
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className="border px-2 py-1"
          placeholder="都道府県（任意）"
          value={regionPref}
          onChange={(e) => setRegionPref(e.target.value)}
        />
        <input
          className="border px-2 py-1"
          placeholder="市区町村（任意）"
          value={regionCity}
          onChange={(e) => setRegionCity(e.target.value)}
        />
      </div>
      <button
        className="border px-3 py-2 rounded disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? '投稿中...' : '投稿'}
      </button>
    </form>
  );
}