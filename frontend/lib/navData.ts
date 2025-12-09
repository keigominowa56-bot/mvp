// frontend/lib/navData.ts
import { Home, Users, Zap, BookOpen, User, Settings, LogOut } from 'lucide-react';

/**
 * 左サイドバーのナビゲーションアイテムの型定義
 */
export interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType; // Lucide Iconの型
    isAuthRequired: boolean; // 認証が必要なリンクかどうか
}

/**
 * メインナビゲーションリンク
 */
export const mainNavItems: NavItem[] = [
    {
        name: 'ホーム',
        href: '/',
        icon: Home,
        isAuthRequired: false,
    },
    {
        name: 'タイムライン',
        href: '/timeline',
        icon: Zap,
        isAuthRequired: false,
    },
    {
        name: '議員一覧',
        href: '/members',
        icon: Users,
        isAuthRequired: false,
    },
    // {
    //     name: '公約一覧',
    //     href: '/pledges',
    //     icon: BookOpen,
    //     isAuthRequired: false,
    // },
    // {
    //     name: 'プロフィール',
    //     href: '/profile',
    //     icon: User,
    //     isAuthRequired: true,
    // },
];

/**
 * 設定・ログアウトリンク
 */
export const utilityNavItems: NavItem[] = [
    {
        name: '設定',
        href: '/settings',
        icon: Settings,
        isAuthRequired: true,
    },
    {
        name: 'ログアウト',
        href: '/logout',
        icon: LogOut,
        isAuthRequired: true,
    },
];

// ログイン/登録ページへの案内
export const authNavItems: NavItem[] = [
    {
        name: 'ログイン',
        href: '/login',
        icon: User,
        isAuthRequired: false,
    },
];