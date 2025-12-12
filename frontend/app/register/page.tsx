'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '../../lib/api';
import { PREFECTURES, CITIES_BY_PREF_CODE } from '../../lib/japanLocation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [ageGroup, setAgeGroup] = useState('twenties');
  const [prefCode, setPrefCode] = useState('');
  const [cityCode, setCityCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // KYC optional upload
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [myNumberFile, setMyNumberFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [licenseMediaId, setLicenseMediaId] = useState<string | null>(null);
  const [myNumberMediaId, setMyNumberMediaId] = useState<string | null>(null);

  useEffect(() => {
    setCityCode('');
  }, [prefCode]);

  async function uploadKyc(file: File): Promise<string | null> {
    const form = new FormData();
    form.append('file', file);
    form.append('category', 'kyc');
    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/media/upload`, {
        method: 'POST',
        body: form,
        credentials: 'include',
      });
      setUploading(false);
      if (!res.ok) {
        alert('アップロードに失敗しました');
        return null;
      }
      const data = await res.json();
      return data.mediaId as string;
    } catch (e: any) {
      setUploading(false);
      alert(e?.message || 'アップロードに失敗しました');
      return null;
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !nickname || !phone || !email || !password) {
      alert('必須項目を入力してください');
      return;
    }

    if (licenseFile) {
      const id = await uploadKyc(licenseFile);
      if (id) setLicenseMediaId(id);
    }
    if (myNumberFile) {
      const id = await uploadKyc(myNumberFile);
      if (id) setMyNumberMediaId(id);
    }

    const regionId = cityCode || prefCode || '';

    const payload = {
      name,
      nickname, // ニックネーム（表示させる名前）
      ageGroup,
      regionId,
      phone,
      email,
      password,
      kycDocuments: {
        licenseMediaId,
        myNumberMediaId,
      },
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      alert(`登録失敗: ${text}`);
      return;
    }

    alert('登録成功。ログインしてください');
    location.href = '/login';
  }

  return (
    <div className="bg-white border rounded p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-3">新規登録</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
        <label className="col-span-2">
          <span className="block text-sm text-gray-600">名前</span>
          <input className="border rounded px-3 py-2 w-full" value={name} onChange={(e)=>setName(e.target.value)} required />
        </label>

        <label className="col-span-2">
          <span className="block text-sm text-gray-600">ニックネーム（表示させる名前）</span>
          <input className="border rounded px-3 py-2 w-full" value={nickname} onChange={(e)=>setNickname(e.target.value)} required />
        </label>

        <label>
          <span className="block text-sm text-gray-600">年代</span>
          <select className="border rounded px-3 py-2 w-full" value={ageGroup} onChange={(e)=>setAgeGroup(e.target.value)}>
            <option value="teen">10代</option>
            <option value="twenties">20代</option>
            <option value="thirties">30代</option>
            <option value="forties">40代</option>
            <option value="fifties">50代</option>
            <option value="sixties_plus">60代以上</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3 col-span-2">
          <label>
            <span className="block text-sm text-gray-600">都道府県</span>
            <select className="border rounded px-3 py-2 w-full" value={prefCode} onChange={(e)=>setPrefCode(e.target.value)}>
              <option value="">選択してください</option>
              {PREFECTURES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>
          </label>
          <label>
            <span className="block text-sm text-gray-600">市区町村</span>
            <select className="border rounded px-3 py-2 w-full" value={cityCode} onChange={(e)=>setCityCode(e.target.value)} disabled={!prefCode}>
              <option value="">選択してください</option>
              {(CITIES_BY_PREF_CODE[prefCode] || []).map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
        </div>

        <label>
          <span className="block text-sm text-gray-600">電話</span>
          <input className="border rounded px-3 py-2 w-full" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
        </label>

        <label>
          <span className="block text-sm text-gray-600">メール</span>
          <input className="border rounded px-3 py-2 w-full" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>

        <label className="col-span-2">
          <span className="block text-sm text-gray-600">パスワード</span>
          <input className="border rounded px-3 py-2 w-full" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </label>

        <div className="col-span-2">
          <span className="block text-sm text-gray-600 mb-1">KYC（任意）</span>
          <div className="flex flex-col md:flex-row gap-2">
            <label className="flex-1">
              <span className="block text-sm">免許証の画像（任意）</span>
              <input type="file" accept="image/*" onChange={(e)=>setLicenseFile(e.target.files?.[0] || null)} />
            </label>
            <label className="flex-1">
              <span className="block text-sm">マイナンバーの画像（任意）</span>
              <input type="file" accept="image/*" onChange={(e)=>setMyNumberFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          {uploading && <div className="text-sm text-gray-600 mt-1">アップロード中…</div>}
        </div>

        <button className="rounded bg-blue-600 text-white px-3 py-2 col-span-2">登録</button>
      </form>
    </div>
  );
}