"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/content/site";
import { ContactLinks } from "./ContactBlock";
import { ThemeToggle } from "./ThemeToggle";

// Phones (Figma "mobile open menu", 969:14341): MENU opens a full screen with the same
// header, the bio, 01 INDEX / 02 ABOUT / 03 CONTACT, and the contact links with the
// Light switch at the bottom, closed off by a line.
const items = [
  { label: "Index", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="uppercase" aria-expanded={open}>
        Menu
      </button>
      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg px-[14px] pb-[18px] pt-[18px] md:hidden">
            <div className="flex items-start justify-between border-t border-line pt-4">
              <Link href="/" onClick={close} className="mobile-name uppercase">
                {site.name}
                <span className="block text-muted">{site.role}</span>
              </Link>
              <div className="flex gap-[26px] uppercase">
                <Link href="/" onClick={close}>Index</Link>
                <button type="button" onClick={close} className="uppercase">
                  Menu
                </button>
              </div>
            </div>
            <p className="mt-[39px] w-[214px] leading-[15.2px] text-muted">{site.bio}</p>
            <ol className="mt-[65px] uppercase">
              {items.map((it, i) => (
                <li key={it.href}>
                  <Link href={it.href} onClick={close} className="index-row flex justify-between border-b border-line">
                    <span>{String(i + 1).padStart(2, "0")}.</span>
                    <span>{it.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="mt-auto flex items-end justify-between border-b border-line pb-[37px] pt-16 text-muted">
              <ContactLinks />
              <ThemeToggle className="uppercase" />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
