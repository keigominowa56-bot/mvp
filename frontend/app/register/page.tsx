'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { app } from '../../lib/firebase';
import { API_BASE } from '../../lib/api';
import { PREFECTURES, CITIES_BY_PREF } from '../../lib/japanLocation';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const surveyCompleted = searchParams?.get('survey_completed') === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [prefectureCode, setPrefectureCode] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // 都道府県名を取得
  const selectedPrefecture = PREFECTURES.find(p => p.code === prefectureCode)?.name || '';

  // 市区町村一覧
  const cities = selectedPrefecture ? CITIES_BY_PREF[selectedPrefecture] || [] : [];

  // ユーザーIDの重複チェック
  async function checkUsernameAvailability(usernameValue: string) {
    if (!usernameValue || usernameValue.length < 3) {
      return { available: false, message: 'ユーザーIDは3文字以上必要です' };
    }
    if (!/^[a-z0-9_]+$/.test(usernameValue)) {
      return { available: false, message: 'ユーザーIDは英数字とアンダースコアのみ使用可能です' };
    }
    setCheckingUsername(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/check-username?username=${encodeURIComponent(usernameValue)}`);
      const data = await res.json();
      return { available: data.available, message: data.message || '' };
    } catch {
      return { available: false, message: '確認に失敗しました' };
    } finally {
      setCheckingUsername(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const auth = getAuth(app);
      // Firebaseで新規作成
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      // 名前をFirebase Authに反映
      await updateProfile(userCred.user, { displayName: name });
      // メアド認証メール送信
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }

      // メール認証が完了するまで待機（ポーリング）
      setMsg('確認メールを送信しました。メール内リンクをクリックしてアカウント認証を完了してください。認証完了後、自動的に登録を完了します。');
      
      // メール認証完了を待機（最大30秒）
      let attempts = 0;
      const maxAttempts = 30;
      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          // Firebaseの認証状態を再取得
          await userCred.user.reload();
          if (userCred.user.emailVerified) {
            clearInterval(checkInterval);
            // メール認証完了後、サーバDB側にもユーザーを登録
            const idToken = await userCred.user.getIdToken(true); // 強制的にトークンを更新
            const prefectureName = selectedPrefecture;
            const registerUrl = `${API_BASE}/api/auth/register-firebase`;

            const res = await fetch(registerUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
              },
              credentials: 'include',
              body: JSON.stringify({
                name,
                username,
                email,
                phone,
                prefecture: prefectureName,
                prefectureCode,
                city,
                birthDate,
              }),
            });
            
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              throw new Error(errorData.message || 'サーバー登録に失敗しました');
            }

            // 登録成功後、ログイン処理を実行
            const loginUrl = `${API_BASE}/api/auth/login-firebase`;
            const loginRes = await fetch(loginUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
              credentials: 'include',
              body: JSON.stringify({}),
            });
            
            if (loginRes.ok) {
              const loginData = await loginRes.json();
              if (loginData.token) {
                localStorage.setItem('auth_token', loginData.token);
                
                // アンケート完了後の登録の場合、アンケートデータを再送信
                if (surveyCompleted) {
                  const pendingSurvey = sessionStorage.getItem('pending_survey_response');
                  if (pendingSurvey) {
                    try {
                      const surveyData = JSON.parse(pendingSurvey);
                      console.log('📝 アンケートデータを再送信します:', surveyData);
                      
                      // ユーザー情報を取得
                      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
                        headers: { 'Authorization': `Bearer ${loginData.token}` },
                        credentials: 'include'
                      });
                      
                      if (meRes.ok) {
                        const me = await meRes.json();
                        const surveyResponse = await fetch('/api/campaign/survey', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${loginData.token}`,
                          },
                          body: JSON.stringify({
                            ...surveyData,
                            uid: me?.id || userCred.user.uid,
                            email: me?.email || userCred.user.email,
                            emailVerified: true,
                          }),
                        });
                        
                        if (surveyResponse.ok) {
                          console.log('✅ アンケートデータの再送信が完了しました');
                          sessionStorage.removeItem('pending_survey_response');
                          setMsg('登録が完了しました。アンケートの回答もあなたのアカウントに紐付けられました。');
                          setTimeout(() => {
                            const redirectTo = searchParams?.get('redirect') || '/campaign/thanks';
                            location.href = redirectTo;
                          }, 2000);
                          return;
                        }
                      }
                    } catch (surveyError) {
                      console.error('❌ アンケートデータの再送信エラー:', surveyError);
                    }
                  }
                }
                
                setMsg('登録が完了しました。アンケートページに移動します。');
                setTimeout(() => {
                  const redirectTo = surveyCompleted ? (searchParams?.get('redirect') || '/campaign/thanks') : '/surveys';
                  location.href = redirectTo;
                }, 2000);
              } else {
                setMsg('登録は完了しましたが、ログインに失敗しました。ログインページから再度ログインしてください。');
                setTimeout(() => {
                  location.href = '/login';
                }, 3000);
              }
            } else {
              setMsg('登録は完了しましたが、ログインに失敗しました。ログインページから再度ログインしてください。');
              setTimeout(() => {
                location.href = '/login';
              }, 3000);
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setMsg('メール認証の確認がタイムアウトしました。メール内リンクをクリック後、ログインページからログインしてください。');
          }
        } catch (err: any) {
          console.error('メール認証確認エラー:', err);
        }
      }, 1000); // 1秒ごとにチェック

      // 30秒後にタイムアウト
      setTimeout(() => {
        clearInterval(checkInterval);
      }, maxAttempts * 1000);

    } catch (err: any) {
      // Firebaseエラーコードに応じて日本語メッセージを表示
      if (err.code === 'auth/email-already-in-use') {
        setMsg('このメールアドレスは既に登録されています');
      } else if (err.code === 'auth/weak-password') {
        setMsg('パスワードは6文字以上にしてください');
      } else if (err.code === 'auth/invalid-email') {
        setMsg('メールアドレスの形式が正しくありません');
      } else {
        setMsg(err?.message ?? '登録に失敗しました（入力項目をご確認ください）');
      }
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-xl border shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">アカウント新規登録</h1>
          <p className="text-gray-500 text-sm">全項目を正確にご入力ください</p>
        </div>
        {msg && <div className="mb-3 p-2 rounded bg-blue-50 text-blue-800 border border-blue-200">{msg}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            placeholder="名前（ニックネーム可）"
            value={name}
            required
            onChange={e => setName(e.target.value)}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">@</span>
              <input
                type="text"
                className="flex-1 border px-3 py-2 rounded"
                placeholder="ユーザーID（英数字とアンダースコアのみ）"
                value={username}
                required
                pattern="[a-z0-9_]+"
                minLength={3}
                onChange={e => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setUsername(value);
                }}
                onBlur={async () => {
                  if (username) {
                    const result = await checkUsernameAvailability(username);
                    if (!result.available) {
                      setMsg(result.message || 'このユーザーIDは使用できません');
                    }
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">3文字以上、英数字とアンダースコアのみ使用可能。他のユーザーと重複できません</p>
          </div>
          <input
            type="tel"
            className="w-full border px-3 py-2 rounded"
            placeholder="電話番号（例: 09012345678）"
            value={phone}
            pattern="^[0-9]{10,11}$"
            required
            onChange={e => setPhone(e.target.value)}
          />
          <select
            className="w-full border px-3 py-2 rounded"
            required
            value={prefectureCode}
            onChange={e => {
              setPrefectureCode(e.target.value);
              setCity('');
            }}
          >
            <option value="">都道府県を選択</option>
            {PREFECTURES.map(p => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          {cities.length > 0 && (
            <select
              className="w-full border px-3 py-2 rounded"
              required
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="">市区町村を選択</option>
              {cities.map(cityName => (
                <option key={cityName} value={cityName}>{cityName}</option>
              ))}
            </select>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">生年月日 *</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={birthDate}
              required
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setBirthDate(e.target.value)}
            />
          </div>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            placeholder="メールアドレス"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            placeholder="パスワード（6文字以上）"
            value={password}
            required
            minLength={6}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded font-bold disabled:opacity-60"
            disabled={loading}
          >
            {loading ? '登録中...' : '登録してメール認証へ'}
          </button>
        </form>
        <div className="mt-5 text-center">
          <Link href="/login" className="text-blue-700 underline">すでにアカウントをお持ちの方はこちら</Link>
        </div>
      </div>
    </div>
  );
}
