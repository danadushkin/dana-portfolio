"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { coverOf, firstRowOf, indexLabel, pairColumns, shortTitle, type Project } from "@/content/projects";
import { Intro } from "./Intro";

export type IntroConfig = {
  frames: string[];
  cover: string;
  coverRatio: number;
  coverEdges: { top: string; bottom: string };
};

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as React.CSSProperties });

// Index list on the left; hovering a row cross-fades the big preview on the right.
// The preview sits exactly where a project page shows its first image, so clicking
// through feels like the page simply opens up around the picture.
export function HomeIndex({
  projects,
  intro,
  contact,
}: {
  projects: Project[];
  intro: IntroConfig;
  contact: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const first = projects.map(coverOf).find(Boolean);
  const ratio = first ? first.w / first.h : 1260 / 861;

  return (
    <div className="flex flex-col gap-10 md:grid md:h-full md:min-h-0 md:grid-cols-[636fr_1260fr] md:gap-0">
      <Intro {...intro} target={panel} />

      <div className="flex min-h-0 flex-col justify-between gap-6">
        {/* Figma: rows are 467 of the column's 636px, and the names start 188px in — i.e.
            exactly under the bio paragraph. */}
        <ol className="uppercase md:w-[73.43%]">
          {projects.map((p, i) => {
            const on = i === active;
            const row = (
              <span
                className={`flex border-b py-[6px] transition-colors duration-300 md:grid md:grid-cols-[40.26%_1fr] ${
                  on ? "border-fg/60 text-fg" : "border-line text-faint"
                }`}
              >
                <span className="w-[32%] shrink-0 md:w-auto">{indexLabel(i)}</span>
                {/* Dana (ref signature-portfolio): the name nudges right on hover — 6px (26/11: a bit more) */}
                <span className="transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[6px]">
                  {p.placeholder ? "Name of Project" : shortTitle(p)}
                </span>
              </span>
            );
            return (
              <li
                key={p.slug}
                {...reveal(6 + i)}
                // placeholder rows have no picture, so they leave the current preview alone
                onMouseEnter={p.placeholder ? undefined : () => setActive(i)}
                onFocus={p.placeholder ? undefined : () => setActive(i)}
              >
                {p.placeholder ? row : <Link href={`/work/${p.slug}`} className="group">{row}</Link>}
              </li>
            );
          })}
        </ol>
        <div className="hidden md:block" {...reveal(6 + projects.length)}>{contact}</div>
      </div>

      {/* Preview = exactly the first image of a project page: full column width at the
          cover's ratio, same top edge. On short screens the bottom is clipped (the
          project page shows the rest as you scroll), so nothing jumps between pages. */}
      {/* Same width cap as the project page's column, so the preview fits the visible height
          and stays identical to the project's first image. */}
      <div className="hidden md:block md:[container-type:size]">
      <div className="relative ml-auto h-full w-[min(100cqw,calc(100cqh*1260/861))] overflow-hidden">
        <div
          ref={panel}
          className="absolute left-0 top-0 w-full overflow-hidden bg-panel"
          style={{ aspectRatio: String(ratio) }}
        >
        {projects.map((p, i) => {
          const row = firstRowOf(p);
          if (!row.length) return null;
          return (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              tabIndex={-1}
              aria-hidden={i !== active}
              className={`zoom absolute inset-0 transition-opacity duration-700 ease-out ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {row.length === 1 ? (
                <Image src={row[0].src} alt={p.title} fill sizes="66vw" priority={i === 0} className="object-cover" />
              ) : (
                // A pair, laid out exactly like the project page's first row (same gap, each
                // at its own ratio); anything below the panel is clipped like a tall cover.
                <div className="grid items-start gap-[clamp(8px,0.83vw,16px)]" style={{ gridTemplateColumns: pairColumns(row) }}>
                  {row.map((m) => (
                    <div key={m.src} className="zoom relative w-full overflow-hidden bg-panel" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
                      <Image src={m.src} alt={p.title} fill sizes="33vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
        </div>
      </div>

      </div>

      {/* Mobile: covers stacked under the list */}
      <div className="flex flex-col gap-8 md:hidden">
        {projects
          .filter((p) => !p.placeholder)
          .map((p) => {
            const cover = coverOf(p)!;
            return (
              <Link key={p.slug} href={`/work/${p.slug}`} className="block">
                <Image src={cover.src} alt={p.title} width={cover.w} height={cover.h} sizes="100vw" className="h-auto w-full" />
                <span className="mt-2 block uppercase">{shortTitle(p)}</span>
              </Link>
            );
          })}
        {contact}
      </div>
    </div>
  );
}
