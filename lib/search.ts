import "server-only";
import { navEntries, isNavDropdown, isNavDivider } from "./nav";
import { readPublications } from "./content/publications";
import { readCollection } from "./content/collection";
import { newsItemSchema } from "./content/schemas";
import { site } from "./site";

export type SearchSection = "Navigation" | "Dropdown" | "Publications" | "News" | "Socials" | "Theme";
export type ThemeAction = "light" | "dark" | "system";

export type SearchItem = {
  id: string;
  title: string;
  description?: string;
  section: SearchSection;
  href?: string;
  external?: boolean;
  themeAction?: ThemeAction;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function plainTextPreview(markdown: string, maxLength = 90): string {
  const text = markdown
    .replace(/[*_`#>]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

/**
 * Builds the Ctrl K search index at build time: navigation, dropdown
 * children, publications, news, social links and theme actions — the same
 * groups the original's ninja-keys palette lists. Served statically via
 * app/search-index.json/route.ts. New content types register themselves
 * here as they're built.
 */
export async function buildSearchIndex(): Promise<SearchItem[]> {
  const items: SearchItem[] = [];

  for (const entry of navEntries) {
    if (isNavDropdown(entry)) {
      for (const item of entry.items) {
        if (isNavDivider(item)) continue;
        items.push({
          id: `dropdown-${slugify(item.label)}`,
          title: item.label,
          section: "Dropdown",
          href: item.href,
        });
      }
    } else {
      items.push({ id: `nav-${slugify(entry.label)}`, title: entry.label, section: "Navigation", href: entry.href });
    }
  }

  const publications = await readPublications();
  for (const publication of publications) {
    items.push({
      id: `pub-${publication.key}`,
      title: publication.title,
      description: publication.venue,
      section: "Publications",
      href: `/publications/#${publication.key}`,
    });
  }

  const news = await readCollection("news", newsItemSchema);
  for (const item of news) {
    // Matches the original: an item with neither a detail page nor an
    // external link isn't clickable there either (e.g. the bare "lab
    // init" entry), so it's listed without an href rather than skipped.
    const href = item.detailSlug ? `/news/${item.detailSlug}/` : item.link;
    items.push({
      id: `news-${item.slug}`,
      title: item.title ?? plainTextPreview(item.body),
      section: "News",
      href,
    });
  }

  items.push(
    { id: "socials-email", title: "Send email", section: "Socials", href: `mailto:${site.social.email}`, external: true },
    {
      id: "socials-google-scholar",
      title: "Google Scholar",
      section: "Socials",
      href: site.social.googleScholarUrl,
      external: true,
    },
    { id: "socials-github", title: "GitHub", section: "Socials", href: site.social.githubUrl, external: true },
    {
      id: "socials-x",
      title: "X",
      description: "Twitter",
      section: "Socials",
      href: site.social.twitterUrl,
      external: true,
    },
  );

  items.push(
    {
      id: "light-theme",
      title: "Change theme to light",
      description: "Change the theme of the site to Light",
      section: "Theme",
      themeAction: "light",
    },
    {
      id: "dark-theme",
      title: "Change theme to dark",
      description: "Change the theme of the site to Dark",
      section: "Theme",
      themeAction: "dark",
    },
    {
      id: "system-theme",
      title: "Use system default theme",
      description: "Change the theme of the site to System Default",
      section: "Theme",
      themeAction: "system",
    },
  );

  return items;
}
