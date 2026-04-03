'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import GemBadge from '@/components/ui/GemBadge';
import Spinner from '@/components/ui/Spinner';
import { useMyBoards } from '@/hooks/useLeaderboard';
import AppLeftPanel from '@/components/ui/AppLeftPanel';

const ACTION_CARDS = [
  {
    key:      'leaderboard',
    label:    'Leaderboards',
    desc:     'See how you rank against other students.',
    icon:     '/icons/leaderboard_Icon.png',
    href:     '/child/leaderboard',
    coral:    false,
  },
  {
    key:      'progress',
    label:    'My Progress',
    desc:     'Track your scores and improvement over time.',
    icon:     '/icons/progress_Icon.png',
    href:     '/child/progress',
    coral:    false,
  },
  {
    key:      'content',
    label:    'Content Settings',
    desc:     'Set your standard, term and subjects.',
    icon:     '/icons/start_Icon.png',
    href:     '/child/content-settings',
    coral:    false,
    desktopOnly: true,
  },
  {
    key:      'news',
    label:    'NoeyAI News',
    desc:     'Latest updates from the NoeyAI team.',
    icon:     '/icons/news_Icon.png',
    href:     '/news',
    coral:    false,
  },
];

export default function ChildHomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);
  const { data: myBoards } = useMyBoards(!!activeChild);
  const leaderboardCount = myBoards?.boards?.length ?? 0;

  useEffect(() => {
    if (!authLoading && !user)                   { router.replace('/login'); return; }
    if (!authLoading && user && !user.active_child_id) { router.replace('/profile-select'); return; }
    if (user?.active_child_id) {
      api.get('/tokens/balance')
        .then(({ data }) => setBalance(data.data.balance))
        .catch(() => setBalance(user.token_balance ?? 0));
    }
  }, [authLoading, user?.active_child_id]);

  if (authLoading || !activeChild) return null;

  const gemCount = balance ?? user?.token_balance ?? 0;

  return (
    <div className="flex flex-col min-h-dvh bg-noey-bg">

      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={gemCount}
        avatarIndex={activeChild.avatar_index}
        avatarName={activeChild.display_name}
      />

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden flex-1 flex flex-col px-5 pb-8">

        {/* Back + title row */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <Link
            href="/profile-select"
            className="flex items-center gap-2 text-noey-text-muted font-semibold text-sm"
          >
            <div className="w-8 h-8 rounded-full bg-noey-dark flex items-center justify-center">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            Select Profile
          </Link>
          <h2 className="font-display italic font-semibold text-noey-dark text-lg">
            {activeChild.display_name}&apos;s Dashboard
          </h2>
        </div>

        {/* Hero row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <h1 className="font-display italic font-semibold text-noey-dark text-2xl leading-snug mb-2">
              Welcome to Dashboard!
            </h1>
            <div className="flex items-center gap-2">
              <GemBadge count={gemCount} />
              <span className="font-sans text-noey-text-muted text-xs">gems available</span>
            </div>
          </div>
         
        </div>

        {/* Start Practicing — coral card */}
        <button
          onClick={() => router.push('/child/subjects')}
          className="w-full bg-noey-primary rounded-3xl p-5 flex items-center gap-4 mb-3 active:scale-[0.98] transition-transform"
        >
          <Image src="/icons/start_Icon.png" alt="Start" width={52} height={52} className="flex-shrink-0" />
          <div className="text-left">
            <p className="font-display italic font-semibold text-white text-xl leading-tight">
              Start Practicing
            </p>
            <p className="font-sans text-white/80 text-xs mt-0.5">
              Generate a fresh exam now.
            </p>
          </div>
        </button>

        {/* Secondary cards */}
        {ACTION_CARDS.filter(c => !c.desktopOnly).map(card => (
          <button
            key={card.key}
            onClick={() => router.push(card.href)}
            className="w-full bg-noey-neutral rounded-3xl p-4 flex items-center gap-4 mb-3 active:scale-[0.98] transition-transform"
          >
            <Image src={card.icon} alt={card.label} width={48} height={48} className="flex-shrink-0" />
            <div className="text-left flex-1">
              <p className="font-display italic font-semibold text-noey-dark text-lg leading-tight">
                {card.label}
              </p>
              <p className="font-sans text-noey-text-muted text-xs mt-0.5">{card.desc}</p>
            </div>
            {card.key === 'leaderboard' && leaderboardCount > 0 && (
              <span className="text-xs font-black text-white bg-noey-primary px-2 py-0.5 rounded-full">
                {leaderboardCount}
              </span>
            )}
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:flex flex-1">

        {/* Left panel — illustration + welcome */}
        <AppLeftPanel
  image="/illustrations/child-dashboard-img.png"
  title="Welcome to your Dashboard!"
  description="Ready to practise? Generate unlimited curriculum-aligned exams and track your progress."
/>


        {/* Right panel — dashboard content */}
        <div className="flex-1 px-10 py-10 flex flex-col">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
              {activeChild.display_name}&apos;s Dashboard
            </h1>
            <div className="h-px bg-noey-neutral mt-3" />
          </div>

          {/* 2-col grid */}
          <div className="flex gap-5 flex-1">

            {/* Start Practicing — big coral card */}
            <button
              onClick={() => router.push('/child/subjects')}
              className="w-[280px] h-[390px] flex-shrink-0 bg-noey-primary rounded-3xl p-6 flex flex-col justify-between active:scale-[0.98] transition-transform overflow-hidden relative"
            >
              <div>
                <p className="font-display italic font-semibold text-white text-3xl leading-tight mb-2">
                  Start Practicing
                </p>
                <p className="font-sans text-white/80 text-sm">
                  Generate a fresh exam instantly.
                </p>
              </div>
              <div className="relative w-full h-48 mt-4">
                <Image
                  src="/illustrations/start-practicing-img.png"
                  alt="Start practicing"
                  fill
                  sizes="280px"
                  className="object-contain object-bottom"
                />
              </div>
            </button>

            {/* Secondary cards column */}
            <div className="flex-1 flex flex-col gap-4">
              {ACTION_CARDS.map(card => (
                <button
                  key={card.key}
                  onClick={() => router.push(card.href)}
                  className="w-full bg-noey-neutral rounded-2xl p-4 flex items-center gap-4 hover:bg-noey-surface-dark active:scale-[0.98] transition-all"
                >
                  <Image src={card.icon} alt={card.label} width={52} height={52} className="flex-shrink-0" />
                  <div className="text-left flex-1">
                    <p className="font-display italic font-semibold text-noey-dark text-lg leading-tight">
                      {card.label}
                    </p>
                    <p className="font-sans text-noey-text-muted text-xs mt-0.5">{card.desc}</p>
                  </div>
                  {card.key === 'leaderboard' && leaderboardCount > 0 && (
                    <span className="text-xs font-black text-white bg-noey-primary px-2 py-0.5 rounded-full">
                      {leaderboardCount}
                    </span>
                  )}
                  <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                    <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              ))}
            </div>

          </div>

          {/* efoundry credit */}
          <div className="flex justify-end mt-8">
            <p className="font-sans text-xs text-noey-text-muted">
              Created with love and care by <span className="font-medium text-noey-text">efoundry</span>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}