// The project index. Order here = order on the site (01, 02, ...).
// Media comes from Figma via scripts/figma-export.mjs; sizes live in media.json.
import media from "./media.json";

export type Paragraph = string | { text: string; href: string }[];

export type Project = {
  slug: string;
  title: string;
  year: string;
  summary: string;
  tags: string[];
  meta: { label: string; value: string | string[] }[];
  sections: { heading: string; body: Paragraph[] }[];
  media: string[]; // first item is the cover
  /** Image path → looping clip that replaces it (the image stays as the poster). */
  videos?: Record<string, string>;
  /** Placeholder rows keep the index at its designed length until real projects exist. */
  placeholder?: boolean;
};

export type Media = { src: string; w: number; h: number; video?: string };

const sizes = media as Record<string, { w: number; h: number }>;

export function mediaOf(p: Project): Media[] {
  return p.media.map((src) => ({ src, ...(sizes[src] ?? { w: 1600, h: 1080 }), video: p.videos?.[src] }));
}

const workImages = (slug: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/work/${slug}/${String(i + 1).padStart(2, "0")}.webp`);

const placeholder = (n: number): Project => ({
  slug: `project-${n}`,
  title: "Name of Project",
  year: "",
  summary: "",
  tags: [],
  meta: [],
  sections: [],
  media: [],
  placeholder: true,
});

export const projects: Project[] = [
  {
    slug: "wix-harmony",
    title: "Wix Harmony",
    year: "2026",
    summary:
      "Wix Harmony is Wix’s core product. I was part of the brand development team, shaping its identity and translating the product’s vision and capabilities into a distinctive visual language and cohesive marketing assets, reflecting its core values: Personal, Seamless, AI-forward and Advanced.",
    tags: ["Brand Development", "Visual Identity", "Design System", "Visual Storytelling"],
    meta: [
      { label: "Year", value: "2026" },
      { label: "Client", value: "Wix" },
      { label: "Role", value: "Brand Designer" },
      { label: "Team", value: "Brand R&D, Wix.com" },
      { label: "Tools", value: ["Figma", "Weavy", "Midjourney"] },
    ],
    sections: [
      {
        heading: "Design Process",
        body: [
          "The process involved defining the visual language, exploring the product, and translating its complexity into a clear and engaging marketing language. I worked across different aspects of the visual identity, turning product insights into a cohesive and expressive brand experience.",
          "This included designing UI components and product-inspired elements, developing a photography direction, creating custom imagery using AI tools, incorporating motion design, and building showcase websites that brought the brand values to life.",
          [
            { text: "The project also included web design, layout development and typography for ", href: "" },
            { text: "Wix.com", href: "https://wix.com" },
            { text: " main homepage and the ", href: "" },
            { text: "product launch lp", href: "https://www.wix.com/harmony" },
            { text: ".", href: "" },
          ],
        ],
      },
    ],
    media: workImages("wix-harmony", 11),
    // Sources in /videos (not committed). Re-encode with:
    // ffmpeg -i in.mp4 -an -vf "scale='min(1920,iw)':-2,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart out.mp4
    videos: {
      "/work/wix-harmony/02.webp": "/work/wix-harmony/02.mp4", // cover for pp a.mp4
      "/work/wix-harmony/06.webp": "/work/wix-harmony/06.mp4", // flower.mp4
      "/work/wix-harmony/08.webp": "/work/wix-harmony/08.mp4", // lp.mp4
      "/work/wix-harmony/09.webp": "/work/wix-harmony/09.mp4", // link1.mp4
    },
  },
  {
    slug: "montora-studio-two",
    title: "Montora - Studio Two",
    year: "2026",
    // Copy from Figma frame 921:22657 (summary 921:22658, process text 922:28617).
    summary:
      "Montora is a fashion mini-brand created for the Studio Two launch video, for professional web creators. The brief was to develop a distinctive brand identity and website for a high-end travel fashion label, combining a tech-driven, cool, and futuristic aesthetic.",
    tags: ["Brand Development", "Visual Identity", "Typography", "Layout Design"],
    meta: [
      { label: "Year", value: "2026" },
      { label: "Client", value: "Wix Studio Two" },
      { label: "Role", value: "Brand Designer" },
      { label: "Team", value: "Wix Motion Studio" },
      { label: "Tools", value: ["Figma", "ChatGPT", "Midjourney"] },
    ],
    sections: [
      {
        heading: "Design Process",
        body: [
          "The project included web design, layout development, and typography, alongside close collaboration with designers and animators from the Wix Motion Studio team.",
          "I developed Montora’s visual identity and website, translating the brief into a cohesive brand experience.",
        ],
      },
    ],
    media: workImages("montora-studio-two", 6),
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
