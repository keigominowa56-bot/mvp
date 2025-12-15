'use client';
import React, { useEffect, useState } from 'react';

type CommentType = { id: string; postTitle: string; content: string; author: string; replies: { id: string; content: string }[] };

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [replyContent, setReplyContent] = useState<Record<string,string>>({});
  const [msg, setMsg] = useState('');
  useEffect(()=>{
    fetch('http://localhost:4000/api/admin/comments', { credentials: 'include' })
      .then(res=>res.json())
      .then(data=>setComments(data));
  }, []);

  async function sendReply(commentId: string) {
    setMsg('');
    const body = { content: replyContent[commentId] ?? '' };
    const res = await fetch(`http://localhost:4000/api/admin/comments/${commentId}/reply`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'include'
    });
    setMsg(res.ok ? '返信しました' : '返信失敗');
    if(res.ok) setReplyContent(prev=>({ ...prev, [commentId]: '' }));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">コメント一覧と返信</h1>
      <div className="text-green-600">{msg}</div>
      <div className="space-y-6">
        {comments.map(c=>(
          <div key={c.id} className="border rounded p-3">
            <div className="mb-1 font-bold">{c.postTitle}</div>
            <div className="mb-1">{c.content} <span className="text-xs text-gray-500">by {c.author}</span></div>
            <div>返信:
              <ul className="pl-4 text-blue-600 text-sm">
                {(c.replies||[]).map(r=><li key={r.id}>{r.content}</li>)}
              </ul>
            </div>
            <textarea className="border w-full p-1 mt-2" rows={2}
              value={replyContent[c.id]??''} onChange={e=>setReplyContent(prev=>({ ...prev, [c.id]: e.target.value }))} />
            <button onClick={()=>sendReply(c.id)} className="bg-blue-600 text-white px-2 py-1 mt-1">返信する</button>
          </div>
        ))}
      </div>
    </div>
  );
}