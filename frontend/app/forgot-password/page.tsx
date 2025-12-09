'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // 既にログインしている場合はリダイレクト
  if (user) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Firebase Authenticationでパスワードリセットメールを送信
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      if (!auth) {
        throw new Error('Firebase認証が初期化されていません');
      }

      await sendPasswordResetEmail(auth, email);
      setIsEmailSent(true);
      toast.success('パスワードリセットメールを送信しました');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('このメールアドレスは登録されていません');
      } else if (error.code === 'auth/invalid-email') {
        setError('無効なメールアドレスです');
      } else if (error.code === 'auth/too-many-requests') {
        setError('リクエストが多すぎます。しばらくしてから再試行してください');
      } else {
        setError('パスワードリセットメールの送信に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-md mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              メールを送信しました
            </h1>
            <p className="text-gray-600 mb-6">
              <strong>{email}</strong> にパスワードリセットのリンクを送信しました。
              <br />
              メールボックスを確認して、リンクをクリックしてパスワードをリセットしてください。
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">次の手順</h3>
                <ol className="text-sm text-blue-800 text-left space-y-1">
                  <li>1. メールボックスを確認してください</li>
                  <li>2. パスワードリセットのメールを探してください</li>
                  <li>3. メール内のリンクをクリックしてください</li>
                  <li>4. 新しいパスワードを設定してください</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">メールが届かない場合：</p>
                    <p>迷惑メールフォルダも確認してください。数分待っても届かない場合は、再度お試しください。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                別のメールアドレスで再試行
              </button>
              
              <Link
                href="/login"
                className="block text-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                ログインページに戻る
              </Link>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">パスワードを忘れた場合</h1>
            <p className="text-gray-600">
              登録されているメールアドレスを入力してください。<br />
              パスワードリセットのリンクを送信します。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  送信中...
                </div>
              ) : (
                'パスワードリセットメールを送信'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              ログインページに戻る
            </Link>
            
            <div className="text-sm text-gray-500">
              アカウントをお持ちでない場合は{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                新規登録
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">パスワードリセットについて</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• パスワードリセットメールは数分以内に届きます</li>
              <li>• メールが届かない場合は迷惑メールフォルダを確認してください</li>
              <li>• リンクは24時間有効です</li>
              <li>• セキュリティのため、リンクは1回のみ使用できます</li>
            </ul>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
