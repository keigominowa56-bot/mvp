import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Political SNS',
  description: 'Twitter-like political SNS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4">
            <Link href="/" className="font-bold">Political SNS</Link>
            <form
              action="/search"
              method="GET"
              className="flex-1"
            >
              <input name="q" placeholder="検索…" className="w-full border rounded px-3 py-1" />
            </form>
            <nav className="flex items-center gap-3">
              <Link href="/timeline">タイムライン</Link>
              <Link href="/notifications">通知</Link>
              <Link href="/login">ログイン</Link>
              <Link href="/register" className="rounded bg-blue-600 text-white px-3 py-1">新規登録</Link>
            </nav>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-4 grid grid-cols-12 gap-4">
          <aside className="col-span-3 bg-white border rounded p-3">
            <h2 className="font-semibold mb-2">フィルタ</h2>
            <form action="/timeline" method="GET" className="flex flex-col gap-2">
              <select name="region" className="border rounded px-2 py-1">
                <option value="">地域（任意）</option>
                <option value="tokyo">東京都</option>
                <option value="osaka">大阪府</option>
                <option value="kanagawa">神奈川県</option>
              </select>
              <select name="party" className="border rounded px-2 py-1">
                <option value="">政党（任意）</option>
                <option value="liberal">自由党</option>
                <option value="conservative">保守党</option>
              </select>
              <button type="submit" className="rounded bg-gray-800 text-white px-3 py-1">適用</button>
            </form>
          </aside>
          <main className="col-span-9">{children}</main>
        </div>
      </body>
    </html>
  );
}