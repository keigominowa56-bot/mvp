'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function SurveysPage() {
  const [list, setList] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? getToken() : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/surveys/available`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setList);
  }, [token]);

  async function respond(id: string) {
    if (!token) return alert('ログインしてください');
    const res = await fetch(`${API_BASE}/surveys/${id}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ answers: { q1: 'yes' } }),
    });
    if (!res.ok) return alert('回答失敗');
    alert('回答しました');
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">アンケート</h1>
      {list.map((s) => (
        <div key={s.id} className="bg-white border rounded p-3">
          <div className="font-semibold">{s.title}</div>
          <div className="text-sm text-gray-600">{s.description}</div>
          <button className="rounded bg-blue-600 text-white px-3 py-1 mt-2" onClick={()=>respond(s.id)}>回答する</button>
        </div>
      ))}
    </div>
  );
}