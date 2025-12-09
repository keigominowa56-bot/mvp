'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminReports, adminReportAction, Report } from '../lib/api.reports';

export default function AdminReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionRunning, setActionRunning] = useState<number | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    const list = await fetchAdminReports();
    setReports(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function doAction(id: number, action: string) {
    setActionRunning(id);
    const ok = await adminReportAction(id, action);
    setActionRunning(null);
    if (!ok) {
      setErr('操作に失敗しました');
    } else {
      await load();
    }
  }

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      {!loading && reports.length === 0 && (
        <p className="text-sm text-gray-500">通報はまだありません。</p>
      )}
      <ul className="space-y-3">
        {reports.map(r => (
          <li
            key={r.id}
            className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm text-xs space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-gray-500">REPORT #{r.id}</span>
              <span
                className={
                  'px-2 py-[2px] rounded text-[10px] ' +
                  (r.status === 'open'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-green-50 text-green-600 border border-green-200')
                }
              >
                {r.status}
              </span>
            </div>
            <div className="text-gray-700">
              対象: {r.targetType} #{r.targetId}
            </div>
            <div className="text-gray-600 break-all">
              理由: {r.reason}
            </div>
            {r.adminAction && (
              <div className="text-[10px] text-gray-500">action: {r.adminAction}</div>
            )}
            <div className="flex gap-2">
              {r.status === 'open' && (
                <>
                  <button
                    disabled={actionRunning === r.id}
                    onClick={() => doAction(r.id, 'hide')}
                    className="px-2 py-1 rounded bg-red-600 text-white disabled:opacity-50"
                  >
                    {actionRunning === r.id ? '処理中...' : '非表示 (hide)'}
                  </button>
                  <button
                    disabled={actionRunning === r.id}
                    onClick={() => doAction(r.id, 'ignore')}
                    className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-300"
                  >
                    {actionRunning === r.id ? '処理中...' : '無視 (ignore)'}
                  </button>
                </>
              )}
            </div>
            <div className="text-[9px] text-gray-400">
              送信: {new Date(r.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
      <div className="text-[10px] text-gray-400">
        ※ 操作後は自動で更新されます。ブラウザフォーカス復帰時にも再読み込み推奨。
      </div>
    </div>
  );
}