// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 💡 ダークモードの切り替え方法を指定 (Next.jsのclassName方式)
  darkMode: 'class', 
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './utils/**/*.{js,ts,jsx,tsx,mdx}',

    // 外部コンポーネントのスキャン設定を維持
    './node_modules/lucide-react/**/*.{js,ts,jsx,tsx}', 
  ],
  theme: {
    extend: {
      colors: {
        // 必要に応じてカスタムカラーを追加
        primary: '#3B82F6', // Blue-500
      },
    },
  },
  plugins: [
    // フォーム要素のスタイリングをリセット
    require('@tailwindcss/forms'),
  ],
};