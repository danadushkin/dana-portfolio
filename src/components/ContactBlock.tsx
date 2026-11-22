import { site } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";
import { TlvClock } from "./TlvClock";

export function ContactBlock({ id }: { id?: string }) {
  return (
    <div id={id} className="w-full max-w-[240px] text-muted">
      <ul className="space-y-[10px] border-t border-line pt-4">
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
        <li>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-fg">
            {site.phone}
          </a>
        </li>
      </ul>
      <p className="mt-10">
        <TlvClock /> in TLV
      </p>
      <p className="mt-3">{site.cta}</p>
      {/* The switch lives in the header on desktop; phones get it here. */}
      <div className="mt-6 md:hidden">
        <ThemeToggle />
      </div>
    </div>
  );
}
