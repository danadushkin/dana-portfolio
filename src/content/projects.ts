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
  /** Letter-spacing (px at 13px) of the description in Figma when it isn't the usual -0.2. */
  tracking?: number;
  /** Shorter name for the index, the sub-bar and "Next" (Figma), when the page title is longer. */
  short?: string;
  /** Placeholder rows keep the index at its designed length until real projects exist. */
  placeholder?: boolean;
  /**
   * A looping clip shown instead of the cover on the home page only (Dana 27/11: Scrolling, Harmony).
   * On the project page it keeps playing from where the home preview was, then cross-fades
   * into the first row's own clip at `handoff` seconds (the moment that looks the same), or —
   * without `handoff` — plays to its end and fades to the first still.
   */
  homeCover?: { src: string; poster: string; handoff?: number };
};

export type Media = { src: string; w: number; h: number; video?: string; poster?: string; sound?: boolean };

const sizes = media as Record<string, { w: number; h: number }>;

/** A clip replacing an image; w/h = the clip's own size when its frame should follow it. */
export type VideoSpec = { src: string; poster?: string; w?: number; h?: number; /** has audio: hover offers "enlarge + sound" */ sound?: boolean };

const videoOf = (v: string | VideoSpec | undefined) => {
  if (!v) return {};
  if (typeof v === "string") return { video: asset(v) };
  return { video: asset(v.src), ...(v.poster && { poster: asset(v.poster) }), ...(v.w && v.h && { w: v.w, h: v.h }), ...(v.sound && { sound: true }) };
};

// Content refers to canonical paths ("/work/x/10.jpg"); what gets published is the
// content-hashed file, so a changed picture always gets a fresh URL (see assets.ts).
export const mediaItem = (p: Project, src: string): Media => ({
  src: asset(src),
  ...(sizes[src] ?? { w: 1600, h: 1080 }),
  ...videoOf(p.videos?.[src]), // may override w/h with the clip's own proportions
});

/** Grid columns for a pair: each image's share of the width, so both end up equally tall. */
export const pairColumns = (ms: Media[]) => ms.map((m) => `${(m.w / m.h).toFixed(4)}fr`).join(" ");

/** The whole first row (one item, or a pair) — what the home preview shows. */
export const firstRowOf = (p: Project): Media[] => {
  const first = p.rows[0];
  return first ? (Array.isArray(first) ? first : [first]).map((src) => mediaItem(p, src)) : [];
};

export type HomeCover = { video: string; poster: string; handoff?: number };

export const homeCoverOf = (p: Project): HomeCover | undefined =>
  p.homeCover && { video: asset(p.homeCover.src), poster: asset(p.homeCover.poster), handoff: p.homeCover.handoff };

export const coverOf = (p: Project): Media | undefined => {
  const first = p.rows[0];
  return first ? mediaItem(p, Array.isArray(first) ? first[0] : first) : undefined;
};

const img = (slug: string) => (n: number) => `/work/${slug}/${String(n).padStart(2, "0")}.jpg`;
const vid = (slug: string) => (n: number) => `/work/${slug}/${String(n).padStart(2, "0")}.mp4`;

