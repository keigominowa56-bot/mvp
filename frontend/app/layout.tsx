import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import Footer from '../components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        <AuthProvider>
          <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <Sidebar />
            </div>
            <section className="md:col-span-6 space-y-6">
              {children}
              <Footer />
            </section>
            <div className="md:col-span-3">
              <RightSidebar />
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}