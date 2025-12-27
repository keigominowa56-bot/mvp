'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  fetchFeed,
  votePost,
  Post,
} from '../../lib/api';
import ReportButton from '../../components/ReportButton';
import FollowButton from '../../components/FollowButton';
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
      // デバッグ: author情報を確認
      if (process.env.NODE_ENV === 'development') {
        console.log('[Feed] Loaded posts:', data.length);
        data.forEach((p: Post) => {
          console.log(`[Feed] Post ${p.id}:`, {
            authorId: p.authorUserId,
            authorName: p.author?.name,
            authorUsername: p.author?.username,
            authorRole: (p.author as any)?.role,
            hasAuthor: !!p.author,
          });
        });
      }
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
      // 投票後、フィードを再読み込みして数字を更新
      await loadFeed(filters);
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
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 flex-1">
              {p.author?.profileImageUrl ? (
                <Link href={(p.author as any)?.role === 'politician' ? `/politicians/${p.authorUserId}` : `/users/${p.authorUserId}`}>
                  <img
                    src={p.author.profileImageUrl}
                    alt={p.author.name || 'ユーザー'}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80"
                  />
                </Link>
              ) : (
                <Link href={(p.author as any)?.role === 'politician' ? `/politicians/${p.authorUserId}` : `/users/${p.authorUserId}`}>
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold cursor-pointer hover:opacity-80">
                    {(p.author?.name || p.authorUserId.slice(0, 1)).toUpperCase()}
                  </div>
                </Link>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {(p.author as any)?.role === 'politician' ? (
                    <Link href={`/politicians/${p.authorUserId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {p.author?.name || p.author?.username || `議員${p.authorUserId.slice(0, 4)}`}
                    </Link>
                  ) : (p.author as any)?.role === 'admin' ? (
                    <Link href={`/users/${p.authorUserId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {p.author?.name || p.author?.username || `運営${p.authorUserId.slice(0, 4)}`}
                    </Link>
                  ) : (
                    <Link href={`/users/${p.authorUserId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {p.author?.name || p.author?.username || `ユーザー`}
                    </Link>
                  )}
                  {p.author?.username ? (
                    <Link href={(p.author as any)?.role === 'politician' ? `/politicians/${p.authorUserId}` : `/users/${p.authorUserId}`} className="text-sm text-gray-500 hover:text-blue-600">
                      @{p.author.username}
                    </Link>
                  ) : p.authorUserId ? (
                    <span className="text-sm text-gray-400">@{p.authorUserId.slice(0, 8)}</span>
                  ) : null}
                  <span className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {(p.author as any)?.role === 'politician' && (p.author as any)?.supportedPartyId && (
                    <span className="text-xs text-gray-500">
                      {(p.author as any).supportedPartyId === '1' ? '自民党' :
                       (p.author as any).supportedPartyId === '2' ? '立憲民主党' :
                       (p.author as any).supportedPartyId === '3' ? '日本維新の会' :
                       (p.author as any).supportedPartyId === '4' ? '公明党' :
                       (p.author as any).supportedPartyId === '5' ? '共産党' :
                       (p.author as any).supportedPartyId === '6' ? '国民民主党' :
                       (p.author as any).supportedPartyId === '7' ? 'れいわ新選組' :
                       (p.author as any).supportedPartyId === '8' ? '社民党' :
                       (p.author as any).supportedPartyId === '9' ? '無所属' : '無所属'}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {p.type === 'activity' ? '政治活動' :
                     p.type === 'pledge' ? '公約' :
                     p.type === 'question' ? '質問' :
                     p.type === 'news' ? 'ニュース' : p.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(p.author as any)?.role === 'politician' && (
                <FollowButton userId={p.authorUserId} />
              )}
              <ReportButton targetId={p.id} targetType="post" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              {p.type === 'activity' ? '政治活動' :
               p.type === 'pledge' ? '公約' :
               p.type === 'question' ? '質問' :
               p.type === 'news' ? 'ニュース' : p.type}
            </h2>
            <p className="whitespace-pre-wrap text-gray-800">{p.content}</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button className="rounded bg-green-600 text-white px-3 py-1" onClick={() => onVote(p.id, 'agree')}>
              賛成 {p.agreeCount ?? 0}
            </button>
            <button className="rounded bg-red-600 text-white px-3 py-1" onClick={() => onVote(p.id, 'disagree')}>
              反対 {p.disagreeCount ?? 0}
            </button>
            <Link href={`/posts/${p.id}/comments`} className="text-sm text-blue-600 hover:text-blue-800">
              コメント {p.commentCount ?? 0}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}