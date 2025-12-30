// backend/server.js (最終修正版 - 活動記録エラー修正済み)

const express = require('express');
const cors = require('cors'); 
const bodyParser = require('body-parser');
const mockData = require('./data/mockData'); 

const app = express();
const port = 8000;

// ------------------------------------------------------------------
// 1. ミドルウェア設定
// ------------------------------------------------------------------
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://polimee.com',
    'https://www.polimee.com',
  ] // フロントエンドからのアクセスを許可
}));

app.use(bodyParser.json());

// ------------------------------------------------------------------
// 2. ユーザー認証のモックエンドポイント
// ------------------------------------------------------------------
app.post('/api/register', (req, res) => {
  const { name, email, password, district } = req.body;
  
  if (mockData.users.some(user => user.email === email)) {
    return res.status(400).send({ message: 'そのメールアドレスはすでに使用されています。' });
  }

  const newUser = {
    id: `user-${mockData.users.length + 1}`,
    name,
    email,
    district,
    password 
  };

  mockData.users.push(newUser);

  res.status(201).send({ 
    token: `mock-token-${newUser.id}`,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, district: newUser.district }
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = mockData.users.find(u => u.email === email && u.password === password);

  if (user) {
    res.status(200).send({ 
      token: `mock-token-${user.id}`,
      user: { id: user.id, name: user.name, email: user.email, district: user.district }
    });
  } else {
    res.status(401).send({ message: 'メールアドレスまたはパスワードが正しくありません。' });
  }
});

app.get('/api/profile', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer mock-token-')) {
        return res.status(401).send({ message: '認証されていません。' });
    }
    res.status(200).send({
      id: "user-1",
      name: "テスト 太郎",
      email: "test@example.com",
      district: "渋谷区"
    });
});

// ------------------------------------------------------------------
// 3. 議員データのエンドポイント
// ------------------------------------------------------------------
app.get('/api/members', (req, res) => {
  res.json(mockData.members);
});

app.get('/api/members/:id', (req, res) => {
  const memberId = req.params.id;
  const member = mockData.members.find(m => m.id === memberId);

  if (member) {
    res.json(member);
  } else {
    res.status(404).send({ message: '議員が見つかりません。' });
  }
});

// ------------------------------------------------------------------
// 4. タイムライン（活動記録）のエンドポイント 💡 修正箇所
// ------------------------------------------------------------------
app.get('/api/activity-logs', (req, res) => {
  // エラー解消のための修正: 活動記録に紐づく議員情報を結合します
  const logsWithMemberDetail = mockData.activityLogs.map(log => {
    // memberIdを元に議員の詳細情報を検索
    const member = mockData.members.find(m => m.id === log.memberId);
    
    // フロントエンドの期待通り、memberというキーで議員情報をネストして返す
    return {
      ...log,
      member: member ? { 
        id: member.id,
        name: member.name,
        photoUrl: member.photoUrl 
      } : null, // 議員が見つからない場合を考慮
    };
  });

  // ソート済みの結合済みデータを返す
  res.json(logsWithMemberDetail);
});


// ------------------------------------------------------------------
// サーバー起動
// ------------------------------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Mock API Server is running on http://localhost:${port}/api`);
});