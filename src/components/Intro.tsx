"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STEP_MS = 650; // time each image holds before the next wipes over it
const EXPAND_MS = 1100;

/**
 * Home intro: a small centered window shows Dana's "opening frames" one after
 * another, lands on the first project's cover, then grows into the 1260×850
 * preview panel and hands over to the page. Armed by the inline script in layout.tsx.
 */
export function Intro({ images, target }: { images: string[]; target: React.RefObject<HTMLDivElement | null> }) {
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(0); // how many images have wiped in
  const [box, setBox] = useState<React.CSSProperties | null>(null);
  const loaded = useRef(0);
  const started = useRef(false);

  const finish = () => {
    delete document.documentElement.dataset.intro;
    setArmed(false);
  };

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "running") return;
    setArmed(true);
    const w = innerWidth * 0.231;
    const h = innerHeight * 0.56;
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
    images.forEach((_, i) => setTimeout(() => setShown(i + 1), 150 + i * STEP_MS));
    setTimeout(expand, 150 + images.length * STEP_MS + 350);
  }

  function expand() {
    const r = target.current?.getBoundingClientRect();
    if (!r) return finish();
    setBox({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      transition: `all ${EXPAND_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
    });
    setTimeout(finish, EXPAND_MS + 50);
  }

  const onLoad = () => {
    loaded.current += 1;
    if (loaded.current >= images.length) start();
  };

  if (!armed && started.current) return null;

  return (
    <div className="intro-overlay fixed inset-0 z-50 bg-bg" aria-hidden>
      {box && (
        <div className="absolute overflow-hidden" style={box}>
          {images.map((src, i) => (
            <Image
              key={src + i}
              src={src}
              alt=""
              fill
              // the last image is the home cover: same sizes as the panel so it's already cached there
              sizes={i === images.length - 1 ? "66vw" : "30vw"}
              priority
              onLoad={onLoad}
              className={`object-cover ${i < shown ? "wipe-up" : "invisible"}`}
              style={{ zIndex: i }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
