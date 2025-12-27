'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { API_BASE, apiFetchWithAuth } from '../../../../lib/api';

export default function PoliticianProfileEditPage() {
  const { user, isPolitician } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    party: '',
    bio: '',
    pledges: '',
    twitterUrl: '',
    facebookUrl: '',
    instagramUrl: '',
  });

  useEffect(() => {
    if (!isPolitician) {
      window.location.href = '/feed';
      return;
    }
    loadProfile();
  }, [isPolitician]);

  async function loadProfile() {
    try {
      const res = await apiFetchWithAuth('/api/politician/profile', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          district: data.district || '',
          party: data.party || '',
          bio: data.bio || '',
          pledges: data.pledges || '',
          twitterUrl: data.socialLinks?.twitter || '',
          facebookUrl: data.socialLinks?.facebook || '',
          instagramUrl: data.socialLinks?.instagram || '',
        });
      }
    } catch (err) {
      console.error('プロフィール読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const socialLinks: Record<string, string> = {};
      if (formData.twitterUrl) socialLinks.twitter = formData.twitterUrl;
      if (formData.facebookUrl) socialLinks.facebook = formData.facebookUrl;
      if (formData.instagramUrl) socialLinks.instagram = formData.instagramUrl;

      const res = await apiFetchWithAuth('/api/politician/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          district: formData.district,
          party: formData.party,
          bio: formData.bio,
          pledges: formData.pledges,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }),
      });

      if (res.ok) {
        setMsg('プロフィールを保存しました');
      } else {
        const error = await res.json();
        setMsg(error.message || '保存に失敗しました');
      }
    } catch (err: any) {
      setMsg(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (!isPolitician) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      {msg && (
        <div className={`mb-4 p-3 rounded ${msg.includes('保存') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">名前</label>
          <input
            type="text"
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
            value={formData.twitterUrl}
            onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook URL</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={formData.facebookUrl}
            onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instagram URL</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
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

