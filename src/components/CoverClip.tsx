"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeCover } from "@/content/projects";

// Dana 27/11 (Scrolling): a cover clip plays on the home page only. On the project page the
// same clip carries on from where the home preview was, then cross-fades into the project's
// own first clip at the moment where both look the same, so the switch is not noticed.

const key = (slug: string) => `cover:${slug}`;
const FRESH_MS = 5000; // a saved position older than this didn't come from a click-through

/** Plays while `active` (desktop preview) and on screen; remembers its position on leave. */
export function HomeCoverVideo({ cover, slug, label, active = true }: { cover: HomeCover; slug: string; label: string; active?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(v);
    // Keep noting where the clip is while it plays, so a click-through can pick up from
    // here (on leaving, the browser pauses the removed video before any cleanup could read it).
    const note = () => {
      try {
        sessionStorage.setItem(key(slug), JSON.stringify({ t: v.currentTime, at: Date.now() }));
      } catch {}
    };
    v.addEventListener("timeupdate", note);
    return () => {
      io.disconnect();
      v.removeEventListener("timeupdate", note);
    };
  }, [slug]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active && inView) v.play().catch(() => {});
    else v.pause();
  }, [active, inView]);

  return (
    <video
      ref={ref}
      src={cover.video}
      poster={cover.poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/** Project page, first tile: the cover clip, then a cross-fade into the tile's own clip. */
export function HandoffClip({ cover, slug, src, label }: { cover: HomeCover; slug: string; src: string; label: string }) {
  const coverRef = useRef<HTMLVideoElement>(null);
  const clipRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const c = coverRef.current!;
    const v = clipRef.current!;
    let start = 0;
    try {
      const s = JSON.parse(sessionStorage.getItem(key(slug)) ?? "null");
      sessionStorage.removeItem(key(slug));
      if (s && Date.now() - s.at < FRESH_MS) start = s.t + (Date.now() - s.at) / 1000;
    } catch {}
    const t0 = performance.now();
    const MIN_MS = 1200; // let the cover run a moment so the page has settled first

    const seekCover = () => {
      if (c.duration) c.currentTime = start % c.duration;
      c.play().catch(() => {});
    };
    if (c.readyState >= 1) seekCover();
    else c.addEventListener("loadedmetadata", seekCover, { once: true });

    let timer: ReturnType<typeof setTimeout> | undefined;
    const ready = () => {
      timer = setTimeout(() => {
        v.play().catch(() => {});
        setFading(true);
      }, Math.max(0, MIN_MS - (performance.now() - t0)));
    };
    const seekClip = () => {
      v.currentTime = cover.handoff;
      v.addEventListener("seeked", ready, { once: true });
    };
    if (v.readyState >= 1) seekClip();
    else v.addEventListener("loadedmetadata", seekClip, { once: true });

    return () => {
      clearTimeout(timer);
      c.removeEventListener("loadedmetadata", seekCover);
      v.removeEventListener("loadedmetadata", seekClip);
      v.removeEventListener("seeked", ready);
    };
  }, [cover.handoff, slug]);

  // After the hand-off the clip behaves like every other one: plays only while on screen.
  useEffect(() => {
    if (!done) return;
    coverRef.current?.pause();
    const v = clipRef.current!;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "400px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, [done]);

  return (
    <>
      <video ref={clipRef} src={src} muted loop playsInline preload="auto" aria-label={label} className="absolute inset-0 h-full w-full object-cover" />
      {!done && (
        <video
          ref={coverRef}
          src={cover.video}
          poster={cover.poster}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onTransitionEnd={() => setDone(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-in-out ${fading ? "opacity-0" : "opacity-100"}`}
        />
      )}
    </>
  );
}