const wix = img("wix-harmony");
const wixV = vid("wix-harmony");
const mon = img("montora-studio-two");
const monV = vid("montora-studio-two");
const sw = img("showcase-websites");
const swV = vid("showcase-websites");
const sitf = img("scrolling-into-the-future");
const sitfV = vid("scrolling-into-the-future");
const mu = img("wix-meetups");
const hub = img("mkt-design-hub");
const dtn = img("dtn-conference");

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
    // 03 = Dana's "new image - updated" (941:162559), 04 = "kleo" (941:160311), 05/06 = the
    // pair (moved down, Dana 27/11), 07 = newimageforharmony (978:19441), 12 = rm_heros_layout5
    rows: [wix(1), wix(2), wix(3), wix(4), [wix(5), wix(6)], wix(7), wix(8), [wix(9), wix(10)], wix(11), wix(12), wix(13)],
    // Sources in /videos (not committed). Re-encode with:
    // ffmpeg -i in.mp4 -an -vf "scale='min(1920,iw)':-2,fps=30" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart out.mp4
    videos: {
      // 02 / 10: the poster is the clip's own first frame — the Figma still is framed
      // differently, which showed as a jump when playback started (Dana 26/11, orange clip).
      [wix(2)]: { src: wixV(2), poster: "/work/wix-harmony/02.poster.jpg" }, // cover for pp a.mp4
      [wix(6)]: wixV(6), // flower.mp4
      [wix(9)]: wixV(9), // link1.mp4
      [wix(11)]: { src: wixV(11), poster: "/work/wix-harmony/11.poster.jpg" }, // lp.mp4
    },
    // videos/Harmony_cover.mp4 (Dana 27/11): the home cover; the intro ends on its first frame
    // (opening frame 11). Its last frame is the 01 still, which the project page fades to.
    homeCover: { src: wixV(0), poster: "/work/wix-harmony/00.poster.jpg" },
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
    textWidth: 440,
    tagsWidth: 440,
    tracking: -0.218,
    meta: [
      { label: "Year", value: "2026" },
      { label: "Client", value: "Wix Studio Two" },
      { label: "Role", value: "Brand Designer" },
      { label: "Team", value: "Wix Motion Studio" },
      { label: "Tools", value: ["Figma", "ChatGPT", "Midjourney"] },
    ],
    rows: [mon(1), mon(2), mon(3), mon(4), [mon(5), mon(6)], [mon(7), mon(8)], mon(9), [mon(10), mon(11)]],
    // "video 1" / "video 2" frames ← videos/montora_1.mp4, montora_2.mp4 (with audio, AAC 128k).
    // Their first frame differs from the Figma still, so the poster is the clip's own first frame.
    // Dana: full width, height to match the clip (16:9) so nothing is cropped top/bottom.
    videos: {
      // Dana 25/11: play silently in the column; on hover, enlarge with sound.
      [mon(3)]: { src: monV(3), poster: "/work/montora-studio-two/03.poster.jpg", w: 1280, h: 720, sound: true },
      [mon(4)]: { src: monV(4), poster: "/work/montora-studio-two/04.poster.jpg", w: 1280, h: 720, sound: true },
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
    // videos/80s_cover.mp4 = the site's landing view; it looks like 01.mp4 at 2.4s
    homeCover: { src: sitfV(0), poster: "/work/scrolling-into-the-future/00.poster.jpg", handoff: 2.4 },
  },
  {
    // Figma: page frame 942:163698 ("project 05"), image column x≈15993
    slug: "wix-meetups",
    title: "Wix Meetups",
    year: "2019",
    description: [
      "I had full ownership of Wix Meetups design, developing a dedicated visual identity and creating a cohesive visual experience across print materials, presentations, interior design, spatial design, and all branded assets.",
      "My role also included overseeing production, logistics, coordination, and on-site execution of all events worldwide.",
    ],
    tags: ["Event Branding", "Print Production", "Brand Experiences"],
    meta: [
      { label: "Year", value: "2019" },
      { label: "Client", value: "Wix" },
      { label: "Role", value: "Lead Designer" },
      { label: "Team", value: "Design Dev" },
      { label: "Tools", value: ["Illustrator", "Photoshop"] },
    ],
    textWidth: 353,
    tagsWidth: 410,
    tracking: -0.211,
    // 07+08, 10+11, 12+13 are uneven pairs (412 + 834 in Figma): widths follow the images.
    rows: [[mu(1), mu(2)], mu(3), [mu(4), mu(5)], mu(6), [mu(7), mu(8)], mu(9), [mu(10), mu(11)], [mu(12), mu(13)]],
  },
  {
    // Figma: page frame 951:167818, image column x≈20438 — Dana's 7th project, placed 5th
    slug: "mkt-design-hub",
    title: "MKT Design Hub",
    year: "2025",
    description: [
      "Design Hub is a marketing resource library that brings together essential creative assets, tools, and inspiration in one place.",
      "I led the project from the research phase, identifying user needs and exploring ways to improve content discovery and accessibility. This involved extensive UX work, information architecture, and UI design, creating an intuitive and cohesive experience for marketing teams.",
    ],
    tags: ["UX", "UI", "Product Design", "Design Systems"],
    meta: [
      { label: "Year", value: "2025" },
      { label: "Client", value: "Wix Marketing" },
      { label: "Role", value: "Lead Designer" },
      { label: "Team", value: "Core" },
      { label: "Tools", value: ["Figma", "ChatGPT"] },
    ],
    textWidth: 397,
    tagsWidth: 410,
    tracking: -0.211,
    rows: [1, 2, 3, 4, 5].map(hub),
    // 03 ← videos/design hub.mp4 (Dana 26/11), matched to the still by its first frame
    videos: { [hub(3)]: { src: vid("mkt-design-hub")(3), poster: "/work/mkt-design-hub/03.poster.jpg" } },
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
    rows: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(sw), // Dana 26/11 20:00: three new, one removed
    // Sources: videos/demo1-3.mov (ProRes) — matched to their frames by comparing first frames.
    videos: { [sw(2)]: swV(2), [sw(4)]: swV(4), [sw(7)]: swV(7) },
  },
  {
    // Figma: page frame 939:157235 ("project 06"), image column x≈18210
    slug: "dtn-conference",
    title: "DTN TLV conference",
    short: "DTN conference",
    year: "2018",
    description: [
      "Design Tools Net TLV was an industry event where I led the visual design across digital and physical touchpoints. This included designing the event website, developing visual assets, print materials and branded merchandise, and overseeing print production and on-site execution.",
    ],
    tags: ["Event Branding", "Print Production", "Brand Experiences"],
    meta: [
      { label: "Year", value: "2018" },
      { label: "Client", value: "DTN" },
      { label: "Role", value: "Lead Designer" },
      { label: "Team", value: "Design Dev" },
      { label: "Tools", value: ["Illustrator", "Photoshop"] },
    ],
    textWidth: 410,
    tagsWidth: 410,
    tracking: -0.211,
    // Dana 26/11: the first row is now the pair (lanyard + t-shirt)
    rows: [[dtn(1), dtn(2)], dtn(3), [dtn(4), dtn(5)], [dtn(6), dtn(7)], dtn(8), [dtn(9), dtn(10)], [dtn(11), dtn(12)]],
  },
];

export const realProjects = projects.filter((p) => !p.placeholder);

export function getProject(slug: string) {
  return realProjects.find((p) => p.slug === slug);
}

export function nextProject(slug: string) {
  const i = realProjects.findIndex((p) => p.slug === slug);
  return realProjects[(i + 1) % realProjects.length];
}

/** The name used in the index, the sub-bar and "Next". */
export const shortTitle = (p: Project) => p.short ?? p.title;

export const indexLabel = (i: number) => `${String(i + 1).padStart(2, "0")}.`;
