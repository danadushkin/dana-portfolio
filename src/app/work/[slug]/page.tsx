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
  projects,
  realProjects,
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
  return p ? { title: p.title, description: text } : {};
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
    <div className="relative w-full bg-panel" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
      <Image src={m.src} alt={label} fill sizes={sizes} priority={priority} className="object-cover" />
      {m.video && <LoopVideo src={m.video} poster={m.poster ?? m.src} label={label} />}
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
      return (
        <div key={r} style={anim.style} className={`grid grid-cols-2 gap-[var(--gap)] ${anim.className ?? ""}`}>
          {row.map((src) => (
            <Tile key={src} m={mediaItem(p, src)} label={`${p.title} — ${++n}`} sizes="(min-width: 768px) 33vw, 50vw" />
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
        Next <span className="text-muted group-hover:text-fg">{next.title}</span>
      </Link>
      <span className="hidden md:block">{p.title}</span>
      <span className="hidden md:block" />
      <span className="hidden text-right md:block">{p.year}</span>
    </div>
  );

  return (
    <Shell current={projects.indexOf(p)} sub={sub}>
      <div
        className="flex flex-col gap-10 md:grid md:h-full md:min-h-0 md:grid-cols-[33.7fr_66.3fr] md:gap-0"
        style={{ "--gap": "clamp(8px, 0.83vw, 16px)" } as React.CSSProperties}
      >
        {/* Info — stays put on desktop while the column on the right scrolls */}
        <aside className="flex flex-col justify-between gap-12 md:h-full md:pr-[4%] md:pt-[50px]">
          <div className="max-w-[420px]">
            <h1 className="enter-mask text-[26px] leading-[1.1] tracking-[-0.015em]" style={{ "--i": 1 } as React.CSSProperties}>
              <span>{p.title}</span>
            </h1>
            <div className="enter mt-6 space-y-4" style={enter(2).style}>
              {p.description.map((para, i) => (
                <Para key={i} p={para} />
              ))}
            </div>
            <p className="enter mt-6 text-muted" style={enter(3).style}>{p.tags.join(", ")}</p>
          </div>
          <div {...enter(4)}>
            <Credits meta={p.meta} />
          </div>
        </aside>

        <SmoothColumn>
          <Rows p={p} />
          <BackToTop />
        </SmoothColumn>
      </div>
    </Shell>
  );
}
