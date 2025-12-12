'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchFeed,
  votePost,
  Post,
} from '../../lib/api';
import CommentsSection from '../../components/CommentsSection';
import ReportButton from '../../components/ReportButton';
import { useSearchParams } from 'next/navigation';

type FeedFilters = {
  type?: 'activity' | 'pledge' | 'question' | 'news';
  region?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export default function FeedPage() {
  const params = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filters: FeedFilters = useMemo(() => ({
    type: (params.get('type') || undefined) as FeedFilters['type'],
    region: params.get('region') || undefined,
    q: params.get('q') || undefined,
    limit: 20,
  }), [params]);

  async function loadFeed(filters: FeedFilters) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeed(filters);
      setPosts(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.type, filters.region, filters.q, filters.page, filters.limit]);

  async function onVote(postId: string, choice: 'agree' | 'disagree') {
    try {
      await votePost(postId, choice);
      loadFeed(filters);
      alert('投票しました');
    } catch (e: any) {
      alert(e?.message || '投票に失敗しました');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {loading && <div className="bg-white border rounded p-4">読み込み中…</div>}
      {error && <div className="bg-red-50 border border-red-300 text-red-700 rounded p-4">{error}</div>}

      {!loading && !error && posts.map((p) => (
        <article key={p.id} className="bg-white border rounded p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <div className="text-xs text-gray-500">{p.type}</div>
            </div>
            <ReportButton targetId={p.id} targetType="post" />
          </div>

          <p className="mt-3 whitespace-pre-wrap">{p.content}</p>

          <div className="mt-3 flex items-center gap-2">
            <button className="rounded bg-green-600 text-white px-3 py-1" onClick={() => onVote(p.id, 'agree')}>
              賛成 {p.agreeCount ?? 0}
            </button>
            <button className="rounded bg-red-600 text-white px-3 py-1" onClick={() => onVote(p.id, 'disagree')}>
              反対 {p.disagreeCount ?? 0}
            </button>
            <span className="text-sm text-gray-600">コメント {p.commentCount ?? 0}</span>
          </div>

          <div className="mt-4">
            <CommentsSection postId={p.id} />
          </div>
        </article>
      ))}
    </div>
  );
}