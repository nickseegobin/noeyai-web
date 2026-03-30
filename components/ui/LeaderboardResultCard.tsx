"use client";
// components/ui/LeaderboardResultCard.tsx — v2
// Shows rank movement (previous → new) instead of personal best banner
// Uses subject field directly — never parses board_key

import { useRouter } from "next/navigation";
import type { LeaderboardUpdate } from "@/lib/leaderboard";
import { SUBJECT_SLUG_TO_DISPLAY, getSubjectColor } from "@/lib/leaderboard";

interface Props {
  update: LeaderboardUpdate;
  standard: string;
  term: string;
}

export default function LeaderboardResultCard({ update, standard, term }: Props) {
  const router = useRouter();
  const {
    new_rank,
    previous_rank,
    points_earned,
    total_points_today,
    board_key,
  } = update;

  // v2 doc: never parse board_key — use dedicated fields from the leaderboard response
  // board_key format is std_4_term_1_math (no difficulty) but social_studies breaks splitting
  // Instead derive subject from the board_key safely by checking known slugs
  const SUBJECT_SLUGS = ["social_studies", "math", "english", "science"];
  const subject = SUBJECT_SLUGS.find(s => board_key.endsWith(`_${s}`)) ?? "math";

  const subjectDisplay = SUBJECT_SLUG_TO_DISPLAY[subject] ?? subject;
  const subjectColor = getSubjectColor(subject);
  const isFirst = new_rank === 1;
  const isTop3 = new_rank <= 3;
  const climbedRanks = previous_rank - new_rank;
  const movedUp = climbedRanks > 0;
  const medals = ["", "🥇", "🥈", "🥉"];

  // Build the subject board URL — v2: no difficulty segment
  const termSlug = standard === "std_5" ? "none" : (term || "none");

  function handleViewBoard() {
    router.push(`/child/leaderboard/${subject}`);
  }

  return (
    <div className={`rounded-3xl p-5 mb-4 ${isFirst ? "bg-gradient-to-br from-amber-400 to-yellow-500" : "bg-noey-card-dark"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wide ${isFirst ? "text-amber-900" : "text-white/60"}`}>
          🏆 Leaderboard
        </p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{ backgroundColor: subjectColor + "30", color: isFirst ? "#78350F" : subjectColor }}>
          {subjectDisplay}
        </span>
      </div>

      {/* Rank display */}
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
          ${isFirst ? "bg-amber-900/20" : "bg-white/10"}`}>
          {isTop3 ? (
            <span className="text-3xl">{medals[new_rank]}</span>
          ) : (
            <span className={`font-black text-2xl ${isFirst ? "text-amber-900" : "text-white"}`}>
              #{new_rank}
            </span>
          )}
        </div>
        <div className="flex-1">
          {isFirst && (
            <p className="font-black text-base text-amber-900 mb-0.5">You're #1 today! 🎉</p>
          )}
          {!isFirst && isTop3 && (
            <p className="font-black text-base text-white mb-0.5">Top 3 today!</p>
          )}
          {!isTop3 && (
            <p className="font-black text-base text-white mb-0.5">Ranked #{new_rank} today</p>
          )}
          <p className={`text-sm font-medium ${isFirst ? "text-amber-900/70" : "text-white/60"}`}>
            {total_points_today} pts total today · +{points_earned} this exam
          </p>
        </div>
      </div>

      {/* Rank movement banner — replaces personal best */}
      {movedUp && climbedRanks > 0 && (
        <div className={`rounded-2xl px-4 py-2.5 mb-3 flex items-center gap-2
          ${isFirst ? "bg-amber-900/20" : "bg-noey-primary/30"}`}>
          <span className="text-lg">⬆️</span>
          <div>
            <p className={`font-bold text-sm ${isFirst ? "text-amber-900" : "text-white"}`}>
              {climbedRanks === 1
                ? `Moved up 1 spot!`
                : `Jumped ${climbedRanks} spots!`}
            </p>
            <p className={`text-xs ${isFirst ? "text-amber-900/70" : "text-white/60"}`}>
              #{previous_rank} → #{new_rank}
            </p>
          </div>
        </div>
      )}

      {/* Dropped or same rank */}
      {!movedUp && previous_rank > 0 && previous_rank !== new_rank && (
        <div className="rounded-2xl px-4 py-2.5 mb-3 flex items-center gap-2 bg-white/10">
          <span className="text-lg">💪</span>
          <p className="text-white text-sm font-medium">
            Keep going — you can climb back up!
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleViewBoard}
        className={`w-full py-3 rounded-2xl font-bold text-sm transition-opacity active:opacity-80
          ${isFirst ? "bg-amber-900/20 text-amber-900" : "bg-white/10 text-white"}`}
      >
        View Full Board →
      </button>
    </div>
  );
}