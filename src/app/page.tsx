import { HomeIndex } from "@/components/HomeIndex";
import { ContactBlock } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import media from "@/content/media.json";
import { projects, realProjects } from "@/content/projects";

// Intro = Dana's "opening frames" (public/intro, from scripts/figma-opening.mjs),
// then the first project's cover, which is what the window grows into.
function introSequence() {
  const opening = Object.keys(media).filter((k) => k.startsWith("/intro/")).sort();
  return [...opening, realProjects[0].media[0]];
}

export default function Home() {
  return (
    <Shell>
      <HomeIndex projects={projects} introImages={introSequence()} contact={<ContactBlock />} />
    </Shell>
  );
}
