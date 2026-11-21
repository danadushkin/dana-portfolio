import Link from "next/link";
import Image from "next/image";
import { projects } from "@/content/projects";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <section className="py-16 sm:py-24">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          {site.role}. {site.tagline}
        </h1>
      </section>

      <section className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.slug} href={`/work/${p.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200">
              {p.cover && (
                <Image
                  src={p.cover}
                  alt={p.title}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <h2 className="font-medium">{p.title}</h2>
              <span className="text-sm opacity-60">{p.disciplines.join(" · ")}</span>
            </div>
            <p className="mt-1 text-sm opacity-70">{p.summary}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
