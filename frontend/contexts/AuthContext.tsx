'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getMe, Me } from '../lib/api';

type Role = 'citizen' | 'politician' | 'admin' | 'user'; // 'user'は'citizen'の互換性のため
type User = { id: string; email: string; role: Role };

type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  isUser: boolean;
  isPolitician: boolean;
  isAdmin: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  ready: boolean; // ログイン判定が確定したか
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const userRef = useRef<User | null>(null);
  
  // userの変更をrefに同期
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refresh = useCallback(async () => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    try {
      const me = await getMe();
      setUser(me as Me);
    } catch {
      // トークン不正/期限切れ → 破棄
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // ストレージイベントを監視して、他のタブでログイン/ログアウトされた場合にも対応
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'token') {
        console.log('🔔 Storage changed, refreshing auth state...');
        refresh();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 定期的にトークンの有効性をチェック（5分ごと）
    const interval = setInterval(() => {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null;
      if (token && !userRef.current) {
        // トークンはあるがユーザー情報がない場合、再試行
        console.log('🔄 Token exists but user is null, retrying refresh...');
        refresh();
      }
    }, 5 * 60 * 1000); // 5分
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refresh]);

  async function loginWithToken(token: string) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token); // 互換性のため
    setReady(false);
    await refresh();
  }

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    isUser: user?.role === 'user' || user?.role === 'citizen', // 'citizen'も一般ユーザーとして扱う
    isPolitician: user?.role === 'politician',
    isAdmin: user?.role === 'admin',
    loginWithToken,
    logout,
    ready,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}