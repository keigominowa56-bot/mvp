// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 💡 トランスパイル設定のみを残す
  transpilePackages: ['lucide-react', 'react-hot-toast'], 

  // 🚨 以前のWebpackエイリアス設定は完全に削除しました。
};

module.exports = nextConfig;