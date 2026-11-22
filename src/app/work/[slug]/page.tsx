import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SmoothColumn } from "@/components/SmoothColumn";
import { BackToTop } from "@/components/BackToTop";
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
      {m.video && <LoopVideo src={m.video} poster={m.src} label={label} />}
    </div>
  );
}

function Rows({ p }: { p: Project }) {
  let n = 0;
  return p.rows.map((row, r) => {
    if (Array.isArray(row)) {
      return (
        <div key={r} className="grid grid-cols-2 gap-[var(--gap)]">
          {row.map((src) => (
            <Tile key={src} m={mediaItem(p, src)} label={`${p.title} — ${++n}`} sizes="(min-width: 768px) 33vw, 50vw" />
          ))}
        </div>
      );
    }
    return <Tile key={r} m={mediaItem(p, row)} label={`${p.title} — ${++n}`} sizes="(min-width: 768px) 66vw, 100vw" priority={r === 0} />;
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const next = nextProject(p.slug);

  const sub = (
    <div className="fade-in flex flex-wrap justify-between gap-x-6 gap-y-1 md:cols md:gap-0">
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
        <aside className="fade-in flex flex-col justify-between gap-12 md:h-full md:pr-[4%] md:pt-[50px]">
          <div className="max-w-[420px]">
            <h1 className="text-[26px] leading-[1.1] tracking-[-0.015em]">{p.title}</h1>
            <div className="mt-6 space-y-4">
              {p.description.map((para, i) => (
                <Para key={i} p={para} />
              ))}
            </div>
            <p className="mt-6 text-muted">{p.tags.join(", ")}</p>
          </div>
          <dl className="grid w-fit grid-cols-[86px_1fr] gap-y-[6px]">
            {p.meta.map((m) => (
              <div key={m.label} className="contents">
                <dt className="text-muted">{m.label}</dt>
                <dd>{Array.isArray(m.value) ? m.value.map((v) => <span key={v} className="block">{v}</span>) : m.value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <SmoothColumn>
          <Rows p={p} />
          <BackToTop />
        </SmoothColumn>
      </div>
    </Shell>
  );
}
