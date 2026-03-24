"use client";

export function GemIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <path d="M13 2L22 7V19L13 24L4 19V7L13 2Z" fill="#E8396A" stroke="#C0225A" strokeWidth="1" />
      <path d="M13 2L18 7H8L13 2Z" fill="#F06090" opacity="0.7" />
      <path d="M8 7L4 19L13 24L8 7Z" fill="#C0225A" opacity="0.5" />
    </svg>
  );
}

export default function GemBadge({ count, size = "md", className = "" }: { count: number; size?: "sm" | "md"; className?: string }) {
  const iconSize = size === "sm" ? 20 : 26;
  const fontSize = size === "sm" ? "text-sm" : "text-base";
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <GemIcon size={iconSize} />
      <span className={`font-bold text-noey-text ${fontSize}`}>{count}</span>
    </div>
  );
}
