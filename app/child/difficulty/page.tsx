"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody } from "@heroui/react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import { GemIcon } from "@/components/ui/GemBadge";
import BackButton from "@/components/ui/BackButton";
import { DIFFICULTY_CONFIG } from "@/types/noey";
import { formatStandard, formatTerm } from "@/lib/utils";

function Content() {
  const { user } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const subject = sp.get("subject") ?? "Mathematics";
  const standard = sp.get("standard") ?? "std_4";
  const term = sp.get("term") ?? "term_1";

  // FIX: fetch balance from API — do not rely on context which may be stale
  const [balance, setBalance] = useState<number | null>(null);
  const activeChild = user?.children?.find((c) => c.child_id === user?.active_child_id);

  useEffect(() => {
    api.get("/tokens/balance")
      .then(({ data }) => setBalance(data.data.balance))
      .catch(() => setBalance(0));
  }, []);

  function pick(difficulty: string) {
    router.push(
      `/child/prestart?subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}&difficulty=${difficulty}`
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="child"
        showGems
        showAvatar
        gemCount={balance ?? 0}
        avatarIndex={activeChild?.avatar_index ?? 1}
        avatarName={activeChild?.display_name ?? ""}
      />

      <div className="flex-1 flex flex-col px-5 pb-8">
        <div className="mb-6">
          <span className="font-black text-xl text-noey-text">{subject} </span>
          <span className="text-noey-text-muted font-medium text-sm">
            {formatStandard(standard)}{term ? ` | ${formatTerm(term)}` : ""}
          </span>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {(["easy", "medium", "hard"] as const).map((diff) => {
            const c = DIFFICULTY_CONFIG[diff];
            // While balance is loading, show all as enabled
            const canAfford = balance === null ? true : balance >= c.gemCost;

            return (
              <Card
                key={diff}
                isPressable={canAfford}
                onPress={() => canAfford && pick(diff)}
                className={`bg-noey-surface shadow-none ${!canAfford ? "opacity-50" : ""}`}
              >
                <CardBody className="p-5 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    <GemIcon size={20} />
                    <span className="font-black text-base text-noey-text">{c.gemCost}</span>
                  </div>
                  <h3 className="font-black text-2xl text-noey-text mb-1">{c.label}</h3>
                  <p className="font-semibold text-sm text-noey-text mb-1">
                    {c.questions} Questions | {c.minutesPerQuestion} minutes Each
                  </p>
                  <p className="text-noey-text-muted text-sm font-medium">{c.description}</p>
                  {!canAfford && balance !== null && (
                    <p className="text-noey-gem text-xs font-bold mt-2">Not enough gems</p>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>

        <BackButton />
      </div>
    </div>
  );
}

export default function DifficultyPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}
