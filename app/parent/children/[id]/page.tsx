"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/ui/NavBar";
import BackButton from "@/components/ui/BackButton";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Spinner from "@/components/ui/Spinner";
import type { ChildProfile } from "@/types/noey";
import { STANDARDS, TERMS } from "@/types/noey";

export default function ChildEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const childId = Number(params.id);

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [standard, setStandard] = useState("std_4");
  const [term, setTerm] = useState("term_1");
  const [avatarIndex, setAvatarIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
  async function load() {
    try {
      // Switch to this child first so the endpoint accepts the request
      await api.post(`/children/${childId}/switch`).catch(() => {});
      const { data } = await api.get(`/children/${childId}`);
      const c: ChildProfile = data.data;
      setChild(c);
      setDisplayName(c.display_name);
      setStandard(c.standard);
      setTerm(c.term ?? 'term_1');
      setAvatarIndex(c.avatar_index);
    } catch {
      router.replace('/parent/children');
    } finally {
      setLoading(false);
    }
  }
  load();
}, [childId]);

  function markDirty() { setDirty(true); setError(""); }

  async function handleSave() {
  setSaving(true); setError('');
  try {
    await api.patch(`/children/${childId}`, {
      display_name: displayName,
      standard,
      term: standard === 'std_5' ? '' : term,
      avatar_index: avatarIndex,
    });
    // Restore parent context — deselect child after editing
    await api.post('/children/deselect').catch(() => {});
    router.push('/parent/children');
  } catch (err) {
    setError(getApiError(err).message);
  } finally {
    setSaving(false);
  }
}

  if (loading) return <div className="flex items-center justify-center min-h-dvh"><Spinner color="#111114" size={28} /></div>;

  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar zone="parent" showGems={false} showAvatar={false} />
      <div className="flex-1 px-5 pb-8">
        <h1 className="font-black text-2xl text-noey-text mb-6">Child Settings</h1>
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <AvatarPicker value={avatarIndex} onChange={v => { setAvatarIndex(v); markDirty(); }} />
        </div>
        <p className="font-bold text-lg text-noey-text mb-5">{child?.display_name}</p>
        <div className="flex flex-col gap-3">
          <input type="text" placeholder="Display Name" value={displayName} onChange={e => { setDisplayName(e.target.value); markDirty(); }} className="noey-input" />
          <select value={standard} onChange={e => { setStandard(e.target.value); if (e.target.value === "std_5") setTerm(""); markDirty(); }} className="noey-input appearance-none">
            {STANDARDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {standard !== "std_5" && (
            <select value={term} onChange={e => { setTerm(e.target.value); markDirty(); }} className="noey-input appearance-none">
              {TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          )}
          {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3"><p className="text-red-600 text-sm font-medium text-center">{error}</p></div>}
        </div>
      </div>
      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-noey-bg px-5 py-4 flex items-center gap-3 border-t border-noey-surface">
        <BackButton href="/parent/children" label="Back" />
        <button onClick={handleSave} disabled={!dirty || saving} className="ml-auto bg-noey-primary text-white font-bold px-8 py-3.5 rounded-2xl flex items-center gap-2 disabled:opacity-50">
          {saving ? <Spinner /> : "Save"}
        </button>
      </div>
    </div>
  );
}
