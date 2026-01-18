import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Polimee',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="light">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

// Next.js layout: default export is required by framework; no extra named export needed