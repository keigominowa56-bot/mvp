'use client';
import { useState, useEffect } from 'react';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function PoliticianProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    party: '',
    bio: '',
    pledges: '',
    profileImageUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/politician/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          district: data.district || '',
          party: data.party || '',
          bio: data.bio || '',
          pledges: data.pledges || '',
          profileImageUrl: data.profileImageUrl || '',
          twitterUrl: data.socialLinks?.twitter || '',
          facebookUrl: data.socialLinks?.facebook || '',
          instagramUrl: data.socialLinks?.instagram || '',
        });
      } else if (res.status === 404) {
        // プロフィールが存在しない場合は新規作成モード
        console.log('プロフィールが存在しません。新規作成モードです。');
      } else {
        const error = await res.json().catch(() => ({}));
        setMsg(error.message || 'プロフィールの読み込みに失敗しました');
      }
    } catch (err: any) {
      console.error('プロフィール読み込みエラー:', err);
      setMsg('プロフィールの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        setSaving(false);
        return;
      }

      const socialLinks: Record<string, string> = {};
      if (formData.twitterUrl) socialLinks.twitter = formData.twitterUrl;
      if (formData.facebookUrl) socialLinks.facebook = formData.facebookUrl;
      if (formData.instagramUrl) socialLinks.instagram = formData.instagramUrl;

      const res = await fetch(`${API_BASE}/api/politician/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          profileImageUrl: formData.profileImageUrl,
          district: formData.district,
          party: formData.party,
          bio: formData.bio,
          pledges: formData.pledges,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }),
      });

      if (res.ok) {
        setMsg('プロフィールを保存しました');
        setSuccess('プロフィールを保存しました');
        setError(null);
        await loadProfile();
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || '保存に失敗しました';
        setMsg(errorMessage);
        setError(errorMessage);
        setSuccess(null);
      }
    } catch (err: any) {
      console.error('保存エラー:', err);
      setMsg(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">議員プロフィール編集</h1>
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
      {msg && !error && !success && (
        <div className={`mb-4 p-3 rounded ${msg.includes('保存') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">プロフィール画像</label>
          <div className="flex items-center gap-4">
            <div>
              {formData.profileImageUrl ? (
                <img
                  src={formData.profileImageUrl}
                  alt="プロフィール画像"
                  className="w-24 h-24 rounded-full object-cover border"
                />
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
                    setSuccess(null);
                    return;
                  }
                  
                  // ファイルをアップロード
                  const uploadFormData = new FormData();
                  uploadFormData.append('file', file);
                  uploadFormData.append('category', 'avatar');
                  
                  const token = localStorage.getItem('auth_token');
                  if (!token) {
                    setError('ログインが必要です');
                    setSuccess(null);
                    return;
                  }
                  
                  try {
                    const res = await fetch(`${API_BASE}/api/media/upload`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                      },
                      body: uploadFormData,
                    });
                    
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.message || 'アップロードに失敗しました');
                    }
                    
                    const data = await res.json();
                    // アップロードされた画像のURLを設定（フルパス）
                    const imageUrl = data.url || data.path || '';
                    const fullUrl = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`;
                    setFormData(prev => ({ ...prev, profileImageUrl: fullUrl }));
                    setSuccess('画像をアップロードしました');
                    setError(null);
                  } catch (err: any) {
                    setError(err.message || '画像のアップロードに失敗しました');
                    setSuccess(null);
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">画像ファイルを選択してください（5MB以下）</p>
              {formData.profileImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, profileImageUrl: '' }));
                    setSuccess(null);
                    setError(null);
                  }}
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
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">選挙区</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">政党</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={formData.party}
            onChange={(e) => setFormData({ ...formData, party: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">一言</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">公約</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={5}
            value={formData.pledges}
            onChange={(e) => setFormData({ ...formData, pledges: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Twitter URL</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            placeholder="https://twitter.com/..."
            value={formData.twitterUrl}
            onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook URL</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            placeholder="https://facebook.com/..."
            value={formData.facebookUrl}
            onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram URL</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            placeholder="https://instagram.com/..."
            value={formData.instagramUrl}
            onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
          />
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

