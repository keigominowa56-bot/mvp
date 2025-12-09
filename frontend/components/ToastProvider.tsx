// frontend/components/ToastProvider.tsx

'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right" // 画面右上に表示
      reverseOrder={false} 
      toastOptions={{
        success: {
          style: {
            background: '#4CAF50',
            color: '#fff',
          },
        },
        error: {
          style: {
            background: '#F44336',
            color: '#fff',
          },
        },
      }}
    />
  );
}