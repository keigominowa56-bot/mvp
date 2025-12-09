'use client';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import useSWR from 'swr';
import { fetchVoteStats, getUserVote, castVote, updateVote, VoteType, VoteStats, UserVote } from '../lib/api';

export default function VoteButtons({ postId }: { postId: string }) {
  const { isLoggedIn, isUser } = useAuth();
  const { data: stats, isLoading: statsLoading, mutate: mutateStats } = useSWR<VoteStats>(
    postId ? ['/votes/stats', postId] : null,
    () => fetchVoteStats(postId),
  );
  const { data: myVote, isLoading: voteLoading, mutate: mutateMyVote } = useSWR<UserVote | null>(
    postId ? ['/votes/me', postId] : null,
    () => getUserVote(postId),
  );

  const [pending, setPending] = useState<VoteType | null>(null);

  const disabled = !isLoggedIn || !isUser || !!pending || statsLoading || voteLoading;

  async function onClick(type: VoteType) {
    if (disabled) return;
    setPending(type);
    try {
      if (!myVote) {
        await castVote(postId, type);
      } else if (myVote.type !== type) {
        await updateVote(postId, type);
      } else {
        // 同じボタンを再押下は何もしない（必要なら取消APIを作る）
      }
      await Promise.all([mutateStats(), mutateMyVote()]);
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || '投票に失敗しました');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 text-sm rounded border bg-white hover:bg-slate-50 disabled:opacity-50 ${myVote?.type === 'support' ? 'border-green-600 text-green-700' : ''}`}
          disabled={disabled}
          onClick={() => onClick('support')}
          aria-pressed={myVote?.type === 'support'}
        >
          {pending === 'support' ? '送信中…' : '賛成'}
        </button>
        <button
          className={`px-3 py-1 text-sm rounded border bg-white hover:bg-slate-50 disabled:opacity-50 ${myVote?.type === 'oppose' ? 'border-red-600 text-red-700' : ''}`}
          disabled={disabled}
          onClick={() => onClick('oppose')}
          aria-pressed={myVote?.type === 'oppose'}
        >
          {pending === 'oppose' ? '送信中…' : '反対'}
        </button>
      </div>
      <div className="text-xs text-slate-600">
        {statsLoading ? '集計読み込み中…' : (
          <span>賛成 {stats?.support ?? 0}・反対 {stats?.oppose ?? 0}</span>
        )}
      </div>
      {!isLoggedIn && <span className="text-xs text-slate-500">ログインが必要です</span>}
      {isLoggedIn && !isUser && <span className="text-xs text-slate-500">投票はユーザーのみ</span>}
    </div>
  );
}