// frontend/components/layout/MainLayout.tsx

import React from 'react';
import Sidebar from './Sidebar'; // Sidebarは同じフォルダ内なので相対パス（./）でOK

interface MainLayoutProps {
    children: React.ReactNode;
}

// ----------------------------------------------------
// 💡 右サイドバーのモック
// ----------------------------------------------------
// 今はシンプルに広告スペースとして定義します
const RightSidebarMock: React.FC = () => (
    <div className="sticky top-0 p-4 space-y-4">
        {/* 収益化 B: 広告 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">広告・おすすめ</h3>
            <div className="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-sm rounded">
                サイト内広告スペース（収益化 B）
            </div>
        </div>
        
        {/* トレンド（データSaaSのデモも兼ねる） */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">地域のトレンド</h3>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <li>#給食費無償化 (2.5K 賛否)</li>
                <li>#駅前再開発 (1.2K 議論)</li>
                <li>#子育て支援策</li>
            </ul>
        </div>
    </div>
);


export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex max-w-7xl mx-auto">
                
                {/* 1. 左サイドバー (ナビゲーション) */}
                <aside className="w-16 lg:w-64 flex-shrink-0">
                    <Sidebar />
                </aside>

                {/* 2. 中央コンテンツ (メインエリア) */}
                <main className="flex-grow border-x border-gray-200 dark:border-gray-700 min-h-screen w-full lg:w-1/2">
                    {children}
                </main>

                {/* 3. 右サイドバー (広告・ウィジェット) */}
                <aside className="hidden lg:block w-80 xl:w-96 flex-shrink-0 sticky top-0 h-screen">
                    <RightSidebarMock />
                </aside>
            </div>
        </div>
    );
}