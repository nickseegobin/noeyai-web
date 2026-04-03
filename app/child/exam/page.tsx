'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import api, { getApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import NavBar from '@/components/ui/NavBar';
import QuestionRenderer from '@/components/ui/QuestionRenderer';
import Spinner from '@/components/ui/Spinner';
import type { ExamSession, Question, SubmitAnswer } from '@/types/noey';
import { DIFFICULTY_CONFIG } from '@/types/noey';
import { formatStandard, formatTerm, formatDuration } from '@/lib/utils';

const KEYS = ['A', 'B', 'C', 'D'] as const;

function Content() {
  const { user, refreshUser } = useAuth();
  const router  = useRouter();
  const sp      = useSearchParams();

  const sessionId  = Number(sp.get('session_id'));
  const subject    = sp.get('subject')    ?? 'Mathematics';
  const standard   = sp.get('standard')   ?? 'std_4';
  const term       = sp.get('term')       ?? 'term_1';
  const difficulty = sp.get('difficulty') ?? 'easy';
  const config     = DIFFICULTY_CONFIG[difficulty];
  const secsPerQ   = config.minutesPerQuestion * 60;

  const [questions, setQuestions]   = useState<Question[]>([]);
  const [current, setCurrent]       = useState(0);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [timings, setTimings]       = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft]     = useState(secsPerQ);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [justAnswered, setJustAnswered] = useState(false);

  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef  = useRef(Date.now());
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  // ── Load questions from sessionStorage ──
  useEffect(() => {
    const raw = sessionStorage.getItem('noey_exam_session');
    if (raw) {
      const s: ExamSession = JSON.parse(raw);
      setQuestions(s.package.questions);
      setLoading(false);
    } else {
      router.replace('/child/subjects');
    }
  }, []);

  // ── Per-question timer ──
  useEffect(() => {
    if (loading || !questions.length) return;
    setTimeLeft(secsPerQ);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); autoAdvance(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [current, loading]);

  // ── Checkpoint on tab hide ──
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') saveCheckpoint(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [current, answers]);

  function autoAdvance() {
    const q = questions[current];
    if (!answers[q.question_id]) setAnswers(p => ({ ...p, [q.question_id]: '' }));
    advanceQuestion();
  }

  function advanceQuestion() {
    clearInterval(timerRef.current!);
    saveCheckpoint();
    if (current + 1 >= questions.length) submitExam();
    else { setCurrent(c => c + 1); setJustAnswered(false); }
  }

  function goBack() {
    if (current === 0) return;
    clearInterval(timerRef.current!);
    setCurrent(c => c - 1);
    setJustAnswered(false);
  }

  function handleSkip() {
    const q = questions[current];
    setAnswers(p => ({ ...p, [q.question_id]: '' }));
    advanceQuestion();
  }

  function handleAnswer(key: string) {
    if (justAnswered) return;
    const q = questions[current];
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    setAnswers(p => ({ ...p, [q.question_id]: key }));
    setTimings(p => ({ ...p, [q.question_id]: elapsed }));
    setJustAnswered(true);
    setTimeout(() => advanceQuestion(), 400);
  }

  async function saveCheckpoint() {
    if (!sessionId) return;
    await api.post(`/exams/${sessionId}/checkpoint`, {
      state: { current_question: current, answers }
    }).catch(() => {});
  }

  async function submitExam() {
    if (submitting || !sessionId || !questions.length) return;
    setSubmitting(true);

    const submitAnswers: SubmitAnswer[] = questions.map(q => {
      const selected = answers[q.question_id] ?? '';
      const correct  = q.correct_answer ?? '';
      return {
        question_id:        q.question_id,
        selected_answer:    selected,
        correct_answer:     correct,
        is_correct:         selected !== '' && selected === correct,
        topic:              q.meta.topic,
        subtopic:           q.meta.subtopic,
        cognitive_level:    q.meta.cognitive_level,
        time_taken_seconds: timings[q.question_id] ?? 0,
      };
    });

    try {
      const { data } = await api.post(`/exams/${sessionId}/submit`, { answers: submitAnswers });

      if (process.env.NODE_ENV !== 'production') {
        console.group('[NoeyAI] Exam submit response');
        console.log('Raw data.data:', data.data);
        const lu = data.data?.leaderboard_update;
        if (lu) console.log('✅ leaderboard_update received:', lu);
        else console.warn('⚠️ leaderboard_update is null/missing');
        console.groupEnd();
      }

      const resultPayload = {
        ...data.data,
        leaderboard_update: data.data.leaderboard_update ?? null,
      };
      sessionStorage.setItem('noey_exam_result', JSON.stringify(resultPayload));
      sessionStorage.removeItem('noey_exam_session');
      router.push(
        `/child/results?session_id=${sessionId}&subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}`
      );
    } catch (err) {
      alert(`Submit failed: ${getApiError(err).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelConfirm() {
    await api.delete(`/exams/${sessionId}`).catch(() => {});
    sessionStorage.removeItem('noey_exam_session');
    await refreshUser();
    router.push('/child/subjects');
  }

  if (loading || !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-noey-bg">
        <Spinner color="#3D2B3D" size={32} />
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-noey-bg gap-4">
        <Spinner color="#3D2B3D" size={32} />
        <p className="font-sans font-bold text-noey-dark">Submitting your exam...</p>
      </div>
    );
  }

  const q          = questions[current];
  const selected   = answers[q.question_id];
  const pct        = ((current + 1) / questions.length) * 100;
  const timerColor = timeLeft <= 10 ? '#F9695A' : timeLeft <= 30 ? '#F59E0B' : '#3D2B3D';
  const isFirst    = current === 0;
  const isLast     = current + 1 >= questions.length;
  const tip        = q.tip ?? '';

  return (
    <>
      <div className="flex flex-col min-h-dvh bg-noey-bg">

        <NavBar
          zone="child"
          showGems={false}
          showAvatar
          avatarIndex={activeChild?.avatar_index ?? 1}
          avatarName={activeChild?.display_name ?? ''}
        />

        <div className="flex flex-1">

          {/* ── DESKTOP LEFT PANEL — illustration + tip ── */}
          <div className="hidden md:flex flex-col items-center bg-noey-neutral w-[38%] flex-shrink-0 px-10 py-10">
            <div className="relative w-72 h-72 mb-6 flex-shrink-0">
              <Image
                src="/illustrations/exam.png"
                alt="NoeyAI exam"
                fill
                sizes="288px"
                className="object-contain"
                priority
              />
            </div>
            {tip && (
              <>
                <h3 className="font-display italic font-semibold text-noey-dark text-2xl mb-3">
                  Tip
                </h3>
                <p className="font-sans text-noey-text-muted text-sm text-center leading-relaxed">
                  💡 {tip}
                </p>
              </>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="flex-1 flex flex-col">

            {/* ── MOBILE: back + subject header ── */}
            <div className="md:hidden flex items-center justify-between px-5 mt-4 mb-5">
              <button
                onClick={() => setCancelOpen(true)}
                className="flex items-center gap-2 text-noey-text-muted font-semibold text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-noey-dark flex items-center justify-center">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Home Room
              </button>
              <div className="text-right">
                <p className="font-display italic font-semibold text-noey-dark text-xl leading-tight">{subject}</p>
                <p className="font-sans text-noey-text-muted text-sm">
                  {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
                </p>
              </div>
            </div>

            {/* ── DESKTOP: heading ── */}
            <div className="hidden md:block px-10 pt-8 pb-5">
              <div className="flex items-baseline gap-3">
                <h1 className="font-display italic font-semibold text-noey-dark text-2xl">{subject}</h1>
                <span className="font-sans text-noey-text-muted text-sm">
                  {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ''}
                </span>
              </div>
              <div className="h-px bg-noey-neutral mt-3" />
            </div>

            {/* ── QUESTION + OPTIONS ── */}
            <div className="flex-1 px-5 md:px-10 pb-4 flex flex-col">

              {/* Question text */}
              <QuestionRenderer
                text={q.question}
                className="font-sans text-lg md:text-xl text-noey-dark leading-relaxed mb-6"
              />

              {/* Answer options */}
              <div className="bg-noey-neutral rounded-3xl p-4 flex flex-col gap-3">
                {KEYS.map(key => {
                  const text = q.options[key];
                  if (!text) return null;
                  const isSelected = selected === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleAnswer(key)}
                      disabled={justAnswered}
                      className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-200
                        ${isSelected
                          ? 'bg-noey-dark text-white scale-[0.98]'
                          : 'bg-white text-noey-dark hover:bg-noey-bg active:scale-[0.98]'}
                        ${justAnswered && !isSelected ? 'opacity-50' : ''}`}
                    >
                      <span className={`font-display italic font-semibold text-lg w-7 flex-shrink-0
                        ${isSelected ? 'text-white' : 'text-noey-text-muted'}`}>
                        {key}.
                      </span>
                      <span className="font-sans font-medium text-base">{text}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* ── BOTTOM NAV BAR ── */}
            <div className="px-5 md:px-10 py-4 flex items-center gap-4">

              {/* Back */}
              <button
                onClick={goBack}
                disabled={isFirst}
                className={`flex items-center gap-2 flex-shrink-0 transition-opacity ${isFirst ? 'opacity-30' : 'opacity-100'}`}
              >
                <div className="w-10 h-10 rounded-full bg-noey-dark flex items-center justify-center">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="font-sans font-bold text-sm text-noey-dark hidden md:inline">Back</span>
              </button>

              {/* Timer + progress + count */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className="font-sans font-black text-base tabular-nums"
                    style={{ color: timerColor }}
                  >
                    {formatDuration(timeLeft)}
                  </span>
                  <span className="font-sans text-noey-text-muted text-sm font-medium">
                    Q {current + 1}/{questions.length}
                  </span>
                </div>
                <div className="h-2 bg-noey-neutral rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: timerColor }}
                  />
                </div>
              </div>

              {/* Skip / Submit */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isLast ? (
                  <button
                    onClick={submitExam}
                    disabled={submitting}
                    className="font-sans font-bold text-sm text-noey-dark disabled:opacity-50"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={handleSkip}
                    className="font-sans font-bold text-sm text-noey-dark"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={isLast ? submitExam : handleSkip}
                  disabled={isLast && submitting}
                  className="w-10 h-10 rounded-full bg-noey-dark flex items-center justify-center"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                    <path d="M1 1l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

            </div>

            {/* ── MOBILE TIP ── */}
            {tip && (
              <div className="md:hidden px-5 pb-4">
                <p className="font-sans text-sm text-noey-text-muted leading-relaxed">
                  💡 {tip}
                </p>
              </div>
            )}

            {/* ── CANCEL LINK ── */}
            <div className="md:hidden px-5 pb-6 flex justify-center">
              <button
                onClick={() => setCancelOpen(true)}
                className="font-sans text-xs text-noey-text-muted"
              >
                Cancel exam · gems will not be refunded
              </button>
            </div>

            {/* efoundry — desktop */}
            <div className="hidden md:flex justify-end px-10 pb-6">
              <button
                onClick={() => setCancelOpen(true)}
                className="font-sans text-xs text-noey-text-muted mr-auto hover:text-noey-text transition-colors"
              >
                Cancel exam
              </button>
              <p className="font-sans text-xs text-noey-text-muted">
                Created with love and care by{' '}
                <span className="font-medium text-noey-text">efoundry</span>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ── CANCEL MODAL ── */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelOpen(false)} />
          <div className="relative bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h2 className="font-display italic font-semibold text-2xl text-noey-dark text-center mb-3">
              End Exam?
            </h2>
            <p className="font-sans text-noey-text-muted text-sm text-center mb-6 leading-relaxed">
              This will permanently end your exam. Your gem has already been used and{' '}
              <strong className="text-noey-dark">will not be refunded</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelOpen(false)}
                className="flex-1 bg-noey-neutral text-noey-dark font-bold py-3.5 rounded-2xl font-sans"
              >
                Keep Going
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 bg-noey-primary text-white font-bold py-3.5 rounded-2xl font-sans"
              >
                End Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ExamPage() {
  return <Suspense><Content /></Suspense>;
}