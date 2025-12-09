'use client';
import { useState, useEffect, useMemo } from 'react';
import { register } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPrefectureNames, getCitiesByPrefName } from '../../lib/geoJP';
import { calcAgeFromBirthdate, ageOptions } from '../../lib/age';

type AgeMode = 'age-select' | 'birthdate';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [ageMode, setAgeMode] = useState<AgeMode>('age-select');
  const [ageSelect, setAgeSelect] = useState<number | ''>('');
  const [birthdate, setBirthdate] = useState('');
  const derivedAge = useMemo(() => (birthdate ? calcAgeFromBirthdate(birthdate) : null), [birthdate]);

  const [prefNames, setPrefNames] = useState<string[]>([]);
  const [prefName, setPrefName] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState('');

  const [phone, setPhone] = useState('');
  const [idUrl, setIdUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getPrefectureNames().then(setPrefNames).catch(console.error);
  }, []);

  useEffect(() => {
    if (!prefName) {
      setCities([]);
      setCity('');
      return;
    }
    getCitiesByPrefName(prefName).then((list) => {
      setCities(list);
      setCity('');
    });
  }, [prefName]);

  function validate() {
    if (!email || !password || !name) return '必須項目を入力してください';
    const finalAge = ageMode === 'age-select' ? (typeof ageSelect === 'number' ? ageSelect : null) : derivedAge;
    if (!finalAge || finalAge < 18) return '年齢は18歳以上で必須です';
    if (!prefName) return '都道府県を選択してください';
    if (!city) return '市区町村を選択してください';
    if (!phone && !idUrl) return '電話番号 または 身分証URL のいずれかを入力してください';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setError(null);
    setLoading(true);
    try {
      const finalAge = ageMode === 'age-select' ? Number(ageSelect) : Number(derivedAge);
      const res = await register({
        email,
        password,
        name,
        age: finalAge,
        addressPref: prefName,
        addressCity: city,
        phone: phone || undefined,
        governmentIdUrl: idUrl || undefined,
      });
      const token = res?.accessToken;
      if (!token) throw new Error('トークンが取得できませんでした');
      loginWithToken(token);
      router.push('/feed');
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card mt-10">
      <h1 className="text-lg font-semibold mb-3">新規登録（ユーザー）</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2 text-sm" placeholder="氏名" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="space-y-2">
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="ageMode" value="age-select" checked={ageMode === 'age-select'} onChange={() => setAgeMode('age-select')} />
              年齢を選択
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="ageMode" value="birthdate" checked={ageMode === 'birthdate'} onChange={() => setAgeMode('birthdate')} />
              生年月日で自動算出
            </label>
          </div>

          {ageMode === 'age-select' ? (
            <select className="w-full border rounded px-3 py-2 text-sm" value={ageSelect === '' ? '' : String(ageSelect)} onChange={(e) => setAgeSelect(e.target.value ? Number(e.target.value) : '')}>
              <option value="">年齢を選択</option>
              {ageOptions().map((a) => (
                <option key={a} value={a}>{a}歳</option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-3">
              <input className="flex-1 border rounded px-3 py-2 text-sm" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
              <span className="text-sm text-slate-600">{derivedAge ? `${derivedAge}歳` : '生年月日から自動算出'}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <select className="w-full border rounded px-3 py-2 text-sm" value={prefName} onChange={(e) => setPrefName(e.target.value)}>
            <option value="">都道府県を選択</option>
            {prefNames.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select className="w-full border rounded px-3 py-2 text-sm" value={city} onChange={(e) => setCity(e.target.value)} disabled={!prefName}>
            <option value="">{prefName ? '市区町村を選択' : '都道府県を先に選択してください'}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <input className="w-full border rounded px-3 py-2 text-sm" placeholder="電話番号（任意/身分証とどちらか必須）" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="w-full border rounded px-3 py-2 text-sm" placeholder="身分証の画像URL（任意/電話番号とどちらか必須）" value={idUrl} onChange={(e) => setIdUrl(e.target.value)} />

        <hr className="my-3" />
        <input className="w-full border rounded px-3 py-2 text-sm" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2 text-sm" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-xs text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium rounded bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? '送信中...' : '登録'}
        </button>
      </form>
      <p className="text-sm mt-3">
        すでにアカウントをお持ちの方は <a className="text-brand-600 hover:underline" href="/login">ログイン</a>
      </p>
    </div>
  );
}