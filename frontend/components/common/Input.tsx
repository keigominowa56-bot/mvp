// frontend/components/common/Input.tsx

import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '../../lib/utils'; // Tailwind CSSのユーティリティ関数を想定

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  register: UseFormRegisterReturn;
}

const Input: React.FC<InputProps> = ({ label, id, error, register, className, ...props }) => {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        {...register}
        {...props}
        className={cn(
          // 変更点:
          // 1. 入力文字を濃い色にする 'text-gray-900' を追加
          // 2. ページ側で 'pl-10' が適用できるように、デフォルトの 'px-3' を削除し 'py-2' のみを残す
          "w-full py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500",
          "text-gray-900", // 👈 入力文字の色を濃くする修正
          error ? "border-red-500" : "border-gray-300",
          className
        )}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;