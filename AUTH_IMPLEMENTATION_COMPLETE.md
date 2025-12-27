# 認証システム実装完了報告

## 実施日時
2025年12月21日

## 実装完了した内容

### 1. ディレクトリ構造のクリーンアップ

#### 削除したファイル
- `frontend/app/admin/*` - 一般市民用フロントエンド（3000番）から管理者・議員用ページを削除

#### 結果
- **frontend (3000番)**: 一般市民（citizen）専用
- **admin-frontend (3001番)**: 議員（politician）・管理者（admin）専用

完全分離が完了しました。

---

### 2. バックエンド認証システムの修正

#### Cookie認証からLocalStorage認証への変更

**修正ファイル:**
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`

**変更内容:**

1. **Cookieの削除**
   - すべてのログインエンドポイントからCookie設定を削除
   - `Set-Cookie` ヘッダーを使用しない
   - `credentials: 'include'` 不要

2. **トークンのみを返却**
   ```typescript
   // 修正前
   res.cookie('auth_token', token, { httpOnly: true, ... });
   return { token };
   
   // 修正後
   return { token };  // トークンのみ返却
   ```

3. **GET /api/auth/me の改善**
   - JWT トークンとFirebase ID Tokenの両方に対応
   - まずJWTトークンとして検証を試みる
   - 失敗した場合、Firebase ID Tokenとして検証
   - 両方の認証方式をサポート

4. **議員登録時のステータス**
   - `status: 'active'` → `status: 'pending'`
   - 管理者承認フローを想定した実装

---

### 3. フロントエンド（3000番）の修正

#### APIクライアントの修正
**ファイル:** `frontend/lib/api.ts`

**変更内容:**
```typescript
export async function apiFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  
  // LocalStorageからトークンを取得
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    // credentials: 'include' を削除
  });
  return res;
}
```

**ポイント:**
- LocalStorageから`auth_token`を取得
- `Authorization: Bearer <token>`ヘッダーに設定
- サーバーサイドレンダリング対応（`typeof window !== 'undefined'`）

---

### 4. 管理画面（3001番）の修正

#### APIクライアントの修正
**ファイル:** `admin-frontend/lib/api.ts`

**変更内容:**
```typescript
export async function apiFetchWithAuth(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  
  // LocalStorageからトークンを取得
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  return res;
}
```

#### 新規作成したページ

**1. 管理者ログインページ**
**ファイル:** `admin-frontend/app/admin/login/page.tsx`

```typescript
const result = await adminLogin(email, password);

// LocalStorageにトークンを保存
if (result.token) {
  localStorage.setItem('auth_token', result.token);
  router.push('/dashboard');
}
```

**2. 議員ログインページ**
**ファイル:** `admin-frontend/app/politician/login/page.tsx`

```typescript
const result = await politicianLogin(email, password);

// LocalStorageにトークンを保存
if (result.token) {
  localStorage.setItem('auth_token', result.token);
  router.push('/dashboard');
}
```

**特徴:**
- シンプルなUIデザイン
- エラーハンドリング
- ローディング状態表示
- 相互リンク（管理者 ⇔ 議員）

---

## 認証フローの確認

### 管理者（admin）のログインフロー

```
1. http://localhost:3001/admin/login にアクセス
   ↓
2. メールアドレス（@keygo.jp）とパスワードを入力
   ↓
3. POST /api/auth/admin/login
   - Body: { email, password }
   ↓
4. バックエンドでパスワード検証
   - bcrypt.compare()
   - role='admin'を確認
   ↓
5. JWT Tokenを生成して返却
   - Response: { token }
   ↓
6. フロントエンドでLocalStorageに保存
   - localStorage.setItem('auth_token', token)
   ↓
7. /dashboardにリダイレクト
   ↓
8. 以降のAPIリクエスト
   - Header: Authorization: Bearer <token>
```

### 議員（politician）のログインフロー

```
1. http://localhost:3001/politician/login にアクセス
   ↓
2. メールアドレスとパスワードを入力
   ↓
3. POST /api/auth/politician/login
   - Body: { email, password }
   ↓
4. バックエンドでパスワード検証
   - bcrypt.compare()
   - role='politician'を確認
   ↓
5. JWT Tokenを生成して返却
   - Response: { token }
   ↓
6. フロントエンドでLocalStorageに保存
   - localStorage.setItem('auth_token', token)
   ↓
7. /dashboardにリダイレクト
   ↓
8. 以降のAPIリクエスト
   - Header: Authorization: Bearer <token>
```

### 一般市民（citizen）のログインフロー

```
1. http://localhost:3000/login にアクセス
   ↓
2. Firebase Authenticationでログイン
   - メール/パスワード認証
   ↓
3. Firebase ID Tokenを取得
   ↓
4. POST /api/auth/login-firebase
   - Header: Authorization: Bearer <Firebase ID Token>
   ↓
5. バックエンドでFirebase ID Tokenを検証
   - Firebase Admin SDK
   - MySQLにユーザーを作成/取得
   ↓
6. バックエンドJWT Tokenを生成して返却
   - Response: { token, user }
   ↓
7. フロントエンドでLocalStorageに保存
   - localStorage.setItem('auth_token', token)
   ↓
8. 以降のAPIリクエスト
   - Header: Authorization: Bearer <JWT Token>
