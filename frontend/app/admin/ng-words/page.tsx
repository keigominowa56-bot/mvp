'use client';
import useSWR from 'swr';
import { listNgWords, addNgWord, removeNgWord } from '../../../lib/api-extended';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AdminNgWordsPage() {
  const { isAdmin } = useAuth();
  const { data, mutate } = useSWR(isAdmin ? ['ngWords'] : null, listNgWords);
  const [word, setWord] = useState('');
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  if (!isAdmin) return <div>管理者のみ</div>;

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    try {
      await addNgWord(word);
      setWord('');
      mutate();
      setMsg('追加しました');
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  async function onRemove(id: string) {
    try {
      await removeNgWord(id);
      mutate();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">NGワード管理</h1>
      <div className="card space-y-2">
        <form onSubmit={onAdd} className="flex gap-2">
          <input className="border rounded px-2 py-1 text-sm flex-1" placeholder="ワード" value={word} onChange={(e) => setWord(e.target.value)} />
          <button className="border rounded px-3 py-1 text-sm">追加</button>
        </form>
        {msg && <div className="text-xs text-green-600">{msg}</div>}
        {err && <div className="text-xs text-red-600">{err}</div>}
        <ul className="space-y-1 text-xs">
          {data?.map((w: any) => (
            <li key={w.id} className="flex justify-between border rounded px-2 py-1">
              <span>{w.word}</span>
              <button className="text-red-600" onClick={() => onRemove(w.id)}>削除</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}