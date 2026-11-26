import type { Metadata } from "next";
import Link from "next/link";
import { ContactBlock, MobileFooter } from "@/components/ContactBlock";
import { ContactForm } from "@/components/ContactForm";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {};

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

// Figma frames 929:100785 / 942:162874 (24/11): CONTACT | BACK TO INDEX in the bar, "Get In
// Touch" as a heading at the left, the form starting on the ABOUT column, contact details
// pinned bottom-left.
export default function Contact() {
  const sub = (
    <div className="enter flex justify-between" style={enter(0)}>
      <span>Contact</span>
      <Link href="/" className="hover:text-muted">Back to index</Link>
    </div>
  );
  return (
    <Shell sub={sub}>
      {/* Phones (Figma 977:19136): heading, form, links + BACK TO INDEX at the bottom */}
      <div className="flex flex-1 flex-col justify-between gap-6 md:h-full md:gap-16 md:pt-[33px]">
        <div className="flex flex-col gap-[42px] md:cols md:gap-0">
          <h1 className="enter text-[26px] leading-[1.2] tracking-[-0.015em] md:col-span-2" style={enter(1)}>
            Get In Touch
          </h1>
          <div className="enter md:col-span-3" style={enter(2)}>
            <ContactForm />
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
