'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import Spinner from '@/components/ui/Spinner';
import type { SubmitResult, TopicBreakdown } from '@/types/noey';
import type { LeaderboardUpdate } from '@/lib/leaderboard';
import { formatStandard, formatTerm, formatDuration, getScoreLabel, getScoreColor } from '@/lib/utils';

const INSIGHTS_ENABLED = true; // toggle for the "Performance Review" section

interface ExamResult extends SubmitResult {
  leaderboard_update?: LeaderboardUpdate | null;
  insight?: string | null;  // ← add this
}

function Content() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const sp     = useSearchParams();

  const sessionId = Number(sp.get('session_id'));
  const subject   = sp.get('subject')  ?? 'Mathematics';
  const standard  = sp.get('standard') ?? 'std_4';
  const term      = sp.get('term')     ?? 'term_1';

  const [result, setResult] = useState<ExamResult | null>(null);
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    const raw = sessionStorage.getItem('noey_exam_result');
    if (raw) {
      setResult(JSON.parse(raw));
      sessionStorage.removeItem('noey_exam_result');
    }
    refreshUser();
  }, []);

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-noey-bg">
        <Spinner color="#3D2B3D" size={32} />
      </div>
    );
  }

  const scoreColor = getScoreColor(result.percentage);
  const lu         = result.leaderboard_update;

  return (
    <div className="flex flex-col min-h-dvh bg-noey-bg">

      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={user?.token_balance ?? 0}
        avatarIndex={activeChild?.avatar_index ?? 1}
        avatarName={activeChild?.display_name ?? ''}
      />

      {/* ── MOBILE: back + title ── */}
      <div className="md:hidden flex items-center justify-between px-5 mt-4 mb-6">
        <Link
          href="/child/home"
          className="flex items-center gap-2 text-noey-text-muted font-semibold text-sm"
        >
          <div className="w-8 h-8 rounded-full bg-noey-dark flex items-center justify-center">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          Home Room
        </Link>
        <div className="text-right">
          <p className="font-display italic font-semibold text-noey-dark text-xl leading-tight">
            {subject} Results
          </p>
          <p className="font-sans text-noey-text-muted text-sm">
            {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
          </p>
        </div>
      </div>

      {/* ── MAIN CONTENT — centered column ── */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-5 md:px-10 pb-10">

        {/* ── DESKTOP: heading ── */}
        <div className="hidden md:block mb-8">
          <div className="flex items-baseline gap-3">
            <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
              {subject} Results
            </h1>
            <span className="font-sans text-noey-text-muted text-sm">
              {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
            </span>
          </div>
          <div className="h-px bg-noey-neutral mt-3" />
        </div>

        {/* ── SCORE ROW ── */}
        <div className="flex items-center gap-6 mb-6">
          <Donut percentage={result.percentage} color={scoreColor} />
          <div className="flex flex-col gap-2 flex-1">
            {[
              ['Correct Answers', `${result.score}/${result.total}`],
              ['Time Used',       formatDuration(result.time_taken_seconds)],
              ['Score',           `${result.percentage.toFixed(0)}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-sans text-noey-text-muted text-sm">{label}</span>
                <span className="font-sans font-bold text-base text-noey-dark">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── LEADERBOARD CARD ── */}
        {lu && (
          <div className="bg-noey-neutral rounded-3xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display italic font-semibold text-noey-dark text-xl">
                Leaderboard
              </h2>
              <Link
                href="/child/leaderboard"
                className="font-sans text-sm font-semibold text-noey-dark underline underline-offset-2"
              >
                Full Leaderboard›
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {/* Thumbs icon */}
              <div className="flex-shrink-0">
                <Image
                  src="/icons/thumbs.png"
                  alt="Great job!"
                  width={52}
                  height={52}
                  className="object-contain"
                />
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-noey-text-muted/20 flex-shrink-0" />

              {/* Rank text */}
              <div className="flex-1">
                <p className="font-sans font-bold text-base text-noey-dark">
                  You&apos;re #{lu.new_rank} Today!
                </p>
                <p className="font-sans text-noey-text-muted text-sm">
                  {lu.total_points_today}pts Total Today +{lu.points_earned} this exam
                </p>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-noey-text-muted/20 flex-shrink-0" />

              {/* Big rank number */}
              <div className="flex-shrink-0 text-right">
                <span className="font-sans font-black text-5xl text-noey-dark">
                  #{lu.new_rank}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── TOPIC BREAKDOWN ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display italic font-semibold text-noey-dark text-xl">
              Topics Breakdown
            </h2>
            <Link
              href="/child/progress"
              className="font-sans text-sm font-semibold text-noey-dark underline underline-offset-2"
            >
              My Progress›
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {result.topic_breakdown.map(t => (
              <TopicBar key={t.topic} topic={t} />
            ))}
          </div>
        </div>

        {/* ── PERFORMANCE REVIEW ── */}
        {INSIGHTS_ENABLED && (
          <div className="bg-noey-neutral rounded-3xl p-6 mb-6">
            <h2 className="font-display italic font-semibold text-noey-dark text-xl mb-3">
              Performance Review
            </h2>
            <p className="font-sans text-noey-dark text-sm leading-relaxed">
              {result.insight}
            </p>
          </div>
        )}

        {/* Placeholder when insights disabled but show in design */}
        {!INSIGHTS_ENABLED && (
          <div className="bg-noey-neutral rounded-3xl p-6 mb-6">
            <h2 className="font-display italic font-semibold text-noey-dark text-xl mb-3">
              Performance Review
            </h2>
            <p className="font-sans text-noey-text-muted text-sm leading-relaxed">
              Your personalised AI performance review will appear here after your next exam.
            </p>
          </div>
        )}

        {/* ── DONE BUTTON ── */}
        <button
          onClick={() => router.push('/child/home')}
          className="w-full bg-noey-dark text-white font-bold text-base h-14 rounded-2xl font-sans hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Done
        </button>

        {/* efoundry — desktop */}
        <div className="hidden md:flex justify-end mt-8">
          <p className="font-sans text-xs text-noey-text-muted">
            Created with love and care by{' '}
            <span className="font-medium text-noey-text">efoundry</span>
          </p>
        </div>

      </div>
    </div>
  );
}

function Donut({ percentage, color }: { percentage: number; color: string }) {
  const r    = 44;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;

  return (
    <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E8E4DE" strokeWidth="12"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-sans font-black text-xl text-noey-dark">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function TopicBar({ topic }: { topic: TopicBreakdown }) {
  const pct = topic.total > 0 ? (topic.correct / topic.total) * 100 : 0;

  // Explicit color based on score
  const color =
    pct >= 75 ? '#22C55E' :
    pct >= 50 ? '#F59E0B' :
    '#F9695A';

  const label = getScoreLabel(pct);

  return (
    <div>
      <p className="font-sans font-medium text-sm text-noey-dark mb-1.5">{topic.topic}</p>
      <div className="relative h-9 bg-noey-neutral rounded-2xl overflow-hidden">
        {pct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-2xl transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-end px-3 gap-2">
          <span className="font-sans text-xs font-bold text-noey-dark">
            {topic.correct}/{topic.total}
          </span>
          <span className="font-sans text-xs font-bold text-noey-dark">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <Suspense><Content /></Suspense>;
}