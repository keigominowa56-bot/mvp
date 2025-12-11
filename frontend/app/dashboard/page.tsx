'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function DashboardPage() {
  const [postsSummary, setPostsSummary] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? getToken() : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/analytics/my/posts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPostsSummary);
  }, [token]);

  function downloadCsv() {
    if (!token) return;
    const a = document.createElement('a');
    a.href = `${API_BASE}/analytics/my/export.csv`;
    a.download = 'my-posts-summary.csv';
    a.click();
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">ダッシュボード</h1>
      <button className="rounded bg-gray-800 text-white px-3 py-1 w-fit" onClick={downloadCsv}>CSVダウンロード</button>
      <div className="grid gap-3">
        {postsSummary.map((p) => (
          <div key={p.postId} className="bg-white border rounded p-3">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-600">{p.type} / {new Date(p.createdAt).toLocaleString()}</div>
            <div className="mt-1">賛成: {p.votes.agree} / 反対: {p.votes.disagree} / コメント: {p.comments}</div>
          </div>
        ))}
      </div>
    </div>
  );
}