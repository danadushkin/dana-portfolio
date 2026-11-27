"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Dana 27/11 (phones): opening a page — a project from the index, "Back to index" — must land
 * at the very top, with DANA DUSHKIN in view. Next.js only scrolls the new page's own content
 * into view, which leaves the header above the screen, so after every navigation we go to the
 * top ourselves. Back / forward keeps the position the browser restores.
 */
export function ScrollReset() {
  const path = usePathname();
  const first = useRef(true);
  const pop = useRef(false);

  useEffect(() => {
    const onPop = () => (pop.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pop.current) {
      pop.current = false;
      return;
    }
    window.scrollTo(0, 0);
    // Real phones can scroll again a moment later (Next.js bringing the page content into
    // view once it has rendered, Safari restoring a position). For a short while, put any
    // scroll the visitor didn't make back to the top.
    const until = performance.now() + 800;
    let touched = false;
    const user = () => (touched = true);
    const onScroll = () => {
      if (!touched && performance.now() < until && window.scrollY !== 0) window.scrollTo(0, 0);
    };
    const opts = { passive: true, capture: true } as const;
    window.addEventListener("touchstart", user, opts);
    window.addEventListener("wheel", user, opts);
    window.addEventListener("keydown", user, opts);
    window.addEventListener("scroll", onScroll, opts);
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    const done = setTimeout(cleanup, 900);
    function cleanup() {
      window.removeEventListener("touchstart", user, opts);
      window.removeEventListener("wheel", user, opts);
      window.removeEventListener("keydown", user, opts);
      window.removeEventListener("scroll", onScroll, opts);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
      cleanup();
    };
  }, [path]);

  return null;
}
