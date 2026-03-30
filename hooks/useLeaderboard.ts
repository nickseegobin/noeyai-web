// hooks/useLeaderboard.ts — v2
// useBoard no longer takes a difficulty param — endpoint is now 3 segments

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import type { MyBoardsSummary, LeaderboardBoard, SubjectSlug } from "@/lib/leaderboard";

// Personal summary — all boards the student ranks on today (unchanged from v1)
export function useMyBoards(enabled = true) {
  const [data, setData] = useState<MyBoardsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetch() {
    try {
      const res = await api.get("/leaderboard/me");
      setData(res.data.data);
      setError(null);
    } catch {
      setError("Could not load leaderboard summary.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    fetch();
    intervalRef.current = setInterval(fetch, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled]);

  return { data, loading, error, refetch: fetch };
}

// Full board — v2: difficulty param removed, endpoint is /leaderboard/:std/:term/:subject
export function useBoard(
  standard: string | null,
  term: string | null,
  subject: SubjectSlug | null,
) {
  const [data, setData] = useState<LeaderboardBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const termSlug = standard === "std_5" ? "none" : (term || "none");
  const enabled = !!(standard && subject);

  async function fetch() {
    if (!enabled) return;
    try {
      const res = await api.get(`/leaderboard/${standard}/${termSlug}/${subject}`);
      setData(res.data.data);
      setError(null);
    } catch {
      setError("Could not load leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setData(null);
    fetch();
    intervalRef.current = setInterval(fetch, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [standard, term, subject]);

  return { data, loading, error, refetch: fetch };
}