"use client";

import { useState } from "react";
import { site } from "@/content/site";

const field =
  "peer w-full border-b border-line bg-transparent pb-[10px] text-[26px] leading-[1.2] tracking-[-0.015em] outline-none transition-colors focus:border-fg";

// Label drawn over the empty field so the asterisk can be grey (as in Figma) — a native
// placeholder can't mix colours. Hidden as soon as the field has content.
function Field({ name, label, as = "input", type = "text", autoComplete }: { name: string; label: string; as?: "input" | "textarea"; type?: string; autoComplete?: string }) {
  return (
    <label className="relative block">
      {as === "textarea" ? (
        <textarea name={name} required rows={3} placeholder=" " aria-label={label} className={`${field} resize-none`} />
      ) : (
        <input name={name} type={type} required autoComplete={autoComplete} placeholder=" " aria-label={label} className={field} />
      )}
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 text-[26px] leading-[1.2] tracking-[-0.015em] peer-[:not(:placeholder-shown)]:hidden">
        {label}
        <span className="text-faint">*</span>
      </span>
    </label>
  );
}

// Name / Email / Message, as in Figma 929:100785. There is no mail server behind the site
// yet, so SEND opens the visitor's email app with the message filled in, addressed to Dana.
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const to = site.contact.find((c) => c.href.startsWith("mailto:"))?.href.replace("mailto:", "") ?? "";

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = `Portfolio — message from ${name}`;
    const body = `${message}\n\n— ${name}\n${email}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-[25px] md:w-[24.6vw] md:min-w-[320px]">
      <Field name="name" label="Name" autoComplete="name" />
      <Field name="email" label="Email" type="email" autoComplete="email" />
      <Field name="message" label="Message" as="textarea" />
      <div className="flex items-center gap-6 pt-2">
        <button type="submit" className="uppercase hover:text-muted">
          Send
        </button>
        {sent && <span className="text-muted">Your email app should open with the message ready to send.</span>}
      </div>
    </form>
  );
}
