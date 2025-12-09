'use client';
import { usePosts } from '../lib/hooks/usePosts';
import { useState } from 'react';

export default function PostsList() {
  const { posts, loading, error, create, remove } = usePosts();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await create({ title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Posts</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
        <input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <textarea
          placeholder="本文"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          style={{ padding: 8, border: '1px solid #ccc', borderRadius: 4 }}
        />
        <button
          type="submit"
          disabled={sending}
          style={{ padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          {sending ? '送信中...' : '投稿'}
        </button>
      </form>

      {loading && <p>読み込み中...</p>}
      {error && <p style={{ color: 'red' }}>エラー: {String(error)}</p>}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
        {posts.map((p) => (
          <li key={p.id} style={{ padding: 12, border: '1px solid #e2e8f0', marginBottom: 12 }}>
            <h3 style={{ margin: '0 0 4px' }}>{p.title}</h3>
            <p style={{ margin: 0 }}>{p.body}</p>
            <small style={{ color: '#64748b' }}>{new Date(p.createdAt).toLocaleString()}</small>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => remove(p.id)}
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4 }}
              >
                削除
              </button>
            </div>
          </li>
        ))}
        {posts.length === 0 && !loading && <li style={{ color: '#64748b' }}>まだ投稿がありません</li>}
      </ul>
    </div>
  );
}