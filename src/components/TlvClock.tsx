"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "numeric", minute: "2-digit" });

// Live Tel Aviv time ("9:02"). Rendered empty on the server so there's no hydration mismatch.
export function TlvClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums text-fg">{now ?? "  :  "}</span>;
}
