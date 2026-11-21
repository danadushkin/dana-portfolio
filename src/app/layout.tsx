import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.tagline,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} antialiased`}>
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {site.name}
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="hover:opacity-60">Work</Link>
            <Link href="/about" className="hover:opacity-60">About</Link>
            <a href={`mailto:${site.email}`} className="hover:opacity-60">Contact</a>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-8">{children}</main>
        <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-10 text-sm opacity-70 sm:px-8">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span className="flex gap-4">
            {site.links.map((l) => (
              <a key={l.label} href={l.href} className="hover:opacity-60">{l.label}</a>
            ))}
          </span>
        </footer>
      </body>
    </html>
  );
}
