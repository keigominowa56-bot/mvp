#!/bin/bash
# サーバー側で実行する修正スクリプト

cd /root/mvp || exit 1

echo "=== 修正前の確認 ==="
if grep -n "メール認証が必要です" frontend/app/campaign/survey/page.tsx; then
    echo "メール認証チェックのコードが見つかりました。削除します..."
else
    echo "メール認証チェックのコードは見つかりませんでした。"
fi

# メール認証チェックのブロックを削除
# パターン1: 「メール認証が必要です」を含む行から、そのブロックの終わりまで
sed -i '/メール認証が必要です/,/ログインページへ<\/Link>/d' frontend/app/campaign/survey/page.tsx

# パターン2: 「メール認証未完了の場合」のコメントから、そのブロックの終わりまで
sed -i '/\/\/ メール認証未完了の場合/,/^  );$/d' frontend/app/campaign/survey/page.tsx

# emailVerified 関連のコードを削除
sed -i '/const \[emailVerified/d' frontend/app/campaign/survey/page.tsx
sed -i '/setEmailVerified/d' frontend/app/campaign/survey/page.tsx
sed -i '/emailVerified:/d' frontend/app/campaign/survey/page.tsx

# checkEmailVerified 関数を削除（もしあれば）
sed -i '/async function checkEmailVerified/,/^  }$/d' frontend/app/campaign/survey/page.tsx

echo "=== 修正後の確認 ==="
if grep -n "メール認証が必要です\|emailVerified" frontend/app/campaign/survey/page.tsx; then
    echo "⚠️  まだメール認証関連のコードが残っています。手動で確認してください。"
else
    echo "✅ メール認証関連のコードは削除されました"
fi

echo ""
echo "=== Docker ビルダーのキャッシュをクリア ==="
docker builder prune -f

echo ""
echo "=== フロントエンドをビルド ==="
docker compose build frontend

echo ""
echo "=== コンテナを再起動 ==="
docker compose up -d frontend

echo ""
echo "=== ログ確認 ==="
docker compose logs --tail=50 frontend

echo ""
echo "✅ 修正完了"

