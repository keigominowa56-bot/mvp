'use client';
import { useState } from 'react';
import { useComments } from '../lib/hooks/useComments';

export default function CommentsSection({ postId }: { postId: string }) {
  const { comments, create } = useComments(postId);
  const [text, setText] = useState('');
  const [mediaIds, setMediaIds] = useState<string[]>([]);

  function extractMentions(input: string): string[] {
    const matches = input.match(/@([\w_]+)/g) || [];
    return matches.map((m) => m.slice(1));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await create({ text, mediaIds, mentions: extractMentions(text) });
    setText('');
    setMediaIds([]);
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input className="border rounded px-2 py-1 flex-1" value={text} onChange={(e)=>setText(e.target.value)} placeholder="@nickname を含めるとメンション通知" />
        <button className="rounded bg-blue-600 text-white px-3 py-1">送信</button>
      </form>
      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <li key={c.id} className="border rounded px-2 py-1">
            <div className="text-sm text-gray-600">{new Date(c.createdAt).toLocaleString()}</div>
            <div className="whitespace-pre-wrap">{c.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}