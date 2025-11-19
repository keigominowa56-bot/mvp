// frontend/lib/api.ts

import axios from 'axios';

// 💡 修正点: baseURLをバックエンドのルートエンドポイントに設定します
const API_BASE_URL = 'http://localhost:8000/api'; 

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: 認証トークンを自動で付与
apiClient.interceptors.request.use(config => {
  // localStorageなどから認証トークンを取得する処理を想定
  const token = localStorage.getItem('token'); 
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;