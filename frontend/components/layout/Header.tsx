// frontend/components/layout/Header.tsx
'use client'; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react'; 
import toast from 'react-hot-toast'; // 💡 トーストをインポート

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter(); 

  // ログアウト処理 (状態クリアとリダイレクト、トースト表示をすべて実行)
  const handleLogout = () => {
    // 1. 認証状態をクリア (AuthContext.tsx で実装済み)
    logout(); 
    
    // 2. 成功メッセージを表示
    toast.success('ログアウトしました。'); 
    
    // 3. ログインページへ強制リダイレクト
    router.push('/login'); 
  };
  
  const navItems = [];

  return (
    // サイドバー（幅64）の右にヘッダーを配置するスタイル
    <header className="fixed top-0 left-0 md:left-64 right-0 z-40 bg-white shadow-md p-4 flex justify-between items-center dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      
      <Link href="/" className="text-xl font-semibold text-blue-700 dark:text-white transition-colors">
        {isAuthenticated ? 'ダッシュボード' : '透明化プラットフォーム'}
      </Link>
      
      <nav className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* ユーザー名表示 */}
            <span className="text-gray-700 text-sm dark:text-gray-300 hidden sm:inline truncate max-w-[150px]">
              ようこそ, {user?.name || user?.email}
            </span>
            
            {/* ログアウトボタン */}
            <button
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-sm transition duration-150 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1 hidden sm:inline" />
              ログアウト
            </button>
          </>
        ) : (
          /* 未認証時はログインリンクを表示 */
          <Link 
            href="/login" 
            className="text-white bg-blue-600 hover:bg-blue-700 font-bold py-1.5 px-3 rounded text-sm transition duration-150"
          >
            ログイン/登録
          </Link>
        )}
      </nav>
    </header>
  );
}