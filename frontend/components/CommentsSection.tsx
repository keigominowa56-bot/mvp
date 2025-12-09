'use client';
import { useState } from 'react';
import { useComments } from '../lib/hooks/useComments';

export default function CommentsSection({ targetId }: { targetId: string }) {
  const { comments, loading, error, add } = useComments({ targetId, enabled: !!targetId });
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await add(text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 12 }}>
      <h4 style={{ margin: '4px 0 12px' }}>コメント</h4>
      {loading && <p>読み込み中...</p>}
      {error && <p style={{ color: 'red' }}>読み込みエラー</p>}
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="コメントを書く..."
          style={{ flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 4 }}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          送信
        </button>
      </form>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {comments.map((c) => (
            <li key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 14 }}>
              <strong>{c.userId}</strong> <span style={{ color: '#64748b' }}>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 15 }}>{c.content}</div>
          </li>
        ))}
        {comments.length === 0 && !loading && <li style={{ color: '#64748b' }}>まだコメントはありません</li>}
      </ul>
    </div>
  );
}