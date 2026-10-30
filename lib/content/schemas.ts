import "server-only";
import { z } from "zod";

export const talkPersonSchema = z.object({
  name: z.string(),
  // Set when the name matches a lab member in data/coauthors.json.
  href: z.string().optional(),
  affiliation: z.string().optional(),
  // An honorific ("Prof.", "Dr.") kept separate from name: the original
  // never includes it in the link text, only the bare name.
  prefix: z.string().optional(),
});

export const newsItemSchema = z.object({
  date: z.string(),
  // A few early items (e.g. a bare "lab init" milestone) have no badge in
  // the original, so this isn't always present.
  category: z.string().optional(),
  title: z.string().optional(),
  // The original's /news/YYYY/.../ path for this item's own detail page.
  // Named distinctly from readCollection's auto-derived `slug` (our
  // content file's own identifier) — they're different things and the
  // generic `slug` would otherwise silently overwrite this one.
  detailSlug: z.string().optional(),
  // Set when the item's entire content is a single link elsewhere on the
  // site (a talk, a teaching page) rather than a /news/ detail page —
  // NewsList renders it as <a class="news-title">, matching the
  // original's markup, instead of relying on Markdown body content.
  link: z.string().optional(),
  // Shown under a linked item's title (italic, fa-user-tie icon) when the
  // linked talk has exactly one speaker — the original's template omits
  // it for talks with a host/multiple speakers instead (e.g. the SPARC
  // course, the eyecare symposium).
  speaker: talkPersonSchema.optional(),
  // The following only apply to the one item with a detailSlug: the
  // original's "event page" template shows structured date/time/venue and
  // Speakers/Host sections above the free-form body, same shape as a talk.
  time: z.string().optional(),
  venue: z.string().optional(),
  speakers: z.array(talkPersonSchema).default([]),
  host: talkPersonSchema.optional(),
  body: z.string().default(""),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export const personLinksSchema = z.object({
  email: z.string().optional(),
  scholar: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  orcid: z.string().optional(),
  twitter: z.string().optional(),
});

// Matches the slugs used in the People dropdown (data/nav.json) plus
// "lab-director", which isn't one of its own dropdown items.
export const personGroupSchema = z.enum([
  "lab-director",
  "phd-students",
  "mtech-students",
  "mtech-research",
  "phd-graduates",
  "mtech-graduates",
  "mtech-research-graduates",
  "research-associates",
  "project-associates",
  "interns",
  "current-post-docs",
  "past-post-docs",
  "administrator",
]);
export type PersonGroup = z.infer<typeof personGroupSchema>;

// The lab director's "Professional Activities" accordion (react-bootstrap
// Accordion in DirectorProfile.tsx). The original nests a nested-accordion
// of year/category groups inside each top-level section (e.g. "Committees
// & Editorial Boards" contains collapsible "Current Roles", "Editorial
// Service", ... sub-groups) — modelled here as static (non-collapsing)
// grouped lists instead of a second collapse level, per CLAUDE.md's
// allowance for picking "whichever is cleanest" for this content.
export const accordionItemSchema = z.object({
  title: z.string(),
  meta: z.string().optional(),
});
export const accordionGroupSchema = z.object({
  label: z.string().optional(),
  // A Font Awesome icon name (e.g. "star", "pen"), rendered next to the group label.
  icon: z.string().optional(),
  items: z.array(accordionItemSchema),
});
export const accordionSectionSchema = z.object({
  title: z.string(),
  icon: z.string().optional(),
  groups: z.array(accordionGroupSchema),
});
export type AccordionSection = z.infer<typeof accordionSectionSchema>;

export const personSchema = z.object({
  name: z.string(),
  group: personGroupSchema,
  image: z.string().optional(),
  links: personLinksSchema.optional(),
  order: z.number().optional(),
  // Short bio shown on the home page, distinct from the full profile body.
  summary: z.string().optional(),
  // Lab director only.
  awards: z.array(z.string()).default([]),
  accordion: z.array(accordionSectionSchema).default([]),
  body: z.string(),
});
export type Person = z.infer<typeof personSchema>;

export const peopleGroupMetaSchema = z.object({
  group: personGroupSchema,
  title: z.string(),
  description: z.string(),
});
export type PeopleGroupMeta = z.infer<typeof peopleGroupMetaSchema>;

export const funderSchema = z.object({
  name: z.string(),
  logo: z.string(),
  url: z.string().optional(),
});
export type Funder = z.infer<typeof funderSchema>;

export const grantSchema = z.object({
  title: z.string(),
  institution: z.string(),
  role: z.string(),
  startYear: z.number(),
  endYear: z.number().optional(),
  coInvestigators: z.string().optional(),
});
export type Grant = z.infer<typeof grantSchema>;

export const recognitionPersonSchema = z.object({
  name: z.string(),
  href: z.string().optional(),
});
export const recognitionTypeSchema = z.enum(["fellowship", "medal", "invention", "other"]);
export const recognitionItemSchema = z.object({
  type: recognitionTypeSchema,
  // A free-text label: usually a single year, but sometimes a range or a
  // combined "2020, 2021" — and sometimes blank in the original.
  year: z.string().optional(),
  title: z.string(),
  people: z.array(recognitionPersonSchema),
  images: z.array(z.string()).default([]),
});
export type RecognitionItem = z.infer<typeof recognitionItemSchema>;

export const teachingMaterialSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
});
export const teachingSectionSchema = z.object({
  label: z.string(),
  // One of lecture/assignment/resource — picks the action-link style and
  // icon (matches the original's material-card--<type> variants).
  type: z.enum(["lecture", "assignment", "resource"]),
  items: z.array(teachingMaterialSchema),
});
export const teachingScheduleItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  url: z.string().optional(),
});
export const courseSchema = z.object({
  title: z.string(),
  // Shown only on the /teaching/ list card's title ("E9 213 Time-Frequency
  // Analysis"); the course's own detail-page <h1> uses `title` alone
  // ("Time-Frequency Analysis"), matching the original's split rendering.
  code: z.string().optional(),
  // "regular" / "short" group the list page's two sections; a module of a
  // short-course series (e.g. "Module I: Dimension Reduction") also uses
  // "short" so it's reachable, but is only linked from its series page,
  // not listed a second time on /teaching/.
  section: z.enum(["regular", "short", "module"]),
  term: z.string().optional(),
  description: z.string().optional(),
  instructor: talkPersonSchema.optional(),
  tas: z.string().optional(),
  host: z.string().optional(),
  schedule: z.array(teachingScheduleItemSchema).default([]),
  sections: z.array(teachingSectionSchema).default([]),
  // Markdown; used for the one module with an "Announcements" table,
  // folded into the body instead of modelling that table structurally.
  body: z.string().default(""),
});
export type Course = z.infer<typeof courseSchema>;

