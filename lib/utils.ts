export function getCurrentIsoWeek(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function formatStandard(std: string): string {
  const map: Record<string, string> = { std_1: "Standard 1", std_2: "Standard 2", std_3: "Standard 3", std_4: "Standard 4", std_5: "Standard 5" };
  return map[std] ?? std;
}

export function formatTerm(term: string): string {
  const map: Record<string, string> = { term_1: "Term 1", term_2: "Term 2", term_3: "Term 3", "": "" };
  return map[term] ?? term;
}

export function formatDifficulty(d: string): string {
  return d.charAt(0).toUpperCase() + d.slice(1);
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getScoreLabel(percentage: number): string {
  if (percentage >= 80) return "Strong";
  if (percentage >= 60) return "Good";
  return "Needs Work";
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "#22C55E";
  if (percentage >= 60) return "#F59E0B";
  return "#E8396A";
}

// Avatar helpers — subfolders: children / parents
export function getChildAvatarSrc(avatarIndex: number): string {
  const idx = Math.max(1, Math.min(10, avatarIndex ?? 1));
  return `/avatars/children/avatar-${idx}.png`;
}

export function getParentAvatarSrc(avatarIndex: number): string {
  const idx = Math.max(1, Math.min(10, avatarIndex ?? 1));
  return `/avatars/parents/avatar-${idx}.png`;
}

// Generic — used when role is unknown (falls back to children folder)
export function getAvatarSrc(avatarIndex: number, role: "child" | "parent" = "child"): string {
  return role === "parent" ? getParentAvatarSrc(avatarIndex) : getChildAvatarSrc(avatarIndex);
}

export const AVATAR_COLORS = ["#E85030", "#E8396A", "#9B59B6", "#3498DB", "#2ECC71", "#F39C12", "#1ABC9C", "#E74C3C", "#8E44AD", "#2980B9"];

export function getAvatarColor(avatarIndex: number): string {
  const idx = Math.max(1, Math.min(10, avatarIndex ?? 1));
  return AVATAR_COLORS[(idx - 1) % AVATAR_COLORS.length];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-TT", { day: "numeric", month: "short", year: "numeric" });
}