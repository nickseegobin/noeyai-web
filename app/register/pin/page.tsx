"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiError } from "@/lib/api";
import PinInput from "@/components/ui/PinInput";
import Spinner from "@/components/ui/Spinner";

interface Props { successPath?: string; showBack?: boolean; backPath?: string; }

export default function SetPinPage({ successPath = "/register/child", showBack = false, backPath = "/profile-select" }: Props) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const ready = pin.length === 4 && confirmPin.length === 4;

  async function handleConfirm() {
    if (pin !== confirmPin) { setError("PINs do not match. Please try again."); setPin(""); setConfirmPin(""); return; }
    setError(""); setLoading(true);
    try {
      await api.post("/auth/pin/set", { pin });
      router.push(successPath);
    } catch (err) { setError(getApiError(err).message); }
    finally { setLoading(false); }
  }

  return (
    <div className="page-container">
      {showBack && (
        <button onClick={() => router.push(backPath)} className="flex items-center gap-2 text-noey-text-muted font-semibold mb-6">
          <div className="w-8 h-8 rounded-full bg-noey-text flex items-center justify-center">
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          Back
        </button>
      )}
      <h1 className="font-black text-3xl text-noey-text text-center mb-12">Set Secret Pin</h1>
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-semibold text-base text-noey-text text-center mb-4">Set Secret Pin</p>
          <PinInput value={pin} onChange={v => { setPin(v); setError(""); }} disabled={loading} error={!!error} />
        </div>
        <div>
          <p className="font-semibold text-base text-noey-text text-center mb-4">Confirm Secret Pin</p>
          <PinInput value={confirmPin} onChange={v => { setConfirmPin(v); setError(""); }} disabled={loading} error={!!error} />
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3"><p className="text-red-600 text-sm font-medium text-center">{error}</p></div>}
      </div>
      <div className="mt-auto pt-8">
        <button onClick={handleConfirm} disabled={!ready || loading} className="noey-btn-secondary flex items-center justify-center gap-2 disabled:opacity-40">
          {loading ? <Spinner color="#111114" /> : "Confirm"}
        </button>
      </div>
    </div>
  );
}
