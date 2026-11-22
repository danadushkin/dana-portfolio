"use client";

import { useEffect, useRef } from "react";

// The Year / Client / Role / Team / Tools table. Dana: only this part of the project page
// goes away when you scroll down — carried off by the scroll itself (not a fade): it moves
// up exactly as far as the images do and is clipped by its own box, so it scrolls out of
// view and back in. Desktop only; on phones it simply sits in the page flow.
export function Credits({ meta }: { meta: { label: string; value: string | string[] }[] }) {
  const inner = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const el = inner.current;
      if (!el) return;
      const y = Math.min((e as CustomEvent<number>).detail, el.offsetHeight + 4);
      el.style.transform = y > 0 ? `translateY(${-y}px)` : "";
    };
    window.addEventListener("column:scroll", on);
    return () => window.removeEventListener("column:scroll", on);
  }, []);

  return (
    <div className="overflow-hidden">
      <dl ref={inner} className="grid w-fit grid-cols-[86px_1fr] gap-y-[6px] will-change-transform">
        {meta.map((m) => (
          <div key={m.label} className="contents">
            <dt className="text-muted">{m.label}</dt>
            <dd>{Array.isArray(m.value) ? m.value.map((v) => <span key={v} className="block">{v}</span>) : m.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
