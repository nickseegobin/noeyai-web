"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Spinner from "@/components/ui/Spinner";
import { STANDARDS, TERMS } from "@/types/noey";

interface F { displayName: string; username: string; password: string; confirmPassword: string; age: string; standard: string; term: string; avatarIndex: number; }
interface E { displayName?: string; username?: string; password?: string; confirmPassword?: string; age?: string; server?: string; }
function FE({ msg }: { msg: string }) { return <p className="text-red-500 text-xs font-medium mt-1 ml-2">{msg}</p>; }

function ChildSignUpForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const fromSettings = sp.get("from") === "settings";
  const [f, setF] = useState<F>({ displayName: "", username: "", password: "", confirmPassword: "", age: "", standard: "std_4", term: "term_1", avatarIndex: 2 });
  const [e, setE] = useState<E>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function set(k: keyof F, v: string | number) {
    setF(p => ({ ...p, [k]: v }));
    setE(p => ({ ...p, [k]: undefined, server: undefined }));
  }

  function validate() {
    const err: E = {};
    if (!f.displayName.trim()) err.displayName = "First name is required.";
    if (!f.username.trim() || f.username.length < 3) err.username = "Username must be at least 3 characters.";
    if (!f.password || f.password.length < 8) err.password = "Password must be at least 8 characters.";
    if (f.confirmPassword !== f.password) err.confirmPassword = "Passwords do not match.";
    if (f.age && (isNaN(Number(f.age)) || Number(f.age) < 5 || Number(f.age) > 16)) err.age = "Enter a valid age (5–16).";
    setE(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/children", {
        display_name: f.displayName,
        username: f.username,
        password: f.password,
        standard: f.standard,
        term: f.standard === "std_5" ? "" : f.term,
        age: f.age ? Number(f.age) : undefined,
        avatar_index: f.avatarIndex,
      });
      router.push(fromSettings ? "/parent/children" : "/profile-select");
    } catch (err) {
      const { code, message } = getApiError(err);
      if (code === "noey_username_taken") setE({ username: "Username already taken." });
      else if (code === "noey_max_children") setE({ server: "Maximum of 3 children reached." });
      else setE({ server: message });
    } finally { setLoading(false); }
  }

  const valid = f.displayName.trim() && f.username.trim().length >= 3 && f.password.length >= 8 && f.confirmPassword === f.password;

  return (
    <div className="page-container">
      <h1 className="font-black text-3xl text-noey-text text-center mb-7">{fromSettings ? "Add Child" : "Child Sign Up"}</h1>
      <div className="flex justify-center mb-7"><AvatarPicker value={f.avatarIndex} onChange={v => set("avatarIndex", v)} /></div>
      <div className="flex flex-col gap-3">
        <div>
          <input type="text" placeholder="First Name" value={f.displayName} onChange={e => set("displayName", e.target.value)} disabled={loading} className={`noey-input ${e.displayName ? "border-red-400" : ""}`} />
          {e.displayName && <FE msg={e.displayName} />}
        </div>
        <div>
          <input type="text" placeholder="Username" value={f.username} onChange={e => set("username", e.target.value.toLowerCase())} disabled={loading} className={`noey-input ${e.username ? "border-red-400" : ""}`} autoCapitalize="none" />
          {e.username && <FE msg={e.username} />}
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <input type="number" placeholder="Age" value={f.age} onChange={e => set("age", e.target.value)} disabled={loading} className={`noey-input ${e.age ? "border-red-400" : ""}`} min={5} max={16} />
            {e.age && <FE msg={e.age} />}
          </div>
          <div className="flex-1">
            <select value={f.standard} onChange={e => { set("standard", e.target.value); if (e.target.value === "std_5") set("term", ""); }} disabled={loading} className="noey-input appearance-none">
              {STANDARDS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        {f.standard !== "std_5" && (
          <select value={f.term} onChange={e => set("term", e.target.value)} disabled={loading} className="noey-input appearance-none">
            {TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        )}
        <div className="relative">
          <input type={showPw ? "text" : "password"} placeholder="Password" value={f.password} onChange={e => set("password", e.target.value)} disabled={loading} className={`noey-input pr-14 ${e.password ? "border-red-400" : ""}`} autoComplete="new-password" />
          <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-noey-text-muted text-sm font-semibold">{showPw ? "Hide" : "Show"}</button>
          {e.password && <FE msg={e.password} />}
        </div>
        <div>
          <input type="password" placeholder="Confirm Password" value={f.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} disabled={loading} className={`noey-input ${e.confirmPassword ? "border-red-400" : ""}`} autoComplete="new-password" />
          {e.confirmPassword && <FE msg={e.confirmPassword} />}
        </div>
        {e.server && <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3"><p className="text-red-600 text-sm font-medium text-center">{e.server}</p></div>}
      </div>
      <div className="mt-6">
        <button onClick={handleSubmit} disabled={!valid || loading} className="noey-btn-secondary flex items-center justify-center gap-2 disabled:opacity-40">
          {loading ? <Spinner color="#111114" /> : "Create Account"}
        </button>
      </div>
    </div>
  );
}

export default function ChildSignUpPage() {
  return <Suspense><ChildSignUpForm /></Suspense>;
}
