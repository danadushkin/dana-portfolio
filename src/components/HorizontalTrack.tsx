"use client";

import { useEffect, useRef } from "react";

const EASE = 0.09; // smoothing per frame — lower = floatier glide
const ENTRY_MS = 1400;

// Project pages scroll sideways only: a normal vertical wheel/trackpad gesture
// glides the track to the left with eased momentum. Items marked data-count feed
// the "01 / 12" counter. Entering from the index plays a slide-in. Below md: plain stack.
export function HorizontalTrack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target = el.scrollLeft;
    let raf = 0;

    const max = () => el.scrollWidth - el.clientWidth;
    const clamp = (v: number) => Math.max(0, Math.min(max(), v));

    const tick = () => {
      const diff = target - el.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = target;
        raf = 0;
        return;
      }
      el.scrollLeft += diff * EASE;
      raf = requestAnimationFrame(tick);
    };
    const glideTo = (v: number) => {
      target = clamp(v);
      if (reduced) {
        el.scrollLeft = target;
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      glideTo(target + (e.deltaMode === 1 ? delta * 32 : delta) * 1.2);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!desktop.matches) return;
      const step = { ArrowRight: 1, ArrowDown: 1, PageDown: 3, ArrowLeft: -1, ArrowUp: -1, PageUp: -3 }[e.key];
      if (step) {
        e.preventDefault();
        glideTo(target + step * el.clientWidth * 0.33);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        glideTo(e.key === "Home" ? 0 : max());
      }
    };

    // Counter: the last counted item whose left edge has reached the viewport's left third.
    const items = () => Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
    let last = -1;
    const report = () => {
      if (!raf) target = el.scrollLeft; // native scrolling (touch, scrollbar) moves the target too
      const list = items();
      const edge = desktop.matches ? el.scrollLeft + el.clientWidth * 0.33 : window.scrollY + innerHeight * 0.33;
      let i = 0;
      list.forEach((it, k) => {
        const start = desktop.matches ? it.offsetLeft : it.getBoundingClientRect().top + window.scrollY;
        if (start <= edge) i = k;
      });
      if (i !== last) {
        last = i;
        window.dispatchEvent(new CustomEvent("track:index", { detail: { index: i, total: list.length } }));
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    el.addEventListener("scroll", report, { passive: true });
    window.addEventListener("scroll", report, { passive: true });
    report();

    // Slide-in when arriving from the index: the strip starts where the home preview sat.
    let fromIndex = false;
    try {
      fromIndex = sessionStorage.getItem("fromIndex") === "1";
      sessionStorage.removeItem("fromIndex");
    } catch {}
    const box = inner.current;
    if (fromIndex && box && desktop.matches && !reduced) {
      box.animate(
        [
          { transform: "translateX(34vw)", opacity: 0.6 },
          { transform: "translateX(0)", opacity: 1 },
        ],
        { duration: ENTRY_MS, easing: "cubic-bezier(0.65, 0, 0.15, 1)" },
      );
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("scroll", report);
      window.removeEventListener("scroll", report);
    };
  }, []);

  return (
    <div ref={ref} className="no-scrollbar md:h-full md:min-h-0 md:overflow-x-auto md:overflow-y-hidden">
      <div ref={inner} className="flex flex-col gap-[10px] md:h-full md:w-max md:flex-row">
        {children}
      </div>
    </div>
  );
}

export function TrackCounter({ total }: { total: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const { index, total } = (e as CustomEvent<{ index: number; total: number }>).detail;
      if (ref.current) ref.current.textContent = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
    };
    window.addEventListener("track:index", on);
    return () => window.removeEventListener("track:index", on);
  }, []);
  return (
    <span ref={ref} className="text-muted tabular-nums">
      01 / {String(total).padStart(2, "0")}
    </span>
  );
}
