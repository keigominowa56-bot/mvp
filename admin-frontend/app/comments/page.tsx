'use client';
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type Comment = {
  id: string;
  postId: string;
  postTitle: string;
  content: string;
  author: string;
  authorUserId: string;
  createdAt: string;
  parentId?: string | null;
  children?: Comment[];
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<{ id: string; postId: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setComments(Array.isArray(data) ? data.map((c: any) => ({
          id: c.id,
          postId: c.post?.id || c.postId,
          postTitle: c.post?.title || '投稿が見つかりません',
          content: c.content,
          author: c.author?.name || c.authorUserId?.slice(0, 8) || 'ユーザー',
          authorUserId: c.authorUserId,
          createdAt: c.createdAt,
          parentId: c.parentId,
          children: c.children || [],
        })) : []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMsg(errorData.message || 'コメントの取得に失敗しました');
      }
    } catch (err) {
      console.error('コメント読み込みエラー:', err);
      setMsg('コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleReply(commentId: string, postId: string) {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        return;
      }

      const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: replyText,
          parentId: commentId,
        }),
      });

      if (res.ok) {
        setReplyText('');
        setReplyingTo(null);
        setMsg('返信を送信しました');
        await loadComments();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMsg(errorData.message || '返信の送信に失敗しました');
      }
    } catch (err) {
      console.error('返信エラー:', err);
      setMsg('返信の送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  function renderComment(comment: Comment, level = 0) {
    return (
      <div key={comment.id} className={`border rounded p-4 ${level > 0 ? 'ml-4 mt-2 bg-gray-50' : ''}`}>
        <div className="mb-2">
          <div className="font-bold text-lg text-gray-800">{comment.postTitle}</div>
          <div className="text-sm text-gray-600 mb-2">{comment.content}</div>
          <div className="text-xs text-gray-500">
            by {comment.author} - {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        
        {replyingTo?.id === comment.id ? (
          <div className="mt-3 space-y-2">
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="返信を入力..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleReply(comment.id, comment.postId)}
                disabled={submitting || !replyText.trim()}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm disabled:opacity-50"
              >
                {submitting ? '送信中...' : '送信'}
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setReplyingTo({ id: comment.id, postId: comment.postId })}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            返信する
          </button>
        )}

        {comment.children && comment.children.length > 0 && (
          <div className="mt-3 space-y-2">
            {comment.children.map((child) => renderComment(child as Comment, level + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">コメント返信</h1>
      {msg && (
        <div className={`mb-4 p-3 rounded ${msg.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-gray-500">コメントはありません</div>
        ) : (
          comments.map((c) => renderComment(c))
        )}
      </div>
    </div>
  );
}