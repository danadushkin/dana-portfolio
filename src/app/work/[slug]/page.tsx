import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject, projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();

  return (
    <article className="py-12">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{p.title}</h1>
      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-2 text-sm">
        {p.client && (
          <div><dt className="opacity-60">Client</dt><dd>{p.client}</dd></div>
        )}
        <div><dt className="opacity-60">Year</dt><dd>{p.year}</dd></div>
        <div><dt className="opacity-60">Disciplines</dt><dd>{p.disciplines.join(", ")}</dd></div>
      </dl>
      <div className="mt-8 max-w-2xl space-y-4 leading-relaxed">
        {p.description.map((para, i) => <p key={i}>{para}</p>)}
      </div>

      <div className="mt-14 space-y-8">
        {p.images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${p.title} — image ${i + 1}`}
            width={2400}
            height={1600}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="h-auto w-full"
            priority={i === 0}
          />
        ))}
      </div>

      <Link href="/" className="mt-16 inline-block text-sm hover:opacity-60">← All work</Link>
    </article>
  );
}
