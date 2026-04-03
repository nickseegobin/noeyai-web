"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  DropdownSection, Avatar, Badge,
} from "@heroui/react";
import GemBadge from "./GemBadge";
import { useAuth } from "@/context/AuthContext";
import { useMyBoards } from "@/hooks/useLeaderboard";
import { getChildAvatarSrc, getParentAvatarSrc } from "@/lib/utils";
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
  showGems = true, showAvatar = true,
  gemCount, avatarIndex = 1, avatarName = "", zone = "child",
}: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const displayGems = gemCount ?? user?.token_balance ?? 0;

  const avatarSrc = zone === "parent"
    ? getParentAvatarSrc(avatarIndex)
    : getChildAvatarSrc(avatarIndex);

  // Nickname is set at child creation — read-only, pulled from child profile
  const activeChild = user?.children?.find(c => c.child_id === user?.active_child_id);
  const nickname = (activeChild as any)?.nickname ?? "";

  const { data: myBoards } = useMyBoards(zone === "child" && showAvatar);
  const leaderboardCount = myBoards?.boards?.length ?? 0;
  const hasLeaderboardRanks = leaderboardCount > 0;

  async function handleLogout() {
    try { await api.post("/children/deselect"); } catch { /* ignore */ }
    logout();
    setMenuOpen(false);
  }

  async function handleDropdownAction(key: string) {
    switch (key) {
      case "settings": router.push(zone === "parent" ? "/parent/settings" : "/child/settings"); break;
      case "content": router.push("/child/content-settings"); break;
      case "leaderboard": router.push("/child/leaderboard"); break;
      case "switch":
        try { await api.post("/children/deselect"); } catch { /* ignore */ }
        router.push("/profile-select");
        break;
      case "logout": await handleLogout(); break;
    }
  }

  return (
    <>
      <nav className="flex items-center justify-between py-4 px-5">
        <button onClick={() => setMenuOpen(true)}
          className="flex items-center gap-2 font-black text-noey-text text-lg" aria-label="Open menu">
          <HamIcon />
          <span>NoeyAI</span>
        </button>

        <div className="flex items-center gap-3">
          {showGems && <GemBadge count={displayGems} />}

          {showAvatar && (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="flex items-center gap-2 active:opacity-70 transition-opacity outline-none" aria-label="Profile menu">
                  <Badge
                    content={hasLeaderboardRanks ? leaderboardCount : ""}
                    color="danger" size="sm" isInvisible={!hasLeaderboardRanks}
                    classNames={{ badge: "bg-noey-gem text-white text-xs font-black min-w-[1.1rem]" }}
                  >
                    <Avatar isBordered size="sm" src={avatarSrc} name={avatarName}
                      classNames={{ base: "w-9 h-9 ring-2 ring-noey-gem cursor-pointer", name: "font-black text-sm" }} />
                  </Badge>
                  {avatarName && <span className="font-bold text-sm text-noey-text">{avatarName}</span>}
                </button>
              </DropdownTrigger>

              <DropdownMenu aria-label="Profile actions" variant="flat"
                onAction={(key) => handleDropdownAction(String(key))}>

                <DropdownSection showDivider>
                  <DropdownItem key="profile_info" className="h-auto gap-0.5 py-3" isReadOnly>
                    <p className="font-bold text-sm text-noey-text">{avatarName}</p>
                    {/* Nickname shown beneath name — child zone only, read-only */}
                    {zone === "child" && nickname && (
                      <p className="text-noey-text-muted text-xs font-medium mt-0.5">
                        @{nickname}
                      </p>
                    )}
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection showDivider>
                  <DropdownItem key="settings">My Settings</DropdownItem>
                  {zone === "child"
                    ? <DropdownItem key="content">Content Settings</DropdownItem>
                    : <DropdownItem key="content_ph" className="hidden" />}
                  {zone === "child"
                    ? <DropdownItem key="quests" isReadOnly className="opacity-40 cursor-default">
                        Quests <span className="text-xs ml-1 text-noey-text-muted">(Coming Soon)</span>
                      </DropdownItem>
                    : <DropdownItem key="quests_ph" className="hidden" />}
                  {zone === "child"
                    ? <DropdownItem key="leaderboard"
                        endContent={hasLeaderboardRanks
                          ? <span className="text-xs font-black text-white bg-noey-gem px-1.5 py-0.5 rounded-full">{leaderboardCount}</span>
                          : undefined}>
                        Leaderboards
                      </DropdownItem>
                    : <DropdownItem key="lb_ph" className="hidden" />}
                </DropdownSection>

                <DropdownSection>
                  <DropdownItem key="switch">Switch Profile</DropdownItem>
                  <DropdownItem key="logout" color="danger" className="text-danger">Log Out</DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>
      </nav>

      {/* Side menu — slides from LEFT */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 h-full bg-white shadow-2xl flex flex-col p-6 pt-12">
            <button onClick={() => setMenuOpen(false)} className="absolute top-5 right-5 text-noey-text-muted text-2xl">✕</button>
            <div className="flex flex-col gap-1">
              {zone === "child" ? (
                <>
                  <ML href="/child/home" label="Home Room" close={() => setMenuOpen(false)} />
                  <ML href="/child/leaderboard" label="🏆 Leaderboards" close={() => setMenuOpen(false)} />
                  <ML href="/child/progress" label="My Progress" close={() => setMenuOpen(false)} />
                  <ML href="/news" label="NoeyAI News" close={() => setMenuOpen(false)} />
                </>
              ) : (
                <>
                  <ML href="/parent/home" label="Home" close={() => setMenuOpen(false)} />
                  <ML href="/parent/children" label="Children Settings" close={() => setMenuOpen(false)} />
                  <ML href="/parent/analytics" label="Analytics" close={() => setMenuOpen(false)} />
                  <ML href="/parent/tokens" label="Add Tokens" close={() => setMenuOpen(false)} />
                  <ML href="/news" label="NoeyAI News" close={() => setMenuOpen(false)} />
                </>
              )}
            </div>
            <div className="mt-auto border-t border-noey-surface pt-4 flex flex-col gap-1">
              <ML href="/profile-select" label="Switch Profile" close={() => setMenuOpen(false)} />
              <button onClick={handleLogout} className="text-left py-3 px-2 text-noey-gem font-bold text-base rounded-xl hover:bg-noey-surface">
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
    <Link href={href} onClick={close} className="py-3 px-2 font-semibold text-base text-noey-text rounded-xl hover:bg-noey-surface">
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