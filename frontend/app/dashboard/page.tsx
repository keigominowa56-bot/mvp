'use client';
import useSWR from 'swr';
import { fetchMyPostsWithStats, PostWithStats, SortKey, Order, fetchPostSegments } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import SegmentsPanel from '../../components/SegmentsPanel';
import SupportOpposeChart from '../../components/SupportOpposeChart';

function formatDate(d: Date) {
  return d.toISOString().slice(0,10);
}

export default function DashboardPage() {
  const { isLoggedIn, user } = useAuth();
  const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
  const [presetRange, setPresetRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sort, setSort] = useState<SortKey>('createdAt');
  const [order, setOrder] = useState<Order>('desc');

  const { from, to } = useMemo(() => {
    if (rangeMode === 'custom' && customFrom && customTo) {
      return { from: customFrom, to: customTo };
    }
    if (presetRange === 'all') return { from: undefined, to: undefined };
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (presetRange === '7d' ? 7 : 30));
    return { from: formatDate(start), to: formatDate(end) };
  }, [rangeMode, presetRange, customFrom, customTo]);

  const { data, error, isLoading, mutate } = useSWR<PostWithStats[]>(
    isLoggedIn && user?.role === 'politician' ? ['/analytics/my-posts', from, to, sort, order] : null,
    () => fetchMyPostsWithStats({ from, to, sort, order }),
  );

  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [segmentError, setSegmentError] = useState<string | null>(null);

  // 簡易チャートポイント（投稿ごとの support/oppose を createdAt 日付軸で並べる）
  const chartPoints = useMemo(() => {
    return (data ?? []).map(d => ({
      date: d.post.createdAt.slice(0,10),
      support: d.stats.support,
      oppose: d.stats.oppose,
    })).sort((a,b) => a.date.localeCompare(b.date));
  }, [data]);

  if (!isLoggedIn) return <div className="mt-8">ダッシュボードを見るにはログインしてください。</div>;
  if (user?.role !== 'politician') return <div className="mt-8">政治家のみがアクセスできます。</div>;
  if (isLoading) return <div className="mt-8">読み込み中…</div>;
  if (error) return <div className="mt-8 text-red-600">読み込みに失敗しました</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">ダッシュボード</h1>

      <div className="card space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm">
            <span>期間モード:</span>
            <select value={rangeMode} onChange={(e) => setRangeMode(e.target.value as any)} className="border rounded px-2 py-1">
              <option value="preset">プリセット</option>
              <option value="custom">任意</option>
            </select>
          </div>
          {rangeMode === 'preset' && (
            <select value={presetRange} onChange={(e) => setPresetRange(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="7d">直近7日</option>
              <option value="30d">直近30日</option>
              <option value="all">全期間</option>
            </select>
          )}
          {rangeMode === 'custom' && (
            <div className="flex items-center gap-2 text-sm">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="border rounded px-2 py-1" />
              <span>〜</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="border rounded px-2 py-1" />
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span>並び:</span>
            <select className="border rounded px-2 py-1" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="createdAt">作成日</option>
              <option value="support">賛成数</option>
              <option value="oppose">反対数</option>
              <option value="total">合計</option>
            </select>
            <select className="border rounded px-2 py-1" value={order} onChange={(e) => setOrder(e.target.value as Order)}>
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>
          <button className="ml-auto text-sm px-3 py-1 rounded border" onClick={() => mutate()}>
            再読み込み
          </button>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-2">投稿ごとの賛成/反対推移（簡易）</h2>
          <SupportOpposeChart points={chartPoints} />
        </div>
      </div>

      {(data ?? []).length === 0 ? (
        <p className="text-slate-600">まだ投稿がありません。</p>
      ) : (
        <div className="space-y-3">
          {data!.map(({ post, stats }) => (
            <div key={post.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{post.title || '(無題の投稿)'}</div>
                  <div className="text-xs text-slate-500">ID: {post.id} / {post.createdAt.slice(0,10)}</div>
                </div>
                <div className="text-sm">
                  賛成 {stats.support} ・ 反対 {stats.oppose} ・ 合計 {stats.total}
                </div>
                <button
                  className="text-sm px-3 py-1 rounded border ml-3"
                  onClick={() => {
                    setOpenPostId(openPostId === post.id ? null : post.id);
                    setSegmentError(null);
                  }}
                >
                  {openPostId === post.id ? '閉じる' : '詳細'}
                </button>
                {openPostId === post.id && (
                  <a
                    href={`/analytics/posts/${post.id}/segments?${from ? `from=${from}&` : ''}${to ? `to=${to}&` : ''}format=csv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline ml-2"
                  >CSVダウンロード</a>
                )}
              </div>
              {openPostId === post.id && (
                <SegmentsPanel postId={post.id} from={from} to={to} />
              )}
              {segmentError && <p className="text-xs text-red-600">{segmentError}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}