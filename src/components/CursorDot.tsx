"use client";

import { useEffect, useRef } from "react";

// Lag of the follower, as a time constant: it closes ~63% of the gap every TAU seconds
// (measured on zitafernandez.com, Dana's reference: ~36% of a jump after 50ms → τ≈0.11s).
const TAU = 0.11;

/**
 * Cursor follower modelled on zitafernandez.com: a small solid circle centred on the
 * pointer that trails it with a soft delay, and grows into a translucent ring over
 * anything clickable (the grow/fade itself is CSS — see `.cursor` in globals.css).
 * Mouse/trackpad only; the normal pointer stays visible.
 */
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, last = 0, seen = false;

    const place = () => (dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`);
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000 || 0.016);
      last = now;
      const k = instant ? 1 : 1 - Math.exp(-dt / TAU); // frame-rate independent easing
      x += (tx - x) * k;
      y += (ty - y) * k;
      place();
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        // first contact: appear under the pointer instead of flying in from a corner
        seen = true;
        x = tx;
        y = ty;
        place();
      }
      dot.dataset.visible = "true";
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const hide = () => delete dot.dataset.visible;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, []);

  return <div ref={ref} aria-hidden className="cursor" />;
}
