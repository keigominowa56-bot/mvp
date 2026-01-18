'use client';

import Link from 'next/link';

export default function ThanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001122] to-[#003366] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ご回答ありがとうございました</h1>
          <p className="text-gray-700 mb-8">
            アンケートへのご回答を受け付けました。
            <br />
            ご協力いただき、誠にありがとうございます。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/feed"
              className="bg-[#003366] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#004488] transition-colors"
            >
              フィードに戻る
            </Link>
            <Link
              href="/campaign"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              キャンペーンページへ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

