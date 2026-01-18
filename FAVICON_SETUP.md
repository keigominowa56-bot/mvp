# Favicon設定ガイド

## 概要
ブラウザのタブに表示されるアイコン（favicon）をPolimeeのロゴに変更する方法です。

## 現在のfaviconの場所

- **一般ユーザー向けサイト**: `frontend/app/favicon.ico`
- **管理画面**: `admin-frontend/app/favicon.ico`

## 設定方法

### Next.js App Routerでのfavicon設定

Next.js 13+のApp Routerでは、`app/favicon.ico`にファイルを配置するだけで自動的にfaviconとして認識されます。

### 手順

1. **新しいfaviconファイルを準備**
   - 推奨サイズ: 32x32px または 16x16px
   - 形式: `.ico`形式（または`.png`形式も使用可能）
   - ファイル名: `favicon.ico`

2. **frontendのfaviconを置き換え**
   ```bash
   # 新しいfavicon.icoを frontend/app/ に配置
   cp polimee-logo.ico frontend/app/favicon.ico
   ```

3. **admin-frontendのfaviconを置き換え**
   ```bash
   # 新しいfavicon.icoを admin-frontend/app/ に配置
   cp polimee-logo.ico admin-frontend/app/favicon.ico
   ```

### 代替方法: metadataで明示的に指定

`layout.tsx`でmetadataを設定してfaviconを明示的に指定することもできます：

```typescript
export const metadata = {
  title: 'Polimee',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};
```

### PNG形式を使用する場合

`.ico`形式の代わりに`.png`形式を使用する場合：

1. `favicon.png`を`app/`ディレクトリに配置
2. `layout.tsx`でmetadataを設定：
   ```typescript
   export const metadata = {
     icons: {
       icon: '/favicon.png',
     },
   };
   ```

### 複数のサイズをサポートする場合

```typescript
export const metadata = {
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};
```

## 確認方法

1. ブラウザでサイトにアクセス
2. タブのアイコンが新しいfaviconに変更されているか確認
3. キャッシュが残っている場合は、ハードリロード（Ctrl+Shift+R / Cmd+Shift+R）を実行

## トラブルシューティング

### faviconが表示されない場合

1. **ファイル名を確認**
   - `favicon.ico`が正しい名前か確認
   - 大文字小文字を確認（`favicon.ico`が正しい）

2. **ファイルの場所を確認**
   - `app/favicon.ico`に配置されているか確認
   - `public/favicon.ico`ではなく`app/favicon.ico`を使用

3. **ブラウザのキャッシュをクリア**
   - ハードリロード（Ctrl+Shift+R / Cmd+Shift+R）
   - ブラウザのキャッシュをクリア

4. **Next.jsの再起動**
   ```bash
   # 開発サーバーを再起動
   npm run dev
   ```

5. **ビルドを再実行**
   ```bash
   npm run build
   ```

## 参考

- [Next.js Metadata API - Icons](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)


