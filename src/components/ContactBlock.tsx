import { site } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";
import { TlvClock } from "./TlvClock";

// Bottom-left contact details (Figma, 1920 frames: line, then Email / Linkedin / Resume /
// Phone on a 33px rhythm, then the TLV clock and the call to action). Spacing tightens on
// short screens so the page always fits without scrolling.
export function ContactBlock() {
  return (
    <div className="w-full max-w-[240px] text-muted">
      <ul className="space-y-[clamp(8px,1.7vh,18px)] border-t border-line pt-[clamp(10px,1.8vh,19px)]">
        {site.contact.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
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
      <p className="mt-[clamp(18px,6.1vh,66px)]">
        <TlvClock /> in TLV
      </p>
      {/* 222px wide, no tracking: the text box in Figma, so it breaks after "more info" */}
      <p className="mt-4 w-[222px] leading-[15.2px] tracking-normal">{site.cta}</p>
      {/* The switch lives in the header on desktop; phones get it here. */}
      <div className="mt-6 md:hidden">
        <ThemeToggle />
      </div>
    </div>
  );
}
