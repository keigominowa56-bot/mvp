'use client';

import { useState } from 'react';
import { useComments } from '../lib/hooks/useComments';

type Props = { postId: string };

export default function CommentsSection({ postId }: Props) {
  const { comments, isLoading, error, addComment } = useComments(postId);
  const [text, setText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  function extractMentions(input: string): string[] {
    const matches = input.match(/@([\w_]+)/g) || [];
    return matches.map((m) => m.slice(1));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mentions = extractMentions(text);
      await addComment({ text, mentions });
      setText('');
    } catch (e: any) {
      alert(e?.message || 'コメント送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="コメントを入力（@nickname でメンション）"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="コメント入力"
        />
        <button
          className="rounded bg-blue-600 text-white px-3 py-1"
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
        >
          {submitting ? '送信中...' : '送信'}
        </button>
      </form>

      {isLoading && <div className="text-sm text-gray-600">読み込み中…</div>}
      {error && <div className="text-sm text-red-700">コメント取得に失敗しました</div>}

      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <li key={c.id} className="border rounded px-2 py-1">
            <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
            <div className="whitespace-pre-wrap">{c.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}