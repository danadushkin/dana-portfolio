import Link from "next/link";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

const reveal = (i: number) => ({ "data-reveal": "", style: { "--i": i } as React.CSSProperties });

export function Header({ current }: { current?: number }) {
  const total = String(projects.length).padStart(2, "0");
  const now = String((current ?? 0) + 1).padStart(2, "0");
  return (
    <header className="border-t border-line pt-4 md:pt-5">
      <div className="flex items-start justify-between uppercase md:cols">
        <Link href="/" className="mobile-name" {...reveal(0)}>
          {site.name}
          <span className="block text-muted">{site.role}</span>
        </Link>
        {/* 254px = the bio text box in Figma, so it wraps exactly like the design */}
        <p className="hidden w-[254px] normal-case leading-[15.2px] text-muted md:block" {...reveal(1)}>
          {site.bio}
        </p>
        {/* Phones (Figma mobile frames): just INDEX and MENU on the right */}
        <div className="flex gap-[26px] md:hidden">
          <Link href="/">Index</Link>
          <MobileMenu />
        </div>
        <nav className="hidden md:contents">
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
