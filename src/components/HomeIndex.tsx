"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { indexLabel, mediaOf, type Project } from "@/content/projects";
import { Intro } from "./Intro";

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as React.CSSProperties });

// Tells the project page it was entered from the index, so it plays the slide-in.
// (sessionStorage only carries this one-shot flag between pages.)
const markFromIndex = () => {
  try {
    sessionStorage.setItem("fromIndex", "1");
  } catch {}
};

// Index list on the left; hovering a row cross-fades the big preview on the right.
export function HomeIndex({
  projects,
  introImages,
  contact,
}: {
  projects: Project[];
  introImages: string[];
  contact: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col gap-10 md:grid md:h-full md:min-h-0 md:grid-cols-[33.7fr_66.3fr] md:gap-0">
      <Intro images={introImages} target={panel} />

      <div className="flex flex-col justify-between gap-12 md:pr-[8%]">
        <ol className="uppercase">
          {projects.map((p, i) => {
            const on = i === active;
            const row = (
              <span
                className={`flex border-b py-[6px] transition-colors duration-300 md:grid md:grid-cols-[10.4fr_23.3fr] ${
                  on ? "border-fg/60 text-fg" : "border-line text-faint"
                }`}
              >
                <span className="w-[32%] shrink-0 md:w-auto">{indexLabel(i)}</span>
                <span>{p.placeholder ? "Name of Project" : p.title}</span>
              </span>
            );
            return (
              <li key={p.slug} {...reveal(6 + i)} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                {p.placeholder ? row : <Link href={`/work/${p.slug}`} onClick={markFromIndex}>{row}</Link>}
              </li>
            );
          })}
        </ol>
        <div className="hidden md:block" {...reveal(6 + projects.length)}>{contact}</div>
      </div>

      {/* Preview locked to 1260×850 (Dana's cover size) so covers are never cropped:
          as wide as the column allows, unless the height runs out first. */}
      <div className="relative hidden [container-type:size] md:block">
        <div
          ref={panel}
          className="absolute left-0 top-0 aspect-[1260/850] w-[min(100cqw,calc(100cqh*1260/850))] bg-panel"
        >
        {projects.map((p, i) => {
          const cover = mediaOf(p)[0];
          if (!cover) return null;
          return (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              onClick={markFromIndex}
              tabIndex={-1}
              aria-hidden={i !== active}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image src={cover.src} alt={p.title} fill sizes="66vw" priority={i === 0} className="object-cover" />
            </Link>
          );
        })}
        </div>
      </div>

      {/* Mobile: covers stacked under the list */}
      <div className="flex flex-col gap-8 md:hidden">
        {projects
          .filter((p) => !p.placeholder)
          .map((p) => {
            const cover = mediaOf(p)[0];
            return (
              <Link key={p.slug} href={`/work/${p.slug}`} className="block">
                <Image src={cover.src} alt={p.title} width={cover.w} height={cover.h} sizes="100vw" className="h-auto w-full" />
                <span className="mt-2 block uppercase">{p.title}</span>
              </Link>
            );
          })}
        {contact}
      </div>
    </div>
  );
}