```

---

## トークン保存方式の比較

### Cookie方式（旧実装）

**メリット:**
- HttpOnly Cookieでセキュリティ向上
- CSRF対策が容易
- 自動送信

**デメリット:**
- CORS設定が複雑
- `credentials: 'include'`が必要
- Same-Site属性の設定が必要
- デバッグが困難

### LocalStorage方式（新実装）

**メリット:**
- シンプルな実装
- デバッグが容易（DevToolsで確認可能）
- CORS設定が不要
- モバイルアプリでも使用可能

**デメリット:**
- XSS攻撃に脆弱（対策必要）
- 手動でAuthorizationヘッダーに設定

**採用理由:**
- 開発の確実性を優先
- デバッグのしやすさ
- 複数のフロントエンドで統一した実装

---

## セキュリティ考慮事項

### 本番環境での推奨設定

1. **HTTPS必須**
   - すべての通信をHTTPS化

2. **Content Security Policy（CSP）**
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
   ```

3. **XSS対策**
   - ユーザー入力のサニタイズ
   - DOMベースXSSの防止
   - React/Next.jsのエスケープ機能を活用

4. **トークン有効期限**
   - 現在: 7日間
   - 本番環境: 1時間〜1日を推奨
   - リフレッシュトークンの実装

5. **ログアウト機能**
   ```typescript
   const logout = () => {
     localStorage.removeItem('auth_token');
     router.push('/login');
   };
   ```

---

## 動作確認手順

### 1. 管理者としてログイン

```bash
# 1. 管理画面にアクセス
open http://localhost:3001/admin/login

# 2. 管理者アカウントでログイン
Email: admin@keygo.jp
Password: [your_password]

# 3. ダッシュボードが表示されることを確認

# 4. ブラウザのDevToolsで確認
# Application > Local Storage > http://localhost:3001
# → auth_token が保存されていることを確認

# 5. プロフィール情報を取得
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/auth/me
```

### 2. 議員としてログイン

```bash
# 1. 管理画面にアクセス
open http://localhost:3001/politician/login

# 2. 議員アカウントでログイン
Email: [politician_email]
Password: [your_password]

# 3. ダッシュボードが表示されることを確認

# 4. 投稿作成ページにアクセス
open http://localhost:3001/posts/create
```

### 3. 一般市民としてログイン

```bash
# 1. フロントエンドにアクセス
open http://localhost:3000/login

# 2. Firebase Authenticationでログイン
Email: [user_email]
Password: [your_password]

# 3. タイムラインが表示されることを確認

# 4. プロフィールページにアクセス
open http://localhost:3000/profile
```

---

## 修正されたエンドポイント一覧

### 認証エンドポイント

| エンドポイント | メソッド | リクエスト | レスポンス |
|--------------|---------|-----------|-----------|
| `/api/auth/admin/signup` | POST | `{ email, password }` | `{ ok: true }` |
| `/api/auth/admin/login` | POST | `{ email, password }` | `{ token }` |
| `/api/auth/politician/signup` | POST | `{ email, password, name, regionId?, partyId? }` | `{ ok: true, message }` |
| `/api/auth/politician/login` | POST | `{ email, password }` | `{ token }` |
| `/api/auth/register-firebase` | POST | Header: `Authorization: Bearer <Firebase Token>` | `{ ok: true, message }` |
| `/api/auth/login-firebase` | POST | Header: `Authorization: Bearer <Firebase Token>` | `{ token, user }` |
| `/api/auth/me` | GET | Header: `Authorization: Bearer <JWT or Firebase Token>` | `{ user }` |

### 認証方式

- **管理者・議員**: JWT Token（LocalStorage）
- **一般市民**: Firebase ID Token → バックエンドJWT Token（LocalStorage）

---

## トラブルシューティング

### トークンが保存されない

**原因:** Cookieベースの古い実装が残っている

**解決方法:**
1. ブラウザのCookieをクリア
2. LocalStorageをクリア
3. ページをリロード

### 401 Unauthorized エラー

**原因:** トークンが無効または期限切れ

**解決方法:**
1. LocalStorageの`auth_token`を確認
2. トークンが存在しない場合は再ログイン
3. バックエンドログを確認

### CORS エラー

**原因:** バックエンドのCORS設定

**解決方法:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: false,  // LocalStorageを使用するためfalse
});
```

---

## 今後の改善提案

### 高優先度

1. **リフレッシュトークンの実装**
   - アクセストークン: 1時間
   - リフレッシュトークン: 30日間

2. **ログアウト機能の実装**
   - LocalStorageからトークンを削除
   - サーバー側でトークンを無効化（ブラックリスト）

3. **認証ガードの実装**
   - ページアクセス時に認証チェック
   - 未認証の場合はログインページにリダイレクト

### 中優先度

4. **パスワードリセット機能**
   - メールでリセットリンク送信
   - 新しいパスワード設定

5. **二要素認証（2FA）**
   - TOTPまたはSMS認証

6. **セッション管理**
   - アクティブセッション一覧
   - 強制ログアウト

---

## 関連ドキュメント

- [AUTH_AND_ROLE_DESIGN.md](./AUTH_AND_ROLE_DESIGN.md) - 認証設計ドキュメント
- [FIREBASE_STORAGE_IMPLEMENTATION.md](./FIREBASE_STORAGE_IMPLEMENTATION.md) - Firebase Storage実装
- [TIMELINE_PROFILE_FIX.md](./TIMELINE_PROFILE_FIX.md) - タイムライン修正

---

## 完了チェックリスト

- [x] frontend/app/admin/* の削除
- [x] バックエンドのCookie削除
- [x] LocalStorage対応のAPIクライアント実装
- [x] 管理者ログインページの実装
- [x] 議員ログインページの実装
- [x] GET /api/auth/me の改善
- [x] 議員登録時のステータスをpendingに変更
- [x] バックエンド再起動
- [x] ドキュメント作成

**実装完了日:** 2025年12月21日
