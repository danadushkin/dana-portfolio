"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HOME_TOP_KEY } from "./HomeTopLink";
import { coverOf, firstRowOf, homeCoverOf, indexLabel, pairColumns, shortTitle, type Project } from "@/content/projects";
import { HomeCoverVideo } from "./CoverClip";
import { Intro } from "./Intro";
import { BackToTop } from "./BackToTop";
import { ContactLinks } from "./ContactBlock";
import { site } from "@/content/site";

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

  // Arriving via "Back to index" (phones): start at the very top, whatever the browser restored.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(HOME_TOP_KEY)) {
        sessionStorage.removeItem(HOME_TOP_KEY);
        window.scrollTo(0, 0);
        requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    } catch {}
  }, []);
  const panel = useRef<HTMLDivElement>(null);
  const mobilePanel = useRef<HTMLSpanElement>(null); // phones: the intro grows into the first cover
  const first = projects.map(coverOf).find(Boolean);
  const firstReal = projects.find((p) => !p.placeholder);
  const ratio = first ? first.w / first.h : 1260 / 861;

  return (
    <div className="flex flex-col md:grid md:h-full md:min-h-0 md:grid-cols-[636fr_1260fr]">
      <Intro {...intro} target={panel} mobileTarget={mobilePanel} />

      <div className="flex min-h-0 flex-col justify-between gap-6">
        {/* Phones: the bio sits here, between the header and the list (Figma 969:2221) */}
        <p className="-mb-6 w-[214px] pb-[41px] leading-[15.2px] text-muted md:hidden">{site.bio}</p>
        {/* Figma: rows are 467 of the column's 636px, and the names start 188px in — i.e.
            exactly under the bio paragraph. */}
        <ol className="uppercase md:w-[73.43%]">
          {projects.map((p, i) => {
            const on = i === active;
            const row = (
              <span
                className={`index-row flex justify-between border-b transition-colors duration-300 md:grid md:grid-cols-[40.26%_1fr] md:justify-normal ${
                  on ? "border-line text-fg md:border-fg/60" : "border-line text-fg md:text-faint"
                }`}
              >
                <span>{indexLabel(i)}</span>
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
              {homeCoverOf(p) ? (
                // Dana 27/11: this project's home cover is a clip (its first frame underneath)
                <>
                  <Image src={homeCoverOf(p)!.poster} alt={p.title} fill sizes="66vw" priority={i === 0} className="object-cover" />
                  <HomeCoverVideo cover={homeCoverOf(p)!} slug={p.slug} label={p.title} active={i === active} />
                </>
              ) : row.length === 1 ? (
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

      {/* Phones (Figma 969:2221): each project's first row of pictures, then a number / name
          row like the index; contact links and BACK TO TOP at the bottom. */}
      <div className="md:hidden">
        <div className="mt-[15px] flex flex-col gap-[39px]">
          {projects
            .filter((p) => !p.placeholder)
            .map((p) => {
              const row = firstRowOf(p);
              return (
                <Link key={p.slug} href={`/work/${p.slug}`} className="block uppercase">
                  {homeCoverOf(p) ? (
                    <span ref={p === firstReal ? mobilePanel : undefined} className="relative block w-full bg-panel" style={{ aspectRatio: `${row[0].w} / ${row[0].h}` }}>
                      <Image src={homeCoverOf(p)!.poster} alt={p.title} fill sizes="100vw" className="object-cover" />
                      <HomeCoverVideo cover={homeCoverOf(p)!} slug={p.slug} label={p.title} />
                    </span>
                  ) : row.length === 1 ? (
                    <Image src={row[0].src} alt={p.title} width={row[0].w} height={row[0].h} sizes="100vw" className="h-auto w-full bg-panel" />
                  ) : (
                    <span className="grid gap-[6px]" style={{ gridTemplateColumns: pairColumns(row) }}>
                      {row.map((m) => (
                        <Image key={m.src} src={m.src} alt={p.title} width={m.w} height={m.h} sizes="50vw" className="h-auto w-full bg-panel" />
                      ))}
                    </span>
                  )}
                  <span className="index-row flex justify-between border-b border-line" style={{ paddingTop: 11, paddingBottom: 11 }}>
                    <span>{indexLabel(projects.indexOf(p))}</span>
                    <span>{shortTitle(p)}</span>
                  </span>
                </Link>
              );
            })}
        </div>
        <div className="mt-[43px] flex items-end justify-between text-muted">
          <ContactLinks />
          <BackToTop className="text-[12px] uppercase leading-[15.2px] text-fg" />
        </div>
      </div>
    </div>
  );
}
