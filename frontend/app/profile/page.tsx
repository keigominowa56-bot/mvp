'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMe, updateUserProfile, fetchFollowedUserIds, apiFetchWithAuth } from '../../lib/api';

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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [followedPoliticians, setFollowedPoliticians] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    profileImageUrl: '',
    supportedPartyId: '',
  });

  useEffect(() => {
    loadProfile();
    loadFollowedPoliticians();
  }, []);

  async function loadProfile() {
    console.log('[ProfilePage] プロフィール読み込み開始');
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    console.log('[ProfilePage] localStorage auth_token:', token ? 'あり' : 'なし');
    
    if (!token) {
      console.warn('[ProfilePage] トークンがありません');
      setError('ログインが必要です');
      setLoading(false);
      return;
    }

    try {
      console.log('[ProfilePage] getMe()呼び出し開始');
      const me = await getMe();
      console.log('[ProfilePage] getMe()成功:', me);
      setUser(me);
      setFormData({
        name: me.name || '',
        username: me.username || '',
        profileImageUrl: me.profileImageUrl || '',
        supportedPartyId: me.supportedPartyId || '',
      });
      setError(null);
    } catch (err: any) {
      console.error('[ProfilePage] getMe()失敗:', err);
      setError(err.message || 'ユーザー情報の取得に失敗しました');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadFollowedPoliticians() {
    try {
      const res = await apiFetchWithAuth('/api/follows/followed', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.users && Array.isArray(data.users)) {
          setFollowedPoliticians(data.users);
        } else if (data.ids && Array.isArray(data.ids)) {
          // フォールバック: IDのみの場合、ユーザー情報を個別に取得
          const users = await Promise.all(
            data.ids.map(async (id: string) => {
              const userRes = await apiFetchWithAuth(`/api/users/${id}`, { method: 'GET' });
              if (userRes.ok) {
                return await userRes.json();
              }
              return null;
            })
          );
          setFollowedPoliticians(users.filter(u => u && u.role === 'politician'));
        }
      }
    } catch (err) {
      console.error('フォロー中の議員取得エラー:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUserProfile(formData);
      setSuccess('プロフィールを更新しました');
      await loadProfile();
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'プロフィール更新に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border rounded p-4">
        <h1 className="text-xl font-bold">プロフィール</h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="bg-white border rounded p-4">
        <h1 className="text-xl font-bold">プロフィール</h1>
        <p className="text-red-600">{error}</p>
        <div className="mt-2">
          <a href="/login" className="text-blue-600 underline">
            ログインページへ
          </a>
        </div>
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="bg-white border rounded p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">プロフィール</h1>
        
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="プロフィール画像" className="w-24 h-24 rounded-full object-cover border" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xl">
                  {(user.name || 'ユーザー').charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{user.name || 'ユーザー'}</h2>
                {user.username ? (
                  <p className="text-sm text-gray-500">@{user.username}</p>
                ) : user.id ? (
                  <p className="text-sm text-gray-400">@{user.id.slice(0, 8)}</p>
                ) : null}
                {user.supportedPartyId && (
                  <p className="text-sm text-gray-600 mt-1">
                    支持政党: {PARTIES.find(p => p.id === user.supportedPartyId)?.name || '不明'}
                  </p>
                )}
              </div>
            </div>

            {followedPoliticians.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">応援している議員</h3>
                <div className="space-y-2">
                  {followedPoliticians.map((politician) => (
                    <Link
                      key={politician.id}
                      href={`/politicians/${politician.id}`}
                      className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
                    >
                      {politician.profileImageUrl ? (
                        <img
                          src={politician.profileImageUrl}
                          alt={politician.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                          {(politician.name || '議員').charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{politician.name || '議員'}</p>
                        {politician.username && (
                          <p className="text-sm text-gray-500">@{politician.username}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              変更する
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">プロフィール編集</h1>
        <button
          onClick={() => setEditing(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          キャンセル
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">プロフィール画像</label>
          <div className="flex items-center gap-4">
            <div>
              {formData.profileImageUrl ? (
                <img src={formData.profileImageUrl} alt="プロフィール画像" className="w-24 h-24 rounded-full object-cover border" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  画像なし
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                className="w-full border rounded px-3 py-2"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // ファイルサイズチェック（5MB以下）
                  if (file.size > 5 * 1024 * 1024) {
                    setError('画像サイズは5MB以下にしてください');
                    return;
                  }
                  
                  // ファイルをアップロード
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('category', 'avatar');
                  
                  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                  if (!token) {
                    setError('ログインが必要です');
                    return;
                  }
                  
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/media/upload`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                      body: formData,
                    });
                    
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.message || 'アップロードに失敗しました');
                    }
                    
                    const data = await res.json();
                    // アップロードされた画像のURLを設定（フルパス）
                    const imageUrl = data.url || data.path || '';
                    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}${imageUrl}`;
                    setFormData(prev => ({ ...prev, profileImageUrl: fullUrl }));
                    setSuccess('画像をアップロードしました');
                  } catch (err: any) {
                    setError(err.message || '画像のアップロードに失敗しました');
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">画像ファイルを選択してください（5MB以下）</p>
              {formData.profileImageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: '' }))}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  画像を削除
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">名前 *</label>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">名前は他のユーザーと重複できません</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ユーザーID (@username) *</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">@</span>
            <input
              type="text"
              required
              pattern="[a-z0-9_]+"
              className="flex-1 border rounded px-3 py-2"
              placeholder="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">英数字とアンダースコアのみ使用可能。他のユーザーと重複できません</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">支持政党</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={formData.supportedPartyId}
            onChange={(e) => setFormData({ ...formData, supportedPartyId: e.target.value })}
          >
            <option value="">選択しない</option>
            {PARTIES.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">現在の情報</p>
          <p className="text-xs text-gray-500">メール: {user?.email}</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}