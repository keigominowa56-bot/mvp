'use client';
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type PoliticalFund = {
  id: string;
  purpose: string;
  amount: number;
  date: string;
  category: string | null;
  notes: string | null;
};

export default function PoliticalFundsPage() {
  const [funds, setFunds] = useState<PoliticalFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    purpose: '',
    amount: '',
    date: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    loadFunds();
  }, []);

  async function loadFunds() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/politician/funds`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setFunds(Array.isArray(data) ? data : []);
      } else {
        setMsg('政治資金の取得に失敗しました');
      }
    } catch (err) {
      console.error('政治資金読み込みエラー:', err);
      setMsg('政治資金の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        return;
      }

      const payload = {
        purpose: formData.purpose,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category || null,
        notes: formData.notes || null,
      };

      const url = editingId
        ? `${API_BASE}/api/politician/funds/${editingId}`
        : `${API_BASE}/api/politician/funds`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMsg(editingId ? '政治資金を更新しました' : '政治資金を登録しました');
        setFormData({ purpose: '', amount: '', date: '', category: '', notes: '' });
        setShowForm(false);
        setEditingId(null);
        await loadFunds();
      } else {
        const error = await res.json().catch(() => ({}));
        setMsg(error.message || '保存に失敗しました');
      }
    } catch (err: any) {
      console.error('保存エラー:', err);
      setMsg(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この政治資金記録を削除しますか？')) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setMsg('ログインが必要です');
        return;
      }

      const res = await fetch(`${API_BASE}/api/politician/funds/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setMsg('政治資金を削除しました');
        await loadFunds();
      } else {
        const error = await res.json().catch(() => ({}));
        setMsg(error.message || '削除に失敗しました');
      }
    } catch (err: any) {
      console.error('削除エラー:', err);
      setMsg(err.message || '削除に失敗しました');
    }
  }

  function startEdit(fund: PoliticalFund) {
    setFormData({
      purpose: fund.purpose,
      amount: fund.amount.toString(),
      date: fund.date.split('T')[0],
      category: fund.category || '',
      notes: fund.notes || '',
    });
    setEditingId(fund.id);
    setShowForm(true);
  }

  const totalAmount = funds.reduce((sum, fund) => sum + Number(fund.amount), 0);

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">政治資金管理</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setFormData({ purpose: '', amount: '', date: '', category: '', notes: '' });
              setEditingId(null);
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'キャンセル' : '新規登録'}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded ${msg.includes('失敗') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded p-4 mb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">使用用途 *</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">金額 *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full border rounded px-3 py-2"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">使用日 *</label>
            <input
              type="date"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">カテゴリ</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">備考</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : editingId ? '更新' : '登録'}
          </button>
        </form>
      )}

      <div className="bg-white border rounded p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">合計金額</h2>
        <p className="text-2xl font-bold text-blue-600">¥{totalAmount.toLocaleString()}</p>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-4">政治資金一覧</h2>
        {funds.length === 0 ? (
          <p className="text-gray-500">政治資金記録がありません</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">使用用途</th>
                  <th className="text-right p-2">金額</th>
                  <th className="text-left p-2">使用日</th>
                  <th className="text-left p-2">カテゴリ</th>
                  <th className="text-left p-2">備考</th>
                  <th className="text-center p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((fund) => (
                  <tr key={fund.id} className="border-b">
                    <td className="p-2">{fund.purpose}</td>
                    <td className="text-right p-2">¥{Number(fund.amount).toLocaleString()}</td>
                    <td className="p-2">{new Date(fund.date).toLocaleDateString()}</td>
                    <td className="p-2">{fund.category || '-'}</td>
                    <td className="p-2">{fund.notes || '-'}</td>
                    <td className="p-2">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => startEdit(fund)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(fund.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

