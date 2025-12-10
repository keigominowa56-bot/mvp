import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 既存の API で /auth/me がある場合はそれを使って現在ユーザーを取得
    // ない場合は、トークン存在チェックだけでもOK
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      // 簡易: トークンがあればログイン扱い。厳密には /auth/me を呼ぶ
      setUser({ id: 1, name: 'You' });
    } else {
      setUser(null);
    }
  }, []);

  return (
    <header className="flex items-center justify-between p-3 border-b">
      <Link href="/">MVP</Link>
      <nav className="flex gap-3">
        {user ? (
          <>
            <Link href="/me">マイページ</Link>
            <button onClick={() => { localStorage.removeItem('token'); location.href = '/'; }}>
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-primary">ログイン</Link>
            <Link href="/register" className="btn btn-secondary">新規登録</Link>
          </>
        )}
      </nav>
    </header>
  );
}