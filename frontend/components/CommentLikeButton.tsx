'use client';
import { useEffect, useState } from 'react';
import { likeComment, unlikeComment, isCommentLiked, getCommentLikesCount } from '../lib/api-extended';
import { useAuth } from '../contexts/AuthContext';

export default function CommentLikeButton({ commentId }: { commentId: string }) {
  const { isLoggedIn } = useAuth();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number>(0);

  async function load() {
    const [likedRes, countRes] = await Promise.all([isCommentLiked(commentId), getCommentLikesCount(commentId)]);
    setLiked(likedRes.liked);
    setCount(countRes.count);
  }

  useEffect(() => {
    load().catch(console.error);
  }, [commentId]);

  async function toggle() {
    if (!isLoggedIn) return;
    if (liked) {
      await unlikeComment(commentId);
    } else {
      await likeComment(commentId);
    }
    load();
  }

  return (
    <button
      disabled={!isLoggedIn}
      onClick={toggle}
      className={`text-xs px-2 py-1 border rounded ${liked ? 'bg-blue-50 border-blue-400' : ''}`}
      title={isLoggedIn ? 'コメントをいいね' : 'ログインが必要です'}
    >
      👍 {count}
    </button>
  );
}