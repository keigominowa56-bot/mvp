'use client';
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

type Report = {
  id: string;
  reporterId: string;
  reporterName?: string;
  targetType: 'user' | 'post' | 'comment';
  targetId: string;
  type: string;
  reasonCategory?: string;
  reasonText?: string;
  status: string;
  createdAt: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadReports() {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
        setReportCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error('通報一覧の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4">読み込み中...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">通報一覧</h1>
        {reportCount > 0 && (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full">
            {reportCount}件の通報
          </span>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white border rounded p-4 text-center text-gray-500">
          通報はありません
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border rounded p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status === 'pending' ? '未対応' :
                       report.status === 'reviewing' ? '対応中' :
                       report.status === 'resolved' ? '解決済み' : report.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {report.targetType === 'post' ? '投稿' :
                       report.targetType === 'comment' ? 'コメント' : 'ユーザー'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    通報者: {report.reporterName || report.reporterId.slice(0, 8)}
                  </p>
                  {report.reasonCategory && (
                    <p className="text-sm font-semibold mb-1">
                      理由カテゴリ: {report.reasonCategory}
                    </p>
                  )}
                  {report.reasonText && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{report.reasonText}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

