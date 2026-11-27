import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { site } from "@/content/site";
import { CursorDot } from "@/components/CursorDot";
import { ScrollReset } from "@/components/ScrollReset";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], weight: ["300", "400"] });

export const metadata: Metadata = {
  title: site.name, // Dana: the browser tab shows just her name, on every page
  description: site.bio,
};

// Runs before first paint: arms the home intro on every full load of "/" (Dana: replay
// it on refresh, phones too since 27/11; skipped for reduced-motion users). The site always opens
// in Light — Dark only lasts while you browse (Dana's call), so no theme is restored;
// the key an older version saved is cleared.
const themeScript = `(function(){var d=document.documentElement;try{localStorage.removeItem('theme')}catch(e){}
try{if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.intro='running'}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geist.variable} antialiased`}>
        {children}
        <ScrollReset />
        <CursorDot />
      </body>
    </html>
  );
}
