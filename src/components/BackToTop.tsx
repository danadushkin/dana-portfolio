"use client";

// "Back to top" under the last image (Figma 923:34291). On desktop the image column is
// its own scroller, so we ask it to glide up; on phones the page itself scrolls.
export function BackToTop() {
  const onClick = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      window.dispatchEvent(new Event("column:top"));
    } else {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  };
  return (
    <div className="flex justify-end pb-1 pt-2 uppercase">
      <button type="button" onClick={onClick} className="hover:text-muted">
        Back to top
      </button>
    </div>
  );
}
