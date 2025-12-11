'use client';
import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { getToken } from '../../lib/auth';

export default function WalletPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? getToken() : null;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/wallet/transactions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setTxs);
  }, [token]);

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold mb-2">取引履歴</h1>
      <ul className="flex flex-col gap-2">
        {txs.map((t) => (
          <li key={t.id} className="border rounded px-3 py-2 flex justify-between">
            <span>{t.type}</span>
            <span>{t.amount} {t.currency}</span>
            <span className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}