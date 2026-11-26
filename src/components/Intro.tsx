"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STEP_MS = 400; // time each frame holds before the next wipes over it (Dana 26/11: faster, ~the reference's pace)
const EXPAND_MS = 1100;
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

/**
 * In opening frame 1 the Harmony cover sits centred in the window at 45.2% scale
 * (Figma: the composition group is 373.6px wide there vs 826px in the 1260px cover),
 * i.e. the cover is 1.2865× the window's width, with plain colour above and below.
 * Rebuilding that frame from the real cover lets it grow into the cover without any
 * distortion: the window widens and the cover's sides come into view. The space above
 * and below is filled with the cover's own edge colours, so there is no seam.
 */
const COVER_START = (1260 * (373.6 / 826)) / 443;

/**
 * Home intro: a small centred window shows Dana's opening frames, ending on frame 1,
 * which then grows into the home preview panel (identical to the project page's first
 * image) and hands over to the page. Armed by the inline script in layout.tsx.
 */
export function Intro({
  frames,
  cover,
  coverRatio,
  coverEdges,
  target,
}: {
  frames: string[]; // shown first, in order
  cover: string; // first project's cover (same file the panel shows)
  coverRatio: number;
  coverEdges: { top: string; bottom: string }; // fill above / below the cover
  target: React.RefObject<HTMLDivElement | null>;
}) {
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(0); // how many layers have wiped in
  const [box, setBox] = useState<React.CSSProperties | null>(null);
  const [expanded, setExpanded] = useState(false);
  const loaded = useRef(0);
  const started = useRef(false);
  const startTop = useRef(0);
  const total = frames.length + 1; // frames + cover

  const finish = () => {
    delete document.documentElement.dataset.intro;
    setArmed(false);
  };

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "running") return;
    setArmed(true);
    // Window = Figma's 443x603 at 1920 wide, always at exactly that ratio (it used to scale
    // width and height separately, so on non-16:9 screens the pictures came out squashed).
    // Scaled by the screen width; on unusually short screens it shrinks to stay ≤ 75% tall.
    const s = Math.min(innerWidth / 1920, (innerHeight * 0.75) / 603);
    const w = 443 * s;
    const h = 603 * s;
    startTop.current = (h - (COVER_START * w) / coverRatio) / 2; // cover centred vertically, as in frame 1
    setBox({ left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h });
    const bail = setTimeout(finish, 9000); // never trap the visitor behind the intro
    const startAnyway = setTimeout(start, 2500); // slow network: start with what has loaded
    return () => {
      clearTimeout(bail);
      clearTimeout(startAnyway);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function start() {
    if (started.current) return;
    started.current = true;
    const steps = frames.length + 1; // the morph layer is the last step
    for (let i = 0; i < steps; i++) setTimeout(() => setShown(i + 1), 150 + i * STEP_MS);
    setTimeout(expand, 150 + steps * STEP_MS + 350);
  }

  // Grow to exactly the part of the panel that is visible: on short screens (a 13" laptop
  // with browser bars) the panel's bottom is clipped by its column, and growing to the full
  // panel made the picture look like it shrank back when the intro handed over.
  function expand() {
    const panel = target.current;
    if (!panel) return finish();
    const r = panel.getBoundingClientRect();
    const clip = (panel.parentElement ?? panel).getBoundingClientRect();
    const height = Math.min(r.bottom, clip.bottom) - r.top;
    setExpanded(true);
    setBox({ left: r.left, top: r.top, width: r.width, height, transition: `all ${EXPAND_MS}ms ${EASE}` });
    setTimeout(finish, EXPAND_MS + 50);
  }

  const onLoad = () => {
    loaded.current += 1;
    if (loaded.current >= total) start();
  };

  if (!armed && started.current) return null;

  return (
    <div className="intro-overlay fixed inset-0 z-50 overflow-hidden bg-bg" aria-hidden>
      {box && (
        // Once the last frame is in, the box carries its edge colours too, so nothing but the
        // same colour can show through anti-aliased edges while it grows (Dana 26/11).
        <div
          className="absolute overflow-hidden"
          style={{
            ...box,
            ...(shown > frames.length && { background: `linear-gradient(to bottom, ${coverEdges.top} 50%, ${coverEdges.bottom} 50%)` }),
          }}
        >
          {frames.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="30vw"
              priority
              onLoad={onLoad}
              // hidden once the last frame grows: nothing may show through its edges (Dana 26/11: grey seams)
              className={`object-cover ${i < shown && !expanded ? "wipe-up" : "invisible"}`}
              style={{ zIndex: i }}
            />
          ))}

          {/* Frame 1, rebuilt: the real cover centred, the cover's top/bottom edge colours
              filling the window above and below it. */}
          <div
            className={`absolute inset-0 ${shown > frames.length ? "wipe-up" : "invisible"}`}
            style={{
              zIndex: frames.length,
              background: `linear-gradient(to bottom, ${coverEdges.top} 50%, ${coverEdges.bottom} 50%)`,
            }}
          >
            {/* Centred in the small window; while the window grows it slides to the top edge,
                because the panel shows the cover top-aligned (clipped at the bottom on short
                screens). */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: `${(expanded ? 1 : COVER_START) * 100}%`,
                top: expanded ? 0 : startTop.current,
                aspectRatio: String(coverRatio),
                transition: expanded ? `width ${EXPAND_MS}ms ${EASE}, top ${EXPAND_MS}ms ${EASE}` : undefined,
              }}
            >
              {/* same sizes as the panel so this exact file is already cached there */}
              <Image src={cover} alt="" fill sizes="66vw" priority onLoad={onLoad} className="object-cover" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
