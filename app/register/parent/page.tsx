"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { getApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AvatarPicker from "@/components/ui/AvatarPicker";
import Spinner from "@/components/ui/Spinner";

interface F { displayName: string; username: string; email: string; password: string; confirmPassword: string; avatarIndex: number; }
interface E { displayName?: string; username?: string; email?: string; password?: string; confirmPassword?: string; server?: string; }

function FE({ msg }: { msg: string }) { return <p className="text-red-500 text-xs font-medium mt-1 ml-2">{msg}</p>; }

export default function ParentSignUpPage() {
  const [f, setF] = useState<F>({ displayName: "", username: "", email: "", password: "", confirmPassword: "", avatarIndex: 1 });
  const [e, setE] = useState<E>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  function set(k: keyof F, v: string | number) { setF(p => ({ ...p, [k]: v })); setE(p => ({ ...p, [k]: undefined, server: undefined })); }

  function validate(): boolean {
    const err: E = {};
    if (!f.displayName.trim()) err.displayName = "Full name is required.";
    if (!f.username.trim()) err.username = "Username is required.";
    else if (f.username.length < 3) err.username = "Min 3 characters.";
    else if (/\s/.test(f.username)) err.username = "No spaces allowed.";
    if (!f.email.trim()) err.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(f.email)) err.email = "Invalid email.";
    if (!f.password) err.password = "Password is required.";
    else if (f.password.length < 8) err.password = "Min 8 characters.";
    if (f.confirmPassword !== f.password) err.confirmPassword = "Passwords do not match.";
    setE(err); return Object.keys(err).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { display_name: f.displayName, username: f.username, email: f.email, password: f.password });
      const d = data.data;
      login(d.token, { user_id: d.user_id, display_name: d.display_name, email: d.email, role: d.role, active_child_id: null, token_balance: null, children: [] });
      router.push("/register/pin");
    } catch (err) {
      const { code, message } = getApiError(err);
      if (code === "noey_username_taken") setE({ username: "Username already taken." });
      else if (code === "noey_email_taken") setE({ email: "Email already registered." });
      else setE({ server: message });
    } finally { setLoading(false); }
  }

  const valid = f.displayName.trim() && f.username.trim().length >= 3 && f.email.trim() && f.password.length >= 8 && f.confirmPassword === f.password;

  return (
    <div className="page-container">
      <h1 className="font-black text-3xl text-noey-text text-center mb-7">Parent Sign Up</h1>
      <div className="flex justify-center mb-7"><AvatarPicker value={f.avatarIndex} onChange={v => set("avatarIndex", v)} /></div>
      <div className="flex flex-col gap-3">
        <div>
          <input type="text" placeholder="Full Name" value={f.displayName} onChange={e => set("displayName", e.target.value)} disabled={loading} className={`noey-input ${e.displayName ? "border-red-400" : ""}`} autoComplete="name" />
          {e.displayName && <FE msg={e.displayName} />}
        </div>
        <div>
          <input type="text" placeholder="Username" value={f.username} onChange={e => set("username", e.target.value.toLowerCase())} disabled={loading} className={`noey-input ${e.username ? "border-red-400" : ""}`} autoCapitalize="none" />
          {e.username && <FE msg={e.username} />}
        </div>
        <div>
          <input type="email" placeholder="Email" value={f.email} onChange={e => set("email", e.target.value)} disabled={loading} className={`noey-input ${e.email ? "border-red-400" : ""}`} autoComplete="email" />
          {e.email && <FE msg={e.email} />}
        </div>
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
      <div className="flex flex-col gap-3 mt-6">
        <button onClick={handleSubmit} disabled={!valid || loading} className="noey-btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Spinner /> : "Create Account"}
        </button>
        <Link href="/login" className="noey-btn-secondary text-center">Already have an account? Login</Link>
      </div>
    </div>
  );
}
