'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@heroui/react';
import api, { getApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import AppLeftPanel from '@/components/ui/AppLeftPanel';
import { GemIcon } from '@/components/ui/GemBadge';
import Spinner from '@/components/ui/Spinner';
import { DIFFICULTY_CONFIG } from '@/types/noey';
import type { ActiveSession, ExamSession } from '@/types/noey';
import { formatStandard, formatTerm, formatDifficulty, formatDuration } from '@/lib/utils';

function Content() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  const subject    = sp.get('subject')    ?? 'Mathematics';
  const standard   = sp.get('standard')   ?? 'std_4';
  const term       = sp.get('term')       ?? 'term_1';
  const difficulty = sp.get('difficulty') ?? 'easy';
  const config     = DIFFICULTY_CONFIG[difficulty];
  const totalSecs  = config.questions * config.minutesPerQuestion * 60;

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  const [balance, setBalance]           = useState<number | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [starting, setStarting]         = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user?.active_child_id) return;

    async function init() {
      await api.post(`/children/${user!.active_child_id}/switch`).catch(() => {});
      await Promise.all([
        api.get('/tokens/balance')
          .then(({ data }) => setBalance(data.data.balance))
          .catch(() => setBalance(0)),
        api.get('/exams/active')
          .then(({ data }) => {
            const s = data.data.session;
            if (s) { setActiveSession(s); setResumePrompt(true); }
          })
          .catch(() => {}),
      ]);
    }
    init();
  }, [authLoading, user?.active_child_id]);

  async function handleDiscard() {
    if (activeSession) await api.delete(`/exams/${activeSession.session_id}`).catch(() => {});
    setActiveSession(null);
    setResumePrompt(false);
  }

  function handleResume() {
    if (!activeSession) return;
    router.push(
      `/child/exam?session_id=${activeSession.session_id}&subject=${encodeURIComponent(activeSession.subject)}&standard=${activeSession.standard}&term=${activeSession.term}&difficulty=${activeSession.difficulty}&resume=true`
    );
  }

  async function handleStart() {
    setError('');
    setStarting(true);
    try {
      if (user?.active_child_id) {
        await api.post(`/children/${user.active_child_id}/switch`).catch(() => {});
      }
      const { data } = await api.post('/exams/start', {
        standard,
        term:       standard === 'std_5' ? '' : term,
        subject,
        difficulty,
      });
      const session: ExamSession = data.data;
      sessionStorage.setItem('noey_exam_session', JSON.stringify(session));
      setBalance(session.balance_after);
      router.push(
        `/child/exam?session_id=${session.session_id}&subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}&difficulty=${difficulty}`
      );
    } catch (err) {
      const { code, message } = getApiError(err);
      if (code === 'noey_insufficient_tokens')  setError('Not enough gems. Please add more to continue.');
      else if (code === 'noey_no_exam_available') setError('No exam available for this selection. Try a different subject or difficulty.');
      else setError(message);
    } finally {
      setStarting(false);
    }
  }

  const canAfford = balance === null ? true : balance >= config.gemCost;
  const isReady   = !authLoading && balance !== null;

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
          image="/illustrations/child-homeroom-img.png"
          title="Almost ready!"
          description="Review your exam details below and start when you're ready. Good luck!"
        />

        {/* Right panel */}
        <div className="flex-1 flex flex-col relative">

          {/* ── MOBILE: back + subject header ── */}
          <div className="md:hidden flex items-center justify-between px-5 mt-4 mb-6">
            <Link
              href={`/child/difficulty?subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}`}
              className="flex items-center gap-2 text-noey-text-muted font-semibold text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-noey-dark flex items-center justify-center">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                  <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              Back
            </Link>
            <div className="text-right">
              <p className="font-display italic font-semibold text-noey-dark text-xl leading-tight">{subject}</p>
              <p className="font-sans text-noey-text-muted text-sm">
                {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
              </p>
            </div>
          </div>

          {/* Centered content */}
          <div className="flex-1 flex flex-col justify-center px-5 md:px-10 pb-10">

            {/* ── DESKTOP: heading ── */}
            <div className="hidden md:block mb-6">
              <div className="flex items-baseline gap-3">
                <h1 className="font-display italic font-semibold text-noey-dark text-2xl">{subject}</h1>
                <span className="font-sans text-noey-text-muted text-sm">
                  {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
                </span>
              </div>
              <div className="h-px bg-noey-neutral mt-3" />
            </div>

            {/* Resume prompt */}
            {resumePrompt && activeSession && (
              <div className="bg-noey-neutral border-2 border-noey-primary rounded-3xl p-6 mb-5">
                <p className="font-display italic font-semibold text-noey-dark text-xl mb-1">
                  Unfinished Exam Found
                </p>
                <p className="font-sans text-noey-text-muted text-sm mb-5">
                  You have an unfinished {activeSession.subject} exam. Resume or start fresh?
                </p>
                <div className="flex gap-3">
                  <Button
                    onPress={handleResume}
                    className="flex-1 bg-noey-primary text-white font-bold rounded-2xl h-12"
                  >
                    Resume
                  </Button>
                  <Button
                    onPress={handleDiscard}
                    variant="flat"
                    className="flex-1 bg-noey-neutral text-noey-dark font-bold rounded-2xl h-12 border border-noey-text-muted/30"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            )}

            {/* Exam details */}
            {!resumePrompt && (
              <div className="flex flex-col gap-4">

                {/* Detail card */}
                <div className="bg-noey-neutral rounded-3xl p-6">
                  <p className="font-sans font-semibold text-noey-text-muted text-xs uppercase tracking-wide mb-4">
                    Exam Summary
                  </p>
                  <div className="flex flex-col divide-y divide-noey-bg">
                   {(
                        [
                          ['Standard',   formatStandard(standard)],
                          term ? ['Term', formatTerm(term)] : null,
                          ['Difficulty', formatDifficulty(difficulty)],
                          ['Questions',  `${config.questions} Questions`],
                          ['Total Time', formatDuration(totalSecs)],
                        ] as ([string, string] | null)[]
                      ).filter((item): item is [string, string] => item !== null)
                      .map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between py-3">
                          <span className="font-sans text-noey-text-muted text-sm">{label}</span>
                          <span className="font-sans font-bold text-base text-noey-dark">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Loading indicator */}
                {!isReady && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Spinner color="#3D2B3D" size={16} />
                    <span className="font-sans text-noey-text-muted text-sm">Loading...</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                  </div>
                )}

                {/* Not enough gems */}
                {!canAfford && balance !== null && (
                  <p className="font-sans text-noey-primary text-sm font-bold text-center">
                    You need {config.gemCost} gem{config.gemCost > 1 ? 's' : ''} to start
                  </p>
                )}

                {/* Start button */}
                <Button
                  onPress={handleStart}
                  isLoading={starting}
                  isDisabled={!canAfford || starting || !isReady}
                  className="w-full bg-noey-primary text-white font-bold text-base h-14 rounded-2xl disabled:opacity-50"
                >
                  {!starting && (
                    <span className="flex items-center gap-2">
                      Start Exam
                      <GemIcon size={18} />
                      {config.gemCost}
                    </span>
                  )}
                </Button>

              </div>
            )}
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

export default function PreStartPage() {
  return <Suspense><Content /></Suspense>;
}