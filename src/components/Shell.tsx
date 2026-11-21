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
    <div className="flex min-h-dvh flex-col px-3 md:h-dvh md:px-3">
      <Header current={current} />
      <div className="mt-8 min-h-[24px] border-b border-line pb-[6px] uppercase md:mt-[clamp(28px,6.5vh,80px)]">
        {sub}
      </div>
      <main className="mt-[10px] min-h-0 flex-1 pb-3">{children}</main>
    </div>
  );
}
