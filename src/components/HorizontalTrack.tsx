"use client";

import { useEffect, useRef } from "react";

// Project pages scroll sideways only: a normal vertical wheel/trackpad gesture
// slides the track to the left (per Dana's note in Figma). Below md it's a plain vertical stack.
export function HorizontalTrack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 768px)");

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaMode === 1 ? delta * 32 : delta;
    };
    const onKey = (e: KeyboardEvent) => {
      if (!desktop.matches) return;
      const step = { ArrowRight: 1, ArrowDown: 1, PageDown: 3, ArrowLeft: -1, ArrowUp: -1, PageUp: -3 }[e.key];
      if (step) {
        e.preventDefault();
        el.scrollBy({ left: step * el.clientWidth * 0.33, behavior: "smooth" });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="no-scrollbar flex flex-col gap-[10px] md:h-full md:min-h-0 md:flex-row md:overflow-x-auto md:overflow-y-hidden"
    >
      {children}
    </div>
  );
}
