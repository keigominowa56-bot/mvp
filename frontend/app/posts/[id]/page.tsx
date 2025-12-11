'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../../lib/api';
import { getToken } from '../../../lib/auth';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaIds, setMediaIds] = useState<string[]>([]);
  const token = typeof window !== 'undefined' ? getToken() : null;

  useEffect(() => {
    fetch(`${API_BASE}/posts/${params.id}`).then(r => r.json()).then(setPost);
    fetch(`${API_BASE}/posts/${params.id}/comments`).then(r => r.json()).then(setComments);
  }, [params.id]);

  async function onVote(choice: 'agree' | 'disagree') {
    if (!token) return alert('ログインしてください');
    const res = await fetch(`${API_BASE}/posts/${params.id}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ choice }),
    });
    if (!res.ok) return alert('投票失敗');
    alert('投票しました');
  }

  async function uploadMedia() {
    if (!token || !file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('category', 'comment');
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) return alert('アップロード失敗');
    const data = await res.json();
    setMediaIds((prev) => [...prev, data.mediaId]);
    alert('添付しました');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return alert('ログインしてください');
    const res = await fetch(`${API_BASE}/posts/${params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: text, mediaIds }),
    });
    if (!res.ok) return alert('コメント失敗');
    setText('');
    setMediaIds([]);
    const updated = await fetch(`${API_BASE}/posts/${params.id}/comments`).then(r => r.json());
    setComments(updated);
  }

  if (!post) return <div>読み込み中…</div>;

  return (
    <div className="flex flex-col gap-4">
      <article className="bg-white border rounded p-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
        <p className="mt-3 whitespace-pre-wrap">{post.content}</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-green-600 text-white px-3 py-1" onClick={() => onVote('agree')}>賛成</button>
          <button className="rounded bg-red-600 text-white px-3 py-1" onClick={() => onVote('disagree')}>反対</button>
        </div>
      </article>

      <section className="bg-white border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">コメント</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <textarea className="border rounded px-3 py-2" value={text} onChange={(e)=>setText(e.target.value)} placeholder="@nickname メンションも可（サーバで解析可）" />
          <input type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
          <div className="flex gap-2">
            <button type="button" onClick={uploadMedia} className="rounded bg-gray-300 px-3 py-1">添付アップロード</button>
            <button type="submit" className="rounded bg-blue-600 text-white px-3 py-1">送信</button>
          </div>
        </form>
        <ul className="mt-3 flex flex-col gap-2">
          {comments.map((c) => (
            <li key={c.id} className="border rounded px-3 py-2">
              <div className="text-sm text-gray-600">{new Date(c.createdAt).toLocaleString()}</div>
              <div className="whitespace-pre-wrap">{c.content}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}