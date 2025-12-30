import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    // API Base URL のデフォルト値を設定
    // 本番環境では HTTPS を使用し、ポート番号は不要です
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.polimee.com',
  },
};

export default nextConfig;
