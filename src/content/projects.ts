// Every portfolio piece lives here. To add a project: add an entry and put its
// images in public/work/<slug>/ (scripts/figma-export.mjs does that from Figma).

export type Project = {
  slug: string;
  title: string;
  client?: string;
  year: string;
  disciplines: string[]; // e.g. ["Branding", "Packaging"]
  summary: string; // one line, shown on the grid
  description: string[]; // paragraphs on the project page
  cover: string; // path under /public, e.g. "/work/acme/cover.png"
  images: string[];
};

export const projects: Project[] = [
  {
    slug: "sample-brand",
    title: "Sample Brand Identity",
    client: "Placeholder Client",
    year: "2026",
    disciplines: ["Branding", "Logo"],
    summary: "Placeholder until the real work is exported from Figma.",
    description: [
      "This is a placeholder project. Replace it with a real one once the Figma frames are exported.",
    ],
    cover: "",
    images: [],
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
