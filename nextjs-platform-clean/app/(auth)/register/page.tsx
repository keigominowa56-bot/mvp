// frontend/app/(auth)/register/page.tsx を再作成
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <RegisterForm />
    </div>
  );
}