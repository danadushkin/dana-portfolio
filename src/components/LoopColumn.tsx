"use client";

import { useEffect, useRef } from "react";

const EASE = 0.09; // smoothing per frame — lower = floatier glide

/**
 * The image column on project pages (desktop). Any wheel/trackpad/arrow-key scroll on
 * the page glides this column with eased momentum while the info on the left stays put,
 * and the column loops: after the last image it carries straight on into the first
 * (Dana's note). The loop is a second, inert copy of the rows; whenever the copy's top
 * reaches the top edge we jump back by one period, invisible because both copies match.
 * Below md it is a plain stack in the normal page flow — no copy, no loop.
 */
export function LoopColumn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const period = () => {
      const first = copy.current?.firstElementChild;
      return first instanceof HTMLElement ? first.offsetTop : 0;
    };
    const wrap = (v: number) => {
      const p = period();
      return p > 0 ? ((v % p) + p) % p : Math.max(0, Math.min(el.scrollHeight - el.clientHeight, v));
    };

    // pos/target are virtual positions that may run past one period; the DOM sees them wrapped.
    let pos = 0;
    let target = 0;
    let raf = 0;
    let written = 0;
    const apply = () => {
      el.scrollTop = wrap(pos);
      written = el.scrollTop;
    };
    const tick = () => {
      const diff = target - pos;
      if (Math.abs(diff) < 0.5) {
        pos = target;
        apply();
        pos = target = wrap(pos); // fold back into the first period
        raf = 0;
        return;
      }
      pos += diff * EASE;
      apply();
      raf = requestAnimationFrame(tick);
    };
    const glideBy = (d: number) => {
      target += d;
      if (reduced) {
        pos = target;
        apply();
      } else if (!raf) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return;
      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;
      e.preventDefault();
      glideBy((e.deltaMode === 1 ? delta * 32 : delta) * 1.1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!desktop.matches) return;
      const step = { ArrowDown: 0.25, ArrowRight: 0.25, PageDown: 0.85, " ": 0.85, ArrowUp: -0.25, ArrowLeft: -0.25, PageUp: -0.85 }[e.key];
      if (step) {
        e.preventDefault();
        glideBy(step * el.clientHeight);
      } else if (e.key === "Home") {
        e.preventDefault();
        glideBy(-wrap(target));
      }
    };
    // Native scrolling (touch screens, scrollbar drag): follow it, and wrap it too.
    const onScroll = () => {
      if (raf || !desktop.matches || Math.abs(el.scrollTop - written) <= 1) return;
      const w = wrap(el.scrollTop);
      if (w !== el.scrollTop) el.scrollTop = w;
      pos = target = written = el.scrollTop;
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
    <div ref={ref} className={`no-scrollbar md:relative md:h-full md:overflow-y-auto ${className}`}>
      <div className="flex flex-col gap-[var(--gap)]">
        <div className="contents">{children}</div>
        {/* Loop copy — desktop only, hidden from assistive tech and the tab order. */}
        <div ref={copy} className="hidden md:contents" aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
