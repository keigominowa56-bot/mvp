'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function NotificationsPage() {
  const [list, setList] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? getToken() : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setList);
  }, [token]);

  async function markRead(id: string) {
    if (!token) return;
    await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
    setList((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold mb-2">未読通知</h1>
      <ul className="flex flex-col gap-2">
        {list.map((n) => (
          <li key={n.id} className="border rounded px-3 py-2">
            <div className="font-semibold">{n.title}</div>
            <div className="text-sm text-gray-600">{n.type}</div>
            <p className="mt-1">{n.body}</p>
            <button className="rounded bg-gray-800 text-white px-3 py-1 mt-2" onClick={()=>markRead(n.id)}>既読にする</button>
          </li>
        ))}
      </ul>
    </div>
  );
}