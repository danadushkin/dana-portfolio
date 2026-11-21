import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <Shell sub={<span>About</span>}>
      <div className="flex h-full flex-col justify-between gap-16 md:cols">
        <div className="md:col-span-2 md:max-w-[440px]">
          <div className="space-y-4 text-[18px] leading-[1.35] md:text-[26px] md:leading-[1.1]">
            {site.about.map((para, i) => <p key={i}>{para}</p>)}
          </div>
        </div>
        <div className="md:col-span-5 md:self-end">
          <ContactBlock id="contact" />
        </div>
      </div>
    </Shell>
  );
}
