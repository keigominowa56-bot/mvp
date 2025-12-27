'use client';
import { useEffect, useState, use } from 'react';
import { API_BASE, apiFetchWithAuth } from '../../../lib/api';
import FollowButton from '../../../components/FollowButton';
import { useAuth } from '../../../contexts/AuthContext';

export default function PoliticianPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [funds, setFunds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
    loadFunds();
    loadPosts();
  }, [resolvedParams.id]);

  async function loadProfile() {
    try {
      // 議員プロフィールを取得（userIdで検索）
      const res = await apiFetchWithAuth(`/api/users/${resolvedParams.id}`, { method: 'GET' });
      if (res.ok) {
        const userData = await res.json();
        
        // 議員プロフィール拡張情報を取得（公開エンドポイント）- キャッシュを無効化
        try {
          const profileRes = await fetch(`${API_BASE}/api/politician/profile/public/${resolvedParams.id}?t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
          });
          const profileData = profileRes.ok ? await profileRes.json() : {};
          setProfile({
            ...userData,
            ...profileData,
            // 拡張プロフィールの画像を優先
            profileImageUrl: profileData.profileImageUrl || userData.profileImageUrl,
            // 拡張プロフィールの政党情報を優先
            party: profileData.party || userData.supportedPartyId,
          });
        } catch {
          // プロフィール拡張情報が取得できない場合は基本情報のみ
          setProfile(userData);
        }
        
        // フォロワー数を取得
        const followerRes = await apiFetchWithAuth(`/api/follows/${resolvedParams.id}/count`, { method: 'GET' });
        if (followerRes.ok) {
          const followerData = await followerRes.json();
          setFollowerCount(followerData.count || 0);
        }
      }
    } catch (err) {
      console.error('プロフィール読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFunds() {
    try {
      // 政治資金を取得（公開用エンドポイント）
      const res = await fetch(`${API_BASE}/api/politician/funds/public/${resolvedParams.id}`, {
        method: 'GET',
      });
      if (res.ok) {
        const data = await res.json();
        setFunds(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      // エラーは無視（公開エンドポイントが存在しない場合）
      console.log('政治資金の取得はスキップしました');
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

  const totalFunds = funds.reduce((sum, fund) => sum + Number(fund.amount), 0);
  const fundsByCategory = funds.reduce((acc, fund) => {
    const category = fund.category || 'その他';
    acc[category] = (acc[category] || 0) + Number(fund.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white border rounded p-4 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {profile.profileImageUrl ? (
            <img src={profile.profileImageUrl} alt="プロフィール画像" className="w-24 h-24 rounded-full object-cover border" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xl">
              {(profile.name || '議員').charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.name || '議員'}</h1>
            {profile.username && (
              <p className="text-sm text-gray-500">@{profile.username}</p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              {(profile.party || profile.party?.name) ?? '無所属'}
              {profile.district && ` • ${profile.district}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">応援数: {followerCount}</p>
          </div>
        </div>
        {user && user.id !== resolvedParams.id && profile.role === 'politician' && (
          <FollowButton userId={resolvedParams.id} />
        )}
      </div>

      {profile.bio && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">プロフィール</h2>
          <p className="whitespace-pre-wrap text-gray-700">{profile.bio}</p>
        </div>
      )}

      {profile.pledges && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">公約</h2>
          <div className="whitespace-pre-wrap text-gray-700">{profile.pledges}</div>
        </div>
      )}

      {funds.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">政治資金</h2>
          <div className="bg-gray-50 rounded p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">合計金額</p>
            <p className="text-2xl font-bold text-blue-600">¥{totalFunds.toLocaleString()}</p>
          </div>
          
          {/* カテゴリ別グラフ */}
          {Object.keys(fundsByCategory).length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-3">カテゴリ別内訳</h3>
              <div className="space-y-3">
                {Object.entries(fundsByCategory).map(([category, amount]) => {
                  const percentage = totalFunds > 0 ? ((amount / totalFunds) * 100).toFixed(1) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category || 'その他'}</span>
                        <span className="font-semibold">¥{amount.toLocaleString()} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* 詳細テーブル */}
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-3">詳細一覧</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">日付</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">用途</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">カテゴリ</th>
                    <th className="border border-gray-300 px-3 py-2 text-right">金額</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">備考</th>
                  </tr>
                </thead>
                <tbody>
                  {funds.map((fund) => (
                    <tr key={fund.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2">
                        {new Date(fund.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{fund.purpose || '-'}</td>
                      <td className="border border-gray-300 px-3 py-2">{fund.category || 'その他'}</td>
                      <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                        ¥{Number(fund.amount).toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">
                        {fund.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">過去の投稿</h2>
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