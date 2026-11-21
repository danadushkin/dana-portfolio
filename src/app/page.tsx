import { HomeIndex } from "@/components/HomeIndex";
import { ContactBlock } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import { projects, realProjects } from "@/content/projects";

// Intro flips through a mix of every project's images and lands on the first cover.
function introSequence() {
  const pools = realProjects.map((p) => p.media.slice(1));
  const mixed: string[] = [];
  for (let i = 0; mixed.length < 7 && pools.some((pool) => pool[i]); i++) {
    for (const pool of pools) if (pool[i] && mixed.length < 7) mixed.push(pool[i]);
  }
  return [...mixed, realProjects[0].media[0]];
}

export default function Home() {
  return (
    <Shell>
      <HomeIndex projects={projects} introImages={introSequence()} contact={<ContactBlock />} />
    </Shell>
  );
}
