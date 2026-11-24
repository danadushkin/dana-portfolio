// The project index. Order here = order on the site (01, 02, ...).
// Media comes from Figma via scripts/figma-export.mjs; sizes live in media.json.
import media from "./media.json";
import { asset } from "./assets";

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
  videos?: Record<string, string | VideoSpec>;
  /**
   * Widths (px) of the description / tags text boxes in Dana's Figma frame. With the same
   * font and size, a fixed box width makes lines break exactly as in the design on any
   * screen (Dana's note). Defaults: 402 / 410.
   */
  textWidth?: number;
  tagsWidth?: number;
  /** Placeholder rows keep the index at its designed length until real projects exist. */
  placeholder?: boolean;
};

export type Media = { src: string; w: number; h: number; video?: string; poster?: string };

const sizes = media as Record<string, { w: number; h: number }>;

/** A clip replacing an image; w/h = the clip's own size when its frame should follow it. */
export type VideoSpec = { src: string; poster?: string; w?: number; h?: number };

const videoOf = (v: string | VideoSpec | undefined) => {
  if (!v) return {};
  if (typeof v === "string") return { video: asset(v) };
  return { video: asset(v.src), ...(v.poster && { poster: asset(v.poster) }), ...(v.w && v.h && { w: v.w, h: v.h }) };
};

// Content refers to canonical paths ("/work/x/10.jpg"); what gets published is the
// content-hashed file, so a changed picture always gets a fresh URL (see assets.ts).
export const mediaItem = (p: Project, src: string): Media => ({
  src: asset(src),
  ...(sizes[src] ?? { w: 1600, h: 1080 }),
  ...videoOf(p.videos?.[src]), // may override w/h with the clip's own proportions
});

/** The whole first row (one item, or a pair) — what the home preview shows. */
export const firstRowOf = (p: Project): Media[] => {
  const first = p.rows[0];
  return first ? (Array.isArray(first) ? first : [first]).map((src) => mediaItem(p, src)) : [];
};

export const coverOf = (p: Project): Media | undefined => {
  const first = p.rows[0];
  return first ? mediaItem(p, Array.isArray(first) ? first[0] : first) : undefined;
};

