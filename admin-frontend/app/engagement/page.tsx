'use client';
import React, { useEffect, useState } from 'react';

type PostAnalytics = { id: string; title: string; likes: number; comments: number; disagrees: number; authorId: string };
type User = { id: string; role: string; isPaidMember: boolean; allowedEngagement: boolean; };

export default function EngagementPage() {
  const [posts, setPosts] = useState<PostAnalytics[]>([]);
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/auth/me', {credentials:'include'})
      .then(res=>res.json())
      .then(data=>setUser(data));
    fetch('http://localhost:4000/api/admin/posts/analytics', {credentials:'include'})
      .then(res=>res.json())
      .then(data=>{ setPosts(data); setLoading(false); });
  }, []);

  // 閲覧許可条件
  const canSee = user?.role === 'admin' || user?.allowedEngagement || user?.isPaidMember;

  let filteredPosts = posts;
  if(user?.role === 'politician') {
    filteredPosts = posts.filter(x => x.authorId === user.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black mb-4">投稿のエンゲージメント分析</h1>
      {!canSee && (
        <div className="bg-yellow-100 border-yellow-400 border p-4 mb-5 text-black font-bold rounded">
          この機能を閲覧するには有料会員登録が必要です。(運営または許可議員のみご利用可能)
        </div>
      )}
      {loading ? (<div>読込中...</div>)
        : canSee && (<table className="w-full border">
        <thead><tr><th>タイトル</th><th>いいね</th><th>コメント</th><th>反対票</th></tr></thead>
        <tbody>
          {filteredPosts.map(x=>(
            <tr key={x.id}>
              <td>{x.title}</td>
              <td className="text-center">{x.likes}</td>
              <td className="text-center">{x.comments}</td>
              <td className="text-center">{x.disagrees}</td>
            </tr>
          ))}
        </tbody>
      </table>)}
    </div>
  );
}