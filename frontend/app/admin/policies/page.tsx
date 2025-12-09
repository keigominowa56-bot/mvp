'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { adminFetchUsers } from '../../../lib/api';
import { fetchPolicies, createPolicy, updatePolicy } from '../../../lib/api-extended';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminPoliciesPage() {
  const { isAdmin } = useAuth();
  const { data: politicians } = useSWR(isAdmin ? ['adminUsersPoliticians'] : null, () => adminFetchUsers({ role: 'politician', page: 1, pageSize: 300 }));
  const [selectedPolitician, setSelectedPolitician] = useState('');
  const { data: policies, mutate } = useSWR(selectedPolitician ? ['policies', selectedPolitician] : null, () => fetchPolicies(selectedPolitician));
  const [form, setForm] = useState({ title: '', description: '', category: '', status: 'pending' });
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみアクセス可能です。</div>;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      await createPolicy(selectedPolitician, form);
      setForm({ title: '', description: '', category: '', status: 'pending' });
      mutate();
      setMsg('公約を追加しました');
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function onStatus(id: string, status: string) {
    await updatePolicy(id, { status });
    mutate();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">公約管理</h1>
      <div className="card space-y-3">
        <select
          className="border rounded px-3 py-2 text-sm w-full"
          value={selectedPolitician}
          onChange={(e) => setSelectedPolitician(e.target.value)}
        >
          <option value="">政治家を選択</option>
          {politicians?.items?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name || p.email}</option>
          ))}
        </select>

        {selectedPolitician && (
          <form onSubmit={onCreate} className="space-y-2 text-sm">
            <input className="border rounded px-2 py-1 w-full" placeholder="タイトル" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="border rounded px-2 py-1 w-full min-h-[120px]" placeholder="説明" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <input className="border rounded px-2 py-1 w-full" placeholder="カテゴリ" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
            <select className="border rounded px-2 py-1 w-full" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="pending">pending</option>
              <option value="in-progress">in-progress</option>
              <option value="achieved">achieved</option>
              <option value="abandoned">abandoned</option>
            </select>
            {msg && <div className="text-green-600 text-xs">{msg}</div>}
            {err && <div className="text-red-600 text-xs">{err}</div>}
            <button className="px-3 py-2 border rounded text-sm">追加</button>
          </form>
        )}
      </div>
      <div className="card space-y-2">
        <h2 className="font-medium text-sm">公約一覧</h2>
        {!policies && selectedPolitician && <div className="text-xs">読み込み中...</div>}
        {policies?.map((p: any) => (
          <div key={p.id} className="border rounded p-2 text-xs space-y-1">
            <div className="font-semibold">{p.title}</div>
            <div className="text-slate-600">{p.description || '(説明なし)'}</div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]">status: {p.status}</span>
              <select
                className="border rounded px-1 py-0.5 text-[10px]"
                value={p.status}
                onChange={(e) => onStatus(p.id, e.target.value)}
              >
                <option value="pending">pending</option>
                <option value="in-progress">in-progress</option>
                <option value="achieved">achieved</option>
                <option value="abandoned">abandoned</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}