"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import GemBadge from "@/components/ui/GemBadge";
import AvatarCircle from "@/components/ui/AvatarCircle";
import Spinner from "@/components/ui/Spinner";
import type { ChildProfile, SessionResult, ResultStats } from "@/types/noey";

export default function ParentHomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [balance, setBalance] = useState(0);
  const [childStats, setChildStats] = useState<Record<number, ResultStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [balRes, childRes] = await Promise.all([api.get("/tokens/balance"), api.get("/children")]);
      setBalance(balRes.data.data.balance);
      const kids: ChildProfile[] = childRes.data.data.children ?? [];
      setChildren(kids);
      if (kids.length) {
        const statsResults = await Promise.allSettled(kids.map(c => api.get("/results/stats", { params: { child_id: c.child_id } })));
        const map: Record<number, ResultStats> = {};
        statsResults.forEach((r, i) => { if (r.status === "fulfilled") map[kids[i].child_id] = r.value.data.data; });
        setChildStats(map);
      }
    } finally { setLoading(false); }
  }

  if (authLoading) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="parent" showGems showAvatar gemCount={balance} avatarIndex={1} avatarName={user?.display_name ?? ""} />
      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-5">Home</h1>
        {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : (
          <>
            {/* Account summary */}
            <div className="noey-card mb-5">
              <p className="font-bold text-base text-noey-text mb-3">{user?.display_name}</p>
              <div className="flex items-center gap-3"><GemBadge count={balance} /><p className="text-noey-text-muted text-sm">gems available</p></div>
              <p className="text-noey-text-muted text-xs mt-2 font-medium">3 free gems reset on the 1st of every month</p>
            </div>

            {/* Children overview */}
            {children.length === 0 ? (
              <div className="noey-card text-center py-8">
                <p className="text-noey-text font-bold mb-3">No children linked yet</p>
                <button onClick={() => router.push("/register/child?from=settings")} className="bg-noey-primary text-white font-bold px-6 py-3 rounded-2xl text-sm">Add Child</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-5">
                {children.map(child => {
                  const stats = childStats[child.child_id];
                  return (
                    <button key={child.child_id} onClick={() => router.push(`/parent/analytics?child_id=${child.child_id}`)}
                      className="noey-card flex items-center gap-4 text-left hover:bg-noey-surface-dark transition-colors">
                      <AvatarCircle avatarIndex={child.avatar_index} displayName={child.display_name} size={52} showRing />
                      <div className="flex-1">
                        <p className="font-bold text-base text-noey-text">{child.display_name}</p>
                        {stats ? <p className="text-noey-text-muted text-sm">{stats.total_exams} exams · {stats.average_score?.toFixed(0) ?? 0}% avg</p>
                          : <p className="text-noey-text-muted text-sm">No exams yet</p>}
                      </div>
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#9B9BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {[["Children Settings", "/parent/children"], ["Add Tokens", "/parent/tokens"], ["Analytics", "/parent/analytics"], ["News & Views", "/news"]].map(([label, href]) => (
                <button key={href} onClick={() => router.push(href)} className="noey-card text-center font-bold text-sm text-noey-text hover:bg-noey-surface-dark transition-colors">{label}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
