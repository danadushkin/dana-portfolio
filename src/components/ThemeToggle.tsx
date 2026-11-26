"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  // Not saved anywhere: the choice holds while browsing (the <html> attribute survives
  // page changes) and every new visit starts in Light.
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "";
  };

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      className={`flex items-center gap-3 hover:text-fg ${className}`}
    >
      {dark ? "Dark" : "Light"}
      <span className="relative h-[14px] w-[28px] rounded-full border border-faint">
        <span
          className={`absolute top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-muted transition-[left] duration-300 ${
            dark ? "left-[15px]" : "left-[2px]"
          }`}
        />
      </span>
    </button>
  );
}
