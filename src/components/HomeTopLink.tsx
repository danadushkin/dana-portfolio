"use client";

import Link from "next/link";

/**
 * "Back to index" on phones (About / Contact). Dana: it must land at the TOP of the home
 * page. Some mobile browsers (iOS Safari) restore an earlier scroll position of the home
 * page, so we leave a note that HomeIndex reads on arrival and scrolls to the top.
 */
export const HOME_TOP_KEY = "home:top";

export function HomeTopLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href="/"
      scroll
      className={className}
      onClick={() => {
        try {
          sessionStorage.setItem(HOME_TOP_KEY, "1");
        } catch {}
      }}
    >
      {children}
    </Link>
  );
}
