import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { site } from "@/content/site";
import { CursorDot } from "@/components/CursorDot";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], weight: ["300", "400"] });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.bio,
};

// Runs before first paint: applies the saved theme (no white flash in dark mode) and
// arms the home intro on every full load of "/" (Dana: replay it on refresh).
// Skipped on phones and for reduced-motion users.
const themeScript = `(function(){var d=document.documentElement;try{if(localStorage.getItem('theme')==='dark')d.dataset.theme='dark'}catch(e){}
try{if(location.pathname==='/'&&innerWidth>=768&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.intro='running'}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geist.variable} antialiased`}>
        {children}
        <CursorDot />
      </body>
    </html>
  );
}
