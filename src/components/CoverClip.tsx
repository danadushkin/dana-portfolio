"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeCover } from "@/content/projects";

// Dana 27/11: a cover clip plays on the home page only (Scrolling, Harmony). On the project
// page the same clip carries on from where the home preview was, then cross-fades into the
// first tile's own content, so the switch is not noticed:
//  - into the tile's clip at `handoff` seconds, the moment where both look the same (Scrolling);
//  - into the tile's still once the cover has played to its end (Harmony: the cover ends on it).

const key = (slug: string) => `cover:${slug}`;
const FRESH_MS = 5000; // a saved position older than this didn't come from a click-through

/** True once the home intro is over (or never ran). */
function useIntroDone() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    if (!html.dataset.intro) return setDone(true);
    const mo = new MutationObserver(() => !html.dataset.intro && setDone(true));
    mo.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
    return () => mo.disconnect();
  }, []);
  return done;
}

/** Plays while `active` (desktop preview) and on screen, after the intro; remembers its position. */
export function HomeCoverVideo({ cover, slug, label, active = true }: { cover: HomeCover; slug: string; label: string; active?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const introDone = useIntroDone();

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
    if (active && inView && introDone) v.play().catch(() => {});
    else v.pause();
  }, [active, inView, introDone]);

  return (
    <video
      ref={ref}
      src={cover.video}
      poster={cover.poster}
      muted
      loop
      playsInline
      preload={active ? "auto" : "none"}
      aria-label={label}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

/** Project page, first tile: the cover clip, then a cross-fade into the tile's own clip or still. */
export function HandoffClip({ cover, slug, src, label }: { cover: HomeCover; slug: string; src?: string; label: string }) {
  const coverRef = useRef<HTMLVideoElement>(null);
  const clipRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const c = coverRef.current!;
    const v = clipRef.current;
    let start = 0;
    try {
      const s = JSON.parse(sessionStorage.getItem(key(slug)) ?? "null");
      sessionStorage.removeItem(key(slug));
      if (s && Date.now() - s.at < FRESH_MS) start = s.t + (Date.now() - s.at) / 1000;
    } catch {}
    const t0 = performance.now();
    const MIN_MS = 1200; // let the cover run a moment so the page has settled first

    const seekCover = () => {
      // with a still to fade to, the cover plays once to its end (that end is the still)
      if (c.duration) c.currentTime = v ? start % c.duration : Math.min(start % c.duration, c.duration - 0.05);
      c.play().catch(() => {});
    };
    if (c.readyState >= 1) seekCover();
    else c.addEventListener("loadedmetadata", seekCover, { once: true });

    if (!v) {
      const onEnd = () => setFading(true);
      c.addEventListener("ended", onEnd);
      return () => {
        c.removeEventListener("loadedmetadata", seekCover);
        c.removeEventListener("ended", onEnd);
      };
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    const ready = () => {
      timer = setTimeout(() => {
        v.play().catch(() => {});
        setFading(true);
      }, Math.max(0, MIN_MS - (performance.now() - t0)));
    };
    const seekClip = () => {
      v.currentTime = cover.handoff ?? 0;
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

  // After the hand-off a clip behaves like every other one: plays only while on screen.
  useEffect(() => {
    if (!done) return;
    coverRef.current?.pause();
    const v = clipRef.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "400px 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, [done]);

  return (
    <>
      {src && <video ref={clipRef} src={src} muted loop playsInline preload="auto" aria-label={label} className="absolute inset-0 h-full w-full object-cover" />}
      {!done && (
        <video
          ref={coverRef}
          src={cover.video}
          poster={cover.poster}
          muted
          loop={Boolean(src)}
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
