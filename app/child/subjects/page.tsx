"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import { SUBJECTS, STANDARDS, TERMS } from "@/types/noey";
import { formatStandard, formatTerm } from "@/lib/utils";

const EMOJIS: Record<string, string> = { "Mathematics": "🔢", "Language Arts": "📖", "Social Studies": "🌍", "Science": "🔬" };

export default function SubjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const activeChild = user?.children?.find(c => c.child_id === user.active_child_id);
  const [standard, setStandard] = useState(activeChild?.standard ?? "std_4");
  const [term, setTerm] = useState(activeChild?.term ?? "term_1");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && !user.active_child_id) router.replace("/profile-select");
  }, [authLoading, user]);

  function pick(subject: string) {
    router.push(`/child/difficulty?subject=${encodeURIComponent(subject)}&standard=${standard}&term=${term}`);
  }

  if (authLoading || !user) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="child" showGems showAvatar gemCount={user.token_balance ?? 0} avatarIndex={activeChild?.avatar_index ?? 1} avatarName={activeChild?.display_name ?? ""} />
      <div className="flex-1 flex flex-col px-5 pb-28">
        <div className="grid grid-cols-2 gap-4 flex-1 content-center py-4">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => pick(s)}
              className="bg-noey-surface rounded-3xl flex flex-col items-center justify-center gap-3 aspect-square active:scale-95 transition-transform hover:bg-noey-surface-dark shadow-sm">
              <span className="text-4xl">{EMOJIS[s]}</span>
              <span className="font-bold text-base text-noey-text text-center px-2 leading-tight">{s}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Filter bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-noey-surface-dark px-5 py-4">
        <p className="text-center text-sm text-white font-medium mb-2">Current Only Showing <strong>{formatStandard(standard)} {term ? formatTerm(term) : ""}</strong></p>
        <button onClick={() => setFilterOpen(true)} className="mx-auto block bg-noey-primary text-white font-bold text-sm px-6 py-2.5 rounded-xl">Adjust Filters</button>
      </div>
      {/* Filter modal */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-[430px] p-6 pb-10">
            <h3 className="font-black text-lg text-noey-text mb-5">Adjust Filters</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-2 block">Standard</label>
                <select value={standard} onChange={e => { setStandard(e.target.value); if (e.target.value === "std_5") setTerm(""); }} className="noey-input appearance-none">
                  {STANDARDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {standard !== "std_5" && (
                <div>
                  <label className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-2 block">Term</label>
                  <select value={term} onChange={e => setTerm(e.target.value)} className="noey-input appearance-none">
                    {TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            <button onClick={() => setFilterOpen(false)} className="noey-btn-primary mt-6">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}
