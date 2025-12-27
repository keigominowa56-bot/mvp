'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useComments } from '../../../../lib/hooks/useComments';
import { Comment, deleteComment, apiFetchWithAuth, unwrap, Post } from '../../../../lib/api';
import { useAuth } from '../../../../contexts/AuthContext';

type Props = { params: Promise<{ id: string }> };

function CommentItem({ comment, postId, onReply, addComment, mutate, currentUserId }: { comment: Comment; postId: string; onReply: (parentId: string, authorName: string) => void; addComment: (payload: { text: string; mediaIds?: string[]; mentions?: string[]; parentId?: string | null }) => Promise<void>; mutate: () => Promise<any>; currentUserId?: string | null }) {
  const [deleting, setDeleting] = useState(false);
  
  async function handleDelete() {
    if (!confirm('このコメントを削除しますか？')) return;
    setDeleting(true);
    try {
      await deleteComment(postId, comment.id);
      await mutate();
    } catch (e: any) {
      alert(e?.message || 'コメント削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  }
  
  const canDelete = currentUserId === comment.authorUserId;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addComment({ text: replyText, parentId: comment.id });
      setReplyText('');
      setShowReplyForm(false);
      await mutate();
    } catch (e: any) {
      alert(e?.message || '返信の送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="border rounded px-3 py-2">
      <div className="flex items-start gap-2">
        {/* プロフィール画像 */}
        {comment.author?.profileImageUrl ? (
          <img
            src={comment.author.profileImageUrl}
            alt={comment.author.name || comment.author.username || 'ユーザー'}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
            {(comment.author?.name || comment.author?.username || comment.authorUserId.slice(0, 1)).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-700">
              {comment.author?.name || comment.author?.username || 'ユーザー'}
            </span>
            {comment.author?.username ? (
              <span className="text-xs text-gray-500">@{comment.author.username}</span>
            ) : comment.authorUserId ? (
              <span className="text-xs text-gray-400">@{comment.authorUserId.slice(0, 8)}</span>
            ) : null}
            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
          <div className="whitespace-pre-wrap text-sm text-gray-800 mb-2">{comment.content}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowReplyForm(!showReplyForm);
                if (!showReplyForm) {
                  onReply(comment.id, comment.author?.name || 'ユーザー');
                }
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showReplyForm ? '返信をキャンセル' : '返信'}
            </button>
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deleting ? '削除中...' : '削除'}
              </button>
            )}
          </div>
          {showReplyForm && (
            <form onSubmit={handleReply} className="mt-2 flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1 text-sm"
                placeholder={`${comment.author?.name || 'ユーザー'}に返信...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                aria-label="返信入力"
              />
              <button
                className="rounded bg-blue-600 text-white px-3 py-1 text-sm"
                type="submit"
                disabled={submitting || !replyText.trim()}
                aria-disabled={submitting || !replyText.trim()}
              >
                {submitting ? '送信中...' : '送信'}
              </button>
            </form>
          )}
        </div>
      </div>
      {comment.children && comment.children.length > 0 && (
        <ul className="mt-3 ml-4 border-l-2 border-gray-200 pl-3 space-y-2">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} postId={postId} onReply={onReply} addComment={addComment} mutate={mutate} currentUserId={currentUserId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function CommentsPage({ params }: Props) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { comments, isLoading, error, addComment, mutate } = useComments(resolvedParams.id);
  const { user } = useAuth();
  const [text, setText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState<boolean>(true);
  const currentUserId = user?.id;

  // 投稿情報を取得
  useEffect(() => {
    async function loadPost() {
      try {
        setPostLoading(true);
        const res = await apiFetchWithAuth(`/api/posts/${resolvedParams.id}`, { method: 'GET' });
        if (res.ok) {
          const data = await unwrap<Post>(res);
          setPost(data);
        }
      } catch (err) {
        console.error('[CommentsPage] 投稿取得失敗:', err);
      } finally {
        setPostLoading(false);
      }
    }
    loadPost();
  }, [resolvedParams.id]);

  function extractMentions(input: string): string[] {
    const matches = input.match(/@([\w_]+)/g) || [];
    return matches.map((m) => m.slice(1));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mentions = extractMentions(text);
      await addComment({ text, mentions, parentId: replyingTo?.id || null });
      setText('');
      setReplyingTo(null);
      await mutate();
    } catch (e: any) {
      alert(e?.message || 'コメント送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReply(parentId: string, authorName: string) {
    setReplyingTo({ id: parentId, name: authorName });
    setText(`@${authorName} `);
  }

  return (
    <div className="bg-white border rounded p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-2"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold">コメント</h1>
      </div>

      {/* 投稿を一番上に表示（議員・運営の投稿を優先） */}
      {postLoading ? (
        <div className="text-sm text-gray-600 mb-4">投稿を読み込み中…</div>
      ) : post ? (
        <article className="bg-gray-50 border rounded p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            {post.author?.profileImageUrl ? (
              <img
                src={post.author.profileImageUrl}
                alt={post.author.name || 'ユーザー'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
                {(post.author?.name || post.authorUserId.slice(0, 1)).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {(post.author as any)?.role === 'politician' ? (
                  <Link href={`/politicians/${post.authorUserId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                    {post.author?.name || post.author?.username || '議員'}
                  </Link>
                ) : (post.author as any)?.role === 'admin' ? (
                  <Link href={`/users/${post.authorUserId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                    {post.author?.name || post.author?.username || '運営'}
                  </Link>
                ) : (
                  <Link href={`/users/${post.authorUserId}`} className="font-semibold text-gray-900 hover:text-blue-600">
                    {post.author?.name || post.author?.username || 'ユーザー'}
                  </Link>
                )}
                {post.author?.username ? (
                  <Link href={(post.author as any)?.role === 'politician' ? `/politicians/${post.authorUserId}` : `/users/${post.authorUserId}`} className="text-sm text-gray-500 hover:text-blue-600">
                    @{post.author.username}
                  </Link>
                ) : post.authorUserId ? (
                  <span className="text-sm text-gray-400">@{post.authorUserId.slice(0, 8)}</span>
                ) : null}
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-2">{post.title || post.type}</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        </article>
      ) : null}

      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          {replyingTo && (
            <div className="text-xs text-blue-600 flex items-center gap-2">
              <span>@{replyingTo.name}に返信中</span>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setText('');
                }}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}
          <textarea
            className="border rounded px-2 py-1 flex-1 min-h-[80px]"
            placeholder={replyingTo ? `${replyingTo.name}に返信...` : 'コメントを入力（@nickname でメンション）'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="コメント入力"
          />
        </div>
        <button
          className="rounded bg-blue-600 text-white px-4 py-2 h-fit"
          type="submit"
          disabled={submitting || !text.trim()}
          aria-disabled={submitting || !text.trim()}
        >
          {submitting ? '送信中...' : '送信'}
        </button>
      </form>

      {isLoading && <div className="text-sm text-gray-600">読み込み中…</div>}
      {error && <div className="text-sm text-red-700">コメント取得に失敗しました</div>}

      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <CommentItem key={c.id} comment={c} postId={resolvedParams.id} onReply={handleReply} addComment={addComment} mutate={mutate} currentUserId={currentUserId} />
        ))}
      </ul>

      {comments.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 py-8">
          コメントはまだありません
        </div>
      )}
    </div>
  );
}

