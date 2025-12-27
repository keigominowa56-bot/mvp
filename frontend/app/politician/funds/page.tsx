'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE, apiFetchWithAuth } from '../../../lib/api';

type Fund = {
  id: string;
  purpose: string;
  amount: number;
  date: string;
  category: string | null;
  notes: string | null;
};

export default function PoliticalFundsPage() {
  const { user, isPolitician } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
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
    if (!isPolitician) {
      window.location.href = '/feed';
      return;
    }
    loadFunds();
  }, [isPolitician]);

  async function loadFunds() {
    try {
      const res = await apiFetchWithAuth('/api/politician/funds', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setFunds(data);
      }
    } catch (err) {
      console.error('政治資金読み込みエラー:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const payload = {
        purpose: formData.purpose,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category || undefined,
        notes: formData.notes || undefined,
      };

      let res;
      if (editingId) {
        res = await apiFetchWithAuth(`/api/politician/funds/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetchWithAuth('/api/politician/funds', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setMsg(editingId ? '更新しました' : '登録しました');
        setShowForm(false);
        setEditingId(null);
        setFormData({ purpose: '', amount: '', date: '', category: '', notes: '' });
        await loadFunds();
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

  async function handleDelete(id: string) {
    if (!confirm('この記録を削除しますか？')) return;
    try {
      const res = await apiFetchWithAuth(`/api/politician/funds/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg('削除しました');
        await loadFunds();
      }
    } catch (err: any) {
      setMsg(err.message || '削除に失敗しました');
    }
  }

  function handleEdit(fund: Fund) {
    setEditingId(fund.id);
    setFormData({
      purpose: fund.purpose,
      amount: String(fund.amount),
      date: fund.date.split('T')[0],
      category: fund.category || '',
      notes: fund.notes || '',
    });
    setShowForm(true);
  }

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (!isPolitician) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">政治資金管理</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ purpose: '', amount: '', date: '', category: '', notes: '' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'キャンセル' : '新規登録'}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded ${msg.includes('削除') || msg.includes('更新') || msg.includes('登録') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="mb-6 p-4 border rounded space-y-4">
          <h2 className="text-xl font-semibold">{editingId ? '編集' : '新規登録'}</h2>
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
              step="0.01"
              min="0"
              className="w-full border rounded px-3 py-2"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">日付 *</label>
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
            <label className="block text-sm font-medium mb-1">メモ</label>
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
            {saving ? '保存中...' : '保存'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">使用用途</th>
              <th className="border p-2 text-right">金額</th>
              <th className="border p-2 text-left">日付</th>
              <th className="border p-2 text-left">カテゴリ</th>
              <th className="border p-2 text-left">メモ</th>
              <th className="border p-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {funds.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-4 text-center text-gray-500">
                  記録がありません
                </td>
              </tr>
            ) : (
              funds.map((fund) => (
                <tr key={fund.id}>
                  <td className="border p-2">{fund.purpose}</td>
                  <td className="border p-2 text-right">¥{fund.amount.toLocaleString()}</td>
                  <td className="border p-2">{new Date(fund.date).toLocaleDateString('ja-JP')}</td>
                  <td className="border p-2">{fund.category || '-'}</td>
                  <td className="border p-2">{fund.notes || '-'}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleEdit(fund)}
                      className="text-blue-600 hover:underline mr-2"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(fund.id)}
                      className="text-red-600 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

