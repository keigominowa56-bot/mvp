import React from 'react';

export default function DashboardPage() {
  // ここで user.role を取得し、ナビゲーション等を動的に分岐してもOK
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ダッシュボード</h1>
      <div>ここに議員・運営それぞれの概要や通知などをまとめます。</div>
    </div>
  );
}