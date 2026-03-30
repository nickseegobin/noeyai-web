"use client";

// /parent/exam-detail?session_id=X&child_id=Y&child_name=Z
// Switches to child context, fetches full result + AI insight, displays everything.

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import Spinner from "@/components/ui/Spinner";
import type { ResultDetail, InsightResult } from "@/types/noey";
import {
  formatDate,
  formatDifficulty,
  formatDuration,
  formatStandard,
  formatTerm,
  getScoreColor,
  getScoreLabel,
} from "@/lib/utils";

function Content() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  const sessionId = sp.get("session_id") ?? "";
  const childId = sp.get("child_id") ?? "";
  const childName = sp.get("child_name") ?? "Child";

  const [detail, setDetail] = useState<ResultDetail | null>(null);
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!authLoading && user && sessionId && childId) {
      loadDetail();
    }
  }, [authLoading, user]);

  async function loadDetail() {
    setLoading(true);
    try {
      // Switch to child context so results endpoint authorises correctly
      await api.post(`/children/${childId}/switch`);

      const { data } = await api.get(`/results/${sessionId}`);
      setDetail(data.data);

      // Fetch cached insight non-blocking
      api.get(`/insights/exam/${sessionId}`)
        .then(({ data: ins }) => setInsight(ins.data))
        .catch(() => {});
    } catch (err: any) {
      setError("Could not load exam details. The session may not exist.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    // Switch back to parent context then navigate to analytics
    api.post("/children/deselect").catch(() => {});
    router.push(`/parent/analytics?child_id=${childId}`);
  }

  if (authLoading) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="parent" showGems={false} showAvatar={false} />

      <div className="flex-1 px-5 pb-8">

        {loading ? (
          <div className="flex items-center justify-center pt-24">
            <div className="flex flex-col items-center gap-3">
              <Spinner color="#111114" size={28} />
              <p className="text-noey-text-muted text-sm font-medium">Loading exam details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4">
            <p className="text-noey-text-muted text-sm text-center">{error}</p>
            <button onClick={handleBack} className="bg-noey-primary text-white font-bold px-6 py-3 rounded-2xl text-sm">
              Go Back
            </button>
          </div>
        ) : detail ? (
          <>
            {/* Page header */}
            <div className="mb-6">
              <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">
                {childName}'s Exam
              </p>
              <h1 className="font-black text-2xl text-noey-text">{detail.session.subject}</h1>
              <p className="text-noey-text-muted text-sm font-medium mt-1">
                {formatStandard(detail.session.standard)}
                {detail.session.term ? ` · ${formatTerm(detail.session.term)}` : ""}
                {" · "}{formatDifficulty(detail.session.difficulty)}
              </p>
            </div>

            {/* Score card */}
            <div className="bg-noey-surface rounded-3xl p-5 mb-4">
              <div className="flex items-center gap-5">
                <ScoreDonut
                  percentage={detail.session.percentage}
                  color={getScoreColor(detail.session.percentage)}
                />
                <div className="flex flex-col gap-2 flex-1">
                  <MetaRow label="Score" value={`${detail.session.percentage.toFixed(0)}%`} highlight />
                  <MetaRow label="Correct Answers" value={`${detail.session.score} / ${detail.session.total}`} />
                  <MetaRow label="Time Taken" value={formatDuration(detail.session.time_taken_seconds)} />
                  <MetaRow label="Date" value={formatDate(detail.session.started_at)} />
                </div>
              </div>
            </div>

            {/* Exam meta */}
            <div className="bg-noey-surface rounded-3xl p-5 mb-4">
              <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-3">Exam Details</p>
              <div className="flex flex-col divide-y divide-noey-surface-dark">
                <MetaRow label="Subject" value={detail.session.subject} />
                <MetaRow label="Standard" value={formatStandard(detail.session.standard)} />
                {detail.session.term && <MetaRow label="Term" value={formatTerm(detail.session.term)} />}
                <MetaRow label="Difficulty" value={formatDifficulty(detail.session.difficulty)} />
                <MetaRow label="Questions" value={String(detail.session.total)} />
                <MetaRow label="Time Allowed" value={`${detail.session.total * (detail.session.difficulty === "easy" ? 5 : detail.session.difficulty === "medium" ? 4 : 3)} mins`} />
                <MetaRow label="Time Used" value={formatDuration(detail.session.time_taken_seconds)} />
              </div>
            </div>

            {/* Topic breakdown */}
            {detail.topic_breakdown?.length > 0 && (
              <div className="bg-noey-surface rounded-3xl p-5 mb-4">
                <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-4">Topic Breakdown</p>
                <div className="flex flex-col gap-4">
                  {detail.topic_breakdown.map((t) => (
                    <div key={t.topic}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-semibold text-sm text-noey-text flex-1 pr-3">{t.topic}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-noey-text-muted">{t.correct}/{t.total}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                            style={{
                              color: getScoreColor(t.percentage),
                              backgroundColor: getScoreColor(t.percentage) + "20",
                            }}>
                            {getScoreLabel(t.percentage)}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2.5 bg-noey-surface-dark rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                          style={{ width: `${t.percentage}%`, backgroundColor: getScoreColor(t.percentage) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per-question breakdown */}
            {detail.answers?.length > 0 && (
              <div className="bg-noey-surface rounded-3xl p-5 mb-4">
                <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-4">
                  Question by Question ({detail.answers.filter(a => a.is_correct).length} correct)
                </p>
                <div className="flex flex-col gap-2">
                  {detail.answers.map((a, i) => (
                    <div key={a.question_id}
                      className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 ${a.is_correct ? "bg-green-50" : a.selected_answer ? "bg-red-50" : "bg-noey-surface-dark"}`}>
                      <span className={`font-black text-sm w-5 flex-shrink-0 mt-0.5 ${a.is_correct ? "text-green-600" : a.selected_answer ? "text-red-500" : "text-noey-text-muted"}`}>
                        {a.is_correct ? "✓" : a.selected_answer ? "✗" : "—"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-noey-text-muted mb-0.5">Q{i + 1} · {a.topic}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-medium text-noey-text">
                            Answered: <strong>{a.selected_answer || "Skipped"}</strong>
                          </span>
                          {!a.is_correct && a.correct_answer && (
                            <span className="text-xs font-medium text-green-600">
                              Correct: <strong>{a.correct_answer}</strong>
                            </span>
                          )}
                          {a.time_taken_seconds > 0 && (
                            <span className="text-xs text-noey-text-muted">
                              {a.time_taken_seconds}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Coaching Note */}
            <div className="bg-noey-card-dark rounded-3xl p-5 mb-6">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">✨ AI Coaching Note</p>
              {insight ? (
                <p className="text-white text-sm font-medium leading-relaxed">{insight.insight_text}</p>
              ) : (
                <p className="text-white/40 text-sm italic">No coaching note available for this session.</p>
              )}
            </div>

            {/* Back button */}
            <button
              onClick={handleBack}
              className="w-full bg-noey-primary text-white font-bold h-14 rounded-2xl"
            >
              ← Back to {childName}'s Analytics
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreDonut({ percentage, color }: { percentage: number; color: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#D4D5DC" strokeWidth="10" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-lg text-noey-text">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function MetaRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-noey-text-muted font-medium text-sm">{label}</span>
      <span className={`font-bold text-sm ${highlight ? "text-noey-gem text-base" : "text-noey-text"}`}>
        {value}
      </span>
    </div>
  );
}

export default function ExamDetailPage() {
  return <Suspense><Content /></Suspense>;
}