export const opportunityPositionSchema = z.object({
  icon: z.string(),
  title: z.string(),
  // Markdown (a short sequence of "**Label:** text" paragraphs).
  body: z.string(),
});
export const opportunitiesPageSchema = z.object({
  requiredSkills: z.array(z.string()).default([]),
  // Markdown.
  applicationProcess: z.string(),
  positions: z.array(opportunityPositionSchema).default([]),
  // Markdown; the "Join Our Research Team" lead paragraph.
  body: z.string(),
});
export type OpportunitiesPage = z.infer<typeof opportunitiesPageSchema>;

export const contactPageSchema = z.object({
  mapEmbedUrl: z.string(),
  administrator: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }),
  address: z.array(z.string()),
  // Markdown; everything else (Campus Location intro, Potential
  // Collaborators note).
  body: z.string(),
});
export type ContactPage = z.infer<typeof contactPageSchema>;

export const homePageSchema = z.object({
  iiscLogoLight: z.string(),
  iiscLogoDark: z.string(),
  iiscLogoUrl: z.string(),
  eeLogo: z.string(),
  eeLogoUrl: z.string(),
  groupPhoto: z.string(),
  groupPhotoCaption: z.string(),
  body: z.string(),
});
export type HomePage = z.infer<typeof homePageSchema>;

export const talkLinksSchema = z.object({
  slides: z.string().optional(),
  video: z.string().optional(),
  // Also doubles as the "Register" button's href on the one entry that has
  // one — the original's template always labels it "Register", so there's
  // no separate field for the button text.
  url: z.string().optional(),
});

export const talkItemSchema = z.object({
  title: z.string(),
  date: z.string(),
  time: z.string().optional(),
  // The badge label (e.g. "Talk", "SPARC Course", "PhD Thesis Defense").
  // A few early entries have none, and the original renders no badge at
  // all for those rather than falling back to a default label.
  type: z.string().optional(),
  venue: z.string().optional(),
  venueUrl: z.string().optional(),
  // Plural ("Speakers") vs singular ("Speaker") is derived from the list's
  // length; this only overrides the label text itself (e.g. "Instructors"
  // for the one SPARC course entry).
  speakersLabel: z.string().optional(),
  speakers: z.array(talkPersonSchema).default([]),
  host: talkPersonSchema.optional(),
  keywords: z.array(z.string()).default([]),
  abstractLabel: z.string().optional(),
  links: talkLinksSchema.default({}),
  // Markdown; the original's "Abstract" (or, for the one SPARC entry,
  // "Course Description"/"Course Goals"/trailing freeform paragraph,
  // folded together here — see CLAUDE.md's fidelity-vs-bugs rule and the
  // Step Report's "Deviations from original").
  body: z.string().default(""),
});
export type TalkItem = z.infer<typeof talkItemSchema>;

export const publicationSchema = z.object({
  key: z.string(),
  type: z.string(),
  year: z.number(),
  month: z.string().optional(),
  title: z.string(),
  authors: z.array(z.string()),
  venue: z.string().optional(),
  abbr: z.string().optional(),
  abstract: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  code: z.string().optional(),
  articlePage: z.string().optional(),
  pdf: z.string().optional(),
  bibtex: z.string(),
});
export type Publication = z.infer<typeof publicationSchema>;

export const articleAuthorSchema = z.object({
  name: z.string(),
  href: z.string().optional(),
});
export const articleSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string().optional(),
  updatedDate: z.string().optional(),
  authors: z.array(articleAuthorSchema).default([]),
  // Markdown, including $…$/$$…$$ KaTeX and "{% youtube VIDEO_ID %}" shortcodes.
  body: z.string(),
});
export type Article = z.infer<typeof articleSchema>;

export const galleryPhotoSchema = z.object({
  src: z.string(),
  caption: z.string().optional(),
});
export const galleryEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  photos: z.array(galleryPhotoSchema),
});
export type GalleryEvent = z.infer<typeof galleryEventSchema>;

export const galleryVideoSchema = z.object({
  youtubeId: z.string(),
  title: z.string(),
  date: z.string().optional(),
  speaker: talkPersonSchema.optional(),
  caption: z.string().optional(),
});
export type GalleryVideo = z.infer<typeof galleryVideoSchema>;
