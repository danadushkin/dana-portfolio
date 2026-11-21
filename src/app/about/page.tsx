import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <section className="max-w-2xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">About</h1>
      <div className="mt-8 space-y-4 text-lg leading-relaxed">
        {site.about.map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <p className="mt-10">
        <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:opacity-60">
          {site.email}
        </a>
      </p>
    </section>
  );
}
