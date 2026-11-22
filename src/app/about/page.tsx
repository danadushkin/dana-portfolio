import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactBlock } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import { asset } from "@/content/assets";
import media from "@/content/media.json";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

// Figma frame 929:100155: text (26px) at the left, portrait starting on the CONTACT column,
// contact details pinned bottom-left like the home page.
export default function About() {
  const size = (media as Record<string, { w: number; h: number }>)[site.portrait];
  const sub = (
    <div className="enter flex justify-between" style={enter(0)}>
      <span>About</span>
      <Link href="/contact" className="hover:text-muted">Get in touch</Link>
    </div>
  );
  return (
    <Shell sub={sub}>
      <div className="flex h-full flex-col justify-between gap-16 md:pt-[33px]">
        <div className="flex flex-col gap-10 md:cols md:gap-0">
          <div className="enter space-y-[1.2em] text-[20px] leading-[1.22] md:col-span-3 md:max-w-[696px] md:text-[26px] md:tracking-[-0.015em]" style={enter(1)}>
            {site.about.map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para}</p>
            ))}
          </div>
          <div className="enter md:col-span-2" style={enter(2)}>
            <Image
              src={asset(site.portrait)}
              alt={site.name}
              width={size.w}
              height={size.h}
              sizes="(min-width: 768px) 10vw, 40vw"
              priority
              className="h-auto w-[40vw] md:w-[9.17vw]"
            />
          </div>
        </div>
        <div className="enter" style={enter(3)}>
          <ContactBlock />
        </div>
      </div>
    </Shell>
  );
}
