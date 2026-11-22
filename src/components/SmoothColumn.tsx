"use client";

import { useEffect, useRef } from "react";

const EASE = 0.09; // smoothing per frame — lower = floatier glide

/**
 * The image column on project pages (desktop). Any wheel/trackpad/arrow-key scroll on
 * the page glides this column with eased momentum while the info on the left stays put.
 * It stops at the last image (no loop — Dana's call). Below md it is a plain stack in
 * the normal page flow.
 */
export function SmoothColumn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp = (v: number) => Math.max(0, Math.min(el.scrollHeight - el.clientHeight, v));

    let target = el.scrollTop;
    let raf = 0;
    let written = el.scrollTop;
    const tick = () => {
      const diff = target - el.scrollTop;
      if (Math.abs(diff) < 0.5) {
        el.scrollTop = written = target;
        raf = 0;
        return;
      }
      el.scrollTop += diff * EASE;
      written = el.scrollTop;
      raf = requestAnimationFrame(tick);
    };
    const glideTo = (v: number) => {
      target = clamp(v);
      if (reduced) el.scrollTop = written = target;
      else if (!raf) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      glideTo(target + (e.deltaMode === 1 ? delta * 32 : delta) * 1.1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!desktop.matches) return;
      const step = { ArrowDown: 0.25, ArrowRight: 0.25, PageDown: 0.85, " ": 0.85, ArrowUp: -0.25, ArrowLeft: -0.25, PageUp: -0.85 }[e.key];
      if (step) {
        e.preventDefault();
        glideTo(target + step * el.clientHeight);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        glideTo(e.key === "Home" ? 0 : Infinity);
      }
    };
    // Native scrolling (touch screens, scrollbar drag) moves the target along with it.
    const onScroll = () => {
      if (!raf && Math.abs(el.scrollTop - written) > 1) target = written = el.scrollTop;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={ref} className={`no-scrollbar flex flex-col gap-[var(--gap)] md:h-full md:overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}
