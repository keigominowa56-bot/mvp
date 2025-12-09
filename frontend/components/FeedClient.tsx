'use client';

import React from 'react';
import { usePosts } from '../lib/hooks/usePosts';
import PostCard from './PostCard';
import PostComposerSWR from './PostComposerSWR';

export default function FeedClient() {
  const { posts, isLoading, error } = usePosts();

  return (
    <div className="space-y-6">
      <PostComposerSWR />
      <h2 className="text-xl font-semibold">議員フィード（自動更新）</h2>

      {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {error && <p className="text-sm text-red-600">取得エラーが発生しました</p>}
      {!isLoading && posts.length === 0 && (
        <p className="text-sm text-gray-500">投稿がまだありません。</p>
      )}

      <div className="space-y-4">
        {posts.map(p => (
          <PostCard
            key={p.id}
            id={p.id}
            body={p.body}
            media={p.media}
            createdAt={p.createdAt}
          />
        ))}
      </div>

      <p className="text-[10px] text-gray-400">
        ※ 15秒ごとに自動更新 / フォーカス復帰時も再取得します
      </p>
    </div>
  );
}