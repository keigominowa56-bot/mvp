// frontend/app/(main)/profile/page.tsx

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Settings, Loader2, LogOut, Lock } from 'lucide-react';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

// ----------------------------------------------------
// 1. フォームのルール (Zod)
// ----------------------------------------------------

// プロフィール編集用のスキーマ
const profileSchema = z.object({
  displayName: z.string().min(2, { message: '表示名は2文字以上で入力してください' }).max(50),
  district: z.string().min(1, { message: '居住区を選択してください' }),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

// パスワード変更用のスキーマ
// (現在は構造のみ。バックエンドの実装が必要です)
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: '現在のパスワードを入力してください' }),
  newPassword: z.string().min(6, { message: '新しいパスワードは6文字以上で入力してください' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '新しいパスワードが一致しません',
  path: ['confirmPassword'],
});

type PasswordFormInputs = z.infer<typeof passwordSchema>;

// ----------------------------------------------------
// 2. プロフィールページコンポーネント
// ----------------------------------------------------

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  // 居住区リスト (register/page.tsxから再利用)
  const districts = useMemo(() => ([
    '渋谷区', '新宿区', '世田谷区', '港区', '千代田区', '中央区', '文京区', '台東区',
    // ... 他の区市町村もここに続きます ...
    '墨田区', '江東区', '品川区', '目黒区', '大田区', '杉並区', '豊島区', '北区',
    '荒川区', '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区', '八王子市', '立川市',
    '武蔵野市', '三鷹市', '青梅市', '府中市', '昭島市', '調布市', '町田市', '小金井市',
    '小平市', '日野市', '東村山市', '国分寺市', '国立市', '福生市', '狛江市', '東大和市',
    '清瀬市', '東久留米市', '武蔵村山市', '多摩市', '稲城市', '羽村市', 'あきる野市', '西東京市'
  ]), []);

  // フォームの設定
  const profileForm = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    // ユーザー情報がロードされたら、フォームの初期値を設定する
    defaultValues: {
      displayName: user?.displayName || '',
      district: user?.district || '',
    },
    // userが変更されたときにフォームの値をリセット/更新
    values: useMemo(() => ({
      displayName: user?.displayName || '',
      district: user?.district || '',
    }), [user])
  });

  const passwordForm = useForm<PasswordFormInputs>({
    resolver: zodResolver(passwordSchema),
  });

  // フォーム送信時の処理 (プロフィール編集)
  const onProfileSubmit = async (data: ProfileFormInputs) => {
    // TODO: ここにバックエンドAPIを呼び出すロジックを実装します
    console.log('プロフィール更新データ:', data);
    try {
      // await apiClient.put(`/users/${user.id}`, data); // 実際の実装
      await new Promise(resolve => setTimeout(resolve, 1000)); // ダミーの待機時間
      toast.success('プロフィールが更新されました！');
      // 画面を再描画するか、AuthContextのユーザー情報を更新する処理が必要
    } catch (error) {
      toast.error('プロフィールの更新に失敗しました。');
      console.error('Profile update error:', error);
    }
  };

  // フォーム送信時の処理 (パスワード変更)
  const onPasswordSubmit = async (data: PasswordFormInputs) => {
    // TODO: ここにFirebase/APIを使ってパスワードを変更するロジックを実装します
    console.log('パスワード変更データ:', data);
    try {
      // await updatePassword(data.newPassword); // Firebaseの関数を呼び出す想定
      await new Promise(resolve => setTimeout(resolve, 1000)); // ダミーの待機時間
      passwordForm.reset(); // フォームをリセット
      toast.success('パスワードが変更されました。');
    } catch (error) {
      toast.error('パスワードの変更に失敗しました。現在のパスワードを確認してください。');
      console.error('Password change error:', error);
    }
  };


  // 未ログインまたは読み込み中の処理
  useEffect(() => {
    if (!authLoading && !user) {
      // 未ログインならログインページへリダイレクト
      router.replace('/login');
      toast.error('プロフィールを確認するにはログインが必要です。');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-600">認証情報を確認中...</p>
      </div>
    );
  }

  // ----------------------------------------
  // 3. ページ表示
  // ----------------------------------------

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        <Settings className="w-8 h-8 mr-3 text-blue-600" />
        アカウント設定
      </h1>

      <div className="space-y-10">
        
        {/* 1. プロフィール編集セクション */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-500" />
            プロフィール情報
          </h2>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            
            {/* メールアドレス (編集不可として表示) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500">※メールアドレスの変更は別途サポートが必要です。</p>
            </div>
            
            {/* 表示名 */}
            <Input
              label="表示名"
              id="displayName"
              type="text"
              placeholder="山田 太郎"
              register={profileForm.register('displayName')}
              error={profileForm.formState.errors.displayName?.message}
              icon={User}
              className="pl-10"
            />

            {/* 居住区 (Select) */}
            <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    居住区
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <select
                        id="district"
                        {...profileForm.register('district')}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                            profileForm.formState.errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">居住区を選択してください</option>
                        {districts.map((district) => (
                            <option key={district} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>
                    {profileForm.formState.errors.district && <p className="mt-1 text-sm text-red-600">{profileForm.formState.errors.district.message}</p>}
                </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              loading={profileForm.formState.isSubmitting}
              disabled={profileForm.formState.isSubmitting || !profileForm.formState.isDirty} // 変更がない場合は無効化
            >
              プロフィールを更新
            </Button>
          </form>
        </section>

        {/* 2. セキュリティ設定セクション (パスワード変更) */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Lock className="w-6 h-6 mr-2 text-blue-500" />
            セキュリティ設定
          </h2>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
            
            <Input
              label="現在のパスワード"
              id="currentPassword"
              type="password"
              placeholder="現在のパスワードを入力"
              register={passwordForm.register('currentPassword')}
              error={passwordForm.formState.errors.currentPassword?.message}
              icon={Lock}
              className="pl-10"
            />

            <Input
              label="新しいパスワード"
              id="newPassword"
              type="password"
              placeholder="6文字以上"
              register={passwordForm.register('newPassword')}
              error={passwordForm.formState.errors.newPassword?.message}
              icon={Lock}
              className="pl-10"
            />

            <Input
              label="新しいパスワード (確認)"
              id="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              register={passwordForm.register('confirmPassword')}
              error={passwordForm.formState.errors.confirmPassword?.message}
              icon={Lock}
              className="pl-10"
            />

            <Button
              type="submit"
              variant="secondary"
              className="w-full sm:w-auto"
              loading={passwordForm.formState.isSubmitting}
              disabled={passwordForm.formState.isSubmitting}
            >
              パスワードを変更
            </Button>
          </form>
        </section>

        {/* 3. その他のアクション (ログアウト) */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-gray-900">ログアウト</h2>
                <p className="text-gray-600">現在のセッションを終了します。</p>
            </div>
            <Button
                onClick={logout}
                variant="destructive"
                className="flex items-center"
            >
                <LogOut className="w-5 h-5 mr-2" />
                ログアウト
            </Button>
        </section>

        {/* TODO: アカウント削除機能などもここに追加できます */}
      </div>
    </div>
  );
}