"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { coverOf, indexLabel, type Project } from "@/content/projects";
import { Intro } from "./Intro";

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as React.CSSProperties });

// Index list on the left; hovering a row cross-fades the big preview on the right.
// The preview sits exactly where a project page shows its first image, so clicking
// through feels like the page simply opens up around the picture.
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
  const first = projects.map(coverOf).find(Boolean);
  const ratio = first ? first.w / first.h : 1260 / 861;

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
              <li
                key={p.slug}
                {...reveal(6 + i)}
                // placeholder rows have no picture, so they leave the current preview alone
                onMouseEnter={p.placeholder ? undefined : () => setActive(i)}
                onFocus={p.placeholder ? undefined : () => setActive(i)}
              >
                {p.placeholder ? row : <Link href={`/work/${p.slug}`}>{row}</Link>}
              </li>
            );
          })}
        </ol>
        <div className="hidden md:block" {...reveal(6 + projects.length)}>{contact}</div>
      </div>

      {/* Preview = exactly the first image of a project page: full column width at the
          cover's ratio, same top edge. On short screens the bottom is clipped (the
          project page shows the rest as you scroll), so nothing jumps between pages. */}
      <div className="relative hidden overflow-hidden md:block">
        <div
          ref={panel}
          className="absolute left-0 top-0 w-full bg-panel"
          style={{ aspectRatio: String(ratio) }}
        >
        {projects.map((p, i) => {
          const cover = coverOf(p);
          if (!cover) return null;
          return (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
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
            const cover = coverOf(p)!;
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
