'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { fetchPostById, updatePost } from '../../../../lib/api.posts-edit-snippet';
import { softDeletePost, restorePost } from '../../../../lib/api.posts-manage-snippet';

export default function PostEditPage() {
  const { ready, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [postCategory, setPostCategory] = useState<'policy' | 'activity'>('activity');
  const [visibility, setVisibility] = useState<'public' | 'hidden'>('public');
  const [regionPref, setRegionPref] = useState('');
  const [regionCity, setRegionCity] = useState('');
  const [deletedAt, setDeletedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    if (ready && isLoggedIn) {
      (async () => {
        setLoading(true);
        try {
          const p = await fetchPostById(id);
          setTitle(p.title || '');
          setBody(p.body);
          setPostCategory(p.postCategory);
          setVisibility(p.hidden ? 'hidden' : 'public');
          setRegionPref(p.regionPref || '');
          setRegionCity(p.regionCity || '');
          setDeletedAt((p as any).deletedAt || null);
        } catch (e: any) {
          setErr(e?.response?.data?.message || e.message || '読み込みに失敗しました');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [ready, isLoggedIn, id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await updatePost(id, {
        title: title || undefined,
        body,
        postCategory,
        visibility,
        regionPref: regionPref || undefined,
        regionCity: regionCity || undefined,
      });
      alert('更新しました');
      router.push('/feed');
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message || '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm('この投稿を非表示(論理削除)にしますか？')) return;
    try {
      const p = await softDeletePost(id);
      setDeletedAt((p as any).deletedAt || new Date().toISOString());
      alert('論理削除しました');
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || '削除に失敗しました');
    }
  }

  async function onRestore() {
    try {
      const p = await restorePost(id);
      setDeletedAt((p as any).deletedAt || null);
      alert('復元しました');
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || '復元に失敗しました');
    }
  }

  if (!ready) return <div className="p-4 text-sm text-slate-500">読み込み中...</div>;
  if (!isLoggedIn) return <div className="p-4 text-sm text-slate-500">ログインしてください</div>;
  if (user?.role !== 'admin' && user?.role !== 'politician')
    return <div className="p-4 text-sm text-red-600">権限がありません</div>;

  if (loading) return <div className="p-4 text-sm">投稿読み込み中...</div>;
  if (err) return <div className="p-4 text-sm text-red-600">{err}</div>;

  return (
    <div className="p-4 space-y-4 max-w-2xl">
      <h1 className="text-lg font-semibold">投稿編集</h1>
      {deletedAt && (
        <div className="text-xs text-red-700 border border-red-300 p-2 rounded">
          この投稿は論理削除されています（deletedAt: {new Date(deletedAt).toLocaleString()}）
        </div>
      )}
      <form onSubmit={onSave} className="space-y-3 border rounded p-3">
        <div className="flex gap-2">
          <select className="border px-2 py-1" value={postCategory} onChange={(e) => setPostCategory(e.target.value as any)}>
            <option value="activity">活動報告</option>
            <option value="policy">政策</option>
          </select>
          <select className="border px-2 py-1" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
            <option value="public">公開</option>
            <option value="hidden">非公開</option>
          </select>
        </div>

        <input className="border px-2 py-1 w-full" placeholder="タイトル（任意）" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="border px-2 py-1 w-full" rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder="本文" />
        <div className="flex gap-2">
          <input className="border px-2 py-1" placeholder="都道府県" value={regionPref} onChange={(e) => setRegionPref(e.target.value)} />
          <input className="border px-2 py-1" placeholder="市区町村" value={regionCity} onChange={(e) => setRegionCity(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <button className="border px-3 py-2 rounded disabled:opacity-50" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </button>
          {!deletedAt ? (
            <button type="button" className="border px-3 py-2 rounded text-red-700" onClick={onDelete}>
              論理削除
            </button>
          ) : (
            <button type="button" className="border px-3 py-2 rounded" onClick={onRestore}>
              復元
            </button>
          )}
        </div>
      </form>
    </div>
  );
}