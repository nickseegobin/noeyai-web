"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import GemBadge from "@/components/ui/GemBadge";
import Spinner from "@/components/ui/Spinner";
import type { ResultStats, SessionResult } from "@/types/noey";
import { formatStandard, formatTerm, formatDifficulty } from "@/lib/utils";

export default function ChildHomePage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState<ResultStats | null>(null);
  const [lastSession, setLastSession] = useState<SessionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const activeChild = user?.children?.find((c) => c.child_id === user.active_child_id);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!authLoading && user && !user.active_child_id) { router.replace("/profile-select"); return; }
    if (user?.active_child_id) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
   
      const [balRes, statsRes, histRes] = await Promise.allSettled([
        api.get("/tokens/balance"),
        api.get("/results/stats"),
        api.get("/results", { params: { per_page: 1 } }),
      ]);
      if (balRes.status === "fulfilled") setBalance(balRes.value.data.data.balance);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
      if (histRes.status === "fulfilled") setLastSession(histRes.value.data.data.sessions?.[0] ?? null);
      

    } catch { /* interceptor handles 401 */ } finally {
      setLoading(false);
    }
  }

  const childName = activeChild?.display_name ?? user?.display_name ?? "there";
  const hasExams = (stats?.total_exams ?? 0) > 0;

  if (authLoading) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={balance}
        avatarIndex={activeChild?.avatar_index ?? 1}
        avatarName={childName}
      />

      <div className="flex-1 px-5 pb-8">
        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <Spinner color="#111114" size={32} />
          </div>
        ) : !hasExams ? (
          /* Empty state */
          <div className="flex flex-col gap-5 pt-4">
            <h2 className="font-black text-2xl text-noey-text">Welcome, {childName}! 👋</h2>
            <Card className="bg-noey-surface shadow-none">
              <CardBody className="flex flex-row items-center gap-4 p-5">
                <GemBadge count={balance} />
                <p className="text-noey-text font-semibold text-sm flex-1">
                  Ready to start practising?
                </p>
              </CardBody>
            </Card>
            <Button
              onPress={() => router.push("/child/subjects")}
              className="w-full bg-noey-primary text-white font-bold text-base h-14 rounded-2xl mt-2"
            >
              Start Practising
            </Button>
          </div>
        ) : (
          /* Returning state */
          <div className="flex flex-col gap-4 pt-2">
            <h2 className="font-black text-2xl text-noey-text">Welcome back, {childName}!</h2>

            {lastSession && (
              <Card className="bg-noey-surface shadow-none">
                <CardBody className="p-5">
                  <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-3">
                    Last Exam
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-base text-noey-text">{lastSession.subject}</p>
                      <p className="text-noey-text-muted text-sm font-medium">
                        {formatStandard(lastSession.standard)} ·{" "}
                        {formatTerm(lastSession.term)} ·{" "}
                        {formatDifficulty(lastSession.difficulty)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-2xl text-noey-text">
                        {lastSession.percentage.toFixed(0)}%
                      </p>
                      <p className="text-noey-text-muted text-xs">
                        {lastSession.score}/{lastSession.total}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-noey-surface shadow-none">
                <CardBody className="p-4">
                  <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Total Exams</p>
                  <p className="font-black text-2xl text-noey-text">{stats?.total_exams}</p>
                </CardBody>
              </Card>
              <Card className="bg-noey-surface shadow-none">
                <CardBody className="p-4">
                  <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Avg Score</p>
                  <p className="font-black text-2xl text-noey-text">
                    {stats?.average_score?.toFixed(0) ?? 0}%
                  </p>
                </CardBody>
              </Card>
              {stats?.best_subject && (
                <Card className="bg-noey-surface shadow-none">
                  <CardBody className="p-4">
                    <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Best Subject</p>
                    <p className="font-black text-base text-noey-text">{stats.best_subject}</p>
                  </CardBody>
                </Card>
              )}
              {stats?.weakest_topic && (
                <Card className="bg-noey-surface shadow-none">
                  <CardBody className="p-4">
                    <p className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Needs Work</p>
                    <p className="font-black text-base text-noey-text">{stats.weakest_topic}</p>
                  </CardBody>
                </Card>
              )}
            </div>

            <Card className="bg-noey-surface shadow-none">
              <CardBody className="flex flex-row items-center gap-3 p-5">
                <GemBadge count={balance} />
                <p className="text-noey-text-muted text-sm font-medium">gems available</p>
              </CardBody>
            </Card>

            <Button
              onPress={() => router.push("/child/subjects")}
              className="w-full bg-noey-primary text-white font-bold text-base h-14 rounded-2xl"
            >
              Start Practising
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
