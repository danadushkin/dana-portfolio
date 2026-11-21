import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], weight: ["300", "400"] });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.role}`, template: `%s — ${site.name}` },
  description: site.bio,
};

// Applies the saved theme before first paint so dark mode doesn't flash white.
const themeScript = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
