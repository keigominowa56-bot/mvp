# Firebase Secrets 設定ガイド

このドキュメントでは、`firebase-auth.json`の内容を環境変数として設定する方法を説明します。

## ファイルの場所

- **JSON形式**: `backend/firebase-auth.json`
- **環境変数形式**: `backend/firebase-secrets.env`

## Renderでの設定方法

### 1. Renderダッシュボードにアクセス

1. Renderダッシュボードにログイン
2. バックエンドサービスを選択
3. 「Environment」タブを開く
4. 「Environment Variables」セクションで以下を設定

### 2. 設定する環境変数

`firebase-secrets.env`ファイルから以下の値をコピーして設定してください：

| 環境変数名 | 値 |
|-----------|-----|
| `FIREBASE_PROJECT_ID` | `seiji-a35f4` |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@seiji-a35f4.iam.gserviceaccount.com` |
| `FIREBASE_CLIENT_ID` | `110471482438386725742` |
| `FIREBASE_PRIVATE_KEY_ID` | `c91f9eeda4b310b0b5b8b1ad049b483b2f0c1365` |
| `FIREBASE_PRIVATE_KEY` | （下記参照） |

### 3. FIREBASE_PRIVATE_KEY の設定方法

**重要**: `FIREBASE_PRIVATE_KEY`は改行コードを含むため、特別な注意が必要です。

#### 方法1: 引用符なしで設定（推奨）

```
-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCinf2n+TjFoRAZ\nD8jbkNdfH/blyhUXxJ/gz8l+DRErlPSu2nC/rUzMUCZ0w94ooghcVXN67hGOz9C2\ndPsKYMCq1LYFpcQDjCRqgeDA5ObIpsghufqeSUbTujQysPYy6JS29ZwvU2oKSt4y\nllMIxAPlWEERnqVnhC8s/UppXmId6eeSu1H7AZ6LayDcAoBRkYkt2TB1E/lVJn/X\nIpjaCQ43GLFageQcWWv5Eyqd0bBsX+Rd708z218nuWhHwN+OnNhaudUrPvArhj9K\nsidl8T6ke2f2Ec5Uiox/vThFyADS5GIvIcihg56NVDneYCAbVutABfptOuUI2Y2l\no+BLS9ntAgMBAAECggEARuv90VD95B97HFsIgE4ayDdyIETyzxNnoQ4udAWx696C\nmnHVg5tK5767DujPzsvgNpjkDQSgbrcO8UxyolORI9AydKMXqm5oAXWUdrw+NNuc\nZC0u8vLFa5kFo+gO8CQEnAjhbbiFAmkloE10eFm400Ea29rji5KYWpg7aFoME7wa\nTq2HDUv3JbD4WNH6XcJXamghKlUw9r1UBMg6YnXHpfFI55POePUrGwWDwlu0v6Ev\nulS0/UXRKDrSjWHkV1INl0fcezbrDH6ErtvyGyRWIp2EfEd60nAvNUQssedD8qBJ\nUhPx78sKmjEjumeAUg9HGvocH2YiLvfzCRizfLn0FwKBgQDPWvA03ohA+s7+HO35\nWFHQbmzTVzJdhcQKhsYlOo4/FAw3mK3rgCc2yoKFYh730JJgqGFgCc7QhsZYV9bP\nbmHdYa+cMYwIQHv/LLZeMS1B7CUfvMFHJVW2TUQJFOzbibApSzzZDXBpfB/mmxAD\n813QufLE6k5yvGvByf1NnpV5PwKBgQDIxDu3tiHUUEmcI/62Qeua2BpEfbepnNuz\nUs3W/nUwHJrofzUb1XQ2Wn7njrP8zhpuEe/oJsb04o5kj6QdbvNFTNC0s0COOUd5\nx8V0ujNRn7ke+fX7Ku8fS9tzhP54tmeFbxXXxROOupskdvVtdoVcg15EsVIUeBKn\nlo/3RmlV0wKBgQCF2B5bEhWDVCHOl1/o5mCRGOY4GP3SrmiXnt1B5KUzBD7KmEwT\nSnqFfHx5mpeAwOnraGTKeCo+IfDfz3tCE+8p1kdjm/vWy8D+Op9Q949OER75eH6N\n7QSBkyhKcG5fW2YRkZYqSOl5vXxd/1N8KVgyRgT1pISUvRkVUsulkarMQwKBgQCf\nQRnlxnHbSry5QMxBotTThWyAvAC+aJDWFG73he1LdsVie9WS+KUwoGReJhKcDJlm\nio/1ZR0ZD8XH+zFBr8sFQ8OiMzaYGtOZxF/bEgC3VK2x5rG6xPndp3yyi+KXuokv\njUiUWd4Dr/501HAmnod3NTXH46iqV/zkN0iH67COxQKBgQCnM0q+0/UOdCcp/Z+7\nDwp8jM6t0e23vNhVgqfPzksxe0SXpYSx/R+HAFA++vCs2ilYhTafM1EKhpEb1DN0\nk+zgXzT5cI2oPAi8myb6G1b1Pj+AooeSCmIxeT/p+fC5iaMwV6cAAfSEm/AH9+tL\nmE60tCqzCseg/sqREL3pf8Lh8g==\n-----END PRIVATE KEY-----\n
```

**注意点**:
- 引用符（`"`）は**含めない**でください
- `\n`は**そのまま**残してください（実際の改行に変換しない）
- 全体を**1行**で設定してください

#### 方法2: firebase-secrets.envからコピー

`backend/firebase-secrets.env`ファイルを開き、`FIREBASE_PRIVATE_KEY=`の後の値をコピーしてください。引用符は含めずに、`\n`を含む文字列をそのまま設定します。

## GitHub Secretsでの設定方法

GitHub Actionsで使用する場合も同様です：

1. リポジトリの「Settings」→「Secrets and variables」→「Actions」に移動
2. 「New repository secret」をクリック
3. 各環境変数を追加

**FIREBASE_PRIVATE_KEY**の設定時も、引用符なしで`\n`を含む文字列をそのまま設定してください。

## 検証方法

設定後、バックエンドサーバーを起動して以下のログが表示されることを確認してください：

```
[Firebase Provider] ✓ Firebase Admin SDK の初期化に成功しました
```

エラーが出る場合は、`FIREBASE_PRIVATE_KEY`の設定を確認してください。

## セキュリティ注意事項

- ✅ `firebase-secrets.env`ファイルは`.gitignore`に含まれています
- ✅ 本番環境では環境変数として設定し、コードに直接書かないでください
- ✅ 秘密鍵は定期的に更新することを推奨します

