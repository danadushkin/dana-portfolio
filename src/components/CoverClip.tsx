"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeCover } from "@/content/projects";

// Dana 27/11: a cover clip plays on the home page (Harmony, Scrolling, Showcase). Clicking
// through, Harmony and Showcase keep playing the same clip — looping, like every video on the
// site — from the very moment the home preview was at, so nothing changes under the visitor's
// eyes. (Scrolling's project page shows its own full clip instead; see Project.homeCover.)

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

/** Project page, first tile: the home cover clip, looping, resumed where the home preview was. */
export function ResumeClip({ cover, slug, label }: { cover: HomeCover; slug: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    let start = 0;
    try {
      const s = JSON.parse(sessionStorage.getItem(key(slug)) ?? "null");
      sessionStorage.removeItem(key(slug));
      if (s && Date.now() - s.at < FRESH_MS) start = s.t + (Date.now() - s.at) / 1000;
    } catch {}
    const seek = () => {
      if (v.duration && start) v.currentTime = start % v.duration;
    };
    if (v.readyState >= 1) seek();
    else v.addEventListener("loadedmetadata", seek, { once: true });
    // like every clip: plays only while on screen
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { rootMargin: "400px 0px" });
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("loadedmetadata", seek);
    };
  }, [slug]);

  return <video ref={ref} src={cover.video} poster={cover.poster} muted loop playsInline preload="auto" aria-label={label} className="absolute inset-0 h-full w-full object-cover" />;
}
