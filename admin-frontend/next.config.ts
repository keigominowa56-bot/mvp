import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    // API Base URL は環境変数から取得（必須）
    // デプロイ環境では環境変数 NEXT_PUBLIC_API_BASE_URL を設定してください
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
