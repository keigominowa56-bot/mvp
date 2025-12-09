'use client';

import React, { useState } from 'react';

type Props = {
  targetType: string;
  targetId: number;
  onSubmit(reason: string): Promise<void>;
  onClose(): void;
};

const PRESET_REASONS = [
  { value: 'spam', label: 'スパム / 宣伝' },
  { value: 'abuse', label: '誹謗中傷' },
  { value: 'misinfo', label: '誤情報の可能性' },
  { value: 'other', label: 'その他' }
];

export default function ReportModal({ targetType, targetId, onSubmit, onClose }: Props) {
  const [reason, setReason] = useState('spam');
  const [detail, setDetail] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setDone(false);
    setSending(true);
    try {
      const finalReason = reason === 'other' && detail.trim() ? detail.trim() : reason;
      await onSubmit(finalReason);
      setDone(true);
      setTimeout(() => onClose(), 1000);
    } catch (e: any) {
      setErr(e.message || '通報に失敗しました');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => (!sending ? onClose() : null)}
      />
      <form
        onSubmit={handle}
        className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-lg border border-gray-200 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold">通報フォーム</h3>
        <p className="text-[11px] text-gray-500">
          対象: {targetType} #{targetId}
        </p>
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            理由の選択
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_REASONS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={
                  'px-2 py-1 rounded border text-[11px] ' +
                  (reason === r.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100')
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {reason === 'other' && (
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            required
            placeholder="詳細理由を記載してください"
            className="w-full border rounded p-2 text-xs min-h-[80px]"
          />
        )}
        {err && <div className="text-[11px] text-red-600">{err}</div>}
        {done && <div className="text-[11px] text-green-600">通報を送信しました</div>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            disabled={sending}
            onClick={onClose}
            className="px-3 py-1 rounded border text-xs hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            disabled={sending}
            className="px-3 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-50"
          >
            {sending ? '送信中...' : '通報する'}
          </button>
        </div>
        <p className="text-[10px] text-gray-400">
          ※ 不適切と判断されれば管理者により非表示処理が行われます。
        </p>
      </form>
    </div>
  );
}