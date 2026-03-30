"use client";
import { useRouter } from "next/navigation";
import { Badge } from "@heroui/react";
import AvatarCircle from "./AvatarCircle";
import { useAuth } from "@/context/AuthContext";
import { useMyBoards } from "@/hooks/useLeaderboard";
import api from "@/lib/api";

interface AvatarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  zone: "child" | "parent";
  avatarIndex: number;
  avatarName: string;
}

export default function AvatarMenu({ isOpen, onClose, zone, avatarIndex, avatarName }: AvatarMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Only fetch leaderboard summary in child zone — shows badge if user ranks on any board
  const { data: myBoards } = useMyBoards(zone === "child" && isOpen);
  const hasLeaderboardRanks = (myBoards?.boards?.length ?? 0) > 0;

  if (!isOpen) return null;

  function navigate(path: string) { onClose(); router.push(path); }

  async function handleLogout() {
    onClose();
    try { await api.post("/children/deselect"); } catch { /* ignore */ }
    logout();
  }

  async function handleSwitchUser() {
    onClose();
    try { await api.post("/children/deselect"); } catch { /* ignore */ }
    router.push("/profile-select");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl w-full max-w-[430px] pb-8">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-noey-surface-dark" />
        </div>

        {/* Profile header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-noey-surface">
          <AvatarCircle avatarIndex={avatarIndex} displayName={avatarName} size={52} showRing role={zone === "parent" ? "parent" : "child"} />
          <div>
            <p className="font-black text-base text-noey-text">{avatarName}</p>
            <p className="text-noey-text-muted text-xs font-medium capitalize">{zone} profile</p>
          </div>
        </div>

        <div className="flex flex-col px-4 pt-3 gap-1">
          {zone === "child" ? (
            <>
              <MenuItem icon="👤" label="My Settings" sublabel="Change avatar and nickname" onPress={() => navigate("/child/settings")} />
              <MenuItem icon="🎯" label="Content Settings" sublabel="Change standard and term filters" onPress={() => navigate("/child/content-settings")} />
              <MenuItem icon="⚔️" label="Quests" sublabel="Coming soon" disabled />

              {/* Leaderboards — badge dot if user ranks on any board today */}
              <div className="relative">
                {hasLeaderboardRanks ? (
                  <Badge content={myBoards!.boards.length} color="danger" size="sm"
                    classNames={{ badge: "bg-noey-gem text-white text-xs font-black" }}>
                    <MenuItem
                      icon="🏆"
                      label="Leaderboards"
                      sublabel={`You're on ${myBoards!.boards.length} board${myBoards!.boards.length > 1 ? "s" : ""} today`}
                      onPress={() => navigate("/child/leaderboard")}
                    />
                  </Badge>
                ) : (
                  <MenuItem icon="🏆" label="Leaderboards" sublabel="See today's rankings" onPress={() => navigate("/child/leaderboard")} />
                )}
              </div>
            </>
          ) : (
            <MenuItem icon="👤" label="My Settings" sublabel="Change avatar and username" onPress={() => navigate("/parent/settings")} />
          )}

          <div className="border-t border-noey-surface my-2" />
          <MenuItem icon="🔄" label="Switch Profile" onPress={handleSwitchUser} />
          <MenuItem icon="🚪" label="Logout" onPress={handleLogout} destructive />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, sublabel, onPress, destructive = false, disabled = false }: {
  icon: string; label: string; sublabel?: string;
  onPress?: () => void; destructive?: boolean; disabled?: boolean;
}) {
  return (
    <button onClick={disabled ? undefined : onPress} disabled={disabled}
      className={`flex items-center gap-4 w-full px-3 py-3.5 rounded-2xl text-left transition-colors
        ${disabled ? "opacity-40 cursor-default" : "hover:bg-noey-surface active:bg-noey-surface-dark"}`}>
      <span className="text-2xl w-8 flex-shrink-0 text-center">{icon}</span>
      <div className="flex-1">
        <p className={`font-bold text-sm ${destructive ? "text-noey-gem" : "text-noey-text"}`}>{label}</p>
        {sublabel && <p className="text-noey-text-muted text-xs font-medium mt-0.5">{sublabel}</p>}
      </div>
      {!disabled && !destructive && (
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="flex-shrink-0">
          <path d="M1 1l5 5-5 5" stroke="#9B9BA8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {disabled && <span className="text-xs text-noey-text-muted font-medium bg-noey-surface px-2 py-0.5 rounded-lg">Soon</span>}
    </button>
  );
}