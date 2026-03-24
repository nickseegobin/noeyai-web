"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import AvatarCircle from "@/components/ui/AvatarCircle";
import Spinner from "@/components/ui/Spinner";
import type { ChildProfile, ResultStats, SessionResult, WeeklyDigest } from "@/types/noey";
import { formatDate, formatDifficulty, formatStandard, formatTerm, getScoreColor, getCurrentIsoWeek } from "@/lib/utils";

function Content() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const childIdParam = sp.get("child_id");

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selected, setSelected] = useState<ChildProfile | null>(null);
  const [stats, setStats] = useState<ResultStats | null>(null);
  const [sessions, setSessions] = useState<SessionResult[]>([]);
  const [weekly, setWeekly] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadChildren();
  }, [authLoading, user]);

  async function loadChildren() {
    const { data } = await api.get("/children");
    const kids: ChildProfile[] = data.data.children ?? [];
    setChildren(kids);
    const target = childIdParam ? kids.find(c => c.child_id === Number(childIdParam)) : kids[0];
    if (target) { setSelected(target); await loadChildData(target.child_id); }
    setLoading(false);
  }

  async function loadChildData(childId: number) {
    setLoading(true);
    try {
      const [statsRes, histRes, weeklyRes] = await Promise.allSettled([
        api.get("/results/stats", { params: { child_id: childId } }),
        api.get("/results", { params: { child_id: childId, per_page: 20 } }),
        api.get(`/insights/weekly/${getCurrentIsoWeek()}`),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
      if (histRes.status === "fulfilled") setSessions(histRes.value.data.data.sessions ?? []);
      if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value.data.data);
      else setWeekly(null);
    } finally { setLoading(false); }
  }

  async function switchChild(child: ChildProfile) {
    setSelected(child); setSessions([]); setStats(null); setWeekly(null);
    await loadChildData(child.child_id);
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="parent" showGems showAvatar gemCount={user?.token_balance ?? 0} avatarIndex={1} avatarName={user?.display_name ?? ""} />
      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-4">Child Analytics</h1>

        {/* Child switcher */}
        {children.length > 1 && (
          <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
            {children.map(c => (
              <button key={c.child_id} onClick={() => switchChild(c)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm flex-shrink-0 transition-colors ${selected?.child_id === c.child_id ? "bg-noey-primary text-white" : "bg-noey-surface text-noey-text"}`}>
                <AvatarCircle avatarIndex={c.avatar_index} displayName={c.display_name} size={24} showRing={false} />
                {c.display_name}
              </button>
            ))}
          </div>
        )}

        {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : !selected ? (
          <p className="text-noey-text-muted text-sm text-center py-8">No children linked yet.</p>
        ) : (
          <>
            {/* Child header */}
            <div className="flex items-center gap-3 mb-5">
              <AvatarCircle avatarIndex={selected.avatar_index} displayName={selected.display_name} size={52} showRing />
              <div><p className="font-black text-lg text-noey-text">{selected.display_name}</p><p className="text-noey-text-muted text-sm">{formatStandard(selected.standard)}{selected.term ? ` · ${formatTerm(selected.term)}` : ""}</p></div>
            </div>

            {/* Stats */}
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
                : <p className="text-white/50 text-sm">No weekly report yet for {selected.display_name}.</p>}
            </div>

            {/* Exam history */}
            <h2 className="font-black text-lg text-noey-text mb-3">Exam History</h2>
            {sessions.length === 0 ? <p className="text-noey-text-muted text-sm text-center py-6">No exams taken yet.</p> : (
              <div className="flex flex-col gap-3">
                {sessions.map(s => (
                  <div key={s.session_id} className="noey-card flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><span className="bg-noey-primary text-white text-xs font-bold px-2 py-0.5 rounded-lg">{s.subject}</span><span className="text-noey-text-muted text-xs">{formatDifficulty(s.difficulty)}</span></div>
                      <p className="text-noey-text-muted text-xs">{formatDate(s.started_at)}</p>
                    </div>
                    <div className="text-right"><p className="font-black text-xl" style={{ color: getScoreColor(s.percentage) }}>{s.percentage.toFixed(0)}%</p><p className="text-noey-text-muted text-xs">{s.score}/{s.total}</p></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <BackButton href="/parent/home" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() { return <Suspense><Content /></Suspense>; }
