'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import AppLeftPanel from '@/components/ui/AppLeftPanel';
import { SUBJECTS, STANDARDS, TERMS } from '@/types/noey';
import { formatStandard, formatTerm } from '@/lib/utils';

const SUBJECT_ICONS: Record<string, string> = {
  'Mathematics':   '/icons/math_Icon.png',
  'Language Arts': '/icons/english_icon.png',
  'Science':       '/icons/science_icon.png',
  'Social Studies': '/icons/socialstudies_icon.png',
};

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);
  const [standard, setStandard] = useState(activeChild?.standard ?? 'std_4');
  const [term, setTerm]         = useState(activeChild?.term     ?? 'term_1');

  useEffect(() => {
    if (!authLoading && !user)                        router.replace('/login');
    if (!authLoading && user && !user.active_child_id) router.replace('/profile-select');
  }, [authLoading, user]);

  function pick(subject: string) {
    router.push(
      `/child/difficulty?subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}`
    );
  }

  if (authLoading || !user) return null;

  const gemCount = user.token_balance ?? 0;

  return (
    <div className="flex flex-col min-h-dvh bg-noey-bg">

      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={gemCount}
        avatarIndex={activeChild?.avatar_index ?? 1}
        avatarName={activeChild?.display_name ?? ''}
      />

      <div className="flex flex-1">

        {/* Left panel — desktop only */}
        <AppLeftPanel
          image="/illustrations/child-homeroom-img.png"
          title="Welcome to your Home Room!"
          description="Choose a subject below and start a fresh practice exam — curriculum-aligned and unique every time."
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col">

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
              Back
            </Link>
            <h2 className="font-display italic font-semibold text-noey-dark text-lg">
              {activeChild?.display_name}&apos;s Home Room
            </h2>
          </div>

          {/* ── DESKTOP: heading ── */}
          <div className="hidden md:block px-10 pt-10 pb-6">
            <h1 className="font-display italic font-semibold text-noey-dark text-2xl">
              {activeChild?.display_name}&apos;s Home Room
            </h1>
            <div className="h-px bg-noey-neutral mt-3" />
          </div>

          {/* Subject grid */}
        <div className="flex-1 px-5 md:px-10 pb-32 md:pb-10">
          <div className="grid grid-cols-2 gap-4 content-start">
            {SUBJECTS
              .filter(subject =>
                standard !== 'std_5' || subject === 'Mathematics' || subject === 'Language Arts'
              )
              .map(subject => (
                <button
                  key={subject}
                  onClick={() => pick(subject)}
                  className="bg-noey-neutral rounded-3xl p-5 flex flex-col gap-3 active:scale-95 transition-transform hover:bg-[#EDE8E0] text-left min-h-[200px]"
                >
                  <Image
                    src={SUBJECT_ICONS[subject]}
                    alt={subject}
                    width={56}
                    height={56}
                    className="flex-shrink-0"
                  />
                  <div>
                    <p className="font-display italic font-semibold text-noey-dark text-lg leading-tight">
                      {subject}
                    </p>
                    <p className="font-sans text-noey-text-muted text-xs mt-1 leading-relaxed">
                      Tap to start practising
                    </p>
                  </div>
                </button>
              ))}
          </div>
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

      {/* Filter bar — mobile only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-noey-dark px-5 py-4">
        <p className="text-center text-sm text-white/80 font-medium mb-2">
          Showing{' '}
          <strong className="text-white">
            {formatStandard(standard)}{term ? ` ${formatTerm(term)}` : ''}
          </strong>
        </p>
        <button
          onClick={() => setFilterOpen(true)}
          className="mx-auto block bg-noey-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl"
        >
          Adjust Filters
        </button>
      </div>

      {/* Filter modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white rounded-t-3xl w-full md:max-w-md p-6 pb-10">
            <h3 className="font-display italic font-semibold text-xl text-noey-dark mb-5">
              Adjust Filters
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-sans text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-2 block">
                  Standard
                </label>
                <select
                  value={standard}
                  onChange={e => {
                    setStandard(e.target.value);
                    if (e.target.value === 'std_5') setTerm('');
                  }}
                  className="noey-input appearance-none"
                >
                  {STANDARDS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              {standard !== 'std_5' && (
                <div>
                  <label className="font-sans text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-2 block">
                    Term
                  </label>
                  <select
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    className="noey-input appearance-none"
                  >
                    {TERMS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(false)}
              className="noey-btn-primary mt-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
}