// frontend/app/(auth)/login/page.tsx
import LoginForm from '@/components/auth/LoginForm'; // 💡 ログインフォームのコンポーネントをインポート

export default function LoginPage() {
  return (
    // MainLayoutはルートで適用されているため、ここでは必要ありません
    // ログインフォームを画面中央に配置するシンプルなラッパーのみを使用
    <div className="flex justify-center items-center min-h-screen">
      <LoginForm />
    </div>
  );
}

// 💡 念のため: LoginForm.tsx 内でも useAuth を使っていないか確認してください
//    useAuth を使っている場合、その LoginForm が認証後のコンテンツを表示する設定になっていないか確認が必要です。