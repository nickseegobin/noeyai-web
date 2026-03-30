"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import BackButton from "@/components/ui/BackButton";
import { STANDARDS, TERMS } from "@/types/noey";

export default function ChildContentSettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const activeChild = user?.children?.find((c) => c.child_id === user?.active_child_id);

  const [standard, setStandard] = useState(activeChild?.standard ?? "std_4");
  const [term, setTerm] = useState(activeChild?.term ?? "term_1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
    if (!authLoading && user && !user.active_child_id) router.replace("/profile-select");
  }, [authLoading, user]);

  useEffect(() => {
    if (activeChild) {
      setStandard(activeChild.standard);
      setTerm(activeChild.term ?? "term_1");
    }
  }, [activeChild?.child_id]);

  async function handleSave() {
    if (!activeChild) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/children/${activeChild.child_id}`, {
        standard,
        term: standard === "std_5" ? "" : term,
      });
      await refreshUser();
      setDirty(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !activeChild) return null;

  return (
    <div className="page-container">
      <h1 className="font-black text-2xl text-noey-text mb-2">Content Settings</h1>
      <p className="text-noey-text-muted text-sm font-medium mb-8">
        These settings control which exams are shown for {activeChild.display_name}.
      </p>

      <div className="flex flex-col gap-4">
        {/* Standard */}
        <div>
          <label className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-3 block">
            Standard
          </label>
          <div className="flex flex-col gap-2">
            {STANDARDS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setStandard(s.value); if (s.value === "std_5") setTerm(""); setDirty(true); }}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl font-semibold text-base transition-colors
                  ${standard === s.value
                    ? "bg-noey-primary text-white"
                    : "bg-noey-surface text-noey-text hover:bg-noey-surface-dark"}`}
              >
                {s.label}
                {standard === s.value && <span className="text-lg">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Term — hidden for std_5 */}
        {standard !== "std_5" && (
          <div>
            <label className="text-noey-text-muted text-xs font-semibold uppercase tracking-wide mb-3 block">
              Term
            </label>
            <div className="flex gap-3">
              {TERMS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setTerm(t.value); setDirty(true); }}
                  className={`flex-1 py-4 rounded-2xl font-bold text-sm transition-colors
                    ${term === t.value
                      ? "bg-noey-primary text-white"
                      : "bg-noey-surface text-noey-text hover:bg-noey-surface-dark"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-red-600 text-sm font-medium text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <p className="text-green-600 text-sm font-medium text-center">✓ Settings saved!</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-8">
        <Button
          onPress={handleSave}
          isLoading={saving}
          isDisabled={!dirty || saving}
          className="w-full bg-noey-primary text-white font-bold h-14 rounded-2xl disabled:opacity-40"
        >
          Save Changes
        </Button>
      </div>

      <BackButton href="/child/home" />
    </div>
  );
}