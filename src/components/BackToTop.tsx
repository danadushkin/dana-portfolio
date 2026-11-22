"use client";

// "BACK TO TOP" under the last image, right-aligned, in caps (Figma 923:34291).
// On desktop the image column is its own scroller, so we ask it to glide up;
// on phones the page itself scrolls.
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
    <div className="flex justify-end pb-2 pt-1">
      {/* uppercase on the button itself — buttons don't inherit text-transform */}
      <button type="button" onClick={onClick} className="uppercase hover:text-muted">
        Back to top
      </button>
    </div>
  );
}
