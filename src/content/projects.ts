// The project index. Order here = order on the site (01, 02, ...).
// Media comes from Figma via scripts/figma-export.mjs; sizes live in media.json.
import media from "./media.json";

/** A paragraph: plain text, or text with inline links. "\n" inside text is a line break. */
export type Paragraph = string | { text: string; href?: string }[];

/** One row of the image column: a single full-width item, or two side by side. */
export type Row = string | [string, string];

export type Project = {
  slug: string;
  title: string;
  year: string;
  description: Paragraph[];
  tags: string[];
  meta: { label: string; value: string | string[] }[];
  rows: Row[]; // the first row's image is the cover
  /** Image path → looping clip that replaces it (the image stays as the poster). */
  videos?: Record<string, string>;
  /** Placeholder rows keep the index at its designed length until real projects exist. */
  placeholder?: boolean;
};

export type Media = { src: string; w: number; h: number; video?: string };

const sizes = media as Record<string, { w: number; h: number }>;

export const mediaItem = (p: Project, src: string): Media => ({
  src,
  ...(sizes[src] ?? { w: 1600, h: 1080 }),
  video: p.videos?.[src],
});

export const coverOf = (p: Project): Media | undefined => {
  const first = p.rows[0];
  return first ? mediaItem(p, Array.isArray(first) ? first[0] : first) : undefined;
};

const img = (slug: string) => (n: number) => `/work/${slug}/${String(n).padStart(2, "0")}.webp`;
const vid = (slug: string) => (n: number) => `/work/${slug}/${String(n).padStart(2, "0")}.mp4`;

const placeholder = (n: number): Project => ({
  slug: `project-${n}`,
  title: "Name of Project",
  year: "",
  description: [],
  tags: [],
  meta: [],
  rows: [],
  placeholder: true,
});

const wix = img("wix-harmony");
const wixV = vid("wix-harmony");
const mon = img("montora-studio-two");

export const projects: Project[] = [
  {
    // Figma: page frame 923:34333, image column x≈6191
    slug: "wix-harmony",
    title: "Wix Harmony",
    year: "2025",
    description: [
      "Wix Harmony is Wix’s core product. I was part of the brand development team, shaping its identity and translating the product’s vision and capabilities into a distinctive visual language, web design, and cohesive marketing assets.",
      [
        {
          text: "The process included designing UI components, product-inspired elements, image making, typography challenges, AI-generated imagery and motion.\nThe project also included web design and layout development for ",
        },
        { text: "Wix.com", href: "https://wix.com" },
        { text: " main homepage and the " },
        { text: "product launch lp", href: "https://www.wix.com/harmony" },
        { text: "." },
      ],
    ],
    tags: ["Brand Development", "Visual Identity", "Design System", "Visual Storytelling"],
    meta: [
      { label: "Year", value: "2025" },
      { label: "Client", value: "Wix" },
      { label: "Role", value: "Visual Designer" },
      { label: "Team", value: "Brand R&D, Wix.com" },
      { label: "Tools", value: ["Figma", "Photoshop", "Midjourney"] },
    ],
    rows: [wix(1), wix(2), [wix(3), wix(4)], wix(5), wix(6), wix(7), [wix(8), wix(9)], wix(10), wix(11)],
    // Sources in /videos (not committed). Re-encode with:
    // ffmpeg -i in.mp4 -an -vf "scale='min(1920,iw)':-2,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart out.mp4
    videos: {
      [wix(2)]: wixV(2), // cover for pp a.mp4
      [wix(4)]: wixV(4), // flower.mp4
      [wix(8)]: wixV(8), // link1.mp4
      [wix(10)]: wixV(10), // lp.mp4
    },
  },
  {
    // Figma: page frame 923:38414, image column x≈8596
    slug: "montora-studio-two",
    title: "Montora - Studio Two",
    year: "2026",
    description: [
      "Montora is a fashion mini-brand created for Wix Studio Two launch video, aimed for professional web creators. The project involved developing a distinctive visual identity and website for a high-end, futuristic travel fashion label, combining a tech-driven aesthetic with a refined visual language.\nThe process involved fast-paced creative development, cross-team collaboration, and adapting to evolving creative needs.",
    ],
    tags: ["Brand Development", "Visual Identity", "Typography", "Layout Design"],
    meta: [
      { label: "Year", value: "2026" },
      { label: "Client", value: "Wix Studio Two" },
      { label: "Role", value: "Brand Designer" },
      { label: "Team", value: "Wix Motion Studio" },
      { label: "Tools", value: ["Figma", "ChatGPT", "Midjourney"] },
    ],
    // 03 and 04 are the "video 1" / "video 2" frames — stills until the clips arrive.
    rows: [mon(1), mon(2), mon(3), mon(4), [mon(5), mon(6)], [mon(7), mon(8)], [mon(9), mon(10)], mon(11)],
  },
  placeholder(3),
  placeholder(4),
  placeholder(5),
  placeholder(6),
  placeholder(7),
];

export const realProjects = projects.filter((p) => !p.placeholder);

export function getProject(slug: string) {
  return realProjects.find((p) => p.slug === slug);
}

export function nextProject(slug: string) {
  const i = realProjects.findIndex((p) => p.slug === slug);
  return realProjects[(i + 1) % realProjects.length];
}

export const indexLabel = (i: number) => `${String(i + 1).padStart(2, "0")}.`;
