'use client';
import { useState } from 'react';
import api, { unwrap } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';

export default function AdminCreatePoliticianPage() {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    kana: '',
    party: '',
    constituency: '',
    termCount: '',
    xHandle: '',
    instagramHandle: '',
    facebookUrl: '',
    youtubeUrl: '',
    websiteUrl: '',
  });
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみアクセス可能です。</div>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      const res = await api.post('/admin/politicians', {
        email: form.email,
        password: form.password || undefined,
        name: form.name || undefined,
        kana: form.kana || undefined,
        party: form.party || undefined,
        constituency: form.constituency || undefined,
        termCount: form.termCount ? Number(form.termCount) : undefined,
        xHandle: form.xHandle || undefined,
        instagramHandle: form.instagramHandle || undefined,
        facebookUrl: form.facebookUrl || undefined,
        youtubeUrl: form.youtubeUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
      });
      const data = unwrap(res);
      setMsg(`登録しました: id=${data.id}, email=${data.email}`);
      setForm({ ...form, email: '', password: '' });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  function i(name: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [name]: value }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">議員登録（管理者専用）</h1>
      <form onSubmit={submit} className="space-y-2 text-sm">
        <input className="border rounded px-2 py-1 w-full" placeholder="メール" value={form.email} onChange={e => i('email', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="初期パスワード（任意）" value={form.password} onChange={e => i('password', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="氏名" value={form.name} onChange={e => i('name', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="ふりがな" value={form.kana} onChange={e => i('kana', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="党" value={form.party} onChange={e => i('party', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="選挙区" value={form.constituency} onChange={e => i('constituency', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="当選回数" value={form.termCount} onChange={e => i('termCount', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="Xハンドル" value={form.xHandle} onChange={e => i('xHandle', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="Instagram" value={form.instagramHandle} onChange={e => i('instagramHandle', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="Facebook URL" value={form.facebookUrl} onChange={e => i('facebookUrl', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="YouTube URL" value={form.youtubeUrl} onChange={e => i('youtubeUrl', e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="公式サイトURL" value={form.websiteUrl} onChange={e => i('websiteUrl', e.target.value)} />
        {msg && <div className="text-xs text-green-600">{msg}</div>}
        {err && <div className="text-xs text-red-600">{err}</div>}
        <button className="border rounded px-3 py-2">登録</button>
      </form>
    </div>
  );
}