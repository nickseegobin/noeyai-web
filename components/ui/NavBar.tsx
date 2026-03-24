"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import GemBadge from "./GemBadge";
import AvatarCircle from "./AvatarCircle";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface NavBarProps {
  showGems?: boolean;
  showAvatar?: boolean;
  gemCount?: number;
  avatarIndex?: number;
  avatarName?: string;
  zone?: "child" | "parent";
}

export default function NavBar({
  showGems = true,
  showAvatar = true,
  gemCount,
  avatarIndex = 1,
  avatarName = "",
  zone = "child",
}: NavBarProps) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayGems = gemCount ?? user?.token_balance ?? 0;

  async function handleLogout() {
    try { await api.post("/children/deselect"); } catch { /* ignore */ }
    logout();
    setOpen(false);
  }

  return (
    <>
      <nav className="flex items-center justify-between py-4 px-5">
        {/* Hamburger + wordmark */}
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 font-black text-noey-text text-lg"
          aria-label="Open menu"
        >
          <HamIcon />
          <span>NoeyAI</span>
        </button>

        {/* Right side: gems + avatar */}
        <div className="flex items-center gap-3">
          {showGems && <GemBadge count={displayGems} />}
          {showAvatar && (
            /* FIX: avatar is now a button that navigates to profile-select */
            <button
              onClick={() => router.push("/profile-select")}
              className="flex items-center gap-2 active:opacity-70 transition-opacity"
              aria-label="Switch profile"
            >
              <AvatarCircle
                avatarIndex={avatarIndex}
                displayName={avatarName}
                size={38}
                showRing
              />
              {avatarName && (
                <span className="font-bold text-sm text-noey-text">{avatarName}</span>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Slide-in menu */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-72 h-full bg-white shadow-2xl flex flex-col p-6 pt-12">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 text-noey-text-muted text-2xl"
            >
              ✕
            </button>

            <div className="flex flex-col gap-1">
              {zone === "child" ? (
                <>
                  <ML href="/child/home" label="Home Room" close={() => setOpen(false)} />
                  <ML href="/child/progress" label="My Progress" close={() => setOpen(false)} />
                  <ML href="/news" label="NoeyAI News" close={() => setOpen(false)} />
                </>
              ) : (
                <>
                  <ML href="/parent/home" label="Home" close={() => setOpen(false)} />
                  <ML href="/parent/children" label="Children Settings" close={() => setOpen(false)} />
                  <ML href="/parent/analytics" label="Analytics" close={() => setOpen(false)} />
                  <ML href="/parent/tokens" label="Add Tokens" close={() => setOpen(false)} />
                  <ML href="/news" label="NoeyAI News" close={() => setOpen(false)} />
                </>
              )}
            </div>

            <div className="mt-auto border-t border-noey-surface pt-4 flex flex-col gap-1">
              <ML href="/profile-select" label="Switch Profile" close={() => setOpen(false)} />
              <button
                onClick={handleLogout}
                className="text-left py-3 px-2 text-noey-gem font-bold text-base rounded-xl hover:bg-noey-surface"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ML({ href, label, close }: { href: string; label: string; close: () => void }) {
  return (
    <Link
      href={href}
      onClick={close}
      className="py-3 px-2 font-semibold text-base text-noey-text rounded-xl hover:bg-noey-surface"
    >
      {label}
    </Link>
  );
}

function HamIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
      <rect width="22" height="2.5" rx="1.25" fill="#111114" />
      <rect y="6.75" width="22" height="2.5" rx="1.25" fill="#111114" />
      <rect y="13.5" width="22" height="2.5" rx="1.25" fill="#111114" />
    </svg>
  );
}
