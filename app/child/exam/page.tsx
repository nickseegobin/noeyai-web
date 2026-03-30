"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import Spinner from "@/components/ui/Spinner";
import type { ExamSession, Question, SubmitAnswer } from "@/types/noey";
import { DIFFICULTY_CONFIG } from "@/types/noey";
import { formatStandard, formatTerm, formatDuration } from "@/lib/utils";

const KEYS = ["A", "B", "C", "D"] as const;

function Content() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  const sessionId = Number(sp.get("session_id"));
  const subject = sp.get("subject") ?? "Mathematics";
  const standard = sp.get("standard") ?? "std_4";
  const term = sp.get("term") ?? "term_1";
  const difficulty = sp.get("difficulty") ?? "easy";
  const config = DIFFICULTY_CONFIG[difficulty];
  const secsPerQ = config.minutesPerQuestion * 60;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timings, setTimings] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(secsPerQ);
  const [showHint, setShowHint] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justAnswered, setJustAnswered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    const raw = sessionStorage.getItem("noey_exam_session");
    if (raw) {
      const s: ExamSession = JSON.parse(raw);
      setQuestions(s.package.questions);
      setLoading(false);
    } else {
      router.replace("/child/subjects");
    }
  }, []);

  useEffect(() => {
    if (loading || !questions.length) return;
    setTimeLeft(secsPerQ);
    setShowHint(false);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); autoAdvance(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [current, loading]);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") saveCheckpoint(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [current, answers]);

  function autoAdvance() {
    const q = questions[current];
    if (!answers[q.question_id]) setAnswers(p => ({ ...p, [q.question_id]: "" }));
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
    setAnswers(p => ({ ...p, [q.question_id]: "" }));
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
      const selected = answers[q.question_id] ?? "";
      const correct = q.correct_answer ?? "";
      return {
        question_id: q.question_id,
        selected_answer: selected,
        correct_answer: correct,
        is_correct: selected !== "" && selected === correct,
        topic: q.meta.topic,
        subtopic: q.meta.subtopic,
        cognitive_level: q.meta.cognitive_level,
        time_taken_seconds: timings[q.question_id] ?? 0,
      };
    });

    try {
      const { data } = await api.post(`/exams/${sessionId}/submit`, { answers: submitAnswers });

      // ── DEBUG: leaderboard scoring ────────────────────────────────────────────
      if (process.env.NODE_ENV !== "production") {
        console.group("[NoeyAI] Exam submit response");
        console.log("Raw data.data:", data.data);
        const lu = data.data?.leaderboard_update;
        if (lu) {
          console.log("✅ leaderboard_update received:", {
            points_earned:      lu.points_earned,
            total_points_today: lu.total_points_today,
            board_key:          lu.board_key,
            new_rank:           lu.new_rank,
            previous_rank:      lu.previous_rank,
          });
        } else {
          console.warn("⚠️ leaderboard_update is null/missing — Railway side-effect may have failed");
        }
        console.groupEnd();
      }
      // ── END DEBUG ─────────────────────────────────────────────────────────────

      // Store the FULL response data — includes leaderboard_update if API returns it
      // leaderboard_update shape: { points_earned, total_points_today, board_key, new_rank, previous_rank }
      // It may be null if leaderboard system didn't process — results page handles both cases
      const resultPayload = {
        ...data.data,
        leaderboard_update: data.data.leaderboard_update ?? null,
      };

      sessionStorage.setItem("noey_exam_result", JSON.stringify(resultPayload));
      sessionStorage.removeItem("noey_exam_session");

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
    sessionStorage.removeItem("noey_exam_session");
    await refreshUser();
    router.push("/child/subjects");
  }

  if (loading || !questions.length) {
    return <div className="flex items-center justify-center min-h-dvh"><Spinner color="#111114" size={32} /></div>;
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4">
        <Spinner color="#111114" size={32} />
        <p className="text-noey-text font-bold">Submitting your exam...</p>
      </div>
    );
  }

  const q = questions[current];
  const selected = answers[q.question_id];
  const pct = ((current + 1) / questions.length) * 100;
  const timerColor = timeLeft <= 10 ? "#E8396A" : timeLeft <= 30 ? "#F59E0B" : "#22C55E";
  const isFirst = current === 0;
  const isLast = current + 1 >= questions.length;

  return (
    <>
      <div className="flex flex-col min-h-dvh">
        <NavBar zone="child" showGems={false} showAvatar avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />

        <div className="flex-1 flex flex-col px-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-black text-base text-noey-text">{subject} </span>
              <span className="text-noey-text-muted text-xs">{formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ""}</span>
            </div>
            <div className="text-right">
              <span className="font-black text-lg" style={{ color: timerColor }}>{formatDuration(timeLeft)}</span>
              <p className="text-noey-text-muted text-xs">Q {current + 1}/{questions.length}</p>
            </div>
          </div>

          <div className="h-1.5 bg-noey-surface rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-noey-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>

          <p className="font-semibold text-lg text-noey-text leading-snug mb-5">{q.question}</p>

          <div className="bg-noey-surface rounded-3xl p-4 flex flex-col gap-3 mb-4">
            {KEYS.map(key => {
              const text = q.options[key];
              if (!text) return null;
              return (
                <button key={key} onClick={() => handleAnswer(key)} disabled={justAnswered}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200
                    ${selected === key ? "bg-noey-primary text-white scale-[0.98]" : "bg-white text-noey-text hover:bg-noey-surface-dark active:scale-[0.98]"}
                    ${justAnswered && selected !== key ? "opacity-50" : ""}`}>
                  <span className={`font-black text-sm w-6 flex-shrink-0 ${selected === key ? "text-white" : "text-noey-text-muted"}`}>{key}.</span>
                  <span className="font-semibold text-sm">{text}</span>
                </button>
              );
            })}
          </div>

          {difficulty !== "hard" && q.tip && (
            <p className="flex gap-2 text-sm text-noey-text-muted font-medium mb-4"><span>💡</span><span>{q.tip}</span></p>
          )}
          {difficulty === "hard" && !showHint && (
            <button onClick={() => setShowHint(true)} className="text-sm text-noey-text-muted font-semibold mb-4 underline text-left">Show Hint</button>
          )}
          {difficulty === "hard" && showHint && q.tip && (
            <p className="flex gap-2 text-sm text-noey-text-muted font-medium mb-4"><span>💡</span><span>{q.tip}</span></p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2">
            <button onClick={goBack} disabled={isFirst}
              className={`flex items-center gap-2 font-bold text-sm transition-opacity ${isFirst ? "opacity-30" : "opacity-100"}`}>
              <div className="w-10 h-10 rounded-full bg-noey-text flex items-center justify-center">
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                  <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-noey-text">Back</span>
            </button>

            {isLast ? (
              <button onClick={submitExam} disabled={submitting}
                className="bg-noey-primary text-white font-bold text-sm px-6 py-3 rounded-2xl disabled:opacity-50">
                Submit
              </button>
            ) : (
              <button onClick={handleSkip}
                className="text-noey-text-muted font-semibold text-sm px-6 py-3 rounded-2xl bg-noey-surface hover:bg-noey-surface-dark transition-colors">
                Skip →
              </button>
            )}
          </div>

          <button onClick={() => setCancelOpen(true)} className="flex items-center gap-2 mt-4 text-noey-text-muted text-xs font-medium justify-center">
            <span>Cancel exam</span>
            <span>(gems will not be refunded)</span>
          </button>
        </div>
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelOpen(false)} />
          <div className="relative bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-xl text-noey-text text-center mb-3">End Exam?</h2>
            <p className="text-noey-text-muted text-sm text-center mb-6 leading-relaxed">
              This will permanently end your exam. Your gem has already been used and <strong>will not be refunded</strong>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelOpen(false)} className="flex-1 bg-noey-surface text-noey-text font-bold py-3.5 rounded-2xl">Keep Going</button>
              <button onClick={handleCancelConfirm} className="flex-1 bg-noey-gem text-white font-bold py-3.5 rounded-2xl">End Exam</button>
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