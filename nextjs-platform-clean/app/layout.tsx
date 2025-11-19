// frontend/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";

// 💡 AuthProvider, Toaster, MainLayoutのインポート
import MainLayout from '@/components/layout/MainLayout';
import { Toaster } from 'react-hot-toast'; // react-hot-toastのToasterをインポート
import { AuthProvider } from '@/contexts/AuthContext'; 

// 👇 Interフォントの定義
const inter = Inter({ subsets: ["latin"] }); 

export const metadata: Metadata = { 
  title: "Citizen Voice - 市民の声",
  description: "地域政治への参加を促すためのプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* 💡 bodyにフォントクラスと全体スタイルを適用 */}
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        {/* AuthProviderで認証コンテキストをアプリ全体に提供 */}
        <AuthProvider>
          {/* Toasterをアプリのルートに配置 (いいね機能の通知用) */}
          {/* 💡 position="top-right"などのオプションはToaster側で直接設定 */}
          <Toaster 
            position="top-right"
            reverseOrder={false} 
            toastOptions={{
              success: {
                style: {
                  background: '#4CAF50', // Tailwind green-600 相当
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#F44336', // Tailwind red-600 相当
                  color: '#fff',
                },
              },
            }}
          />
          {/* MainLayoutでナビゲーションやヘッダーなどの全体構造を定義 */}
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}