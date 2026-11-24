import { Header } from "./Header";

// Page frame: header, a sub-bar that sits on the divider line, then a body that
// fills the rest of the viewport on desktop (nothing scrolls vertically there).
export function Shell({
  current,
  sub,
  children,
}: {
  current?: number;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col px-3 md:h-dvh md:px-3 md:pt-3">
      <Header current={current} />
      <div className="mt-8 min-h-[26px] border-b border-line pb-[6px] uppercase md:h-[26px] md:mt-[clamp(28px,6.6vh,80px)]">
        {sub /* fixed height: an empty bar (home) and a bar with text must be identical, or the
           preview and the project page's first image end up 1px apart */}
      </div>
      {/* Figma at 1920x1080: top line y=12, texts y=37, sub-bar line y=195, image y=207 */}
      <main className="mt-3 min-h-0 flex-1 pb-3">{children}</main>
    </div>
  );
}
