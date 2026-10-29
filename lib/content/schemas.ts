import "server-only";
import { z } from "zod";

export const newsItemSchema = z.object({
  date: z.string(),
  // A few early items (e.g. a bare "lab init" milestone) have no badge in
  // the original, so this isn't always present.
  category: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  body: z.string(),
});
export type NewsItem = z.infer<typeof newsItemSchema>;

export const personLinksSchema = z.object({
  scholar: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  orcid: z.string().optional(),
  twitter: z.string().optional(),
});

export const personSchema = z.object({
  name: z.string(),
  group: z.string(),
  image: z.string().optional(),
  links: personLinksSchema.optional(),
  order: z.number().optional(),
  body: z.string(),
});
export type Person = z.infer<typeof personSchema>;

export const funderSchema = z.object({
  name: z.string(),
  logo: z.string(),
  url: z.string().optional(),
});
export type Funder = z.infer<typeof funderSchema>;

export const publicationSchema = z.object({
  key: z.string(),
  type: z.string(),
  year: z.number(),
  month: z.string().optional(),
  title: z.string(),
  authors: z.string(),
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
