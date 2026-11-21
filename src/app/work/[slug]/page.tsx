import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HorizontalTrack } from "@/components/HorizontalTrack";
import { LoopVideo } from "@/components/LoopVideo";
import { Shell } from "@/components/Shell";
import { getProject, mediaOf, nextProject, projects, realProjects, type Paragraph } from "@/content/projects";

export function generateStaticParams() {
  return realProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.summary } : {};
}

function Para({ p }: { p: Paragraph }) {
  if (typeof p === "string") return <p>{p}</p>;
  return (
    <p>
      {p.map((part, i) =>
        part.href ? (
          <a key={i} href={part.href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">
            {part.text}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const next = nextProject(p.slug);
  const [cover, ...rest] = mediaOf(p);

  const sub = (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 md:cols">
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
      <HorizontalTrack>
        {cover && (
          <div className="relative aspect-[3/2] shrink-0 bg-panel md:aspect-auto md:h-full md:w-[33.2vw]">
            <Image src={cover.src} alt={p.title} fill priority sizes="(min-width: 768px) 34vw, 100vw" className="object-cover" />
          </div>
        )}

        {/* Info panel */}
        <section className="flex shrink-0 flex-col py-6 md:h-full md:w-[52vw] md:py-0">
          <div className="grid gap-8 border-line pb-10 md:grid-cols-[1fr_auto] md:gap-12 md:border-b md:px-[3vw] md:pt-8">
            <div className="max-w-[440px]">
              <h1 className="text-[26px] leading-[1.1] tracking-[-0.015em]">{p.title}</h1>
              <p className="mt-6">{p.summary}</p>
              <p className="mt-5 text-muted">{p.tags.join(", ")}</p>
            </div>
            <dl className="grid h-fit grid-cols-[64px_1fr] gap-x-6 gap-y-[6px] md:mt-[50px] md:w-[13vw]">
              {p.meta.map((m) => (
                <div key={m.label} className="contents">
                  <dt className="text-muted">{m.label}</dt>
                  <dd>{Array.isArray(m.value) ? m.value.map((v) => <span key={v} className="block">{v}</span>) : m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-5 pt-8 text-muted md:max-w-[480px] md:px-[3vw] md:pt-10">
            {p.sections.map((s) => (
              <div key={s.heading} className="space-y-4">
                <h2>{s.heading}</h2>
                {s.body.map((para, i) => <Para key={i} p={para} />)}
              </div>
            ))}
          </div>
        </section>

        {rest.map((m, i) => (
          <div key={m.src} className="relative shrink-0 md:h-full" style={{ aspectRatio: `${m.w} / ${m.h}` }}>
            <Image
              src={m.src}
              alt={`${p.title} — ${i + 2}`}
              fill
              sizes={`(min-width: 768px) ${Math.round((m.w / m.h) * 80)}vh, 100vw`}
              className="object-cover"
            />
            {m.video && <LoopVideo src={m.video} poster={m.src} label={`${p.title} — ${i + 2}`} />}
          </div>
        ))}
      </HorizontalTrack>
    </Shell>
  );
}
