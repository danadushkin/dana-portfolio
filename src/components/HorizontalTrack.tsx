"use client";

import { useEffect, useRef } from "react";

const EASE = 0.09; // smoothing per frame — lower = floatier glide
const ENTRY_MS = 1400;

/**
 * Project pages scroll sideways only. A vertical wheel/trackpad gesture glides the
 * track with eased momentum, and the strip loops: after the last image it carries
 * straight on into the first again (Dana's note). The loop is a second, inert copy of
 * the content; whenever the copy's start reaches the left edge we jump back by one
 * period, which is invisible because both copies are identical.
 * Items marked data-count feed the "01 / 11" counter. Entering from the index plays
 * a slide-in. Below md it's a plain vertical stack with no copy.
 */
export function HorizontalTrack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Width of one full pass = where the copy begins.
    const period = () => copy.current?.firstElementChild instanceof HTMLElement ? copy.current.firstElementChild.offsetLeft : 0;
    const wrap = (v: number) => {
      const p = period();
      return p > 0 ? ((v % p) + p) % p : Math.max(0, Math.min(el.scrollWidth - el.clientWidth, v));
    };

    // pos/target are "virtual" positions that may run past one period; the DOM sees them wrapped.
    let pos = el.scrollLeft;
    let target = pos;
    let raf = 0;
    let written = el.scrollLeft; // last value we set, to tell our scrolls from native ones
    const apply = () => {
      el.scrollLeft = wrap(pos);
      written = el.scrollLeft;
    };

    const tick = () => {
      const diff = target - pos;
      if (Math.abs(diff) < 0.5) {
        pos = target;
        apply();
        // Fold back into the first period so the numbers stay small.
        const folded = wrap(pos);
        pos = target = folded;
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
        return;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || e.ctrlKey) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      glideBy((e.deltaMode === 1 ? delta * 32 : delta) * 1.2);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!desktop.matches) return;
      const step = { ArrowRight: 1, ArrowDown: 1, PageDown: 3, ArrowLeft: -1, ArrowUp: -1, PageUp: -3 }[e.key];
      if (step) {
        e.preventDefault();
        glideBy(step * el.clientWidth * 0.33);
      } else if (e.key === "Home") {
        e.preventDefault();
        glideBy(-wrap(target));
      }
    };

    // Counter: the counted item whose left edge most recently passed the left third.
    let last = -1;
    const report = () => {
      if (!raf && desktop.matches && Math.abs(el.scrollLeft - written) > 1) {
        // Native scroll (touch / scrollbar): follow it, and wrap it too.
        const w = wrap(el.scrollLeft);
        if (w !== el.scrollLeft) el.scrollLeft = w;
        pos = target = written = el.scrollLeft;
      }
      const list = Array.from(inner.current?.querySelectorAll<HTMLElement>(":scope > [data-count]") ?? []);
      const copies = Array.from(copy.current?.querySelectorAll<HTMLElement>(":scope > [data-count]") ?? []);
      const all = desktop.matches ? [...list, ...copies] : list;
      const edge = desktop.matches ? el.scrollLeft + el.clientWidth * 0.33 : window.scrollY + innerHeight * 0.33;
      let i = 0;
      all.forEach((it, k) => {
        const start = desktop.matches ? it.offsetLeft : it.getBoundingClientRect().top + window.scrollY;
        if (start <= edge) i = k;
      });
      i %= Math.max(1, list.length);
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
    if (fromIndex && inner.current && desktop.matches && !reduced) {
      inner.current.parentElement?.animate(
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
    <div ref={ref} className="no-scrollbar md:relative md:h-full md:min-h-0 md:overflow-x-auto md:overflow-y-hidden">
      <div className="flex flex-col gap-[10px] md:h-full md:w-max md:flex-row">
        <div ref={inner} className="contents">
          {children}
        </div>
        {/* Loop copy — desktop only, hidden from assistive tech and the tab order. */}
        <div ref={copy} className="hidden md:contents" aria-hidden inert>
          {children}
        </div>
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
