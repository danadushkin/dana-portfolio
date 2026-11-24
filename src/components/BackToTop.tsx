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
    // Dana's example: ~69px of white between the last image and the label at 1920.
    <div className="flex justify-end pt-[clamp(32px,2.76vw,53px)]">
      {/* uppercase on the button itself — buttons don't inherit text-transform */}
      <button type="button" onClick={onClick} className="uppercase hover:text-muted">
        Back to top
      </button>
    </div>
  );
}
