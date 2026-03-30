"use client";
// /child/leaderboard — v2
// 4 subject cards — one board per subject, scoped to child's class

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import { useMyBoards } from "@/hooks/useLeaderboard";
import {
  LEADERBOARD_SUBJECTS,
  getSubjectColor,
  type SubjectSlug,
} from "@/lib/leaderboard";
import { formatStandard, formatTerm } from "@/lib/utils";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  // Guard before any hooks that depend on activeChild
  if (!activeChild) return null;

  const { data: myBoards } = useMyBoards(true);

  // Build board_key the v2 way — no difficulty segment
  function buildKey(subject: string): string {
    const std = activeChild.standard;
    const term = activeChild.term ?? "";
    const termPart = std === "std_5" ? "" : `_${term}`;
    return `${std}${termPart}_${subject}`;
  }

  function getRankForSubject(subject: string): number | null {
    const key = buildKey(subject);
    return myBoards?.boards?.find(b => b.board_key === key)?.rank ?? null;
  }

  function getPointsForSubject(subject: string): number | null {
    const key = buildKey(subject);
    return myBoards?.boards?.find(b => b.board_key === key)?.best_points ?? null;
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={user?.token_balance ?? 0}
        avatarIndex={activeChild.avatar_index}
        avatarName={activeChild.display_name}
      />

      <div className="flex-1 px-5 pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-black text-2xl text-noey-text">Leaderboards</h1>
          <p className="text-noey-text-muted text-sm font-medium mt-1">
            {formatStandard(activeChild.standard)}
            {activeChild.term ? ` · ${formatTerm(activeChild.term)}` : ""}
            {" · Resets daily at midnight"}
          </p>
        </div>

        {/* Today's summary strip */}
        {myBoards?.boards && myBoards.boards.length > 0 && (
          <div className="bg-noey-card-dark rounded-3xl p-4 mb-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
              🏆 Your Rankings Today
            </p>
            <div className="flex flex-wrap gap-2">
              {myBoards.boards.map(b => (
                <button
                  key={b.board_key}
                  onClick={() => router.push(`/child/leaderboard/${b.subject}`)}
                  className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl active:opacity-70"
                >
                  <span className="text-white font-bold text-xs">#{b.rank}</span>
                  <span className="text-white/60 text-xs capitalize">
                    {b.subject === "social_studies" ? "Social Studies"
                      : b.subject === "math" ? "Mathematics"
                      : b.subject === "english" ? "Language Arts"
                      : "Science"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4 subject cards */}
        <div className="grid grid-cols-2 gap-3">
          {LEADERBOARD_SUBJECTS.map(subject => {
            const rank = getRankForSubject(subject.slug);
            const points = getPointsForSubject(subject.slug);
            const hasRank = rank !== null;
            const color = getSubjectColor(subject.slug);

            return (
              <button
                key={subject.slug}
                onClick={() => router.push(`/child/leaderboard/${subject.slug}`)}
                className="relative bg-noey-surface rounded-3xl p-4 flex flex-col gap-3 hover:bg-noey-surface-dark transition-colors active:scale-[0.97] text-left"
              >
                {/* Rank badge — top right when user is on board */}
                {hasRank && (
                  <div className="absolute top-3 right-3 bg-noey-gem text-white text-xs font-black px-2 py-0.5 rounded-full">
                    #{rank}
                  </div>
                )}

                {/* Subject icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: color + "20" }}>
                  <span className="text-2xl">{subject.emoji}</span>
                </div>

                {/* Subject label */}
                <div>
                  <p className="font-black text-sm text-noey-text leading-tight">{subject.label}</p>
                  {hasRank && points !== null ? (
                    <p className="text-noey-text-muted text-xs font-medium mt-0.5">
                      {points} pts today
                    </p>
                  ) : (
                    <p className="text-noey-text-muted text-xs font-medium mt-0.5">
                      Tap to view board
                    </p>
                  )}
                </div>

                {/* Bottom colour strip */}
                <div className="h-1 rounded-full w-full mt-auto"
                  style={{ backgroundColor: hasRank ? color : color + "40" }} />
              </button>
            );
          })}
        </div>

        <BackButton href="/child/home" />
      </div>
    </div>
  );
}