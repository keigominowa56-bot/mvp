// frontend/components/layouts/Footer.tsx

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const footerLinks = [
    { name: 'プラットフォームについて', href: '/about' },
    { name: '利用規約', href: '/terms' },
    { name: 'プライバシーポリシー', href: '/privacy' },
    { name: 'ヘルプ・FAQ', href: '/help' },
    { name: 'お問い合わせ', href: '/contact' },
  ];

  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        {/* リンクセクション */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-b border-gray-700 pb-6">
          {footerLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm hover:text-blue-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* コピーライト */}
        <div className="mt-4 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} 政治家透明化プラットフォーム. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;