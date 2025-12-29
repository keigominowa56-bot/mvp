// frontend/components/auth/RegisterForm.tsx (完全版)
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE } from '../../lib/api';
import toast from 'react-hot-toast';

const initialFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '', 
  age: '',         
  prefecture: '',  
  city: '',
  name: '', // 名前フィールドを追加
};

export default function RegisterForm() {
  const [formData, setFormData] = useState(initialFormData);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('パスワードが一致しません。');
      return;
    }

    if (!formData.name) {
      toast.error('名前を入力してください。');
      return;
    }

    try {
      // 登録APIを呼び出し
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          age: parseInt(formData.age, 10),
          addressPref: formData.prefecture,
          addressCity: formData.city,
          phone: formData.phoneNumber || undefined,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || '登録に失敗しました');
      }
      
      toast.success('登録が完了しました。ログインページに移動します。');
      
      // 成功したらログインページへ
      router.push('/login');

    } catch (error: any) {
      const errorMessage = error.message || '登録に失敗しました。';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">新規会員登録</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* === 認証情報 === */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="name">名前</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="email">メールアドレス</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="password">パスワード</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="password" type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="confirmPassword">パスワード（確認）</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </div>

        {/* === 本人確認情報 === */}
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="phoneNumber">電話番号</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="phoneNumber" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="age">年齢</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="age" type="number" name="age" value={formData.age} onChange={handleChange} min="18" required />
        </div>
        
        {/* === 住所情報 === */}
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="prefecture">都道府県</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="prefecture" type="text" name="prefecture" value={formData.prefecture} onChange={handleChange} required />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="city">市区町村</label>
          <input className="shadow border rounded w-full py-2 px-3 text-gray-700" id="city" type="text" name="city" value={formData.city} onChange={handleChange} required />
        </div>

        {/* === 送信ボタン === */}
        <div className="md:col-span-2 mt-6 flex justify-center">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 w-full"
            type="submit"
          >
            本登録を完了する
          </button>
        </div>
      </form>
    </div>
  );
}