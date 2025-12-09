'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchFeed, Post } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import CommentsSection from '../../components/CommentsSection';
import ReportButton from '../../components/ReportButton';
import PostCategoryBadge from '../../components/PostCategoryBadge';

type CategoryFilter = 'all' | 'policy' | 'activity';

export default function FeedPage() {
  const { isLoggedIn, ready } = useAuth();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');

  const headerTitle = useMemo(() => {
    if (category === 'policy') return 'フィード（政策のみ）';
    if (category === 'activity') return 'フィード（活動報告のみ）';
    return 'フィード';
  }, [category]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const params: any = { mode: 'followed_first', limit: 50 };
      if (category !== 'all') {
        params.category = category;
      }
      const data = await fetchFeed(params);
      setItems(data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || '取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ready && isLoggedIn) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isLoggedIn, category]);

  if (!ready) return <div className="text-sm text-slate-500">読み込み中...</div>;
  if (!isLoggedIn) return <div className="text-sm text-slate-500">ログインするとフィードが表示されます。</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{headerTitle}</h1>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded border text-sm ${category === 'all' ? 'bg-slate-800 text-white' : ''}`}
            onClick={() => setCategory('all')}
          >
            すべて
          </button>
          <button
            className={`px-3 py-1 rounded border text-sm ${category === 'policy' ? 'bg-blue-600 text-white border-blue-600' : ''}`}
            onClick={() => setCategory('policy')}
          >
            政策
          </button>
          <button
            className={`px-3 py-1 rounded border text-sm ${category === 'activity' ? 'bg-green-600 text-white border-green-600' : ''}`}
            onClick={() => setCategory('activity')}
          >
            活動報告
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-slate-500">読み込み中...</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <ul className="space-y-3">
        {items.map((p) => (
          <li key={p.id} className="card space-y-2 border rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PostCategoryBadge category={p.postCategory} />
                {p.hidden && (
                  <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">非公開</span>
                )}
              </div>
              {/* 右上に配置したい場合はこの位置に配置 */}
            </div>

            <div className="text-sm font-medium">{p.title || '(無題)'}</div>
            <div className="text-sm whitespace-pre-line">{p.body}</div>

            <div className="flex gap-2">
              <ReportButton targetType="post" targetId={p.id} />
            </div>

            <CommentsSection postId={p.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}