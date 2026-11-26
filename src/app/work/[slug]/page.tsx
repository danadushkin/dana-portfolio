import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SmoothColumn } from "@/components/SmoothColumn";
import { BackToTop } from "@/components/BackToTop";
import { Credits } from "@/components/Credits";
import { LoopVideo } from "@/components/LoopVideo";
import { Shell } from "@/components/Shell";
import {
  getProject,
  mediaItem,
  nextProject,
  pairColumns,
  projects,
  realProjects,
  shortTitle,
  type Media,
  type Paragraph,
  type Project,
} from "@/content/projects";

export function generateStaticParams() {
  return realProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  const first = p?.description[0];
  const text = typeof first === "string" ? first : first?.map((x) => x.text).join("");
  return p ? { description: text } : {}; // tab title stays "Dana Dushkin" (Dana)
}

function Para({ p }: { p: Paragraph }) {
  if (typeof p === "string") return <p className="whitespace-pre-line">{p}</p>;
  return (
    <p className="whitespace-pre-line">
      {p.map((part, i) =>
        part.href ? (
          <a key={i} href={part.href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-muted">
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

// One picture (or looping clip) at its own aspect ratio, so nothing is cropped.
function Tile({ m, label, sizes, priority }: { m: Media; label: string; sizes: string; priority?: boolean }) {
  return (
    <div className="relative w-full overflow-hidden bg-panel" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
      {/* eager, not lazy: rules out native lazy-loading inside the custom scroll column as a
          cause of "an image never appeared on some computers" (the images are small WebPs) */}
      <Image src={m.src} alt={label} fill sizes={sizes} {...(priority ? { priority: true } : { loading: "eager" as const })} className="object-cover" />
      {m.video && <LoopVideo src={m.video} poster={m.poster ?? m.src} label={label} sound={m.sound} />}
    </div>
  );
}

// The first row stays still (it's where the home preview was); later rows rise in.
const enter = (i: number) => ({ className: "enter", style: { "--i": i } as React.CSSProperties });

function Rows({ p }: { p: Project }) {
  let n = 0;
  return p.rows.map((row, r) => {
    const anim: { className?: string; style?: React.CSSProperties } = r === 0 ? {} : enter(3 + r);
    if (Array.isArray(row)) {
      // Column widths follow the two images' widths, so equal pairs split 50/50 and Dana's
      // uneven pairs (412 + 834) keep their proportions, both at the same height.
      const ms = row.map((src) => mediaItem(p, src));
      return (
        <div
          key={r}
          style={{ ...anim.style, gridTemplateColumns: pairColumns(ms) }}
          className={`grid gap-[var(--gap)] ${anim.className ?? ""}`}
        >
          {ms.map((m) => (
            <Tile key={m.src} m={m} label={`${p.title} — ${++n}`} sizes={`(min-width: 768px) ${Math.round((66 * m.w) / (ms[0].w + ms[1].w))}vw, 50vw`} />
          ))}
        </div>
      );
    }
    return (
      <div key={r} {...anim}>
        <Tile m={mediaItem(p, row)} label={`${p.title} — ${++n}`} sizes="(min-width: 768px) 66vw, 100vw" priority={r === 0} />
      </div>
    );
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const next = nextProject(p.slug);

  const sub = (
    <div className="enter flex flex-wrap justify-between gap-x-6 gap-y-1 md:cols md:gap-0" style={{ "--i": 0 } as React.CSSProperties}>
      <Link href="/" className="hover:text-muted">Back to index</Link>
      <Link href={`/work/${next.slug}`} className="group">
        Next <span className="text-muted group-hover:text-fg">{shortTitle(next)}</span>
      </Link>
      <span className="hidden md:block">{shortTitle(p)}</span>
      <span className="hidden md:block" />
      <span className="hidden text-right md:block">{p.year}</span>
    </div>
  );

  return (
    <Shell current={projects.indexOf(p)} sub={sub}>
      <div
        className="flex flex-col gap-8 [--gap:4px] md:grid md:h-full md:min-h-0 md:grid-cols-[636fr_1260fr] md:gap-0 md:[--gap:clamp(8px,0.83vw,16px)] md:[container-type:size]"
      >
        {/* Info — stays put on desktop while the column on the right scrolls */}
        {/* Phones (Figma 970:17934): title, text, tags, credits, then a line and the pictures */}
        <aside className="flex flex-col justify-between gap-[22px] border-b border-line pb-[28px] md:h-full md:gap-12 md:border-0 md:pb-0 md:pr-[4%] md:pt-[52px]">
          {/* Description and tags keep Figma's text-box widths; if the column is narrower than
              the box (small laptops), text and box shrink together so the lines still break
              exactly as in the design. */}
          <div className="md:[container-type:inline-size]">
            <h1 className="enter-mask text-[26px] leading-[1.1] tracking-[-0.015em]" style={{ "--i": 1 } as React.CSSProperties}>
              <span>{p.title}</span>
            </h1>
            <div className="enter fit-box mt-6 max-w-[330px] space-y-[1.4em] md:max-w-none" style={{ ...enter(2).style, "--box": p.textWidth ?? 402, "--ls": p.tracking ?? -0.2 } as React.CSSProperties}>
              {p.description.map((para, i) => (
                <Para key={i} p={para} />
              ))}
            </div>
            {p.tags.length > 0 && (
              <p className="enter fit-box mt-6 max-w-[284px] text-muted md:max-w-none" style={{ ...enter(3).style, "--box": p.tagsWidth ?? 410, "--ls": p.tracking ?? -0.2 } as React.CSSProperties}>
                {p.tags.join(", ")}
              </p>
            )}
          </div>
          <div {...enter(4)}>
            <Credits meta={p.meta} />
          </div>
        </aside>

        {/* Dana 25/11: a full 1260x861 image must always fit the visible height (short
            screens, bookmarks bar...), so the column narrows proportionally when needed —
            keeping its right edge on the year, as in the design. */}
        <SmoothColumn className="md:w-[min(100%,calc(100cqh*1260/861))] md:justify-self-end">
          <Rows p={p} />
          <BackToTop />
        </SmoothColumn>
      </div>
    </Shell>
  );
}
