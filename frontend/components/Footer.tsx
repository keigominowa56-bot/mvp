export default function Footer() {
  return (
    <footer className="mt-8 border-t pt-4 text-xs text-slate-500">
      <div className="flex gap-4 flex-wrap">
        <a href="/legal/terms" className="underline">利用規約</a>
        <a href="/legal/privacy" className="underline">プライバシーポリシー</a>
        <a href="/contact" className="underline">お問い合わせ(準備中)</a>
      </div>
      <div className="mt-2">&copy; 2025 サービス名 (仮)</div>
    </footer>
  );
}