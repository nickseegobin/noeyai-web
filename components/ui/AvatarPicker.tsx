"use client";
import { useState } from "react";
import AvatarCircle from "./AvatarCircle";

interface AvatarPickerProps {
  value: number;
  onChange: (i: number) => void;
  size?: number;
  role?: "child" | "parent";
  count?: number; // how many avatars available in the folder
}

export default function AvatarPicker({
  value,
  onChange,
  size = 96,
  role = "child",
  count = 5,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const indices = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex-shrink-0"
          aria-label="Choose avatar"
        >
          <AvatarCircle avatarIndex={value} displayName="?" size={size} showRing role={role} />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-noey-text flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-light leading-none">+</span>
          </div>
        </button>
        <span className="font-bold text-xl text-noey-text leading-tight">
          Add<br />Picture
        </span>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-t-3xl w-full max-w-[430px] p-6 pb-10">
            <h3 className="font-black text-lg text-noey-text mb-5 text-center">Choose Your Avatar</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {indices.map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { onChange(idx); setOpen(false); }}
                  className={`rounded-full transition-all duration-150 ${value === idx ? "scale-110" : "opacity-70 hover:opacity-100"}`}
                >
                  <AvatarCircle
                    avatarIndex={idx}
                    displayName={`${idx}`}
                    size={64}
                    showRing={value === idx}
                    role={role}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}