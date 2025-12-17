'use client';
import React, { useEffect, useState } from 'react';

type Comment = {
  id: string;
  postTitle: string;
  content: string;
  author: string;
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]); // 初期値「配列」
  const [msg, setMsg] = useState('');

  useEffect(()=>{
    fetch('http://localhost:4000/api/admin/comments', { credentials: 'include' })
      .then(res=>res.json())
      .then(data=>setComments(Array.isArray(data) ? data : [])); // ←配列保証
  }, []);

  return (
    <div>
      <div className="text-green-600">{msg}</div>
      <div className="space-y-6">
        {comments.map(c=>(
          <div key={c.id} className="border rounded p-3">
            <div className="mb-1 font-bold">{c.postTitle}</div>
            <div className="mb-1">{c.content} <span className="text-xs text-gray-500">by {c.author}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}