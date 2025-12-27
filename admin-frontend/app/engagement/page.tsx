'use client';
import React, { useEffect, useState } from 'react';

type PostAnalytics = {
  id: string;
  title: string;
  likes: number;
  comments: number;
  disagrees: number;
  authorId: string;
  analytics?: {
    ageGroups: Record<string, number>;
    regions: Record<string, number>;
    parties: Record<string, number>;
    engagedUsers: Array<{
      id: string;
      name: string;
      ageGroup: string;
      region: string;
      partyId: string;
    }>;
  };
};
type User = { id: string; role: string; isPaidMember: boolean; allowedEngagement: boolean; };

export default function EngagementPage() {
  const [posts, setPosts] = useState<PostAnalytics[]>([]);
  const [user, setUser] = useState<User|null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostAnalytics | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:4000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setUser(data));
    
    fetch('http://localhost:4000/api/admin/posts/analytics', {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        // データが配列であることを確認
        const postsArray = Array.isArray(data) ? data : [];
        setPosts(postsArray);
        setLoading(false);
      })
      .catch(err => {
        console.error('投稿分析データの取得に失敗:', err);
        setPosts([]);
        setLoading(false);
      });
  }, []);

  // 閲覧許可条件（管理者または許可された議員）
  const canSee = user?.role === 'admin' || user?.allowedEngagement;

  let filteredPosts: PostAnalytics[] = Array.isArray(posts) ? posts : [];
  if(user?.role === 'politician') {
    filteredPosts = filteredPosts.filter(x => x.authorId === user.id);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-black mb-4">投稿のエンゲージメント分析</h1>
      {!canSee && (
        <div className="bg-yellow-100 border-yellow-400 border p-4 mb-5 text-black font-bold rounded">
          この機能を閲覧するには有料会員登録が必要です。(運営または許可議員のみご利用可能)
        </div>
      )}
      {loading ? (
        <div>読込中...</div>
      ) : canSee ? (
        <div className="space-y-4">
          <table className="w-full border">
            <thead>
              <tr>
                <th>タイトル</th>
                <th>いいね</th>
                <th>コメント</th>
                <th>反対票</th>
                <th>詳細</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(x => (
                <tr key={x.id}>
                  <td>{x.title}</td>
                  <td className="text-center">{x.likes}</td>
                  <td className="text-center">{x.comments}</td>
                  <td className="text-center">{x.disagrees}</td>
                  <td className="text-center">
                    <button
                      onClick={() => setSelectedPost(selectedPost?.id === x.id ? null : x)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      {selectedPost?.id === x.id ? '閉じる' : '詳細'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedPost && (
            <div className="bg-white border rounded p-6 mt-4">
              <h2 className="text-xl font-bold mb-4">{selectedPost.title} - 詳細分析</h2>
              
              {selectedPost.analytics ? (
                <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded p-4">
                  <h3 className="font-semibold mb-3">年代別</h3>
                  {Object.keys(selectedPost.analytics.ageGroups).length > 0 ? (
                    <>
                      {Object.entries(selectedPost.analytics.ageGroups).map(([age, count]) => {
                        const total = Object.values(selectedPost.analytics.ageGroups).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={age} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{age}</span>
                              <span className="font-semibold">{count}人 ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">データなし</p>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded p-4">
                  <h3 className="font-semibold mb-3">地域別</h3>
                  {Object.keys(selectedPost.analytics.regions).length > 0 ? (
                    <>
                      {Object.entries(selectedPost.analytics.regions).map(([region, count]) => {
                        const total = Object.values(selectedPost.analytics.regions).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={region} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{region}</span>
                              <span className="font-semibold">{count}人 ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">データなし</p>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded p-4">
                  <h3 className="font-semibold mb-3">支持政党別</h3>
                  {Object.keys(selectedPost.analytics.parties).length > 0 ? (
                    <>
                      {Object.entries(selectedPost.analytics.parties).map(([party, count]) => {
                        const total = Object.values(selectedPost.analytics.parties).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={party} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{party}</span>
                              <span className="font-semibold">{count}人 ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">データなし</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">参加ユーザー一覧</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border text-sm">
                    <thead>
                      <tr>
                        <th>名前</th>
                        <th>年代</th>
                        <th>地域</th>
                        <th>支持政党</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPost.analytics.engagedUsers.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name || '匿名'}</td>
                          <td>{u.ageGroup || '不明'}</td>
                          <td>{u.region || '不明'}</td>
                          <td>{u.partyId || '無所属'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800">この投稿のエンゲージメントデータはまだありません。</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}