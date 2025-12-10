'use client';

import { useEffect, useMemo, useState } from 'react';
import { PREFECTURES, CITIES_BY_PREF } from '../../lib/japanLocations';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [prefecture, setPrefecture] = useState<string>('');
  const [city, setCity] = useState<string>('');

  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [mynumberFile, setMynumberFile] = useState<File | null>(null);

  const cities = useMemo(() => {
    if (!prefecture) return [];
    return CITIES_BY_PREF[prefecture] ?? [];
  }, [prefecture]);

  useEffect(() => {
    setCity('');
  }, [prefecture]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.append('email', email);
    form.append('name', name);
    form.append('password', password);
    if (phone) form.append('phone', phone);
    if (prefecture) form.append('addressPrefecture', prefecture);
    if (city) form.append('addressCity', city);
    if (licenseFile) form.append('license', licenseFile);
    if (mynumberFile) form.append('mynumber', mynumberFile);

    try {
      const res = await fetch('/auth/register', { method: 'POST', body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error('[api error]', res.status, '/auth/register', data);
        alert('登録に失敗しました');
        return;
      }
      await res.json();
      alert('登録できました');
      location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('通信エラーです');
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">新規登録</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3">
          <input className="border rounded px-3 py-2" type="email" placeholder="メールアドレス" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input className="border rounded px-3 py-2" type="text" placeholder="氏名" value={name} onChange={(e)=>setName(e.target.value)} required />
          <input className="border rounded px-3 py-2" type="password" placeholder="パスワード（8文字以上）" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8} />
          <input className="border rounded px-3 py-2" type="tel" placeholder="電話番号（任意）" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">都道府県</label>
            <select className="border rounded px-3 py-2" value={prefecture} onChange={(e)=>setPrefecture(e.target.value)} required>
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (<option key={pref} value={pref}>{pref}</option>))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">市区町村</label>
            <select className="border rounded px-3 py-2" value={city} onChange={(e)=>setCity(e.target.value)} required disabled={!prefecture}>
              <option value="">{prefecture ? '選択してください' : '都道府県を先に選択'}</option>
              {cities.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">免許証アップロード（画像/PDF）</label>
            <input className="border rounded px-3 py-2 w-full" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e)=>setLicenseFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">マイナンバーアップロード（画像/PDF）</label>
            <input className="border rounded px-3 py-2 w-full" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e)=>setMynumberFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>

        <button type="submit" className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition">
          登録する
        </button>
      </form>
    </div>
  );
}