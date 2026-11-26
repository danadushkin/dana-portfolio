import Link from "next/link";
import { site } from "@/content/site";
import { TlvClock } from "./TlvClock";

// Bottom-left contact details (Figma, 1920 frames: line, then Email / Linkedin / Resume /
// Phone on a 33px rhythm, then the TLV clock and the call to action). Spacing tightens on
// short screens so the page always fits without scrolling.
const CTA_LINK = "let's get in touch";

/** Email / Linkedin / Resume / Phone with the nudging arrow. Phones: 33px rhythm (Figma). */
export function ContactLinks({ className = "space-y-[18px]" }: { className?: string }) {
  return (
    <ul className={`leading-[15.2px] tracking-normal ${className}`}>
      {site.contact.map((c) => (
        <li key={c.label}>
          <a
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="group hover:text-fg"
          >
            {c.label}{" "}
            {/* the arrow nudges up-right on hover */}
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
            >
              ↗
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Phones (Figma mobile frames): contact links at the bottom left, one action on the right. */
export function MobileFooter({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-auto flex items-end justify-between pt-8 text-muted md:hidden">
      <ContactLinks />
      <span className="text-[12px] uppercase leading-[15.2px] text-fg">{children}</span>
    </div>
  );
}

export function ContactBlock() {
  return (
    // bottom margin: in Figma the text ends 35px above the frame's edge (main adds 12)
    <div className="w-full max-w-[240px] text-muted md:pb-[clamp(0px,2.1vh,23px)]">
      <ContactLinks className="space-y-[clamp(8px,1.7vh,18px)] border-t border-line pt-[clamp(10px,1.8vh,19px)]" />
      <p className="mt-[clamp(18px,6.1vh,66px)]">
        <TlvClock /> in TLV
      </p>
      {/* 222px wide, no tracking: the text box in Figma, so it breaks after "more info" */}
      <p className="mt-4 w-[222px] leading-[15.2px] tracking-normal">
        {/* Dana 25/11: "let's get in touch" is clickable */}
        {site.cta.split(CTA_LINK)[0]}
        <Link href="/contact" className="underline-offset-2 hover:underline">
          {CTA_LINK}
        </Link>
        {site.cta.split(CTA_LINK)[1]}
      </p>
    </div>
  );
}
