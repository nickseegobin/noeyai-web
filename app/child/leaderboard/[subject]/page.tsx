"use client";
// /child/leaderboard/[subject] — v2
// Single board per subject — no difficulty tab/toggle
// Folder: app/child/leaderboard/[subject]/page.tsx

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import Spinner from "@/components/ui/Spinner";
import { useBoard } from "@/hooks/useLeaderboard";
import {
  SUBJECT_SLUG_TO_DISPLAY,
  getMedalColor,
  getMedalEmoji,
  getSubjectColor,
  type SubjectSlug,
} from "@/lib/leaderboard";
import { formatStandard, formatTerm } from "@/lib/utils";

export default function BoardDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subject = params.subject as SubjectSlug;

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  // Calculate block flag before any hooks — don't call useBoard for blocked subjects
  const STD5_ALLOWED = ['math', 'english'];
  const isBlocked = !!activeChild &&
  activeChild.standard === 'std_5' &&
  !STD5_ALLOWED.includes(subject);

  // useBoard must always be called (rules of hooks) — pass empty string when blocked
  const { data, loading, error } = useBoard(
  activeChild?.standard ?? '',
  activeChild?.term ?? null,
  isBlocked ? null : subject,  // ← null instead of ''
  );

  if (!activeChild) return null;


  if (isBlocked) {
  router.replace('/child/leaderboard');
  return null;
  }
  
  

  

  const subjectDisplay = SUBJECT_SLUG_TO_DISPLAY[subject] ?? subject;
  const subjectColor = getSubjectColor(subject);

  // Find if user's row is outside top 10
  const userEntry = data?.entries.find(e => e.is_current_user);
  const userOutsideTop10 = data?.my_position && data.my_position > 10 && !userEntry;

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
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: subjectColor + "20" }}>
              <span className="text-base">
                {subject === "math" ? "🔢" : subject === "english" ? "📖" : subject === "science" ? "🔬" : "🌍"}
              </span>
            </div>
            <span className="font-black text-xl text-noey-text">{subjectDisplay}</span>
          </div>
          <p className="text-noey-text-muted text-sm font-medium">
            {formatStandard(activeChild.standard)}
            {activeChild.term ? ` · ${formatTerm(activeChild.term)}` : ""}
            {data ? ` · ${data.total_participants} participant${data.total_participants !== 1 ? "s" : ""}` : ""}
          </p>
          {data?.date && (
            <p className="text-noey-text-muted text-xs mt-0.5">
              {new Date(data.date).toLocaleDateString("en-TT", {
                weekday: "long", day: "numeric", month: "long"
              })}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-center">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        ) : !data || data.entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-4xl">🏁</p>
            <p className="font-black text-lg text-noey-text text-center">No one on the board yet</p>
            <p className="text-noey-text-muted text-sm text-center">
              Be the first to claim the top spot!
            </p>
            <button
              onClick={() => router.push("/child/subjects")}
              className="bg-noey-primary text-white font-bold px-6 py-3 rounded-2xl text-sm"
            >
              Start an Exam
            </button>
          </div>
        ) : (
          <>
            {/* Top 10 */}
            <div className="flex flex-col gap-2 mb-3">
              {data.entries.map((entry, idx) => {
                const isMe = entry.is_current_user;
                const isTop3 = entry.rank <= 3;
                const medalColor = getMedalColor(entry.rank);

                return (
                  <div
                    key={`${entry.nickname}-${idx}`}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors
                      ${isMe
                        ? "bg-noey-primary/10 border-2 border-noey-primary"
                        : "bg-noey-surface"
                      }`}
                  >
                    {/* Rank / medal */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isTop3 ? medalColor + "25" : "transparent" }}>
                      {isTop3 ? (
                        <span className="text-xl">{getMedalEmoji(entry.rank)}</span>
                      ) : (
                        <span className="font-black text-sm text-noey-text-muted">#{entry.rank}</span>
                      )}
                    </div>

                    {/* Nickname */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${isMe ? "text-noey-primary" : "text-noey-text"}`}>
                        {entry.nickname}
                        {isMe && (
                          <span className="ml-2 text-xs font-black text-noey-primary">YOU</span>
                        )}
                      </p>
                      <p className="text-noey-text-muted text-xs">
                        Last exam: {entry.last_score_pct}%
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-base ${isMe ? "text-noey-primary" : "text-noey-text"}`}>
                        {entry.total_points}
                      </p>
                      <p className="text-noey-text-muted text-xs">pts today</p>
                    </div>
                  </div>
                );
              })}

              {/* User outside top 10 */}
              {userOutsideTop10 && data.my_position && (
                <>
                  <div className="flex items-center gap-2 py-1 px-2">
                    <div className="flex-1 h-px bg-noey-surface-dark" />
                    <span className="text-noey-text-muted text-xs font-medium">Your Position</span>
                    <div className="flex-1 h-px bg-noey-surface-dark" />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-noey-primary/10 border-2 border-noey-primary">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                      <span className="font-black text-sm text-noey-primary">#{data.my_position}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-noey-primary">
                        {activeChild.display_name}
                        <span className="ml-2 text-xs font-black">YOU</span>
                      </p>
                      <p className="text-noey-text-muted text-xs">Keep going to climb higher!</p>
                    </div>
                  </div>
                </>
              )}

              {/* Not on board yet */}
              {!userEntry && !userOutsideTop10 && (
                <div className="bg-noey-surface rounded-2xl px-4 py-3 text-center">
                  <p className="text-noey-text-muted text-sm font-medium">
                    Complete a {subjectDisplay} exam to appear on this board!
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Back */}
        <button
          onClick={() => router.push("/child/leaderboard")}
          className="flex items-center gap-2 mt-4 text-noey-text-muted font-semibold text-sm"
        >
          <div className="w-9 h-9 rounded-full bg-noey-text flex items-center justify-center">
            <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
              <path d="M6 1L1 6l5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          Back to Leaderboards
        </button>
      </div>
    </div>
  );
}