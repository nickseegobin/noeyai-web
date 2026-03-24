"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import Spinner from "@/components/ui/Spinner";
import type { ResultStats, SessionResult, ResultDetail, WeeklyDigest } from "@/types/noey";
import { formatStandard, formatTerm, formatDifficulty, formatDate, getScoreColor, getScoreLabel, getCurrentIsoWeek } from "@/lib/utils";

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ResultStats | null>(null);
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [weekly, setWeekly] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<ResultDetail | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!authLoading && user && !user.active_child_id) { router.replace("/profile-select"); return; }
    if (user?.active_child_id) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, histRes, weeklyRes] = await Promise.allSettled([
        api.get("/results/stats"),
        api.get("/results", { params: { per_page: 50 } }),
        api.get(`/insights/weekly/${getCurrentIsoWeek()}`),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
      if (histRes.status === "fulfilled") setSessions(histRes.value.data.data.sessions ?? []);
      if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value.data.data);
    } finally { setLoading(false); }
  }

  async function openReview(sessionId: number) {
    setReviewLoading(true);
    try { const { data } = await api.get(`/results/${sessionId}`); setReview(data.data); }
    catch { /* ignore */ }
    finally { setReviewLoading(false); }
  }

  if (authLoading) return null;

  if (review) {
    return (
      <div className="flex flex-col min-h-dvh">
        <NavBar zone="child" showGems showAvatar gemCount={user?.token_balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />
        <div className="flex-1 px-5 pb-8">
          <h2 className="font-black text-xl text-noey-text mb-1">{review.session.subject}</h2>
          <p className="text-noey-text-muted text-sm mb-5">{formatStandard(review.session.standard)} · {formatTerm(review.session.term)} · {review.session.percentage.toFixed(0)}%</p>
          <div className="flex flex-col gap-4">
            {review.answers.map((a, i) => (
              <div key={a.question_id} className={`noey-card border-2 ${a.is_correct ? "border-green-300" : "border-red-300"}`}>
                <p className="text-xs text-noey-text-muted font-semibold mb-1">Q{i + 1} · {a.topic}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-noey-text">Your answer: <strong>{a.selected_answer || "—"}</strong></span>
                  {!a.is_correct && <span className="text-sm font-semibold text-green-600">Correct: <strong>{a.correct_answer}</strong></span>}
                  <span className={`text-xs font-bold ${a.is_correct ? "text-green-600" : "text-noey-gem"}`}>{a.is_correct ? "✓" : "✗"}</span>
                </div>
              </div>
            ))}
          </div>
          <BackButton label="Back to Progress" href="#" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="child" showGems showAvatar gemCount={user?.token_balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />
      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-5">My Progress</h1>
        {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : (
          <>
            {/* Stats bar */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="noey-card"><p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Total Exams</p><p className="font-black text-2xl text-noey-text">{stats?.total_exams ?? 0}</p></div>
              <div className="noey-card"><p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Avg Score</p><p className="font-black text-2xl text-noey-text">{stats?.average_score?.toFixed(0) ?? 0}%</p></div>
              {stats?.best_subject && <div className="noey-card"><p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Best Subject</p><p className="font-black text-base text-noey-text">{stats.best_subject}</p></div>}
              {stats?.weakest_topic && <div className="noey-card"><p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Needs Work</p><p className="font-black text-base text-noey-text">{stats.weakest_topic}</p></div>}
            </div>

            {/* Weekly insight */}
            <div className="bg-noey-card-dark rounded-3xl p-5 mb-5">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">📋 This Week's Report</p>
              {weekly ? <p className="text-white text-sm font-medium leading-relaxed">{weekly.insight_text}</p>
                : <p className="text-white/50 text-sm">Complete some exams this week to get your weekly report.</p>}
            </div>

            {/* Past exams */}
            <h2 className="font-black text-lg text-noey-text mb-3">Past Exams</h2>
            {sessions.length === 0 ? (
              <p className="text-noey-text-muted text-sm font-medium text-center py-8">You haven't taken any exams yet. Start practising!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map(s => (
                  <button key={s.session_id} onClick={() => openReview(s.session_id)} disabled={reviewLoading}
                    className="noey-card flex items-center justify-between text-left hover:bg-noey-surface-dark transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-noey-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">{s.subject}</span>
                        <span className="text-noey-text-muted text-xs">{formatDifficulty(s.difficulty)}</span>
                      </div>
                      <p className="text-noey-text-muted text-xs font-medium">{formatDate(s.started_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl" style={{ color: getScoreColor(s.percentage) }}>{s.percentage.toFixed(0)}%</p>
                      <p className="text-noey-text-muted text-xs">{s.score}/{s.total}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <BackButton href="/child/home" />
      </div>
    </div>
  );
}
