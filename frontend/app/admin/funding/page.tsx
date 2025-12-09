'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { adminFetchUsers } from '../../../lib/api';
import { fetchFundingRecords, fetchFundingSummary, createFundingRecord } from '../../../lib/api-extended';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminFundingPage() {
  const { isAdmin } = useAuth();
  const { data: politicians } = useSWR(isAdmin ? ['adminUsersPoliticiansFunding'] : null, () => adminFetchUsers({ role: 'politician', page: 1, pageSize: 300 }));
  const [selectedPolitician, setSelectedPolitician] = useState('');
  const { data: records, mutate: mutateRecords } = useSWR(selectedPolitician ? ['fundingRecords', selectedPolitician] : null, () => fetchFundingRecords(selectedPolitician));
  const { data: summary, mutate: mutateSummary } = useSWR(selectedPolitician ? ['fundingSummary', selectedPolitician] : null, () => fetchFundingSummary(selectedPolitician));
  const [form, setForm] = useState({ amount: '', category: '', description: '', date: '' });
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみアクセス可能です。</div>;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      await createFundingRecord(selectedPolitician, {
        amount: Number(form.amount),
        category: form.category || undefined,
        description: form.description || undefined,
        date: form.date || undefined,
      });
      setForm({ amount: '', category: '', description: '', date: '' });
      mutateRecords(); mutateSummary();
      setMsg('資金記録を追加しました');
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">政治資金管理</h1>
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
            <input className="border rounded px-2 py-1 w-full" placeholder="金額 (円)" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} />
            <input className="border rounded px-2 py-1 w-full" placeholder="カテゴリ" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
            <input className="border rounded px-2 py-1 w-full" placeholder="日付 (YYYY-MM-DD 任意)" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            <textarea className="border rounded px-2 py-1 w-full min-h-[80px]" placeholder="説明 (任意)" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            {msg && <div className="text-xs text-green-600">{msg}</div>}
            {err && <div className="text-xs text-red-600">{err}</div>}
            <button className="px-3 py-2 border rounded text-sm">追加</button>
          </form>
        )}
      </div>
      {summary && (
        <div className="card space-y-2 text-xs">
          <div className="font-medium">サマリ: 合計 {summary.total} 円</div>
          <ul>
            {Object.entries(summary.byCategory).map(([cat, amt]) => (
              <li key={cat}>{cat}: {amt} 円</li>
            ))}
          </ul>
        </div>
      )}
      <div className="card space-y-2">
        <h2 className="font-medium text-sm">記録一覧</h2>
        {!records && selectedPolitician && <div className="text-xs">読み込み中...</div>}
        <ul className="space-y-1 text-xs">
          {records?.map((r: any) => (
            <li key={r.id} className="flex justify-between border rounded px-2 py-1">
              <span>{r.date} {r.category || 'その他'}</span>
              <span>{r.amount} 円</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}