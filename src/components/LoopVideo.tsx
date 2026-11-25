"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Silent looping clip that only plays (and only downloads) while on screen.
// With `sound` (Montora's two films, Dana 25/11): hovering shows "Play with sound" (bottom
// right, white outline), which
// opens the clip large, unmuted, from where it was — Esc / click outside closes it.
export function LoopVideo({ src, poster, label, sound }: { src: string; poster: string; label: string; sound?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { rootMargin: "400px 0px" }, // start a little before it scrolls into view
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {sound && (
        <div className="group absolute inset-0 flex items-end justify-end p-[clamp(10px,1vw,18px)]">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-white bg-black/55 px-3 py-[6px] uppercase text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100"
          >
            Play with sound ↗
          </button>
        </div>
      )}
      {open && <SoundPlayer src={src} poster={poster} label={label} start={ref.current?.currentTime ?? 0} onClose={() => setOpen(false)} />}
    </>
  );
}

function SoundPlayer({ src, poster, label, start, onClose }: { src: string; poster: string; label: string; start: number; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (v) {
      v.currentTime = start;
      v.play().catch(() => {});
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // keep the image column from gliding underneath while the player is open
    const stop = (e: Event) => e.stopPropagation();
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", stop, { capture: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", stop, { capture: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Portal: rendered on <body> so no transformed / contained ancestor can trap the overlay.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      className="fade-in fixed inset-0 z-[70] flex items-center justify-center bg-bg/95 p-[4vw] [animation-delay:0s]"
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls
        playsInline
        onClick={(e) => e.stopPropagation()}
        className="max-h-full max-w-full"
      />
      <button type="button" onClick={onClose} className="absolute right-3 top-3 uppercase hover:text-muted">
        Close
      </button>
    </div>,
    document.body,
  );
}
