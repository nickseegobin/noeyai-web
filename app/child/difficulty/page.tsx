'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import AppLeftPanel from '@/components/ui/AppLeftPanel';
import { GemIcon } from '@/components/ui/GemBadge';
import api from '@/lib/api';
import { DIFFICULTY_CONFIG } from '@/types/noey';
import { formatStandard, formatTerm } from '@/lib/utils';

function Content() {
  const { user }  = useAuth();
  const router    = useRouter();
  const sp        = useSearchParams();

  const subject  = sp.get('subject')  ?? 'Mathematics';
  const standard = sp.get('standard') ?? 'std_4';
  const term     = sp.get('term')     ?? 'term_1';

  const [balance, setBalance] = useState<number | null>(null);
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    api.get('/tokens/balance')
      .then(({ data }) => setBalance(data.data.balance))
      .catch(() => setBalance(0));
  }, []);

  function pick(difficulty: string) {
    router.push(
      `/child/prestart?subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}&difficulty=${difficulty}`
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-noey-bg">

      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={balance ?? 0}
        avatarIndex={activeChild?.avatar_index ?? 1}
        avatarName={activeChild?.display_name ?? ''}
      />

      <div className="flex flex-1">

        {/* Left panel — desktop only */}
        <AppLeftPanel
          image="/illustrations/difficulty.png"
          title="Choose your difficulty"
          description="Each level is uniquely generated. Pick what challenges you today."
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">

          {/* ── MOBILE: back + subject header ── */}
          <div className="md:hidden px-5 mt-4 mb-6">
            <div className="flex items-center justify-between mb-1">
              <Link
                href="/child/subjects"
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
                  {subject}
                </p>
                <p className="font-sans text-noey-text-muted text-sm">
                  {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* ── DESKTOP: heading ── */}
          <div className="hidden md:block px-10 pt-10 pb-6">
            <div className="flex items-baseline gap-3 mb-1">
              <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
                {subject}
              </h1>
              <span className="font-sans text-noey-text-muted text-sm">
                {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
              </span>
            </div>
            <div className="h-px bg-noey-neutral mt-3" />
          </div>

          {/* Difficulty cards */}
          <div className="flex-1 px-5 md:px-10 pb-10 flex flex-col gap-4">
            {(['easy', 'medium', 'hard'] as const).map(diff => {
              const c         = DIFFICULTY_CONFIG[diff];
              const canAfford = balance === null ? true : balance >= c.gemCost;

              return (
                <button
                  key={diff}
                  onClick={() => canAfford && pick(diff)}
                  disabled={!canAfford && balance !== null}
                  className={`w-full bg-noey-neutral rounded-3xl p-6 text-left relative
                    active:scale-[0.98] transition-all
                    ${!canAfford && balance !== null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#EDE8E0]'}`}
                >
                  {/* Gem cost — top right */}
                  <div className="absolute top-5 right-5 flex items-center gap-1.5">
                    <GemIcon size={22} />
                    <span className="font-sans font-black text-lg text-noey-dark">
                      {c.gemCost}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="font-display italic font-semibold text-noey-dark text-4xl md:text-5xl leading-none mb-3">
                    {c.label}
                  </h3>

                  {/* Questions + time */}
                  <p className="font-sans font-semibold text-noey-dark text-sm md:text-base mb-1">
                    {c.questions} Questions | {c.minutesPerQuestion} minutes Each
                  </p>

                  {/* Description */}
                  <p className="font-sans text-noey-text-muted text-sm">
                    {c.description}
                  </p>

                  {/* Not enough gems */}
                  {!canAfford && balance !== null && (
                    <p className="font-sans text-noey-primary text-xs font-bold mt-2">
                      Not enough gems
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* efoundry credit — desktop only */}
          <div className="hidden md:flex justify-end px-10 pb-6">
            <p className="font-sans text-xs text-noey-text-muted">
              Created with love and care by{' '}
              <span className="font-medium text-noey-text">efoundry</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function DifficultyPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}