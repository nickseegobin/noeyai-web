"use client";
import { useState } from "react";
import { getAvatarColor, getChildAvatarSrc, getParentAvatarSrc } from "@/lib/utils";

interface AvatarCircleProps {
  avatarIndex?: number;
  displayName?: string;
  size?: number;
  showRing?: boolean;
  className?: string;
  role?: "child" | "parent";
}

export default function AvatarCircle({
  avatarIndex = 1,
  displayName = "",
  size = 64,
  showRing = true,
  className = "",
  role = "child",
}: AvatarCircleProps) {
  const [imgError, setImgError] = useState(false);
  const ringColor = getAvatarColor(avatarIndex);
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const ringWidth = Math.max(2, Math.round(size * 0.055));
  const innerSize = size - ringWidth * 2;

  const bgColors = ["#FDDCB5", "#F4C2D0", "#C8D8F8", "#C8F0D8", "#E8C8F8", "#FDE2B5", "#C8F4EC", "#F4C8C8", "#D8C8F8", "#C8F0F8"];
  const bg = bgColors[(avatarIndex - 1) % bgColors.length];

  const src = role === "parent" ? getParentAvatarSrc(avatarIndex) : getChildAvatarSrc(avatarIndex);

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
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={displayName || `Avatar ${avatarIndex}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          // Fallback initial when image not found
          <span
            className="font-black text-white select-none"
            style={{ fontSize: innerSize * 0.38, textShadow: "0 1px 2px rgba(0,0,0,0.25)" }}
          >
            {initial}
          </span>
        )}
      </div>
    </div>
  );
}