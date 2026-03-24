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
  const { user } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const sessionId = Number(sp.get("session_id"));
  const subject = sp.get("subject") ?? "Mathematics";
  const standard = sp.get("standard") ?? "std_4";
  const term = sp.get("term") ?? "term_1";
  const difficulty = sp.get("difficulty") ?? "easy";
  const isResume = sp.get("resume") === "true";
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    const raw = sessionStorage.getItem("noey_exam_session");
    if (raw) { const s: ExamSession = JSON.parse(raw); setQuestions(s.package.questions); setLoading(false); }
    else router.replace("/child/subjects");
  }, []);

  useEffect(() => {
    if (loading || !questions.length) return;
    setTimeLeft(secsPerQ); setShowHint(false); startRef.current = Date.now();
    timerRef.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current!); autoAdvance(); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current!);
  }, [current, loading]);

  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") saveCheckpoint(); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [current, answers, timeLeft]);

  function autoAdvance() { const q = questions[current]; if (!answers[q.question_id]) setAnswers(p => ({ ...p, [q.question_id]: "" })); advance(); }

  function pick(key: string) {
    const q = questions[current];
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    setAnswers(p => ({ ...p, [q.question_id]: key }));
    setTimings(p => ({ ...p, [q.question_id]: elapsed }));
  }

  async function advance() {
    clearInterval(timerRef.current!);
    await saveCheckpoint();
    if (current + 1 >= questions.length) await submitExam();
    else setCurrent(c => c + 1);
  }

  async function saveCheckpoint() {
    if (!sessionId) return;
    await api.post(`/exams/${sessionId}/checkpoint`, { state: { current_question: current, answers } }).catch(() => {});
  }

  async function submitExam() {
    if (submitting || !sessionId || !questions.length) return;
    setSubmitting(true);
    const submitAnswers: SubmitAnswer[] = questions.map(q => {
      const selected = answers[q.question_id] ?? "";
      const correct = q.correct_answer ?? "";
      return { question_id: q.question_id, selected_answer: selected, correct_answer: correct, is_correct: selected !== "" && selected === correct, topic: q.meta.topic, subtopic: q.meta.subtopic, cognitive_level: q.meta.cognitive_level, time_taken_seconds: timings[q.question_id] ?? 0 };
    });
    try {
      const { data } = await api.post(`/exams/${sessionId}/submit`, { answers: submitAnswers });
      sessionStorage.setItem("noey_exam_result", JSON.stringify(data.data));
      sessionStorage.removeItem("noey_exam_session");
      router.push(`/child/results?session_id=${sessionId}&subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}`);
    } catch (err) { alert(`Submit failed: ${getApiError(err).message}`); }
    finally { setSubmitting(false); }
  }

  async function handleCancel() {
    await api.delete(`/exams/${sessionId}`).catch(() => {});
    sessionStorage.removeItem("noey_exam_session");
    router.push("/child/subjects");
  }

  if (loading || !questions.length) return <div className="flex items-center justify-center min-h-dvh"><Spinner color="#111114" size={32} /></div>;

  const q = questions[current];
  const selected = answers[q.question_id];
  const pct = ((current + 1) / questions.length) * 100;
  const timerColor = timeLeft <= 10 ? "#E8396A" : timeLeft <= 30 ? "#F59E0B" : "#22C55E";

  return (
    <>
      <div className="flex flex-col min-h-dvh">
        <NavBar zone="child" showGems={false} showAvatar avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />
        <div className="flex-1 flex flex-col px-5 pb-6">
          <div className="flex items-center justify-between mb-3">
            <div><span className="font-black text-base text-noey-text">{subject} </span><span className="text-noey-text-muted text-xs">{formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ""}</span></div>
            <div className="text-right"><span className="font-black text-lg" style={{ color: timerColor }}>{formatDuration(timeLeft)}</span><p className="text-noey-text-muted text-xs">Q {current + 1}/{questions.length}</p></div>
          </div>
          <div className="h-1.5 bg-noey-surface rounded-full mb-5 overflow-hidden"><div className="h-full bg-noey-primary rounded-full transition-all duration-300" style={{ width: `${pct}%` }} /></div>
          <p className="font-semibold text-lg text-noey-text leading-snug mb-5">{q.question_text}</p>
          <div className="noey-card flex flex-col gap-3 mb-4">
            {KEYS.map(key => {
              const text = q.options[key]; if (!text) return null;
              return (
                <button key={key} onClick={() => pick(key)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${selected === key ? "bg-noey-primary text-white" : "bg-white text-noey-text hover:bg-noey-surface-dark"}`}>
                  <span className={`font-black text-sm w-6 flex-shrink-0 ${selected === key ? "text-white" : "text-noey-text-muted"}`}>{key}.</span>
                  <span className="font-semibold text-sm">{text}</span>
                </button>
              );
            })}
          </div>
          {difficulty !== "hard" ? (
            <p className="flex gap-2 text-sm text-noey-text-muted font-medium mb-4"><span>💡</span><span>{q.tip ?? `Think carefully about ${q.meta.topic}.`}</span></p>
          ) : !showHint ? (
            <button onClick={() => setShowHint(true)} className="text-sm text-noey-text-muted font-semibold mb-4 underline text-left">Show Hint</button>
          ) : (
            <p className="flex gap-2 text-sm text-noey-text-muted font-medium mb-4"><span>💡</span><span>{q.tip ?? `Think carefully about ${q.meta.topic}.`}</span></p>
          )}
          <button onClick={advance} disabled={submitting} className="noey-btn-primary flex items-center justify-center gap-2 mt-auto disabled:opacity-50">
            {submitting ? <Spinner /> : current + 1 >= questions.length ? "Submit Exam" : "Next Question"}
          </button>
          <button onClick={() => setCancelOpen(true)} className="flex items-center gap-3 mt-4 text-noey-text font-bold">
            <div className="w-10 h-10 rounded-full bg-noey-text flex items-center justify-center flex-shrink-0">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div className="text-left"><p className="font-bold text-sm">Cancel</p><p className="text-noey-text-muted text-xs">Gems will be lost [?]</p></div>
          </button>
        </div>
      </div>
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCancelOpen(false)} />
          <div className="relative bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-xl text-noey-text text-center mb-3">End Exam?</h2>
            <p className="text-noey-text-muted text-sm text-center mb-6 leading-relaxed">This will permanently end your exam. Your gem will <strong>not</strong> be refunded.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelOpen(false)} className="flex-1 bg-noey-surface text-noey-text font-bold py-3.5 rounded-2xl">Keep Going</button>
              <button onClick={handleCancel} className="flex-1 bg-noey-gem text-white font-bold py-3.5 rounded-2xl">End Exam</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ExamPage() { return <Suspense><Content /></Suspense>; }
