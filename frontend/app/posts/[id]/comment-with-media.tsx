'use client';
import { useState } from 'react';
import { uploadMedia } from '../../lib/api-media';

export function CommentWithMedia({ postId, token }: { postId: string; token: string }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaIds, setMediaIds] = useState<string[]>([]);

  async function onUpload() {
    if (!file) return;
    const { mediaId } = await uploadMedia(file, token, 'comment');
    setMediaIds((arr) => [...arr, mediaId]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: text, mediaIds }),
    });
    if (!res.ok) {
      alert('コメント投稿に失敗しました');
      return;
    }
    setText('');
    setMediaIds([]);
    alert('投稿しました');
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="コメント…" />
      <input type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
      <div className="flex gap-2">
        <button type="button" onClick={onUpload} className="px-3 py-1 bg-gray-200 rounded">添付アップロード</button>
        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">送信</button>
      </div>
    </form>
  );
}