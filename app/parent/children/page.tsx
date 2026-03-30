"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import AvatarCircle from "@/components/ui/AvatarCircle";
import Spinner from "@/components/ui/Spinner";
import BackButton from "@/components/ui/BackButton";
import type { ChildProfile } from "@/types/noey";

export default function ChildrenSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [canAddMore, setCanAddMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const PARENT_AVATAR_KEY = "noey_parent_avatar_index";
  const parentAvatarIndex = typeof window !== "undefined"
    ? Number(localStorage.getItem(PARENT_AVATAR_KEY) ?? 1)
    : 1;

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadChildren();
  }, [authLoading, user]);

  async function loadChildren() {
    setLoading(true);
    try {
      const { data } = await api.get("/children");
      setChildren(data.data.children ?? []);
      setCanAddMore(data.data.can_add_more ?? true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleRemove(child: ChildProfile) {
    if (!confirm(`Remove ${child.display_name}? This cannot be undone.`)) return;
    setRemovingId(child.child_id);
    try {
      await api.delete(`/children/${child.child_id}`);
      await loadChildren();
    } catch (err) {
      alert(getApiError(err).message);
    } finally { setRemovingId(null); }
  }

  if (authLoading || !user) return null;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar
        zone="parent"
        showGems
        showAvatar
        gemCount={user.token_balance ?? 0}
        avatarIndex={parentAvatarIndex}
        avatarName={user.display_name}
      />

      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-6">Children Settings</h1>

        {loading ? (
          <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {children.map((child) => {
              const nickname = (child as any)?.nickname ?? "";
              return (
                <div key={child.child_id} className="flex flex-col items-center gap-2">
                  <AvatarCircle
                    avatarIndex={child.avatar_index}
                    displayName={child.display_name}
                    size={100}
                    showRing
                    role="child"
                  />
                  <div className="text-center">
                    <p className="font-bold text-base text-noey-text">{child.display_name}</p>
                    {/* Leaderboard nickname shown beneath child's name */}
                    {nickname ? (
                      <p className="text-noey-text-muted text-xs font-medium mt-0.5">
                        🏆 {nickname}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => router.push(`/parent/children/${child.child_id}`)}
                      className="text-noey-primary text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <span className="text-noey-text-muted text-xs">|</span>
                    <button
                      onClick={() => handleRemove(child)}
                      disabled={removingId === child.child_id}
                      className="text-noey-gem text-sm font-semibold disabled:opacity-40"
                    >
                      {removingId === child.child_id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add slot */}
            {canAddMore && children.length < 3 && (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => router.push("/parent/children/add")}
                  className="w-[100px] h-[100px] rounded-full bg-noey-surface-dark flex items-center justify-center active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-noey-text flex items-center justify-center">
                    <span className="text-white text-2xl font-light leading-none">+</span>
                  </div>
                </button>
                <div className="text-center">
                  <p className="font-bold text-base text-noey-text">Empty</p>
                  <p className="text-noey-text-muted text-sm font-medium">Add</p>
                </div>
              </div>
            )}
          </div>
        )}

        <BackButton href="/parent/home" />
      </div>
    </div>
  );
}