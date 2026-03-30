// lib/leaderboard.ts — v2

export const SUBJECT_SLUG_TO_DISPLAY: Record<string, string> = {
  math:           "Mathematics",
  english:        "Language Arts",
  science:        "Science",
  social_studies: "Social Studies",
};

export const SUBJECT_DISPLAY_TO_SLUG: Record<string, string> = {
  Mathematics:     "math",
  "Language Arts": "english",
  Science:         "science",
  "Social Studies": "social_studies",
};

export const LEADERBOARD_SUBJECTS = [
  { slug: "math",           label: "Mathematics",    emoji: "🔢", color: "#3B82F6" },
  { slug: "english",        label: "Language Arts",  emoji: "📖", color: "#8B5CF6" },
  { slug: "science",        label: "Science",        emoji: "🔬", color: "#10B981" },
  { slug: "social_studies", label: "Social Studies", emoji: "🌍", color: "#F59E0B" },
] as const;

export type SubjectSlug = "math" | "english" | "science" | "social_studies";

// v2 entry shape — difficulty removed, total_points replaces best_points
export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  total_points: number;   // sum of all points earned today on this subject
  last_score_pct: number; // % from most recent exam
  is_current_user: boolean;
}

// v2 board shape — no difficulty field
export interface LeaderboardBoard {
  board_key: string;
  standard: string;
  term: string;
  subject: SubjectSlug;
  date: string;
  total_participants: number;
  my_position: number | null;
  entries: LeaderboardEntry[];
}

// My boards summary — unchanged from v1
export interface MyBoardEntry {
  board_key: string;
  subject: SubjectSlug;
  difficulty?: string;    // may still be present in /me response — optional
  best_score_pct: number;
  best_points: number;
  rank: number;
}

export interface MyBoardsSummary {
  user_id: string;
  standard: string;
  term: string;
  date: string;
  boards: MyBoardEntry[];
}

// v2 leaderboard_update on submit — was_personal_best removed, previous_rank + total_points_today added
export interface LeaderboardUpdate {
  points_earned: number;        // points from THIS exam only
  total_points_today: number;   // running total for today on this subject
  board_key: string;
  new_rank: number;
  previous_rank: number;        // replaces was_personal_best — show rank movement instead
}

// Rank medal colour
export function getMedalColor(rank: number): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "transparent";
}

export function getMedalEmoji(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export function getSubjectColor(slug: string): string {
  return LEADERBOARD_SUBJECTS.find(s => s.slug === slug)?.color ?? "#9B9BA8";
}