"use client";
import { useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";

  export default function PinInput({ value, onChange, disabled = false, error = false, autoFocus = false }: {
    value:      string;
    onChange:   (pin: string) => void;
    disabled?:  boolean;
    error?:     boolean;
    autoFocus?: boolean;
  }) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto-focus the first box on mount
  useEffect(() => {
  if (autoFocus) {
    setTimeout(() => refs[0].current?.focus(), 100);
  }
}, []);

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = value.split("");
      if (arr[idx]) {
        arr[idx] = "";
        onChange(arr.join(""));
      } else if (idx > 0) {
        arr[idx - 1] = "";
        onChange(arr.join(""));
        refs[idx - 1].current?.focus();
      }
    } else if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      const arr = Array.from({ length: 4 }, (_, i) => value[i] ?? "");
      arr[idx] = e.key;
      onChange(arr.join(""));
      if (idx < 3) refs[idx + 1].current?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(text.padEnd(4, "").slice(0, 4));
    refs[Math.min(text.length, 3)].current?.focus();
  }

  const digits = Array.from({ length: 4 }, (_, i) => value[i] ?? "");

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((digit, i) => (
        <div
          key={i}
          onClick={() => refs[i].current?.focus()}
          className={`relative flex-1 max-w-[72px] aspect-square rounded-2xl flex items-center justify-center bg-noey-surface cursor-text transition-all
            ${error ? "ring-2 ring-red-400" : digit ? "ring-2 ring-noey-primary" : "ring-2 ring-transparent focus-within:ring-noey-primary"}`}
        >
          <input
            ref={refs[i]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={() => {}}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className="absolute inset-0 opacity-0 w-full h-full cursor-text"
            autoComplete="off"
          />
          {digit
            ? <div className="w-3 h-3 rounded-full bg-noey-primary" />
            : <span className="text-noey-text-muted text-xl font-light">*</span>
          }
        </div>
      ))}
    </div>
  );
}