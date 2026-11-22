"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STEP_MS = 650; // time each frame holds before the next wipes over it
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
  const total = frames.length + 1; // frames + cover

  const finish = () => {
    delete document.documentElement.dataset.intro;
    setArmed(false);
  };

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "running") return;
    setArmed(true);
    const w = innerWidth * (443 / 1920);
    const h = innerHeight * (603 / 1080);
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

  function expand() {
    const r = target.current?.getBoundingClientRect();
    if (!r) return finish();
    setExpanded(true);
    setBox({ left: r.left, top: r.top, width: r.width, height: r.height, transition: `all ${EXPAND_MS}ms ${EASE}` });
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
        <div className="absolute overflow-hidden" style={box}>
          {frames.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="30vw"
              priority
              onLoad={onLoad}
              className={`object-cover ${i < shown ? "wipe-up" : "invisible"}`}
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
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${(expanded ? 1 : COVER_START) * 100}%`,
                aspectRatio: String(coverRatio),
                transition: expanded ? `width ${EXPAND_MS}ms ${EASE}` : undefined,
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