const img = (slug: string) => (n: number) => `/work/${slug}/${String(n).padStart(2, "0")}.jpg`;
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
const monV = vid("montora-studio-two");
const sw = img("showcase-websites");
const swV = vid("showcase-websites");
const sitf = img("scrolling-into-the-future");
const sitfV = vid("scrolling-into-the-future");
const we = img("wix-events");

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
    textWidth: 439,
    tagsWidth: 439,
    // 05 = Dana's "new image" (936:150900), which replaced the Kleo and poppy images.
    rows: [wix(1), wix(2), [wix(3), wix(4)], wix(5), wix(6), [wix(7), wix(8)], wix(9), wix(10)],
    // Sources in /videos (not committed). Re-encode with:
    // ffmpeg -i in.mp4 -an -vf "scale='min(1920,iw)':-2,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart out.mp4
    videos: {
      [wix(2)]: wixV(2), // cover for pp a.mp4
      [wix(4)]: wixV(4), // flower.mp4
      [wix(7)]: wixV(7), // link1.mp4
      [wix(9)]: wixV(9), // lp.mp4
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
    rows: [mon(1), mon(2), mon(3), mon(4), [mon(5), mon(6)], [mon(7), mon(8)], mon(9), [mon(10), mon(11)]],
    // "video 1" / "video 2" frames ← videos/montora_1.mp4, montora_2.mp4 (audio stripped).
    // Their first frame differs from the Figma still, so the poster is the clip's own first frame.
    // Dana: full width, height to match the clip (16:9) so nothing is cropped top/bottom.
    videos: {
      [mon(3)]: { src: monV(3), poster: "/work/montora-studio-two/03.poster.jpg", w: 1280, h: 720 },
      [mon(4)]: { src: monV(4), poster: "/work/montora-studio-two/04.poster.jpg", w: 1280, h: 720 },
    },
  },
  {
    // Figma: page frame 929:101108 ("project 03"), image column x≈11075
    slug: "scrolling-into-the-future",
    title: "Scrolling into the Future",
    year: "2024",
    description: [
      [
        { text: "‘Scrolling into the Future with 80s Vibes’", href: "https://www.wix.com/studio/design/inspiration/80s" },
        {
          text: " is a conceptual website demonstrating the scrolling capabilities of the new Wix Studio editor. Inspired by the technological breakthroughs of the 1980s, it presents key innovations through a playful, retro-inspired visual language.",
        },
      ],
      "I developed the creative vision through in-depth conceptual and visual research, leading the project from content and design to animations and build. The website was featured at Wix conferences and webinars, entered web design competitions, and received a Muzli Honor Award.",
    ],
    tags: ["Web Design", "Concept Development", "Visual Research", "Storytelling"],
    meta: [
      { label: "Year", value: "2024" },
      { label: "Client", value: "Wix Studio" },
      { label: "Role", value: "Creative & Design" },
      { label: "Team", value: "Wix Studio" },
      { label: "Tools", value: ["Figma", "Photoshop", "Illustrator", "Midjourney"] },
    ],
    // 06 is the narrow "→ '80s VIBES →" strip (group 937:153757).
    rows: [sitf(1), sitf(2), sitf(3), [sitf(4), sitf(5)], sitf(6)],
    // Sources: videos/80s web, phone, tetris, text marquee-.mp4 (matched by first frame).
    videos: { [sitf(1)]: sitfV(1), [sitf(4)]: sitfV(4), [sitf(5)]: sitfV(5), [sitf(6)]: sitfV(6) },
  },
  {
    // Figma: page frame 925:83305 ("project 04"), image column x≈13556
    slug: "showcase-websites",
    title: "Showcase Websites",
    year: "2025-2026",
    description: [
      "A collection of showcase websites created for Wix. Each website features a distinct mini-brand with its own visual identity, custom logo, unique typography and website design. All imagery was created using various AI tools, exploring diverse visual styles and creative directions.",
    ],
    tags: ["Visual Identity", "Web Design", "AI Image Making"],
    meta: [
      { label: "Year", value: "2025-26" },
      { label: "Client", value: "Wix" },
      { label: "Role", value: "Brand Designer" },
      { label: "Team", value: "Brand R&D" },
      { label: "Tools", value: ["Figma", "Illustrator", "Midjourney", "Weavy"] },
    ],
    rows: [1, 2, 3, 4, 5, 6, 7].map(sw),
    // Sources: videos/demo1-3.mov (ProRes) — matched to their frames by comparing first frames.
    videos: { [sw(2)]: swV(2), [sw(4)]: swV(4), [sw(7)]: swV(7) },
  },
  {
    // Figma: page frame 939:157235 ("project 05"), image column x≈16107
    slug: "wix-events",
    title: "Wix Conference & Events",
    year: "2018-2019",
    description: [
      "I worked on a variety of physical brand experiences at Wix, including conferences, company events, print materials, and branded merchandise.",
      "I also had full ownership of Wix Meetups. This included developing a dedicated visual identity, designing presentations and print materials, and overseeing production and execution worldwide.",
    ],
    tags: ["Event Branding", "Print Production", "Brand Experiences"],
    meta: [
      { label: "Year", value: "2018-2019" },
      { label: "Client", value: "Wix Internal" },
      { label: "Role", value: "Visual Designer" },
      { label: "Team", value: "Design Dev" },
      { label: "Tools", value: ["Illustrator", "Photoshop"] },
    ],
    textWidth: 410,
    tagsWidth: 410,
    // The first row is a pair (tote + menu), so the home preview shows the pair too.
    rows: [[we(1), we(2)], we(3), [we(4), we(5)], we(6), [we(7), we(8)]],
  },
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
