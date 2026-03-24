"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import Spinner from "@/components/ui/Spinner";
import type { SubmitResult, InsightResult, TopicBreakdown } from "@/types/noey";
import { formatStandard, formatTerm, formatDuration, getScoreLabel, getScoreColor } from "@/lib/utils";

function Content() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const sessionId = Number(sp.get("session_id"));
  const subject = sp.get("subject") ?? "Mathematics";
  const standard = sp.get("standard") ?? "std_4";
  const term = sp.get("term") ?? "term_1";
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [insight, setInsight] = useState<InsightResult | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  useEffect(() => {
    const raw = sessionStorage.getItem("noey_exam_result");
    if (raw) { setResult(JSON.parse(raw)); sessionStorage.removeItem("noey_exam_result"); }
    if (sessionId) api.post(`/insights/exam/${sessionId}`).then(({ data }) => setInsight(data.data)).catch(() => {}).finally(() => setInsightLoading(false));
    refreshUser();
  }, []);

  if (!result) return <div className="flex items-center justify-center min-h-dvh"><Spinner color="#111114" size={32} /></div>;
  const scoreColor = getScoreColor(result.percentage);

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="child" showGems showAvatar gemCount={user?.token_balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />
      <div className="flex-1 flex flex-col px-5 pb-8">
        <div className="mb-6"><span className="font-black text-xl text-noey-text">{subject} Results </span><span className="text-noey-text-muted font-medium text-sm">{formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ""}</span></div>
        {/* Score row */}
        <div className="flex items-center gap-5 mb-6">
          <Donut percentage={result.percentage} color={scoreColor} />
          <div className="flex flex-col gap-1.5 flex-1">
            {[["Correct Answers", `${result.score}/${result.total}`], ["Time Used", formatDuration(result.time_taken_seconds)], ["Score", `${result.percentage.toFixed(0)}%`]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between"><span className="text-noey-text-muted text-xs font-medium">{l}</span><span className="font-bold text-sm text-noey-text">{v}</span></div>
            ))}
          </div>
        </div>
        {/* Topic breakdown */}
        <h2 className="font-black text-xl text-noey-text mb-4">Topic Breakdown</h2>
        <div className="flex flex-col gap-4 mb-6">
          {result.topic_breakdown.map(t => <TopicBar key={t.topic} topic={t} />)}
        </div>
        {/* AI Insight */}
        <div className="bg-noey-card-dark rounded-3xl p-5 mb-6">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">✨ AI Coaching Note</p>
          {insightLoading ? <div className="flex items-center gap-2"><Spinner size={16} /><span className="text-white/60 text-sm">Generating insight...</span></div>
            : insight ? <p className="text-white text-sm font-medium leading-relaxed">{insight.insight_text}</p>
            : null}
        </div>
        <button onClick={() => router.push("/child/home")} className="noey-btn-primary">Done</button>
      </div>
    </div>
  );
}

function Donut({ percentage, color }: { percentage: number; color: string }) {
  const r = 44; const circ = 2 * Math.PI * r; const dash = (percentage / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: 112, height: 112 }}>
      <svg width={112} height={112} viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#E2E3E9" strokeWidth="12" />
        <circle cx="56" cy="56" r={r} fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className="font-black text-xl text-noey-text">{percentage.toFixed(0)}%</span></div>
    </div>
  );
}

function TopicBar({ topic }: { topic: TopicBreakdown }) {
  const color = getScoreColor(topic.percentage);
  return (
    <div>
      <p className="font-semibold text-sm text-noey-text mb-1.5">{topic.topic}</p>
      <div className="relative h-8 bg-noey-surface rounded-2xl overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-2xl transition-all duration-500" style={{ width: `${topic.percentage}%`, backgroundColor: color, opacity: 0.85 }} />
        <div className="absolute inset-0 flex items-center justify-end px-3"><span className="text-xs font-bold text-noey-text">{topic.correct}/{topic.total} &nbsp; {getScoreLabel(topic.percentage)}</span></div>
      </div>
    </div>
  );
}

export default function ResultsPage() { return <Suspense><Content /></Suspense>; }
