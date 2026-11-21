import { site } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";

export function ContactBlock({ id }: { id?: string }) {
  return (
    <div id={id} className="w-full max-w-[220px] border-t border-line pt-4 text-muted">
      <ul className="space-y-[6px]">
        {site.contact.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="hover:text-fg"
            >
              {c.label} <span aria-hidden>↗</span>
            </a>
          </li>
        ))}
        <li>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-fg">
            {site.phone}
          </a>
        </li>
      </ul>
      <ThemeToggle />
    </div>
  );
}
