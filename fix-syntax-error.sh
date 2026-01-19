#!/bin/bash
# サーバー側で実行する構文エラー修正スクリプト

cd /root/mvp || exit 1

echo "=== 現在のファイルの最後の20行を確認 ==="
tail -20 frontend/app/campaign/survey/page.tsx

echo ""
echo "=== ファイルの構文を確認 ==="
# 開きカッコと閉じカッコの数を確認
OPEN_BRACES=$(grep -o '{' frontend/app/campaign/survey/page.tsx | wc -l)
CLOSE_BRACES=$(grep -o '}' frontend/app/campaign/survey/page.tsx | wc -l)
echo "開きカッコ { の数: $OPEN_BRACES"
echo "閉じカッコ } の数: $CLOSE_BRACES"

DIFF=$((OPEN_BRACES - CLOSE_BRACES))
echo "不足している閉じカッコの数: $DIFF"

if [ $DIFF -gt 0 ]; then
    echo ""
    echo "=== 不足している閉じカッコを追加 ==="
    
    # ファイルの最後に閉じカッコを追加
    # ただし、既に最後に閉じカッコがある場合は追加しない
    LAST_CHAR=$(tail -c 1 frontend/app/campaign/survey/page.tsx | tr -d '\n')
    SECOND_LAST_LINE=$(tail -2 frontend/app/campaign/survey/page.tsx | head -1)
    
    # 最後の行が空行または閉じカッコでない場合、追加
    if ! echo "$SECOND_LAST_LINE" | grep -q "^}$"; then
        echo "" >> frontend/app/campaign/survey/page.tsx
        echo "}" >> frontend/app/campaign/survey/page.tsx
        echo "✅ 閉じカッコを追加しました"
    else
        echo "⚠️  既に閉じカッコが存在するようです。手動で確認してください。"
    fi
else
    echo "✅ カッコの数は一致しています"
fi

echo ""
echo "=== 修正後のファイルの最後の10行を確認 ==="
tail -10 frontend/app/campaign/survey/page.tsx

echo ""
echo "=== 構文チェック（TypeScript/JavaScript） ==="
# Node.jsがインストールされている場合、構文チェックを実行
if command -v node &> /dev/null; then
    # 簡易的な構文チェック（完全ではないが、基本的なエラーは検出可能）
    node -c frontend/app/campaign/survey/page.tsx 2>&1 || echo "⚠️  構文エラーが検出されました"
else
    echo "Node.jsがインストールされていないため、構文チェックをスキップします"
fi

echo ""
echo "=== Docker ビルドを実行 ==="
docker compose build frontend

echo ""
echo "✅ 修正完了"

