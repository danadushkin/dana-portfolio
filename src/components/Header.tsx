import Link from "next/link";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { ThemeToggle } from "./ThemeToggle";

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as React.CSSProperties });

export function Header({ current }: { current?: number }) {
  const total = String(projects.length).padStart(2, "0");
  const now = String((current ?? 0) + 1).padStart(2, "0");
  return (
    <header className="border-t border-line pt-4 md:pt-6">
      <div className="flex flex-wrap items-start justify-between gap-y-3 uppercase md:cols md:gap-y-0">
        <Link href="/" className="leading-tight" {...reveal(0)}>
          {site.name}
          <span className="block text-muted">{site.role}</span>
        </Link>
        {/* 254px = the bio text box in Figma, so it wraps exactly like the design */}
        <p className="hidden w-[254px] normal-case leading-[15.2px] text-muted md:block" {...reveal(1)}>
          {site.bio}
        </p>
        <nav className="flex gap-6 md:contents">
          <Link href="/about" className="hover:text-muted" {...reveal(2)}>About</Link>
          <Link href="/contact" className="hover:text-muted" {...reveal(3)}>Contact</Link>
          {/* Last column: INDEX + counter on the left, the Light/Dark switch at the far right */}
          <span className="flex items-start justify-between gap-6" {...reveal(4)}>
            <span className="flex gap-2">
              <Link href="/" className="hover:text-muted">Index</Link>
              <span className="text-muted">
                {now} - {total}
              </span>
            </span>
            <span className="hidden normal-case text-muted md:block">
              <ThemeToggle />
            </span>
          </span>
        </nav>
      </div>
    </header>
  );
}
