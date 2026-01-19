/**
 * Next.js 16 (Turbopack) 用の設定ファイル
 * - 複数の lockfile がある環境でワークスペースルート誤認識を防ぐため、turbopack.root を frontend フォルダに明示
 * - 画像・最適化などは必要最低限に留めています。必要に応じて追記してください。
 * - クライアントから参照する公開環境変数（NEXT_PUBLIC_...）は .env.local で管理します
 */

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack のルートを明示（警告を消す）
  turbopack: {
    root: path.resolve(__dirname),
  },

  // React の StrictMode（必要に応じて切り替え可能）
  reactStrictMode: true,

  // App Router では i18n 設定は不要（App Router では別の方法で国際化を実装）

  // 画像の外部ドメイン許可（SNSなどの OGP 画像を使う場合に必要）
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.polimee.com', pathname: '/uploads/**' }, // アップロード画像
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },       // X(Twitter) 画像
      { protocol: 'https', hostname: 'abs.twimg.com' },       // X(Twitter) assets
      { protocol: 'https', hostname: 'instagram.com' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      { protocol: 'https', hostname: 'facebook.com' },
      { protocol: 'https', hostname: 'lookaside.facebook.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },         // YouTube thumbnail
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'ogp.me' },              // OGP 取得系の仮例
    ],
  },

  // リダイレクト・リライト（必要なら API のプロキシをここで定義できます）
  async rewrites() {
    // 現状は .env.local の NEXT_PUBLIC_API_BASE を使うため rewrites は不要
    // もしフロントから相対パスで /api をバックエンドに流したい場合はここに追記してください
    return [];
  },

  // ビルドの最適化設定（開発用途ではデフォルトで十分）
  experimental: {
    // 必要なら App Router の設定などを拡張可能
    // serverActions: true,
  },

  // サーバーサイド専用パッケージを外部パッケージとして扱う
  serverExternalPackages: ['firebase-admin'],

  // Webpack設定（Turbopackでもフォールバックとして使用）
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドでfirebase-adminを外部パッケージとして扱う
      config.externals = config.externals || [];
      config.externals.push('firebase-admin');
    }
    return config;
  },

  // standalone 出力（next.config.ts から統合）
  output: 'standalone',

  // 環境変数のデフォルト値を設定
  env: {
    // API Base URL（固定値、環境変数は使用しない）
    NEXT_PUBLIC_API_BASE_URL: 'https://api.polimee.com',
  },
};

module.exports = nextConfig;