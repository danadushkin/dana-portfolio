import { HomeIndex } from "@/components/HomeIndex";
import { ContactBlock } from "@/components/ContactBlock";
import { Shell } from "@/components/Shell";
import { projects } from "@/content/projects";

export default function Home() {
  return (
    <Shell>
      <HomeIndex projects={projects} contact={<ContactBlock />} />
    </Shell>
  );
}
