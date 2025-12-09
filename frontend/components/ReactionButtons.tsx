'use client';
import React, { useEffect, useState } from 'react';
import { reactionsSummary, myReaction, toggleReaction, ReactionType } from '../lib/api';
import { ThumbsUp, CheckCircle, XCircle } from 'lucide-react';

type Counts = { like: number; agree: number; disagree: number };

interface Props {
  targetId: string;
}

export default function ReactionButtons({ targetId }: Props) {
  const [counts, setCounts] = useState<Counts>({ like: 0, agree: 0, disagree: 0 });
  const [current, setCurrent] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!targetId) return;
    setLoading(true);
    setError(null);
    try {
      const summary = await reactionsSummary(targetId);
      setCounts(summary);
      const mine = await myReaction(targetId);
      setCurrent(mine.reaction);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function doToggle(type: ReactionType) {
    if (!targetId || toggling) return;
    setToggling(true);
    try {
      const result = await toggleReaction(targetId, type);
      setCurrent(result.reaction);
      setCounts(result.summary);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setToggling(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  if (!targetId) return null;

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      {error && <span style={{ color: 'red', fontSize: 12 }}>エラー: {error}</span>}
      {loading && <span style={{ fontSize: 12, color: '#64748b' }}>読み込み中...</span>}
      <ReactionButton
        label="いいね"
        icon={<ThumbsUp size={16} />}
        active={current === 'like'}
        count={counts.like}
        onClick={() => doToggle('like')}
        disabled={toggling}
      />
      <ReactionButton
        label="賛成"
        icon={<CheckCircle size={16} />}
        active={current === 'agree'}
        count={counts.agree}
        onClick={() => doToggle('agree')}
        disabled={toggling}
      />
      <ReactionButton
        label="反対"
        icon={<XCircle size={16} />}
        active={current === 'disagree'}
        count={counts.disagree}
        onClick={() => doToggle('disagree')}
        disabled={toggling}
      />
    </div>
  );
}

function ReactionButton({
  label,
  icon,
  active,
  count,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  count: number;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 6,
        border: active ? '1px solid #2563eb' : '1px solid #cbd5e1',
        background: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#0f172a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {icon}
      <span>{label}</span>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{count}</span>
    </button>
  );
}