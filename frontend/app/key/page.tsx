'use client';
import { useState } from 'react';
import { API_BASE } from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function KycPage() {
  const [file, setFile] = useState<File | null>(null);
  const token = typeof window !== 'undefined' ? getToken() : null;

  async function uploadDoc() {
    if (!token || !file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('category', 'kyc');
    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) return alert('アップロード失敗');
    alert('アップロードしました（審査待ち）');
  }

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold mb-2">KYC ドキュメント</h1>
      <input type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
      <button className="rounded bg-blue-600 text-white px-3 py-1 mt-2" onClick={uploadDoc}>アップロード</button>
    </div>
  );
}