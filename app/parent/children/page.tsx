"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import AvatarCircle from "@/components/ui/AvatarCircle";
import Spinner from "@/components/ui/Spinner";
import type { ChildProfile } from "@/types/noey";

export default function ChildrenSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [canAddMore, setCanAddMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<ChildProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (user) loadChildren();
  }, [authLoading, user]);

  async function loadChildren() {
    setLoading(true);
    try { const { data } = await api.get("/children"); setChildren(data.data.children ?? []); setCanAddMore(data.data.can_add_more ?? true); }
    finally { setLoading(false); }
  }

  async function handleDelete(child: ChildProfile) {
    setDeleting(true);
    try {
      await api.delete(`/children/${child.child_id}`, { data: { confirm: true } });
      setConfirmDelete(null);
      await loadChildren();
    } catch (err) { alert(getApiError(err).message); }
    finally { setDeleting(false); }
  }

  if (authLoading) return null;

  return (
    <>
      <div className="flex flex-col min-h-dvh">
        <NavBar zone="parent" showGems={false} showAvatar={false} />
        <div className="flex-1 px-5 pb-8">
          <h1 className="font-black text-2xl text-noey-text mb-6">Children Settings</h1>
          {loading ? <div className="flex justify-center pt-10"><Spinner color="#111114" size={28} /></div> : (
            <div className="grid grid-cols-2 gap-6">
              {children.map(child => (
                <div key={child.child_id} className="flex flex-col items-center gap-2">
                  <AvatarCircle avatarIndex={child.avatar_index} displayName={child.display_name} size={112} showRing />
                  <p className="font-bold text-base text-noey-text">{child.display_name}</p>
                  <div className="flex items-center gap-3 text-sm font-bold text-noey-text-muted">
                    <button onClick={() => router.push(`/parent/children/${child.child_id}`)} className="hover:text-noey-text transition-colors">Edit</button>
                    <span>|</span>
                    <button onClick={() => setConfirmDelete(child)} className="hover:text-noey-gem transition-colors">Remove</button>
                  </div>
                </div>
              ))}
              {canAddMore && children.length < 3 && (
                <button onClick={() => router.push("/register/child?from=settings")} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
                  <div className="w-28 h-28 rounded-full bg-noey-surface-dark flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-noey-text flex items-center justify-center">
                      <span className="text-white text-2xl font-light leading-none">+</span>
                    </div>
                  </div>
                  <p className="font-bold text-base text-noey-text">Empty</p>
                  <p className="text-noey-text-muted text-sm font-medium">Add</p>
                </button>
              )}
            </div>
          )}
          <BackButton href="/parent/home" />
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => !deleting && setConfirmDelete(null)} />
          <div className="relative bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h2 className="font-black text-xl text-noey-text text-center mb-3">Remove {confirmDelete.display_name}?</h2>
            <p className="text-noey-text-muted text-sm text-center mb-6 leading-relaxed">This will permanently delete their account and all exam data. <strong>This cannot be undone.</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="flex-1 bg-noey-surface text-noey-text font-bold py-3.5 rounded-2xl">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleting} className="flex-1 bg-noey-gem text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">
                {deleting ? <Spinner /> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
