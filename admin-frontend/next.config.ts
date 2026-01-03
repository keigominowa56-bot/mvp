import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    // API Base URL（固定値、環境変数は使用しない）
    NEXT_PUBLIC_API_BASE_URL: 'https://api.polimee.com',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.polimee.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
