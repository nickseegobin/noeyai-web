"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import AvatarCircle from "@/components/ui/AvatarCircle";
import Spinner from "@/components/ui/Spinner";
import type { ChildProfile, SessionResult, WeeklyDigest } from "@/types/noey";
import {
  formatDate, formatDifficulty, formatStandard, formatTerm,
  getScoreColor, getCurrentIsoWeek,
} from "@/lib/utils";

function scoredSessions(sessions: SessionResult[]) {
  return sessions.filter((s) => s.total > 0 && s.percentage !== undefined && s.percentage !== null);
}

function Content() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const childIdParam = sp.get("child_id");

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selected, setSelected] = useState<ChildProfile | null>(null);
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [weekly, setWeekly] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadChildren();
  }, [authLoading, user]);

  async function loadChildren() {
    try {
      const { data } = await api.get("/children");
      const kids: ChildProfile[] = data.data.children ?? [];
      setChildren(kids);
      const target = childIdParam
        ? kids.find((c) => c.child_id === Number(childIdParam))
        : kids[0];
      if (target) await loadChildData(target);
      else setLoading(false);
    } catch { setLoading(false); }
  }

  async function loadChildData(child: ChildProfile) {
    setSelected(child);
    setLoading(true);
    setSessions([]);
    setWeekly(null);
    const [histRes, weeklyRes] = await Promise.allSettled([
      api.get("/results", { params: { child_id: child.child_id, per_page: 50 } }),
      api.get(`/insights/weekly/${getCurrentIsoWeek()}`, { params: { child_id: child.child_id } }),
    ]);
    if (histRes.status === "fulfilled") setSessions(histRes.value.data.data.sessions ?? []);
    if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value.data.data);
    setLoading(false);
  }

  function openDetail(session: SessionResult) {
    if (!selected) return;
    const params = new URLSearchParams({
      session_id: String(session.session_id),
      child_id: String(selected.child_id),
      child_name: selected.display_name,
    });
    router.push(`/parent/exam-detail?${params.toString()}`);
  }

  const done = scoredSessions(sessions);
  const totalExams = done.length;
  const avgScore = totalExams > 0
    ? Math.round(done.reduce((sum, s) => sum + s.percentage, 0) / totalExams)
    : 0;
  const subjectMap: Record<string, number[]> = {};
  done.forEach((s) => {
    if (!subjectMap[s.subject]) subjectMap[s.subject] = [];
    subjectMap[s.subject].push(s.percentage);
  });
  const bestSubject = Object.entries(subjectMap)
    .map(([sub, scores]) => ({ sub, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .sort((a, b) => b.avg - a.avg)[0]?.sub ?? null;

  if (authLoading) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="parent"
        showGems
        showAvatar
        gemCount={user?.token_balance ?? 0}
        // avatar_index from context — no localStorage needed
        avatarIndex={user?.avatar_index ?? 1}
        avatarName={user?.display_name ?? ""}
      />

      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-4">Child Analytics</h1>

        {children.length > 1 && (
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
            {children.map((c) => (
              <button key={c.child_id} onClick={() => loadChildData(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm flex-shrink-0 transition-colors
                  ${selected?.child_id === c.child_id ? "bg-noey-primary text-white" : "bg-noey-surface text-noey-text"}`}>
                <AvatarCircle avatarIndex={c.avatar_index} displayName={c.display_name} size={24} showRing={false} />
                {c.display_name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div>
        ) : !selected ? (
          <p className="text-noey-text-muted text-sm text-center py-8">No children linked yet.</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <AvatarCircle avatarIndex={selected.avatar_index} displayName={selected.display_name} size={52} showRing />
              <div>
                <p className="font-black text-lg text-noey-text">{selected.display_name}</p>
                <p className="text-noey-text-muted text-sm">
                  {formatStandard(selected.standard)}{selected.term ? ` · ${formatTerm(selected.term)}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-noey-surface rounded-3xl p-4">
                <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Total Exams</p>
                <p className="font-black text-2xl text-noey-text">{totalExams}</p>
              </div>
              <div className="bg-noey-surface rounded-3xl p-4">
                <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Avg Score</p>
                <p className="font-black text-2xl text-noey-text">{avgScore}%</p>
              </div>
              {bestSubject && (
                <div className="bg-noey-surface rounded-3xl p-4 col-span-2">
                  <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Best Subject</p>
                  <p className="font-black text-base text-noey-text">{bestSubject}</p>
                </div>
              )}
            </div>

            <div className="bg-noey-card-dark rounded-3xl p-5 mb-5">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">📋 This Week's Report</p>
              {weekly
                ? <p className="text-white text-sm font-medium leading-relaxed">{weekly.insight_text}</p>
                : <p className="text-white/50 text-sm">No weekly report yet for {selected.display_name}.</p>}
            </div>

            <h2 className="font-black text-lg text-noey-text mb-1">Exam History</h2>
            <p className="text-noey-text-muted text-xs font-medium mb-3">
              Tap any completed exam to view full results and AI coaching note
            </p>

            {sessions.length === 0 ? (
              <p className="text-noey-text-muted text-sm text-center py-6">No exams taken yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sessions.map((s) => {
                  const hasScore = s.total > 0 && s.percentage !== undefined;
                  return (
                    <button key={s.session_id}
                      onClick={() => hasScore && openDetail(s)}
                      disabled={!hasScore}
                      className={`bg-noey-surface rounded-3xl p-4 flex items-center justify-between w-full text-left transition-colors
                        ${hasScore ? "hover:bg-noey-surface-dark" : "opacity-40 cursor-default"}`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-noey-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">{s.subject}</span>
                          <span className="text-noey-text-muted text-xs">{formatDifficulty(s.difficulty)}</span>
                          {!hasScore && <span className="text-noey-text-muted text-xs italic">cancelled</span>}
                        </div>
                        <p className="text-noey-text-muted text-xs">{formatDate(s.started_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasScore ? (
                          <div className="text-right">
                            <p className="font-black text-xl" style={{ color: getScoreColor(s.percentage) }}>
                              {s.percentage.toFixed(0)}%
                            </p>
                            <p className="text-noey-text-muted text-xs">{s.score}/{s.total}</p>
                          </div>
                        ) : (
                          <p className="text-noey-text-muted text-sm">—</p>
                        )}
                        {hasScore && (
                          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                            <path d="M1 1l6 6-6 6" stroke="#9B9BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
        <BackButton href="/parent/home" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return <Suspense><Content /></Suspense>;
}