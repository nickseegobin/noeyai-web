"use client";
import { useRouter } from "next/navigation";

export default function BackButton({ href, label = "Back" }: { href?: string; label?: string }) {
  const router = useRouter();
  return (
    <button onClick={() => href ? router.push(href) : router.back()}
      className="flex items-center gap-3 text-noey-text font-bold mt-4">
      <div className="w-10 h-10 rounded-full bg-noey-text flex items-center justify-center flex-shrink-0">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span>{label}</span>
    </button>
  );
}
