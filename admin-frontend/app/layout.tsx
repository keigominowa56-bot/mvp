import './globals.css';
import Sidebar from './components/Sidebar';

export const metadata = { 
  title: '議員・運営管理画面',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-gray-50 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}