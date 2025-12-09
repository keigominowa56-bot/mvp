'use client';
import { useEffect, useState } from 'react';
import { fetchPostSegments, Segments } from '../lib/api';

export default function SegmentsPanel({ postId, from, to }: { postId: string; from?: string; to?: string }) {
  const [data, setData] = useState<Segments | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchPostSegments(postId, { from, to })
      .then((d) => setData(d))
      .catch((e) => setErr(e?.response?.data?.message || e.message || '取得に失敗しました'))
      .finally(() => setLoading(false));
  }, [postId, from, to]);

  if (loading) return <div className="text-sm text-slate-600">セグメント読み込み中…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!data) return null;

  const renderTable = (obj: Record<string, { support: number; oppose: number; total: number }>) => {
    const entries = Object.entries(obj).sort((a, b) => b[1].total - a[1].total).slice(0, 20);
    return (
      <table className="w-full text-sm border">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-2 border-b">キー</th>
            <th className="text-right p-2 border-b">賛成</th>
            <th className="text-right p-2 border-b">反対</th>
            <th className="text-right p-2 border-b">合計</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k}>
              <td className="p-2 border-b">{k}</td>
              <td className="p-2 border-b text-right">{v.support}</td>
              <td className="p-2 border-b text-right">{v.oppose}</td>
              <td className="p-2 border-b text-right">{v.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-4 mt-3">
      <div>
        <h4 className="font-medium mb-1">都道府県別</h4>
        {renderTable(data.byPref)}
      </div>
      <div>
        <h4 className="font-medium mb-1">市区町村別（上位20）</h4>
        {renderTable(data.byCity)}
      </div>
      <div>
        <h4 className="font-medium mb-1">年齢帯別</h4>
        {renderTable(data.byAge)}
      </div>
    </div>
  );
}