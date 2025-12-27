'use client';
import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function SendNotificationPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    addressPref: '',
    addressCity: '',
    ageGroup: '',
    supportedPartyId: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setMessage({ type: 'error', text: 'タイトルと本文を入力してください' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMessage({ type: 'error', text: 'ログインが必要です' });
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/notifications/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          filters: Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== '')
          ),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ 
          type: 'success', 
          text: `通知を${data.count || 0}人のユーザーに送信しました` 
        });
        setTitle('');
        setBody('');
        setFilters({
          role: '',
          addressPref: '',
          addressCity: '',
          ageGroup: '',
          supportedPartyId: '',
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage({ 
          type: 'error', 
          text: errorData.message || '通知の送信に失敗しました' 
        });
      }
    } catch (err) {
      console.error('通知送信エラー:', err);
      setMessage({ type: 'error', text: '通知の送信に失敗しました' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">通知送信</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">タイトル *</label>
          <input
            type="text"
            required
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="通知のタイトル"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">本文 *</label>
          <textarea
            required
            rows={5}
            className="w-full border rounded px-3 py-2"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="通知の内容"
          />
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">送信先フィルター（任意）</h2>
          <p className="text-sm text-gray-600 mb-4">
            フィルターを指定しない場合は全ユーザーに送信されます
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">役割</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              >
                <option value="">すべて</option>
                <option value="citizen">一般ユーザー</option>
                <option value="politician">議員</option>
                <option value="admin">運営</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">都道府県</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={filters.addressPref}
                onChange={(e) => setFilters({ ...filters, addressPref: e.target.value })}
                placeholder="例: 東京都"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">市区町村</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={filters.addressCity}
                onChange={(e) => setFilters({ ...filters, addressCity: e.target.value })}
                placeholder="例: 渋谷区"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">年代</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={filters.ageGroup}
                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
              >
                <option value="">すべて</option>
                <option value="10代">10代</option>
                <option value="20代">20代</option>
                <option value="30代">30代</option>
                <option value="40代">40代</option>
                <option value="50代">50代</option>
                <option value="60代">60代</option>
                <option value="70代以上">70代以上</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">支持政党</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={filters.supportedPartyId}
                onChange={(e) => setFilters({ ...filters, supportedPartyId: e.target.value })}
              >
                <option value="">すべて</option>
                <option value="1">自民党</option>
                <option value="2">立憲民主党</option>
                <option value="3">日本維新の会</option>
                <option value="4">公明党</option>
                <option value="5">共産党</option>
                <option value="6">国民民主党</option>
                <option value="7">れいわ新選組</option>
                <option value="8">社民党</option>
                <option value="9">無所属</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '送信中...' : '通知を送信'}
        </button>
      </form>
    </div>
  );
}

