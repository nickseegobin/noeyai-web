"use client";
import { getAvatarColor } from "@/lib/utils";

export default function AvatarCircle({ avatarIndex = 1, displayName = "", size = 64, showRing = true, className = "" }: {
  avatarIndex?: number; displayName?: string; size?: number; showRing?: boolean; className?: string;
}) {
  const ringColor = getAvatarColor(avatarIndex);
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const ringWidth = Math.round(size * 0.06);
  const innerSize = size - ringWidth * 2 - 4;

  // Color per avatar index for placeholder backgrounds
  const bgColors = ["#FDDCB5", "#F4C2D0", "#C8D8F8", "#C8F0D8", "#E8C8F8"];
  const bg = bgColors[(avatarIndex - 1) % bgColors.length];

  return (
    <div
      className={`relative flex-shrink-0 rounded-full flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: showRing ? ringColor : "transparent",
        padding: showRing ? ringWidth : 0,
      }}
    >
      <div
        className="rounded-full flex items-center justify-center overflow-hidden w-full h-full"
        style={{ background: bg }}
      >
        <span className="font-black text-white select-none" style={{ fontSize: innerSize * 0.4, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
          {initial}
        </span>
      </div>
    </div>
  );
}
