"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, Button } from "@heroui/react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import GemBadge from "@/components/ui/GemBadge";
import Spinner from "@/components/ui/Spinner";
import { useMyBoards } from "@/hooks/useLeaderboard";

export default function ChildHomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);

  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);

  // Leaderboard summary for badge
  const { data: myBoards } = useMyBoards(!!activeChild);
  const leaderboardCount = myBoards?.boards?.length ?? 0;

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!authLoading && user && !user.active_child_id) { router.replace("/profile-select"); return; }
    if (user?.active_child_id) {
      api.get("/tokens/balance")
        .then(({ data }) => setBalance(data.data.balance))
        .catch(() => setBalance(user.token_balance ?? 0));
    }
  }, [authLoading, user?.active_child_id]);

  if (authLoading || !activeChild) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={balance ?? user?.token_balance ?? 0}
        avatarIndex={activeChild.avatar_index}
        avatarName={activeChild.display_name}
      />

      <div className="flex-1 px-5 pb-8 flex flex-col gap-4">
        {/* Welcome */}
        <h1 className="font-black text-2xl text-noey-text">
          Welcome, {activeChild.display_name}! 👋
        </h1>

        {/* Gem balance */}
        <Card className="bg-noey-surface shadow-none">
          <CardBody className="flex flex-row items-center gap-3 p-5">
            <GemBadge count={balance ?? user?.token_balance ?? 0} />
            <p className="text-noey-text-muted text-sm font-medium">
              {balance === null ? "Loading..." : "Ready to start practising?"}
            </p>
          </CardBody>
        </Card>

        {/* Start Practising */}
        <Button
          onPress={() => router.push("/child/subjects")}
          className="w-full bg-noey-primary text-white font-bold text-base h-14 rounded-2xl"
        >
          Start Practising
        </Button>

        {/* Leaderboards */}
        <button
          onClick={() => router.push("/child/leaderboard")}
          className="w-full bg-noey-surface rounded-3xl p-4 flex items-center gap-3 hover:bg-noey-surface-dark transition-colors"
        >
          <span className="text-2xl">🏆</span>
          <span className="font-bold text-base text-noey-text flex-1 text-left">Leaderboards</span>
          {leaderboardCount > 0 && (
            <span className="text-xs font-black text-white bg-noey-gem px-2 py-0.5 rounded-full">
              {leaderboardCount} board{leaderboardCount > 1 ? "s" : ""}
            </span>
          )}
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* My Progress */}
        <button
          onClick={() => router.push("/child/progress")}
          className="w-full bg-noey-surface rounded-3xl p-4 flex items-center gap-3 hover:bg-noey-surface-dark transition-colors"
        >
          <span className="text-2xl">📈</span>
          <span className="font-bold text-base text-noey-text flex-1 text-left">My Progress</span>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* News */}
        <button
          onClick={() => router.push("/news")}
          className="w-full bg-noey-surface rounded-3xl p-4 flex items-center gap-3 hover:bg-noey-surface-dark transition-colors"
        >
          <span className="text-2xl">📰</span>
          <span className="font-bold text-base text-noey-text flex-1 text-left">NoeyAI News</span>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}