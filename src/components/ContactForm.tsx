"use client";

import { useRef, useState } from "react";
import { site } from "@/content/site";

const field =
  "peer w-full border-b border-line bg-transparent pb-[10px] text-[26px] leading-[1.2] tracking-[-0.015em] outline-none transition-colors focus:border-fg";

// Label drawn over the empty field so the asterisk can be grey (as in Figma) — a native
// placeholder can't mix colours. Hidden as soon as the field has content.
function Field({ name, label, as = "input", type = "text", autoComplete }: { name: string; label: string; as?: "input" | "textarea"; type?: string; autoComplete?: string }) {
  return (
    <label className="relative block">
      {as === "textarea" ? (
        // no underline under Message (Dana's note)
        <textarea name={name} required rows={3} placeholder=" " aria-label={label} className={`${field} resize-none border-b-0`} />
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

type State = "idle" | "sending" | "sent" | "error";

const dana = site.contact.find((c) => c.href.startsWith("mailto:"))?.href.replace("mailto:", "") ?? "";

/**
 * Name / Email / Message (Figma 929:100785). Messages go straight to Dana's inbox through
 * Web3Forms (free, no server of our own): the browser posts the form to their API with
 * Dana's access key, and they email it to the address the key was created for. The key is
 * meant to be public — it can only ever deliver to Dana. A hidden "botcheck" field
 * catches simple spam bots. Until a key is set, SEND falls back to the visitor's email app.
 */
export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const form = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = `Portfolio — message from ${name}`;

    if (!site.formKey) {
      const body = `${message}\n\n— ${name}\n${email}`;
      window.location.href = `mailto:${dana}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setState("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: site.formKey,
          subject,
          from_name: "Dana Dushkin — portfolio",
          name,
          email, // Web3Forms sets this as Reply-To, so Dana can just hit reply
          message,
          botcheck: data.get("botcheck") ? true : "",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || res.statusText);
      setState("sent");
      form.current?.reset();
    } catch {
      setState("error");
    }
  };

  return (
    <form ref={form} onSubmit={onSubmit} className="flex w-full flex-col gap-[25px] md:w-[24.3vw] md:min-w-[320px]">
      {/* honeypot: invisible to people, bots tend to fill it in */}
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field name="name" label="Name" autoComplete="name" />
      <Field name="email" label="Email" type="email" autoComplete="email" />
      <Field name="message" label="Message" as="textarea" />
      <div className="flex items-center gap-6 pt-2">
        <button type="submit" disabled={state === "sending"} className="uppercase hover:text-muted disabled:opacity-50">
          {state === "sending" ? "Sending…" : "Send"}
        </button>
        <span role="status" className="text-muted">
          {state === "sent" && "Thank you — your message was sent."}
          {state === "error" && (
            <>
              Something went wrong. Please email{" "}
              <a href={`mailto:${dana}`} className="underline underline-offset-2 hover:text-fg">
                {dana}
              </a>
              .
            </>
          )}
        </span>
      </div>
    </form>
  );
}
