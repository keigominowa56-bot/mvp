'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetchWithAuth, unwrap } from '../../lib/api';

const REPORT_REASONS = [
  '不適切な内容',
  'スパム',
  'ハラスメント',
  '虚偽情報',
  '著作権侵害',
  'その他',
];

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get('targetId');
  const targetType = searchParams.get('targetType') as 'post' | 'comment' | 'user' | null;
  
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [reasonText, setReasonText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId || !targetType) {
      setError('通報対象が指定されていません');
    }
  }, [targetId, targetType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('通報理由を選択してください');
      return;
    }
    
    if (!reasonText.trim()) {
      setError('理由の詳細を入力してください');
      return;
    }

    if (!targetId || !targetType) {
      setError('通報対象が指定されていません');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetchWithAuth('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetType,
          targetId,
          type: selectedReason,
          reasonCategory: selectedReason,
          reasonText: reasonText.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '通報の送信に失敗しました');
      }

      alert('通報を送信しました。ありがとうございます。');
      router.back();
    } catch (err: any) {
      setError(err.message || '通報送信に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  if (!targetId || !targetType) {
    return (
      <div className="bg-white border rounded p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-4">通報</h1>
        <p className="text-red-600">通報対象が指定されていません</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">通報</h1>
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">通報理由 *</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            required
          >
            <option value="">選択してください</option>
            {REPORT_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">理由の詳細 *</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={5}
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder="通報理由の詳細を記入してください"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? '送信中...' : '通報を送信'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

