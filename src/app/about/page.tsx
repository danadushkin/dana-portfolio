import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactBlock, MobileFooter } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import { asset } from "@/content/assets";
import media from "@/content/media.json";
import { site } from "@/content/site";

export const metadata: Metadata = {};

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

// Figma frame 929:100155, drawn at 1920px wide. On desktop the paragraph scales with the
// screen (26px / 696px at 1920 → 1.354vw / 36.25vw) so on a 13" laptop it keeps the same
// proportions to the portrait instead of crowding it (Dana's note).
export default function About() {
  const size = (media as Record<string, { w: number; h: number }>)[site.portrait];
  const sub = (
    <div className="enter flex justify-between" style={enter(0)}>
      <span>About</span>
      <Link href="/" className="hover:text-muted">Back to index</Link>
    </div>
  );
  return (
    <Shell sub={sub}>
      {/* Phones (Figma 977:19091): 18px text, the portrait below, links + BACK TO INDEX at the bottom */}
      <div className="flex flex-1 flex-col justify-between gap-6 md:h-full md:gap-16 md:pt-[33px]">
        <div className="flex flex-col gap-[39px] md:cols md:gap-0">
          <div
            className="enter max-w-[308px] space-y-[19.6px] text-[18px] leading-[19.6px] tracking-[-0.4px] md:col-span-3 md:max-w-[36.25vw] md:space-y-[1.2em] md:text-[1.354vw] md:leading-[1.22] md:tracking-[-0.015em]"
            style={enter(1)}
          >
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
              className="h-auto w-[122px] md:w-[9.17vw]"
            />
          </div>
        </div>
        <div className="enter hidden md:block" style={enter(3)}>
          <ContactBlock />
        </div>
        <MobileFooter>
          <Link href="/">Back to index</Link>
        </MobileFooter>
      </div>
    </Shell>
  );
}
