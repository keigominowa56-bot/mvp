'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { API_BASE, apiFetchWithAuth } from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

const PARTIES = [
  { id: '1', name: '自民党' },
  { id: '2', name: '立憲民主党' },
  { id: '3', name: '日本維新の会' },
  { id: '4', name: '公明党' },
  { id: '5', name: '共産党' },
  { id: '6', name: '国民民主党' },
  { id: '7', name: 'れいわ新選組' },
  { id: '8', name: '社民党' },
  { id: '9', name: '無所属' },
];

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [resolvedParams.id]);

  async function loadProfile() {
    try {
      const res = await apiFetchWithAuth(`/api/users/${resolvedParams.id}`, { method: 'GET' });
      if (res.ok) {
        const userData = await res.json();
        setProfile(userData);
      }
    } catch (err) {
      console.error('プロフィール読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    try {
      const res = await apiFetchWithAuth(`/api/posts?authorUserId=${resolvedParams.id}&limit=10`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('投稿読み込みエラー:', err);
    }
  }

  if (loading) return <div className="bg-white border rounded p-4">読み込み中…</div>;
  if (!profile) return <div className="bg-white border rounded p-4">プロフィールが見つかりません</div>;

  const partyName = profile.supportedPartyId 
    ? PARTIES.find(p => p.id === profile.supportedPartyId)?.name || '無所属'
    : '無所属';

  return (
    <div className="bg-white border rounded p-4 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="プロフィール画像" className="w-24 h-24 rounded-full object-cover border" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xl">
              {(profile.name || 'ユーザー').charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.name || 'ユーザー'}</h1>
            {profile.username && (
              <p className="text-sm text-gray-500">@{profile.username}</p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              {profile.role === 'admin' ? '運営' : profile.role === 'politician' ? '議員' : '一般ユーザー'}
              {profile.supportedPartyId && ` • ${partyName}`}
            </p>
          </div>
        </div>
      </div>

      {posts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">投稿一覧</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded p-4">
                <h3 className="font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>賛成: {post.agreeCount || 0}</span>
                  <span>反対: {post.disagreeCount || 0}</span>
                  <span>コメント: {post.commentCount || 0}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

