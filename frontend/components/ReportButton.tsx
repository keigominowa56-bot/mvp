'use client';

import { useRouter } from 'next/navigation';

type Props = {
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
};

export default function ReportButton({ targetId, targetType }: Props) {
  const router = useRouter();

  function handleClick() {
    router.push(`/report?targetId=${targetId}&targetType=${targetType}`);
  }

  return (
    <button
      className="rounded bg-orange-600 text-white px-3 py-1 text-sm hover:bg-orange-700"
      onClick={handleClick}
      aria-label="通報する"
      title="不適切な内容を通報します"
    >
      通報
    </button>
  );
}