'use client';

import { useState } from 'react';
import { createReport } from '../lib/api-extended';

type Props = {
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
};

export default function ReportButton({ targetId, targetType }: Props) {
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function onSubmit() {
    setLoading(true);
    try {
      await createReport(targetId, targetType, reason);
      alert('通報を送信しました。ありがとうございます。');
      setReason('');
    } catch (e: any) {
      alert(e?.message || '通報送信に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2" aria-label="通報ボタン">
      <input
        className="border rounded px-2 py-1"
        placeholder="理由（任意）"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="通報理由"
      />
      <button
        className="rounded bg-orange-600 text-white px-3 py-1"
        onClick={onSubmit}
        disabled={loading}
        aria-disabled={loading}
        aria-label="通報する"
        title="不適切な内容を通報します"
      >
        {loading ? '送信中...' : '通報'}
      </button>
    </div>
  );
}