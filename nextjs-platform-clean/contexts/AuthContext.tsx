// frontend/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast'; 
// import axios from 'axios'; // 💡 API連携時に使用

// --- 型定義 ---

// ユーザー情報（今後の本人確認情報を反映）
interface User {
    id: number;
    email: string;
    name: string;
    prefecture?: string; 
    city?: string;
    // ... その他必要なフィールド
}

// 会員登録フォームのデータ型
interface RegisterFormData {
    email: string;
    password: string;
    phoneNumber: string;
    age: string;
    prefecture: string;
    city: string;
    // ... その他すべての登録フィールド
}

// Auth Contextが提供する値の型
interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>; 
    logout: () => void; // 💡 トースト・リダイレクト処理を含まない純粋なログアウト関数
}

// 💡 Auth Contextの初期化
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- AuthProvider コンポーネント ---

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    // ログイン処理
    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
            console.log(`Attempting login for: ${email}`);
            
            // 🚨 【API呼び出しの仮ロジック】
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // 成功時: 状態を更新
            localStorage.setItem('authToken', 'fake-jwt-token-' + email); 
            setIsAuthenticated(true);
            setUser({ id: 1, email: email, name: 'テストユーザー' }); 
            
            toast.success('ログインに成功しました！');
            
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = (error as Error).message || 'ログインに失敗しました。';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // 会員登録処理
    const register = useCallback(async (data: RegisterFormData) => {
        setLoading(true);
        try {
            console.log("Registering user with data:", data);
            
            // 🚨 【API呼び出しの仮ロジック】
            await new Promise(resolve => setTimeout(resolve, 800)); 

            // 登録成功メッセージ (リダイレクトはRegisterForm側が担当)
            toast.success('会員登録に成功しました！ログインしてください。');
            
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = (error as Error).message || '会員登録に失敗しました。';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // ログアウト処理 (状態クリアのみ。トースト、リダイレクトはコンポーネント側で実行)
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    // 初期化処理（ページロード時にトークンチェック）
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // 💡 本来はここでトークンを検証し、ユーザー情報をフェッチするAPIを呼び出す
            setIsAuthenticated(true);
            setUser({ id: 1, email: 'fake@example.com', name: '既存ユーザー' });
        }
        setLoading(false);
    }, []);

    const contextValue = {
        isAuthenticated,
        loading,
        user,
        login,
        register, 
        logout, // 💡 contextValue に logout を含める
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Custom Hook (useAuth) ---

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};