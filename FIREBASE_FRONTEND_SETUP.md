# フロントエンドのFirebase設定手順

バックエンドのFirebase Admin SDKは正しく設定されました。次に、フロントエンド（一般ユーザー向けWebアプリ）のFirebase設定を完了させる必要があります。

## 🔧 必要な作業

フロントエンドアプリがFirebase Authenticationを使用するためには、Firebase Consoleから**Web アプリの設定情報**を取得して、`.env`ファイルに設定する必要があります。

## 📋 手順

### 1. Firebaseコンソールにアクセス

[Firebase Console](https://console.firebase.google.com/) にアクセスし、プロジェクト `seiji-a35f4` を選択します。

### 2. Web アプリを追加（まだ存在しない場合）

1. 左サイドバーの「プロジェクトの設定」（⚙️アイコン）をクリック
2. 「全般」タブの「マイアプリ」セクションまでスクロール
3. **Webアプリが存在しない場合**、「アプリを追加」ボタンをクリックし、「Web」を選択
4. アプリのニックネーム（例：`Transparency Platform Web`）を入力
5. 「アプリを登録」をクリック

### 3. Firebase設定をコピー

「マイアプリ」セクションにあるWebアプリをクリックすると、以下のような設定が表示されます：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "seiji-a35f4.firebaseapp.com",
  projectId: "seiji-a35f4",
  storageBucket: "seiji-a35f4.firebasestorage.app",
  messagingSenderId: "123456789...",
  appId: "1:123456789...:web:..."
};
```

### 4. フロントエンドの`.env`ファイルを更新

`frontend/.env` ファイルを開き、以下の値を更新してください：

```bash
# Firebase Configuration
NEXT_PUBLIC_ENABLE_FIREBASE_AUTH=true
NEXT_PUBLIC_FIREBASE_API_KEY=<上記のapiKeyの値>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seiji-a35f4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seiji-a35f4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seiji-a35f4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<上記のmessagingSenderIdの値>
NEXT_PUBLIC_FIREBASE_APP_ID=<上記のappIdの値>

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Authentication メソッドを有効化

1. Firebaseコンソールの左サイドバーから「Authentication」を選択
2. 「Sign-in method」タブをクリック
3. 「メール/パスワード」を有効にする
4. 必要に応じて他の認証方法（Google、Twitter等）も有効化

### 6. 動作確認

設定が完了したら、フロントエンドアプリを再起動してください：

```bash
cd frontend
npm run dev
```

## ✅ 現在の設定状況

### バックエンド（完了 ✓）
- ✅ `backend/.env` に Firebase Admin SDK の設定済み
- ✅ Firebase Admin SDK が正常に初期化されることを確認済み
- ✅ プロジェクトID: `seiji-a35f4`
- ✅ サービスアカウント: `firebase-adminsdk-fbsvc@seiji-a35f4.iam.gserviceaccount.com`
- ✅ 秘密鍵の改行コード処理: `replace(/\\n/g, '\n')` 実装済み
- ✅ デバッグログ追加: トークン検証のログ出力実装済み

### フロントエンド（要設定 ⚠️）
- ⚠️ `frontend/.env` に Firebase Web SDK の設定が必要
- ⚠️ API Key, App ID, Messaging Sender ID を Firebase Console から取得して設定してください

## 🐛 トラブルシューティング

### エラー: "Firebase認証トークンが無効です"

このエラーが発生する場合、以下を確認してください：

1. **フロントエンドとバックエンドで同じFirebaseプロジェクトを使用しているか**
   - フロントエンド: `NEXT_PUBLIC_FIREBASE_PROJECT_ID=seiji-a35f4`
   - バックエンド: `FIREBASE_PROJECT_ID=seiji-a35f4`
   - 両方が一致していることを確認

2. **バックエンドのログを確認**
   バックエンドサーバーの起動時に以下のログが表示されるはずです：
   ```
   [Firebase Provider] ✓ Firebase Admin SDK の初期化に成功しました
   - Project ID: seiji-a35f4
   ```

3. **ユーザーのメール認証が完了しているか**
   Firebase Authenticationでは、メール認証が必須です。新規登録後、メールに届いた確認リンクをクリックしてください。

4. **トークンの有効期限**
   Firebase IDトークンは1時間で期限切れになります。ログインし直してください。

## 📝 参考情報

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK for Node.js](https://firebase.google.com/docs/admin/setup)

---

**次のステップ**: 上記の手順に従って、フロントエンドの`.env`ファイルを更新してください。
