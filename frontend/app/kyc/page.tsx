'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';

export default function KycPage() {
  const [status, setStatus] = useState<'pending'|'verified'|'rejected'|'unknown'>('unknown');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch KYC status via /auth/me in real impl
    setStatus('pending');
  }, []);

  async function uploadDoc() {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('category', 'kyc');
    setUploading(true);
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
    setUploading(false);
    if (!res.ok) {
      alert('アップロード失敗');
      return;
    }
    alert('アップロードしました（審査待ち）');
  }

  return (
    <div className="bg-white border rounded p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-3">KYC ステータス</h1>
      <p className="mb-3">現在のステータス: <b>{status}</b></p>
      <input type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
      <button className="rounded bg-blue-600 text-white px-3 py-1 mt-2" onClick={uploadDoc} disabled={uploading}>
        {uploading ? 'アップロード中...' : 'アップロード'}
      </button>
      <div className="mt-3 text-sm text-gray-600">アップロード後、通知に審査メッセージが届く前提です。</div>
    </div>
  );
}