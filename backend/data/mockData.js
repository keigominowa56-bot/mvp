// backend/data/mockData.js

const { v4: uuidv4 } = require('uuid');

// ----------------------------------------------------
// ユーティリティ関数
// ----------------------------------------------------

// ランダムな日付を生成 (最近のデータとして調整)
const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// ----------------------------------------------------
// 1. 基本データ定義 (ユーザーと議員)
// ----------------------------------------------------

const mockUsers = [
    {
        id: 'user-123',
        email: 'user@example.com',
        displayName: '市民 太郎',
        district: '世田谷区',
        role: 'user',
        password: 'password123', // ログインモック用にパスワードを追加 (実際はハッシュ化)
    },
];

const mockMembers = [
    {
        id: 'member-001',
        name: '佐藤 一郎',
        photoUrl: 'https://picsum.photos/seed/member001/100/100',
        affiliation: '未来創造会',
        district: '世田谷区',
        party: '無所属',
        position: '環境福祉委員会 委員長',
        biography: '地域に根ざした活動をモットーに、教育環境の改善と高齢者福祉の充実に尽力しています。過去10年間、一貫して住民目線の政治を実現してきました。',
        website: 'https://satou-ichiro.jp',
        twitterHandle: 'satou_ichiro',
    },
    {
        id: 'member-002',
        name: '田中 花子',
        photoUrl: 'https://picsum.photos/seed/member002/100/100',
        affiliation: '改革ネット',
        district: '渋谷区',
        party: '市民党',
        position: '議会運営委員会 副委員長',
        biography: 'ITを活用した行政の効率化を推進し、若者が住みやすいまちづくりを目指します。デジタルデバイド解消にも積極的に取り組んでいます。',
        website: 'https://tanaka-hanako.net',
        twitterHandle: 'tanaka_hanako',
    },
    {
        id: 'member-003',
        name: '山田 健太',
        photoUrl: 'https://picsum.photos/seed/member003/100/100',
        affiliation: '緑の会',
        district: '新宿区',
        party: '日本緑の党',
        position: '一般議員',
        biography: '公園の緑化や再生可能エネルギーの導入を訴え、持続可能な地域社会の実現を目指します。',
        website: 'https://yamada-kenta.org',
        twitterHandle: 'yamada_kenta',
    },
];

// ----------------------------------------------------
// 2. 公約と活動記録のデータ生成
// ----------------------------------------------------

// 全公約のリスト
const allPledges = mockMembers.flatMap(member => [
    {
        id: uuidv4(),
        memberId: member.id,
        title: '小学校の給食費完全無償化',
        description: '子育て世帯の負担軽減のため、市立小学校の給食費を議会任期中に完全に無償化します。',
        status: 'in_progress',
        supportCount: 1500,
        opposeCount: 300,
    },
    {
        id: uuidv4(),
        memberId: member.id,
        title: '駅前の再開発計画見直し',
        description: '住民説明会を再度実施し、地域住民の意見を反映した形での駅前再開発計画を提案します。',
        status: 'pending',
        supportCount: 800,
        opposeCount: 1200,
    },
    {
        id: uuidv4(),
        memberId: member.id,
        title: '地域ネコの不妊去勢手術助成強化',
        description: '地域ネコの保護活動支援として、不妊去勢手術への助成金を大幅に増やし、年間処理数を倍増させます。',
        status: 'completed',
        supportCount: 2500,
        opposeCount: 50,
    },
]);

// 全活動記録のリスト
const allActivityLogs = mockMembers.flatMap(member => [
    {
        id: uuidv4(),
        memberId: member.id,
        title: '【活動報告】高齢者施設を視察',
        content: '〇〇地域にある高齢者施設を訪問し、現場の職員や入居者の方々から直接お話を伺いました。特に人手不足の問題が深刻であることを認識しました。',
        createdAt: getRandomDate(new Date(2025, 0, 1), new Date(2025, 3, 30)).toISOString(),
        commentCount: 45,
    },
    {
        id: uuidv4(),
        memberId: member.id,
        title: '【議会質問】災害時の情報伝達について',
        content: '本日の定例議会にて、地震などの大規模災害発生時における外国人居住者への多言語情報伝達の課題について質問を行いました。改善策を当局に求めました。',
        createdAt: getRandomDate(new Date(2025, 4, 1), new Date(2025, 7, 30)).toISOString(),
        commentCount: 22,
    },
    {
        id: uuidv4(),
        memberId: member.id,
        title: '地域イベントに参加しました',
        content: '今週末に開催された〇〇まつりに参加し、多くの住民の方々と交流させていただきました。皆さんの笑顔が私の活動の原動力です。',
        createdAt: getRandomDate(new Date(2025, 8, 1), new Date(2025, 10, 30)).toISOString(),
        commentCount: 10,
    },
]);

// ----------------------------------------------------
// 3. 最終的なデータセットを組み立て (議員の詳細情報として公約と活動記録を紐づける)
// ----------------------------------------------------

const members = mockMembers.map(member => {
    // 💡 詳細ページに必要な情報: その議員に紐づく公約と活動記録をフィルタリング
    const memberPledges = allPledges.filter(p => p.memberId === member.id);
    const memberActivityLogs = allActivityLogs.filter(a => a.memberId === member.id);

    return {
        ...member,
        // 💡 一覧表示に必要なカウント情報
        pledgesCount: memberPledges.length,
        activityLogsCount: memberActivityLogs.length,
        // 💡 詳細ページに必要な情報 (エラー2の解決)
        pledges: memberPledges, 
        activityLogs: memberActivityLogs,
    };
});

// ----------------------------------------------------
// 4. エクスポート
// ----------------------------------------------------

module.exports = {
    users: mockUsers,
    members,
    pledges: allPledges,
    activityLogs: allActivityLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
};