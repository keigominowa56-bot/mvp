'use client';
import useSWR from 'swr';
import { adminListReports, adminUpdateReportStatus, adminActionReport } from '../../../lib/api-extended';
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';

export default function AdminReportsPage() {
  const { isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const { data, mutate } = useSWR(isAdmin ? ['reports', statusFilter] : null, () => adminListReports({ status: statusFilter || undefined }));
  const [err, setErr] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみアクセス可能</div>;

  async function changeStatus(id: string, status: string) {
    setErr(null);
    try {
      await adminUpdateReportStatus(id, status);
      mutate();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function action(id: string, action: string) {
    setErr(null);
    try {
      await adminActionReport(id, action as any);
      mutate();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">通報管理</h1>
      <div className="flex gap-2 text-sm">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-2 py-1">
          <option value="">全ステータス</option>
          <option value="open">open</option>
          <option value="reviewing">reviewing</option>
          <option value="resolved">resolved</option>
          <option value="dismissed">dismissed</option>
          <option value="actioned">actioned</option>
        </select>
        <button className="border rounded px-2 py-1" onClick={() => mutate()}>更新</button>
      </div>
      {err && <div className="text-xs text-red-600">{err}</div>}
      <div className="card space-y-2 text-xs">
        {!data && <div>読み込み中...</div>}
        {data?.length === 0 && <div>通報なし</div>}
        {data?.map((r: any) => (
          <div key={r.id} className="border rounded p-2 space-y-1">
            <div className="font-semibold">{r.targetType} : {r.targetId}</div>
            <div>カテゴリ: {r.reasonCategory}</div>
            <div>本文: {r.reasonText || '(なし)'}</div>
            <div>status: {r.status}</div>
            <div className="flex gap-2 flex-wrap">
              {['open','reviewing','resolved','dismissed','actioned'].map(s => (
                <button key={s} className="border rounded px-2 py-1" onClick={() => changeStatus(r.id, s)}>{s}</button>
              ))}
              {r.targetType === 'user' && <button className="border rounded px-2 py-1" onClick={() => action(r.id,'ban-user')}>ban-user</button>}
              {r.targetType === 'post' && <button className="border rounded px-2 py-1" onClick={() => action(r.id,'hide-post')}>hide-post</button>}
              {r.targetType === 'comment' && <button className="border rounded px-2 py-1" onClick={() => action(r.id,'hide-comment')}>hide-comment</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}