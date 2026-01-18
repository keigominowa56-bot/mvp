'use client';

import Link from 'next/link';
import { AppShell } from '../components/AppShell';
import { AuthProvider } from '../contexts/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between relative">
          <div className="flex-1"></div>
          <Link href="/" className="font-bold absolute left-1/2 -translate-x-1/2">Polimee</Link>
          <div className="flex-1 flex justify-end items-center gap-3">
            <Link href="/login">ログイン</Link>
            <Link href="/register" className="rounded bg-blue-600 text-white px-3 py-1">新規登録</Link>
          </div>
        </div>
      </header>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}

