'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPosts, fetchCurrentUser, deletePost, type Post, type User } from '@/lib/api';

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const userData = await fetchCurrentUser();
      setUser(userData);

      // 議員の場合は自分の投稿のみ、管理者の場合はすべての投稿を取得
      const postsData = await fetchPosts({ limit: 50 });
      
      // 議員の場合はフィルタリング
      if (userData.role === 'politician') {
        setPosts(postsData.filter(post => post.authorUserId === userData.id));
      } else {
        setPosts(postsData);
      }
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm('この投稿を削除してもよろしいですか？')) {
      return;
    }

    setDeleting(postId);
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err: any) {
      alert(err.message || '削除に失敗しました');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Link
          href="/posts/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          新規投稿
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {user && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">ユーザー情報</h2>
          <p><strong>名前:</strong> {user.name}</p>
          <p><strong>メール:</strong> {user.email}</p>
          <p><strong>役割:</strong> {user.role}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {user?.role === 'politician' ? '自分の投稿' : 'すべての投稿'}
        </h2>
        {posts.length === 0 ? (
          <p className="text-gray-500">投稿がありません</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <span className="inline-block bg-gray-200 rounded px-2 py-1 text-xs text-gray-700 mr-2 mt-1">
                      {post.type}
                    </span>
                    <p className="text-gray-700 mt-2 line-clamp-2">{post.content}</p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-sm text-gray-500 mb-2">
                      {new Date(post.createdAt).toLocaleString('ja-JP')}
                    </span>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                    >
                      {deleting === post.id ? '削除中...' : '削除'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
