'use client';

import './globals.css';
import Link from 'next/link';
import { AppShell } from '../components/AppShell';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="light">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-50 bg-white border-b">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4">
            <Link href="/" className="font-bold">Political SNS</Link>
            <div className="ml-auto flex items-center gap-3">
              <Link href="/login">ログイン</Link>
              <Link href="/register" className="rounded bg-blue-600 text-white px-3 py-1">新規登録</Link>
            </div>
          </div>
        </header>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

// Next.js layout: default export is required by framework; no extra named export needed