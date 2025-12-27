# Firebase-MySQL 自動同期機能の実装

## 🎯 問題の概要

ログイン時に「401 Unauthorized」エラーが発生していました。これは、**FirebaseにはユーザーアカウントがあるのにMySQLデータベースには存在しない**というデータ不整合が原因でした。

この状態では：
- ログインしようとすると「ユーザーが見つかりません」エラー
- 新規登録しようとすると「既に登録されています」エラー（Firebaseに存在するため）

**デッドロック状態**に陥り、どちらの操作もできませんでした。

## ✅ 実装した解決策

### ログイン時の自動ユーザー作成機能

`backend/src/modules/auth/auth.service.ts` の `loginFirebaseUser()` メソッドを修正し、以下のロジックを実装しました：

1. **Firebaseトークンの検証** ✓
2. **MySQLでユーザーを検索**
3. **ユーザーが存在しない場合**:
   - エラーを返す代わりに、**自動的にMySQLにユーザーを作成**
   - Firebaseから取得した情報（UID、メールアドレス、名前）を使用
   - ロールは `citizen`、ステータスは `pending` に設定
4. **ユーザーが存在する場合**:
   - 通常通りログイン処理を続行
5. **JWTトークンを生成して返す**

## 📝 修正内容の詳細

### Before（修正前）
```typescript
// データベースからユーザーを取得
const user = await this.users.findOne({ where: { email } });
if (!user) {
  console.warn('[Auth Service] loginFirebaseUser - ユーザーがデータベースに存在しません:', email);
  throw new UnauthorizedException('ユーザーが見つかりません。先に新規登録を行ってください');
}
```

❌ **問題**: MySQLにユーザーがいないとエラーで弾かれる

### After（修正後）
```typescript
// データベースからユーザーを取得
let user = await this.users.findOne({ where: { email } });

// ユーザーが存在しない場合は自動的に作成（Firebase-MySQL同期）
if (!user) {
  console.warn('[Auth Service] loginFirebaseUser - ユーザーがデータベースに存在しません:', email);
  console.log('[Auth Service] loginFirebaseUser - 自動的にユーザーを作成します...');
  
  // Firebaseから取得できる情報で新規ユーザーを作成
  const newUser = this.users.create({
    email: email || '',
    name: decodedToken.name || (email ? email.split('@')[0] : 'ユーザー'),
    firebaseUid: decodedToken.uid,
    role: 'citizen',
    status: 'pending',
  } as any);
  
  const savedUser = await this.users.save(newUser);
  user = Array.isArray(savedUser) ? savedUser[0] : savedUser;
  console.log('[Auth Service] loginFirebaseUser - ユーザー作成成功. ID:', user.id);
} else {
  console.log('[Auth Service] loginFirebaseUser - ユーザー情報取得成功. ID:', user.id, 'Role:', user.role);
}

// JWTトークンを生成（以降の処理は同じ）
```

✅ **解決**: MySQLにユーザーがいなければ自動作成してログイン成功

## 🔍 デバッグログ

修正後、ログイン時に以下のようなログが出力されます：

### ケース1: MySQLにユーザーが存在しない場合（自動作成）
```
[Auth Service] loginFirebaseUser - 認証ヘッダー受信: あり
[Auth Service] loginFirebaseUser - トークン抽出成功 (長さ: 1234)
[Auth Service] loginFirebaseUser - Firebaseトークン検証開始...
[Auth Service] loginFirebaseUser - トークン検証成功. UID: abc123 Email: user@example.com
[Auth Service] loginFirebaseUser - ユーザーがデータベースに存在しません: user@example.com
[Auth Service] loginFirebaseUser - 自動的にユーザーを作成します...
[Auth Service] loginFirebaseUser - ユーザー作成成功. ID: 42
[Auth Service] loginFirebaseUser - ログイン成功
```

### ケース2: MySQLにユーザーが既に存在する場合（通常ログイン）
```
[Auth Service] loginFirebaseUser - 認証ヘッダー受信: あり
[Auth Service] loginFirebaseUser - トークン抽出成功 (長さ: 1234)
[Auth Service] loginFirebaseUser - Firebaseトークン検証開始...
[Auth Service] loginFirebaseUser - トークン検証成功. UID: abc123 Email: user@example.com
[Auth Service] loginFirebaseUser - ユーザー情報取得成功. ID: 42 Role: citizen
[Auth Service] loginFirebaseUser - ログイン成功
```

## 🎉 この修正により解決されること

1. ✅ **デッドロック状態の解消**: FirebaseとMySQLの不整合があってもログイン可能に
2. ✅ **シームレスな移行**: 既存のFirebaseユーザーが初回ログイン時に自動的にMySQLに同期される
3. ✅ **エラーの削減**: 「ユーザーが見つかりません」エラーが出なくなる
4. ✅ **開発効率の向上**: データベースの手動同期が不要に

## 📊 作成されるユーザー情報

自動作成されるユーザーには以下の情報が設定されます：

| フィールド | 値 | 説明 |
|----------|-----|------|
| email | Firebaseのメールアドレス | トークンから取得 |
| name | Firebaseの名前 または メールアドレスの@前 | トークンにnameがあれば使用、なければメールから生成 |
| firebaseUid | FirebaseのUID | トークンから取得 |
| role | `citizen` | 一般市民ユーザー |
| status | `pending` | KYC未完了（後で更新可能） |

## ⚠️ 注意事項

### セキュリティ
- ✅ Firebaseトークンの検証は引き続き実施
- ✅ メール認証済み（`email_verified: true`）のユーザーのみログイン可能
- ✅ JWTトークンの生成も引き続き実施

### データ整合性
- ユーザーは初回ログイン時に自動作成される
- 既存のユーザーには影響なし
- 詳細情報（電話番号、住所など）は後でKYCプロセスで更新可能

### 運用上の考慮事項
- この機能により、新規登録フローをスキップしてログインから始めることも可能
- ただし、詳細情報が必要な場合は、別途プロフィール更新画面が必要

## 🔗 関連ドキュメント

- `FIREBASE_FIX_SUMMARY.md` - Firebase全般の修正サマリー
- `FIREBASE_FRONTEND_SETUP.md` - フロントエンド設定手順
- `backend/src/modules/auth/auth.service.ts` - 修正されたファイル

---

**作成日**: 2025/12/21  
**修正内容**: ログイン時の自動ユーザー作成機能の実装  
**影響範囲**: `loginFirebaseUser()` メソッド  
**状態**: 完了 ✅
