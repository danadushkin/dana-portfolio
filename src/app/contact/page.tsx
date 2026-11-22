import type { Metadata } from "next";
import { ContactBlock } from "@/components/ContactBlock";
import { ContactForm } from "@/components/ContactForm";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "Contact" };

const enter = (i: number) => ({ "--i": i }) as React.CSSProperties;

// Figma frame 929:100785: big Name / Email / Message fields at the left, SEND below,
// contact details pinned bottom-left.
export default function Contact() {
  const sub = (
    <div className="enter flex justify-between" style={enter(0)}>
      <span>Get in touch</span>
      <span>Get in touch</span>
    </div>
  );
  return (
    <Shell sub={sub}>
      <div className="flex h-full flex-col justify-between gap-16 md:pt-[33px]">
        <div className="enter" style={enter(1)}>
          <ContactForm />
        </div>
        <div className="enter" style={enter(2)}>
          <ContactBlock />
        </div>
      </div>
    </Shell>
  );
}
