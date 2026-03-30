"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import GemBadge from "@/components/ui/GemBadge";
import AvatarCircle from "@/components/ui/AvatarCircle";
import Spinner from "@/components/ui/Spinner";
import type { ChildProfile, SessionResult } from "@/types/noey";

interface ChildSummary {
  child: ChildProfile;
  totalExams: number;
  avgScore: number;
}

function scoredSessions(sessions: SessionResult[]) {
  return sessions.filter((s) => s.total > 0 && s.percentage !== undefined && s.percentage !== null);
}

export default function ParentHomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [balance, setBalance] = useState(0);
  const [summaries, setSummaries] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [balRes, childRes] = await Promise.all([
        api.get("/tokens/balance"),
        api.get("/children"),
      ]);
      setBalance(balRes.data.data.balance);
      const kids: ChildProfile[] = childRes.data.data.children ?? [];
      setChildren(kids);

      if (kids.length) {
        const results = await Promise.allSettled(
          kids.map((c) => api.get("/results", { params: { child_id: c.child_id, per_page: 50 } }))
        );
        const built: ChildSummary[] = kids.map((child, i) => {
          const res = results[i];
          if (res.status !== "fulfilled") return { child, totalExams: 0, avgScore: 0 };
          const sessions: SessionResult[] = res.value.data.data.sessions ?? [];
          const done = scoredSessions(sessions);
          const totalExams = done.length;
          const avgScore = totalExams > 0
            ? Math.round(done.reduce((sum, s) => sum + s.percentage, 0) / totalExams)
            : 0;
          return { child, totalExams, avgScore };
        });
        setSummaries(built);
      }
    } finally { setLoading(false); }
  }

  if (authLoading) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="parent"
        showGems
        showAvatar
        gemCount={balance}
        // avatar_index now comes directly from /auth/me — no localStorage needed
        avatarIndex={user?.avatar_index ?? 1}
        avatarName={user?.display_name ?? ""}
      />

      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-5">Home</h1>

        {loading ? (
          <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div>
        ) : (
          <>
            <Card className="bg-noey-surface shadow-none mb-5">
              <CardBody className="p-5">
                <p className="font-bold text-base text-noey-text mb-3">{user?.display_name}</p>
                <div className="flex items-center gap-3">
                  <GemBadge count={balance} />
                  <p className="text-noey-text-muted text-sm">gems available</p>
                </div>
                <p className="text-noey-text-muted text-xs mt-2 font-medium">
                  3 free gems reset on the 1st of every month
                </p>
              </CardBody>
            </Card>

            {children.length === 0 ? (
              <Card className="bg-noey-surface shadow-none">
                <CardBody className="p-6 text-center">
                  <p className="text-noey-text font-bold mb-3">No children linked yet</p>
                  <button onClick={() => router.push("/parent/children/add")}
                    className="bg-noey-primary text-white font-bold px-6 py-3 rounded-2xl text-sm">
                    Add Child
                  </button>
                </CardBody>
              </Card>
            ) : (
              <div className="flex flex-col gap-3 mb-5">
                {summaries.map(({ child, totalExams, avgScore }) => (
                  <button key={child.child_id}
                    onClick={() => router.push(`/parent/analytics?child_id=${child.child_id}`)}
                    className="bg-noey-surface rounded-3xl p-4 flex items-center gap-4 text-left hover:bg-noey-surface-dark transition-colors w-full">
                    <AvatarCircle avatarIndex={child.avatar_index} displayName={child.display_name} size={52} showRing role="child" />
                    <div className="flex-1">
                      <p className="font-bold text-base text-noey-text">{child.display_name}</p>
                      <p className="text-noey-text-muted text-sm">
                        {totalExams > 0
                          ? `${totalExams} exam${totalExams > 1 ? "s" : ""} · ${avgScore}% avg`
                          : "No exams yet"}
                      </p>
                    </div>
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                      <path d="M1 1l6 6-6 6" stroke="#9B9BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Children Settings", "/parent/children"],
                ["Add Tokens", "/parent/tokens"],
                ["Analytics", "/parent/analytics"],
                ["News & Views", "/news"],
              ].map(([label, href]) => (
                <button key={href} onClick={() => router.push(href)}
                  className="bg-noey-surface rounded-2xl py-4 text-center font-bold text-sm text-noey-text hover:bg-noey-surface-dark transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}