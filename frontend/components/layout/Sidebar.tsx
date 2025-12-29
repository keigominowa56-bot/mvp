// frontend/components/layout/Sidebar.tsx

'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// 💡 正しいインポートパス: 相対パスを使用（拡張子は不要）
// Sidebarは /frontend/components/layout にいるので、2つ上の階層 (/frontend/) に上がり、/lib/navData へ
import { NavItem, mainNavItems, utilityNavItems, authNavItems } from '../../lib/navData';
import { User, LogIn, LogOut, Zap } from 'lucide-react';

// 認証ロジックのモック（後で実装）
const useAuth = () => ({ isAuthenticated: true, user: { name: '市民 太郎' } });

// --- NavLink, UserProfileWidget, Sidebar の定義は省略 ---

const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const pathname = usePathname();
    const isActive = pathname === item.href;

    return (
        <Link
            href={item.href}
            className={`
                flex items-center space-x-4 p-3 rounded-full transition-colors duration-200
                hover:bg-gray-100 dark:hover:bg-gray-800
                ${isActive
                    ? 'font-extrabold text-blue-600 dark:text-blue-400'
                    : 'font-medium text-gray-800 dark:text-gray-200'
                }
            `}
        >
            <item.icon className={`h-6 w-6 ${isActive ? 'fill-blue-600 dark:fill-blue-400' : 'text-gray-800 dark:text-gray-200'}`} />
            <span className="text-xl hidden lg:inline">{item.name}</span>
        </Link>
    );
}

const UserProfileWidget: React.FC<{ isAuthenticated: boolean, user: { name: string } | null }> = ({ isAuthenticated, user }) => {
    return (
        <div className="mt-auto pt-4">
            {isAuthenticated ? (
                <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user?.name ? user.name[0] : <User className="w-5 h-5" />}
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@user_mock</p>
                    </div>
                </div>
            ) : (
                <Link
                    href="/login"
                    className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                    <LogIn className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <span className="text-xl font-medium hidden lg:inline text-gray-800 dark:text-gray-200">ログイン</span>
                </Link>
            )}
        </div>
    );
}

export default function Sidebar() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="fixed h-full border-r border-gray-200 dark:border-gray-700 w-16 lg:w-64">
            <div className="flex flex-col h-full p-2 lg:p-4">
                {/* ロゴ */}
                <div className="p-3 mb-4">
                    <Link href="/" className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        <Zap className="h-8 w-8" />
                    </Link>
                </div>

                {/* メインナビゲーション */}
                <nav className="flex flex-col space-y-1">
                    {mainNavItems.map(item => (
                        <NavLink key={item.href} item={item} />
                    ))}
                    {isAuthenticated ? (
                        <NavLink key="/profile" item={{ name: 'プロフィール', href: '/profile', icon: User, isAuthRequired: true }} />
                    ) : (
                        authNavItems.map(item => (
                            <NavLink key={item.href} item={item} />
                        ))
                    )}
                </nav>

                {/* ポストボタン */}
                <button
                    className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition-colors shadow-md"
                >
                    <span className="hidden lg:inline">意見を投稿</span>
                    <span className="lg:hidden">💬</span>
                </button>

                {/* ユーティリティ & プロフィール */}
                <div className="mt-auto">
                    {isAuthenticated && (
                        <nav className="flex flex-col space-y-1 mb-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                             {utilityNavItems.map(item => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </nav>
                    )}
                    <UserProfileWidget isAuthenticated={isAuthenticated} user={user} />
                </div>
            </div>
        </div>
    );
}