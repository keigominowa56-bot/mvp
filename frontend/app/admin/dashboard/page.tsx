'use client';

import { useEffect, useState } from 'react';
import { fetchPostsSummary, fetchPostsTimeseries } from '../../../lib/api.analytics-snippet';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<{ total: number; policy: number; activity: number } | null>(null);
  const [series, setSeries] = useState<{ date: string; total: number; policy: number; activity: number }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchPostsSummary();
        const t = await fetchPostsTimeseries(days);
        setSummary(s);
        setSeries(t);
      } catch (e: any) {
        setErr(e?.response?.data?.message || e.message || '取得に失敗しました');
      }
    })();
  }, [days]);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-semibold">ダッシュボード</h1>
      {err && <div className="text-sm text-red-700">{err}</div>}

      <div className="grid grid-cols-3 gap-3">
        <StatCard title="投稿総数" value={summary?.total ?? '-'} />
        <StatCard title="政策(Policy)" value={summary?.policy ?? '-'} />
        <StatCard title="活動(Activity)" value={summary?.activity ?? '-'} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="font-medium">日別推移</h2>
          <select className="border px-2 py-1 text-sm" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7日</option>
            <option value={14}>14日</option>
            <option value={30}>30日</option>
            <option value={60}>60日</option>
          </select>
        </div>
        <SimpleChart data={series} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-slate-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function SimpleChart({ data }: { data: { date: string; total: number; policy: number; activity: number }[] }) {
  // シンプルなSVGラインチャート（外部ライブラリ無し）
  const width = 800;
  const height = 220;
  const padding = 30;

  const totals = data.map((d) => d.total);
  const maxY = Math.max(1, ...totals);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const toY = (v: number) => height - padding - (v / maxY) * (height - padding * 2);

  const pathFor = (key: 'total' | 'policy' | 'activity') => {
    return data
      .map((d, i) => {
        const x = padding + i * stepX;
        const y = toY(d[key]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="overflow-x-auto border rounded">
      <svg width={width} height={height}>
        {/* 軸 */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />

        {/* 総数 */}
        <path d={pathFor('total')} stroke="#1e40af" fill="none" strokeWidth={2} />
        {/* policy */}
        <path d={pathFor('policy')} stroke="#059669" fill="none" strokeWidth={2} />
        {/* activity */}
        <path d={pathFor('activity')} stroke="#dc2626" fill="none" strokeWidth={2} />

        {/* 凡例 */}
        <Legend items={[{ c: '#1e40af', t: 'total' }, { c: '#059669', t: 'policy' }, { c: '#dc2626', t: 'activity' }]} />
      </svg>
    </div>
  );
}

function Legend({ items }: { items: { c: string; t: string }[] }) {
  return (
    <g>
      {items.map((it, i) => (
        <g key={it.t} transform={`translate(${20 + i * 100}, 10)`}>
          <rect width={12} height={12} fill={it.c} />
          <text x={18} y={11} fontSize={12} fill="#333">
            {it.t}
          </text>
        </g>
      ))}
    </g>
  );
}