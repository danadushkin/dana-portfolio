"use client";

import { useEffect, useRef } from "react";

const EASE = 0.18; // how quickly the dot catches up with the pointer
const OFFSET = { x: 20, y: 4 }; // sits just to the right of the pointer, like the reference

// A small dot that trails the mouse (behaviour from jsandrieu.com, which Dana picked).
// Mouse/trackpad only; hidden on touch screens. The normal cursor stays.
export function CursorDot() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = ref.current;
    if (!dot || !matchMedia("(pointer: fine)").matches) return;
    const instant = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = -100, ty = -100, x = -100, y = -100, raf = 0;

    const loop = () => {
      x += (tx - x) * (instant ? 1 : EASE);
      y += (ty - y) * (instant ? 1 : EASE);
      dot.style.transform = `translate3d(${x + OFFSET.x}px, ${y + OFFSET.y}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (x < -50) { x = tx; y = ty; } // first move: appear in place, don't fly in
      dot.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const hide = () => (dot.style.opacity = "0");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] -mt-[7px] -ml-[7px] h-[14px] w-[14px] rounded-full bg-fg opacity-0 transition-opacity duration-300"
    />
  );
}
