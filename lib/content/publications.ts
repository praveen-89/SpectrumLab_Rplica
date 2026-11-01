import "server-only";
import { publicationSchema, type Publication } from "./schemas";
import { renderMarkdown } from "./markdown";
import { supabasePublic } from "../supabase/public";
import type { PublicationView } from "../publications-view";

/** Reads and validates every publication from Supabase, newest year first — the admin-managed equivalent of the old content/papers.bib. */
export async function readPublications(): Promise<Publication[]> {
  const { data: rows, error } = await supabasePublic
    .from("publications")
    .select("data")
    .order("year", { ascending: false })
    .order("bib_order", { ascending: true });
  if (error) throw new Error(`Failed to read publications from Supabase: ${error.message}`);

  return rows.map((row) => {
    const result = publicationSchema.safeParse(row.data);
    if (!result.success) {
      const [issue] = result.error.issues;
      throw new Error(`Invalid publication data: ${issue.path.join(".")} — ${issue.message}`);
    }
    return result.data;
  });
}

/**
 * Resolves each publication's authors against the coauthor name-variant
 * map (linking lab members, italicizing the director) and renders its
 * abstract to HTML — the per-entry prep shared by the home page's Recent
 * Publications and the full Publications page.
 */
export async function buildPublicationViews(
  publications: Publication[],
  coauthors: Record<string, string>,
  directorHref: string | undefined,
): Promise<PublicationView[]> {
  return Promise.all(
    publications.map(async (publication) => {
      const authors = publication.authors.map((name) => {
        const href = coauthors[name];
        return { name, href, italic: href === directorHref };
      });
      const abstractHtml = publication.abstract ? await renderMarkdown(publication.abstract) : undefined;
      return { publication, authors, abstractHtml };
    }),
  );
}
