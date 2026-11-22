"use client";

import { useEffect, useState } from "react";

// The Year / Client / Role / Team / Tools table. Dana: only this part of the project
// page disappears once you scroll the images; it comes back at the top. (Desktop only —
// on phones the page scrolls normally and the table just sits in the flow.)
export function Credits({ meta }: { meta: { label: string; value: string | string[] }[] }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const on = (e: Event) => setHidden((e as CustomEvent<number>).detail > 40);
    window.addEventListener("column:scroll", on);
    return () => window.removeEventListener("column:scroll", on);
  }, []);

  return (
    <dl
      className={`grid w-fit grid-cols-[86px_1fr] gap-y-[6px] transition-[opacity,transform] duration-500 ease-out ${
        hidden ? "md:pointer-events-none md:translate-y-2 md:opacity-0" : ""
      }`}
    >
      {meta.map((m) => (
        <div key={m.label} className="contents">
          <dt className="text-muted">{m.label}</dt>
          <dd>{Array.isArray(m.value) ? m.value.map((v) => <span key={v} className="block">{v}</span>) : m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
