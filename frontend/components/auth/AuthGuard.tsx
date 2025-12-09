// frontend/components/auth/AuthGuard.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // ローディングアイコンとして仮置き

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証情報とローディングが完了した後
    if (!loading && !isAuthenticated) {
      // ログインしていない場合、ログインページにリダイレクト
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // ローディング中は何も表示しないか、ローディング画面を表示
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // 認証済みの場合のみ子コンポーネントを表示
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // リダイレクト処理中（通常、このreturnは短い間にしか実行されない）
  return null;
};

export default AuthGuard;