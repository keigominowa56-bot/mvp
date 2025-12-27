'use client';
import { useEffect, useState, use } from 'react';
import { API_BASE, apiFetchWithAuth, unwrap, votePost, fetchComments, createComment } from '../../../lib/api';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaIds, setMediaIds] = useState<string[]>([]);

  useEffect(() => {
    // 投稿詳細を取得
    apiFetchWithAuth(`/api/posts/${resolvedParams.id}`, { method: 'GET' })
      .then(res => unwrap(res))
      .then(data => {
        console.log('[PostDetail] 投稿詳細取得成功:', data);
        setPost(data);
      })
      .catch(err => {
        console.error('[PostDetail] 投稿詳細取得失敗:', err);
      });
    
    // コメント一覧を取得
    fetchComments(resolvedParams.id)
      .then(data => {
        console.log('[PostDetail] コメント一覧取得成功:', data);
        setComments(data);
      })
      .catch(err => {
        console.error('[PostDetail] コメント一覧取得失敗:', err);
      });
  }, [resolvedParams.id]);

  async function onVote(choice: 'agree' | 'disagree') {
    console.log('[PostDetail] 投票開始 - postId:', resolvedParams.id, 'choice:', choice);
    try {
      await votePost(resolvedParams.id, choice);
      console.log('[PostDetail] 投票成功');
      alert('投票しました');
      // ページをリロードして最新の状態を取得
      window.location.reload();
    } catch (err: any) {
      console.error('[PostDetail] 投票失敗:', err);
      alert(err.message || '投票失敗');
    }
  }

  async function uploadMedia() {
    if (!file) return;
    console.log('[PostDetail] メディアアップロード開始');
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!authToken) {
      alert('ログインが必要です');
      return;
    }
    const form = new FormData();
    form.append('file', file);
    form.append('category', 'comment');
    try {
      const res = await fetch(`${API_BASE}/api/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
        body: form,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        console.error('[PostDetail] メディアアップロード失敗:', error);
        alert(error.message || 'アップロード失敗');
        return;
      }
      const data = await res.json();
      console.log('[PostDetail] メディアアップロード成功:', data);
      setMediaIds((prev) => [...prev, data.mediaId]);
      alert('添付しました');
    } catch (err) {
      console.error('[PostDetail] メディアアップロードエラー:', err);
      alert('アップロードに失敗しました');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('[PostDetail] コメント送信開始 - postId:', resolvedParams.id, 'text:', text);
    try {
      await createComment(resolvedParams.id, { text, mediaIds });
      console.log('[PostDetail] コメント送信成功');
      setText('');
      setMediaIds([]);
      // コメント一覧を再取得
      const updated = await fetchComments(resolvedParams.id);
      console.log('[PostDetail] コメント一覧再取得成功:', updated);
      setComments(updated);
    } catch (err: any) {
      console.error('[PostDetail] コメント送信失敗:', err);
      alert(err.message || 'コメント送信に失敗しました');
    }
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