// frontend/testData.js

// 🚨 注意: このパスは、fakeApi.tsがどこにあるかに依存します。
// utilsフォルダがfrontend直下にあると仮定しています。
import { fetchTimelineData } from './utils/fakeApi.ts';

async function runTest() {
    console.log("--- ダミーデータ生成テスト開始 ---");
    try {
        const data = await fetchTimelineData(5); // 5件のデータを取得
        console.log("取得成功。投稿数:", data.posts.length);
        
        // 最初の投稿の中身を少し確認
        if (data.posts.length > 0) {
            console.log("\n最初の投稿の著者情報:");
            console.log("  ユーザー名:", data.posts[0].author.username);
            console.log("  都道府県:", data.posts[0].author.prefecture);
            console.log("  本文の一部:", data.posts[0].content.substring(0, 50) + "...");
        }

    } catch (e) {
        console.error("データ取得中にエラーが発生しました:", e);
    }
    console.log("--- テスト終了 ---");
}

runTest();