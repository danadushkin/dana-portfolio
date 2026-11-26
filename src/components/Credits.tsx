"use client";

import { useEffect, useState } from "react";

// The Year / Client / Role / Team / Tools table. Dana: only this part of the project page
// goes away once you scroll the images — with the soft fade (she tried "carried off by the
// scroll" and asked for the fade back). A pure fade — the small 8px drop that went with it
// read as a glitch (Dana 25/11). Comes back at the top. Desktop only.
export function Credits({ meta }: { meta: { label: string; value: string | string[] }[] }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const on = (e: Event) => setHidden((e as CustomEvent<number>).detail > 40);
    window.addEventListener("column:scroll", on);
    return () => window.removeEventListener("column:scroll", on);
  }, []);

  return (
    <dl
      className={`grid w-fit grid-cols-[86px_1fr] gap-y-[7.8px] transition-opacity duration-500 ease-out ${
        hidden ? "md:pointer-events-none md:opacity-0" : ""
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
