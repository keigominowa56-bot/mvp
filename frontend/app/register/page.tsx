'use client';
import { useState } from 'react';
import { API_BASE } from '../../lib/api';
import { AgeGroup } from './types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('twenties');
  const [regionId, setRegionId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, nickname, ageGroup, regionId, phone, email, password }),
    });
    if (!res.ok) {
      alert('登録失敗');
      return;
    }
    alert('登録成功。ログインしてください');
    location.href = '/login';
  }

  return (
    <div className="bg-white border rounded p-4">
      <h1 className="text-xl font-bold mb-3">新規登録</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-2">
        <input className="border rounded px-3 py-2 col-span-2" placeholder="名前" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="border rounded px-3 py-2 col-span-2" placeholder="ニックネーム" value={nickname} onChange={(e)=>setNickname(e.target.value)} />
        <select className="border rounded px-3 py-2" value={ageGroup} onChange={(e)=>setAgeGroup(e.target.value as AgeGroup)}>
          <option value="teen">10代</option>
          <option value="twenties">20代</option>
          <option value="thirties">30代</option>
          <option value="forties">40代</option>
          <option value="fifties">50代</option>
          <option value="sixties_plus">60代以上</option>
        </select>
        <select className="border rounded px-3 py-2" value={regionId} onChange={(e)=>setRegionId(e.target.value)}>
          <option value="">地域</option>
          <option value="tokyo">東京都(例)</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder="電話" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="メール" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="border rounded px-3 py-2 col-span-2" type="password" placeholder="パスワード" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="rounded bg-blue-600 text-white px-3 py-2 col-span-2">登録</button>
      </form>
    </div>
  );
}